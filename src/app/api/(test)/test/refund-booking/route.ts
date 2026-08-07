// app/api/(test)/test/refund-booking/route.ts
//
// Test route: Simulate a full refund flow for a confirmed booking.
//
// Flow:
//  1. Lookup the confirmed booking by bookingId
//  2. Lookup the tour → guide (companyId) for the notification scope
//  3. Find the traveler's Stripe payment account
//  4. Find the admin block account (to debit the held funds back)
//  5. Issue a Stripe refund via the PaymentIntent stored on the booking
//  6. Mark the booking as REFUNDED + set cancellation details
//  7. Record a refund transaction entry on the traveler's account
//  8. Create a GuideSystemNotification (REFUND_REQUESTED type) scoped to the guide
//
// Body: { bookingId: string, reason?: string }

import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import ConnectDB from "@/config/db";
import BookingModel, { IBooking } from "@/models/tours/booking.model";
import TourModel from "@/models/tours/tour.model";
import StripePaymentAccountModel from "@/models/payments/payment-account.model";
import { TransactionModel } from "@/models/payments/transaction.model";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { GuideSystemNotificationModel } from "@/models/notifications/guide-system-notification.model";
import {
    GUIDE_SYSTEM_NOTIFICATION_TYPE,
    GUIDE_SYSTEM_NOTIFICATION_PRIORITY,
} from "@/constants/notifications/guide-system-notification.const";
import {
    BOOKING_STATUS,
    BOOKING_PAYMENT_STATUS,
} from "@/constants/tour/tour-booking.const";
import { PAYMENT_OWNER_TYPE, PAYMENT_PURPOSE } from "@/constants/payment/payment.const";
import { TRANSACTION_STATUS } from "@/constants/payment/transaction.const";
import { stripe } from "@/config/stripe";

