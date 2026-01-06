// app/api/operations/tours/v1/[tourId]/destinations/attractions/images-bulk/route.ts
import { NextRequest } from "next/server";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import mongoose from "mongoose";
import { uploadAssets } from "@/lib/cloudinary/upload.cloudinary";
import { cleanupAssets } from "@/lib/cloudinary/delete.cloudinary";
import { Base64Asset } from "@/lib/cloudinary/upload.cloudinary";
import { UpdateDestinationAttrImgDTO } from "@/types/tour.types";
import TourModel from "@/models/tours/tour.model";
import { ASSET_TYPE } from "@/constants/asset.const";
import { decodeId } from "@/utils/helpers/mongodb-id-conversions";

/**
 * PATCH /api/tours/[tourId]/attraction-images
 * Update attraction images within a destination with transaction support
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
    const body = (await request.json()) as UpdateDestinationAttrImgDTO;

    // Validate destination and attraction indexes
    if (body.destinationIndex === undefined || body.destinationIndex < 0) {
        throw new ApiError("Destination index is required", 400);
    }

    if (body.attractionIndex === undefined || body.attractionIndex < 0) {
        throw new ApiError("Attraction index is required", 400);
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

        // Validate attraction index exists
        if (!destination.attractions || body.attractionIndex >= destination.attractions.length) {
            throw new ApiError("Attraction not found", 404);
        }

        const attraction = destination.attractions[body.attractionIndex];
        const currentImageIds = attraction.images || [];

        // Step 1: Delete specified images
        if (body.deleteImageIds && body.deleteImageIds.length > 0) {
            // Validate all delete IDs are in the current images
            const invalidDeleteIds = body.deleteImageIds.filter(
                (id) => !currentImageIds.some((imgId) => imgId.toString() === id)
            );

            if (invalidDeleteIds.length > 0) {
                throw new ApiError(
                    `Some image IDs not found in attraction: ${invalidDeleteIds.join(", ")}`,
                    400
                );
            }

            // Convert string IDs to ObjectId
            const deleteObjectIds = body.deleteImageIds.map(
                (id) => new mongoose.Types.ObjectId(id)
            );

            // Soft delete assets from Cloudinary and database
            await cleanupAssets(deleteObjectIds, session);

            // Remove deleted IDs from attraction images
            attraction.images = currentImageIds.filter(
                (imgId) => !body.deleteImageIds.includes(imgId.toString())
            );
        }

        // Step 2: Upload new images
        if (body.newImages && body.newImages.length > 0) {
            // Convert base64 strings to Base64Asset format
            const newAssets: Base64Asset[] = body.newImages.map((base64, index) => ({
                base64,
                name: `attraction-${body.destinationIndex}-${body.attractionIndex}-image-${Date.now()}-${index}`,
                assetType: ASSET_TYPE.IMAGE,
            }));

            // Upload to Cloudinary and get new asset IDs
            const newAssetIds = await uploadAssets(newAssets, session);

            // Add new image IDs to attraction
            if (!attraction.images) {
                attraction.images = [];
            }

            attraction.images.push(...newAssetIds);
        }

        // Mark the specific destination's attractions as modified
        // We need to mark the entire destinations array as modified since we're modifying nested data
        tour.markModified("destinations");

        // Save the tour
        const updatedTour = await tour.save({ session });

        return {
            tourId: updatedTour._id,
            destinationIndex: body.destinationIndex,
            attractionIndex: body.attractionIndex,
            imageCount: attraction.images?.length || 0,
            message: "Attraction images updated successfully",
        };
    });

    return {
        data: result,
        status: 200,
    };
});