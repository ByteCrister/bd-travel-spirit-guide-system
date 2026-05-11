// app/api/operations/reports/v1/route.ts
import { NextRequest } from 'next/server';
import {
    ReportStatus,
    ReportPriority,
    ReportReason,
} from '@/constants/tour/report.const';
import {
    ReportsQueryParams,
    ReportsListResponse,
    ReportListItem,
    UserRef,
    TourRef,
    SortDirection,
    ReportsSortField,
    ReportsSearchScope,
} from '@/types/tour/reports.types';
import { ITraveler, TravelerModel } from '@/models/travelers/traveler.model';
import UserModel from '@/models/user.model';
import AssetModel from '@/models/assets/asset.model';
import AssetFileModel from '@/models/assets/asset-file.model';
import TourModel from '@/models/tours/tour.model';
import ConnectDB from '@/config/db';
import { IReport, ReportModel } from '@/models/tours/report.model';
import { FilterQuery } from 'mongoose';
import { Types } from 'mongoose';
import { ApiError, withErrorHandler } from '@/lib/helpers/withErrorHandler';
import { PopulatedAssetLean } from '@/types/common/populated-asset.types';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import { USER_ROLE } from '@/constants/current-user/user.const';
import { getCollectionName } from "@/lib/helpers/get-collection-name";
import EmployeeModel from '@/models/employees/employees.model';
import GuideModel from '@/models/guide/guide.model';

// Define a proper type for the filter query
type ReportFilterQuery = FilterQuery<IReport> & {
    $or?: Array<{
        message?: { $regex: string; $options: string };
        'reporter.name'?: { $regex: string; $options: string };
        'tour.title'?: { $regex: string; $options: string };
        tags?: { $regex: string; $options: string };
    }>;
    deletedAt?: null | { $exists: boolean };
    status?: ReportStatus;
    priority?: ReportPriority;
    reason?: ReportReason;
};

// Build sort object with proper typing
type SortOptions = Record<string, 1 | -1>;

// Define types for populated documents
type PopulatedTraveler = ITraveler & {
    user?: { email: string; avatar: PopulatedAssetLean };
    avatar?: PopulatedAssetLean
};

type PopulatedTour = {
    _id: Types.ObjectId;
    title: string;
    slug: string;
    companyId: Types.ObjectId;
    heroImage?: {
        file?: {
            publicUrl: string;
        };
    };
};

// Cache for population configurations to avoid recreating them
const POPULATION_CONFIG = {
    reporter: {
        path: 'reporter',
        model: TravelerModel,
        populate: {
            path: 'user',
            model: UserModel,
            select: 'email avatar',
            populate: {
                path: 'avatar',
                model: AssetModel,
                populate: {
                    path: 'file',
                    model: AssetFileModel,
                    select: 'publicUrl',
                },
            },
        },
    },
    tour: {
        path: 'tour',
        model: TourModel,
        select: 'title slug companyId heroImage',
        populate: {
            path: 'heroImage',
            model: AssetModel,
            populate: {
                path: 'file',
                model: AssetFileModel,
                select: 'publicUrl',
            },
        },
    },
    resolvedBy: {
        path: 'resolvedBy',
        model: UserModel,
        select: 'name email',
    },
    rejectedBy: {
        path: 'rejectedBy',
        model: UserModel,
        select: 'name email',
    },
};

