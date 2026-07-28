// app/api/support/tour-faq/[faqId]/votes/route.ts
// GET /api/support/tour-faq/[faqId]/votes — paginated list of votes for a FAQ

import { NextRequest } from 'next/server';
import { ApiError, withErrorHandler } from '@/lib/helpers/withErrorHandler';
import ConnectDB from '@/config/db';
import { TourFAQModel } from '@/models/tours/tourFAQ.model';
import { ITourFAQVote, TourFAQVoteModel } from '@/models/tours/tourFAQVote.model';
import { Types } from 'mongoose';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import { getAuthorizedTourIds } from '@/lib/helpers/get-authorized-tour-ids';

type RouteContext = { params: Promise<{ faqId: string }> };

interface VoteQueryParams {
    page?: string;
    limit?: string;
    type?: 'like' | 'dislike';
}

export const GET = withErrorHandler(async (
    request: NextRequest,
    { params }: RouteContext
) => {
    await ConnectDB();

    const { faqId } = await params;

    if (!Types.ObjectId.isValid(faqId)) {
        throw new ApiError('Invalid FAQ ID', 400);
    }

    // Verify the FAQ exists and is not soft-deleted
    const faq = await TourFAQModel.findOne({ _id: faqId, deletedAt: null }).select('tour');
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
        throw new ApiError('You do not have permission to view votes for this FAQ', 403);
    }

    const searchParams = request.nextUrl.searchParams;
    const {
        page = '1',
        limit = '10',
        type,
    } = Object.fromEntries(searchParams.entries()) as VoteQueryParams;

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Number(limit) || 10, 100);
    const skip = (pageNum - 1) * limitNum;

    const matchQuery: Record<string, unknown> = {
        faqId: new Types.ObjectId(faqId),
    };

    if (type === 'like' || type === 'dislike') {
        matchQuery.type = type;
    }

    const [total, votes] = await Promise.all([
        TourFAQVoteModel.countDocuments(matchQuery),
        TourFAQVoteModel.find(matchQuery)
            .populate('userId', '_id name avatar email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean() as any[],
    ]);

    const totalPages = Math.ceil(total / limitNum);

    // Rename userId → userId in the response shape (matches FAQVoteRecord type)
    const formattedVotes = votes.map((v) => ({
        _id: v._id,
        faqId: v.faqId,
        userId: v.userId,
        type: v.type,
        createdAt: v.createdAt,
    }));

    return {
        data: {
            votes: formattedVotes,
            pagination: {
                page: pageNum,
                perPage: limitNum,
                total,
                totalPages,
            },
        },
    };
});
