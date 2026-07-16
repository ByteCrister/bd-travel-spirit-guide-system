import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";
import ConnectDB from "@/config/db";
import { GuideSystemNotificationModel } from "@/models/notifications/guide-system-notification.model";

export const GET = withErrorHandler(async (req: NextRequest) => {
    await ConnectDB();
    const limit = Number(req.nextUrl.searchParams.get("limit") || "50");
    const notifications = await GuideSystemNotificationModel.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

    return { data: notifications, status: 200 };
});

export const PATCH = withErrorHandler(async (req: NextRequest) => {
    await ConnectDB();
    await GuideSystemNotificationModel.updateMany(
        { isDeleted: false, isRead: false },
        { $set: { isRead: true } }
    );
    return { data: { message: "All notifications marked as read." }, status: 200 };
});

export const DELETE = withErrorHandler(async (req: NextRequest) => {
    await ConnectDB();
    await GuideSystemNotificationModel.updateMany(
        { isDeleted: false },
        { $set: { isDeleted: true } }
    );
    return { data: { message: "All notifications cleared." }, status: 200 };
});
