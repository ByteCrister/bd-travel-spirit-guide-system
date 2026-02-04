// api/test/create-faqs/route.ts
import { Types } from "mongoose";
import { MODERATION_STATUS } from "@/constants/tour.const";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { TourFAQModel } from "@/models/tours/tourFAQ.model";
import ConnectDB from "@/config/db";

async function createTestFAQHandler() {
    /**
     * TEST VARIABLES (replace with real IDs)
     */
    const tourId = new Types.ObjectId("697b9332224e38cd018b70e3");
    const travelerId = new Types.ObjectId("6982ca2c3afd45667a05b575");

    await ConnectDB();

    /**
     * Create FAQ
     */
    const faq = await TourFAQModel.create({
        tour: tourId,
        askedBy: travelerId,
        question: "Is this tour suitable for beginners?",
        answer: undefined, // not answered yet
        status: MODERATION_STATUS.PENDING,
        isActive: true,

        likes: [],
        dislikes: [],
        reports: [],
    });

    return {
        status: 201,
        data: {
            message: "Test FAQ created successfully",
            faq,
        },
    };
}

export const POST = withErrorHandler(createTestFAQHandler);