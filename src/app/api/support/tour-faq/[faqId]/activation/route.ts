// app/api/support/tour-faq/[faqId]/activation/route.ts
// PUT /api/support/tour-faq/[faqId]/activation — toggle isActive (optimistic-safe)

import { NextRequest } from 'next/server';
import { ApiError, withErrorHandler } from '@/lib/helpers/withErrorHandler';
import ConnectDB from '@/config/db';
import { TourFAQModel } from '@/models/tours/tourFAQ.model';
import { Types } from 'mongoose';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import { getAuthorizedTourIds } from '@/lib/helpers/get-authorized-tour-ids';

type RouteContext = { params: Promise<{ faqId: string }> };

export const PUT = withErrorHandler(async (
    _request: NextRequest,
    { params }: RouteContext
) => {
    await ConnectDB();

    const { faqId } = await params;

    if (!Types.ObjectId.isValid(faqId)) {
        throw new ApiError('Invalid FAQ ID', 400);
    }

    const faq = await TourFAQModel.findOne({ _id: faqId, deletedAt: null });

    if (!faq) {
        throw new ApiError('FAQ not found', 404);
    }

    const userId = await getUserIdFromSession();
    if (!userId) throw new ApiError('Unauthorized', 401);

    const authorizedTourIds = await getAuthorizedTourIds(userId);
    const isAuthorized = authorizedTourIds.some(
        (id) => id.toString() === faq.tour.toString()
    );

    if (!isAuthorized) {
        throw new ApiError('You do not have permission to modify this FAQ', 403);
    }

    faq.isActive = !faq.isActive;
    await faq.save();

    // Re-fetch with populated fields to match the front-end FAQ shape
    const populated = await TourFAQModel.findById(faq._id)
        .populate('tour', '_id title slug')
        .populate('askedBy', '_id name avatar email')
        .populate('answeredBy', '_id name avatar email')
        .lean({ virtuals: true });

    return { data: populated };
});
