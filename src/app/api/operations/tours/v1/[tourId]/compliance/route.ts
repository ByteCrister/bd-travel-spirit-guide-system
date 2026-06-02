// api/operations/tours/v1/[tourId]/compliance
import { NextRequest } from 'next/server';
import { withErrorHandler, ApiError } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { validateUpdatedYupSchema } from '@/utils/validators/common/update-updated-yup-schema';
import { Step5ComplianceSchema } from '@/utils/validators/tour/add-tour.validator';
import TourModel, { ITour } from '@/models/tours/tour.model';
import { UpdateTourComplianceDTO } from '@/types/tour/tour.types';
import {
    TOUR_STATUS,
    MODERATION_STATUS,
    AGE_SUITABILITY
} from '@/constants/tour/tour.const';
import mongoose from 'mongoose';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';
import { auditTourMutation, requireSessionUserId } from '@/lib/audit/tour-audit';

/**
 * Update Step-5 compliance
 */
export const PATCH = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ tourId: string }> }
) => {
    // Get tourId from params
    const tourId = resolveMongoId((await params).tourId);
    const userId = await requireSessionUserId();

    // Validate tourId format
    if (!tourId || !mongoose.Types.ObjectId.isValid(tourId)) {
        throw new ApiError('Valid Tour ID is required', 400);
    }

    // Parse request body
    const body = await request.json();

    // Validate request body using the provided validator
    const validatedData = validateUpdatedYupSchema<UpdateTourComplianceDTO>(
        Step5ComplianceSchema,
        body
    );

    // Process update within a transaction
    const updatedTour = await withTransaction(async (session) => {

        const tour = await TourModel.findOne({
            _id: tourId,
            deletedAt: null,
        }).session(session);

        if (!tour) {
            throw new ApiError("Tour not found", 404);
        }

        if (tour.status === TOUR_STATUS.TERMINATED) {
            throw new ApiError("Tour is terminated and cannot be modified", 409);
        }

        if (tour.status === TOUR_STATUS.ARCHIVED) {
            throw new ApiError("Tour is archived and cannot be modified", 409);
        }

        if (tour.status === TOUR_STATUS.ACTIVE) {
            throw new ApiError("Completed tours cannot be modified", 409);
        }

        // Prepare update data
        const updateData: Partial<ITour> = {
            updatedAt: new Date()
        };

        // Update licenseRequired if provided
        if (validatedData.licenseRequired !== undefined) {
            updateData.licenseRequired = validatedData.licenseRequired;
        }

        // Update ageSuitability if provided (must be one of valid values)
        if (validatedData.ageSuitability !== undefined) {
            const validAgeSuitabilities = Object.values(AGE_SUITABILITY);
            if (!validAgeSuitabilities.includes(validatedData.ageSuitability as AGE_SUITABILITY)) {
                throw new ApiError(
                    `Invalid age suitability. Must be one of: ${validAgeSuitabilities.join(', ')}`,
                    400
                );
            }
            updateData.ageSuitability = validatedData.ageSuitability;
        }

        // Update accessibility if provided (merge with existing)
        if (validatedData.accessibility !== undefined) {
            const existingAccessibility = tour.accessibility || {};
            updateData.accessibility = {
                ...existingAccessibility,
                ...validatedData.accessibility,
            };
        }

        // If any compliance fields are updated, reset moderation status for re-approval
        const hasComplianceUpdates = validatedData.licenseRequired !== undefined ||
            validatedData.ageSuitability !== undefined ||
            validatedData.accessibility !== undefined;

        if (hasComplianceUpdates) {
            updateData.moderationStatus = MODERATION_STATUS.PENDING;
            updateData.status = TOUR_STATUS.DRAFT;
        }

        // Apply update
        const updatedTour = await TourModel.findByIdAndUpdate(
            tourId,
            { $set: updateData },
            {
                new: true,
                runValidators: true,
                session
            }
        )

        if (!updatedTour) {
            throw new ApiError('Failed to update tour compliance', 500);
        }

        return updatedTour;
    });

    // Format the response data
    const responseData = {
        licenseRequired: updatedTour.licenseRequired,
        ageSuitability: updatedTour.ageSuitability,
        accessibility: updatedTour.accessibility,
    };

    await auditTourMutation(userId, tourId, "Updated tour compliance");

    return {
        data: responseData,
        status: 200
    };
});