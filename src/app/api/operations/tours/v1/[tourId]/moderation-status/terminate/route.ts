// api/operations/tours/v1/[tourId]/terminate/route.ts
import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import TourModel from "@/models/tours/tour.model";
import { buildTourDetailDTO } from "@/lib/build-responses/build-tour-details";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";
import ConnectDB from "@/config/db";

type Params = Promise<{ tourId: string }>;

interface TerminateTourRequest {
    reason?: string;
}

/**
 * Handler to terminate/archive/soft delete a tour
 * 
 * This endpoint:
 * 1. Validates the authenticated user
 * 2. Uses a transaction for data consistency
 * 3. Calls TourModel.terminateById to update tour status
 * 4. Returns the updated tour details using buildTourDetailDTO
 */
const terminateTourHandler = async (
    req: NextRequest,
    { params }: { params: Params }
) => {
    const tourId = resolveMongoId((await params).tourId);

    // Validate tourId
    if (!tourId || !Types.ObjectId.isValid(tourId)) {
        throw new ApiError("Valid tour ID is required", 400);
    }

    // Get authenticated user
    const currentUserId = await getUserIdFromSession();
    if (!currentUserId) {
        throw new ApiError("Authentication required", 401);
    }

    await ConnectDB();

    await VERIFY_USER_ROLE.ASSISTANT(currentUserId);

    // Parse request body
    const requestBody = await req.json() as TerminateTourRequest;

    // Use transaction for consistency
    const tourDetailDTO = await withTransaction(async (session) => {
        // Terminate the tour using the model method
        const tour = await TourModel.terminateById(
            new Types.ObjectId(tourId),
            {
                terminatedBy: new Types.ObjectId(currentUserId),
                reason: requestBody.reason,
                session
            }
        );

        if (!tour) {
            throw new ApiError("Tour not found or could not be terminated", 404);
        }

        // Build the detailed DTO for response
        return await buildTourDetailDTO(tour._id as Types.ObjectId, session);
    });

    return {
        data: tourDetailDTO,
        status: 200
    };
};

// Export the handler wrapped with error handling
export const POST = withErrorHandler(terminateTourHandler);