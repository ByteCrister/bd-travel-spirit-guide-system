// app/api/auth/user/v1/owner/avatar/route.ts
import { NextRequest } from "next/server";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import UserModel from "@/models/user.model";
import AssetModel from "@/models/assets/asset.model";
import { resolveDocuments } from "@/lib/cloudinary/resolve.cloudinary";
import { uploadAssets } from "@/lib/cloudinary/upload.cloudinary";
import { ASSET_TYPE } from "@/constants/common/asset.const";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { Types } from "mongoose";
import { USER_ROLE } from "@/constants/current-user/user.const";
import ConnectDB from "@/config/db";
import { AUDIT_ACTION, logAuditForActor } from "@/lib/audit/audit-logger";

export const PATCH = withErrorHandler(async (req: NextRequest) => {
    // 1. Authenticate
    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError("Unauthorized", 401);
    }

    // 2. Parse and validate body
    const { avatarBase64 } = (await req.json()) as { avatarBase64?: string };
    if (!avatarBase64 || typeof avatarBase64 !== "string") {
        throw new ApiError("avatarBase64 is required", 400);
    }

    await ConnectDB();

    // 3. Fetch user and verify role (guide only)
    const user = await UserModel.findById(userId).exec();
    if (!user) {
        throw new ApiError("User not found", 404);
    }
    if (user.role !== USER_ROLE.GUIDE) {
        throw new ApiError("Only guides can update avatar", 403);
    }

    const existingAvatarId = user.avatar ?? null;

    // 4. Perform Cloudinary upload OUTSIDE the transaction
    let newAssetId: Types.ObjectId;
    let assetsToDelete: Types.ObjectId[] = [];
    if (existingAvatarId) {
        // Replace existing avatar: reuse/resolve
        const result = await resolveDocuments(
            [{ type: ASSET_TYPE.IMAGE, url: avatarBase64 }],
            [{ type: ASSET_TYPE.IMAGE, asset: existingAvatarId }],
            ASSET_TYPE.IMAGE,
            null as any
        );
        newAssetId = result.resolvedDocs[0].asset;
        assetsToDelete = result.assetsToDelete;
    } else {
        // First avatar upload
        const [assetId] = await uploadAssets(
            [{ base64: avatarBase64, name: "profile-image-avatar", assetType: ASSET_TYPE.IMAGE }],
            null as any,
            1
        );
        newAssetId = assetId;
    }

    // 5. Execute the user update inside a transaction
    const avatarUrl = await withTransaction(async (session) => {
        // Update user document with the new asset id
        user.avatar = newAssetId;
        await user.save({ session });
        
        // Cleanup old avatar if it was replaced
        if (assetsToDelete.length > 0) {
            const { cleanupAssets } = await import('@/lib/cloudinary/delete.cloudinary');
            await cleanupAssets(assetsToDelete, session);
        }

        // 6. Fetch public URL of the new avatar
        const asset = await AssetModel.findById(newAssetId)
            .populate<{ file: { publicUrl: string } }>("file")
            .session(session);

        if (!asset?.file?.publicUrl) {
            throw new Error("Upload succeeded but public URL not found");
        }

        return asset.file.publicUrl;
    });

    await logAuditForActor(userId, {
        targetModel: "User",
        target: userId,
        action: AUDIT_ACTION.UPDATE,
        note: "Updated avatar",
    });

    return {
        data: { avatarUrl },
        status: 200,
    };
});