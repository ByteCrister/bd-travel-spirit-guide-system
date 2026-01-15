// app/api/operations/reports/v1/bulk-resolve/route.ts

import { NextRequest } from 'next/server';
import { Types } from 'mongoose';

import ConnectDB from '@/config/db';
import { ApiError, withErrorHandler } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import { ReportModel } from '@/models/tours/report.model';
import { REPORT_STATUS } from '@/constants/report.const';

/**
 * PATCH /api/operations/reports/v1/bulk-resolve
 * Bulk resolve reports
 */
export const PATCH = withErrorHandler(
    async (request: NextRequest) => {
        await ConnectDB();

        /**
         * Authentication
         */
        const currentUserId = await getUserIdFromSession();
        if (!currentUserId) {
            throw new ApiError(
                'Authentication required. Please log in to resolve reports.',
                401
            );
        }

        /**
         * Parse request body
         */
        let body: { reportIds?: string[]; notes?: string };
        try {
            body = await request.json();
        } catch {
            throw new ApiError(
                'Invalid request body. Expected JSON payload.',
                400
            );
        }

        const { reportIds, notes } = body;

        /**
         * Validate reportIds
         */
        if (!Array.isArray(reportIds)) {
            throw new ApiError(
                'reportIds must be provided as an array.',
                400
            );
        }

        if (reportIds.length === 0) {
            throw new ApiError(
                'At least one report ID must be provided.',
                400
            );
        }

        /**
         * Validate ObjectId format
         */
        const invalidIds = reportIds.filter(id => !Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
            throw new ApiError(
                `Invalid report ID format: ${invalidIds.join(', ')}`,
                400
            );
        }

        /**
         * Check for duplicate IDs
         */
        const uniqueIds = new Set(reportIds);
        if (uniqueIds.size !== reportIds.length) {
            const duplicates = reportIds.filter(
                (id, index) => reportIds.indexOf(id) !== index
            );

            throw new ApiError(
                `Duplicate report IDs detected: ${[...new Set(duplicates)].join(', ')}`,
                400
            );
        }

        const objectIds = reportIds.map(id => new Types.ObjectId(id));

        /**
         * Transactional bulk resolve
         */
        const result = await withTransaction(async (session) => {
            const reports = await ReportModel.find({
                _id: { $in: objectIds },
            }).session(session);

            const foundIds = reports.map(r => r._id.toString());
            const missingIds = reportIds.filter(id => !foundIds.includes(id));

            if (missingIds.length > 0) {
                throw new ApiError(
                    `Reports not found: ${missingIds.join(', ')}`,
                    404
                );
            }

            const alreadyResolved: string[] = [];
            const deletedReports: string[] = [];

            reports.forEach(report => {
                if (report.status === REPORT_STATUS.RESOLVED) {
                    alreadyResolved.push(report._id.toString());
                }
                if (report.deletedAt) {
                    deletedReports.push(report._id.toString());
                }
            });

            const errors: Array<{ reportId: string; error: string }> = [];

            alreadyResolved.forEach(id =>
                errors.push({
                    reportId: id,
                    error: 'Report is already resolved.',
                })
            );

            deletedReports.forEach(id =>
                errors.push({
                    reportId: id,
                    error: 'Report has been deleted and cannot be resolved.',
                })
            );

            const validReportIds = reportIds.filter(
                id =>
                    !alreadyResolved.includes(id) &&
                    !deletedReports.includes(id)
            );

            if (validReportIds.length === 0) {
                return {
                    success: false,
                    message: 'No eligible reports found to resolve.',
                    resolvedCount: 0,
                    errors,
                };
            }

            /**
             * Bulk resolve
             */
            const bulkResult = await ReportModel.bulkResolve(
                validReportIds,
                notes,
                {
                    session,
                    resolvedBy: new Types.ObjectId(currentUserId),
                }
            );

            if (bulkResult.failedIds.length > 0) {
                bulkResult.failedIds.forEach(id => {
                    errors.push({
                        reportId: id,
                        error: 'Failed to resolve report due to an internal error.',
                    });
                });
            }

            const successMessage =
                errors.length > 0
                    ? `Resolved ${bulkResult.modifiedCount} out of ${reportIds.length} reports.`
                    : `Successfully resolved ${bulkResult.modifiedCount} report(s).`;

            return {
                success: bulkResult.modifiedCount > 0,
                message: successMessage,
                resolvedCount: bulkResult.modifiedCount,
                errors: errors.length > 0 ? errors : undefined,
            };
        });

        return {
            status: result.success ? 200 : 207, // Multi-Status for partial success
            data: result,
        };
    }
);