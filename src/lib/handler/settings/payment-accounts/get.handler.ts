// api/payment-accounts/v1/route.ts
import { NextRequest } from "next/server";
import { PAYMENT_OWNER_TYPE, CardBrand } from "@/constants/payment/payment.const";
import {
    Paginated,
    PaymentAccount,
    SafeCardInfo,
} from "@/types/settings/stripe-payment-account.type";
import ConnectDB from "@/config/db";
import paymentAccountModel from "@/models/payments/payment-account.model";
import { withTransaction } from "@/lib/helpers/withTransaction";
import GuideModel from "@/models/guide/guide.model";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { ApiError, HandlerResult } from "@/lib/helpers/withErrorHandler";
import { USER_ROLE } from "@/constants/current-user/user.const";
import { validateUser } from "@/lib/auth/verify-user-role";

type MongoId = { toString(): string };

type LeanDoc = Omit<Partial<PaymentAccount>, "id" | "ownerId"> & {
    _id?: MongoId | string;
    ownerId?: MongoId | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    card?: Partial<SafeCardInfo> & {
        exp_month?: number;
        exp_year?: number;
        last4?: string;
        brand?: string;
    };
};

function isDate(value: unknown): value is Date {
    return Object.prototype.toString.call(value) === "[object Date]";
}

/** Convert Mongoose doc to frontend PaymentAccount shape */
function normalizeDocToPaymentAccount(doc: LeanDoc): PaymentAccount {
    if (!doc) throw new Error("No document to normalize");

    const id =
        typeof doc._id === "string"
            ? doc._id
            : doc._id && typeof doc._id.toString === "function"
                ? doc._id.toString()
                : "";

    const createdAtRaw: Date | string | undefined = doc.createdAt;
    const createdAt = isDate(createdAtRaw)
        ? createdAtRaw.toISOString()
        : String(createdAtRaw ?? new Date().toISOString());

    const updatedAtRaw: Date | string | undefined = doc.updatedAt;
    const updatedAt = isDate(updatedAtRaw)
        ? updatedAtRaw.toISOString()
        : String(updatedAtRaw ?? new Date().toISOString());

    const card: SafeCardInfo | undefined = doc.card
        ? {
            brand: (doc.card.brand as CardBrand) ?? ("unknown" as CardBrand),
            last4: doc.card.last4,
            expMonth: doc.card.expMonth ?? doc.card.exp_month,
            expYear: doc.card.expYear ?? doc.card.exp_year,
        }
        : undefined;

    return {
        id,
        ownerType: doc.ownerType!,
        ownerId: doc.ownerId?.toString() ?? null,
        purpose: doc.purpose!,
        isActive: !!doc.isActive,
        isBackup: !!doc.isBackup,
        createdAt,
        updatedAt,
        label: doc.label ?? undefined,
        card,
        stripeCustomerId: doc.stripeCustomerId!,
        stripePaymentMethodId: doc.stripePaymentMethodId!,
        stripeConnectedAccountId: doc.stripeConnectedAccountId,
        isDeleted: doc.isDeleted ?? undefined,
        deletedAt: doc.deletedAt ? new Date(doc.deletedAt).toISOString() : null,
    };
}

/**
 * Core handler that returns a paginated list of payment accounts
 * for the authenticated guide (company owner).
 */
export default async function GetPaymentAccountsHandler(
    req: NextRequest
): Promise<HandlerResult<Paginated<PaymentAccount>>> {
    await ConnectDB();

    // 1. Get current user ID from session
    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError("Unauthorized", 401);
    }

    // 2. Verify the user exists and has the "guide" role
    //    validateUser will throw ApiError if role mismatch or user not found
    await validateUser(userId, USER_ROLE.GUIDE, { returnUser: false });

    // 3. Find the Guide document associated with this user
    const guide = await GuideModel.findOne({ "owner.user": userId })
        .select("_id")
        .lean();
    if (!guide) {
        throw new ApiError("Guide profile not found", 404);
    }
    const companyId = guide._id.toString();

    // 4. Parse pagination parameters
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const pageSize = Math.max(
        1,
        Math.min(100, Number(url.searchParams.get("pageSize") ?? 5))
    );
    const skip = (page - 1) * pageSize;

    // 5. Build filter – only payment accounts owned by this guide (company)
    const filter = {
        ownerType: PAYMENT_OWNER_TYPE.GUIDE,
        ownerId: companyId,
        $or: [
            { isDeleted: false },
            { isDeleted: { $exists: false } },
            { isDeleted: null },
        ],
    };

    // 6. Execute query (withTransaction optional but safe for reads)
    const { itemsRaw, total } = await withTransaction(async () => {
        const itemsRaw = await paymentAccountModel
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize)
            .lean<LeanDoc[]>()
            .exec();

        const total = await paymentAccountModel.countDocuments(filter);
        return { itemsRaw, total };
    });

    const items = itemsRaw.map(normalizeDocToPaymentAccount);
    const pageData: Paginated<PaymentAccount> = { items, total, page, pageSize };

    return { data: pageData, status: 200 };
}