import { NextRequest } from "next/server";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import ConnectDB from "@/config/db";
import { GuideSystemNotificationModel } from "@/models/notifications/guide-system-notification.model";

export const PATCH = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    await ConnectDB();
    const { id } = await params;

    if (!id) {
        throw new ApiError("Notification ID is required", 400);
    }

    const notification = await GuideSystemNotificationModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isRead: true } },
        { new: true }
    );

    if (!notification) {
        throw new ApiError("Notification not found", 404);
    }

    return { data: notification, status: 200 };
});
