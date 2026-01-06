// app/api/operations/tours/v1/[tourId]/destinations/images-bulk/route.ts
import { NextRequest } from "next/server";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import mongoose from "mongoose";
import { uploadAssets } from "@/lib/cloudinary/upload.cloudinary";
import { cleanupAssets } from "@/lib/cloudinary/delete.cloudinary";
import { Base64Asset } from "@/lib/cloudinary/upload.cloudinary";
import { UpdateDestinationImgDTO } from "@/types/tour.types";
import TourModel from "@/models/tours/tour.model";
import { ASSET_TYPE } from "@/constants/asset.const";
import { decodeId } from "@/utils/helpers/mongodb-id-conversions";
/**
 * PATCH api/operations/tours/v1/[tourId]/destinations/images-bulk/route.ts
 * Update destination images with transaction support
 */
export const PATCH = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ tourId: string }> }
) => {
    const tourId = decodeId(decodeURIComponent((await params).tourId));

    // Validate tour ID
    if (!tourId || !mongoose.Types.ObjectId.isValid(tourId)) {
        throw new ApiError("Invalid tour ID", 400);
    }

    // Parse request body
    const body = (await request.json()) as UpdateDestinationImgDTO;

    // Validate destination index
    if (body.destinationIndex === undefined || body.destinationIndex < 0) {
        throw new ApiError("Destination index is required", 400);
    }

    // Validate at least one operation is requested
    if (
        (!body.deleteImageIds || body.deleteImageIds.length === 0) &&
        (!body.newImages || body.newImages.length === 0)
    ) {
        throw new ApiError("No changes requested", 400);
    }

    // Run in transaction
    const result = await withTransaction(async (session) => {
        // Find the tour with session
        const tour = await TourModel.findById(tourId).session(session);

        if (!tour) {
            throw new ApiError("Tour not found", 404);
        }

        // Check if tour is deleted
        if (tour.deletedAt) {
            throw new ApiError("Tour is deleted", 410);
        }

        // Validate destination index exists
        if (!tour.destinations || body.destinationIndex >= tour.destinations.length) {
            throw new ApiError("Destination not found", 404);
        }

        const destination = tour.destinations[body.destinationIndex];
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
                (imgId) => !body.deleteImageIds.includes(imgId.toString())
            );
        }

        // Step 2: Upload new images
        if (body.newImages && body.newImages.length > 0) {
            // Convert base64 strings to Base64Asset format
            const newAssets: Base64Asset[] = body.newImages.map((base64) => ({
                base64,
                name: `destination-${body.destinationIndex}-image-${Date.now()}`,
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

        // Save the tour
        const updatedTour = await tour.save({ session });

        return {
            tourId: updatedTour._id,
            destinationIndex: body.destinationIndex,
            imageCount: destination.images?.length || 0,
            message: "Destination images updated successfully",
        };
    });

    return {
        data: result,
        status: 200,
    };
});