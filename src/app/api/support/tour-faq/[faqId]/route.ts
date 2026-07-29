import { NextRequest } from 'next/server';
import { Types } from 'mongoose';
import { ApiError, withErrorHandler } from '@/lib/helpers/withErrorHandler';
import ConnectDB from '@/config/db';
import { TourFAQModel } from '@/models/tours/tourFAQ.model';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import { MODERATION_STATUS } from '@/constants/tour/tour.const';

/* ------------------------------------------------------------------
   PUT /api/support/tour-faq/[faqId]
   Update an existing FAQ (status, question, answer)
------------------------------------------------------------------ */
export const PUT = withErrorHandler(
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

        const body = await request.json();
        const { question, answer, status } = body;

        // ── Status translation: UI uses 'rejected', DB stores 'denied' ──
        const toDbStatus = (s: string | undefined) =>
            s === 'rejected' ? MODERATION_STATUS.DENIED : s;

        const faq = await TourFAQModel.findById(faqId);
        if (!faq || faq.deletedAt) {
            throw new ApiError('FAQ not found', 404);
        }

        const updateData: any = {
            editedAt: new Date(),
            editedBy: userId,
        };

        if (question !== undefined) updateData.question = question;
        if (answer !== undefined) {
            updateData.answer = answer;
            updateData.answeredBy = userId;
            if (answer && !faq.answeredAt) {
                updateData.answeredAt = new Date();
            }
        }
        if (status !== undefined) updateData.status = toDbStatus(status);

        const updatedFAQ = await TourFAQModel.findByIdAndUpdate(
            faqId,
            { $set: updateData },
            { new: true, runValidators: true }
        )
            .populate('askedBy', '_id name avatar email')
            .populate('answeredBy', '_id name avatar email')
            .populate('tour', '_id title slug')
            .lean();

        // compute virtuals + translate status back to UI vocabulary
        if (updatedFAQ) {
            (updatedFAQ as any).likeCount = updatedFAQ.likes?.filter((l: any) => !l.deletedAt).length || 0;
            (updatedFAQ as any).dislikeCount = updatedFAQ.dislikes?.filter((d: any) => !d.deletedAt).length || 0;
            (updatedFAQ as any).isAnswered = Boolean(updatedFAQ.answer);
            (updatedFAQ as any).userVote = null;
            // DB stores 'denied'; UI expects 'rejected'
            if ((updatedFAQ as any).status === MODERATION_STATUS.DENIED) {
                (updatedFAQ as any).status = 'rejected';
            }
        }

        return {
            data: updatedFAQ,
            message: 'FAQ updated successfully',
        };
    }
);

/* ------------------------------------------------------------------
   DELETE /api/support/tour-faq/[faqId]
   Soft delete an FAQ
------------------------------------------------------------------ */
export const DELETE = withErrorHandler(
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

        const faq = await TourFAQModel.findById(faqId);
        if (!faq || faq.deletedAt) {
            throw new ApiError('FAQ not found', 404);
        }

        faq.deletedAt = new Date();
        await faq.save();

        return {
            data: null,
            message: 'FAQ deleted successfully',
        };
    }
);
