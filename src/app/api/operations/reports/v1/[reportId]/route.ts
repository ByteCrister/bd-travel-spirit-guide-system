// app/api/operations/reports/v1/[reportId]/route.ts
import { NextRequest } from 'next/server';
import ConnectDB from '@/config/db';
import { Types } from 'mongoose';
import { buildTourReportResponse } from '@/lib/build-responses/build-tour-report-dt';
import { ApiError, withErrorHandler } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import { ReportModel } from '@/models/tours/report.model';


/**
 * GET API handler for fetching a single report's full details
 * Route: GET /api/operations/reports/v1/[reportId]
 */
export const GET = withErrorHandler(
    async (request: NextRequest, { params }: { params: Promise<{ reportId: string }> }) => {
        await ConnectDB();

        const reportId = (await params).reportId;

        // Validate reportId
        if (!reportId || !Types.ObjectId.isValid(reportId)) {
            throw new ApiError(
                'Report ID must be a valid MongoDB ObjectId',
                400
            );
        }

        // Parse query parameters
        const searchParams = request.nextUrl.searchParams;
        const withDeleted = searchParams.get('withDeleted') === 'true';

        // Use transaction for consistency in data fetching
        const fullReport = await withTransaction(async (session) => {
            // Assuming buildTourReportResponse can accept a session parameter
            // If not, you can remove the session parameter from the call
            const report = await buildTourReportResponse(reportId, withDeleted, session);

            if (!report) {
                throw new ApiError(
                    'No report found with the provided ID',
                    404
                );
            }

            return report;
        });

        // Return the full report with status
        return {
            data: fullReport,
            status: 200
        };
    }
);

/**
 * DELETE API handler for soft-deleting a report
 * Add this to your existing route.ts export
 */
export const DELETE = withErrorHandler(
    async (request: NextRequest, { params }: { params: Promise<{ reportId: string }> }) => {
        await ConnectDB();

        const reportId = (await params).reportId;

        // Validate reportId
        if (!reportId || !Types.ObjectId.isValid(reportId)) {
            throw new ApiError(
                'Report ID must be a valid MongoDB ObjectId',
                400
            );
        }

        // Get current user for audit (optional)
        const currentUserId = await getUserIdFromSession();
        if (!currentUserId) {
            throw new ApiError(
                'Unauthorized: You must be logged in to delete reports',
                401
            );
        }

        // Use transaction for atomic operation
        const deletedReport = await withTransaction(async (session) => {
            // Use the static method for soft deletion
            const report = await ReportModel.softDeleteById(reportId, { session });

            if (!report) {
                // Report might already be deleted or doesn't exist
                // Check if it exists (including deleted)
                const existingReport = await ReportModel.findOne({ _id: reportId })
                    .includeDeleted()
                    .session(session);

                if (!existingReport) {
                    throw new ApiError(
                        'Report not found with the provided ID',
                        404
                    );
                }

                // Check if already deleted
                if (existingReport.deletedAt) {
                    throw new ApiError(
                        'Report is already deleted',
                        400
                    );
                }

                // If we get here, something unexpected happened
                throw new ApiError(
                    'Failed to delete report',
                    500
                );
            }

            return report;
        });

        return {
            data: {
                success: true,
                reportId: deletedReport._id.toString(),
            },
            status: 200,
        };
    }
);