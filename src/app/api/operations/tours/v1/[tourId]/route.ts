// app/api/operations/tours/[tourId]/route.ts
import { NextRequest } from 'next/server';
import UserModel from '@/models/user.model';
import { USER_ROLE } from '@/constants/current-user/user.const';
import mongoose, { Types } from 'mongoose';
import { buildTourDetailDTO } from '@/lib/build-responses/build-tour-details';
import ConnectDB from '@/config/db';
import { ApiError, withErrorHandler } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import TourModel, { ITour } from '@/models/tours/tour.model';
import { MODERATION_STATUS, TOUR_STATUS } from '@/constants/tour/tour.const';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';
import { auditTourMutation, requireSessionUserId } from '@/lib/audit/tour-audit';
import { SupportSystemNotificationModel } from "@/models/notifications/support-system-notification.model";
import { SUPPORT_SYSTEM_NOTIFICATION_TYPE, SUPPORT_SYSTEM_NOTIFICATION_PRIORITY } from "@/constants/notifications/support-system-notification.const";
import { triggerSocketEvent } from "@/socket/triggerSocketEvent";
import { SocketTTriggerTypes } from "@/constants/socket/socket.const";
/**
 * GET Full Tour details 
 */
export const GET = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ tourId: string }> }
) => {
    const tourId = resolveMongoId((await params).tourId);

    if (!tourId) {
        throw new ApiError("Invalid tour ID", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(tourId)) {
        throw new ApiError("Invalid tour ID format", 400);
    }

    await ConnectDB();

    const tourDetail = await withTransaction(async (session) => {
        return await buildTourDetailDTO(new mongoose.Types.ObjectId(tourId), session);
    });

    if (!tourDetail) {
        throw new ApiError("Tour not found", 404);
    }

    return { data: tourDetail, status: 200 };
});


/**
 * POST for re-approval or final submission
 */
export const POST = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ tourId: string }> }
) => {

    const tourId = resolveMongoId((await params).tourId);
    const userId = await requireSessionUserId();

    if (!tourId || !Types.ObjectId.isValid(tourId)) {
        throw new ApiError("Invalid tour ID", 400);
    }

    await ConnectDB();

    const detailDto = await withTransaction(async (session) => {
        const tour = await TourModel.findById(tourId).session(session);

        if (!tour) {
            throw new ApiError("Tour not found", 404);
        }

        const cannotSubmitStatuses = [
            TOUR_STATUS.SUBMITTED,
            TOUR_STATUS.ACTIVE,
            TOUR_STATUS.TERMINATED,
            TOUR_STATUS.ARCHIVED
        ];

        const alreadyModeratedStatuses = [
            MODERATION_STATUS.APPROVED,
            MODERATION_STATUS.DENIED,
            MODERATION_STATUS.SUSPENDED
        ];

        if (cannotSubmitStatuses.includes(tour.status as TOUR_STATUS)) {
            throw new ApiError(
                `Tour cannot be submitted. Current status: ${tour.status}`,
                400
            );
        }

        if (alreadyModeratedStatuses.includes(tour.moderationStatus as MODERATION_STATUS)) {
            throw new ApiError(
                `Tour cannot be submitted. Current moderation status: ${tour.moderationStatus}`,
                400
            );
        }

        // Prepare update data
        const updateData: Partial<ITour> = {
            status: TOUR_STATUS.SUBMITTED,
            moderationStatus: MODERATION_STATUS.PENDING,
            // Clear any previous rejection reason when resubmitting
            ...(tour.rejectionReason && { rejectionReason: undefined }),
            updatedAt: new Date()
        };

        // Only set reApprovalRequestedAt if the tour was previously COMPLETED
        // This indicates it's being resubmitted after completion
        if (tour.status === TOUR_STATUS.COMPLETED) {
            updateData.reApprovalRequestedAt = new Date();
        }

        // Update tour status and moderation status
        const updatedTour = await TourModel.findByIdAndUpdate(
            tourId,
            { $set: updateData },
            { new: true }
        ).lean();

        if (!updatedTour) {
            throw new ApiError("Failed to update tour", 500);
        }

        const detailDto = await buildTourDetailDTO(updatedTour._id as Types.ObjectId, session);

        const notification = await SupportSystemNotificationModel.create(
            [{
                type: SUPPORT_SYSTEM_NOTIFICATION_TYPE.NEW_TOUR_REQUESTED,
                title: "New Tour Submission",
                message: `Tour "${updatedTour.title}" has been submitted for moderation.`,
                priority: SUPPORT_SYSTEM_NOTIFICATION_PRIORITY.MEDIUM,
                relatedModel: "Tour",
                relatedId: updatedTour._id,
            }],
            { session }
        );
        const notifDoc = Array.isArray(notification) ? notification[0] : notification;

        const adminUser = await UserModel.findOne({ role: USER_ROLE.ADMIN }).select("_id").lean();
        const ownerId = adminUser?._id?.toString() || "";

        triggerSocketEvent({
            userId: userId,
            ownerId: ownerId,
            type: SUPPORT_SYSTEM_NOTIFICATION_TYPE.NEW_TOUR_REQUESTED as unknown as SocketTTriggerTypes,
            data: notifDoc,
        }).catch(console.error);

        return detailDto
    });

    await auditTourMutation(userId, tourId, "Submitted tour for moderation");

    return { data: detailDto, status: 200 };
})