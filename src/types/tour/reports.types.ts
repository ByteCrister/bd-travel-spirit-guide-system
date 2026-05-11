// reports.types.ts
// Production-grade TypeScript types for /operations/reports (Next.js 15+, TypeScript, Zustand)
// - Designed from provided Tour and Report models and report constants
// - Includes query/filter/sort types, API response shapes, cache types, store state & actions,
//   loading/error representations, pagination helpers, and utility types.

import { Types } from "mongoose";
import {
    REPORT_STATUS,
    REPORT_REASON,
    REPORT_PRIORITY,
    ReportStatus,
    ReportReason,
    ReportPriority,
} from "@/constants/tour/report.const";

/* -------------------------------------------------------------------------- */
/* Core domain shapes (frontend-friendly)                                     */
/* -------------------------------------------------------------------------- */

/**
 * Minimal user reference shown in list rows. Mirrors `reporter` ref in model.
 */
export type UserRef = {
    _id: string; // Types.ObjectId -> string on the client
    name?: string;
    email?: string;
    avatarUrl?: string;
};

/**
 * Minimal tour reference shown in list rows. Mirrors `tour` ref in model.
 */
export type TourRef = {
    _id: string;
    title?: string;
    slug?: string;
    companyId?: string;
    heroImage?: string;
};

/**
 * Report list item shape returned in list endpoints (summary).
 * Includes commonly-needed fields to render the admin list UI.
 */
export type ReportListItem = {
    _id: string;
    reporter: UserRef;
    tour: TourRef;
    reason: ReportReason;
    priority: ReportPriority;
    status: ReportStatus;
    messagePreview?: string; // truncated message for list
    createdAt: string; // ISO
    updatedAt: string; // ISO
    reopenedCount: number;
    tags?: string[];
};

/**
 * Full Report shape (expanded) returned when an accordion expands and fetches details.
 * Mirrors model but with client-side-friendly types (strings, arrays).
 */
export type ReportFull = {
    _id: string;
    reporter: UserRef;
    tour: TourRef;
    reason: ReportReason;
    message: string;
    evidenceImages?: string[]; // asset URLs or ids
    evidenceLinks?: string[];
    status: ReportStatus;
    priority: ReportPriority;
    resolutionNotes?: string | null;
    resolvedAt?: string | null;
    rejectionNotes?: string;
    rejectedAt?: string | null;
    reopenedCount: number;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
};

/* -------------------------------------------------------------------------- */
/* Query / filter / sort / pagination types                                    */
/* -------------------------------------------------------------------------- */

/**
 * Allowed sort fields for reports list. UI should expose these.
 */
export type ReportsSortField =
    | "createdAt"
    | "priority"
    | "status"
    | "reopenedCount"
    | "updatedAt"
    | "reporter.name";

/**
 * Sort direction.
 */
export type SortDirection = "asc" | "desc";

/**
 * Compound sort spec.
 */
export type ReportsSort = {
    field: ReportsSortField;
    direction: SortDirection;
};

/**
 * Searchable fields string; UI will provide a free-text search that maps to these fields
 * on the backend (title, reporter name, message, tags, tour title, tour slug).
 */
export type ReportsSearchScope =
    | "any"
    | "message"
    | "reporter"
    | "tour"
    | "tags";

/**
 * Query parameters passed from UI to the reports API.
 */
export type ReportsQueryParams = {
    page?: number; // 1-indexed
    limit?: number;
    sort?: ReportsSort;
    status?: ReportStatus | null;
    priority?: ReportPriority | null;
    reason?: ReportReason | null;
    search?: string;
    searchScope?: ReportsSearchScope;
};

/* -------------------------------------------------------------------------- */
/* API response shapes                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Generic paginated API result.
 */
export type PaginatedResult<T> = {
    docs: T[];
    total: number;
    page: number;
    pages: number;
    limit: number;
};

/**
 * Response from list endpoint: paginated ReportListItem
 */
export type ReportsListResponse = PaginatedResult<ReportListItem>;

/**
 * Response from single report fetch (full details)
 */
export type ReportDetailResponse = {
    report: ReportFull;
};

/**
 * Response for actions (assign/resolve/reopen/delete)
 */
export type ReportActionResponse = {
    success: boolean;
    report?: ReportFull;
    message?: string;
};

/* -------------------------------------------------------------------------- */
/* Cache, loading & error types                                               */
/* -------------------------------------------------------------------------- */

/**
 * Cache key used inside the store. Constructed from a stable serialization
 * of ReportsQueryParams (for example JSON.stringify with ordered keys).
 */
export type ReportsCacheKey = string;

/**
 * Single cache entry stores incremental results according to the UX requirement:
 * - When query changes (limit increases), reuse existing docs and fetch the missing ones.
 * - When limit decreases, we keep cached docs but the view will slice to the requested limit.
 */
export type ReportsCacheEntry = {
    key: ReportsCacheKey;
    params: ReportsQueryParams;
    pages: Map<number, ReportListItem[]>;
    // docs: ReportListItem[]; // accumulation of fetched docs for this query
    // pagesLoaded: Set<number>; // pages fetched for this params
    total: number | null; // total known from API, null until first fetch
    lastFetchedAt: number; // epoch ms
    ttlMs: number; // TTL in ms (use NEXT_PUBLIC_GUIDE_CACHE_TTL)
    isStale: boolean; // heuristics for staleness
    error?: string | null;
};

