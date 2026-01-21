// app/api/operations/tours/v1/[tourId]/gallery/route.ts
import { NextRequest } from 'next/server';
import mongoose, { Types } from 'mongoose';
import { resolveDocuments } from '@/lib/cloudinary/resolve.cloudinary';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { ApiError, withErrorHandler } from '@/lib/helpers/withErrorHandler';
import { ASSET_TYPE } from '@/constants/asset.const';
import { isCloudinaryUrl as isCloudinaryUrlHelper, isBase64DataUrl as isBase64DataUrlHelper } from '@/lib/helpers/document-conversions';
import ConnectDB from '@/config/db';
import { TourDetailDTO, UpdateTourGalleryDTO } from '@/types/tour.types';
import TourModel from '@/models/tours/tour.model';
import { buildTourDetailDTO } from '@/lib/build-responses/build-tour-details';
import { MODERATION_STATUS, TOUR_STATUS } from '@/constants/tour.const';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';


// Export the PATCH handler with error handling
export const PATCH = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ tourId: string }> }
) => {
    await ConnectDB();

    const tourId = resolveMongoId((await params).tourId);

    if (!tourId) {
        throw new ApiError("Invalid tour ID", 400)
    }
    const body = await request.json() as UpdateTourGalleryDTO;
    const { gallery } = body;

    // Validate inputs
    if (!tourId || !mongoose.Types.ObjectId.isValid(tourId)) {
        throw new ApiError('Invalid tour ID', 400);
    }

    if (!Array.isArray(gallery)) {
        throw new ApiError('Gallery must be an array', 400);
    }

    // Validate each gallery item
    gallery.forEach((item, index) => {
        if (typeof item !== 'string') {
            throw new ApiError(`Gallery item at index ${index} must be a string`, 400);
        }

        if (!isBase64DataUrlHelper(item) && !isCloudinaryUrlHelper(item)) {
            throw new ApiError(
                `Invalid gallery item at index ${index}: must be base64 data URL or Cloudinary URL`,
                400
            );
        }
    });

    const tourDetailsDTO = await withTransaction<TourDetailDTO>(async (session) => {
        // Find the tour
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

        // Get existing gallery asset IDs
        const existingDocs = (tour.gallery ?? []).map((gId) => ({ type: ASSET_TYPE.IMAGE, asset: gId }))
        const incoming = (gallery ?? []).map((gId) => ({ url: gId, type: ASSET_TYPE.IMAGE }))

        const newGalleryIds = await resolveDocuments(incoming, existingDocs, ASSET_TYPE.IMAGE, session)


        // Update tour
        tour.gallery = newGalleryIds.map((g) => g.asset);
        tour.updatedAt = new Date();

        tour.moderationStatus = MODERATION_STATUS.PENDING;
        tour.status = TOUR_STATUS.DRAFT;

        await tour.save({ session });

        const detailDto = await buildTourDetailDTO(tour._id as Types.ObjectId, false, session)

        if (!detailDto || !detailDto.gallery) {
            throw new ApiError('Failed to fetch updated gallery', 500);
        }

        return detailDto;
    });

    return {
        data: tourDetailsDTO.gallery,
        status: 200
    };
});