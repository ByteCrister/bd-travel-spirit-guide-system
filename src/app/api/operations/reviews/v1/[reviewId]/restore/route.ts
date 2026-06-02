// /api/operations/reviews/v1/[reviewId]/restore/route.ts

import { NextRequest } from "next/server";
import mongoose, { Types } from "mongoose";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import ConnectDB from "@/config/db";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import EmployeeModel from "@/models/employees/employees.model";
import { EMPLOYEE_ROLE } from "@/constants/employee/employee.const";
import { ReviewModel } from "@/models/tours/review.model";
import { buildTourReviewDTO } from "@/lib/build-responses/build-tour-review-dto";
import { AUDIT_ACTION, logAuditForActor } from "@/lib/audit/audit-logger";

// Define route context type
interface Params {
    params: Promise<{
        reviewId: string;
    }>;
}

/**
 * POST /api/operations/reviews/v1/[reviewId]/restore/route.ts
 * Restore a soft-deleted review
 *
 * Response:
 * {
 *   data: ReviewDetailDTO;
 * }
 */
export const POST = withErrorHandler(
    async (req: NextRequest, { params }: Params) => {
        const reviewId = decodeURIComponent((await params).reviewId);

        // Validate reviewId
        if (!reviewId || reviewId === "undefined" || reviewId === "null") {
            throw new ApiError("Review ID is required", 400);
        }

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            throw new ApiError("Invalid review ID format", 400);
        }

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
                "Only assistant employees can approve this review",
                403
            );
        }

        const reviewObjectId = new mongoose.Types.ObjectId(reviewId);

        // 3. Execute in transaction
        const result = await withTransaction(async (session) => {
            // Find the review (include deleted ones)
            const review = await ReviewModel.findOne({
                _id: reviewObjectId,
            }).session(session);

            if (!review) {
                throw new ApiError("Review not found", 404);
            }

            // Check if review is already restored
            if (!review.deletedAt) {
                throw new ApiError("Review is not deleted", 400);
            }

            // Restore the review using instance method
            await review.restore(session);

            // Fetch the restored review with populated data
            const restoredReview = await buildTourReviewDTO(reviewId, false, session);

            if (!restoredReview) {
                throw new ApiError("Failed to fetch restored review", 500);
            }

            return restoredReview;
        });

        await logAuditForActor(userId, {
            targetModel: "Review",
            target: reviewId,
            action: AUDIT_ACTION.UPDATE,
            note: "Restored review",
        });

        return {
            data: result,
            status: 200,
        };
    }
);
