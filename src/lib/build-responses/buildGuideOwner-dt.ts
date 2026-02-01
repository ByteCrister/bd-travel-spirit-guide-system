import UserModel from "@/models/user.model";
import { Guide, UserPreview } from "@/types/guide.types";
import { ApiError } from "@/lib/helpers/withErrorHandler";
import { Types, ClientSession } from "mongoose";
import GuideModel, { IGuide, IGuideDocument } from "@/models/guide/guide.model";
import AssetModel from "@/models/assets/asset.model";

interface PopulatedUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  avatar?: Types.ObjectId;
  createdAt: Date;
}

interface PopulatedGuide
  extends Omit<IGuide, "owner" | "reviewer" | "documents" | "logoUrl"> {
  owner: {
    user: PopulatedUser | Types.ObjectId;
    phone?: string;
    oauthProvider?: string;
  };
  reviewer?: PopulatedUser | Types.ObjectId;
  documents: IGuideDocument[];
  logoUrl?: Types.ObjectId;
}

/**
 * Gets the public URL from an asset reference
 */
async function getAssetUrl(
  assetId: Types.ObjectId | null | undefined,
  session?: ClientSession,
): Promise<string | undefined> {
  if (!assetId) return undefined;

  try {
    const asset = await AssetModel.findById(assetId)
      .populate({
        path: "file",
        select: "publicUrl",
      })
      .session(session || null);

    if (asset?.file) {
      const fileDoc = asset.file as unknown as { publicUrl: string };
      return fileDoc.publicUrl;
    }
  } catch (error) {
    console.error("Error fetching asset:", error);
  }

  return undefined;
}

/**
 * Builds a complete Guide DTO with populated asset URLs
 */
export async function buildGuideDto(
  guideId: Types.ObjectId | string,
  session?: ClientSession,
): Promise<Guide> {
  // Fetch guide with populated user data
  const rawGuide = (await GuideModel.findById(guideId)
    .populate({
      path: "owner.user",
      model: UserModel,
      select: "name email avatar createdAt",
    })
    .populate({
      path: "reviewer",
      model: UserModel,
      select: "name email avatar createdAt",
    })
    .session(session || null)) as unknown as PopulatedGuide;

  if (!rawGuide) {
    throw new ApiError("Guide not found", 404);
  }

  // Build owner UserPreview
  const ownerUser = rawGuide.owner.user as PopulatedUser;
  const ownerAvatar = await getAssetUrl(ownerUser.avatar, session);

  const owner: UserPreview = {
    name: ownerUser.name,
    email: ownerUser.email,
    phone: rawGuide.owner.phone,
    avatar: ownerAvatar,
    createdAt: ownerUser.createdAt.toISOString(),
  };

  // Build reviewer UserPreview if exists
  let reviewer: UserPreview | undefined;
  if (
    rawGuide.reviewer &&
    typeof rawGuide.reviewer !== "string" &&
    !(rawGuide.reviewer instanceof Types.ObjectId)
  ) {
    const reviewerUser = rawGuide.reviewer as PopulatedUser;
    const reviewerAvatar = await getAssetUrl(reviewerUser.avatar, session);

    reviewer = {
      name: reviewerUser.name,
      email: reviewerUser.email,
      createdAt: reviewerUser.createdAt.toISOString(),
      avatar: reviewerAvatar,
    };
  }

  // Get logo URL
  const logoUrl = await getAssetUrl(rawGuide.logoUrl, session);

  // Build documents with asset URLs
  const documents: Guide['documents'] = await Promise.all(
    rawGuide.documents.map(async (doc) => {
      const assetUrl = await getAssetUrl(doc.AssetUrl, session);
      return {
        category: doc.category,
        AssetUrl: assetUrl || "",
        uploadedAt: doc.uploadedAt?.toISOString(),
      };
    }),
  );

  // Build address
  const address: Guide['address'] | undefined = rawGuide.address
    ? {
        country: rawGuide.address.country,
        division: rawGuide.address.division,
        city: rawGuide.address.city,
        zip: rawGuide.address.zip,
        street: rawGuide.address.street,
      }
    : undefined;

  // Build social links
  const social: Guide['social'] | undefined = rawGuide.social?.map(
    (link) => ({
      platform: link.platform,
      url: link.url,
    }),
  );

  // Build the complete Guide DTO
  const guideDto: Guide = {
    companyName: rawGuide.companyName,
    bio: rawGuide.bio,
    logoUrl,
    social,
    owner,
    documents,
    address,
    status: rawGuide.status,
    reviewedAt: rawGuide.reviewedAt?.toISOString(),
    reviewer,
    reviewComment: rawGuide.reviewComment,
    createdAt: rawGuide.createdAt,
    updatedAt: rawGuide.updatedAt,
  };

  return guideDto;
}
