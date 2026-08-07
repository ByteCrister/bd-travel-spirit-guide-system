import { NextRequest } from "next/server";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import ConnectDB from "@/config/db";
import { GuideSystemNotificationModel } from "@/models/notifications/guide-system-notification.model";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import UserModel from "@/models/user.model";
import { USER_ROLE, UserRole } from "@/constants/current-user/user.const";
import GuideModel from "@/models/guide/guide.model";
import EmployeeModel from "@/models/employees/employees.model";
import { Types } from "mongoose";

async function getCompanyGuideId(userId: string): Promise<{ guideId: Types.ObjectId; role: UserRole }> {
    const user = await UserModel.findById(userId).select('role').lean();
    if (!user) throw new ApiError('User not found', 404);

    const role = user.role as UserRole;

    if (role === USER_ROLE.GUIDE) {
        const guide = await GuideModel.findOne({ 'owner.user': new Types.ObjectId(userId) })
            .select('_id')
            .lean<{ _id: Types.ObjectId } | null>();
        if (!guide) throw new ApiError('Guide profile not found', 404);
        return { guideId: guide._id, role };
    }

    if (role === USER_ROLE.ASSISTANT) {
        const employee = await EmployeeModel.findOne({ user: new Types.ObjectId(userId), deletedAt: null })
            .select('companyId')
            .lean<{ companyId?: Types.ObjectId } | null>();
        if (!employee?.companyId) throw new ApiError('Assistant not linked to a company', 403);
        return { guideId: employee.companyId, role };
    }

    throw new ApiError('Access denied: Only guides and assistants can access notifications', 403);
}

export const GET = withErrorHandler(async (req: NextRequest) => {
    await ConnectDB();
    
    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError('No active session found', 401);
    }
    const { guideId } = await getCompanyGuideId(userId);

    const limit = Number(req.nextUrl.searchParams.get("limit") || "50");
    const notifications = await GuideSystemNotificationModel.find({ guide: guideId, isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

    return { data: notifications, status: 200 };
});

export const PATCH = withErrorHandler(async (req: NextRequest) => {
    await ConnectDB();

    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError('No active session found', 401);
    }
    const { guideId } = await getCompanyGuideId(userId);

    await GuideSystemNotificationModel.updateMany(
        { guide: guideId, isDeleted: false, isRead: false },
        { $set: { isRead: true } }
    );
    return { data: { message: "All notifications marked as read." }, status: 200 };
});

export const DELETE = withErrorHandler(async (req: NextRequest) => {
    await ConnectDB();

    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError('No active session found', 401);
    }
    const { guideId } = await getCompanyGuideId(userId);

    await GuideSystemNotificationModel.updateMany(
        { guide: guideId, isDeleted: false },
        { $set: { isDeleted: true } }
    );
    return { data: { message: "All notifications cleared." }, status: 200 };
});
