/** ============================================================
 * GUIDE CONSTANTS
 * ------------------------------------------------------------
 * These enums define the fixed values used throughout the
 * guide (tour organizer) application and verification process.
 * Keeping them centralized ensures consistency across both
 * backend (Mongoose models) and frontend (Next.js DTOs).
 * ============================================================ */
// Utility type to extract enum values
type EnumValues<T> = T[keyof T];
/**
 * File types supported for guide document uploads.
 * Used to validate and restrict the kind of files
 * applicants can submit during the verification process.
 */
export enum GUIDE_DOCUMENT_TYPE {
  IMAGE = "image", // Standard image formats (JPEG, PNG, etc.)
  PDF = "pdf", // Portable Document Format
  DOCX = "docx", // Microsoft Word document
}
export type GuideDocumentType = EnumValues<typeof GUIDE_DOCUMENT_TYPE>;

/**
 * Categories of documents required or accepted
 * for verifying a guide’s identity and credentials.
 * Each uploaded document must belong to one of these categories.
 */
export enum GUIDE_DOCUMENT_CATEGORY {
  GOVERNMENT_ID = "government_id", // Passport, National ID, Driver’s License
  BUSINESS_LICENSE = "business_license", // Proof of business registration
  PROFESSIONAL_PHOTO = "professional_photo", // Profile photo for public display
  CERTIFICATION = "certification", // Relevant training or skill certificates
}
export type GuideDocumentCategory = EnumValues<typeof GUIDE_DOCUMENT_CATEGORY>;

/** Organizer profile verification states */
export enum GUIDE_STATUS {
  /** Awaiting admin review */
  PENDING = "pending",

  /** Approved and allowed to create/manage tours */
  APPROVED = "approved",

  /** Rejected after review */
  REJECTED = "rejected",
}
export type GuideStatus = EnumValues<typeof GUIDE_STATUS>;

/**
 * Social platforms where a guide may publish or share contact links.
 * Use these keys to normalize external contact fields, drive UI icon mapping,
 * and validate user-provided profile links or handles.
 *
 * - Values are the canonical slugs stored in the database and sent to clients.
 * - Keep this list small and stable; treat additions as backward-compatible features.
 */
export enum GUIDE_SOCIAL_PLATFORM {
  FACEBOOK = "facebook",
  WHATSAPP = "whatsapp",
  IMO = "imo",
  TWITTER = "twitter",
  INSTAGRAM = "instagram",
}
export type GuideSocialPlatform = EnumValues<typeof GUIDE_SOCIAL_PLATFORM>;

/**
 * Subscription lifecycle states for recurring payments and access control.
 * These states drive billing workflows, feature gating, and UI status badges.
 *
 * - ACTIVE: Payments are up to date; subscriber has full access.
 * - PAST_DUE: Recent invoice failed; notify user and retry payments.
 * - CANCELLED: User or system terminated future renewals; access may remain until end of paid period.
 * - FAILED: Final failure after retry attempts; requires user action to recover.
 * - EXPIRED: Subscription reached its natural end and is no longer renewable without a new purchase.
 *
 * Use these values when evaluating access permissions, scheduling renewal reminders,
 * and recording billing events in audit logs.
 */
export enum SUBSCRIPTION_STATUS {
  ACTIVE = "active",
  PAST_DUE = "past_due",
  CANCELLED = "cancelled",
  FAILED = "failed",
  EXPIRED = "expired",
}
export type SubscriptionStatus = `${SUBSCRIPTION_STATUS}`;