export async function POST(req: NextRequest) {
    try {
        await ConnectDB();

        const body = await req.json();
        const { bookingId, reason } = body;

        if (!bookingId) {
            return NextResponse.json({ error: "Missing required field: bookingId" }, { status: 400 });
        }

        if (!Types.ObjectId.isValid(bookingId)) {
            return NextResponse.json({ error: "Invalid bookingId" }, { status: 400 });
        }

        // 1. Fetch the booking (bypass soft-delete filter for test utility)
        const booking = await BookingModel.findById(bookingId).setOptions({ includeDeleted: true });
        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // 2. Validate state — only CONFIRMED bookings can be refunded
        if (booking.status !== BOOKING_STATUS.CONFIRMED) {
            return NextResponse.json(
                { error: `Booking is ${booking.status}. Only confirmed bookings can be refunded.` },
                { status: 400 }
            );
        }

        const stripeTransactionId = booking.payment?.transactionId;
        if (!stripeTransactionId) {
            return NextResponse.json({ error: "Booking has no Stripe transaction ID — cannot refund" }, { status: 400 });
        }

        // 3. Find the tour to get the guide (companyId) for notification scoping
        const tour = await TourModel.findById(booking.tour).select("companyId title").lean();
        if (!tour) {
            return NextResponse.json({ error: "Associated tour not found" }, { status: 404 });
        }

        if (!tour.companyId) {
            return NextResponse.json({ error: "Tour has no owning guide (companyId)" }, { status: 400 });
        }

        // 4. Find the traveler's Stripe payment account
        //    The traveler ID is stored on the booking as a reference to the Traveler document.
        const travelerAccount = await StripePaymentAccountModel.findOne({
            ownerType: PAYMENT_OWNER_TYPE.TRAVELER,
            isActive: true,
            isDeleted: false
        });

        if (!travelerAccount) {
            return NextResponse.json({ error: "Traveler payment account not found" }, { status: 404 });
        }

        // 5. Find the Admin Block Account (the funds were held here)
        const adminBlockAccount = await StripePaymentAccountModel.findOne({
            ownerType: PAYMENT_OWNER_TYPE.ADMIN,
            purpose: PAYMENT_PURPOSE.BLOCK_ACCOUNT,
            isActive: true,
            isDeleted: false
        });

        if (!adminBlockAccount) {
            return NextResponse.json({ error: "Admin block account not found" }, { status: 404 });
        }

        // 6. Issue Stripe refund using the PaymentIntent ID stored on the booking
        const refundAmountCents = Math.round(booking.totalPaid * 100);

        const stripeRefund = await stripe.refunds.create({
            payment_intent: stripeTransactionId,
            amount: refundAmountCents,
            reason: "requested_by_customer",
        });

        if (stripeRefund.status !== "succeeded") {
            return NextResponse.json(
                { error: `Stripe refund failed with status: ${stripeRefund.status}` },
                { status: 502 }
            );
        }

        // 7. Persist all DB changes atomically
        const result = await withTransaction(async (session) => {
            // Cancel the booking with refund metadata
            const cancelledBy = booking.traveler as Types.ObjectId; // traveler requested
            const cancelledBooking = await BookingModel.cancelBooking(
                booking._id as Types.ObjectId,
                {
                    session,
                    cancelledBy,
                    reason: reason?.trim() || "Refund requested by traveler",
                    refundAmount: booking.totalPaid,
                    refundStatus: BOOKING_PAYMENT_STATUS.REFUNDED,
                }
            ) as IBooking;

            // Update booking status to REFUNDED and payment status
            cancelledBooking.status = BOOKING_STATUS.REFUNDED;
            cancelledBooking.payment = {
                ...cancelledBooking.payment,
                status: BOOKING_PAYMENT_STATUS.REFUNDED,
            };
            await cancelledBooking.save({ session });

            // Record refund transaction on the traveler's payment account
            await TransactionModel.create(
                [{
                    paymentAccountId: travelerAccount._id,
                    stripePaymentIntentId: stripeRefund.id,   // Stripe refund ID
                    amount: refundAmountCents,
                    currency: "bdt",
                    status: TRANSACTION_STATUS.SUCCEEDED,
                    description: `Refund for booking ${cancelledBooking.bookingReference} — ${stripeRefund.id}`,
                }],
                { session }
            );

            // Record debit of held funds from Admin Block Account
            await TransactionModel.create(
                [{
                    paymentAccountId: adminBlockAccount._id,
                    stripePaymentIntentId: `refund_debit_${stripeRefund.id}`,
                    amount: refundAmountCents,
                    currency: "bdt",
                    status: TRANSACTION_STATUS.SUCCEEDED,
                    description: `Block account debit — refund released for booking ${cancelledBooking.bookingReference}`,
                }],
                { session }
            );

            // 8. Fire a guide-scoped REFUND_REQUESTED notification
            await GuideSystemNotificationModel.create(
                [{
                    type: GUIDE_SYSTEM_NOTIFICATION_TYPE.REFUND_REQUESTED,
                    title: "Booking Refunded",
                    message: `Booking ${cancelledBooking.bookingReference} has been refunded. Amount: ${cancelledBooking.totalPaid} BDT. Reason: ${reason?.trim() || "Requested by traveler"}.`,
                    priority: GUIDE_SYSTEM_NOTIFICATION_PRIORITY.HIGH,
                    relatedModel: "Booking",
                    relatedId: cancelledBooking._id as Types.ObjectId,
                    guide: new Types.ObjectId(tour.companyId as Types.ObjectId),
                }],
                { session }
            );

            return cancelledBooking;
        });

        return NextResponse.json({
            message: "Test refund processed successfully",
            data: {
                bookingId: (result._id as Types.ObjectId).toString(),
                bookingReference: result.bookingReference,
                status: result.status,
                paymentStatus: result.payment?.status,
                refundAmountBDT: result.totalPaid,
                stripeRefundId: stripeRefund.id,
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Test Refund Booking Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
