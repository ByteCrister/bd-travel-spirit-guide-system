import { Types, ClientSession, HydratedDocument, Query } from "mongoose";
import { ReviewDetailDTO } from "@/types/tour/reviews.types";
import { PopulatedAssetLean } from "@/types/common/populated-asset.types";
import { IReview, ReviewModel } from "@/models/tours/review.model";
import TourModel from "@/models/tours/tour.model";
import AssetModel from "@/models/assets/asset.model";
import AssetFileModel from "@/models/assets/asset-file.model";
import { TravelerModel } from "@/models/travelers/traveler.model";
import UserModel from "@/models/user.model";
import EmployeeModel from "@/models/employees/employees.model";

// Helper types for populated fields
export type PopulatedUser = {
    _id: Types.ObjectId;
    email: string;
    name?: string;
    avatar?: PopulatedAssetLean;
};

export type PopulatedTraveler = {
    _id: Types.ObjectId;
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
        let query: ReviewQuery = ReviewModel.findById(reviewId) as ReviewQuery;

        // Populate tour with heroImage
        query = query.populate<{ tour: PopulatedTour }>({
            path: "tour",
            select: "title slug heroImage",
            model: TourModel,
            populate: {
                path: "heroImage",
                model: AssetModel,
                select: "file",
                populate: {
                    path: "file",
                    model: AssetFileModel,
                    select: "publicUrl",
                },
            },
        }) as ReviewQuery;

        // Populate traveler -> user -> avatar
        query = query.populate<{ user: PopulatedTraveler }>({
            path: "user", // Traveler
            select: "user",
            model: TravelerModel,
            populate: {
                path: "user", // nested UserModel
                model: UserModel,
                select: "name email avatar",
                populate: {
                    path: "avatar",
                    model: AssetModel,
                    select: "file",
                    populate: {
                        path: "file",
                        model: AssetFileModel,
                        select: "publicUrl",
                    },
                },
            },
        }) as ReviewQuery;

        // Populate review images
        query = query.populate<{ images: PopulatedAssetLean[] }>({
            path: "images",
            model: AssetModel,
            select: "file",
            populate: {
                path: "file",
                model: AssetFileModel,
                select: "publicUrl",
            },
        }) as ReviewQuery;

        // Populate replies' employee
        query = query.populate<{ replies: PopulatedReviewReply[] }>({
            path: "replies.employee",
            model: EmployeeModel,
            select: "_id name",
        }) as ReviewQuery;

        if (!withDeleted) query = query.where({ deletedAt: null });
        if (session) query = query.session(session);

        const review = await query.lean<PopulatedReview>().exec();
        if (!review) return null;

        const getAssetUrl = (asset?: PopulatedAssetLean): string | null => asset?.file?.publicUrl || null;
        const toObjectIdString = (id: Types.ObjectId | string): string =>
            id instanceof Types.ObjectId ? id.toString() : id;

        // Flatten user info
        const user = review.user?.user;

        const reviewDetail: ReviewDetailDTO = {
            _id: toObjectIdString(review._id as Types.ObjectId),
            tourId: toObjectIdString(review.tour._id),
            tourTitle: review.tour.title || undefined,
            tourSlug: review.tour.slug || null,
            tourHeroImage: getAssetUrl(review.tour.heroImage),
            userId: user ? toObjectIdString(user._id) : '-',
            userName: user?.name || undefined,
            userEmail: user?.email || null,
            userAvatar: getAssetUrl(user?.avatar),
            rating: review.rating,
            title: review.title || null,
            comment: review.comment,
            imageCount: review.images.length,
            imageUrls: review.images.map(img => getAssetUrl(img)).filter(Boolean) as string[],
            tripType: review.tripType || null,
            travelDate: review.travelDate?.toISOString() || null,
            isApproved: review.isApproved,
            helpfulCount: review.helpfulCount,
            createdAt: review.createdAt.toISOString(),
            updatedAt: review.updatedAt.toISOString(),
            deletedAt: review.deletedAt?.toISOString() || null,
            replies: review.replies.map(reply => ({
                _id: toObjectIdString(reply._id),
                employeeId:
                    reply.employee && typeof reply.employee === "object" && "_id" in reply.employee
                        ? toObjectIdString(reply.employee._id)
                        : toObjectIdString(reply.employee as Types.ObjectId),
                message: reply.message,
                isApproved: reply.isApproved,
                createdAt: reply.createdAt.toISOString(),
                updatedAt: reply.updatedAt.toISOString(),
                deletedAt: reply.deletedAt?.toISOString() || null,
            })),
        };

        return reviewDetail;
    } catch (error) {
        console.error("Error fetching review detail:", error);
        throw error;
    }
}