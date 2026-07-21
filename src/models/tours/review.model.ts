// models/review.model.ts

import mongoose, {
    Schema,
    Document,
    Types,
    Query,
    FilterQuery,
    CallbackWithoutResultAndOptionalError,
    ClientSession,
    Model,
} from "mongoose";
import { TRAVEL_TYPE, TravelType } from "@/constants/tour/tour.const";
import { defineModel } from "@/lib/helpers/defineModel";
import TourModel from "./tour.model";

export interface IReviewReply {
    _id: Types.ObjectId;
    author: Types.ObjectId; // User who replied (guide or assistant)
    message: string;
    isApproved: boolean;
    approvedAt?: Date | null;
    rejectedAt?: Date | null;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    deletedReason?: string;
}

const ReviewReplySchema = new Schema<IReviewReply>(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: "User", // guide or assistant — any User with management access
            required: true,
            index: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        isApproved: {
            type: Boolean,
            default: true,
            index: true,
        },
        approvedAt: {
            type: Date,
            default: null,
            index: true
        },
        rejectedAt: {
            type: Date,
            default: null,
            index: true
        },
        rejectionReason: {
            type: String,
            trim: true,
            maxlength: 500
        },
        deletedAt: {
            type: Date,
            default: null,
            index: true
        },
        deletedReason: {
            type: String,
            trim: true,
            maxlength: 500
        },
    },
    {
        timestamps: true,
        _id: true,
    }
);

////////////////////////////////////////////////////////////////////////////////
// HELPFUL VOTES INTERFACE
////////////////////////////////////////////////////////////////////////////////

export interface IHelpfulVote {
    user: Types.ObjectId; // User who voted
    helpful: boolean; // true for helpful, false for not helpful (if you want both options)
    createdAt: Date;
    updatedAt: Date;
}

const HelpfulVoteSchema = new Schema<IHelpfulVote>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "Traveler",
            required: true,
            index: true,
        },
        helpful: {
            type: Boolean,
            required: true,
            default: true,
        },
    },
    {
        timestamps: true,
        _id: false, // No need for separate _id for votes
    }
);

////////////////////////////////////////////////////////////////////////////////
// INTERFACE: The shape of a Review document
////////////////////////////////////////////////////////////////////////////////

export interface IReview extends Document {
    tour: Types.ObjectId;
    user: Types.ObjectId;
    rating: number;
    title?: string;
    comment: string;
    images: Types.ObjectId[];
    tripType?: TravelType;
    travelDate?: Date;
    isApproved: boolean;
    helpfulCount: number;
    deletedAt?: Date | null;
    approvedAt?: Date | null;
    rejectedAt?: Date | null;
    rejectionReason?: string;
    deletedReason?: string;

    // Track helpful votes
    helpfulVotes: Types.DocumentArray<IHelpfulVote>;

    replies: Types.DocumentArray<IReviewReply>;

    createdAt: Date;
    updatedAt: Date;

    // Instance methods    
    approve(session?: ClientSession): Promise<this>;
    reject(reason: string, session?: ClientSession): Promise<this>;
    deleteReview(reason?: string, session?: ClientSession): Promise<this>;
    restore(session?: ClientSession): Promise<this>;
    addReply(
        authorId: Types.ObjectId,
        message: string,
        session?: ClientSession
    ): Promise<this>;
    updateReply(
        replayId: Types.ObjectId,
        message: string,
        session?: ClientSession
    ): Promise<this>;
    approveReply(
        replyId: Types.ObjectId,
        session?: ClientSession
    ): Promise<this>;
    rejectReply(
        replyId: Types.ObjectId,
        reason: string,
        session?: ClientSession
    ): Promise<this>;
    deleteReply(
        replyId: Types.ObjectId,
        reason?: string,
        session?: ClientSession
    ): Promise<this>;
    restoreReply(
        replyId: Types.ObjectId,
        session?: ClientSession
    ): Promise<this>;
}

////////////////////////////////////////////////////////////////////////////////
// MODEL INTERFACE with static methods
////////////////////////////////////////////////////////////////////////////////

export interface IReviewModel extends Model<IReview> {
    paginate(
        filter: FilterQuery<IReview>,
        options: { page?: number; limit?: number }
    ): Promise<{
        docs: IReview[];
        total: number;
        page: number;
        pages: number;
    }>;

    // Static methods for helpful votes
    markHelpful(
        reviewId: Types.ObjectId,
        userId: Types.ObjectId,
        session?: ClientSession
    ): Promise<{ helpfulCount: number; userVote: boolean }>;

    unmarkHelpful(
        reviewId: Types.ObjectId,
        userId: Types.ObjectId,
        session?: ClientSession
    ): Promise<{ helpfulCount: number; userVote: boolean }>;

