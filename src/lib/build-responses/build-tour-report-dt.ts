import {
    ReportFull,
    UserRef,
    TourRef,
} from '@/types/tour/reports.types';
import { ITraveler, TravelerModel } from '@/models/travelers/traveler.model';
import UserModel from '@/models/user.model';
import AssetModel from '@/models/assets/asset.model';
import AssetFileModel from '@/models/assets/asset-file.model';
import TourModel from '@/models/tours/tour.model';
import { IReport, ReportModel } from '@/models/tours/report.model';
import { Types, ClientSession, FilterQuery } from 'mongoose';
import { PopulatedAssetLean } from '@/types/common/populated-asset.types';


// Define types for populated documents
type PopulatedTraveler = ITraveler & {
    user?: { email: string };
    avatar?: {
        file?: {
            publicUrl: string;
        };
    };
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

type PopulatedUser = {
    _id: Types.ObjectId;
    name?: string;
    email?: string;
};

// Extended report type with populated fields
type PopulatedReport = IReport & {
    reporter?: PopulatedTraveler;
    tour?: PopulatedTour;
    resolvedBy?: PopulatedUser;
    rejectedBy?: PopulatedUser;
    evidenceImages?: PopulatedAssetLean[];
};

// Population configurations
const POPULATION_CONFIG = {
    reporter: {
        path: 'reporter',
        model: TravelerModel,
        populate: [
            {
                path: 'user',
                model: UserModel,
                select: 'email',
            },
            {
                path: 'avatar',
                model: AssetModel,
                populate: {
                    path: 'file',
                    model: AssetFileModel,
                    select: 'publicUrl',
                },
            },
        ],
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
    evidenceImages: {
        path: 'evidenceImages',
        model: AssetModel,
        populate: {
            path: 'file',
            model: AssetFileModel,
            select: 'publicUrl',
        },
    },
};

/**
 * Builds a comprehensive report response with all populated data
 * @param reportId - The ID of the report to fetch
 * @param withDeleted - Whether to include deleted reports (default: false)
 * @param session - Optional MongoDB session for transactions
 * @returns Promise<ReportFull | null>
 */
export async function buildTourReportResponse(
    reportId: string | Types.ObjectId,
    withDeleted: boolean = false,
    session?: ClientSession
): Promise<ReportFull | null> {
    try {
        // Build base query
        const query: FilterQuery<IReport> = { _id: reportId };

        // Handle soft-delete filter
        if (!withDeleted) {
            query.deletedAt = null;
        }

        // Fetch report with all population
        const report = await ReportModel.findOne(query)
            .populate(POPULATION_CONFIG.reporter)
            .populate(POPULATION_CONFIG.tour)
            .populate(POPULATION_CONFIG.resolvedBy)
            .populate(POPULATION_CONFIG.rejectedBy)
            .populate(POPULATION_CONFIG.evidenceImages)
            .session(session || null)
            .lean<PopulatedReport>();

        if (!report) {
            return null;
        }

        // Type assertions for populated fields
        const reporter = report.reporter as PopulatedTraveler | undefined;
        const tour = report.tour as PopulatedTour | undefined;
        const resolvedBy = report.resolvedBy as PopulatedUser | undefined;
        const rejectedBy = report.rejectedBy as PopulatedUser | undefined;
        const evidenceImages = report.evidenceImages as PopulatedAssetLean[] | undefined;

        // Build UserRef
        const userRef: UserRef = {
            _id: reporter?._id?.toString() || report.reporter?.toString() || '',
        };

        if (reporter) {
            userRef.name = reporter.name;
            userRef.email = reporter.user?.email;

            // Get avatar URL
            if (reporter.avatar?.file?.publicUrl) {
                userRef.avatarUrl = reporter.avatar.file.publicUrl;
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

        // Build evidence image URLs
        const evidenceImageUrls: string[] = [];
        if (evidenceImages && Array.isArray(evidenceImages)) {
            evidenceImages.forEach((asset) => {
                if (asset?.file?.publicUrl) {
                    evidenceImageUrls.push(asset.file.publicUrl);
                }
            });
        }

        // Build resolvedBy/rejectedBy user info
        let resolutionNotes: string | null | undefined = report.resolutionNotes;
        let rejectionNotes: string | undefined = report.rejectionNotes;

        // If we have resolvedBy user, add their info to resolution notes
        if (resolvedBy && resolutionNotes) {
            const userInfo = `${resolvedBy.name || 'User'} (${resolvedBy.email || 'No email'})`;
            resolutionNotes = `${resolutionNotes}\n\nResolved by: ${userInfo}`;
        }

        // If we have rejectedBy user, add their info to rejection notes
        if (rejectedBy && rejectionNotes) {
            const userInfo = `${rejectedBy.name || 'User'} (${rejectedBy.email || 'No email'})`;
            rejectionNotes = `${rejectionNotes}\n\nRejected by: ${userInfo}`;
        }

        // Construct the full report response
        const fullReport: ReportFull = {
            _id: report._id?.toString() || '',
            reporter: userRef,
            tour: tourRef,
            reason: report.reason,
            message: report.message,
            evidenceImages: evidenceImageUrls.length > 0 ? evidenceImageUrls : undefined,
            evidenceLinks: report.evidenceLinks,
            status: report.status,
            priority: report.priority,
            resolutionNotes: resolutionNotes || null,
            resolvedAt: report.resolvedAt?.toISOString() || null,
            rejectionNotes: rejectionNotes,
            rejectedAt: report.rejectedAt?.toISOString() || null,
            reopenedCount: report.reopenedCount || 0,
            tags: report.tags || [],
            createdAt: report.createdAt.toISOString(),
            updatedAt: report.updatedAt.toISOString(),
            deletedAt: report.deletedAt?.toISOString() || null,
        };

        return fullReport;
    } catch (error) {
        console.error('Error building report response:', error);
        throw error;
    }
}