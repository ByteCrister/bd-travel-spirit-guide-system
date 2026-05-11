// app/api/operations/tours/v1/[tourId]/destinations/images-bulk/route.ts
import { NextRequest } from "next/server";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import mongoose, { Types } from "mongoose";
import { uploadAssets } from "@/lib/cloudinary/upload.cloudinary";
import { cleanupAssets } from "@/lib/cloudinary/delete.cloudinary";
import { Base64Asset } from "@/lib/cloudinary/upload.cloudinary";
import { UpdateDestinationImgDTO } from "@/types/tour/tour.types";
import TourModel from "@/models/tours/tour.model";
import { ASSET_TYPE } from "@/constants/common/asset.const";
import { MODERATION_STATUS, TOUR_STATUS } from "@/constants/tour/tour.const";
import { buildTourDetailDTO } from "@/lib/build-responses/build-tour-details";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";

/**
 * PATCH api/operations/tours/v1/[tourId]/destinations/images-bulk/route.ts
 * Update destination images with transaction support using destination ID
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
    const body = (await request.json()) as UpdateDestinationImgDTO;

    // Validate destination ID
    if (!body.destinationId || !mongoose.Types.ObjectId.isValid(body.destinationId)) {
        throw new ApiError("Valid destination ID is required", 400);
    }

    // Validate at least one operation is requested
    if (
        (!body.deleteImageIds || body.deleteImageIds.length === 0) &&
        (!body.newImages || body.newImages.length === 0)
    ) {
        throw new ApiError("No changes requested", 400);
    }

    // Run in transaction
    const tourDetailDto = await withTransaction(async (session) => {
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

        // Check if tour is deleted
        if (tour.deletedAt) {
            throw new ApiError("Tour is deleted", 410);
        }

        // Find destination by ID
        const destination = tour?.destinations?.find(
            dest => dest?._id?.toString() === body?.destinationId
        );

        if (!destination) {
            throw new ApiError("Destination not found", 404);
        }

        const currentImageIds = destination.images || [];

        // Step 1: Delete specified images
        if (body.deleteImageIds && body.deleteImageIds.length > 0) {
            // Validate all delete IDs are in the current images
            const invalidDeleteIds = body.deleteImageIds.filter(
                (id) => !currentImageIds.some((imgId) => imgId.toString() === id)
            );

            if (invalidDeleteIds.length > 0) {
                throw new ApiError(
                    `Some image IDs not found in destination: ${invalidDeleteIds.join(", ")}`,
                    400
                );
            }

            // Convert string IDs to ObjectId
            const deleteObjectIds = body.deleteImageIds.map(
                (id) => new mongoose.Types.ObjectId(id)
            );

            // Soft delete assets from Cloudinary and database
            await cleanupAssets(deleteObjectIds, session);

            // Remove deleted IDs from destination images
            destination.images = currentImageIds.filter(
                (imgId) => !body.deleteImageIds!.includes(imgId.toString())
            );
        }

        // Step 2: Upload new images
        if (body.newImages && body.newImages.length > 0) {
            // Convert base64 strings to Base64Asset format
            const newAssets: Base64Asset[] = body.newImages.map((base64, index) => ({
                base64,
                name: `destination-${destination._id}-image-${Date.now()}-${index}`,
                assetType: ASSET_TYPE.IMAGE,
            }));

            // Upload to Cloudinary and get new asset IDs
            const newAssetIds = await uploadAssets(newAssets, session);

            // Add new image IDs to destination
            if (!destination.images) {
                destination.images = [];
            }

            destination.images.push(...newAssetIds);
        }

        // Mark destinations as modified
        tour.markModified("destinations");

        tour.moderationStatus = MODERATION_STATUS.PENDING;
        tour.status = TOUR_STATUS.DRAFT;

        // Save the tour
        await tour.save({ session });
        return await buildTourDetailDTO(tour._id as Types.ObjectId, session);
    });

    // Find the updated destination to return
    const updatedDestination = tourDetailDto?.destinations?.find(
        dest => dest.id === body?.destinationId
    );

    return {
        data: updatedDestination?.imageIds,
        status: 200,
    };
});