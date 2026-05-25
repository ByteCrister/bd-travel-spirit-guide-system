// app/api/operations/reports/v1/[reportId]/reopen/route.ts

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
 * PUT /api/operations/reports/v1/[reportId]/reopen
 * Reopens a resolved or rejected report
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
                'Authentication required. Please log in to reopen reports.',
                401
            );
        }

        /**
         * Parse optional notes
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

        /**
         * Transactional reopen
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
                    'Cannot reopen a deleted report.',
                    400
                );
            }

            if ([REPORT_STATUS.OPEN, REPORT_STATUS.IN_REVIEW].includes(report.status as REPORT_STATUS)) {
                throw new ApiError(
                    `Report is already in ${report.status.toLowerCase()} status and cannot be reopened.`,
                    400
                );
            }

            if (![REPORT_STATUS.RESOLVED, REPORT_STATUS.REJECTED].includes(report.status as REPORT_STATUS)) {
                throw new ApiError(
                    `Report cannot be reopened from ${report.status.toLowerCase()} status.`,
                    400
                );
            }

            /**
             * Reopen the report
             */
            const updatedReport = await report.reopen({
                session,
                notes,
            });

            const reportDTO = await buildTourReportResponse(
                updatedReport._id.toString(),
                false, // exclude deleted
                session
            );

            if (!reportDTO) {
                throw new ApiError(
                    'Failed to fetch reopened report details.',
                    500
                );
            }

            return reportDTO;
        });

        return {
            status: 200,
            data: {
                success: true,
                message: 'Report reopened successfully.',
                report: fullReport,
            },
        };
    }
);