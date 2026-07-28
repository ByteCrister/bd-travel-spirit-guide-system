// app/api/support/tour-faq/[faqId]/order/route.ts
// PUT /api/support/tour-faq/[faqId]/order — reorder FAQs within a tour

import { NextRequest } from 'next/server';
import { ApiError, withErrorHandler } from '@/lib/helpers/withErrorHandler';
import ConnectDB from '@/config/db';
import { TourFAQModel } from '@/models/tours/tourFAQ.model';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { Types } from 'mongoose';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import { getAuthorizedTourIds } from '@/lib/helpers/get-authorized-tour-ids';

type RouteContext = { params: Promise<{ faqId: string }> };

interface OrderBody {
    newOrder: number;
}

export const PUT = withErrorHandler(async (
    request: NextRequest,
    { params }: RouteContext
) => {
    await ConnectDB();

    const { faqId } = await params;

    if (!Types.ObjectId.isValid(faqId)) {
        throw new ApiError('Invalid FAQ ID', 400);
    }

    const body = (await request.json()) as OrderBody;
    const newOrder = Number(body?.newOrder);

    if (isNaN(newOrder) || newOrder < 0) {
        throw new ApiError('newOrder must be a non-negative number', 400);
    }

    const result = await withTransaction(async (session) => {
        // Find the FAQ being reordered
        const targetFaq = await TourFAQModel.findOne(
            { _id: faqId, deletedAt: null },
            null,
            { session }
        );

        if (!targetFaq) {
            throw new ApiError('FAQ not found', 404);
        }

        const userId = await getUserIdFromSession();
        if (!userId) throw new ApiError('Unauthorized', 401);

        const authorizedTourIds = await getAuthorizedTourIds(userId);
        const isAuthorized = authorizedTourIds.some(
            (id) => id.toString() === targetFaq.tour.toString()
        );

        if (!isAuthorized) {
            throw new ApiError('You do not have permission to modify this FAQ', 403);
        }

        const tourId = targetFaq.tour;
        const oldOrder = targetFaq.order ?? 0;

        // Shift other FAQs in the same tour to make room
        if (newOrder > oldOrder) {
            // Moving down: shift intermediate FAQs up by 1
            await TourFAQModel.updateMany(
                {
                    tour: tourId,
                    _id: { $ne: targetFaq._id },
                    deletedAt: null,
                    order: { $gt: oldOrder, $lte: newOrder },
                },
                { $inc: { order: -1 } },
                { session }
            );
        } else if (newOrder < oldOrder) {
            // Moving up: shift intermediate FAQs down by 1
            await TourFAQModel.updateMany(
                {
                    tour: tourId,
                    _id: { $ne: targetFaq._id },
                    deletedAt: null,
                    order: { $gte: newOrder, $lt: oldOrder },
                },
                { $inc: { order: 1 } },
                { session }
            );
        }

        // Apply new order to the target FAQ
        targetFaq.order = newOrder;
        await targetFaq.save({ session });

        // Return all FAQs for this tour so the store can merge correctly
        const updatedFaqs = await TourFAQModel.find(
            { tour: tourId, deletedAt: null },
            null,
            { session }
        )
            .populate('tour', '_id title slug')
            .populate('askedBy', '_id name avatar email')
            .populate('answeredBy', '_id name avatar email')
            .sort({ order: 1 })
            .lean({ virtuals: true });

        return { tourId: tourId.toString(), faqs: updatedFaqs };
    });

    return { data: result };
});
