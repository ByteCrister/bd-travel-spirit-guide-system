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

export const PATCH = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    await ConnectDB();
    const { id } = await params;

    if (!id) {
        throw new ApiError("Notification ID is required", 400);
    }

    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError('No active session found', 401);
    }
    const { guideId } = await getCompanyGuideId(userId);

    const notification = await GuideSystemNotificationModel.findOneAndUpdate(
        { _id: id, guide: guideId, isDeleted: false },
        { $set: { isRead: true } },
        { new: true }
    );

    if (!notification) {
        throw new ApiError("Notification not found", 404);
    }

    return { data: notification, status: 200 };
});
