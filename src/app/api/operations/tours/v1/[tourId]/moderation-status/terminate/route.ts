// api/operations/tours/v1/[tourId]/terminate/route.ts
import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import TourModel from "@/models/tours/tour.model";
import BookingModel from "@/models/tours/booking.model";
import { TransactionModel } from "@/models/payments/transaction.model";
import { buildTourDetailDTO } from "@/lib/build-responses/build-tour-details";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";
import { USER_ROLE } from "@/constants/current-user/user.const";
import { BOOKING_STATUS, BOOKING_PAYMENT_STATUS } from "@/constants/tour/tour-booking.const";
import ConnectDB from "@/config/db";
import { auditTourMutation } from "@/lib/audit/tour-audit";
import { stripe } from "@/config/stripe";

type Params = Promise<{ tourId: string }>;

interface TerminateTourRequest {
    reason?: string;
}

/**
 * Handler to terminate/archive/soft delete a tour
 * 
 * This endpoint:
 * 1. Validates the authenticated user
 * 2. Uses a transaction for data consistency
 * 3. Calls TourModel.terminateById to update tour status
 * 4. Returns the updated tour details using buildTourDetailDTO
 */
const terminateTourHandler = async (
    req: NextRequest,
    { params }: { params: Params }
) => {
    const tourId = resolveMongoId((await params).tourId);

    // Validate tourId
    if (!tourId || !Types.ObjectId.isValid(tourId)) {
        throw new ApiError("Valid tour ID is required", 400);
    }

    // Get authenticated user
    const currentUserId = await getUserIdFromSession();
    if (!currentUserId) {
        throw new ApiError("Authentication required", 401);
    }

    await ConnectDB();

    await VERIFY_USER_ROLE.MULTIPLE(currentUserId, [USER_ROLE.ASSISTANT, USER_ROLE.GUIDE]);

    // Parse request body
    const requestBody = await req.json() as TerminateTourRequest;

    // Fetch exchange rate outside the transaction to minimize transaction duration
    let exchangeRate = 1;
    try {
        const rateResponse = await fetch("https://api.exchangerate-api.com/v4/latest/BDT");
        if (rateResponse.ok) {
            const rateData = await rateResponse.json();
            if (rateData?.rates?.USD) {
                exchangeRate = rateData.rates.USD;
            }
        }
    } catch (e) {
        console.warn("Failed to fetch exchange rate", e);
    }

    // Use transaction for consistency
    const tourDetailDTO = await withTransaction(async (session) => {
        // Terminate the tour using the model method
        const tour = await TourModel.terminateById(
            new Types.ObjectId(tourId),
            {
                terminatedBy: new Types.ObjectId(currentUserId),
                reason: requestBody.reason,
                session
            }
        );

        if (!tour) {
            throw new ApiError("Tour not found or could not be terminated", 404);
        }

        // Process refunds for active bookings
        const activeBookings = await BookingModel.find({
            tour: new Types.ObjectId(tourId),
            status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED] },
            deletedAt: null
        }).session(session);

        for (const booking of activeBookings) {
            let refunded = false;
            let refundAmountUSD = 0;
            
            // Refund via Stripe if a valid transaction exists
            if (booking.payment?.transactionId) {
                const transaction = await TransactionModel.findById(booking.payment.transactionId).session(session);
                if (transaction && transaction.stripePaymentIntentId) {
                    try {
                        await stripe.refunds.create({
                            payment_intent: transaction.stripePaymentIntentId
                        });
                        refunded = true;
                        refundAmountUSD = booking.totalPaid * exchangeRate;
                    } catch (err) {
                        console.error(`Stripe refund failed for booking ${booking._id}:`, err);
                        throw new ApiError(`Failed to process refund for booking ${booking.bookingReference}`, 500);
                    }
                }
            }
            
            // Cancel the booking and record the refund
            await BookingModel.cancelBooking(
                booking._id as Types.ObjectId,
                {
                    session,
                    cancelledBy: new Types.ObjectId(currentUserId),
                    reason: `Tour terminated by guide/assistant. Refunded equivalent to $${refundAmountUSD.toFixed(2)} USD.`,
                    refundAmount: booking.totalPaid,
                    refundStatus: refunded ? BOOKING_PAYMENT_STATUS.REFUNDED : BOOKING_PAYMENT_STATUS.PENDING
                }
            );
        }

        // Build the detailed DTO for response
        return await buildTourDetailDTO(tour._id as Types.ObjectId, session);
    });

    await auditTourMutation(currentUserId, tourId, "Terminated tour");

    return {
        data: tourDetailDTO,
        status: 200
    };
};

// Export the handler wrapped with error handling
export const POST = withErrorHandler(terminateTourHandler);