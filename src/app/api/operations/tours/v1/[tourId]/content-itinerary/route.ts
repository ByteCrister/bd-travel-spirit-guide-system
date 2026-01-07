// api/operations/tours/v1/[tourId]/content-itinerary

import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { cleanupAssets } from "@/lib/cloudinary/delete.cloudinary";
import ConnectDB from "@/config/db";
import { validateTourUpdateSchema } from "@/utils/validators/tour/update-tour.validator";
import { Step2ContentSchema } from "@/utils/validators/tour/add-tour.validator";
import { UpdateTourContentItineraryDTO } from "@/types/tour.types";
import TourModel, { ITour } from "@/models/tours/tour.model";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { decodeId } from "@/utils/helpers/mongodb-id-conversions";
import { MODERATION_STATUS, TOUR_STATUS } from "@/constants/tour.const";

// helper that preserves key-value coupling
function setIfDefined<K extends keyof ITour>(
    target: Partial<ITour>,
    source: Partial<Record<K, ITour[K]>>,
    key: K
) {
    const value = source[key];
    if (value !== undefined) {
        target[key] = value;
    }
}

// Collect asset IDs from a Tour document
function collectImageAssetIdsFromTour(tour: ITour): Set<string> {
    const ids = new Set<string>();

    tour?.destinations?.forEach((dest) => {
        dest.images?.forEach((id: Types.ObjectId) => {
            ids.add(id.toString());
        });

        dest.attractions?.forEach((attr) => {
            attr.images?.forEach((id: Types.ObjectId) => {
                ids.add(id.toString());
            });
        });
    });

    return ids;
}

// Collect asset IDs from incoming payload
function collectImageAssetIdsFromPayload(
    data: UpdateTourContentItineraryDTO
): Set<string> {
    const ids = new Set<string>();

    data?.destinations?.forEach((dest) => {
        dest.imageIds?.forEach((id: string) => {
            if (Types.ObjectId.isValid(id)) ids.add(id);
        });

        dest.attractions?.forEach((attr) => {
            attr.imageIds?.forEach((id: string) => {
                if (Types.ObjectId.isValid(id)) ids.add(id);
            });
        });
    });

    return ids;
}

/**
 * Update Step-2 Content Itinerary
 */
export const PATCH = withErrorHandler(
    async (
        request: NextRequest,
        { params }: { params: Promise<{ tourId: string }> }
    ) => {
        const tourId = decodeId(decodeURIComponent((await params).tourId));

        // Validate tour ID
        if (!tourId || !Types.ObjectId.isValid(tourId)) {
            throw new ApiError("Invalid tour ID", 400);
        }

        // Parse and validate request body
        const body = await request.json();
        const validatedData =
            validateTourUpdateSchema<UpdateTourContentItineraryDTO>(
                Step2ContentSchema,
                body
            );

        // Connect to database
        await ConnectDB();

        // Execute within transaction
        const result = await withTransaction(async (session) => {
            // Find existing tour
            const existingTour = await TourModel.findOne({
                _id: tourId,
                deletedAt: null,
            }).session(session);

            if (!existingTour) {
                throw new ApiError("Tour not found", 404);
            }

            if (existingTour.status === TOUR_STATUS.TERMINATED) {
                throw new ApiError("Tour is terminated and cannot be modified", 409);
            }

            if (existingTour.status === TOUR_STATUS.ARCHIVED) {
                throw new ApiError("Tour is archived and cannot be modified", 409);
            }

            if (existingTour.status === TOUR_STATUS.ACTIVE) {
                throw new ApiError("Completed tours cannot be modified", 409);
            }

            /** 1️⃣ Collect OLD referenced images */
            const oldImageIds = collectImageAssetIdsFromTour(existingTour);

            /** 2️⃣ Collect NEW referenced images */
            const newImageIds = collectImageAssetIdsFromPayload(validatedData);

            /** 3️⃣ Find ORPHANED assets */
            const assetsToDelete = [...oldImageIds].filter(
                (id) => !newImageIds.has(id)
            );

            /** 4️⃣ Update ONLY non-image fields */
            const updateObj: Partial<ITour> = {};

            // destinations handled explicitly (correct)
            if (validatedData.destinations) {
                updateObj.destinations = validatedData.destinations.map((dest) => ({
                    description: dest.description,
                    highlights: dest.highlights,
                    activities: dest.activities,
                    attractions: dest.attractions?.map((attr) => ({
                        title: attr.title,
                        description: attr.description,
                        bestFor: attr.bestFor,
                        insiderTip: attr.insiderTip,
                        address: attr.address,
                        openingHours: attr.openingHours,
                        coordinates: attr.coordinates,
                        images: attr.imageIds?.map((id) => new Types.ObjectId(id)),
                    })),
                    images: dest.imageIds?.map((id) => new Types.ObjectId(id)),
                    coordinates: dest.coordinates,
                }));
            }

            // Safe, type-correct assignments
            setIfDefined(updateObj, validatedData, "itinerary");
            setIfDefined(updateObj, validatedData, "inclusions");
            setIfDefined(updateObj, validatedData, "exclusions");
            setIfDefined(updateObj, validatedData, "difficulty");
            setIfDefined(updateObj, validatedData, "bestSeason");
            setIfDefined(updateObj, validatedData, "audience");
            setIfDefined(updateObj, validatedData, "categories");
            setIfDefined(updateObj, validatedData, "translations");

            updateObj.moderationStatus = MODERATION_STATUS.PENDING;
            updateObj.status = TOUR_STATUS.DRAFT;

            const updatedTour = await TourModel.findByIdAndUpdate(
                tourId,
                { $set: updateObj },
                { new: true, session, runValidators: true }
            );

            if (!updatedTour) {
                throw new ApiError("Failed to update tour", 500);
            }

            /** 5️⃣ Delete orphaned assets */
            if (assetsToDelete.length > 0) {
                await cleanupAssets(
                    assetsToDelete.map((id) => new Types.ObjectId(id)),
                    session
                );
            }

            return {
                deletedAssets: assetsToDelete,
                updatedFields: Object.keys(updateObj),
            };
        });

        return {
            data: result,
            status: 200,
        };
    }
);
