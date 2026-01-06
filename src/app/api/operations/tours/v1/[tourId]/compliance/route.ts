// api/operations/tours/v1/[tourId]/compliance
import { NextRequest } from 'next/server';
import { withErrorHandler, ApiError } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { validateTourUpdateSchema } from '@/utils/validators/tour/update-tour.validator';
import { Step5ComplianceSchema } from '@/utils/validators/tour/add-tour.validator';
import TourModel, { ITour } from '@/models/tours/tour.model';
import { UpdateTourComplianceDTO } from '@/types/tour.types';
import {
    TOUR_STATUS,
    MODERATION_STATUS,
    AGE_SUITABILITY
} from '@/constants/tour.const';
import mongoose from 'mongoose';
import { decodeId } from '@/utils/helpers/mongodb-id-conversions';

/**
 * Update Step-5 compliance
 */
export const PATCH = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ tourId: string }> }
) => {
    // Get tourId from params
    const tourId = decodeId(decodeURIComponent((await params).tourId));

    // Validate tourId format
    if (!tourId || !mongoose.Types.ObjectId.isValid(tourId)) {
        throw new ApiError('Valid Tour ID is required', 400);
    }

    // Parse request body
    const body = await request.json();

    // Validate request body using the provided validator
    const validatedData = validateTourUpdateSchema<UpdateTourComplianceDTO>(
        Step5ComplianceSchema,
        body
    );

    // Process update within a transaction
    const updatedTour = await withTransaction(async (session) => {
        // Find tour and check ownership/status
        const tour = await TourModel.findOne({
            _id: tourId,
            deletedAt: null,
            status: {
                $nin: [
                    TOUR_STATUS.TERMINATED
                ]
            }
        }).session(session);

        if (!tour) {
            throw new ApiError('Tour not found or you do not have permission to update it', 404);
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

    // Return successful response
    return {
        data: responseData,
        status: 200
    };
});