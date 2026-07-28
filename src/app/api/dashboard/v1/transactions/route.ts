// app/api/dashboard/v1/transactions/route.ts
import { NextRequest } from 'next/server';
import { Types } from 'mongoose';
import ConnectDB from '@/config/db';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import UserModel from '@/models/user.model';
import EmployeeModel from '@/models/employees/employees.model';
import GuideModel from '@/models/guide/guide.model';
import { TransactionModel } from '@/models/payments/transaction.model';
import StripePaymentAccountModel, {
    type IStripePaymentAccount,
} from '@/models/payments/payment-account.model';
import { USER_ROLE } from '@/constants/current-user/user.const';
import { PAYMENT_OWNER_TYPE } from '@/constants/payment/payment.const';
import { TRANSACTION_STATUS, type TransactionStatus } from '@/constants/payment/transaction.const';
import { BOOKING_PAYMENT_STATUS, type BookingPaymentStatus } from '@/constants/tour/tour-booking.const';
import { ApiError, withErrorHandler } from '@/lib/helpers/withErrorHandler';
import type { ApiPaginatedResponse, Transaction } from '@/types/dashboard/dashboard.type';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** The tour company's share of each booking's revenue (85%). */
const COMPANY_REVENUE_SHARE = parseFloat(process.env.GUIDE_SHARE_RATE!); // 0.85

function mapTransactionStatusToBookingPayment(status: TransactionStatus): BookingPaymentStatus {
    switch (status) {
        case TRANSACTION_STATUS.SUCCEEDED:
            return BOOKING_PAYMENT_STATUS.PAID;
        case TRANSACTION_STATUS.FAILED:
            return BOOKING_PAYMENT_STATUS.FAILED;
        case TRANSACTION_STATUS.REFUNDED:
            return BOOKING_PAYMENT_STATUS.REFUNDED;
        case TRANSACTION_STATUS.PENDING:
        case TRANSACTION_STATUS.PROCESSING:
        case TRANSACTION_STATUS.CANCELED:
        default:
            return BOOKING_PAYMENT_STATUS.PENDING;
    }
}

function parseTransactionQuery(request: NextRequest): {
    from: Date;
    to: Date;
    cursor?: string;
    limit: number;
} {
    const sp = request.nextUrl.searchParams;
    const fromStr = sp.get('transactionsDateRangeFrom');
    const toStr = sp.get('transactionsDateRangeTo');
    if (!fromStr || !toStr) {
        throw new ApiError('transactionsDateRangeFrom and transactionsDateRangeTo are required', 400);
    }
    if (!DATE_RE.test(fromStr) || !DATE_RE.test(toStr)) {
        throw new ApiError('Invalid date format. Use YYYY-MM-DD', 400);
    }
    const from = new Date(fromStr);
    const to = new Date(toStr);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
        throw new ApiError('Invalid date values', 400);
    }
    to.setHours(23, 59, 59, 999);

    const cursorRaw = sp.get('transactionsCursor') ?? sp.get('cursor') ?? undefined;
    const cursor =
        cursorRaw && Types.ObjectId.isValid(cursorRaw) ? cursorRaw : undefined;

    let limit = parseInt(sp.get('transactionsLimit') ?? sp.get('limit') ?? '20', 10);
    if (Number.isNaN(limit) || limit < 1) limit = 20;
    if (limit > 100) limit = 100;

    return { from, to, cursor, limit };
}

async function resolveCompanyId(userIdStr: string): Promise<Types.ObjectId> {
    const userOid = new Types.ObjectId(userIdStr);

    const user = await UserModel.findById(userOid).select('role').lean<{ role: string } | null>();
    if (!user) throw new ApiError('User not found', 404);

    if (user.role === USER_ROLE.ASSISTANT) {
        const employee = await EmployeeModel.findOne({ user: userOid, deletedAt: null })
            .select('companyId')
            .lean<{ companyId?: Types.ObjectId } | null>();
        if (!employee?.companyId) {
            throw new ApiError('Employee record or companyId missing', 403);
        }
        return employee.companyId;
    }

    if (user.role === USER_ROLE.GUIDE) {
        const guide = await GuideModel.findOne({ 'owner.user': userOid })
            .select('_id')
            .lean<{ _id: Types.ObjectId } | null>();
        if (!guide) throw new ApiError('Guide record not found', 404);
        return guide._id;
    }

    throw new ApiError('Invalid user role for this operation', 403);
}

