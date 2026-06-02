// api/operations/tours/[tourId]/bangladesh-fields/route.ts
import { NextRequest } from 'next/server';
import { withErrorHandler, ApiError } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { validateUpdatedYupSchema } from '@/utils/validators/common/update-updated-yup-schema';
import { Step1BangladeshSchema } from '@/utils/validators/tour/add-tour.validator';
import TourModel, { ITour } from '@/models/tours/tour.model';
import { UpdateTourBangladeshFieldsDTO } from '@/types/tour/tour.types';
import { MODERATION_STATUS, TOUR_STATUS } from '@/constants/tour/tour.const';
import { Types } from 'mongoose';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';
import { auditTourMutation, requireSessionUserId } from '@/lib/audit/tour-audit';
/**
 * Update Step-1 bangladesh fields
 */
export const PATCH = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ tourId: string }> }
) => {
    // Get tourId from params
    const tourId = resolveMongoId((await params).tourId);
    const userId = await requireSessionUserId();

    if (!tourId || !Types.ObjectId.isValid(tourId)) {
        throw new ApiError('Valid Tour ID is required', 400);
    }

    // Parse request body
    const body: UpdateTourBangladeshFieldsDTO = await request.json();

    // Validate request body using the provided validator
    const validation = validateUpdatedYupSchema<UpdateTourBangladeshFieldsDTO>(
        Step1BangladeshSchema,
        body
    );

    // Process update within a transaction
    const result = await withTransaction(async (session) => {

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
        const updateData: Partial<ITour> = {};

        // Update basic fields if provided
        if (validation.tourType !== undefined) {
            updateData.tourType = validation.tourType;
        }
        if (validation.division !== undefined) {
            updateData.division = validation.division;
        }
        if (validation.district !== undefined) {
            updateData.district = validation.district;
        }
        if (validation.accommodationType !== undefined) {
            updateData.accommodationType = validation.accommodationType;
        }
        if (validation.guideIncluded !== undefined) {
            updateData.guideIncluded = validation.guideIncluded;
        }
        if (validation.transportIncluded !== undefined) {
            updateData.transportIncluded = validation.transportIncluded;
        }

        // Merge emergency contacts if provided
        if (validation.emergencyContacts) {
            updateData.emergencyContacts = {
                ...tour.emergencyContacts, // Keep existing fields
                ...validation.emergencyContacts // Update with new fields
            };
        }

        // If any Bangladesh-specific fields are updated, reset moderation status
        // This ensures the tour needs re-approval after significant changes
        const hasBangladeshUpdates = Object.keys(updateData).length > 0;
        if (hasBangladeshUpdates) {
            updateData.moderationStatus = MODERATION_STATUS.PENDING;
            updateData.status = TOUR_STATUS.DRAFT;
        }

        // Update timestamps
        updateData.updatedAt = new Date();

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
            throw new ApiError('Failed to update tour', 500);
        }

        return {
            tourType: updatedTour.tourType,
            division: updatedTour.division,
            district: updatedTour.district,
            accommodationType: updatedTour.accommodationType,
            guideIncluded: updatedTour.guideIncluded,
            transportIncluded: updatedTour.transportIncluded,
            emergencyContacts: updatedTour.emergencyContacts,
        };
    });

    await auditTourMutation(userId, tourId, "Updated tour Bangladesh fields");

    return {
        data: result,
        status: 200
    };
});