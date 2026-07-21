// /app/api/operations/reviews/v1/[reviewId]/replies/route.ts

import { NextRequest } from "next/server";
import mongoose, { Types } from "mongoose";
import { z } from "zod";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import UserModel from "@/models/user.model";
import { ReviewModel } from "@/models/tours/review.model";
import { buildTourReviewDTO } from "@/lib/build-responses/build-tour-review-dto";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { USER_ROLE } from "@/constants/current-user/user.const";
import { AUDIT_ACTION, logAuditForActor } from "@/lib/audit/audit-logger";

// Validation schema for request body
const ReplySchema = z.object({
    message: z
        .string()
        .min(1, "Message is required")
        .max(1000, "Message cannot exceed 1000 characters")
        .trim(),
});

// Define route context type
interface RouteContext {
    params: Promise<{
        reviewId: string;
    }>;
}

/**
 * POST /api/operations/reviews/v1/[reviewId]/replies
 * Add a reply to a review — accessible by guide and assistant users
 */
export const POST = withErrorHandler(
    async (req: NextRequest, { params }: RouteContext) => {
        const reviewId = decodeURIComponent((await params).reviewId);

        // 1. Authentication & Authorization
        const userId = await getUserIdFromSession();
        if (!userId) {
            throw new ApiError("Unauthorized", 401);
        }

        // Allow both guide and assistant roles to reply
        const user = await UserModel.findById(userId).select("role").lean();
        if (!user || ![USER_ROLE.GUIDE, USER_ROLE.ASSISTANT].includes(user.role as typeof USER_ROLE[keyof typeof USER_ROLE])) {
            throw new ApiError(
                "Only guide or assistant users can reply to reviews",
                403
            );
        }

        // 2. Validate request body
        const body = (await req.json()) as { message: string };
        const validation = ReplySchema.safeParse(body);

        if (!validation.success) {
            throw new ApiError(
                `Validation failed: ${validation.error.issues[0]?.message || "Invalid input"}`,
                400
            );
        }

        const { message } = validation.data;

        // 3. Validate reviewId format
        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            throw new ApiError("Invalid review ID format", 400);
        }

        const reviewObjectId = new mongoose.Types.ObjectId(reviewId);
        // author is the User._id — aligns with reply.author field in the model
        const authorObjectId = new mongoose.Types.ObjectId(userId);

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
                throw new ApiError("Cannot reply to an unapproved review", 400);
            }

            // Add reply using instance method (author = User._id)
            await review.addReply(authorObjectId, message, session);

            // Fetch updated review with populated data
            const updatedReview = await buildTourReviewDTO(reviewId, false, session);

            if (!updatedReview) {
                throw new ApiError("Failed to fetch updated review", 500);
            }

            return updatedReview;
        });

        await logAuditForActor(userId, {
            targetModel: "Review",
            target: reviewId,
            action: AUDIT_ACTION.UPDATE,
            note: "Added review reply",
        });

        return {
            data: result,
            status: 201,
        };
    }
);