type TxLean = {
    _id: Types.ObjectId;
    stripePaymentIntentId: string;
    amount: number;
    currency: string;
    status: TransactionStatus;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
};

function mapDocToTransaction(doc: TxLean): Transaction {
    const ref =
        doc.description?.trim() ||
        doc.stripePaymentIntentId ||
        doc._id.toString();
    // Apply the company's 85% revenue share to the gross transaction amount
    const netAmount = Math.round(doc.amount * COMPANY_REVENUE_SHARE * 100) / 100;
    return {
        _id: doc._id.toString(),
        bookingReference: ref.slice(0, 64),
        amount: netAmount,
        currency: doc.currency as Transaction['currency'],
        method: 'stripe',
        status: mapTransactionStatusToBookingPayment(doc.status),
        paidAt:
            doc.status === TRANSACTION_STATUS.SUCCEEDED ? doc.updatedAt ?? doc.createdAt : undefined,
        createdAt: doc.createdAt,
    };
}

export const GET = withErrorHandler(async (request: NextRequest) => {
    await ConnectDB();

    const userIdStr = await getUserIdFromSession();
    if (!userIdStr) {
        throw new ApiError('Authentication required', 401);
    }

    const companyId = await resolveCompanyId(userIdStr);

    const guide = await GuideModel.findById(companyId)
        .select('owner.user')
        .lean<{ owner?: { user?: Types.ObjectId } } | null>();
    const ownerUserId = guide?.owner?.user;
    if (!ownerUserId) {
        throw new ApiError('Guide owner user not found', 404);
    }

    const paymentAccounts = await StripePaymentAccountModel.find({
        ownerType: PAYMENT_OWNER_TYPE.GUIDE,
        ownerId: ownerUserId,
        isDeleted: false,
    })
        .select('_id')
        .lean<Array<Pick<IStripePaymentAccount, '_id'>>>();

    const accountIds = paymentAccounts.map((acc) => acc._id);

    const { from, to, cursor, limit } = parseTransactionQuery(request);

    if (accountIds.length === 0) {
        const empty: ApiPaginatedResponse<Transaction> = {
            data: [],
            total: 0,
            page: 1,
            limit,
            hasNextPage: false,
            nextCursor: undefined,
        };
        return { data: empty, status: 200 };
    }

    const baseFilter: Record<string, unknown> = {
        paymentAccountId: { $in: accountIds },
        createdAt: { $gte: from, $lte: to },
    };

    const statusParam = request.nextUrl.searchParams.get('status');
    if (statusParam && Object.values(TRANSACTION_STATUS).includes(statusParam as TRANSACTION_STATUS)) {
        baseFilter.status = statusParam;
    }

    const total = await TransactionModel.countDocuments(baseFilter);

    const query: Record<string, unknown> = { ...baseFilter };
    if (cursor) {
        query._id = { $lt: new Types.ObjectId(cursor) };
    }

    const rawDocsPlus: TxLean[] = await TransactionModel.find(query)
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit + 1)
        .select('_id stripePaymentIntentId amount currency status description createdAt updatedAt')
        .lean();

    const hasNextPage = rawDocsPlus.length > limit;
    const rawDocs = hasNextPage ? rawDocsPlus.slice(0, limit) : rawDocsPlus;

    const transactions: Transaction[] = rawDocs.map(mapDocToTransaction);

    const nextCursor =
        hasNextPage && transactions.length > 0
            ? transactions[transactions.length - 1]._id
            : undefined;

    const payload: ApiPaginatedResponse<Transaction> = {
        data: transactions,
        total,
        page: 1,
        limit,
        hasNextPage,
        nextCursor,
    };

    return { data: payload, status: 200 };
});
