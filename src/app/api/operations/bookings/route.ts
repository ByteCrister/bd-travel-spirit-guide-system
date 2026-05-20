// app/api/operations/bookings/route.ts
import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { UserModel } from "@/models/user.model";
import { USER_ROLE } from "@/constants/current-user/user.const";
import {
    BOOKING_STATUS,
    BookingStatus,
    BOOKING_PAYMENT_STATUS,
    BookingPaymentStatus,
} from "@/constants/tour/tour-booking.const";
import {
    IBookingPopulated,
    PaginationMeta,
    IAppliedDiscount,
    IPayment,
    ICancellation,
} from "@/types/tour/booking.types";
import EmployeeModel from "@/models/employees/employees.model";
import GuideModel from "@/models/guide/guide.model";
import TourModel from "@/models/tours/tour.model";
import BookingModel from "@/models/tours/booking.model";
import AssetModel from "@/models/assets/asset.model";
import AssetFileModel from "@/models/assets/asset-file.model";
import { withErrorHandler, HandlerResult, ApiError } from "@/lib/helpers/withErrorHandler";
import { sanitizeSearch } from "@/lib/helpers/sanitize-search";
import { getCollectionName } from "@/lib/helpers/get-collection-name";
import { TravelerModel, ITraveler } from "@/models/travelers/traveler.model";

// ---------- Intermediate aggregation types ----------
interface RawTravelerDoc {
    _id: mongoose.Types.ObjectId;
    name: string;
    phone?: string;
    avatar?: mongoose.Types.ObjectId;
    address?: ITraveler["address"];
    isVerified: boolean;
    accountStatus: string;
    user: mongoose.Types.ObjectId;
}

interface RawUserDoc {
    _id: mongoose.Types.ObjectId;
    email: string;
}

interface RawTourDoc {
    _id: mongoose.Types.ObjectId;
    title: string;
    slug: string;
    uniqueTourCode: string;
    basePrice: { amount: number; currency: string };
    duration: { days: number; nights?: number };  // required — matches PopulatedTour
    division: string;
    district: string;
    status: string;
    heroImage?: mongoose.Types.ObjectId;
    summary?: string;
}

// Raw cancellation as returned by MongoDB aggregation —
// cancelledBy is an ObjectId in the DB, not a string (unlike ICancellation in booking.types.ts)
interface RawCancellation {
    cancelledAt: Date;
    reason: string;
    cancelledBy: mongoose.Types.ObjectId;
    refundAmount?: number;
    refundStatus?: ICancellation["refundStatus"];
}

interface RawBookingAggregationOutput {
    _id: mongoose.Types.ObjectId;
    bookingReference: string;
    uniqueTourCode: string;
    totalParticipants: number;
    discounts: IAppliedDiscount[];
    totalPaid: number;
    payment: IPayment;
    status: BookingStatus;
    expiresAt?: Date;
    cancellation?: RawCancellation;  // ObjectId-based, converted in toBookingPopulated()
    bookedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    travelerObj: RawTravelerDoc;
    userObj: RawUserDoc;
    tourObj: RawTourDoc;
}

// ---------- Avatar resolution helpers (fully typed) ----------
interface AssetDoc {
    _id: mongoose.Types.ObjectId;
    file?: mongoose.Types.ObjectId;
}

interface AssetFileDoc {
    _id: mongoose.Types.ObjectId;
    publicUrl: string;
}

// Helper to convert null to undefined for booking traveler address fields
function sanitizeAddress(address: ITraveler["address"]): IBookingPopulated["traveler"]["address"] {
    if (!address) return undefined;
    return {
        division: address.division,
        district: address.district,
        upazila: address.upazila ?? undefined,
        area: address.area ?? undefined,
        house: address.house ?? undefined,
        road: address.road ?? undefined,
        postalCode: address.postalCode ?? undefined,
    };
}

