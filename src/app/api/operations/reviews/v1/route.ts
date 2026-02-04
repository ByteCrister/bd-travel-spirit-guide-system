// app/api/reviews/route.ts
import { NextRequest } from "next/server";
import mongoose, { Types, FilterQuery } from "mongoose";
import ConnectDB from "@/config/db";
import { ReviewSearchField } from "@/types/reviews.types";
import { IReview, ReviewModel } from "@/models/tours/review.model";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import UserModel from "@/models/user.model";
import { USER_ROLE } from "@/constants/user.const";
import TourModel from "@/models/tours/tour.model";
import GuideModel from "@/models/guide/guide.model";
import EmployeeModel from "@/models/employees/employees.model";
import { getCollectionName } from "@/lib/helpers/get-collection-name";
import { TravelerModel } from "@/models/travelers/traveler.model";

/**
 * Build aggregation pipeline for review list
 */
function buildAggregationPipeline(
    filter: FilterQuery<IReview>,
    query: string | undefined,
    queryField: ReviewSearchField | undefined,
    sortField: string,
    sortDir: "asc" | "desc",
    tourTitle?: string,
    includeDeleted = false
): mongoose.PipelineStage[] {
    const pipeline: mongoose.PipelineStage[] = [];

    // 1️⃣ Lookup tour info first
    pipeline.push({
        $lookup: {
            from: getCollectionName(TourModel),
            localField: "tour",
            foreignField: "_id",
            as: "tourInfo",
            pipeline: [{ $match: { deletedAt: null } }]
        }
    });
    pipeline.push({ $unwind: { path: "$tourInfo", preserveNullAndEmptyArrays: true } });

    // 2️⃣ Lookup traveler info
    pipeline.push({
        $lookup: {
            from: getCollectionName(TravelerModel),
            localField: "user",
            foreignField: "_id",
            as: "travelerInfo",
            pipeline: [{ $match: { deletedAt: null } }]
        }
    });
    pipeline.push({ $unwind: { path: "$travelerInfo", preserveNullAndEmptyArrays: true } });

    // 3️⃣ Lookup user info
    pipeline.push({
        $lookup: {
            from: getCollectionName(UserModel),
            localField: "travelerInfo.user",
            foreignField: "_id",
            as: "userInfo"
        }
    });
    pipeline.push({ $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } });

    // 4️⃣ Add computed fields
    pipeline.push({
        $addFields: {
            userName: "$travelerInfo.name",
            userEmail: "$userInfo.email",
            tourTitle: "$tourInfo.title",
            imageCount: { $size: "$images" }
        }
    });

    // 5️⃣ Base filter including soft-delete
    pipeline.push({
        $match: {
            ...filter,
            deletedAt: includeDeleted ? { $ne: null } : null
        }
    });

    // 6️⃣ Filter by tourTitle if provided
    if (tourTitle) {
        pipeline.push({
            $match: { tourTitle: { $regex: tourTitle, $options: "i" } }
        });
    }

    // 7️⃣ Handle text search
    if (query && queryField) {
        const searchMatch: Record<string, unknown> = {};
        searchMatch[queryField] = { $regex: query, $options: "i" };
        pipeline.push({ $match: searchMatch });
    }

    // 8️⃣ Sorting
    const sortDirection = sortDir === "asc" ? 1 : -1;
    const sortFieldMap: Record<string, string> = {
        createdAt: "createdAt",
        rating: "rating",
        helpfulCount: "helpfulCount",
        updatedAt: "updatedAt",
        isApproved: "isApproved"
    };
    pipeline.push({
        $sort: { [sortFieldMap[sortField] || "createdAt"]: sortDirection }
    });

    return pipeline;
}

