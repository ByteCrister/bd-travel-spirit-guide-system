export const maxDuration = 300; // 5 minutes

import { NextRequest } from "next/server";
import mongoose, { Types, ClientSession } from "mongoose";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { UpdateTourHeroImageDTO } from "@/types/tour/tour.types";
import ConnectDB from "@/config/db";
import TourModel from "@/models/tours/tour.model";
import { cleanupAssets } from "@/lib/cloudinary/delete.cloudinary";
import { buildTourDetailDTO } from "@/lib/build-responses/build-tour-details";
import { ASSET_TYPE } from "@/constants/common/asset.const";
import { MODERATION_STATUS, TOUR_STATUS } from "@/constants/tour/tour.const";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";
import { auditTourMutation, requireSessionUserId } from "@/lib/audit/tour-audit";


/**
 * Update hero image
 */
export const PATCH = withErrorHandler(
    async (
        request: NextRequest,
        { params }: { params: Promise<{ tourId: string }> }
    ) => {
        await ConnectDB();

        const tourId = resolveMongoId((await params).tourId);
        const userId = await requireSessionUserId();

        if (!tourId) {
            throw new ApiError("Invalid tour ID", 400);
        }

        const { heroImage } = (await request.json()) as UpdateTourHeroImageDTO;


        const oldTour = await TourModel.findOne({ _id: tourId, deletedAt: null });
        if (!oldTour) throw new ApiError("Tour not found", 404);

        const existingDocs = oldTour.heroImage
            ? [{ type: ASSET_TYPE.IMAGE, asset: oldTour.heroImage as Types.ObjectId }]
            : [];
            
        const incoming = (heroImage && heroImage !== "")
            ? [{ url: heroImage, type: ASSET_TYPE.IMAGE }]
            : [];

        // Resolve documents OUTSIDE transaction so slow Cloudinary uploads don't cause MongoDB NoSuchTransaction aborts
        const { resolveDocuments } = await import('@/lib/cloudinary/resolve.cloudinary');
        const { resolvedDocs, assetsToDelete } = await resolveDocuments(
            incoming,
            existingDocs,
            ASSET_TYPE.IMAGE,
            undefined as unknown as ClientSession
        );

        const updatedTourId = await withTransaction<Types.ObjectId>(
            async (session) => {
                const tour = await TourModel.findOne({
                    _id: tourId,
                    deletedAt: null,
                }).session(session);

                if (!tour) throw new ApiError("Tour not found", 404);
                if (tour.status === TOUR_STATUS.TERMINATED) throw new ApiError("Tour is terminated and cannot be modified", 409);
                if (tour.status === TOUR_STATUS.ARCHIVED) throw new ApiError("Tour is archived and cannot be modified", 409);
                if (tour.status === TOUR_STATUS.ACTIVE) throw new ApiError("Completed tours cannot be modified", 409);

                if (resolvedDocs.length > 0) {
                    tour.heroImage = resolvedDocs[0].asset;
                } else {
                    tour.heroImage = null as any; // Mongoose requires null or $unset to clear a path
                }

                if (assetsToDelete.length > 0) {
                    await cleanupAssets(assetsToDelete, session);
                }

                tour.moderationStatus = MODERATION_STATUS.PENDING;
                tour.status = TOUR_STATUS.DRAFT;
                tour.updatedAt = new Date();
                await tour.save({ session });

                return tour._id as Types.ObjectId;
            }
        );

        // Build the DTO outside the transaction so it reads fully committed data.
        // The Asset + AssetFile writes from resolveDocuments (which run sessionless)
        // are guaranteed visible here since the transaction has already committed.
        const tourDetailDTO = await buildTourDetailDTO(updatedTourId);
        if (!tourDetailDTO) throw new ApiError("Tour not found after update", 500);

        await auditTourMutation(userId, tourId, "Updated tour hero image");

        return { data: tourDetailDTO.heroImage, status: 200 };
    }
);