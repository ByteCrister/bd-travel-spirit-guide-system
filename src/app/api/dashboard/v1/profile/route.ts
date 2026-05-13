// app/api/dashboard/v1/profile/route.ts
import { Types } from "mongoose";
import UserModel from "@/models/user.model";
import AssetModel from "@/models/assets/asset.model";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { getCollectionName } from "@/lib/helpers/get-collection-name";
import EmployeeModel from "@/models/employees/employees.model";
import GuideModel from "@/models/guide/guide.model";
import { CompanyInfo, OwnerInfo } from "@/types/dashboard/dashboard.type";
import { USER_ROLE } from "@/constants/current-user/user.const";
import ConnectDB from "@/config/db";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";

/** Lean guide shape after `owner.user` populate */
type GuideProfileLean = {
    _id: Types.ObjectId;
    companyName: string;
    logoUrl?: Types.ObjectId;
    createdAt: Date;
    address?: {
        country?: string;
        division?: string;
        city?: string;
        zip?: string;
        street?: string;
    };
    owner: {
        user: {
            _id: Types.ObjectId;
            name: string;
            email: string;
            avatar?: Types.ObjectId;
            createdAt: Date;
        };
        phone?: string;
        oauthProvider?: string;
    };
};

// ── Helper: batch resolve asset IDs → publicUrl ─────────────
async function batchResolveAssetUrls(
    ids: (Types.ObjectId | undefined)[]
): Promise<Record<string, string | undefined>> {
    const validIds = ids.filter((id): id is Types.ObjectId => !!id);
    if (validIds.length === 0) return {};

    const assets = await AssetModel.find({ _id: { $in: validIds } })
        .populate<{ assetfile: { publicUrl: string } }>("assetfile")
        .lean();

    const map: Record<string, string | undefined> = {};
    assets.forEach((asset) => {
        map[asset._id.toString()] = asset.assetfile?.publicUrl;
    });
    validIds.forEach((id) => {
        if (!(id.toString() in map)) map[id.toString()] = undefined;
    });
    return map;
}

// ── Main handler logic (wrapped by withErrorHandler) ────────
async function getCompanyInfoHandler(): Promise<{
    data: { companyInfo: CompanyInfo; ownerInfo: OwnerInfo };
}> {
    // 1. Get and validate user ID from session
    const userIdString = await getUserIdFromSession();
    if (!userIdString || !Types.ObjectId.isValid(userIdString)) {
        throw new ApiError("Invalid or missing user ID", 401);
    }
    const userId = new Types.ObjectId(userIdString);

    await ConnectDB();

    // 2. Aggregation: get user role and companyId (fix incorrect $cond)
    const aggregationResult = await UserModel.aggregate([
        { $match: { _id: userId } },
        {
            $lookup: {
                from: getCollectionName(EmployeeModel),
                localField: "_id",
                foreignField: "user",
                as: "employee",
            },
        },
        {
            $lookup: {
                from: getCollectionName(GuideModel),
                localField: "_id",
                foreignField: "owner.user",
                as: "guide",
            },
        },
        {
            $project: {
                role: 1,
                companyId: {
                    $cond: {
                        if: { $eq: ["$role", USER_ROLE.ASSISTANT] },
                        then: { $arrayElemAt: ["$employee.companyId", 0] },
                        else: {
                            $cond: {
                                if: { $eq: ["$role", USER_ROLE.GUIDE] },
                                then: { $arrayElemAt: ["$guide._id", 0] },
                                else: null,
                            },
                        },
                    },
                },
            },
        },
        { $limit: 1 },
    ]);

    const userInfo = aggregationResult[0];
    if (!userInfo || !userInfo.companyId) {
        throw new ApiError("User not found or not associated with a company", 404);
    }
    const companyId = userInfo.companyId;

    // 3. Fetch the Guide (company) with owner's user populated
    const guide = await GuideModel.findById(companyId)
        .populate({
            path: "owner.user",
            select: "name email avatar createdAt",
        })
        .lean<GuideProfileLean | null>();

    if (!guide) {
        throw new ApiError("Company not found", 404);
    }

    const ownerUser = guide.owner.user;

    // 4. Batch resolve asset URLs for logo and avatar
    const assetIds = [
        guide.logoUrl,
        ownerUser?.avatar,
    ];
    const urlMap = await batchResolveAssetUrls(assetIds);

    const logoUrl = guide.logoUrl
        ? urlMap[guide.logoUrl.toString()]
        : undefined;
    const ownerAvatarUrl = ownerUser?.avatar
        ? urlMap[ownerUser.avatar.toString()]
        : undefined;

    // 5. Build response objects
    const ownerInfo: OwnerInfo = {
        user: {
            _id: ownerUser._id.toString(),
            name: ownerUser.name,
            email: ownerUser.email,
            avatar: ownerAvatarUrl,
            createdAt: ownerUser.createdAt,
        },
        phone: guide.owner.phone,
        oauthProvider: guide.owner.oauthProvider,
    };

    const companyInfo: CompanyInfo = {
        _id: guide._id.toString(),
        companyName: guide.companyName,
        logoUrl,
        createdAt: guide.createdAt,
        address: guide.address
            ? {
                country: guide.address.country,
                division: guide.address.division,
                city: guide.address.city,
                zip: guide.address.zip,
                street: guide.address.street,
            }
            : undefined,
        owner: ownerInfo,
    };

    return { data: { companyInfo, ownerInfo } };
}

// ── Exported GET handler wrapped with error handling ────────
export const GET = withErrorHandler(getCompanyInfoHandler);