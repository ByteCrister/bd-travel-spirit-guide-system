// app/api/dashboard/v1/faqs/route.ts
import { NextRequest } from 'next/server';
import { Types, FilterQuery } from 'mongoose';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import UserModel from '@/models/user.model';
import EmployeeModel from '@/models/employees/employees.model';
import GuideModel from '@/models/guide/guide.model';
import TourModel from '@/models/tours/tour.model';
import { TourFAQModel, ITourFAQ } from '@/models/tours/tourFAQ.model';
import { TourFAQVoteModel } from '@/models/tours/tourFAQVote.model';
import { USER_ROLE } from '@/constants/current-user/user.const';
import { ModerationStatus } from '@/constants/tour/tour.const';
import ConnectDB from '@/config/db';
import { withErrorHandler, ApiError, HandlerResult } from '@/lib/helpers/withErrorHandler';
import { FAQSummary } from '@/types/dashboard/dashboard.type';
import { queryWithFallback } from '@/lib/helpers/dashboard-fallback';

// Type for a FAQ document after .lean() and populate('tour')
type PopulatedFAQ = {
    _id: Types.ObjectId;
    tour: { _id: Types.ObjectId; title: string };
    question: string;
    answer?: string;
    status: string;
    createdAt: Date;
};

async function getFaqsHandler(request: NextRequest): Promise<HandlerResult<FAQSummary[]>> {
    // 1. Authenticate and validate user ID
    const userIdString = await getUserIdFromSession();
    if (!userIdString || !Types.ObjectId.isValid(userIdString)) {
        throw new ApiError('Unauthorized: Invalid or missing user ID', 401);
    }
    const userId = new Types.ObjectId(userIdString);

    await ConnectDB();

    // 2. Fetch user role
    const user = await UserModel.findById(userId).select('role').lean();
    if (!user) {
        throw new ApiError('User not found', 404);
    }

    // 3. Resolve companyId based on role
    let companyId: Types.ObjectId | null = null;

    if (user.role === USER_ROLE.ASSISTANT) {
        const employee = await EmployeeModel.findOne({ user: userId })
            .select('companyId')
            .lean();
        if (!employee || !employee.companyId) {
            throw new ApiError('Employee record not found or missing company association', 403);
        }
        companyId = employee.companyId;
    } else if (user.role === USER_ROLE.GUIDE) {
        const guide = await GuideModel.findOne({ 'owner.user': userId })
            .select('_id')
            .lean();
        if (!guide) {
            throw new ApiError('Guide profile not found', 403);
        }
        companyId = guide._id as Types.ObjectId;
    } else {
        throw new ApiError('Access denied: only guides and assistants can access FAQs', 403);
    }

    // 4. Parse query parameters (date range)
    const searchParams = request.nextUrl.searchParams;
    const dateFromParam = searchParams.get('faqsDateRangeFrom');
    const dateToParam = searchParams.get('faqsDateRangeTo');

    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    if (dateFromParam) {
        fromDate = new Date(dateFromParam);
        if (isNaN(fromDate.getTime())) {
            throw new ApiError('Invalid faqsDateRangeFrom date', 400);
        }
    }
    if (dateToParam) {
        toDate = new Date(dateToParam);
        if (isNaN(toDate.getTime())) {
            throw new ApiError('Invalid faqsDateRangeTo date', 400);
        }
        // Include the entire end day
        toDate.setHours(23, 59, 59, 999);
    }

    // 5. Fetch tours belonging to this company (not soft-deleted)
    const tours = await TourModel.find({
        companyId,
        deletedAt: null,
    })
        .select('_id title')
        .lean();

    if (!tours.length) {
        return { data: [] };
    }

    const tourIds = tours.map(tour => tour._id);

    // 6. Build FAQ filter
    const filter: FilterQuery<ITourFAQ> = {
        tour: { $in: tourIds },
        deletedAt: null,
    };

    if (fromDate || toDate) {
        filter.createdAt = {};
        if (fromDate) filter.createdAt.$gte = fromDate;
        if (toDate) filter.createdAt.$lte = toDate;
    }

    // Base filter (no date) for fallback
    const baseFallbackFilter: FilterQuery<ITourFAQ> = {
        tour: { $in: tourIds },
        deletedAt: null,
    };

    const fetchAndMap = async (f: FilterQuery<ITourFAQ>): Promise<FAQSummary[]> => {
        const faqs = (await TourFAQModel.find(f)
            .populate('tour', 'title')
            .lean()) as unknown as PopulatedFAQ[];

        if (!faqs.length) return [];

        const faqIds = faqs.map(faq => faq._id);
        const voteAggregation = await TourFAQVoteModel.aggregate([
            { $match: { faqId: { $in: faqIds } } },
            { $group: { _id: { faqId: '$faqId', type: '$type' }, count: { $sum: 1 } } },
        ]);

        const voteCounts = new Map<string, { likeCount: number; dislikeCount: number }>();
        for (const item of voteAggregation) {
            const faqIdStr = item._id.faqId.toString();
            const existing = voteCounts.get(faqIdStr) ?? { likeCount: 0, dislikeCount: 0 };
            if (item._id.type === 'like') existing.likeCount = item.count;
            else if (item._id.type === 'dislike') existing.dislikeCount = item.count;
            voteCounts.set(faqIdStr, existing);
        }

        return faqs.map(faq => {
            const counts = voteCounts.get(faq._id.toString()) ?? { likeCount: 0, dislikeCount: 0 };
            return {
                _id: faq._id.toString(),
                tour: { _id: faq.tour._id.toString(), title: faq.tour.title },
                question: faq.question,
                answer: faq.answer,
                status: faq.status as ModerationStatus,
                likeCount: counts.likeCount,
                dislikeCount: counts.dislikeCount,
                createdAt: faq.createdAt,
            };
        });
    };

    const { data: summaries, isInitialData } = await queryWithFallback(
        () => fetchAndMap(filter),
        () => fetchAndMap(baseFallbackFilter),
        (r) => r.length === 0,
    );

    return { data: summaries, isInitialData };
}

export const GET = withErrorHandler(getFaqsHandler);