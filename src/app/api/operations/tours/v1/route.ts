// app/api/tours/route.ts
import { NextRequest } from "next/server";
import { Types, FilterQuery } from "mongoose";
import TourModel, { IDestinationBlock, ITour, IAttraction } from "@/models/tours/tour.model";
import { buildTourDetailDTO } from "@/lib/build-responses/build-tour-details";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { TOUR_STATUS, MODERATION_STATUS } from "@/constants/tour.const";
import ConnectDB from "@/config/db";
import { validationSchemas } from "@/utils/validators/tour/add-tour.validator";
import { combineSchemas } from "@/types/validator.yup";
import { ValidationError } from "yup";
import { CreateTourDTO, TourDetailDTO } from "@/types/tour.types";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import EmployeeModel from "@/models/employees/employees.model";
import AssetFileModel from '@/models/assets/asset-file.model';
import AssetModel from '@/models/assets/asset.model';
import { PopulatedAssetLean } from '@/types/populated-asset.types';
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { slugify } from "@/lib/helpers/slugify";

type ObjectId = Types.ObjectId;


type IDestinationBlockLean =
    Omit<IDestinationBlock, "attractions" | "images"> & {
        attractions: (Omit<IAttraction, "images"> & {
            images: PopulatedAssetLean[];
        })[];
        images: PopulatedAssetLean[];
    };

type TourLeanPopulated =
    Omit<ITour,
        | "heroImage"
        | "gallery"
        | "destinations"
    > & {
        _id: ObjectId;
        heroImage: PopulatedAssetLean | null;
        gallery: PopulatedAssetLean[];
        destinations: IDestinationBlockLean[]
    };

// POST Helper function to map destinations & attractions
function mapDestinations(
    destinations: CreateTourDTO["destinations"],
): IDestinationBlock[] {
    return destinations?.map((dest) => {
        const mappedDest: IDestinationBlock = {
            description: dest.description,
            highlights: dest.highlights,
            coordinates: dest.coordinates,
            activities: dest.activities?.map(act => ({ ...act })) || [],
            attractions: dest.attractions?.map((attr) => ({
                ...attr,
                images: [],
            })) || [],
            images: [],
        };
        return mappedDest;
    }) || [];
}

/**
 * GET api/operations/tours/v1
 * Fetch paginated & filtered tours
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);

    /* ---------------- Pagination ---------------- */
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 100);
    const skip = (page - 1) * limit;

    /* ---------------- Sorting ---------------- */
    const sortField = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") === "asc" ? 1 : -1;

    const sort: Record<string, 1 | -1> = {
        [sortField]: order,
    };

    /* ---------------- Filters ---------------- */
    const filter: FilterQuery<ITour> = {
        deletedAt: { $exists: false },
    };

    const arrayFilter = (key: string) => {
        const value = searchParams.get(key);
        if (value) filter[key] = { $in: value.split(",") };
    };

    const boolFilter = (key: string) => {
        const value = searchParams.get(key);
        if (value === "true") filter[key] = true;
        if (value === "false") filter[key] = false;
    };

    arrayFilter("division");
    arrayFilter("district");
    arrayFilter("tourType");
    arrayFilter("difficulty");
    arrayFilter("audience");
    arrayFilter("categories");
    arrayFilter("status");
    arrayFilter("moderationStatus");
    arrayFilter("tags");

    boolFilter("featured");
    boolFilter("guideIncluded");
    boolFilter("transportIncluded");

    /* ---------------- Search ---------------- */
    const search = searchParams.get("search");
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { summary: { $regex: search, $options: "i" } },
            { tags: { $regex: search, $options: "i" } },
        ];
    }

    /* ---------------- Price ---------------- */
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    if (minPrice || maxPrice) {
        filter["basePrice.amount"] = {};
        if (minPrice) filter["basePrice.amount"].$gte = Number(minPrice);
        if (maxPrice) filter["basePrice.amount"].$lte = Number(maxPrice);
    }

    const currency = searchParams.get("currency");
    if (currency) filter["basePrice.currency"] = currency;

    /* ---------------- Date Range ---------------- */
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (startDate || endDate) {
        filter.departures = {
            $elemMatch: {
                ...(startDate && { date: { $gte: new Date(startDate) } }),
                ...(endDate && { date: { $lte: new Date(endDate) } }),
            },
        };
    }

    await ConnectDB();

    /* ---------------- Query ---------------- */
    const [rawDocs, total] = await Promise.all([
        TourModel.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate({
                path: "heroImage",
                select: "file deletedAt",
                model: AssetModel,
                populate: { path: "file", select: "publicUrl", model: AssetFileModel },
                options: { lean: true } // optional
            })
            .populate({
                path: "gallery",
                select: "file deletedAt",
                model: AssetModel,
                populate: { path: "file", select: "publicUrl", model: AssetFileModel },
            })
            .populate({
                path: "destinations.images",
                select: "file deletedAt",
                model: AssetModel,
                populate: { path: "file", select: "publicUrl", model: AssetFileModel },
            })
            .populate({
                path: "destinations.attractions.images",
                select: "file deletedAt",
                model: AssetModel,
                populate: { path: "file", select: "publicUrl", model: AssetFileModel },
            })
            .lean(),
        TourModel.countDocuments(filter),
    ]);

    const docs = rawDocs as unknown as TourLeanPopulated[];

    /* ---------------- Map to TourListItemDTO ---------------- */
    const mappedDocs = docs.map((t) => {
        const nextDeparture = t.departures
            ?.map((d) => new Date(d.date))
            .filter((d: Date) => d > new Date())
            .sort((a: Date, b: Date) => +a - +b)[0];

        const totalSeats =
            t.departures?.reduce((sum, d) => sum + d.seatsTotal, 0) || 0;
        const bookedSeats =
            t.departures?.reduce(
                (sum, d) => sum + d.seatsBooked,
                0
            ) || 0;

        return {
            id: String(t._id),
            title: t.title,
            slug: t.slug,
            status: t.status,
            summary: t.summary,
            heroImage: t.heroImage?.file?.publicUrl ?? undefined,

            tourType: t.tourType,
            division: t.division,
            district: t.district,
            difficulty: t.difficulty,

            basePrice: t.basePrice,

            hasActiveDiscount: Array.isArray(t.discounts) && t.discounts.length > 0,
            activeDiscountValue: t.discounts?.[0]?.value,

            duration: t.duration,
            nextDeparture: nextDeparture?.toISOString(),

            ratings: t.ratings,
            wishlistCount: t.wishlistCount,
            viewCount: t.viewCount,
            likeCount: t.likeCount,
            shareCount: t.shareCount,

            moderationStatus: t.moderationStatus,
            featured: t.featured,

            companyId: String(t.companyId),
            authorId: String(t.authorId),
            publishedAt: t.publishedAt,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,

            occupancyPercentage:
                totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0,
        };
    });

    return {
        status: 200,
        data: {
            docs: mappedDocs,
            total,
            page,
            pages: Math.ceil(total / limit),
        },
    }
});

