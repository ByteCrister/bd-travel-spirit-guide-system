// api/operations/tours/v1/[tourId]/pricing
import { NextRequest } from "next/server";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { UpdateTourPricingDTO } from "@/types/tour/tour.types";
import mongoose from "mongoose";
import { validateUpdatedYupSchema } from "@/utils/validators/common/update-updated-yup-schema";
import { Step4PricingSchema } from "@/utils/validators/tour/add-tour.validator";
import TourModel from "@/models/tours/tour.model";
import { MODERATION_STATUS, TOUR_DISCOUNT, TOUR_DISCOUNT_TYPE, TOUR_STATUS } from "@/constants/tour/tour.const";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";

/**
 * Update Step-4 pricing
 */
export const PATCH = withErrorHandler(async (
    req: NextRequest,
    { params }: { params: Promise<{ tourId: string }> }
) => {
    const tourId = resolveMongoId((await params).tourId);

    // Validate tour ID
    if (!tourId || !mongoose.Types.ObjectId.isValid(tourId)) {
        throw new ApiError("Invalid tour ID", 400);
    }

    const updatePayload = await req.json();

    // Validate payload using the schema
    const validatedData = validateUpdatedYupSchema<UpdateTourPricingDTO>(
        Step4PricingSchema,
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

        // Update only the provided fields
        if (validatedData.basePrice !== undefined) {
            tour.basePrice = {
                amount: validatedData.basePrice.amount,
                currency: validatedData.basePrice.currency,
            };
        }

        if (validatedData.discounts !== undefined) {
            // Convert string dates to Date objects for MongoDB
            const discounts = validatedData.discounts.map(discount => ({
                ...discount,
                type: Object.values(TOUR_DISCOUNT_TYPE).includes(discount.type as (typeof TOUR_DISCOUNT_TYPE)[keyof typeof TOUR_DISCOUNT_TYPE])
                    ? discount.type
                    : TOUR_DISCOUNT_TYPE.PERCENTAGE,
                discount: Object.values(TOUR_DISCOUNT).includes(discount.discount as (typeof TOUR_DISCOUNT)[keyof typeof TOUR_DISCOUNT])
                    ? discount.discount
                    : TOUR_DISCOUNT.SEASONAL,
                validFrom: discount.validFrom ? new Date(discount.validFrom) : undefined,
                validUntil: discount.validUntil ? new Date(discount.validUntil) : undefined,
            }));
            tour.discounts = discounts;
        }

        if (validatedData.duration !== undefined) {
            tour.duration = {
                days: validatedData.duration.days,
                nights: validatedData.duration.nights,
            };
        }

        if (validatedData.operatingWindows !== undefined) {
            const operatingWindows = validatedData.operatingWindows.map(window => ({
                ...window,
                startDate: new Date(window.startDate),
                endDate: new Date(window.endDate),
                seatsBooked: window.seatsBooked || 0,
            }));
            tour.operatingWindows = operatingWindows;
        }

        if (validatedData.departures !== undefined) {
            const currentDepartures = tour.departures || [];

            const newDepartures = validatedData.departures.map(dep => {
                const existing = currentDepartures.find(
                    d => d.date.toISOString() === new Date(dep.date).toISOString()
                );

                return {
                    date: new Date(dep.date),
                    seatsTotal: dep.seatsTotal,
                    seatsBooked: existing?.seatsBooked ?? 0,
                    meetingPoint: dep.meetingPoint,
                    meetingCoordinates: dep.meetingCoordinates,
                };
            });

            tour.departures = newDepartures;

        }

        if (validatedData.paymentMethods !== undefined) {
            tour.paymentMethods = validatedData.paymentMethods;
        }

        tour.moderationStatus = MODERATION_STATUS.PENDING;
        tour.status = TOUR_STATUS.DRAFT;
        tour.updatedAt = new Date();

        const savedTour = await tour.save({ session });
        return savedTour.toObject();
    });

    // Convert to DTO format for response
    const responseData = {
        basePrice: updatedTour.basePrice,
        discounts: updatedTour.discounts?.map(d => ({
            ...d,
            validFrom: d.validFrom?.toISOString(),
            validUntil: d.validUntil?.toISOString(),
        })) || [],
        duration: updatedTour.duration,
        operatingWindows: updatedTour.operatingWindows?.map(w => ({
            startDate: w.startDate.toISOString(),
            endDate: w.endDate.toISOString(),
            seatsTotal: w.seatsTotal,
            seatsBooked: w.seatsBooked,
        })) || [],
        departures: updatedTour.departures?.map(d => ({
            date: d.date.toISOString(),
            seatsTotal: d.seatsTotal,
            seatsBooked: d.seatsBooked,
            meetingPoint: d.meetingPoint,
            meetingCoordinates: d.meetingCoordinates,
        })) || [],
        paymentMethods: updatedTour.paymentMethods,
    };

    return {
        data: responseData,
        status: 200,
    };
});