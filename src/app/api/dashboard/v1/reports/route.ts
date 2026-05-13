// app/api/dashboard/v1/reports/route.ts
import { NextRequest } from 'next/server';
import { Types, FilterQuery } from 'mongoose';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import UserModel from '@/models/user.model';
import EmployeeModel from '@/models/employees/employees.model';
import GuideModel from '@/models/guide/guide.model';
import TourModel from '@/models/tours/tour.model';
import { USER_ROLE } from '@/constants/current-user/user.const';
import { REPORT_STATUS, ReportStatus } from '@/constants/tour/report.const';
import { ReportModel, IReport } from '@/models/tours/report.model';
import { ReportSummary } from '@/types/dashboard/dashboard.type';
import { withErrorHandler, ApiError, HandlerResult } from '@/lib/helpers/withErrorHandler';
import ConnectDB from '@/config/db';

// Helper type for populated report after .lean()
type PopulatedReport = {
    _id: Types.ObjectId;
    reporter: { _id: Types.ObjectId; name: string } | null;
    tour: { _id: Types.ObjectId; title: string } | null;
    reason: string;
    message: string;
    status: ReportStatus;
    priority: string;
    createdAt: Date;
    deletedAt?: Date | null;
};

// Allowed status values as strings (derived from enum)
const allowedStatuses: Set<string> = new Set(Object.values(REPORT_STATUS));

async function getReportsHandler(request: NextRequest): Promise<HandlerResult<ReportSummary[]>> {
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
        throw new ApiError('Access denied: only guides and assistants can access reports', 403);
    }

    // 4. Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const reportStatusParam = searchParams.get('reportStatus');
    const dateFromParam = searchParams.get('reportsDateRangeFrom');
    const dateToParam = searchParams.get('reportsDateRangeTo');

    // Validate status if provided
    if (reportStatusParam && !allowedStatuses.has(reportStatusParam)) {
        throw new ApiError(
            `Invalid reportStatus. Must be one of: ${Array.from(allowedStatuses).join(', ')}`,
            400
        );
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

    const tourIds = tours.map((tour) => tour._id);

    // 6. Build report filter with proper typing
    const reportFilter: FilterQuery<IReport> = {
        tour: { $in: tourIds },
        // deletedAt null is automatically applied by the ReportModel pre-find hook (if configured)
    };

    if (reportStatusParam) {
        // Safe cast because we validated it's one of the REPORT_STATUS values
        reportFilter.status = reportStatusParam as ReportStatus;
    }

    if (dateFromParam || dateToParam) {
        reportFilter.createdAt = {};
        if (dateFromParam) {
            const fromDate = new Date(dateFromParam);
            if (isNaN(fromDate.getTime())) {
                throw new ApiError('Invalid reportsDateRangeFrom date', 400);
            }
            reportFilter.createdAt.$gte = fromDate;
        }
        if (dateToParam) {
            const toDate = new Date(dateToParam);
            if (isNaN(toDate.getTime())) {
                throw new ApiError('Invalid reportsDateRangeTo date', 400);
            }
            toDate.setHours(23, 59, 59, 999);
            reportFilter.createdAt.$lte = toDate;
        }
    }

    // 7. Fetch reports with population
    const reports = (await ReportModel.find(reportFilter)
        .populate<{ reporter: { _id: Types.ObjectId; name: string } }>({
            path: 'reporter',
            select: 'name',
        })
        .populate<{ tour: { _id: Types.ObjectId; title: string } }>({
            path: 'tour',
            select: 'title',
        })
        .sort({ createdAt: -1 })
        .lean()) as unknown as PopulatedReport[];  // Cast through unknown to resolve FlattenMaps conflict

    // 8. Transform to ReportSummary[]
    const summaries: ReportSummary[] = reports.map((report) => ({
        _id: report._id.toString(),
        reporter: {
            _id: report.reporter?._id?.toString() ?? '',
            name: report.reporter?.name ?? 'Anonymous',
        },
        tour: {
            _id: report.tour?._id?.toString() ?? '',
            title: report.tour?.title ?? 'Unknown Tour',
        },
        reason: report.reason,
        message: report.message,
        status: report.status,
        priority: report.priority,
        createdAt: report.createdAt,
    }));

    return { data: summaries };
}

export const GET = withErrorHandler(getReportsHandler);