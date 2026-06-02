// api/operations/reviews/v1/[reviewId]/replies/[replyId]/route.ts

import { EMPLOYEE_ROLE } from "@/constants/employee/employee.const";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { buildTourReviewDTO } from "@/lib/build-responses/build-tour-review-dto";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import EmployeeModel from "@/models/employees/employees.model";
import { ReviewModel } from "@/models/tours/review.model";
import { Types } from "mongoose";
import { NextRequest } from "next/server";
import z from "zod";
import { AUDIT_ACTION, logAuditForActor } from "@/lib/audit/audit-logger";

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
 * PATCH /api/reviews/[reviewId]/replies
 * Update a reply to a review
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

        // Get employee from session
        const [employee] = await EmployeeModel.aggregate([
            {
                $match: { user: new Types.ObjectId(userId) },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
            {
                $match: { "user.role": EMPLOYEE_ROLE.ASSISTANT },
            },
            {
                $project: { _id: 1, name: 1 },
            },
        ]);

        if (!employee) {
            throw new ApiError(
                "Only assistant employees can update replays",
                403
            );
        }

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

            // Check if employee is the owner of the reply
            if (!reply.employee.equals(employee._id)) {
                throw new ApiError("You can only update your own replies", 403);
            }

            // Check if reply is rejected (if rejection prevents updates)
            if (reply.rejectedAt && !reply.isApproved) {
                throw new ApiError("Cannot update a rejected reply", 400);
            }

            // Update the reply using the new instance method
            await review.updateReply(replyObjectId, message, session);

            // Fetch the updated reply
            const updatedReview = await ReviewModel.findById(reviewObjectId)
                .populate({
                    path: "replies.employee",
                    select: "_id name"
                })
                .session(session);

            if (!updatedReview) {
                throw new ApiError("Failed to fetch updated review", 500);
            }

            const updatedReply = updatedReview.replies.id(replyObjectId);
            if (!updatedReply) {
                throw new ApiError("Failed to fetch updated reply", 500);
            }

            // Convert to DTO
            const replyDTO = await buildTourReviewDTO(reviewId, false, session)

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
 * Delete a reply (soft delete)
 * 
 * Response:
 * {
 *   data: { success: true };
 * }
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

        // Get employee from session
        const [employee] = await EmployeeModel.aggregate([
            {
                $match: { user: new Types.ObjectId(userId) },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
            {
                $match: { "user.role": EMPLOYEE_ROLE.ASSISTANT },
            },
            {
                $project: { _id: 1, name: 1 },
            },
        ]);

        if (!employee) {
            throw new ApiError(
                "Only assistant employees can update replays",
                403
            );
        }

        // 2. Validate IDs format
        if (!Types.ObjectId.isValid(reviewId) || !Types.ObjectId.isValid(replyId)) {
            throw new ApiError("Invalid review ID or reply ID format", 400);
        }

        const reviewObjectId = new Types.ObjectId(reviewId);
        const replyObjectId = new Types.ObjectId(replyId);
        const employeeObjectId = new Types.ObjectId(employee._id);

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

            // Check if employee is the owner of the reply (or has admin rights)
            if (!reply.employee.equals(employeeObjectId)) {
                // Optional: Check if user has admin/moderation permissions
                // For now, only allow owners to delete
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