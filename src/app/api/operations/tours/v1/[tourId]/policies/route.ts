import { NextRequest } from 'next/server';
import { validateUpdatedYupSchema } from '@/utils/validators/common/update-updated-yup-schema';
import { Step6PolicySchema } from '@/utils/validators/tour/add-tour.validator';
import TourModel, { ITour } from '@/models/tours/tour.model';
import { UpdateTourPoliciesDTO } from '@/types/tour/tour.types';
import { TOUR_STATUS, MODERATION_STATUS } from '@/constants/tour/tour.const';
import mongoose from 'mongoose';
import { ApiError, withErrorHandler } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';

/**
 * Update Step-6 policy
 */
export const PATCH = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ tourId: string }> }
) => {
    // Get tourId from params
    const tourId = resolveMongoId((await params).tourId);

    // Validate tourId format
    if (!tourId || !mongoose.Types.ObjectId.isValid(tourId)) {
        throw new ApiError('Valid Tour ID is required', 400);
    }

    // Parse request body
    const body = await request.json();

    // Validate request body using the provided validator
    const validatedData = validateUpdatedYupSchema<UpdateTourPoliciesDTO>(
        Step6PolicySchema,
        body
    );

    // Process update within a transaction
    const updatedTour = await withTransaction(async (session) => {
        // Find tour and check ownership/status
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

        // Update cancellation policy if provided
        if (validatedData.cancellationPolicy !== undefined) {
            // Validate cancellation rules are in descending order of daysBefore
            if (validatedData.cancellationPolicy.rules) {
                const rules = validatedData.cancellationPolicy.rules;
                // Sort by daysBefore to ensure proper validation
                const sortedRules = [...rules].sort((a, b) => b.daysBefore - a.daysBefore);

                // Check if refund percentages are descending
                for (let i = 1; i < sortedRules.length; i++) {
                    if (sortedRules[i].refundPercent > sortedRules[i - 1].refundPercent) {
                        throw new ApiError('Refund percentage should not increase as cancellation date gets closer', 400);
                    }
                }

                updateData.cancellationPolicy = {
                    refundable: validatedData.cancellationPolicy.refundable,
                    rules: sortedRules
                };
            }
        }

        // Update refund policy if provided
        if (validatedData.refundPolicy !== undefined) {
            updateData.refundPolicy = validatedData.refundPolicy;
        }

        // Update terms if provided
        if (validatedData.terms !== undefined) {
            updateData.terms = validatedData.terms;
        }

        // If policies are updated, reset moderation status for re-approval
        const hasPolicyUpdates = validatedData.cancellationPolicy ||
            validatedData.refundPolicy ||
            validatedData.terms;

        if (hasPolicyUpdates) {
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
            throw new ApiError('Failed to update tour policies', 500);
        }

        return updatedTour;
    });

    // Return successful response
    return {
        data: {
            cancellationPolicy: updatedTour.cancellationPolicy,
            refundPolicy: updatedTour.refundPolicy,
            terms: updatedTour.terms,
        },
        status: 200
    };
});