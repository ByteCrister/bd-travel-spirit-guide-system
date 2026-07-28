import { NextRequest } from 'next/server';
import { Types } from 'mongoose';
import { ApiError, withErrorHandler } from '@/lib/helpers/withErrorHandler';
import ConnectDB from '@/config/db';
import { TourFAQModel } from '@/models/tours/tourFAQ.model';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import { TravelerModel } from '@/models/travelers/traveler.model';

/* ------------------------------------------------------------------
   GET /api/support/tour-faq/[faqId]/reports
   Fetch reports for a specific FAQ
------------------------------------------------------------------ */
export const GET = withErrorHandler(
    async (request: NextRequest, { params }: { params: Promise<{ faqId: string }> }) => {
        await ConnectDB();

        const { faqId } = await params;
        if (!faqId || !Types.ObjectId.isValid(faqId)) {
            throw new ApiError('Invalid FAQ ID', 400);
        }

        const userId = await getUserIdFromSession();
        if (!userId) {
            throw new ApiError('Unauthorized', 401);
        }

        const faq = await TourFAQModel.findById(faqId)
            .select('reports')
            .populate({
                path: 'reports.reportedBy',
                select: '_id name avatar email',
                model: TravelerModel
            })
            .lean();

        if (!faq) {
            throw new ApiError('FAQ not found', 404);
        }

        return {
            data: {
                reports: faq.reports || []
            },
        };
    }
);
