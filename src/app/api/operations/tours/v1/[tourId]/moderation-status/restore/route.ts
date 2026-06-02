// api/operations/tours/v1/[tourId]/restore/route.ts
import { NextRequest } from "next/server";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import TourModel from "@/models/tours/tour.model";
import { buildTourDetailDTO } from "@/lib/build-responses/build-tour-details";
import { Types } from "mongoose";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";
import ConnectDB from "@/config/db";
import { auditTourMutation } from "@/lib/audit/tour-audit";

type Params = Promise<{ tourId: string }>;

// Main handler function
async function restoreTourHandler(
    req: NextRequest,
    { params }: { params: Params }
) {
    const tourId = resolveMongoId((await params).tourId);
    const currentUserId = await getUserIdFromSession();

    if (!currentUserId) {
        throw new ApiError("Unauthorized", 404);
    }

    if (!tourId) {
        throw new ApiError("Tour ID is required", 400);
    }

    if (!Types.ObjectId.isValid(tourId)) {
        throw new ApiError("Invalid Tour ID", 400);
    }

    const objectId = new Types.ObjectId(tourId);

    await ConnectDB();

    await VERIFY_USER_ROLE.ASSISTANT(currentUserId);

    const response = await withTransaction(async (session) => {
        const restoredTour = await TourModel.restoreById(objectId, {
            session,
            restoredBy: new Types.ObjectId(currentUserId)
        });

        if (!restoredTour) {
            throw new ApiError("Tour not found or cannot be restored", 404);
        }

        const tourDTO = await buildTourDetailDTO(restoredTour._id as Types.ObjectId, session);

        return {
            data: tourDTO,
            status: 200
        };
    });

    await auditTourMutation(currentUserId, tourId, "Restored tour");

    return response;
}

// Export the wrapped handler
export const POST = withErrorHandler(restoreTourHandler);