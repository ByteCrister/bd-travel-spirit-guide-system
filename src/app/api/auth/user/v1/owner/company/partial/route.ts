// app/api/auth/user/v1/owner/company/partial/route.ts

import { NextRequest } from "next/server";
import { withErrorHandler, ApiError, HandlerResult } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import GuideModel from "@/models/guide/guide.model";
import { OwnerProfileUpdateData } from "@/types/current-user.types";
import { Guide } from "@/types/guide.types";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { buildGuideDto } from "@/lib/build-responses/buildGuideOwner-dt";
import { Types } from "mongoose";

type GuideUpdateSet = Partial<
    Pick<Guide, "bio" | "address" | "social">
>;

/**
 * Validate update data structure
 */
function validateUpdateData(data: Partial<OwnerProfileUpdateData>): void {
    if (!data.social && !data.address && !data.bio) {
        throw new ApiError("No data provided for update", 400);
    }

    // Validate social links if provided
    if (data.social) {
        if (!Array.isArray(data.social)) {
            throw new ApiError("Social links must be an array", 400);
        }

        // Validate each social link
        data.social.forEach((link, index) => {
            if (!link.platform || !link.url) {
                throw new ApiError(`Social link at index ${index} must have platform and url`, 400);
            }

            // Validate URL format (basic)
            try {
                new URL(link.url);
            } catch {
                throw new ApiError(`Social link at index ${index} has invalid URL`, 400);
            }
        });

        // Limit number of social links
        if (data.social.length > 5) {
            throw new ApiError("Cannot have more than 5 social links", 400);
        }
    }

    // Validate bio length if provided
    if (data.bio && data.bio.length > 500) {
        throw new ApiError("Bio cannot exceed 500 characters", 400);
    }

    // Validate address structure if provided
    if (data.address) {
        // Check that at least one address field is provided
        const { country, division, city, zip, street } = data.address;
        if (!country && !division && !city && !zip && !street) {
            throw new ApiError("Address must contain at least one field", 400);
        }
    }
}

/**
 * Prepare update data for MongoDB
 */
function prepareUpdateData(
    data: OwnerProfileUpdateData
): GuideUpdateSet {
    const update: GuideUpdateSet = {};

    if (data.bio !== undefined) {
        update.bio = data.bio;
    }

    if (data.address !== undefined) {
        update.address = {
            ...data.address,
        };
    }

    if (data.social !== undefined) {
        update.social = data.social.map((link) => ({
            platform: link.platform,
            url: link.url,
        }));
    }

    return update;
}

/**
 * Handler function for PATCH /api/auth/user/v1/owner/company/partial
 */
async function handlePatchRequest(
    request: NextRequest
): Promise<HandlerResult<Guide>> {
    let body: OwnerProfileUpdateData;

    try {
        body = await request.json();
    } catch {
        throw new ApiError("Invalid JSON body", 400);
    }

    validateUpdateData(body);

    const userId = await getUserIdFromSession();
    const updateData = prepareUpdateData(body);

    const updatedGuide = await withTransaction(async (session) => {
        const guide = await GuideModel.findOne({
            "owner.user": userId,
            deletedAt: null,
        }).session(session);

        if (!guide) {
            throw new ApiError("Guide profile not found", 404);
        }

        const updatedGuide = await GuideModel.findByIdAndUpdate(
            guide._id,
            { $set: updateData },
            {
                new: true,
                runValidators: true,
                session,
            }
        );

        if (!updatedGuide) {
            throw new ApiError(
                "Failed to update guide profile",
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