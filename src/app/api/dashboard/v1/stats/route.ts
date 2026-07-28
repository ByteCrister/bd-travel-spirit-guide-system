// app/api/dashboard/v1/stats/route.ts
import ConnectDB from '@/config/db';
import { EMPLOYEE_STATUS } from '@/constants/employee/employee.const';
import { USER_ROLE, UserRole } from '@/constants/current-user/user.const';
import { REPORT_STATUS } from '@/constants/tour/report.const';
import { BOOKING_STATUS } from '@/constants/tour/tour-booking.const';
import { TOUR_STATUS, TourStatus } from '@/constants/tour/tour.const';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import { getCollectionName } from '@/lib/helpers/get-collection-name';
import { ApiError, withErrorHandler } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import EmployeeModel from '@/models/employees/employees.model';
import GuideModel from '@/models/guide/guide.model';
import BookingModel from '@/models/tours/booking.model';
import { ReportModel } from '@/models/tours/report.model';
import { ReviewModel } from '@/models/tours/review.model';
import TourModel from '@/models/tours/tour.model';
import UserModel from '@/models/user.model';
import {
    BookingSummary,
    DashboardStats,
    DashboardStatsBundle,
    ReviewSummary,
} from '@/types/dashboard/dashboard.type';
import type { BookingStatus } from '@/constants/tour/tour-booking.const';
import type { EmployeeStatus } from '@/constants/employee/employee.const';
import type { ReportStatus } from '@/constants/tour/report.const';
import { ClientSession, Types } from 'mongoose';
import { NextRequest } from 'next/server';

interface DashboardStatsQuery {
    statsDateRangeFrom: string;
    statsDateRangeTo: string;
    tourStatus?: TourStatus;
    employeeStatus?: EmployeeStatus;
    reportStatus?: ReportStatus;
    bookingStatus?: BookingStatus;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TOUR_STATUSES = new Set<string>(Object.values(TOUR_STATUS));
const EMP_STATUSES = new Set<string>(Object.values(EMPLOYEE_STATUS));
const REPORT_STATUSES = new Set<string>(Object.values(REPORT_STATUS));
const BOOKING_STATUSES = new Set<string>(Object.values(BOOKING_STATUS));

/** The tour company's share of each booking's revenue (85%). */
const COMPANY_REVENUE_SHARE = parseFloat(process.env.GUIDE_SHARE_RATE!); // 0.85

function parseOptionalEnum<T extends string>(
    value: string | null,
    allowed: Set<string>,
    label: string,
): T | undefined {
    if (value == null || value === '') return undefined;
    if (!allowed.has(value)) {
        throw new ApiError(`Invalid ${label}`, 400);
    }
    return value as T;
}

function parseQueryParams(request: NextRequest): DashboardStatsQuery {
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('statsDateRangeFrom');
    const to = searchParams.get('statsDateRangeTo');

    if (!from || !to) {
        throw new ApiError('statsDateRangeFrom and statsDateRangeTo are required', 400);
    }

    if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
        throw new ApiError('Invalid date format. Use YYYY-MM-DD', 400);
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
        throw new ApiError('Invalid date values', 400);
    }

    return {
        statsDateRangeFrom: from,
        statsDateRangeTo: to,
        tourStatus: parseOptionalEnum<TourStatus>(searchParams.get('tourStatus'), TOUR_STATUSES, 'tourStatus'),
        employeeStatus: parseOptionalEnum<EmployeeStatus>(
            searchParams.get('employeeStatus'),
            EMP_STATUSES,
            'employeeStatus',
        ),
        reportStatus: parseOptionalEnum<ReportStatus>(
            searchParams.get('reportStatus'),
            REPORT_STATUSES,
            'reportStatus',
        ),
        bookingStatus: parseOptionalEnum<BookingStatus>(
            searchParams.get('bookingStatus'),
            BOOKING_STATUSES,
            'bookingStatus',
        ),
    };
}

async function getCompanyGuideId(userId: string): Promise<{ guideId: Types.ObjectId; role: UserRole }> {
    const user = await UserModel.findById(userId).select('role').lean();
    if (!user) throw new ApiError('User not found', 404);

    const role = user.role as UserRole;

    if (role === USER_ROLE.GUIDE) {
        const guide = await GuideModel.findOne({ 'owner.user': new Types.ObjectId(userId) })
            .select('_id')
            .lean<{ _id: Types.ObjectId } | null>();
        if (!guide) throw new ApiError('Guide profile not found', 404);
        return { guideId: guide._id, role };
    }

    if (role === USER_ROLE.ASSISTANT) {
        const employee = await EmployeeModel.findOne({ user: new Types.ObjectId(userId), deletedAt: null })
            .select('companyId')
            .lean<{ companyId?: Types.ObjectId } | null>();
        if (!employee?.companyId) throw new ApiError('Assistant not linked to a company', 403);
        return { guideId: employee.companyId, role };
    }

    throw new ApiError('Access denied: Only guides and assistants can access dashboard stats', 403);
}

