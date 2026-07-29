import { NextResponse } from "next/server";
import ConnectDB from "@/config/db";
import TourModel from "@/models/tours/tour.model";
import { TOUR_DISCOUNT_TYPE, TOUR_DISCOUNT } from "@/constants/tour/tour.const";

export async function POST() {
    try {
        await ConnectDB();

        const tours = await TourModel.find({ 
            discounts: { $exists: true, $not: { $size: 0 } } 
        });

        let updatedCount = 0;

        for (const tour of tours) {
            if (!tour.discounts || tour.discounts.length === 0) continue;

            // 1. Find if there is any FIXED discount
            let targetDiscount = tour.discounts.find(d => d.discount === TOUR_DISCOUNT.FIXED);

            // 2. If no FIXED discount, take the first discount available
            if (!targetDiscount) {
                targetDiscount = tour.discounts[0];
            }

            // 3. Ensure the type is either PERCENTAGE or FLAT_AMOUNT
            let newType = targetDiscount.type;
            if (newType !== TOUR_DISCOUNT_TYPE.PERCENTAGE && newType !== TOUR_DISCOUNT_TYPE.FLAT_AMOUNT) {
                newType = TOUR_DISCOUNT_TYPE.FLAT_AMOUNT; // Fallback
            }

            // 4. Ensure value constraints (e.g., if percentage, 1-100)
            let newValue = targetDiscount.value;
            if (newType === TOUR_DISCOUNT_TYPE.PERCENTAGE) {
                if (newValue > 100) {
                    // If it was meant to be a flat amount but marked as percentage by mistake,
                    // calculate the actual percentage based on base price, or just cap it at 100.
                    // For safety, let's calculate what percentage of basePrice it is.
                    const calcPct = Math.round((newValue / tour.basePrice.amount) * 100);
                    newValue = Math.min(100, Math.max(1, calcPct));
                } else if (newValue < 1) {
                    newValue = 1;
                }
            }

            // 5. Update the tour to have exactly ONE discount, which is FIXED.
            tour.discounts = [{
                type: newType,
                discount: TOUR_DISCOUNT.FIXED,
                value: newValue,
                code: targetDiscount.code,
                validFrom: targetDiscount.validFrom,
                validUntil: targetDiscount.validUntil,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }] as any;

            await tour.save();
            updatedCount++;
        }

        return NextResponse.json({
            message: "Successfully updated tour discounts",
            toursProcessed: tours.length,
            toursUpdated: updatedCount
        }, { status: 200 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Test Update Tour Discount Type Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
