// /types/reviews.types.ts

import { AxiosError } from "axios";
import {
    TravelType,
    TRAVEL_TYPE as TravelTypeEnum,
} from "@/constants/tour.const";

/* =========================
   Core domain types
   ========================= */

/** Minimal ObjectId type used across front-end DTOs */
export type ObjectIdStr = string;

/** Reply left by an employee on a review */
export interface ReviewReplyDTO {
    _id: ObjectIdStr;
    employeeId: ObjectIdStr;
    message: string;
    isApproved: boolean;
    createdAt: string; // ISO
    updatedAt: string; // ISO
    deletedAt?: string | null;
}

/** Review summary returned in index/list endpoints */
export interface ReviewListItemDTO {
    _id: ObjectIdStr;
    tourId: ObjectIdStr;
    tourTitle?: string; // denormalized for UI
    userId: ObjectIdStr;
    userName?: string; // denormalized
    rating: number; // 1-5
    title?: string | null;
    comment: string;
    imageCount: number;
    tripType?: TravelType | null;
    travelDate?: string | null; // ISO
    isApproved: boolean;
    helpfulCount: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    // UI flags (not persisted)
    isExpanded?: boolean;
}

/** Full review detail fetched when accordion expands */
export interface ReviewDetailDTO extends ReviewListItemDTO {
    replies: ReviewReplyDTO[];
    userAvatar?: string | null;
    userEmail?: string | null;
    tourSlug?: string | null;
    tourHeroImage?: string | null;
    imageUrls?: string[]; // cloudinary image urls
}

/* =========================
   API response envelopes
   ========================= */

export interface Paginated<T> {
    docs: T[];
    total: number;
    page: number;
    pages: number;
}

/** List response for admin reviews */
export interface ReviewsListResponse {
    data: Paginated<ReviewListItemDTO>;
    meta?: Record<string, unknown>;
}

/** Single review detail response */
export interface ReviewDetailResponse {
    data: ReviewDetailDTO;
}

/** Generic API error wrapper */
export interface ApiError {
    message: string;
    code?: string;
    status?: number;
    details?: Record<string, unknown>;
}

/* =========================
   Query / UI types: filters, sorts, toolbar
   ========================= */

/** Fields that can be searched */
export type ReviewSearchField = "comment" | "title" | "userName" | "tourTitle" | "userEmail";

/** Filter object used to fetch lists */
export interface ReviewFilters {
    query?: string; // free text
    queryField?: ReviewSearchField;
    tourId?: ObjectIdStr;
    ratingMin?: number;
    ratingMax?: number;
    isApproved?: boolean | null;
    hasImages?: boolean | null;
    tripType?: TravelTypeEnum | null;
    dateFrom?: string | null; // ISO
    dateTo?: string | null; // ISO
    includeDeleted?: boolean; // admin-only toggle to see soft-deleted
    // custom: company scoping for admin
    companyId?: ObjectIdStr;
}

/** Sort fields and directions */
export type SortDirection = "asc" | "desc";

export type ReviewSortField =
    | "createdAt"
    | "rating"
    | "helpfulCount"
    | "updatedAt"
    | "isApproved";

export interface ReviewSort {
    field: ReviewSortField;
    dir: SortDirection;
}

/** Toolbar / controls state for the list page */
export interface ReviewToolbarState {
    search: string;
    searchField: ReviewSearchField;
    selectedRatings: number[]; // e.g., [4,5]
    filters: ReviewFilters;
    sort: ReviewSort;
    page: number;
    limit: number;
}

/* =========================
   Store state and cache types (Zustand)
   ========================= */

/** Generic cache entry wrapper used across store */
export interface CacheEntry<T> {
    key: string; // cache key (query fingerprint)
    data?: T | null;
    fetchedAt?: number; // epoch ms when fetched
    expiresAt?: number; // epoch ms TTL
    isStale: boolean; // computed
    isLoading: boolean;
    error?: ApiError | null;
    // request metadata (useful for retries)
    etag?: string | null;
    requestFingerprint?: string | null;
}

/** Specific cache for paginated review lists */
export type ReviewsListCache = CacheEntry<Paginated<ReviewListItemDTO>>;

/** Specific cache for single review detail */
export type ReviewDetailCache = CacheEntry<ReviewDetailDTO>;

/** DTO used for reply operations */
export interface ReplyOperationPayload {
    reviewId: ObjectIdStr;
    replyId: ObjectIdStr;
    message?: string; // For update operations
}

/** Global store state maintained in Zustand */
export interface ReviewsStoreState {
    // UI + query state
    toolbar: ReviewToolbarState;

