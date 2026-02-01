// app/api/auth/user/v1/owner/route.ts
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import ConnectDB from "@/config/db";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import GuideModel from "@/models/guide/guide.model";
import { buildGuideDto } from "@/lib/build-responses/buildGuideOwner-dt";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { Types } from "mongoose";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";

/**
 * GET /api/auth/user/owner
 * Returns extended info for the currently logged-in Owner (platform administrator)
 */
export const GET = withErrorHandler(async () => {

    // Get user ID from session
    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError("Unauthorized", 401);
    }
    await ConnectDB();

    return withTransaction(async (session) => {

        await VERIFY_USER_ROLE.GUIDE(userId);

        // IMPORTANT: attach session to queries
        const guide = await GuideModel.findOne(
            {
                "owner.user": userId,
                deletedAt: null,
            },
            null,
            { session }
        );

        if (!guide) {
            throw new ApiError("Guide profile not found", 404);
        }

        // Pass session down if buildGuideDto does DB work
        const guideDto = await buildGuideDto(guide._id as Types.ObjectId, session);

        return {
            data: guideDto,
            status: 200,
        };
    });
});