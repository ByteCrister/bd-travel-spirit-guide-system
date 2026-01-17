// app/api/reviews/route.ts
import { NextRequest } from "next/server";
import mongoose, { Types, FilterQuery } from "mongoose";
import ConnectDB from "@/config/db";
import { ReviewSearchField } from "@/types/reviews.types";
import { IReview, ReviewModel } from "@/models/tours/review.model";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";

// Helper function to build aggregation pipeline
function buildAggregationPipeline(
    filter: FilterQuery<IReview>,
    query: string | undefined,
    queryField: ReviewSearchField | undefined,
    companyId: string | undefined,
    sortField: string,
    sortDir: "asc" | "desc",
): mongoose.PipelineStage[] {
    const pipeline: mongoose.PipelineStage[] = [];

    // 1. Initial match with basic filters
    pipeline.push({ $match: filter });

    // 2. Lookup Traveler details
    pipeline.push({
        $lookup: {
            from: "travelers",
            localField: "user",
            foreignField: "_id",
            as: "travelerInfo",
            pipeline: [
                {
                    $match: {
                        deletedAt: null
                    }
                }
            ]
        }
    });

    pipeline.push({
        $unwind: {
            path: "$travelerInfo",
            preserveNullAndEmptyArrays: true
        }
    });

    // 3. Lookup User details from Traveler
    pipeline.push({
        $lookup: {
            from: "users",
            localField: "travelerInfo.user",
            foreignField: "_id",
            as: "userInfo"
        }
    });

    pipeline.push({
        $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true
        }
    });

    // 4. Lookup Tour details
    pipeline.push({
        $lookup: {
            from: "tours",
            localField: "tour",
            foreignField: "_id",
            as: "tourInfo",
            pipeline: [
                {
                    $match: {
                        deletedAt: null
                    }
                }
            ]
        }
    });

    pipeline.push({
        $unwind: {
            path: "$tourInfo",
            preserveNullAndEmptyArrays: true
        }
    });

    // 5. Add computed fields
    pipeline.push({
        $addFields: {
            userName: "$travelerInfo.name",
            userEmail: "$userInfo.email",
            tourTitle: "$tourInfo.title",
            tourCompanyId: "$tourInfo.companyId",
            imageCount: { $size: "$images" },
            hasImagesField: { $gt: [{ $size: "$images" }, 0] }
        }
    });

    // 6. Handle text search on referenced fields
    if (query && queryField) {
        const searchMatch: Record<string, unknown> = {};

        switch (queryField) {
            case "comment":
            case "title":
                searchMatch[queryField] = { $regex: query, $options: "i" };
                break;
            case "userName":
                searchMatch.userName = { $regex: query, $options: "i" };
                break;
            case "userEmail":
                searchMatch.userEmail = { $regex: query, $options: "i" };
                break;
            case "tourTitle":
                searchMatch.tourTitle = { $regex: query, $options: "i" };
                break;
        }

        if (Object.keys(searchMatch).length > 0) {
            pipeline.push({ $match: searchMatch });
        }
    }

    // 7. Handle company filtering
    if (companyId && Types.ObjectId.isValid(companyId)) {
        pipeline.push({
            $match: {
                tourCompanyId: new Types.ObjectId(companyId)
            }
        });
    }

    // 8. Sort stage
    const sortDirection = sortDir === "asc" ? 1 : -1;
    let sortFieldMap: string;

    switch (sortField) {
        case "createdAt":
            sortFieldMap = "createdAt";
            break;
        case "rating":
            sortFieldMap = "rating";
            break;
        case "helpfulCount":
            sortFieldMap = "helpfulCount";
            break;
        case "updatedAt":
            sortFieldMap = "updatedAt";
            break;
        case "isApproved":
            sortFieldMap = "isApproved";
            break;
        default:
            sortFieldMap = "createdAt";
    }

    pipeline.push({
        $sort: {
            [sortFieldMap]: sortDirection
        }
    });

    // Return pipeline without pagination for counting
    return pipeline;
}

/**
 * GET api for list of tour reviews
 */
