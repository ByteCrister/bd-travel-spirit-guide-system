// app/api/operations/reports/v1/[reportId]/resolve/route.ts

import { NextRequest } from 'next/server';
import { Types } from 'mongoose';

import ConnectDB from '@/config/db';
import { ApiError, withErrorHandler } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import { buildTourReportResponse } from '@/lib/build-responses/build-tour-report-dt';
import { ReportModel } from '@/models/tours/report.model';
import { REPORT_STATUS } from '@/constants/report.const';

/**
 * PUT /api/operations/reports/v1/[reportId]/resolve
 * Resolves a tour report
 */
export const PUT = withErrorHandler(
    async (
        request: NextRequest,
        { params }: { params: Promise<{ reportId: string }> }
    ) => {
        await ConnectDB();

        const { reportId } = await params;

        /**
         * Validate reportId
         */
        if (!reportId || !Types.ObjectId.isValid(reportId)) {
            throw new ApiError(
                'Invalid report ID. Please provide a valid report identifier.',
                400
            );
        }

        /**
         * Authenticate user
         */
        const currentUserId = await getUserIdFromSession();
        if (!currentUserId) {
            throw new ApiError(
                'Authentication required. Please log in to resolve a report.',
                401
            );
        }

        /**
         * Parse & validate request body
         */
        let body: { notes?: string };
        try {
            body = await request.json();
        } catch {
            throw new ApiError(
                'Invalid request body. Expected JSON payload.',
                400
            );
        }

        if (typeof body.notes !== 'string' || body.notes.trim().length === 0) {
            throw new ApiError(
                'Resolution notes are required and cannot be empty.',
                400
            );
        }

        /**
         * Transactional resolution
         */
        const reportDTO = await withTransaction(async (session) => {
            const report = await ReportModel
                .findById(reportId)
                .session(session);

            if (!report) {
                throw new ApiError(
                    'No report found for the given ID.',
                    404
                );
            }

            if (report.deletedAt) {
                throw new ApiError(
                    'This report has been deleted and cannot be resolved.',
                    400
                );
            }

            if (report.status === REPORT_STATUS.RESOLVED) {
                throw new ApiError(
                    'This report has already been resolved and cannot be updated.',
                    400
                );
            }

            /**
             * Resolve report (domain logic)
             */
            await report.resolve(body.notes, {
                session,
                resolvedBy: new Types.ObjectId(currentUserId),
            });

            /**
             * Build response DTO
             */
            const fullReportDTO = await buildTourReportResponse(reportId, true, session);

            if (!fullReportDTO) {
                throw new ApiError(
                    'The report was resolved, but the response could not be generated.',
                    500
                );
            }

            return fullReportDTO;
        });

        /**
         * Success response
         */
        return {
            status: 200,
            data: {
                success: true,
                message: 'Report resolved successfully.',
                report: reportDTO,
            },
        };
    }
);