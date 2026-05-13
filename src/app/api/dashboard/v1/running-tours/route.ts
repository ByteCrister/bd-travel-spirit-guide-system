// app/api/dashboard/v1/running-tours/route.ts
import { NextRequest } from 'next/server';
import { Types, FilterQuery } from 'mongoose';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import UserModel from '@/models/user.model';
import EmployeeModel from '@/models/employees/employees.model';
import GuideModel from '@/models/guide/guide.model';
import TourModel, { ITour } from '@/models/tours/tour.model';
import { USER_ROLE } from '@/constants/current-user/user.const';
import { TOUR_STATUS } from '@/constants/tour/tour.const';
import ConnectDB from '@/config/db';
import { withErrorHandler, ApiError, HandlerResult } from '@/lib/helpers/withErrorHandler';
import { RunningTourInfo } from '@/types/dashboard/dashboard.type';

async function getRunningToursHandler(request: NextRequest): Promise<HandlerResult<RunningTourInfo[]>> {
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
        throw new ApiError('Access denied: only guides and assistants can access running tours', 403);
    }

    // 4. Parse query parameters (date range)
    const searchParams = request.nextUrl.searchParams;
    const dateFromParam = searchParams.get('runningToursDateRangeFrom');
    const dateToParam = searchParams.get('runningToursDateRangeTo');

    let fromDate: Date | null = null;
    let toDate: Date | null = null;

    if (dateFromParam) {
        fromDate = new Date(dateFromParam);
        if (isNaN(fromDate.getTime())) {
            throw new ApiError('Invalid runningToursDateRangeFrom date', 400);
        }
    }
    if (dateToParam) {
        toDate = new Date(dateToParam);
        if (isNaN(toDate.getTime())) {
            throw new ApiError('Invalid runningToursDateRangeTo date', 400);
        }
        // Include the entire end day
        toDate.setHours(23, 59, 59, 999);
    }

    // 5. Fetch tours for this company: active, not soft-deleted, and have at least one departure
    const filter: FilterQuery<ITour> = {
        companyId,
        deletedAt: null,
        status: TOUR_STATUS.ACTIVE,
        departures: { $exists: true, $ne: [] },
    };

    const tours = await TourModel.find(filter)
        .select('_id slug title departures')
        .lean();

    // 6. Compute RunningTourInfo for each tour
    const runningTours: RunningTourInfo[] = [];

    for (const tour of tours) {
        // Filter departures by date range if provided
        let filteredDepartures = tour.departures || [];
        if (fromDate || toDate) {
            filteredDepartures = filteredDepartures.filter((dep) => {
                const depDate = new Date(dep.date);
                if (fromDate && depDate < fromDate) return false;
                if (toDate && depDate > toDate) return false;
                return true;
            });
        }

        if (filteredDepartures.length === 0) continue;

        let totalSeats = 0;
        let currentBookings = 0;
        let windowStart: Date = filteredDepartures[0].date;
        let windowEnd: Date = filteredDepartures[0].date;

        for (const dep of filteredDepartures) {
            totalSeats += dep.seatsTotal ?? 0;
            currentBookings += dep.seatsBooked ?? 0;
            const depDate = new Date(dep.date);
            if (depDate < windowStart) windowStart = depDate;
            if (depDate > windowEnd) windowEnd = depDate;
        }

        runningTours.push({
            tourId: tour._id.toString(),
            slug: tour.slug,
            title: tour.title,
            totalSeats,
            currentBookings,
            windowStart,
            windowEnd,
        });
    }

    return { data: runningTours };
}

export const GET = withErrorHandler(getRunningToursHandler);