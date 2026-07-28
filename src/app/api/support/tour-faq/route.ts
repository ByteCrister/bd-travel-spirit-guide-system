// app/api/support/tour-faq/route.ts
// GET /api/support/tour-faq  — list all FAQs with filters & pagination

import { NextRequest } from 'next/server';
import { Types } from 'mongoose';
import { ApiError, withErrorHandler } from '@/lib/helpers/withErrorHandler';
import ConnectDB from '@/config/db';
import { TourFAQModel } from '@/models/tours/tourFAQ.model';
import { FilterQuery, PipelineStage } from 'mongoose';
import { ITourFAQ } from '@/models/tours/tourFAQ.model';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import { getAuthorizedTourIds } from '@/lib/helpers/get-authorized-tour-ids';

/* ------------------------------------------------------------------
   Query param shape
------------------------------------------------------------------ */
interface ListQueryParams {
    search?: string;
    status?: 'pending' | 'approved' | 'rejected';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: string;
    limit?: string;
}

/* ------------------------------------------------------------------
   GET handler
------------------------------------------------------------------ */
export const GET = withErrorHandler(async (request: NextRequest) => {
    await ConnectDB();

    const searchParams = request.nextUrl.searchParams;
    const {
        search,
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = '1',
        limit = '10',
    } = Object.fromEntries(searchParams.entries()) as ListQueryParams;

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Number(limit) || 10, 100);
    const skip = (pageNum - 1) * limitNum;

    const userId = await getUserIdFromSession();
    if (!userId) throw new ApiError('Unauthorized', 401);

    const authorizedTourIds = await getAuthorizedTourIds(userId);

    /* ------------------------------------------------------------------
       Build match query
    ------------------------------------------------------------------ */
    const matchQuery: FilterQuery<ITourFAQ> = { 
        deletedAt: null,
        tour: { $in: authorizedTourIds }
    };

    if (status) {
        matchQuery.status = status;
    }

    /* ------------------------------------------------------------------
       Build aggregation pipeline
    ------------------------------------------------------------------ */
    const allowedSortFields: Record<string, string> = {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        order: 'order',
        likeCount: 'likeCount',
        dislikeCount: 'dislikeCount',
        status: 'status',
    };

    const sortField = allowedSortFields[sortBy] ?? 'createdAt';
    const sortDir = sortOrder === 'asc' ? 1 : -1;

    const pipeline: PipelineStage[] = [
        { $match: matchQuery },

        // Populate askedBy (Traveler)
        {
            $lookup: {
                from: 'travelers',
                localField: 'askedBy',
                foreignField: '_id',
                as: 'askedBy',
                pipeline: [{ $project: { _id: 1, name: 1, avatar: 1, email: 1 } }],
            },
        },
        { $unwind: { path: '$askedBy', preserveNullAndEmptyArrays: true } },

        // Populate answeredBy (User)
        {
            $lookup: {
                from: 'users',
                localField: 'answeredBy',
                foreignField: '_id',
                as: 'answeredBy',
                pipeline: [{ $project: { _id: 1, name: 1, avatar: 1, email: 1 } }],
            },
        },
        { $unwind: { path: '$answeredBy', preserveNullAndEmptyArrays: true } },

        // Populate tour (Tour)
        {
            $lookup: {
                from: 'tours',
                localField: 'tour',
                foreignField: '_id',
                as: 'tour',
                pipeline: [{ $project: { _id: 1, title: 1, slug: 1 } }],
            },
        },
        { $unwind: { path: '$tour', preserveNullAndEmptyArrays: true } },

        // Compute virtual fields
        {
            $addFields: {
                isAnswered: { $gt: [{ $ifNull: ['$answer', ''] }, ''] },
                likeCount: {
                    $size: {
                        $filter: {
                            input: '$likes',
                            as: 'l',
                            cond: { $eq: ['$$l.deletedAt', null] },
                        },
                    },
                },
                dislikeCount: {
                    $size: {
                        $filter: {
                            input: '$dislikes',
                            as: 'd',
                            cond: { $eq: ['$$d.deletedAt', null] },
                        },
                    },
                },
                userVote: null,
            },
        },
    ];

    // Search filter (applied after lookups so we can search tour.title etc.)
    if (search) {
        const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        pipeline.push({
            $match: {
                $or: [
                    { question: { $regex: regex } },
                    { answer: { $regex: regex } },
                    { 'tour.title': { $regex: regex } },
                    { 'askedBy.name': { $regex: regex } },
                    { 'askedBy.email': { $regex: regex } },
                ],
            },
        });
    }

    // Count before pagination
    const countPipeline: PipelineStage[] = [
        ...pipeline,
        { $count: 'total' },
    ];

    const [totalResult, faqs] = await Promise.all([
        TourFAQModel.aggregate(countPipeline),
        TourFAQModel.aggregate([
            ...pipeline,
            { $sort: { [sortField]: sortDir } },
            { $skip: skip },
            { $limit: limitNum },
        ]),
    ]);

    const total = totalResult[0]?.total ?? 0;
    const totalPages = Math.ceil(total / limitNum);

    return {
        data: {
            faqs,
            pagination: {
                page: pageNum,
                perPage: limitNum,
                total,
                totalPages,
            },
        },
    };
});