    // caches maps
    listCache: Record<string, ReviewsListCache>; // key = fingerprint of filters+page+limit+sort
    detailCache: Record<string, ReviewDetailCache>; // key = reviewId

    // currently visible slice (derived from active list cache)
    currentListKey?: string | null;
    setToolbar: (next: Partial<ReviewToolbarState>) => void;

    // operations
    fetchList: (opts?: { useCache?: boolean }) => Promise<Paginated<ReviewListItemDTO>>;
    fetchDetail: (reviewId: ObjectIdStr, options?: { force?: boolean }) => Promise<ReviewDetailDTO>;
    approveReview: (reviewId: ObjectIdStr, note?: string) => Promise<ReviewDetailDTO>;
    rejectReview: (reviewId: ObjectIdStr, reason?: string) => Promise<ReviewDetailDTO>;

    addReply: (reviewId: ObjectIdStr, message: string) => Promise<ReviewReplyDTO>;
    updateReply: (reviewId: ObjectIdStr, replyId: ObjectIdStr, message: string) => Promise<ReviewReplyDTO>;
    deleteReply: (reviewId: ObjectIdStr, replyId: ObjectIdStr) => Promise<void>;

    deleteReview: (reviewId: ObjectIdStr) => Promise<void>;
    restoreReview: (reviewId: ObjectIdStr) => Promise<ReviewDetailDTO>;

    // low-level cache management
    setListCache: (key: string, entry: ReviewsListCache) => void;
    setDetailCache: (key: string, entry: ReviewDetailCache) => void;
    invalidateListCache: (matcher?: (k: string) => boolean) => void;
    invalidateDetailCache: (reviewId?: ObjectIdStr) => void;
    hydrateFromLocalStorage: () => void;
    persistToLocalStorage: () => void;

    // flags
    globalLoading: boolean;
    globalError?: ApiError | null;
}

/* =========================
   Actions / DTOs for server operations
   ========================= */


/** Payload for approve/reject endpoints */
export interface ModerationPayload {
    reviewId: ObjectIdStr;
    isApproved: boolean;
    note?: string;
    moderatorId?: ObjectIdStr;
}

/** DTO used when adding a reply (request) */
export interface AddReplyPayload {
    message: string;
    employeeId: ObjectIdStr;
}

/**
 * Explicit, constrained union for bulk action payloads.
 * - ModerationPayload covers approve/reject flows.
 * - AddReplyPayload is used for adding replies in bulk if ever needed.
 * - GenericRecord allows extension for other admin actions (export options, CSV options, etc).
 */
export type GenericRecord = Record<string, unknown>;

/* =========================
   Client-side utility / helpers types
   ========================= */

/** Result returned by a cached fetch attempt */
export interface CachedResult<T> {
    entry?: CacheEntry<T> | null;
    fromCache: boolean;
    fresh: boolean;
}

/** Cache TTL configuration read from env */
export const REVIEWS_CACHE_TTL_MS: number = Number(process.env.NEXT_PUBLIC_GUIDE_CACHE_TTL ?? 1000 * 60 * 5);

/** LocalStorage keys used for persistence */
export const LS_KEYS = {
    REVIEWS_QUERY: "admin:reviews:query:v1",
    REVIEWS_LIST_CACHE: "admin:reviews:listcache:v1",
    REVIEWS_DETAIL_CACHE: "admin:reviews:detailcache:v1",
};

/* =========================
   UI-specific types
   ========================= */

/** Data used to render a table row (UI transformed) */
export interface ReviewTableRow {
    id: ObjectIdStr;
    rating: number;
    title?: string | null;
    commentPreview: string; // truncated for table
    userName?: string | null;
    userAvatar?: string | null;
    tourTitle?: string | null;
    createdAt: string;
    isApproved: boolean;
    isVerified: boolean;
    helpfulCount: number;
    hasImages: boolean;
    // expand-on-demand loader
    detailState?: {
        loading: boolean;
        error?: ApiError | null;
        data?: ReviewDetailDTO | null;
    };
}

/* =========================
   Error handling helpers
   ========================= */

/** Normalized axios error shape used in store */
export interface NormalizedAxiosError {
    message: string;
    status?: number;
    code?: string;
    details?: Record<string, unknown> | null;
    original?: AxiosError | Error;
}

/* =========================
   Example helper signatures (for implementation)
   ========================= */

/**
 * Create a deterministic cache key from filters, sort, page & limit.
 * Should be used consistently by store and persistence layer.
 */
export function makeReviewsListKey(filters: ReviewFilters, sort: ReviewSort, page: number, limit: number): string {
    // implement deterministic stringify (ordered keys) in store
    // placeholder signature only — actual implementation lives in store
    return JSON.stringify({ filters, sort, page, limit });
}