export const POST = withErrorHandler(async (request: NextRequest) => {
    // 1️⃣ Parse request body
    const body = (await request.json()) as CreateTourDTO;

    // 2️⃣ Validate request body
    const fullValidationSchema = combineSchemas(validationSchemas);
    try {
        await fullValidationSchema.validate(body, { abortEarly: false, stripUnknown: true });
    } catch (err) {
        if (err instanceof ValidationError) {
            const errors = err.inner.map(e => ({ path: e.path, message: e.message }));
            throw new ApiError(errors[0]?.message || "Validation failed", 400);
        }
    }

    // 3️⃣ Connect DB
    await ConnectDB();

    // 4️⃣ Get authorId
    const authorIdStr = await getUserIdFromSession();
    if (!authorIdStr) throw new ApiError("Unauthorized", 401);
    const authorId = new Types.ObjectId(authorIdStr);

    // 5️⃣ Get companyId
    const employee = await EmployeeModel.findOne({ user: authorId }).select("companyId").lean();
    if (!employee?.companyId) throw new ApiError("Employee or company not found", 404);
    const companyId =
        employee.companyId instanceof Types.ObjectId
            ? employee.companyId
            : new Types.ObjectId(employee.companyId);

    // 6️⃣ Upload images & create tour in transaction
    const tourDetailDTO = await withTransaction<TourDetailDTO>(async session => {

        // Map destinations
        const mappedDestinations = mapDestinations(body.destinations);

        // Prepare tour data
        const tourData: Partial<ITour> = {
            companyId,
            authorId,
            title: body.title,
            slug: slugify(body.title),
            summary: body.summary,
            heroImage: undefined,
            gallery: [],
            seo: body.seo,
            status: TOUR_STATUS.DRAFT,
            tourType: body.tourType,
            division: body.division,
            district: body.district,
            accommodationType: body.accommodationType,
            guideIncluded: body.guideIncluded ?? true,
            transportIncluded: body.transportIncluded ?? true,
            emergencyContacts: body.emergencyContacts,
            destinations: mappedDestinations,
            itinerary: body.itinerary,
            inclusions: body.inclusions,
            exclusions: body.exclusions,
            difficulty: body.difficulty,
            bestSeason: body.bestSeason,
            audience: body.audience,
            categories: body.categories,
            translations: body.translations,
            mainLocation: body.mainLocation,
            transportModes: body.transportModes,
            pickupOptions: body.pickupOptions,
            meetingPoint: body.meetingPoint,
            packingList: body.packingList,
            basePrice: body.basePrice,
            discounts: body.discounts?.map(d => ({
                ...d,
                validFrom: d.validFrom ? new Date(d.validFrom) : undefined,
                validUntil: d.validUntil ? new Date(d.validUntil) : undefined,
            })),
            duration: body.duration,
            operatingWindows: body.operatingWindows?.map(w => ({ ...w, startDate: new Date(w.startDate), endDate: new Date(w.endDate), seatsBooked: 0 })),
            departures: body.departures?.map(d => ({ ...d, date: new Date(d.date), seatsBooked: 0 })),
            paymentMethods: body.paymentMethods,
            licenseRequired: body.licenseRequired ?? false,
            ageSuitability: body.ageSuitability,
            accessibility: body.accessibility,
            cancellationPolicy: body.cancellationPolicy,
            refundPolicy: body.refundPolicy,
            terms: body.terms,
            moderationStatus: MODERATION_STATUS.PENDING,
            wishlistCount: 0,
            featured: false,
            viewCount: 0,
            likeCount: 0,
            shareCount: 0,
            tags: body.tags,
        };

        const [tour] = await TourModel.create([tourData], { session });

        // 7️⃣ Build response
        const detailDto = await buildTourDetailDTO(tour._id as Types.ObjectId, true, session);

        if (!detailDto)
            throw new ApiError(
                "Tour was created but failed to build tour details.",
                500
            );

        return detailDto;
    });

    return { data: tourDetailDTO, status: 201 };
});