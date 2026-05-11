// app/api/operations/reports/v1/[reportId]/reject/route.ts

import { NextRequest } from 'next/server';
import { Types } from 'mongoose';

import ConnectDB from '@/config/db';
import { ApiError, withErrorHandler } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import { ReportModel } from '@/models/tours/report.model';
import { REPORT_STATUS } from '@/constants/tour/report.const';
import { buildTourReportResponse } from '@/lib/build-responses/build-tour-report-dt';

/**
 * PUT /api/operations/reports/v1/[reportId]/reject
 * Rejects a report
 */
export const PUT = withErrorHandler(
    async (request: NextRequest, { params }: { params: Promise<{ reportId: string }> }) => {
        await ConnectDB();

        const reportId = (await params).reportId;

        /**
         * Validate reportId
         */
        if (!reportId || !Types.ObjectId.isValid(reportId)) {
            throw new ApiError(
                'Invalid report ID. Please provide a valid identifier.',
                400
            );
        }

        /**
         * Authenticate user
         */
        const currentUserId = await getUserIdFromSession();
        if (!currentUserId) {
            throw new ApiError(
                'Authentication required. Please log in to reject reports.',
                401
            );
        }

        /**
         * Parse request body and validate notes
         */
        let notes: string | undefined;
        try {
            const body = await request.json();
            if (typeof body.notes === 'string' && body.notes.trim().length > 0) {
                notes = body.notes.trim();
            }
        } catch {
            // Ignore invalid JSON; notes remain undefined
        }

        if (!notes) {
            throw new ApiError(
                'Rejection notes are required when rejecting a report.',
                400
            );
        }

        /**
         * Transactional reject
         */
        const fullReport = await withTransaction(async (session) => {
            const report = await ReportModel.findById(reportId).session(session);

            if (!report) {
                throw new ApiError(
                    'Report not found.',
                    404
                );
            }

            if (report.deletedAt) {
                throw new ApiError(
                    'Cannot reject a deleted report.',
                    400
                );
            }

            if (report.status === REPORT_STATUS.REJECTED) {
                throw new ApiError(
                    'Report is already rejected.',
                    400
                );
            }

            if (report.status === REPORT_STATUS.RESOLVED) {
                throw new ApiError(
                    'Cannot reject a resolved report. Reopen it first to make changes.',
                    400
                );
            }

            /**
             * Reject the report
             */
            const updatedReport = await report.reject(notes, {
                session,
                rejectedBy: new Types.ObjectId(currentUserId),
            });

            const reportDTO = await buildTourReportResponse(
                updatedReport._id.toString(),
                false, // exclude deleted
                session
            );

            if (!reportDTO) {
                throw new ApiError(
                    'Failed to fetch rejected report details.',
                    500
                );
            }

            return reportDTO;
        });

        return {
            status: 200,
            data: {
                success: true,
                message: 'Report rejected successfully.',
                report: fullReport,
            },
        };
    }
);