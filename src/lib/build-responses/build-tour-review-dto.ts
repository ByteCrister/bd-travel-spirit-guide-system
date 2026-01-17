// /lib/api/reviews/getReviewDetail.ts (with proper typing)
import { Types, ClientSession, HydratedDocument, Query } from "mongoose";
import { ReviewDetailDTO } from "@/types/reviews.types";
import { PopulatedAssetLean } from "@/types/populated-asset.types";
import { IReview, ReviewModel } from "@/models/tours/review.model";

// Helper types for populated fields
export type PopulatedUser = {
    _id: Types.ObjectId;
    email: string;
    name?: string;
};

export type PopulatedTraveler = {
    _id: Types.ObjectId;
    avatar?: PopulatedAssetLean;
    user?: PopulatedUser;
};

export type PopulatedTour = {
    _id: Types.ObjectId;
    title?: string;
    slug?: string;
    heroImage?: PopulatedAssetLean;
};

export type PopulatedEmployee = {
    _id: Types.ObjectId;
    name: string;
};

export type PopulatedReviewReply = {
    _id: Types.ObjectId;
    employee: PopulatedEmployee | Types.ObjectId;
    message: string;
    isApproved: boolean;
    approvedAt?: Date | null;
    rejectedAt?: Date | null;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    deletedReason?: string;
};

export type PopulatedReview = Omit<IReview, "tour" | "user" | "images" | "replies" | "helpfulVotes"> & {
    tour: PopulatedTour;
    user: PopulatedTraveler;
    images: PopulatedAssetLean[];
    replies: PopulatedReviewReply[];
};

// Define the return type of our query
type ReviewQuery = Query<
    HydratedDocument<PopulatedReview> | null,
    HydratedDocument<PopulatedReview>,
    object,
    PopulatedReview
>;

export async function buildTourReviewDTO(
    reviewId: string,
    withDeleted?: boolean,
    session?: ClientSession
): Promise<ReviewDetailDTO | null> {
    try {
        // Create properly typed query with method chaining
        let query: ReviewQuery = ReviewModel.findById(reviewId) as ReviewQuery;

        // Apply population with proper typing - tour
        query = query.populate<{ tour: PopulatedTour }>({
            path: "tour",
            select: "title slug heroImage",
            model: "Tour",
            populate: {
                path: "heroImage",
                model: "Asset",
                select: "file",
                populate: {
                    path: "file",
                    model: "AssetFile",
                    select: "publicUrl"
                }
            }
        }) as ReviewQuery;

        // Apply population - user with nested population
        query = query.populate<{ user: PopulatedTraveler }>({
            path: "user",
            select: "avatar user",
            model: "Traveler",
            populate: [
                {
                    path: "avatar",
                    model: "Asset",
                    select: "file",
                    populate: {
                        path: "file",
                        model: "AssetFile",
                        select: "publicUrl"
                    }
                },
                {
                    path: "user",
                    model: "User",
                    select: "email name"
                }
            ]
        }) as ReviewQuery;

        // Apply population - images
        query = query.populate<{ images: PopulatedAssetLean[] }>({
            path: "images",
            model: "Asset",
            select: "file",
            populate: {
                path: "file",
                model: "AssetFile",
                select: "publicUrl"
            }
        }) as ReviewQuery;

        // Apply population - replies.employee
        query = query.populate<{ replies: PopulatedReviewReply[] }>({
            path: "replies.employee",
            model: "Employee",
            select: "_id name"
        }) as ReviewQuery;

        // Handle soft-deleted reviews
        if (!withDeleted) {
            query = query.where({ deletedAt: null });
        }

        // Apply session if provided
        if (session) {
            query = query.session(session);
        }

        // Execute the query and get plain object
        const review = await query.lean<PopulatedReview>().exec();

        if (!review) {
            return null;
        }

        // Helper function to safely get public URL from asset
        const getAssetUrl = (asset?: PopulatedAssetLean): string | null => {
            return asset?.file?.publicUrl || null;
        };

        // Helper function to safely extract ObjectId as string
        const toObjectIdString = (id: Types.ObjectId | string): string => {
            return id instanceof Types.ObjectId ? id.toString() : id;
        };

        // Transform the data to ReviewDetailDTO
        const reviewDetail: ReviewDetailDTO = {
            _id: toObjectIdString(review._id as Types.ObjectId),
            tourId: toObjectIdString(review.tour._id),
            tourTitle: review.tour.title || undefined,
            userId: toObjectIdString(review.user._id),
            userName: review.user.user?.name || undefined,
            rating: review.rating,
            title: review.title || null,
            comment: review.comment,
            imageCount: review.images.length,
            tripType: review.tripType  || null,
            travelDate: review.travelDate?.toISOString() || null,
            isApproved: review.isApproved,
            helpfulCount: review.helpfulCount,
            createdAt: review.createdAt.toISOString(),
            updatedAt: review.updatedAt.toISOString(),
            deletedAt: review.deletedAt?.toISOString() || null,
            
            replies: review.replies.map(reply => ({
                _id: toObjectIdString(reply._id),
                employeeId: toObjectIdString(
                    reply.employee && typeof reply.employee === 'object' && '_id' in reply.employee 
                        ? reply.employee._id 
                        : reply.employee as Types.ObjectId
                ),
                message: reply.message,
                isApproved: reply.isApproved,
                createdAt: reply.createdAt.toISOString(),
                updatedAt: reply.updatedAt.toISOString(),
                deletedAt: reply.deletedAt?.toISOString() || null
            })),
            
            userAvatar: getAssetUrl(review.user.avatar),
            userEmail: review.user.user?.email || null,
            tourSlug: review.tour.slug || null,
            tourHeroImage: getAssetUrl(review.tour.heroImage),
            imageUrls: review.images.map(img => getAssetUrl(img)).filter(Boolean) as string[],
        };

        return reviewDetail;
    } catch (error) {
        console.error("Error fetching review detail:", error);
        throw error;
    }
}