async function getTourStats(
    guideId: Types.ObjectId,
    fromDate: Date,
    toDate: Date,
    tourStatus: TourStatus | undefined,
    session: ClientSession,
): Promise<number> {
    const filter: Record<string, unknown> = {
        companyId: guideId,
        deletedAt: null,
        createdAt: { $gte: fromDate, $lte: toDate },
    };
    if (tourStatus) filter.status = tourStatus;
    return TourModel.countDocuments(filter).session(session);
}

async function getBookingStats(
    guideId: Types.ObjectId,
    fromDate: Date,
    toDate: Date,
    bookingStatus: BookingStatus | undefined,
    session: ClientSession,
): Promise<{ total: number; revenue: number }> {
    const tourIds = await TourModel.find({ companyId: guideId, deletedAt: null }).distinct('_id').session(session);
    if (!tourIds.length) return { total: 0, revenue: 0 };

    const match: Record<string, unknown> = {
        tour: { $in: tourIds },
        bookedAt: { $gte: fromDate, $lte: toDate },
        deletedAt: null,
        status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED] },
    };
    if (bookingStatus) {
        match.status = bookingStatus;
    }

    const result = await BookingModel.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                totalBookings: { $sum: 1 },
                totalRevenue: { $sum: '$totalPaid' },
            },
        },
    ]).session(session);

    if (!result.length) return { total: 0, revenue: 0 };
    // Apply the company's 85% revenue share to the gross booking total
    const grossRevenue: number = result[0].totalRevenue ?? 0;
    return { total: result[0].totalBookings, revenue: Math.round(grossRevenue * COMPANY_REVENUE_SHARE * 100) / 100 };
}

async function getPendingReportsCount(
    guideId: Types.ObjectId,
    fromDate: Date,
    toDate: Date,
    reportStatus: ReportStatus | undefined,
    session: ClientSession,
): Promise<number> {
    const tourIds = await TourModel.find({ companyId: guideId, deletedAt: null }).distinct('_id').session(session);
    if (!tourIds.length) return 0;

    const filter: Record<string, unknown> = {
        tour: { $in: tourIds },
        deletedAt: null,
        createdAt: { $gte: fromDate, $lte: toDate },
    };

    if (reportStatus) {
        filter.status = reportStatus;
    } else {
        filter.status = { $in: [REPORT_STATUS.OPEN, REPORT_STATUS.IN_REVIEW] };
    }

    return ReportModel.countDocuments(filter).session(session);
}

async function getAverageRating(
    guideId: Types.ObjectId,
    fromDate: Date,
    toDate: Date,
    session: ClientSession,
): Promise<number> {
    const tourIds = await TourModel.find({ companyId: guideId, deletedAt: null }).distinct('_id').session(session);
    if (!tourIds.length) return 0;

    const result = await ReviewModel.aggregate([
        {
            $match: {
                tour: { $in: tourIds },
                isApproved: true,
                deletedAt: null,
                createdAt: { $gte: fromDate, $lte: toDate },
            },
        },
        {
            $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
            },
        },
    ]).session(session);

    return result.length ? Math.round((result[0].avgRating as number) * 10) / 10 : 0;
}

async function getActiveEmployeesInFilteredPool(
    guideId: Types.ObjectId,
    fromDate: Date,
    toDate: Date,
    employeeStatus: EmployeeStatus | undefined,
    session: ClientSession,
): Promise<number> {
    const filter: Record<string, unknown> = {
        companyId: guideId,
        deletedAt: null,
        dateOfJoining: { $gte: fromDate, $lte: toDate },
    };
    if (employeeStatus) filter.status = employeeStatus;

    const employees = await EmployeeModel.find(filter).select('status').session(session).lean();
    return employees.filter((e) => e.status === EMPLOYEE_STATUS.ACTIVE).length;
}

