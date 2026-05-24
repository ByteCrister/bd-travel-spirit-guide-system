import { NextRequest } from "next/server";
import { stripe } from "@/config/stripe";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";

export const POST = withErrorHandler(async (req: NextRequest) => {
    const body = await req.json();
    const paymentMethodId = typeof body.paymentMethodId === "string" ? body.paymentMethodId.trim() : "";

    if (!paymentMethodId || !paymentMethodId.startsWith("pm_")) {
        throw new ApiError("Valid paymentMethodId is required", 400);
    }

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    if (!paymentMethod || paymentMethod.type !== "card") {
        throw new ApiError("Invalid or non‑card payment method", 400);
    }

    // Return only the necessary card details
    return {
        data: {
            brand: paymentMethod.card?.brand,
            last4: paymentMethod.card?.last4,
            expMonth: paymentMethod.card?.exp_month,
            expYear: paymentMethod.card?.exp_year,
        },
    };
});