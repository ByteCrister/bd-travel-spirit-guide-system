// types/guide.types.ts

import { GuideDocumentCategory, GuideSocialPlatform, GuideStatus } from "@/constants/guide.const";

// this type will be used to get user info
export interface UserPreview {
    name: string;
    email: string;
    phone?: string; // contact
    avatar?: string;
    createdAt?: string;
}

/** Address information for the guide */
export interface GuideAddress {
    country?: string;
    division?: string;
    city?: string;
    zip?: string;
    street?: string;
}

/** Social media platform link */
export interface GuideSocialLink {
    platform: GuideSocialPlatform;
    url: string;
}

/** Verification document metadata */
export interface GuideDocument {
    category: GuideDocumentCategory;
    AssetUrl: string; // on the Asset model this will be used for reference and get publicUrl for the actual url
    uploadedAt?: string;
}

/** Owner account information */
export interface GuideOwner {
    user: UserPreview;      // Reference to User model for authentication
}

// ────────────────────────────────────────────────────────────────────────────
// 2. MAIN DOCUMENT INTERFACE
// ────────────────────────────────────────────────────────────────────────────

export interface Guide {
    // ========== CORE IDENTITY ==========
    companyName: string;       // Registered business name
    bio?: string;              // Company description
    logoUrl?: string;   // Company logo url

    // ========== SOCIAL MEDIA ==========
    social?: GuideSocialLink[];

    // ========== OWNER INFORMATION ==========
    owner: UserPreview;

    // ========== VERIFICATION ==========
    documents: GuideDocument[];  // Required verification docs
    address?: GuideAddress;        // Business address

    // ========== STATUS & LIFECYCLE ==========
    status: GuideStatus;           // Current approval status
    reviewedAt?: string;             // When review was completed
    reviewer?: UserPreview;     // Admin who reviewed
    reviewComment?: string;


    // ========== TIMESTAMPS ==========
    createdAt: Date;
    updatedAt: Date;
}