/**
 * Loading states
 */
export type LoadingState =
    | { type: "idle" }
    | { type: "loading"; context?: string } // context e.g., "list", "detail", "action"
    | { type: "success" }
    | { type: "error"; message: string };

/* -------------------------------------------------------------------------- */
/* Zustand store types                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Core store state for managing reports list, detail cache, and UI state.
 */
export interface ReportsStoreState {
    // UI filters / query params (current)
    params: ReportsQueryParams;

    // Cache map keyed by ReportsCacheKey -> ReportsCacheEntry
    cache: Record<ReportsCacheKey, ReportsCacheEntry>;

    // Map of expanded reportId -> detailed ReportFull or a placeholder while fetching
    detailsCache: Record<
        string,
        {
            data?: ReportFull | null;
            loading: boolean;
            error?: string | null;
            fetchedAt?: number;
        }
    >;

    // Global loading & error
    loading: LoadingState;

    // Selected row(s) for bulk actions
    selectedIds: Set<string>;

    // Local UI states
    pageLimitOptions: number[]; // e.g., [10, 20, 50]
    defaultLimit: number;

    // TTL (from env). Exposed so components can read TTL.
    cacheTtlMs: number;

    /* ----------------- actions (mutations & effects) ----------------- */

    // Set query params (merge)
    setParams: (partial: Partial<ReportsQueryParams>) => void;

    // Replace params entirely
    replaceParams: (next: ReportsQueryParams) => void;

    // Force invalidate a cache entry (by key or predicate)
    invalidateCache: (key?: ReportsCacheKey | ((k: string, e: ReportsCacheEntry) => boolean)) => void;

    // Internal: create or ensure a cache entry exists for given params
    ensureCacheEntry: (params: ReportsQueryParams) => ReportsCacheEntry;

    // Load a page of list results for current params (supports incremental accumulation)
    fetchListPage: (page?: number) => Promise<ReportsListResponse>;

    // Fetch full detail for a specific report (used on accordion open)
    fetchReportDetail: (reportId: string) => Promise<ReportFull>;

    // Resolve report with optional notes
    resolveReport: (reportId: string, notes?: string) => Promise<ReportFull>;

    bulkResolveReports: (reportIds: string[], notes?: string) => Promise<{ success: boolean; message?: string; resolvedCount?: number }>;

    // Reject a single report
    rejectReport: (reportId: string, notes?: string) => Promise<ReportFull>;

    // Reopen a report
    reopenReport: (reportId: string) => Promise<ReportFull>;

    // Soft-delete a report
    softDeleteReport: (reportId: string) => Promise<{ success: boolean; reportId?: string }>;

    // Bulk select helpers
    toggleSelect: (reportId: string) => void;
    clearSelection: () => void;
    selectAllOnPage: (reportIds: string[]) => void;

    // Helpers for reading from cache
    getCacheKeyForParams: (params?: ReportsQueryParams) => ReportsCacheKey;
    readCachedList: (params?: ReportsQueryParams) => ReportsCacheEntry | null;

    // Utility: hydrate cache with server-side data (useful for SSR/SSG)
    hydrateCacheEntry: (entry: ReportsCacheEntry) => void;
}

/* -------------------------------------------------------------------------- */
/* Utility / helper types                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Standard API error shape returned by backend endpoints.
 */
export type ApiError = {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
};

/**
 * Helper to map mongoose-ish IDs to strings
 */
export type IdLike = string | Types.ObjectId;

/* -------------------------------------------------------------------------- */
/* Example: cache key generation utility (recommended implementation detail)   */
/* -------------------------------------------------------------------------- */

/**
 * NOTE: include this helper in runtime code (not as a type), but documented here
 * so consumers know how keys are constructed:
 *
 * const key = stableSerializeReportsParams(params);
 *
 * - Order keys deterministically (page, limit, sort.field, sort.dir, status, priority, reason, search, searchScope, tourId, companyId)
 */

/* -------------------------------------------------------------------------- */
/* Export enums from constants (re-export for convenience)                    */
/* -------------------------------------------------------------------------- */

export { REPORT_STATUS, REPORT_REASON, REPORT_PRIORITY };

/* -------------------------------------------------------------------------- */
/* Developer notes                                                              */
/* -------------------------------------------------------------------------- */
/*
 - The store design follows an append-on-increase pagination strategy:
   When limit increases, client should call fetchListPage for pages needed.
   The ensureCacheEntry + pagesLoaded allow mixing partial results safely.

 - CacheEntry.ttlMs should be populated using Number(process.env.NEXT_PUBLIC_GUIDE_CACHE_TTL) ||
   a sensible default in the runtime implementation.

 - For serializing ReportsQueryParams into ReportsCacheKey ensure stable ordering of keys.
   Example order used above in the helper comment.

 - All network-facing functions (fetchListPage, fetchReportDetail, assignReport, etc.)
   return normalized shapes defined above. They should update cache and detailsCache
   inside the store implementation and manage LoadingState appropriately.

 - Keep rich types on the backend API to ensure serialization matches these shapes
   (ObjectId => string; Date => ISO string; refs expanded to small objects where useful).
*/
