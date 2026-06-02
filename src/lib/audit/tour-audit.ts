import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { ApiError } from "@/lib/helpers/withErrorHandler";
import { AUDIT_ACTION, AuditAction } from "@/constants/current-user/audit-action.const";
import { logAuditForActor } from "@/lib/audit/audit-logger";

export async function requireSessionUserId(): Promise<string> {
    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError("Unauthorized", 401);
    }
    return userId;
}

export async function auditTourMutation(
    userId: string,
    tourId: string,
    note: string,
    action: AuditAction = AUDIT_ACTION.UPDATE
): Promise<void> {
    await logAuditForActor(userId, {
        targetModel: "Tour",
        target: tourId,
        action,
        note,
    });
}
