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
import { auditTourMutation, requireSessionUserId } from "@/lib/audit/tour-audit";
import ConnectDB from "@/config/db";

/**
 * PATCH api/operations/tours/v1/[tourId]/destinations/images-bulk/route.ts
 * Update destination images with transaction support using destination ID
 */
export const PATCH = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ tourId: string }> }
) => {
    const tourId = resolveMongoId((await params).tourId);
    const userId = await requireSessionUserId();

    await ConnectDB();

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

    // Run uploads OUTSIDE transaction to avoid Mongo 60s transaction timeout
    let newAssetIds: Types.ObjectId[] = [];
    if (body.newImages && body.newImages.length > 0) {
        const newAssets: Base64Asset[] = body.newImages.map((base64, index) => ({
            base64,
            name: `destination-${body.destinationId}-image-${Date.now()}-${index}`,
            assetType: ASSET_TYPE.IMAGE,
        }));
        newAssetIds = await uploadAssets(newAssets, undefined as unknown as mongoose.ClientSession);
    }

    // Run DB updates inside transaction — returns tourId only so the DTO query
    // runs AFTER the transaction commits and can see freshly written AssetFile.publicUrl
    // records (MongoDB snapshot isolation would hide them if queried inside the same session).
    const committedTourId = await withTransaction(async (session) => {
        // Find the tour with session
        const tour = await TourModel.findOne({
            _id: tourId,
            deletedAt: null,
        }).session(session);

        if (!tour) throw new ApiError("Tour not found", 404);
        if (tour.status === TOUR_STATUS.TERMINATED) throw new ApiError("Tour is terminated and cannot be modified", 409);
        if (tour.status === TOUR_STATUS.ARCHIVED) throw new ApiError("Tour is archived and cannot be modified", 409);
        if (tour.status === TOUR_STATUS.ACTIVE) throw new ApiError("Completed tours cannot be modified", 409);
        if (tour.deletedAt) throw new ApiError("Tour is deleted", 410);

        // Find destination by ID
        const destination = tour?.destinations?.find(
            dest => dest?._id?.toString() === body?.destinationId
        );
        if (!destination) throw new ApiError("Destination not found", 404);

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

            // Remove deleted IDs from destination images
            destination.images = currentImageIds.filter(
                (imgId) => !body.deleteImageIds!.includes(imgId.toString())
            );
            
            // Soft delete assets from Cloudinary and database (inside session for rollback safety)
            const deleteObjectIds = body.deleteImageIds.map((id) => new mongoose.Types.ObjectId(id));
            await cleanupAssets(deleteObjectIds, session);
        }

        // Step 2: Add new images
        if (newAssetIds.length > 0) {
            if (!destination.images) destination.images = [];
            destination.images.push(...newAssetIds);
        }

        // Mark destinations as modified
        tour.markModified("destinations");

        tour.moderationStatus = MODERATION_STATUS.PENDING;
        tour.status = TOUR_STATUS.DRAFT;

        // Save the tour
        await tour.save({ session });
        return tour._id as Types.ObjectId;
    });

    // Build DTO AFTER the transaction has committed so the session-less query reads
    // the fully-committed AssetFile.publicUrl values written by uploadAssets().
    const tourDetailDto = await buildTourDetailDTO(committedTourId);

    // Find the updated destination to return
    const updatedDestination = tourDetailDto?.destinations?.find(
        dest => dest.id === body?.destinationId
    );

    await auditTourMutation(userId, tourId, "Updated destination images");

    return {
        data: updatedDestination?.imageIds,
        status: 200,
    };
});