// /app/api/operations/reviews/v1/[reviewId]/replies/route.ts

import { NextRequest } from "next/server";
import mongoose, { Types } from "mongoose";
import { z } from "zod";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import EmployeeModel from "@/models/employees/employees.model";
import { ReviewModel } from "@/models/tours/review.model";
import { buildTourReviewDTO } from "@/lib/build-responses/build-tour-review-dto";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { EMPLOYEE_ROLE } from "@/constants/employee/employee.const";

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
 * Add a reply to a review
 */
export const POST = withErrorHandler(
    async (req: NextRequest, { params }: RouteContext) => {
        const reviewId = decodeURIComponent((await params).reviewId);

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
                "Only assistant employees can replay this review",
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
        const employeeObjectId = new mongoose.Types.ObjectId(employee._id);

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

            // Check if employee is trying to reply to their own review (if applicable)
            if (review.user.equals(employeeObjectId)) {
                throw new ApiError("Cannot reply to your own review", 400);
            }

            // Add reply using instance method
            await review.addReply(employeeObjectId, message, session);

            // Fetch updated review with populated data
            const updatedReview = await buildTourReviewDTO(reviewId, false, session);

            if (!updatedReview) {
                throw new ApiError("Failed to fetch updated review", 500);
            }

            return updatedReview;
        });

        return {
            data: result,
            status: 201,
        };
    }
);