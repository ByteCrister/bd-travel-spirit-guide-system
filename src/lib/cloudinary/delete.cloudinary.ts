// lib/cloudinary/delete.cloudinary.ts
import mongoose from "mongoose";
import AssetModel from "@/models/assets/asset.model";
import AssetFileModel from "@/models/assets/asset-file.model";
import { getDocumentStorageProvider } from "@/lib/storage-providers";
import { STORAGE_PROVIDER } from "@/constants/common/asset.const";

/**
 * Soft-delete assets in the database and remove their files from Cloudinary
 * when no other Asset references them (refCount reaches 0).
 *
 * Behavior:
 * - Soft-deletes Asset documents using the provided session (transaction-safe).
 * - Decrements refCount on the associated AssetFile (done inside softDeleteMany).
 * - After the DB operations, fetches any AssetFile whose refCount is now 0
 *   and deletes them from Cloudinary. Storage failures are logged but do not
 *   abort the process (the DB soft-delete already committed).
 *
 * @param assetIds - Array of Asset document IDs to clean up.
 * @param session  - Mongoose client session for transactional DB operations.
 */
export async function cleanupAssets(
    assetIds: mongoose.Types.ObjectId[],
    session: mongoose.ClientSession
): Promise<void> {
    if (!assetIds?.length) return;

    // 1️⃣ Fetch Assets (with file IDs) before soft-deleting
    const assets = await AssetModel.find({ _id: { $in: assetIds }, deletedAt: null })
        .session(session)
        .select("file")
        .lean();

    if (!assets.length) return;

    const fileIds = assets.map(a => a.file);

    // 2️⃣ Soft-delete Asset documents and decrement AssetFile.refCount
    //    (softDeleteMany handles the decrement internally)
    await AssetModel.softDeleteMany({ _id: { $in: assetIds } }, session);

    // 3️⃣ After decrement, find AssetFiles whose refCount has reached 0
    //    — these are truly orphaned and should be removed from Cloudinary.
    //    This runs OUTSIDE the session intentionally: Cloudinary is not
    //    transactional, and we don't want a storage failure to roll back the DB.
    const orphanedFiles = await AssetFileModel.find({
        _id: { $in: fileIds },
        refCount: { $lte: 0 },
        objectKey: { $exists: true, $ne: "" },
    }).lean();

    if (!orphanedFiles.length) return;

    const storage = getDocumentStorageProvider(STORAGE_PROVIDER.CLOUDINARY);
    const objectKeys = orphanedFiles.map(f => f.objectKey);

    try {
        await storage.deleteMany(objectKeys);
    } catch (err) {
        // Storage failures are logged but do not throw — the DB state is already
        // consistent. The files can be cleaned up via a background job later.
        console.error("[cleanupAssets] Failed to delete files from Cloudinary:", err);
    }
}