async function resolveAvatarUrls(travelers: Pick<RawTravelerDoc, "avatar" | "_id">[]): Promise<Map<string, string | undefined>> {
    const avatarIds = travelers.map(t => t.avatar).filter((id): id is mongoose.Types.ObjectId => !!id);
    if (avatarIds.length === 0) return new Map();

    const assets = await AssetModel.find<AssetDoc>({ _id: { $in: avatarIds } }).select("file").lean();
    const fileIds = assets.map(a => a.file).filter((id): id is mongoose.Types.ObjectId => !!id);
    const assetFiles = await AssetFileModel.find<AssetFileDoc>({ _id: { $in: fileIds } }).select("publicUrl").lean();
    const fileUrlMap = new Map(assetFiles.map(f => [f._id.toString(), f.publicUrl]));

    const avatarUrlMap = new Map<string, string | undefined>();
    for (const asset of assets) {
        const url = asset.file ? fileUrlMap.get(asset.file.toString()) : undefined;
        avatarUrlMap.set(asset._id.toString(), url);
    }
    return avatarUrlMap;
}

// ---------- Populate traveler emails & avatars (no .populate<...> to avoid TS error) ----------
function resolveTravelerId(travelerId: unknown): string {
    if (typeof travelerId === "string") return travelerId;
    if (travelerId instanceof mongoose.Types.ObjectId) return travelerId.toString();
    return String(travelerId);
}

async function populateTravelers(bookings: IBookingPopulated[]): Promise<void> {
    const travelerInfos = bookings.map(b => ({
        id: resolveTravelerId(b.traveler._id),
        avatarId: b.traveler.avatar ? new mongoose.Types.ObjectId(b.traveler.avatar) : undefined,
    }));
    const travelerIds = travelerInfos.map(t => new mongoose.Types.ObjectId(t.id));

    // 1. Fetch traveler documents (lean, no populate)
    const travelers = await TravelerModel.find({ _id: { $in: travelerIds } }).lean() as ITraveler[];

    // 2. Fetch user emails separately (avoids populate type issues)
    const userIds = travelers.map(t => t.user).filter((id): id is mongoose.Types.ObjectId => !!id);
    const users = await UserModel.find({ _id: { $in: userIds } }).select("email").lean();
    const userEmailMap = new Map(users.map(u => [u._id.toString(), u.email]));

    // 3. Map traveler ID → user email
    const travelerEmailMap = new Map<string, string>();
    for (const traveler of travelers) {
        const email = userEmailMap.get(traveler.user.toString()) ?? "";
        travelerEmailMap.set(resolveTravelerId(traveler._id), email);
    }

    // 4. Fetch avatar URLs
    const avatarIdMap = new Map<string, mongoose.Types.ObjectId>(
        travelerInfos.filter(t => t.avatarId).map(t => [t.id, t.avatarId!])
    );
    const uniqueAvatarIds = Array.from(avatarIdMap.values());
    const avatarUrlMap = await resolveAvatarUrls(uniqueAvatarIds.map(id => ({ _id: id, avatar: id })));

    // 5. Assign back to bookings
    for (const booking of bookings) {
        const travelerId = booking.traveler._id;
        booking.traveler.email = travelerEmailMap.get(travelerId) ?? "";
        const avatarObjectId = avatarIdMap.get(travelerId);
        booking.traveler.avatar = avatarObjectId ? avatarUrlMap.get(avatarObjectId.toString()) : undefined;
    }
}

