// app/api/operations/tours/v1/[tourId]/basic-info/route.ts
import { NextRequest } from "next/server";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import mongoose from "mongoose";
import { UpdateTourBasicInfoDTO } from "@/types/tour.types";
import { Step0BasicInfoSchema } from "@/utils/validators/tour/add-tour.validator";
import { validateUpdatedYupSchema } from "@/utils/validators/common/update-updated-yup-schema";
import TourModel from "@/models/tours/tour.model";
import { MODERATION_STATUS, TOUR_STATUS } from "@/constants/tour.const";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";

/**
 * Update Step-0 basic info
 */
export const PATCH = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ tourId: string }> }
) => {
    const tourId = resolveMongoId((await params).tourId);

    // Validate tour ID
    if (!tourId || !mongoose.Types.ObjectId.isValid(tourId)) {
        throw new ApiError("Invalid tour ID", 400);
    }

    // Parse request body
    const body = (await request.json()) as UpdateTourBasicInfoDTO;

    // Validate request body
    const validate = validateUpdatedYupSchema<UpdateTourBasicInfoDTO>(
        Step0BasicInfoSchema,
        body
    );

    // Run in transaction
    const result = await withTransaction(async (session) => {
        // Find the tour with session
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

        // Update other basic info fields
        if (validate.title !== undefined) {
            tour.title = validate.title;
        }

        if (validate.summary !== undefined) {
            tour.summary = validate.summary;
        }

        if (validate.seo !== undefined) {
            tour.seo = {
                metaTitle: validate.seo.metaTitle || tour.seo?.metaTitle,
                metaDescription: validate.seo.metaDescription || tour.seo?.metaDescription,
            };
        }

        if (validate.tags !== undefined) {
            tour.tags = validate.tags.map((tag) => tag.trim()).filter(Boolean);
        }

        tour.moderationStatus = MODERATION_STATUS.PENDING;
        tour.status = TOUR_STATUS.DRAFT;

        // Save the tour
        const updatedTour = await tour.save({ session });

        return {
            title: updatedTour.title,
            seo: updatedTour.seo,
            summary: updatedTour.summary,
            tags: updatedTour.tags || [],
        };
    });

    return {
        data: result,
        status: 200,
    };
});