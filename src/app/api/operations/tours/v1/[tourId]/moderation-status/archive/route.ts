// api/operations/tours/v1/[tourId]/archive/route.ts
import { NextRequest } from "next/server";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import TourModel from "@/models/tours/tour.model";
import { buildTourDetailDTO } from "@/lib/build-responses/build-tour-details";
import { Types } from "mongoose";
import { TOUR_STATUS } from "@/constants/tour/tour.const";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";
import ConnectDB from "@/config/db";

type Params = Promise<{ tourId: string }>;


/**
 * Archive and soft delete a tour
 */
const archiveTourHandler = async (
    req: NextRequest,
    { params }: { params: Params }
) => {
    const tourId = resolveMongoId((await params).tourId);

    if (!tourId || !Types.ObjectId.isValid(tourId)) {
        throw new ApiError("Invalid tour ID", 400);
    }

    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError("Unauthorized - User ID required", 401);
    }

    await ConnectDB();

    await VERIFY_USER_ROLE.ASSISTANT(userId);

    // Perform the archive operation within a transaction
    const result = await withTransaction(async (session) => {
        // Find the tour first to check its current status
        const tour = await TourModel.findById(tourId).session(session);

        if (!tour) {
            throw new ApiError("Tour not found", 404);
        }

        // Check if tour is already archived/deleted
        if (tour.status === TOUR_STATUS.ARCHIVED || tour.deletedAt) {
            throw new ApiError("Tour is already archived", 409);
        }

        // Check if tour is in a state that can be archived
        const allowedStatusesForArchive = [
            TOUR_STATUS.ACTIVE,
            TOUR_STATUS.DRAFT,
            TOUR_STATUS.SUBMITTED,
            TOUR_STATUS.COMPLETED,
        ];

        if (!allowedStatusesForArchive.includes(tour.status as TOUR_STATUS)) {
            throw new ApiError(`Cannot archive tour with status: ${tour.status}`, 400);
        }

        // Use the model's softDeleteById method for consistency
        const archivedTour = await TourModel.softDeleteById(
            tourId,
            {
                session,
                deletedBy: new Types.ObjectId(userId),
            }
        );

        if (!archivedTour) {
            throw new ApiError("Failed to archive tour", 500);
        }

        // Build the response DTO
        const tourDTO = await buildTourDetailDTO(archivedTour._id as Types.ObjectId, session);

        return {
            data: tourDTO,
            status: 200,
        };
    });

    return result;
}

// Export the wrapped handler
export const DELETE = withErrorHandler(archiveTourHandler);