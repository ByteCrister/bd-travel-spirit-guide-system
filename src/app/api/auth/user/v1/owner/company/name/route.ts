// app/api/auth/user/v1/owner/company/name/route.ts

import { NextRequest } from "next/server";
import { withErrorHandler, ApiError, HandlerResult } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import GuideModel from "@/models/guide/guide.model";
import { ClientSession, Types } from "mongoose";
import { Guide } from "@/types/guide.types";
import { buildGuideDto } from "@/lib/build-responses/buildGuideOwner-dt";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { GUIDE_STATUS } from "@/constants/guide.const";

interface CompanyNameUpdatePayload {
    companyName: string;
}

/**
 * Validate company name update data
 */
function validateCompanyNameData(
    data: unknown
): CompanyNameUpdatePayload {
    if (!data || typeof data !== "object") {
        throw new ApiError("Invalid request body", 400);
    }

    const { companyName } = data as Partial<CompanyNameUpdatePayload>;

    if (typeof companyName !== "string") {
        throw new ApiError("Company name must be a string", 400);
    }

    const trimmed = companyName.trim();

    if (!trimmed) {
        throw new ApiError("Company name cannot be empty", 400);
    }

    if (trimmed.length < 2) {
        throw new ApiError(
            "Company name must be at least 2 characters",
            400
        );
    }

    if (trimmed.length > 100) {
        throw new ApiError(
            "Company name cannot exceed 100 characters",
            400
        );
    }

    // Prevent HTML / script injection
    if (/[<>]/.test(trimmed)) {
        throw new ApiError(
            "Company name contains invalid characters",
            400
        );
    }

    // Prevent numeric-only names
    if (/^\d+$/.test(trimmed)) {
        throw new ApiError(
            "Company name cannot be only numbers",
            400
        );
    }

    return { companyName: trimmed };
}

/**
 * Check if the user is authorized to update the guide
 */
async function validateAuthorization(
    userId: Types.ObjectId,
    session: ClientSession
): Promise<Types.ObjectId> {
    const guide = await GuideModel.findOne({
        "owner.user": userId,
        deletedAt: null,
    }).session(session);

    if (!guide) {
        throw new ApiError(
            "Guide not found or access denied",
            404
        );
    }

    // Only approved guides can change company name
    if (guide.status !== GUIDE_STATUS.APPROVED) {
        throw new ApiError(
            "Company name can only be updated after approval",
            403
        );
    }

    return guide._id as Types.ObjectId;
}


/**
 * Handler function for PATCH /api/auth/user/v1/owner/company/name
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

    const { companyName } = validateCompanyNameData(body);

    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError("Unauthorized", 401);
    }

    const updatedGuide = await withTransaction(async (session) => {
        const guideId = await validateAuthorization(new Types.ObjectId(userId), session);

        const updatedGuide = await GuideModel.findByIdAndUpdate(
            guideId,
            { $set: { companyName } },
            {
                new: true,
                runValidators: true,
                session,
            }
        );

        if (!updatedGuide) {
            throw new ApiError(
                "Failed to update company name",
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