/**
 * GET report lits from fetchListPage method
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
    await ConnectDB();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const params: ReportsQueryParams = {
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '10'),
    };

    // Parse sort parameters
    const sortField = searchParams.get('sortField') as ReportsSortField;
    const sortDirection = searchParams.get('sortDirection') as SortDirection;
    if (sortField && sortDirection) {
        params.sort = { field: sortField, direction: sortDirection };
    }

    // Parse filter parameters
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const reason = searchParams.get('reason');
    const search = searchParams.get('search');
    const searchScope = searchParams.get('searchScope');

    if (status) params.status = status as ReportStatus;
    if (priority) params.priority = priority as ReportPriority;
    if (reason) params.reason = reason as ReportReason;
    if (search) params.search = search;
    if (searchScope) params.searchScope = searchScope as ReportsSearchScope | undefined;

    const userId = await getUserIdFromSession();
    if (!userId) throw new ApiError("Unauthorized", 401);

    // Single aggregation to obtain companyId
    const [userData] = await UserModel.aggregate([
        { $match: { _id: new Types.ObjectId(userId) } },
        {
            $lookup: {
                from: getCollectionName(GuideModel),
                localField: '_id',
                foreignField: 'owner.user',
                as: 'guide',
            },
        },
        {
            $lookup: {
                from: getCollectionName(EmployeeModel),
                localField: '_id',
                foreignField: 'user',
                as: 'employee',
            },
        },
        {
            $lookup: {
                from: getCollectionName(GuideModel),
                localField: 'employee.companyId',
                foreignField: '_id',
                as: 'assistantGuide',
            },
        },
        {
            $project: {
                role: 1,
                companyId: {
                    $switch: {
                        branches: [
                            {
                                case: { $eq: ['$role', USER_ROLE.GUIDE] },
                                then: { $arrayElemAt: ['$guide._id', 0] },
                            },
                            {
                                case: { $eq: ['$role', USER_ROLE.ASSISTANT] },
                                then: { $arrayElemAt: ['$assistantGuide._id', 0] },
                            },
                        ],
                        default: null,
                    },
                },
            },
        },
    ]);

    if (!userData) throw new Error('User not found');
    const companyId: Types.ObjectId | null = userData.companyId || null;

    // Determine allowed tours (owned by the guide/company)
    const allowedTourIds = (
        await TourModel.find({ companyId }).select('_id').lean()
    ).map(t => t._id) as Types.ObjectId[];

    if (!allowedTourIds.length) {
        const emptyResponse: ReportsListResponse = {
            docs: [],
            total: 0,
            page: Math.max(1, params.page || 1),
            pages: 0,
            limit: Math.max(1, Math.min(100, params.limit || 10)),
        };
        return { data: emptyResponse, status: 200 };
    }

    // Build filter query with proper typing
    const filterQuery: ReportFilterQuery = { deletedAt: null };

    if (companyId) {
        filterQuery.tour = { $in: allowedTourIds };
    }

    // Status filter
    if (params.status) {
        filterQuery.status = params.status;
    }

    // Priority filter
    if (params.priority) {
        filterQuery.priority = params.priority;
    }

    // Reason filter
    if (params.reason) {
        filterQuery.reason = params.reason;
    }

    // Search filter
    if (params.search && params.search.trim()) {
        const searchTerm = params.search.trim();
        const searchQuery = [];

        switch (params.searchScope) {
            case 'message':
                searchQuery.push({ message: { $regex: searchTerm, $options: 'i' } });
                break;
            case 'reporter':
                searchQuery.push({ 'reporter.name': { $regex: searchTerm, $options: 'i' } });
                break;
            case 'tour':
                searchQuery.push({ 'tour.title': { $regex: searchTerm, $options: 'i' } });
                break;
            case 'tags':
                searchQuery.push({ tags: { $regex: searchTerm, $options: 'i' } });
                break;
            default: // 'any'
                searchQuery.push(
                    { message: { $regex: searchTerm, $options: 'i' } },
                    { 'reporter.name': { $regex: searchTerm, $options: 'i' } },
                    { 'tour.title': { $regex: searchTerm, $options: 'i' } },
                    { tags: { $regex: searchTerm, $options: 'i' } }
                );
        }

        if (searchQuery.length > 0) {
            filterQuery.$or = searchQuery;
        }
    }

    // Build sort object
    const sortOptions: SortOptions = {};
    if (params.sort) {
        const { field, direction } = params.sort;
        const sortValue = direction === 'desc' ? -1 : 1;

        // Handle nested field sorting
        switch (field) {
            case 'reporter.name':
                // We'll handle this after population
                sortOptions.createdAt = -1; // Default fallback
                break;
            default:
                sortOptions[field] = sortValue;
        }
    } else {
        // Default sort: newest first
        sortOptions.createdAt = -1;
    }

    // Pagination calculations
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const skip = (page - 1) * limit;

    // First, get total count
    const total = await ReportModel.countDocuments(filterQuery);

    // Fetch reports with pagination and population
    const reports = await ReportModel.find(filterQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate(POPULATION_CONFIG.reporter)
        .populate(POPULATION_CONFIG.tour)
        .populate(POPULATION_CONFIG.resolvedBy)
        .populate(POPULATION_CONFIG.rejectedBy)
        .lean();

    // Transform to ReportListItem format
    const transformedDocs: ReportListItem[] = reports.map((report) => {
        // Type assertions for populated fields
        const reporter = report.reporter as unknown as PopulatedTraveler;
        const tour = report.tour as unknown as PopulatedTour;

        // Build UserRef
        const userRef: UserRef = {
            _id: reporter?._id?.toString() || report.reporter?.toString() || '',
        };

        if (reporter) {
            userRef.name = reporter.name;
            userRef.email = reporter.user?.email;

            // Get avatar URL
            if (reporter.user?.avatar?.file?.publicUrl) {
                userRef.avatarUrl = reporter.user.avatar.file.publicUrl;
            }
        }

        // Build TourRef
        const tourRef: TourRef = {
            _id: tour?._id?.toString() || report.tour?.toString() || '',
        };

        if (tour) {
            tourRef.title = tour.title;
            tourRef.slug = tour.slug;
            tourRef.companyId = tour.companyId?.toString();

            // Get heroImage URL
            if (tour.heroImage?.file?.publicUrl) {
                tourRef.heroImage = tour.heroImage.file.publicUrl;
            }
        }

        // Create message preview (first 100 chars)
        const messagePreview = report.message.length > 100
            ? `${report.message.substring(0, 100)}...`
            : report.message;

        return {
            _id: report._id?.toString() || '',
            reporter: userRef,
            tour: tourRef,
            reason: report.reason,
            priority: report.priority,
            status: report.status,
            messagePreview,
            createdAt: report.createdAt.toISOString(),
            updatedAt: report.updatedAt.toISOString(),
            reopenedCount: report.reopenedCount || 0,
            tags: report.tags || [],
        };
    });

    // If sorting by reporter.name, sort the transformed docs
    if (params.sort?.field === 'reporter.name') {
        transformedDocs.sort((a, b) => {
            const nameA = a.reporter.name || '';
            const nameB = b.reporter.name || '';
            return params.sort?.direction === 'asc'
                ? nameA.localeCompare(nameB)
                : nameB.localeCompare(nameA);
        });
    }

    // Build response
    const response: ReportsListResponse = {
        docs: transformedDocs,
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
    };

    return { data: response, status: 200 };
})