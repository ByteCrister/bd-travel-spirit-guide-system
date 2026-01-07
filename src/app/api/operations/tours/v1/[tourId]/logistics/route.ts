// app/api/tours/[id]/logistics/route.ts
import { NextRequest } from "next/server";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { UpdateTourLogisticsDTO } from "@/types/tour.types";
import mongoose from "mongoose";
import { decodeId } from "@/utils/helpers/mongodb-id-conversions";
import { validateTourUpdateSchema } from "@/utils/validators/tour/update-tour.validator";
import { Step3LogisticsSchema } from "@/utils/validators/tour/add-tour.validator";
import TourModel from "@/models/tours/tour.model";
import { MODERATION_STATUS, TOUR_STATUS } from "@/constants/tour.const";

/**
 * Update Step-3 logistics
 */

export const PATCH = withErrorHandler(async (
    req: NextRequest,
    { params }: { params: Promise<{ tourId: string }> }
) => {
    const tourId = decodeId(decodeURIComponent((await params).tourId));

    // Validate tour ID
    if (!tourId || !mongoose.Types.ObjectId.isValid(tourId)) {
        throw new ApiError("Invalid tour ID", 400);
    }

    const updatePayload = await req.json();

    // Validate payload using the schema
    const validatedData = validateTourUpdateSchema<UpdateTourLogisticsDTO>(
        Step3LogisticsSchema,
        updatePayload
    );

    // Execute the update in a transaction
    const updatedTour = await withTransaction(async (session) => {
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

        // Update mainLocation if provided
        if (validatedData.mainLocation !== undefined) {
            if (validatedData.mainLocation === null) {
                // Clear the mainLocation
                tour.mainLocation = undefined;
            } else {
                // Update mainLocation fields
                if (validatedData.mainLocation.address !== undefined) {
                    tour.mainLocation = tour.mainLocation || { address: {}, coordinates: undefined };
                    tour.mainLocation.address = {
                        line1: validatedData.mainLocation.address?.line1,
                        line2: validatedData.mainLocation.address?.line2,
                        city: validatedData.mainLocation.address?.city,
                        district: validatedData.mainLocation.address?.district,
                        region: validatedData.mainLocation.address?.region,
                        postalCode: validatedData.mainLocation.address?.postalCode,
                    };
                }

                if (validatedData.mainLocation.coordinates !== undefined) {
                    tour.mainLocation = tour.mainLocation || { address: undefined, coordinates: undefined };
                    tour.mainLocation.coordinates = validatedData.mainLocation.coordinates
                        ? {
                            lat: validatedData.mainLocation.coordinates.lat,
                            lng: validatedData.mainLocation.coordinates.lng,
                        }
                        : undefined;
                }
            }
        }

        // Update transportModes if provided
        if (validatedData.transportModes !== undefined) {
            tour.transportModes = validatedData.transportModes;
        }

        // Update pickupOptions if provided
        if (validatedData.pickupOptions !== undefined) {
            // If null or empty array, clear pickupOptions
            if (!validatedData.pickupOptions || validatedData.pickupOptions.length === 0) {
                tour.pickupOptions = undefined;
            } else {
                tour.pickupOptions = validatedData.pickupOptions.map(option => ({
                    city: option.city,
                    price: option.price,
                    currency: option.currency,
                }));
            }
        }

        // Update meetingPoint if provided
        if (validatedData.meetingPoint !== undefined) {
            // If empty string, set to undefined
            tour.meetingPoint = validatedData.meetingPoint?.trim() || undefined;
        }

        // Update packingList if provided
        if (validatedData.packingList !== undefined) {
            // If null or empty array, clear packingList
            if (!validatedData.packingList || validatedData.packingList.length === 0) {
                tour.packingList = undefined;
            } else {
                tour.packingList = validatedData.packingList.map(item => ({
                    item: item.item,
                    required: item.required !== undefined ? item.required : true,
                    notes: item.notes,
                }));
            }
        }

        tour.moderationStatus = MODERATION_STATUS.PENDING;
        tour.status = TOUR_STATUS.DRAFT;
        tour.updatedAt = new Date();

        return await tour.save({ session });
    });

    // Convert to DTO format for response
    const responseData = {
        mainLocation: updatedTour.mainLocation
            ? {
                address: updatedTour.mainLocation.address,
                coordinates: updatedTour.mainLocation.coordinates,
            }
            : undefined,
        transportModes: updatedTour.transportModes,
        pickupOptions: updatedTour.pickupOptions,
        meetingPoint: updatedTour.meetingPoint,
        packingList: updatedTour.packingList,
    };

    return {
        data: responseData,
        status: 200,
    };
});