export const GET = withErrorHandler(async (request: NextRequest) => {

    await ConnectDB();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Sorting
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortDir = searchParams.get("sortDir") as "asc" | "desc" || "desc";

    // Filters
    const query = searchParams.get("q") || undefined;
    const queryField = searchParams.get("qField") as ReviewSearchField || undefined;
    const tourId = searchParams.get("tourId") || undefined;
    const ratingMin = searchParams.get("ratingMin") ? parseInt(searchParams.get("ratingMin")!) : undefined;
    const ratingMax = searchParams.get("ratingMax") ? parseInt(searchParams.get("ratingMax")!) : undefined;
    const isApproved = searchParams.get("isApproved");
    const hasImages = searchParams.get("hasImages");
    const tripType = searchParams.get("tripType") || undefined;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;
    const includeDeleted = searchParams.get("includeDeleted") === "true";
    const companyId = searchParams.get("companyId") || undefined;

    // Build base filter with proper TypeScript types
    const filter: FilterQuery<IReview> = {};

    // Handle soft-deleted reviews
    if (!includeDeleted) {
        filter.deletedAt = null;
    } else {
        filter.deletedAt = { $ne: null };
    }

    // Direct filters
    if (tourId && Types.ObjectId.isValid(tourId)) {
        filter.tour = new Types.ObjectId(tourId);
    } else if (tourId) {
        throw new ApiError("Invalid tour ID format", 400);
    }

    if (ratingMin !== undefined || ratingMax !== undefined) {
        filter.rating = {};
        if (ratingMin !== undefined) {
            if (ratingMin < 1 || ratingMin > 5) {
                throw new ApiError("ratingMin must be between 1 and 5", 400);
            }
            filter.rating.$gte = ratingMin;
        }
        if (ratingMax !== undefined) {
            if (ratingMax < 1 || ratingMax > 5) {
                throw new ApiError("ratingMax must be between 1 and 5", 400);
            }
            filter.rating.$lte = ratingMax;
        }
    }

    if (isApproved !== undefined) {
        filter.isApproved = isApproved === "true";
    }

    if (hasImages !== undefined) {
        if (hasImages === "true") {
            filter.images = { $ne: [] };
        } else {
            filter.images = { $eq: [] };
        }
    }

    if (tripType) {
        filter.tripType = tripType;
    }

    if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            if (isNaN(fromDate.getTime())) {
                throw new ApiError("Invalid dateFrom format", 400);
            }
            filter.createdAt.$gte = fromDate;
        }
        if (dateTo) {
            const toDate = new Date(dateTo);
            if (isNaN(toDate.getTime())) {
                throw new ApiError("Invalid dateTo format", 400);
            }
            filter.createdAt.$lte = toDate;
        }
    }

    // Build aggregation pipeline
    const basePipeline = buildAggregationPipeline(
        filter,
        query,
        queryField,
        companyId,
        sortField,
        sortDir,
    );

    // Create separate pipelines for counting and data fetching
    const countPipeline = [...basePipeline];
    countPipeline.push({ $count: "total" });

    const dataPipeline = [...basePipeline];

    // Apply pagination
    if (offset > 0) {
        dataPipeline.push({ $skip: offset });
    } else {
        const skip = (page - 1) * limit;
        dataPipeline.push({ $skip: skip });
    }

    dataPipeline.push({ $limit: limit });

    // Add projection
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

    // Execute aggregation in a transaction (optional for reads, but ensures consistency)
    const result = await withTransaction(async (session) => {
        const [countResult, reviews] = await Promise.all([
            ReviewModel.aggregate(countPipeline).session(session),
            ReviewModel.aggregate(dataPipeline).session(session)
        ]);

        const total = countResult[0]?.total || 0;

        // Format dates to ISO strings and convert ObjectIds
        const formattedReviews = reviews.map(review => {
            const formatted = {
                ...review,
                _id: review._id.toString(),
                tourId: review.tourId?.toString() || null,
                userId: review.userId?.toString() || null,
                travelDate: review.travelDate ? new Date(review.travelDate).toISOString() : null,
                createdAt: review.createdAt ? new Date(review.createdAt).toISOString() : null,
                updatedAt: review.updatedAt ? new Date(review.updatedAt).toISOString() : null,
                deletedAt: review.deletedAt ? new Date(review.deletedAt).toISOString() : null,
                tourHeroImage: review.tourHeroImage?.toString() || null,
                userAvatar: review.userAvatar?.toString() || null
            };

            return {
                _id: formatted._id,
                tourId: formatted.tourId,
                tourTitle: formatted.tourTitle || null,
                userId: formatted.userId,
                userName: formatted.userName || null,
                rating: formatted.rating,
                title: formatted.title || null,
                comment: formatted.comment,
                imageCount: formatted.images?.length || 0,
                tripType: formatted.tripType || null,
                travelDate: formatted.travelDate,
                isApproved: formatted.isApproved,
                helpfulCount: formatted.helpfulCount || 0,
                createdAt: formatted.createdAt,
                updatedAt: formatted.updatedAt,
                deletedAt: formatted.deletedAt,
                userAvatar: formatted.userAvatar,
                userEmail: formatted.userEmail,
                tourSlug: formatted.tourSlug,
                tourHeroImage: formatted.tourHeroImage,
                isExpanded: false
            };
        });

        // Calculate pagination info
        const totalPages = Math.ceil(total / limit);
        const currentPage = offset > 0 ? Math.floor(offset / limit) + 1 : page;

        return {
            docs: formattedReviews,
            total,
            page: currentPage,
            pages: totalPages
        };
    });

    return {
        data: result,
        status: 200
    };

});