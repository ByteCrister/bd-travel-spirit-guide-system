import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import ConnectDB from "@/config/db";
import TourModel from "@/models/tours/tour.model";
import { TravelerModel } from "@/models/travelers/traveler.model";
import StripePaymentAccountModel from "@/models/payments/payment-account.model";
import { PAYMENT_OWNER_TYPE, PAYMENT_PURPOSE } from "@/constants/payment/payment.const";
import { chargeStripePaymentAccount, recordSettlementTransaction } from "@/lib/payments/stripe-charge.service";
import BookingModel, { IBooking } from "@/models/tours/booking.model";
import { TOUR_DISCOUNT_TYPE, TOUR_DISCOUNT, PAYMENT_METHOD } from "@/constants/tour/tour.const";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { GuideSystemNotificationModel } from "@/models/notifications/guide-system-notification.model";
import {
    GUIDE_SYSTEM_NOTIFICATION_TYPE,
    GUIDE_SYSTEM_NOTIFICATION_PRIORITY,
} from "@/constants/notifications/guide-system-notification.const";

export async function POST(req: NextRequest) {
    try {
        await ConnectDB();

        const body = await req.json();
        const { userId, seats, tourId } = body;

        if (!userId || !seats || !tourId) {
            return NextResponse.json({ error: "Missing required fields: userId, seats, tourId" }, { status: 400 });
        }

        // 1. Fetch Tour (with companyId so we can scope the notification to the owning guide)
        const tour = await TourModel.findById(tourId).select("basePrice discounts uniqueTourCode companyId").lean();
        if (!tour) {
            return NextResponse.json({ error: "Tour not found" }, { status: 404 });
        }

        if (!tour.companyId) {
            return NextResponse.json({ error: "Tour has no owning guide (companyId)" }, { status: 400 });
        }

        const traveler = await TravelerModel.findOne({ user: new Types.ObjectId(userId) });
        if (!traveler) {
            return NextResponse.json({ error: "Traveler not found for this user" }, { status: 404 });
        }

        // 2. Calculate Price
        const basePrice = tour.basePrice.amount;
        let discountValue = 0;
        let appliedDiscount = undefined;

        if (tour.discounts && tour.discounts.length > 0) {
            const activeDiscounts = tour.discounts.filter(d =>
                d.discount === TOUR_DISCOUNT.FIXED &&
                (!d.validFrom || d.validFrom <= new Date()) &&
                (!d.validUntil || d.validUntil >= new Date())
            );

            if (activeDiscounts.length > 0) {
                const d = activeDiscounts[0];
                if (d.type === TOUR_DISCOUNT_TYPE.PERCENTAGE) {
                    discountValue = (basePrice * d.value) / 100;
                } else if (d.type === TOUR_DISCOUNT_TYPE.FLAT_AMOUNT) {
                    discountValue = d.value;
                }
                appliedDiscount = {
                    type: d.type,
                    discount: d.discount,
                    value: discountValue
                };
            }
        }

        const finalPricePerSeat = Math.max(0, basePrice - discountValue);
        const totalAmount = finalPricePerSeat * seats;

        // Stripe requires amount in cents. BDT has 100 poisha per Taka.
        const amountCents = Math.round(totalAmount * 100);

        // 3. Find Traveler Payment Account
        const travelerAccount = await StripePaymentAccountModel.findOne({
            ownerType: PAYMENT_OWNER_TYPE.TRAVELER,
            ownerId: new Types.ObjectId(userId),
            isActive: true,
            isDeleted: false
        });

        if (!travelerAccount) {
            return NextResponse.json({ error: "Traveler payment account not found" }, { status: 404 });
        }

        // 4. Find Admin Block Account
        const adminAccount = await StripePaymentAccountModel.findOne({
            ownerType: PAYMENT_OWNER_TYPE.ADMIN,
            purpose: PAYMENT_PURPOSE.BLOCK_ACCOUNT,
            isActive: true,
            isDeleted: false
        });

        if (!adminAccount) {
            return NextResponse.json({ error: "Admin block account not found" }, { status: 404 });
        }

        // 5. Perform Transaction, Booking & Notification inside a single atomic session
        const result = await withTransaction(async (session) => {
            // Create booking in pending state
            let booking = await BookingModel.createBooking(
                traveler._id as Types.ObjectId,
                new Types.ObjectId(tourId),
                {
                    totalParticipants: seats,
                    discounts: appliedDiscount ? [appliedDiscount] : [],
                    totalPaid: totalAmount
                },
                { session }
            );

            // Charge the traveler via Stripe
            const chargeResult = await chargeStripePaymentAccount({
                paymentAccountId: travelerAccount._id as Types.ObjectId,
                amountCents,
                currency: 'bdt',
                description: `Payment for booking ${booking.bookingReference}`,
                session
            });

            // Record settlement in Admin Block Account ledger
            await recordSettlementTransaction({
                paymentAccountId: adminAccount._id as Types.ObjectId,
                amountCents,
                currency: 'bdt',
                description: `Block account hold for booking ${booking.bookingReference}`,
                settlementRef: chargeResult.paymentIntentId,
                session
            });

            // Confirm the booking and mark payment as paid
            booking = await BookingModel.confirmBooking(
                booking._id as Types.ObjectId,
                {
                    session,
                    paymentDetails: {
                        method: PAYMENT_METHOD.STRIPE,
                        transactionId: chargeResult.transactionId.toString()
                    }
                }
            ) as IBooking;

            // 6. Fire a guide-scoped notification for the new confirmed booking
            await GuideSystemNotificationModel.create(
                [{
                    type: GUIDE_SYSTEM_NOTIFICATION_TYPE.NEW_BOOKING,
                    title: "New Booking Received",
                    message: `Booking ${booking.bookingReference} has been confirmed. ${seats} seat(s) booked. Total paid: ${totalAmount} BDT.`,
                    priority: GUIDE_SYSTEM_NOTIFICATION_PRIORITY.MEDIUM,
                    relatedModel: "Booking",
                    relatedId: booking._id as Types.ObjectId,
                    guide: new Types.ObjectId(tour.companyId as Types.ObjectId),
                }],
                { session }
            );

            return booking;
        });

        return NextResponse.json({
            message: "Test booking created successfully",
            data: result
        }, { status: 201 });

    } catch (error) {
        console.error("Test Create Booking Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
