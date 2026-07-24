// lib/cloudinary/delete.cloudinary.ts
import mongoose from "mongoose";
import AssetModel from "@/models/assets/asset.model";

/**
 * Soft-delete assets in the database.
 * Hard deletes and Cloudinary cleanup are handled by the support system cron job.
 *
 * Behavior:
 * - Soft-deletes Asset documents using the provided session (transaction-safe).
 *
 * @param assetIds - Array of Asset document IDs to clean up.
 * @param session  - Mongoose client session for transactional DB operations.
 */
export async function cleanupAssets(
    assetIds: mongoose.Types.ObjectId[],
    session: mongoose.ClientSession
): Promise<void> {
    if (!assetIds?.length) return;

    // Soft-delete Asset documents
    await AssetModel.softDeleteMany({ _id: { $in: assetIds } }, session);
}