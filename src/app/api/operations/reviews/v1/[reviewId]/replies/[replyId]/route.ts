// api/operations/reviews/v1/[reviewId]/replies/[replyId]/route.ts

import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { buildTourReviewDTO } from "@/lib/build-responses/build-tour-review-dto";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import UserModel from "@/models/user.model";
import { ReviewModel } from "@/models/tours/review.model";
import { Types } from "mongoose";
import { NextRequest } from "next/server";
import z from "zod";
import { AUDIT_ACTION, logAuditForActor } from "@/lib/audit/audit-logger";
import { USER_ROLE } from "@/constants/current-user/user.const";

// Validation schema for request body
const UpdateReplySchema = z.object({
    message: z.string()
        .min(1, "Message is required")
        .max(1000, "Message cannot exceed 1000 characters")
        .trim(),
});

// Define route context type
interface Params {
    params: Promise<{
        reviewId: string;
        replyId: string;
    }>;
}

/**
 * Helper: validate that the current session user is a guide or assistant.
 * Returns the User._id as an ObjectId.
 */
async function resolveAuthor(userId: string): Promise<Types.ObjectId> {
    const user = await UserModel.findById(userId).select("role").lean();
    if (
        !user ||
        ![USER_ROLE.GUIDE, USER_ROLE.ASSISTANT].includes(
            user.role as typeof USER_ROLE[keyof typeof USER_ROLE]
        )
    ) {
        throw new ApiError("Only guide or assistant users can manage replies", 403);
    }
    return new Types.ObjectId(userId);
}

/**
 * PATCH /api/reviews/[reviewId]/replies/[replyId]
 * Update a reply — guide and assistant only, reply owner only
 */
export const PATCH = withErrorHandler(
    async (req: NextRequest, { params }: Params) => {

        const reviewId = decodeURIComponent((await params).reviewId);
        const replyId = decodeURIComponent((await params).replyId);

        // 1. Authentication & Authorization
        const userId = await getUserIdFromSession();
        if (!userId) {
            throw new ApiError("Unauthorized", 401);
        }

        const authorObjectId = await resolveAuthor(userId);

        // 2. Validate request body
        const body = await req.json() as { replyId: string; message: string };
        const validation = UpdateReplySchema.safeParse({ message: body.message });

        if (!validation.success) {
            throw new ApiError(
                `Validation failed: ${validation.error.issues[0]?.message || "Invalid input"}`,
                400
            );
        }

        const { message } = validation.data;

        // 3. Validate IDs format
        if (!Types.ObjectId.isValid(reviewId) || !Types.ObjectId.isValid(replyId)) {
            throw new ApiError("Invalid review ID or reply ID format", 400);
        }

        const reviewObjectId = new Types.ObjectId(reviewId);
        const replyObjectId = new Types.ObjectId(replyId);

        // 4. Execute in transaction for data consistency
        const result = await withTransaction(async (session) => {
            // Find the review (including soft-deleted check)
            const review = await ReviewModel.findOne({
                _id: reviewObjectId,
                deletedAt: null,
            }).session(session);

            if (!review) {
                throw new ApiError("Review not found", 404);
            }

            // Check if review is approved
            if (!review.isApproved) {
                throw new ApiError("Cannot update reply on an unapproved review", 400);
            }

            // Find the specific reply
            const reply = review.replies.id(replyObjectId);
            if (!reply) {
                throw new ApiError("Reply not found", 404);
            }

            // Check if reply is deleted
            if (reply.deletedAt) {
                throw new ApiError("Cannot update a deleted reply", 400);
            }

            // Check if the current user is the author of the reply
            if (!reply.author.equals(authorObjectId)) {
                throw new ApiError("You can only update your own replies", 403);
            }

            // Check if reply is rejected
            if (reply.rejectedAt && !reply.isApproved) {
                throw new ApiError("Cannot update a rejected reply", 400);
            }

            // Update the reply using the instance method
            await review.updateReply(replyObjectId, message, session);

            // Fetch the updated review DTO
            const replyDTO = await buildTourReviewDTO(reviewId, false, session);
            return replyDTO;
        });

        await logAuditForActor(userId, {
            targetModel: "Review",
            target: reviewId,
            action: AUDIT_ACTION.UPDATE,
            note: `Updated review reply ${replyId}`,
        });

        return {
            data: result,
            status: 200,
        };
    }
);

/**
 * DELETE /api/reviews/[reviewId]/replies/[replyId]
 * Soft-delete a reply — guide and assistant only, reply owner only
 */
export const DELETE = withErrorHandler(
    async (req: NextRequest, { params }: Params) => {
        const reviewId = decodeURIComponent((await params).reviewId);
        const replyId = decodeURIComponent((await params).replyId);

        // 1. Authentication & Authorization
        const userId = await getUserIdFromSession();
        if (!userId) {
            throw new ApiError("Unauthorized", 401);
        }

        const authorObjectId = await resolveAuthor(userId);

        // 2. Validate IDs format
        if (!Types.ObjectId.isValid(reviewId) || !Types.ObjectId.isValid(replyId)) {
            throw new ApiError("Invalid review ID or reply ID format", 400);
        }

        const reviewObjectId = new Types.ObjectId(reviewId);
        const replyObjectId = new Types.ObjectId(replyId);

        // 3. Check for optional reason in query parameters
        const url = new URL(req.url);
        const reason = url.searchParams.get('reason') || undefined;

        // 4. Execute in transaction for data consistency
        await withTransaction(async (session) => {
            // Find the review
            const review = await ReviewModel.findOne({
                _id: reviewObjectId,
                deletedAt: null,
            }).session(session);

            if (!review) {
                throw new ApiError("Review not found", 404);
            }

            // Find the specific reply
            const reply = review.replies.id(replyObjectId);
            if (!reply) {
                throw new ApiError("Reply not found", 404);
            }

            // Check if reply is already deleted
            if (reply.deletedAt) {
                throw new ApiError("Reply is already deleted", 400);
            }

            // Check if the current user is the author of the reply
            if (!reply.author.equals(authorObjectId)) {
                throw new ApiError("You can only delete your own replies", 403);
            }

            // Soft delete the reply using existing instance method
            await review.deleteReply(replyObjectId, reason, session);
        });

        await logAuditForActor(userId, {
            targetModel: "Review",
            target: reviewId,
            action: AUDIT_ACTION.UPDATE,
            note: `Deleted review reply ${replyId}`,
        });

        return {
            data: { success: true },
            status: 200,
        };
    }
);