// ---------- Main handler ----------
async function getBookings(req: NextRequest): Promise<HandlerResult<{ data: IBookingPopulated[]; meta: PaginationMeta }>> {
    // 1. Authenticate & get user role
    const userId = await getUserIdFromSession();
    if (!userId) throw new ApiError("Unauthorized", 401);

    const user = await UserModel.findById(userId).select("role").lean();
    if (!user) throw new ApiError("User not found", 404);

    // 2. Resolve companyId
    let companyId: mongoose.Types.ObjectId | null = null;
    if (user.role === USER_ROLE.ASSISTANT) {
        const employee = await EmployeeModel.findOne({ user: userId }).select("companyId").lean();
        if (!employee?.companyId) throw new ApiError("Assistant not linked to any company", 403);
        companyId = new mongoose.Types.ObjectId(employee.companyId.toString());
    } else if (user.role === USER_ROLE.GUIDE) {
        const guide = await GuideModel.findOne({ "owner.user": userId }).select("_id").lean();
        if (!guide) throw new ApiError("Guide profile not found", 404);
        companyId = new mongoose.Types.ObjectId(guide._id.toString());
    } else {
        throw new ApiError("Invalid user role for booking list", 403);
    }

    // 3. Get all tour IDs belonging to this company (including soft‑deleted if requested)
    const url = new URL(req.url);
    const showDeleted = url.searchParams.get("showDeleted") === "true";

    const tourQuery: mongoose.FilterQuery<typeof TourModel> = { companyId };
    if (!showDeleted) tourQuery.deletedAt = null;

    const tours = await TourModel.find(tourQuery).select("_id").lean();
    const tourIds = tours.map(t => t._id);
    if (tourIds.length === 0) {
        return {
            data: {
                data: [],
                meta: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            },
        };
    }

    // 4. Parse query parameters
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(url.searchParams.get("limit") || "10"));
    const skip = (page - 1) * limit;

    const statusParam = url.searchParams.get("status");
    const status: BookingStatus[] | undefined = statusParam
        ? (statusParam.split(",").filter(
            (s): s is BookingStatus => (Object.values(BOOKING_STATUS) as string[]).includes(s)
        ))
        : undefined;

    const paymentStatusParam = url.searchParams.get("paymentStatus");
    const paymentStatus: BookingPaymentStatus[] | undefined = paymentStatusParam
        ? (paymentStatusParam.split(",").filter(
            (s): s is BookingPaymentStatus => (Object.values(BOOKING_PAYMENT_STATUS) as string[]).includes(s)
        ))
        : undefined;
    const fromDate = url.searchParams.get("fromDate");
    const toDate = url.searchParams.get("toDate");
    const tourTitle = url.searchParams.get("tourTitle");
    const rawSearch = url.searchParams.get("search");
    const search = sanitizeSearch(rawSearch);
    const sortBy = url.searchParams.get("sortBy") as "bookedAt" | "createdAt" | "totalPaid" | "bookingReference" | null;
    const sortOrder = url.searchParams.get("sortOrder") === "asc" ? 1 : -1;

    // 5. Build aggregation pipeline (typed as any because pipeline stages are generic)
    const pipeline: mongoose.PipelineStage[] = [];

    // Match bookings for the company's tours
    pipeline.push({ $match: { tour: { $in: tourIds }, deletedAt: showDeleted ? undefined : null } });

    if (status && status.length) {
        pipeline.push({ $match: { status: { $in: status } } });
    }
    if (paymentStatus && paymentStatus.length) {
        pipeline.push({ $match: { "payment.status": { $in: paymentStatus } } });
    }
    if (fromDate || toDate) {
        const bookedAtFilter: Record<string, Date> = {};
        if (fromDate) bookedAtFilter.$gte = new Date(fromDate);
        if (toDate) bookedAtFilter.$lte = new Date(toDate);
        pipeline.push({ $match: { bookedAt: bookedAtFilter } });
    }

    // Lookup traveler
    pipeline.push({
        $lookup: {
            from: getCollectionName(TravelerModel),
            localField: "traveler",
            foreignField: "_id",
            as: "travelerObj",
        },
    });
    pipeline.push({ $unwind: { path: "$travelerObj", preserveNullAndEmptyArrays: false } });

    // Lookup user email from traveler.user
    pipeline.push({
        $lookup: {
            from: getCollectionName(UserModel),
            localField: "travelerObj.user",
            foreignField: "_id",
            as: "userObj",
        },
    });
    pipeline.push({ $unwind: { path: "$userObj", preserveNullAndEmptyArrays: false } });

    // Lookup tour details
    pipeline.push({
        $lookup: {
            from: getCollectionName(TourModel),
            localField: "tour",
            foreignField: "_id",
            as: "tourObj",
        },
    });
    pipeline.push({ $unwind: { path: "$tourObj", preserveNullAndEmptyArrays: false } });

    // Apply search
    if (search) {
        const regex = { $regex: search, $options: "i" };
        pipeline.push({
            $match: {
                $or: [
                    { bookingReference: regex },
                    { "travelerObj.name": regex },
                    { "userObj.email": regex },
                    { "tourObj.title": regex },
                ],
            },
        });
    }

    if (tourTitle) {
        pipeline.push({ $match: { "tourObj.title": { $regex: tourTitle, $options: "i" } } });
    }

    // Sorting
    const sortField = sortBy === "bookingReference" ? "bookingReference" :
        sortBy === "totalPaid" ? "totalPaid" :
            sortBy === "createdAt" ? "createdAt" : "bookedAt";
    pipeline.push({ $sort: { [sortField]: sortOrder } });

    // Pagination with $facet
    pipeline.push({
        $facet: {
            metadata: [{ $count: "total" }],
            data: [{ $skip: skip }, { $limit: limit }],
        },
    });

    type AggregationResult = Array<{
        metadata: Array<{ total: number }>;
        data: RawBookingAggregationOutput[];
    }>;

    const result = (await BookingModel.aggregate(pipeline)) as AggregationResult;
    const total = result[0]?.metadata[0]?.total || 0;
    const bookingsRaw = result[0]?.data || [];

    // 6. Transform to IBookingPopulated
    function toBookingPopulated(item: RawBookingAggregationOutput): IBookingPopulated {
        return {
            _id: item._id.toString(),
            bookingReference: item.bookingReference,
            uniqueTourCode: item.uniqueTourCode,
            totalParticipants: item.totalParticipants,
            discounts: item.discounts,
            totalPaid: item.totalPaid,
            payment: item.payment,
            status: item.status,
            expiresAt: item.expiresAt,
            // Convert RawCancellation (ObjectId) → ICancellation (string)
            cancellation: item.cancellation
                ? {
                    ...item.cancellation,
                    cancelledBy: item.cancellation.cancelledBy.toString(),
                }
                : undefined,
            bookedAt: item.bookedAt,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            deletedAt: item.deletedAt,
            traveler: {
                _id: item.travelerObj._id.toString(),
                name: item.travelerObj.name,
                phone: item.travelerObj.phone,
                address: sanitizeAddress(item.travelerObj.address),
                isVerified: item.travelerObj.isVerified,
                accountStatus: item.travelerObj.accountStatus,
                email: "",        // filled by populateTravelers()
                avatar: undefined, // filled by populateTravelers()
            },
            tour: {
                _id: item.tourObj._id.toString(),
                title: item.tourObj.title,
                slug: item.tourObj.slug,
                uniqueTourCode: item.tourObj.uniqueTourCode,
                basePrice: item.tourObj.basePrice,
                // duration is optional in the DB schema — fallback to 0 days if absent
                duration: item.tourObj.duration ?? { days: 0 },
                division: item.tourObj.division,
                district: item.tourObj.district,
                status: item.tourObj.status,
                heroImage: item.tourObj.heroImage?.toString(),
                summary: item.tourObj.summary,
            },
        };
    }
    const bookings: IBookingPopulated[] = bookingsRaw.map(toBookingPopulated);

    // 7. Populate traveler emails and avatars
    await populateTravelers(bookings);

    // 8. Build pagination meta
    const totalPages = Math.ceil(total / limit);
    const meta: PaginationMeta = {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };

    return { data: { data: bookings, meta } };
}

export const GET = withErrorHandler(getBookings);