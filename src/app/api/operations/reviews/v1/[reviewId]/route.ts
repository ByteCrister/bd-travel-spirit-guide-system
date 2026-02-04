// /app/api/operations/reviews/v1/[reviewId]/route.ts
import { NextRequest } from "next/server";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { buildTourReviewDTO } from "@/lib/build-responses/build-tour-review-dto";
import ConnectDB from "@/config/db";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import EmployeeModel from "@/models/employees/employees.model";
import { EMPLOYEE_ROLE } from "@/constants/employee.const";
import { ReviewModel } from "@/models/tours/review.model";
import { Types } from "mongoose";

/**
 * GET full details of a tour review
 */
export const GET = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ reviewId: string }> }
) => {
    // Await the params first
    const reviewId = decodeURIComponent((await params).reviewId);

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const withDeleted = searchParams.get("withDeleted") === "true";

    // Validate reviewId
    if (!reviewId || reviewId === "undefined" || reviewId === "null") {
        throw new ApiError("Review ID is required", 400);
    }

    await ConnectDB();

    // Use transaction for the database operations
    const reviewDetail = await withTransaction(async (session) => {
        const detail = await buildTourReviewDTO(reviewId, withDeleted, session);

        if (!detail) {
            throw new ApiError("Review not found", 404);
        }

        return detail;
    });

    // console.log(JSON.stringify(reviewDetail, null, 2));

    return {
        data: reviewDetail,
        status: 200
    };
})

/**
 * DELETE /api/reviews/[reviewId]
 * Delete a review (soft delete)
 * 
 * Response:
 * {
 *   data: { success: true };
 * }
 */
export const DELETE = withErrorHandler(
    async (req: NextRequest, { params }: { params: Promise<{ reviewId: string }> }) => {
        const reviewId = decodeURIComponent((await params).reviewId);

        // 1. Authentication & Authorization
        const userId = await getUserIdFromSession();
        if (!userId) {
            throw new ApiError("Unauthorized", 401);
        }

        await ConnectDB();

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
            throw new ApiError("Only assistant employees can reject this review", 403);
        }

        // 2. Validate reviewId format
        if (!Types.ObjectId.isValid(reviewId)) {
            throw new ApiError("Invalid review ID format", 400);
        }

        const reviewObjectId = new Types.ObjectId(reviewId);

        // 3. Execute in transaction for data consistency
        await withTransaction(async (session) => {
            // Find the review (don't exclude deleted ones in case we want to delete an already deleted review)
            const review = await ReviewModel.findOne({
                _id: reviewObjectId,
            }).session(session);

            if (!review) {
                throw new ApiError("Review not found", 404);
            }

            // Check if review is already deleted
            if (review.deletedAt) {
                throw new ApiError("Review is already deleted", 400);
            }

            // Get optional reason from query parameters
            const url = new URL(req.url);
            const reason = url.searchParams.get('reason') || undefined;

            // Soft delete the review using instance method
            await review.deleteReview(reason, session);
        });

        return {
            data: { success: true },
            status: 200,
        };
    }
);