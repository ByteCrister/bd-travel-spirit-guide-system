// app/api/dashboard/v1/reviews/route.ts
import { NextRequest } from 'next/server';
import { Types, FilterQuery } from 'mongoose';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import UserModel from '@/models/user.model';
import EmployeeModel from '@/models/employees/employees.model';
import GuideModel from '@/models/guide/guide.model';
import TourModel from '@/models/tours/tour.model';
import { USER_ROLE } from '@/constants/current-user/user.const';
import ConnectDB from '@/config/db';
import { ReviewSummary } from '@/types/dashboard/dashboard.type';
import { withErrorHandler, ApiError, HandlerResult } from '@/lib/helpers/withErrorHandler';
import { IReview, ReviewModel } from '@/models/tours/review.model';

// Helper type for populated review after .lean()
type PopulatedReview = {
    _id: Types.ObjectId;
    tour: { _id: Types.ObjectId; title: string } | null;
    user: { _id: Types.ObjectId; name: string; avatar?: Types.ObjectId } | null;
    rating: number;
    comment: string;
    isApproved: boolean;
    createdAt: Date;
    deletedAt?: Date | null;
};

async function getReviewsHandler(request: NextRequest): Promise<HandlerResult<ReviewSummary[]>> {
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
        // Cast to ObjectId (guide._id is already ObjectId, but .lean() may return FlattenMaps)
        companyId = guide._id as Types.ObjectId;
    } else {
        throw new ApiError('Access denied: only guides and assistants can access reviews', 403);
    }

    // 4. Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const dateFromParam = searchParams.get('reviewsDateRangeFrom');
    const dateToParam = searchParams.get('reviewsDateRangeTo');

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

    const tourIds = tours.map((tour) => tour._id);

    // 6. Build review filter with proper typing
    const reviewFilter: FilterQuery<IReview> = {
        tour: { $in: tourIds },
        deletedAt: null,
    };

    if (dateFromParam || dateToParam) {
        reviewFilter.createdAt = {};
        if (dateFromParam) {
            const fromDate = new Date(dateFromParam);
            if (isNaN(fromDate.getTime())) {
                throw new ApiError('Invalid reviewsDateRangeFrom date', 400);
            }
            reviewFilter.createdAt.$gte = fromDate;
        }
        if (dateToParam) {
            const toDate = new Date(dateToParam);
            if (isNaN(toDate.getTime())) {
                throw new ApiError('Invalid reviewsDateRangeTo date', 400);
            }
            toDate.setHours(23, 59, 59, 999);
            reviewFilter.createdAt.$lte = toDate;
        }
    }

    // 7. Fetch reviews with population
    const reviews = (await ReviewModel.find(reviewFilter)
        .populate<{ tour: { _id: Types.ObjectId; title: string } }>({
            path: 'tour',
            select: 'title',
        })
        .populate<{ user: { _id: Types.ObjectId; name: string; avatar?: Types.ObjectId } }>({
            path: 'user',
            select: 'name avatar',
        })
        .sort({ createdAt: -1 })
        .lean()) as unknown as PopulatedReview[];  // Cast to our explicit type (safe because we control the shape)

    // 8. Transform to ReviewSummary[]
    const summaries: ReviewSummary[] = reviews.map((review) => ({
        _id: review._id.toString(),
        tour: {
            _id: review.tour?._id?.toString() ?? '',
            title: review.tour?.title ?? 'Unknown Tour',
        },
        user: {
            _id: review.user?._id?.toString() ?? '',
            name: review.user?.name ?? 'Anonymous',
            avatar: review.user?.avatar?.toString(),
        },
        rating: review.rating,
        comment: review.comment,
        isApproved: review.isApproved,
        createdAt: review.createdAt,
    }));

    return { data: summaries };
}

export const GET = withErrorHandler(getReviewsHandler);