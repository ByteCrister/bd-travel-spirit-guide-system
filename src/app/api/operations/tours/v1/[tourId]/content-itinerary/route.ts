// api/operations/tours/v1/[tourId]/content-itinerary

import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { cleanupAssets } from "@/lib/cloudinary/delete.cloudinary";
import ConnectDB from "@/config/db";
import { validateUpdatedYupSchema } from "@/utils/validators/common/update-updated-yup-schema";
import { Step2ContentSchema } from "@/utils/validators/tour/add-tour.validator";
import { UpdateTourContentItineraryDTO } from "@/types/tour/tour.types";
import TourModel, { ITour } from "@/models/tours/tour.model";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { MODERATION_STATUS, TOUR_STATUS } from "@/constants/tour/tour.const";
import { buildTourDetailDTO } from "@/lib/build-responses/build-tour-details";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";
import { auditTourMutation, requireSessionUserId } from "@/lib/audit/tour-audit";

// helper that preserves key-value coupling
function setIfDefined<K extends keyof ITour>(
    target: Partial<ITour>,
    source: Partial<Record<K, ITour[K]>>,
    key: K
) {
    if (source[key] !== undefined) {
        target[key] = source[key];
    }
}

export const PATCH = withErrorHandler(
    async (
        request: NextRequest,
        { params }: { params: Promise<{ tourId: string }> }
    ) => {
        const tourId = resolveMongoId((await params).tourId);
        const userId = await requireSessionUserId();

        if (!tourId || !Types.ObjectId.isValid(tourId)) {
            throw new ApiError("Invalid tour ID", 400);
        }

        const body = await request.json();
        const validatedData =
            validateUpdatedYupSchema<UpdateTourContentItineraryDTO>(
                Step2ContentSchema,
                body
            );

        await ConnectDB();

        const result = await withTransaction(async (session) => {
            const existingTour = await TourModel.findOne({
                _id: tourId,
                deletedAt: null,
            }).session(session);

            if (!existingTour) {
                throw new ApiError("Tour not found", 404);
            }

            if (
                existingTour.status === TOUR_STATUS.TERMINATED ||
                existingTour.status === TOUR_STATUS.ARCHIVED ||
                existingTour.status === TOUR_STATUS.ACTIVE
            ) {
                throw new ApiError("Tour cannot be modified in current state", 409);
            }

            /**
             * 1️⃣ Detect REMOVED destinations & attractions
             */
            const assetsToDelete: Types.ObjectId[] = [];
            const existingDestinations = existingTour.destinations ?? [];
            const incomingDestinations = validatedData.destinations ?? [];


            const existingDestMap = new Map<string, NonNullable<ITour["destinations"]>[number]>();

            for (const dest of existingDestinations) {
                if (!dest._id) continue;
                existingDestMap.set(dest._id.toString(), dest);
            }

            const incomingDestIds = new Set<string>();

            for (const dest of incomingDestinations) {
                if (dest.id && Types.ObjectId.isValid(dest.id)) {
                    incomingDestIds.add(dest.id);
                }
            }

            // Removed destinations
            for (const dest of existingDestinations) {
                if (!dest._id) continue;

                if (!incomingDestIds.has(dest._id.toString())) {
                    dest.images?.forEach((id) => assetsToDelete.push(id));
                    dest.attractions?.forEach((attr) => {
                        attr.images?.forEach((id) => assetsToDelete.push(id));
                    });
                }
            }

            // Removed attractions inside existing destinations
            validatedData.destinations?.forEach((incomingDest) => {
                if (!incomingDest.id) return;

                const existingDest = existingDestMap.get(incomingDest.id);
                if (!existingDest) return;

                const incomingAttrIds = new Set(
                    incomingDest.attractions
                        ?.filter((a) => a.id)
                        .map((a) => a.id!)
                );

                existingDest.attractions?.forEach((attr) => {
                    if (!attr._id) return;
                    if (!incomingAttrIds.has(attr?._id.toString())) {
                        attr.images?.forEach((id) => assetsToDelete.push(id));
                    }
                });
            });

            /**
             * 2️⃣ Build update object (preserve _id)
             */
            const updateObj: Partial<ITour> = {};

            if (validatedData.destinations) {
                updateObj.destinations = validatedData.destinations.map((dest) => ({
                    ...(dest.id && { _id: new Types.ObjectId(dest.id) }),
                    description: dest.description,
                    highlights: dest.highlights,
                    activities: dest.activities,
                    coordinates: dest.coordinates,
                    images: dest.imageIds?.map((img) => new Types.ObjectId(img.id)) ?? [],
                    attractions: dest.attractions?.map((attr) => ({
                        ...(attr.id && { _id: new Types.ObjectId(attr.id) }),
                        title: attr.title,
                        description: attr.description,
                        bestFor: attr.bestFor,
                        insiderTip: attr.insiderTip,
                        address: attr.address,
                        openingHours: attr.openingHours,
                        coordinates: attr.coordinates,
                        images: attr.imageIds?.map((img) => new Types.ObjectId(img.id)) ?? [],
                    })),
                }));
            }

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

            /**
             * 3️⃣ Cleanup removed assets
             */
            if (assetsToDelete.length > 0) {
                await cleanupAssets(assetsToDelete, session);
            }

            const detailDto = await buildTourDetailDTO((updatedTour._id as Types.ObjectId), session);

            return {
                destinations: detailDto.destinations,
                itinerary: detailDto.itinerary,
                inclusions: detailDto.inclusions,
                exclusions: detailDto.exclusions,
                difficulty: detailDto.difficulty,
                bestSeason: detailDto.bestSeason,
                audience: detailDto.audience,
                categories: detailDto.categories,
                translations: detailDto.translations,
            };
        });

        await auditTourMutation(userId, tourId, "Updated tour content and itinerary");

        return {
            data: result,
            status: 200,
        };
    }
);