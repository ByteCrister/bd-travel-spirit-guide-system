// app/api/support/tour-faq/stats/route.ts
// GET /api/support/tour-faq/stats — aggregate FAQ stats

import { withErrorHandler } from '@/lib/helpers/withErrorHandler';
import ConnectDB from '@/config/db';
import { TourFAQModel } from '@/models/tours/tourFAQ.model';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import { getAuthorizedTourIds } from '@/lib/helpers/get-authorized-tour-ids';
import { ApiError } from '@/lib/helpers/withErrorHandler';
import { MODERATION_STATUS } from '@/constants/tour/tour.const';

export const GET = withErrorHandler(async () => {
    await ConnectDB();

    const userId = await getUserIdFromSession();
    if (!userId) throw new ApiError('Unauthorized', 401);

    const authorizedTourIds = await getAuthorizedTourIds(userId);

    const [result] = await TourFAQModel.aggregate([
        { $match: { deletedAt: null, tour: { $in: authorizedTourIds } } },
        {
            $group: {
                _id: null,
                totalFAQs: { $sum: 1 },
                totalApproved: {
                    $sum: { $cond: [{ $eq: ['$status', MODERATION_STATUS.APPROVED] }, 1, 0] },
                },
                totalPending: {
                    $sum: { $cond: [{ $eq: ['$status', MODERATION_STATUS.PENDING] }, 1, 0] },
                },
                totalRejected: {
                    $sum: { $cond: [{ $eq: ['$status', MODERATION_STATUS.DENIED] }, 1, 0] },
                },
                // Count only non-soft-deleted likes / dislikes
                totalLikes: {
                    $sum: {
                        $size: {
                            $filter: {
                                input: '$likes',
                                as: 'l',
                                cond: { $eq: ['$$l.deletedAt', null] },
                            },
                        },
                    },
                },
                totalDislikes: {
                    $sum: {
                        $size: {
                            $filter: {
                                input: '$dislikes',
                                as: 'd',
                                cond: { $eq: ['$$d.deletedAt', null] },
                            },
                        },
                    },
                },
            },
        },
        { $project: { _id: 0 } },
    ]);

    const stats = result ?? {
        totalFAQs: 0,
        totalApproved: 0,
        totalPending: 0,
        totalRejected: 0,
        totalLikes: 0,
        totalDislikes: 0,
    };

    return { data: stats };
});
