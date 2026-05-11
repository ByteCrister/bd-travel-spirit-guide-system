// app/api/auth/user/v1/owner/company/logo/route.ts

import { NextRequest } from "next/server";
import { withErrorHandler, ApiError, HandlerResult } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import GuideModel, { IGuide } from "@/models/guide/guide.model";
import { Types } from "mongoose";
import { Guide } from "@/types/guide.types";
import { ASSET_TYPE } from "@/constants/common/asset.const";
import { isBase64DataUrl, isCloudinaryUrl } from "@/lib/helpers/document-conversions";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { resolveDocuments } from "@/lib/cloudinary/resolve.cloudinary";
import { buildGuideDto } from "@/lib/build-responses/buildGuideOwner-dt";
import { GUIDE_STATUS } from "@/constants/guide/guide.const";

interface CompanyLogoUpdatePayload {
    logoUrl: string;
}

/**
Key rules:

Must be string

Must be base64 image OR Cloudinary URL

Enforce mime type

Enforce size limit

No fake “URL-looking” junk
*/

const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const SUPPORTED_IMAGE_MIMES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
];

function validateLogoRequest(
    data: unknown
): CompanyLogoUpdatePayload {
    if (!data || typeof data !== "object") {
        throw new ApiError("Invalid request body", 400);
    }

    const { logoUrl } = data as Partial<CompanyLogoUpdatePayload>;

    if (typeof logoUrl !== "string") {
        throw new ApiError("logoUrl must be a string", 400);
    }

    const trimmed = logoUrl.trim();
    if (!trimmed) {
        throw new ApiError("logoUrl cannot be empty", 400);
    }

    // ───── Cloudinary URL ─────
    if (isCloudinaryUrl(trimmed)) {
        return { logoUrl: trimmed };
    }

    // ───── Base64 Image ─────
    if (!isBase64DataUrl(trimmed)) {
        throw new ApiError(
            "logoUrl must be a base64 image or a Cloudinary URL",
            400
        );
    }

    const match = trimmed.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    if (!match) {
        throw new ApiError("Invalid image data URL", 400);
    }

    const mimeType = match[1];
    if (!SUPPORTED_IMAGE_MIMES.includes(mimeType)) {
        throw new ApiError(
            `Unsupported image format (${mimeType})`,
            400
        );
    }

    const base64Data = trimmed.split(",")[1];
    if (!base64Data) {
        throw new ApiError("Invalid base64 data", 400);
    }

    const sizeInBytes = Buffer.from(base64Data, "base64").length;
    if (sizeInBytes > MAX_LOGO_SIZE_BYTES) {
        throw new ApiError(
            "Logo image must be smaller than 5MB",
            400
        );
    }

    return { logoUrl: trimmed };
}

/**
 * Get existing logo asset ID from guide
 */
function getExistingLogoAsset(
    guide: IGuide
): Types.ObjectId | null {
    return guide.logoUrl instanceof Types.ObjectId
        ? guide.logoUrl
        : null;
}


/**
 * Handler function for PATCH /api/auth/user/v1/owner/company/logo
 */
async function handlePatchRequest(
    request: NextRequest
): Promise<HandlerResult<Guide>> {
    let body: unknown;

    try {
        body = await request.json();
    } catch {
        throw new ApiError("Invalid JSON body", 400);
    }

    const { logoUrl } = validateLogoRequest(body);

    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError("Unauthorized", 401);
    }

    const updatedGuide = await withTransaction(async (session) => {
        const guide = await GuideModel.findOne({
            "owner.user": userId,
            deletedAt: null,
        }).session(session);

        if (!guide) {
            throw new ApiError("Guide profile not found", 404);
        }

        if (guide.status !== GUIDE_STATUS.APPROVED) {
            throw new ApiError(
                "Cannot update logo for unapproved guide",
                403
            );
        }

        const existingLogoAsset = getExistingLogoAsset(guide);

        const resolvedDocs = await resolveDocuments(
            [
                {
                    type: "company_logo",
                    url: logoUrl,
                },
            ],
            existingLogoAsset
                ? [{ type: "company_logo", asset: existingLogoAsset }]
                : [],
            ASSET_TYPE.IMAGE,
            session
        );

        if (resolvedDocs.length !== 1) {
            throw new ApiError("Failed to process logo", 500);
        }

        const updatedGuide = await GuideModel.findByIdAndUpdate(
            guide._id,
            {
                $set: { logoUrl: resolvedDocs[0].asset },
                $currentDate: { updatedAt: true },
            },
            {
                new: true,
                runValidators: true,
                session,
            }
        );

        if (!updatedGuide) {
            throw new ApiError(
                "Failed to update company logo",
                500
            );
        }

        return buildGuideDto(
            updatedGuide._id as Types.ObjectId,
            session
        );
    });

    return {
        data: updatedGuide,
        status: 200,
    };
}


// Export the wrapped handler
export const PATCH = withErrorHandler(handlePatchRequest);