/**
 * GET /api/reviews
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
    await ConnectDB();

    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Sorting
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortDir = (searchParams.get("sortDir") as "asc" | "desc") || "desc";

    // Filters
    const query = searchParams.get("q") || undefined;
    const queryField = searchParams.get("qField") as ReviewSearchField || undefined;
    const tourTitle = searchParams.get("tourTitle") || undefined;
    const ratingMin = searchParams.get("ratingMin") ? parseInt(searchParams.get("ratingMin")!) : undefined;
    const ratingMax = searchParams.get("ratingMax") ? parseInt(searchParams.get("ratingMax")!) : undefined;
    const isApproved = searchParams.get("isApproved");
    const tripType = searchParams.get("tripType") || undefined;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    // Auth
    const userId = await getUserIdFromSession();
    if (!userId) throw new ApiError("Unauthorized", 401);

    const user = await UserModel.findById(userId).lean();
    if (!user) throw new ApiError("User not found", 404);

    // Determine allowed tours
    let allowedTourIds: Types.ObjectId[] = [];

    if (user.role === USER_ROLE.GUIDE) {
        const guide = await GuideModel.findOne({ user: userId }).lean();
        if (!guide) throw new ApiError("Guide profile not found", 404);

        const tours = await TourModel.find({ companyId: guide._id }).select("_id").lean();
        allowedTourIds = tours.map(t => t._id as Types.ObjectId);
    }

    if (user.role === USER_ROLE.ASSISTANT) {
        const employee = await EmployeeModel.findOne({ user: userId }).lean();
        if (!employee) throw new ApiError("Employee profile not found", 404);

        const guide = await GuideModel.findById(employee.companyId).lean();
        if (!guide) throw new ApiError("Guide not found for assistant", 404);

        const tours = await TourModel.find({ companyId: guide._id }).select("_id").lean();
        allowedTourIds = tours.map(t => t._id as Types.ObjectId);
    }

    if (!allowedTourIds.length) return { data: { docs: [], total: 0, page: 1, pages: 0 }, status: 200 };

    // Build filter
    const filter: FilterQuery<IReview> = { tour: { $in: allowedTourIds } };

    if (ratingMin !== undefined || ratingMax !== undefined) {
        filter.rating = {};
        if (ratingMin !== undefined) filter.rating.$gte = ratingMin;
        if (ratingMax !== undefined) filter.rating.$lte = ratingMax;
    }

    if (isApproved !== undefined) filter.isApproved = isApproved === "true";
    if (tripType) filter.tripType = tripType;
    if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Build aggregation pipelines
    const basePipeline = buildAggregationPipeline(filter, query, queryField, sortField, sortDir, tourTitle, includeDeleted);

    const countPipeline = [...basePipeline, { $count: "total" }];
    const dataPipeline = [...basePipeline];

    // Pagination
    const skip = offset > 0 ? offset : (page - 1) * limit;
    dataPipeline.push({ $skip: skip });
    dataPipeline.push({ $limit: limit });

    // Projection
    dataPipeline.push({
        $project: {
            _id: 1,
            tourId: "$tour",
            tourTitle: 1,
            userId: "$user",
            userName: 1,
            rating: 1,
            title: 1,
            comment: 1,
            images: 1,
            tripType: 1,
            travelDate: 1,
            isApproved: 1,
            helpfulCount: 1,
            createdAt: 1,
            updatedAt: 1,
            deletedAt: 1,
            userAvatar: "$travelerInfo.avatar",
            userEmail: 1,
            tourSlug: "$tourInfo.slug",
            tourHeroImage: "$tourInfo.heroImage"
        }
    });

    // Execute aggregation
    const result = await withTransaction(async (session) => {
        const [countResult, reviews] = await Promise.all([
            ReviewModel.aggregate(countPipeline).session(session),
            ReviewModel.aggregate(dataPipeline).session(session)
        ]);

        const total = countResult[0]?.total || 0;
        const totalPages = Math.ceil(total / limit);
        const currentPage = offset > 0 ? Math.floor(offset / limit) + 1 : page;

        // Format reviews
        const formattedReviews = reviews.map(r => ({
            ...r,
            _id: r._id.toString(),
            tourId: r.tourId?.toString() || null,
            userId: r.userId?.toString() || null,
            travelDate: r.travelDate ? new Date(r.travelDate).toISOString() : null,
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
            updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : null,
            deletedAt: r.deletedAt ? new Date(r.deletedAt).toISOString() : null,
            tourHeroImage: r.tourHeroImage?.toString() || null,
            userAvatar: r.userAvatar?.toString() || null,
            isExpanded: false,
            imageCount: r.imageCount || 0
        }));

        return {
            docs: formattedReviews,
            total,
            page: currentPage,
            pages: totalPages
        };
    });

    return { data: result, status: 200 };
});