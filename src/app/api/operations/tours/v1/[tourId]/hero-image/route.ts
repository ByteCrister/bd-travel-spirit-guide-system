// app/api/operations/tours/v1/[tourId]/hero-image/route.ts
import { NextRequest } from "next/server";
import mongoose, { Types } from "mongoose";
import { uploadAssets } from "@/lib/cloudinary/upload.cloudinary";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { UpdateTourHeroImageDTO, TourDetailDTO } from "@/types/tour/tour.types";
import ConnectDB from "@/config/db";
import TourModel from "@/models/tours/tour.model";
import { cleanupAssets } from "@/lib/cloudinary/delete.cloudinary";
import { buildTourDetailDTO } from "@/lib/build-responses/build-tour-details";
import { ASSET_TYPE } from "@/constants/common/asset.const";
import { MODERATION_STATUS, TOUR_STATUS } from "@/constants/tour/tour.const";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";

// Asset helper functions
const AssetHelper = {
    isBase64DataUrl: (str: string): boolean =>
        str.startsWith("data:") && str.includes("base64,"),
    isValidObjectId: (id: string): boolean => mongoose.Types.ObjectId.isValid(id),
};

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

        if (!tourId) {
            throw new ApiError("Invalid tour ID", 400);
        }

        const { heroImage } = (await request.json()) as UpdateTourHeroImageDTO;

        // Validate inputs
        if (!tourId || !AssetHelper.isValidObjectId(tourId)) {
            throw new ApiError("Invalid tour ID", 400);
        }

        const tourDetailDTO = await withTransaction<TourDetailDTO>(
            async (session) => {

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

                const oldHeroImage = tour.heroImage;

                // Handle different heroImage values
                if (heroImage === undefined || heroImage === null || heroImage === "") {
                    // Remove hero image
                    if (oldHeroImage) {
                        await cleanupAssets(
                            [oldHeroImage as mongoose.Types.ObjectId],
                            session
                        );
                        tour.heroImage = undefined;
                    }
                } else if (AssetHelper.isBase64DataUrl(heroImage)) {
                    // Upload base64 image
                    const [newAssetId] = await uploadAssets(
                        [
                            {
                                base64: heroImage,
                                name: `tour-hero-${tourId}`,
                                assetType: ASSET_TYPE.IMAGE,
                            },
                        ],
                        session
                    );
                    if (!newAssetId) throw new ApiError("Failed to upload image", 500);

                    tour.heroImage = newAssetId;
                }

                tour.moderationStatus = MODERATION_STATUS.PENDING;
                tour.status = TOUR_STATUS.DRAFT;
                tour.updatedAt = new Date();
                await tour.save({ session });

                const detailDto: TourDetailDTO | null = await buildTourDetailDTO(
                    tour._id as Types.ObjectId,
                    session
                );
                if (!detailDto) throw new ApiError("Tour not found after update", 500);

                return detailDto;
            }
        );

        return { data: tourDetailDTO.heroImage, status: 200 };
    }
);