async function getBookingsForCharts(
    guideId: Types.ObjectId,
    fromDate: Date,
    toDate: Date,
    session: ClientSession,
): Promise<BookingSummary[]> {
    const tourIds = await TourModel.find({ companyId: guideId, deletedAt: null }).distinct('_id').session(session);
    if (!tourIds.length) return [];

    const bookings = await BookingModel.aggregate([
        {
            $match: {
                tour: { $in: tourIds },
                bookedAt: { $gte: fromDate, $lte: toDate },
                deletedAt: null,
            },
        },
        {
            $lookup: {
                from: getCollectionName(UserModel),
                localField: 'traveler',
                foreignField: '_id',
                as: 'travelerInfo',
            },
        },
        { $unwind: { path: '$travelerInfo', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: getCollectionName(TourModel),
                localField: 'tour',
                foreignField: '_id',
                as: 'tourInfo',
            },
        },
        { $unwind: { path: '$tourInfo', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: { $toString: '$_id' },
                bookingReference: 1,
                traveler: {
                    _id: { $toString: '$travelerInfo._id' },
                    name: '$travelerInfo.name',
                    email: '$travelerInfo.email',
                },
                tour: {
                    _id: { $toString: '$tourInfo._id' },
                    title: '$tourInfo.title',
                },
                totalParticipants: 1,
                totalPaid: 1,
                currency: 1,
                status: 1,
                paymentStatus: '$payment.status',
                bookedAt: 1,
            },
        },
        { $sort: { bookedAt: -1 } },
        { $limit: 100 },
    ]).session(session);

    return bookings;
}

async function getReviewsForCharts(
    guideId: Types.ObjectId,
    fromDate: Date,
    toDate: Date,
    session: ClientSession,
): Promise<ReviewSummary[]> {
    const tourIds = await TourModel.find({ companyId: guideId, deletedAt: null }).distinct('_id').session(session);
    if (!tourIds.length) return [];

    const reviews = await ReviewModel.aggregate([
        {
            $match: {
                tour: { $in: tourIds },
                createdAt: { $gte: fromDate, $lte: toDate },
                deletedAt: null,
            },
        },
        {
            $lookup: {
                from: getCollectionName(TourModel),
                localField: 'tour',
                foreignField: '_id',
                as: 'tourInfo',
            },
        },
        { $unwind: { path: '$tourInfo', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: getCollectionName(UserModel),
                localField: 'user',
                foreignField: '_id',
                as: 'userInfo',
            },
        },
        { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: { $toString: '$_id' },
                tour: {
                    _id: { $toString: '$tourInfo._id' },
                    title: '$tourInfo.title',
                },
                user: {
                    _id: { $toString: '$userInfo._id' },
                    name: '$userInfo.name',
                    avatar: '$userInfo.avatar',
                },
                rating: 1,
                comment: 1,
                isApproved: 1,
                createdAt: 1,
            },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 100 },
    ]).session(session);

    return reviews;
}

export const GET = withErrorHandler(async (request: NextRequest) => {
    await ConnectDB();

    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError('No active session found', 401);
    }

    const { guideId } = await getCompanyGuideId(userId);
    const query = parseQueryParams(request);

    const fromDate = new Date(query.statsDateRangeFrom);
    const toDate = new Date(query.statsDateRangeTo);
    toDate.setHours(23, 59, 59, 999);

    const bundle = await withTransaction(async (session) => {
        const [
            totalTours,
            bookingStats,
            pendingReports,
            averageRating,
            activeEmployees,
            bookingsForCharts,
            reviewsForCharts,
        ] = await Promise.all([
            getTourStats(guideId, fromDate, toDate, query.tourStatus, session),
            getBookingStats(guideId, fromDate, toDate, query.bookingStatus, session),
            getPendingReportsCount(guideId, fromDate, toDate, query.reportStatus, session),
            getAverageRating(guideId, fromDate, toDate, session),
            getActiveEmployeesInFilteredPool(
                guideId,
                fromDate,
                toDate,
                query.employeeStatus,
                session,
            ),
            getBookingsForCharts(guideId, fromDate, toDate, session),
            getReviewsForCharts(guideId, fromDate, toDate, session),
        ]);

        const stats: DashboardStats = {
            totalTours,
            totalBookings: bookingStats.total,
            totalRevenue: bookingStats.revenue,
            pendingReports,
            averageRating,
            activeEmployees,
        };

        const payload: DashboardStatsBundle = {
            stats,
            bookingsForCharts,
            reviewsForCharts,
        };

        return payload;
    });

    return { data: bundle, status: 200 };
});
