// app/api/dashboard/v1/tours/route.ts
import { NextRequest } from 'next/server';
import { TourStatus, TOUR_STATUS, Currency } from '@/constants/tour/tour.const';
import { Types, FilterQuery } from 'mongoose';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import UserModel from '@/models/user.model';
import ConnectDB from '@/config/db';
import { USER_ROLE } from '@/constants/current-user/user.const';
import EmployeeModel from '@/models/employees/employees.model';
import GuideModel from '@/models/guide/guide.model';
import TourModel, { ITour } from '@/models/tours/tour.model';
import { TourSummary } from '@/types/dashboard/dashboard.type';
import { withErrorHandler, ApiError, HandlerResult } from '@/lib/helpers/withErrorHandler';
import { queryWithFallback } from '@/lib/helpers/dashboard-fallback';

// Allowed status values (must match TOUR_STATUS enum)
const allowedStatusValues: Set<string> = new Set(Object.values(TOUR_STATUS));

// Main handler logic
async function getToursHandler(request: NextRequest): Promise<HandlerResult<TourSummary[]>> {
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

    let companyId: Types.ObjectId | null = null;

    // 3. Resolve companyId based on role
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
        // guide._id is a valid ObjectId (explicitly cast to satisfy TypeScript)
        companyId = guide._id as Types.ObjectId;
    } else {
        throw new ApiError('Access denied: only guides and assistants can access tours', 403);
    }

    // 4. Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const tourStatusParam = searchParams.get('tourStatus');
    const dateFromParam = searchParams.get('toursDateRangeFrom');
    const dateToParam = searchParams.get('toursDateRangeTo');

    // Validate status if provided
    if (tourStatusParam && !allowedStatusValues.has(tourStatusParam)) {
        throw new ApiError(
            `Invalid tourStatus. Must be one of: ${Array.from(allowedStatusValues).join(', ')}`,
            400
        );
    }


    // Build filter with proper typing
    const filter: FilterQuery<ITour> = {
        companyId,
        deletedAt: null,
    };

    if (tourStatusParam) {
        // Cast to TourStatus after validation
        filter.status = tourStatusParam as TourStatus;
    }

    // Date range filtering (based on createdAt)
    if (dateFromParam || dateToParam) {
        filter.createdAt = {};
        if (dateFromParam) {
            const fromDate = new Date(dateFromParam);
            if (isNaN(fromDate.getTime())) {
                throw new ApiError('Invalid toursDateRangeFrom date', 400);
            }
            filter.createdAt.$gte = fromDate;
        }
        if (dateToParam) {
            const toDate = new Date(dateToParam);
            if (isNaN(toDate.getTime())) {
                throw new ApiError('Invalid toursDateRangeTo date', 400);
            }
            // Include the entire end day
            toDate.setHours(23, 59, 59, 999);
            filter.createdAt.$lte = toDate;
        }
    }

    // Build base filter (no date) for fallback
    const baseFilter: FilterQuery<ITour> = {
        companyId,
        deletedAt: null,
    };
    if (tourStatusParam) {
        baseFilter.status = tourStatusParam as TourStatus;
    }

    type TourQueryResult = {
        _id: Types.ObjectId;
        title: string;
        slug: string;
        status: string;
        uniqueTourCode: string;
        basePrice: { amount: number; currency: string };
        createdAt: Date;
        updatedAt: Date;
    };

    const toSummaries = (tours: TourQueryResult[]) =>
        tours.map((tour) => ({
            _id: tour._id.toString(),
            title: tour.title,
            slug: tour.slug,
            status: tour.status as TourStatus,
            uniqueTourCode: tour.uniqueTourCode,
            basePrice: {
                amount: tour.basePrice.amount,
                currency: tour.basePrice.currency as Currency,
            },
            createdAt: tour.createdAt,
            updatedAt: tour.updatedAt,
        }));

    const { data: summaries, isInitialData } = await queryWithFallback(
        async () => toSummaries(await TourModel.find(filter).select({ _id: 1, title: 1, slug: 1, status: 1, uniqueTourCode: 1, basePrice: 1, createdAt: 1, updatedAt: 1 }).lean().sort({ createdAt: -1 })),
        async () => toSummaries(await TourModel.find(baseFilter).select({ _id: 1, title: 1, slug: 1, status: 1, uniqueTourCode: 1, basePrice: 1, createdAt: 1, updatedAt: 1 }).lean().sort({ createdAt: -1 })),
        (r) => r.length === 0,
    );

    return { data: summaries, isInitialData };
}

// Export GET handler wrapped with error handling
export const GET = withErrorHandler(getToursHandler);