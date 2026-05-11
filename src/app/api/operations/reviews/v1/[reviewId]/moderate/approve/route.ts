// api/operations/reviews/v1/[reviewId]/moderate/approve/route.ts
import { NextRequest } from "next/server";
import mongoose, { Types } from "mongoose";
import ConnectDB from "@/config/db";
import { ReviewModel } from "@/models/tours/review.model";
import { buildTourReviewDTO } from "@/lib/build-responses/build-tour-review-dto";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import EmployeeModel from "@/models/employees/employees.model";
import { EMPLOYEE_ROLE } from "@/constants/employee/employee.const";

// Export the wrapped handler
export const POST = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ reviewId: string }> }) => {
    const reviewId = decodeURIComponent((await params).reviewId);

    // Validate reviewId
    if (!reviewId || reviewId === "undefined" || reviewId === "null") {
        throw new ApiError("Review ID is required", 400);
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        throw new ApiError("Invalid review ID format", 400);
    }

    // Parse request body
    // const body = await request.json() as { isApproved: boolean; note: string | undefined };
    // const { note } = body;

    // Connect to database
    await ConnectDB();

    // 1. Authentication & Authorization
    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError("Unauthorized", 401);
    }

    // Get employee from session
    const [employee] = await EmployeeModel.aggregate([
        {
            $match: { user: new Types.ObjectId(userId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: "$user" },
        {
            $match: { "user.role": EMPLOYEE_ROLE.ASSISTANT }
        },
        {
            $project: { _id: 1, name: 1 }
        }
    ]);

    if (!employee) {
        throw new ApiError("Only assistant employees can approve this review", 403);
    }


    // Use withTransaction for database operations
    const updatedReview = await withTransaction(async (session) => {
        // Find the review
        const review = await ReviewModel.findById(reviewId).session(session);

        if (!review) {
            throw new ApiError("Review not found", 404);
        }

        // Check if review is already approved
        if (review.isApproved) {
            throw new ApiError("Review is already approved", 400);
        }

        // Check if review is soft-deleted
        if (review.deletedAt) {
            throw new ApiError("Cannot approve a deleted review", 400);
        }

        // Approve the review using the instance method
        await review.approve(session);

        // Build and return the updated review DTO
        const reviewDTO = await buildTourReviewDTO(reviewId, false, session);

        if (!reviewDTO) {
            throw new ApiError("Failed to fetch updated review", 500);
        }

        return reviewDTO;
    });

    return {
        data: updatedReview,
        status: 200
    };
});