    toggleHelpful(
        reviewId: Types.ObjectId,
        userId: Types.ObjectId,
        session?: ClientSession
    ): Promise<{ helpfulCount: number; userVote: boolean }>;

}

////////////////////////////////////////////////////////////////////////////////
// SCHEMA DEFINITION
////////////////////////////////////////////////////////////////////////////////

const ReviewSchema = new Schema<IReview, IReviewModel>(
    {
        tour: {
            type: Schema.Types.ObjectId,
            ref: "Tour",
            required: true,
            index: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "Traveler",
            required: true,
            index: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
            index: true,
        },
        title: { type: String, trim: true, maxlength: 100 },
        comment: { type: String, required: true, trim: true },
        images: [{ type: Schema.Types.ObjectId, ref: "Asset" }],
        tripType: { type: String, enum: Object.values(TRAVEL_TYPE) },
        travelDate: { type: Date, index: true },
        isApproved: { type: Boolean, default: true, index: true },
        approvedAt: {
            type: Date,
            default: null,
            index: true
        },
        rejectedAt: {
            type: Date,
            default: null,
            index: true
        },
        rejectionReason: {
            type: String,
            trim: true,
            maxlength: 500
        },
        replies: {
            type: [ReviewReplySchema],
            default: [],
        },
        helpfulCount: {
            type: Number,
            default: 0,
            min: 0,
            index: true
        },
        helpfulVotes: {
            type: [HelpfulVoteSchema],
            default: [],
        },
        deletedAt: {
            type: Date,
            default: null,
            index: true
        },
        deletedReason: {
            type: String,
            trim: true,
            maxlength: 500
        },
    },
    {
        timestamps: true,
        versionKey: "__v",
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

////////////////////////////////////////////////////////////////////////////////
// INDEXES
////////////////////////////////////////////////////////////////////////////////

ReviewSchema.index({ tour: 1, user: 1 }, { unique: true });
ReviewSchema.index({ tour: 1, rating: -1 });
ReviewSchema.index({ tour: 1, helpfulCount: -1 });
ReviewSchema.index({ isApproved: 1, createdAt: -1 });

// Compound index for efficient helpful vote queries
ReviewSchema.index({ "helpfulVotes.createdAt": -1 });

////////////////////////////////////////////////////////////////////////////////
// EXISTING INSTANCE METHODS (keep all previous methods)
////////////////////////////////////////////////////////////////////////////////

/**
 * Approve a review
 */
ReviewSchema.methods.approve = async function (
    this: IReview,
    session?: ClientSession
): Promise<IReview> {
    this.isApproved = true;
    this.approvedAt = new Date();
    this.rejectedAt = null;
    this.rejectionReason = undefined;

    const options = session ? { session } : {};
    await this.save(options);

    // Recalculate average rating for the tour
    await recalcAverageRating(this, session);

    return this;
};

/**
 * Reject a review with reason
 */
ReviewSchema.methods.reject = async function (
    this: IReview,
    reason: string,
    session?: ClientSession
): Promise<IReview> {
    this.isApproved = false;
    this.rejectedAt = new Date();
    this.rejectionReason = reason;
    this.approvedAt = null;

    const options = session ? { session } : {};
    await this.save(options);

    // Recalculate average rating for the tour
    await recalcAverageRating(this, session);

    return this;
};

/**
 * Soft delete a review with optional reason
 */
ReviewSchema.methods.deleteReview = async function (
    this: IReview,
    reason?: string,
    session?: ClientSession
): Promise<IReview> {
    this.deletedAt = new Date();
    this.deletedReason = reason;

    const options = session ? { session } : {};
    await this.save(options);

    // Recalculate average rating for the tour
    await recalcAverageRating(this, session);

    return this;
};

/**
 * Restore a soft-deleted review
 */
ReviewSchema.methods.restore = async function (
    this: IReview,
    session?: ClientSession
): Promise<IReview> {
    this.deletedAt = null;
    this.deletedReason = undefined;

    const options = session ? { session } : {};
    await this.save(options);

    // Recalculate average rating for the tour
    await recalcAverageRating(this, session);

    return this;
};

/**
 * Add a reply to the review
 */
ReviewSchema.methods.addReply = async function (
    this: IReview,
    authorId: Types.ObjectId,
    message: string,
    session?: ClientSession
): Promise<IReview> {
    const newReply = {
        _id: new mongoose.Types.ObjectId(),
        author: authorId,
        message,
        isApproved: true,
        approvedAt: new Date(),
        rejectedAt: null,
        rejectionReason: undefined,
        deletedAt: null,
        deletedReason: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    this.replies.push(newReply);

    const options = session ? { session } : {};
    await this.save(options);

    return this;
};

/**
 * Update an existing reply
 */
ReviewSchema.methods.updateReply = async function (
    this: IReview,
    replyId: Types.ObjectId,
    message: string,
    session?: ClientSession
): Promise<IReview> {
    const replies = this.replies as Types.DocumentArray<IReviewReply> & {
        id(id: Types.ObjectId): IReviewReply | null;
    };

    const reply = replies.id(replyId);
    if (!reply) {
        throw new Error("Reply not found");
    }

    // Update the reply message
    reply.message = message;
    reply.updatedAt = new Date();

    // Optional: for reset approval status when a reply is updated
    // reply.isApproved = false;
    // reply.approvedAt = null;
    // reply.rejectedAt = null;
    // reply.rejectionReason = undefined;

    const options = session ? { session } : {};
    await this.save(options);

    return this;
};

/**
 * Approve a specific reply
 */
ReviewSchema.methods.approveReply = async function (
    this: IReview,
    replyId: Types.ObjectId,
    session?: ClientSession
): Promise<IReview> {
    const replies = this.replies as Types.DocumentArray<IReviewReply> & {
        id(id: Types.ObjectId): IReviewReply | null;
    };

    const reply = replies.id(replyId);
    if (!reply) {
        throw new Error("Reply not found");
    }

    reply.isApproved = true;
    reply.approvedAt = new Date();
    reply.rejectedAt = null;
    reply.rejectionReason = undefined;
    reply.updatedAt = new Date();

    const options = session ? { session } : {};
    await this.save(options);

    return this;
};

/**
 * Reject a specific reply with reason
 */
ReviewSchema.methods.rejectReply = async function (
    this: IReview,
    replyId: Types.ObjectId,
    reason: string,
    session?: ClientSession
): Promise<IReview> {
    const replies = this.replies as Types.DocumentArray<IReviewReply> & {
        id(id: Types.ObjectId): IReviewReply | null;
    };

    const reply = replies.id(replyId);
    if (!reply) {
        throw new Error("Reply not found");
    }

    reply.isApproved = false;
    reply.rejectedAt = new Date();
    reply.rejectionReason = reason;
    reply.approvedAt = null;
    reply.updatedAt = new Date();

    const options = session ? { session } : {};
    await this.save(options);

    return this;
};

/**
 * Delete a specific reply with optional reason
 */
ReviewSchema.methods.deleteReply = async function (
    this: IReview,
    replyId: Types.ObjectId,
    reason?: string,
    session?: ClientSession
): Promise<IReview> {
    const replies = this.replies as Types.DocumentArray<IReviewReply> & {
        id(id: Types.ObjectId): IReviewReply | null;
    };

    const reply = replies.id(replyId);
    if (!reply) {
        throw new Error("Reply not found");
    }

    reply.deletedAt = new Date();
    reply.deletedReason = reason;
    reply.updatedAt = new Date();

    const options = session ? { session } : {};
    await this.save(options);

    return this;
};

/**
 * Restore a deleted reply
 */
ReviewSchema.methods.restoreReply = async function (
    this: IReview,
    replyId: Types.ObjectId,
    session?: ClientSession
): Promise<IReview> {
    const replies = this.replies as Types.DocumentArray<IReviewReply> & {
        id(id: Types.ObjectId): IReviewReply | null;
    };

    const reply = replies.id(replyId);
    if (!reply) {
        throw new Error("Reply not found");
    }

    reply.deletedAt = null;
    reply.deletedReason = undefined;
    reply.updatedAt = new Date();

    const options = session ? { session } : {};
    await this.save(options);

    return this;
};

////////////////////////////////////////////////////////////////////////////////
// STATIC METHODS
////////////////////////////////////////////////////////////////////////////////

interface PaginateResult<T> {
    docs: T[];
    total: number;
    page: number;
    pages: number;
}

/**
 * Fetches paginated reviews based on filter, page, and limit.
 */
ReviewSchema.statics.paginate = async function (
    filter: FilterQuery<IReview>,
    options: { page?: number; limit?: number } = {}
): Promise<PaginateResult<IReview>> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
        this.find(filter).skip(skip).limit(limit),
        this.countDocuments(filter),
    ]);

    return {
        docs,
        total,
        page,
        pages: Math.ceil(total / limit),
    };
};

/**
 * Mark a review as helpful (static method)
 */
ReviewSchema.statics.markHelpful = async function (
    reviewId: Types.ObjectId,
    userId: Types.ObjectId,
    session?: ClientSession
): Promise<{ helpfulCount: number; userVote: boolean }> {
    const options = session ? { session } : {};

    // Use atomic update to prevent race conditions
    const review = await this.findOneAndUpdate(
        {
            _id: reviewId,
            "helpfulVotes.user": { $ne: userId } // User hasn't voted yet
        },
        {
            $push: {
                helpfulVotes: {
                    user: userId,
                    helpful: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            },
            $inc: { helpfulCount: 1 }
        },
        {
            new: true,
            ...options
        }
    );

    if (review) {
        return {
            helpfulCount: review.helpfulCount,
            userVote: true
        };
    } else {
        // User already voted, check if it was helpful
        const existingReview = await this.findById(reviewId);
        return {
            helpfulCount: existingReview?.helpfulCount || 0,
            userVote: existingReview?.helpfulVotes.some(v =>
                v.user.equals(userId) && v.helpful
            ) || false
        };
    }
};

/**
 * Unmark a review as helpful (static method)
 */
ReviewSchema.statics.unmarkHelpful = async function (
    reviewId: Types.ObjectId,
    userId: Types.ObjectId,
    session?: ClientSession
): Promise<{ helpfulCount: number; userVote: boolean }> {
    const options = session ? { session } : {};

    // Remove the user's vote
    const review = await this.findOneAndUpdate(
        {
            _id: reviewId,
            "helpfulVotes.user": userId,
            "helpfulVotes.helpful": true
        },
        {
            $pull: {
                helpfulVotes: { user: userId }
            },
            $inc: { helpfulCount: -1 }
        },
        {
            new: true,
            ...options
        }
    );

    if (review) {
        return {
            helpfulCount: review.helpfulCount,
            userVote: false
        };
    } else {
        // User didn't have a helpful vote
        const existingReview = await this.findById(reviewId);
        return {
            helpfulCount: existingReview?.helpfulCount || 0,
            userVote: false
        };
    }
};

/**
 * Toggle helpful status (static method)
 */
ReviewSchema.statics.toggleHelpful = async function (
    reviewId: Types.ObjectId,
    userId: Types.ObjectId,
    session?: ClientSession
): Promise<{ helpfulCount: number; userVote: boolean }> {
    // First check if user already voted
    const existingReview = await this.findById(reviewId);

    if (!existingReview) {
        throw new Error("Review not found");
    }

    const hasVoted = existingReview.helpfulVotes.some(v => v.user.equals(userId));

    if (hasVoted) {
        // Toggle: if helpful, remove; if not helpful, make helpful
        const vote = existingReview.helpfulVotes.find(v => v.user.equals(userId));
        if (vote?.helpful) {
            return await this.unmarkHelpful(reviewId, userId, session);
        } else {
            // Update not helpful to helpful
            const review = await this.findOneAndUpdate(
                {
                    _id: reviewId,
                    "helpfulVotes.user": userId
                },
                {
                    $set: {
                        "helpfulVotes.$.helpful": true,
                        "helpfulVotes.$.updatedAt": new Date()
                    },
                    $inc: { helpfulCount: 1 }
                },
                {
                    new: true,
                    session
                }
            );

            return {
                helpfulCount: review?.helpfulCount || 0,
                userVote: true
            };
        }
    } else {
        // Add new helpful vote
        return await this.markHelpful(reviewId, userId, session);
    }
};

////////////////////////////////////////////////////////////////////////////////
// POST-HOOKS: Maintain Tour's averageRating
////////////////////////////////////////////////////////////////////////////////

/**
 * Recalculates and updates the parent Tour's averageRating
 */
async function recalcAverageRating(doc: IReview, session?: ClientSession) {
    const stats = await mongoose.model<IReview, IReviewModel>("Review").aggregate<{
        _id: Types.ObjectId;
        avgRating: number;
    }>([
        {
            $match: {
                tour: doc.tour,
                deletedAt: null,
                isApproved: true
            }
        },
        {
            $group: {
                _id: "$tour",
                avgRating: { $avg: "$rating" }
            }
        }
    ]);

    const avgRating = stats[0]?.avgRating ?? 0;
    const options = session ? { session } : {};
    await TourModel.findByIdAndUpdate(doc.tour, { averageRating: avgRating }, options);
}

ReviewSchema.post("save", function (doc: IReview) {
    void recalcAverageRating(doc);
});

ReviewSchema.post("findOneAndDelete", function (doc: IReview | null) {
    if (doc) {
        void recalcAverageRating(doc);
    }
});

ReviewSchema.post(
    "deleteOne",
    { document: true, query: false },
    function (this: IReview) {
        void recalcAverageRating(this);
    }
);

////////////////////////////////////////////////////////////////////////////////
// PRE-FIND MIDDLEWARE: Exclude soft-deleted documents
////////////////////////////////////////////////////////////////////////////////

ReviewSchema.pre<Query<IReview[], IReview>>(
    /^find/,
    function (
        this: Query<IReview[], IReview>,
        next: CallbackWithoutResultAndOptionalError
    ) {
        this.where({ deletedAt: null });
        next();
    }
);

////////////////////////////////////////////////////////////////////////////////
// EXPORT
////////////////////////////////////////////////////////////////////////////////

export const ReviewModel = defineModel<IReview, IReviewModel>("Review", ReviewSchema);