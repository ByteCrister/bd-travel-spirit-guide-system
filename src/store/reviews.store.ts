// /store/useReviewsStore.ts
"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { AxiosError } from "axios";

import {
    ObjectIdStr,
    ReviewFilters,
    ReviewSort,
    ReviewToolbarState,
    ReviewsStoreState,
    ReviewsListCache,
    ReviewDetailCache,
    Paginated,
    ReviewListItemDTO,
    ReviewDetailDTO,
    ReviewReplyDTO,
    REVIEWS_CACHE_TTL_MS,
    LS_KEYS,
    ApiError,
} from "@/types/tour/reviews.types";

import api from "@/utils/axios/axios";
import { ApiResponse } from "@/types/common/api.types";

/* -------------------------
   constants + helpers
   ------------------------- */

const URL_AFTER_API = `/operations/reviews/v1`;
const CACHE_TTL_MS: number = Number(process.env.NEXT_PUBLIC_CACHE_TTL) || REVIEWS_CACHE_TTL_MS;

const nowMs = (): number => Date.now();

/* -------------------------
   Cache Management System
   ------------------------- */

interface CacheMetrics {
    hits: number;
    misses: number;
    evictions: number;
}

class CacheManager {
    private metrics: CacheMetrics = { hits: 0, misses: 0, evictions: 0 };
    private readonly maxCacheSize = 50; // Maximum cache entries to prevent memory bloat

    getMetrics(): CacheMetrics {
        return { ...this.metrics };
    }

    incrementHit() {
        this.metrics.hits++;
    }

    incrementMiss() {
        this.metrics.misses++;
    }

    incrementEviction() {
        this.metrics.evictions++;
    }

    // Separate eviction methods for different cache types
    evictOldestListCacheIfNeeded(
        cache: Record<string, ReviewsListCache>
    ): Record<string, ReviewsListCache> {
        const entries = Object.entries(cache);
        if (entries.length <= this.maxCacheSize) {
            return cache;
        }

        // Sort by fetchedAt (oldest first) and remove oldest entries
        const sorted = entries.sort(([, a], [, b]) => {
            const aTime = a.fetchedAt || 0;
            const bTime = b.fetchedAt || 0;
            return aTime - bTime;
        });

        const toKeep = sorted.slice(-this.maxCacheSize);
        const removed = sorted.length - this.maxCacheSize;
        
        if (removed > 0) {
            this.metrics.evictions += removed;
        }

        return Object.fromEntries(toKeep);
    }

    evictOldestDetailCacheIfNeeded(
        cache: Record<string, ReviewDetailCache>
    ): Record<string, ReviewDetailCache> {
        const entries = Object.entries(cache);
        if (entries.length <= this.maxCacheSize) {
            return cache;
        }

        // Sort by fetchedAt (oldest first) and remove oldest entries
        const sorted = entries.sort(([, a], [, b]) => {
            const aTime = a.fetchedAt || 0;
            const bTime = b.fetchedAt || 0;
            return aTime - bTime;
        });

        const toKeep = sorted.slice(-this.maxCacheSize);
        const removed = sorted.length - this.maxCacheSize;
        
        if (removed > 0) {
            this.metrics.evictions += removed;
        }

        return Object.fromEntries(toKeep);
    }

    isFresh(entry: { expiresAt?: number; fetchedAt?: number }): boolean {
        if (!entry.expiresAt) return false;
        return entry.expiresAt > nowMs();
    }

    isStale(entry: { expiresAt?: number; isStale?: boolean }): boolean {
        if (entry.isStale) return true;
        if (!entry.expiresAt) return true;
        return entry.expiresAt <= nowMs();
    }
}

const cacheManager = new CacheManager();

/* -------------------------
   Cache Entry Creators
   ------------------------- */

function makeListEntry(
    key: string,
    data: Paginated<ReviewListItemDTO>,
    isStale = false
): ReviewsListCache {
    const fetchedAt = nowMs();
    return {
        key,
        data,
        fetchedAt,
        expiresAt: fetchedAt + CACHE_TTL_MS,
        isStale,
        isLoading: false,
        error: null,
        etag: null,
        requestFingerprint: key,
    };
}

function makeDetailEntry(
    key: string,
    data: ReviewDetailDTO,
    isStale = false
): ReviewDetailCache {
    const fetchedAt = nowMs();
    return {
        key,
        data,
        fetchedAt,
        expiresAt: fetchedAt + CACHE_TTL_MS,
        isStale,
        isLoading: false,
        error: null,
        etag: null,
        requestFingerprint: key,
    };
}

/* -------------------------
   Error Normalization
   ------------------------- */

function normalizeApiError(err: unknown): ApiError {
    if ((err as AxiosError)?.isAxiosError) {
        const ax = err as AxiosError;
        const status = ax.response?.status;
        const data = ax.response?.data;
        
        if (data && typeof data === "object") {
            if ("error" in data) {
                const maybeError = (data as Record<string, unknown>).error;
                if (typeof maybeError === "string") return { message: maybeError, status };
                if (maybeError && typeof maybeError === "object") {
                    const msg = (maybeError as Record<string, unknown>).message;
                    const code = (maybeError as Record<string, unknown>).code;
                    const details = (maybeError as Record<string, unknown>).details;
                    return {
                        message: typeof msg === "string" ? msg : ax.message,
                        code: typeof code === "string" ? code : undefined,
                        status,
                        details: typeof details === "object" && details !== null 
                            ? (details as Record<string, unknown>) 
                            : undefined,
                    };
                }
            }
            if ("message" in data && typeof (data as Record<string, unknown>).message === "string") {
                return { message: (data as Record<string, unknown>).message as string, status };
            }
        }
        return { message: ax.message, status };
    }
    if (err instanceof Error) return { message: err.message };
    return { message: "Unknown error" };
}

/* -------------------------
   Cache Key & Scope Management
   ------------------------- */

export function canonicalizeFilters(filters: ReviewFilters): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    const keys = Object.keys(filters ?? {}).sort();
    
    for (const k of keys) {
        const v = (filters as Record<string, unknown>)[k];
        if (v === undefined) continue;
        if (v === null) {
            out[k] = null;
            continue;
        }
        if (Array.isArray(v)) {
            out[k] = [...v].sort();
            continue;
        }
        out[k] = v;
    }
    return out;
}

export function makeReviewsListKey(
    filters: ReviewFilters,
    sort: ReviewSort,
    page: number,
    limit: number
): string {
    const canonical = canonicalizeFilters(filters);
    return JSON.stringify({
        filters: canonical,
        sort,
        page: Number(page),
        limit: Number(limit),
    });
}

/* -------------------------
   API Parameter Helpers
   ------------------------- */

function flattenFiltersForParams(filters: ReviewFilters): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {};
    if (!filters) return params;

    if (typeof filters.query === "string" && filters.query.length > 0) params.q = filters.query;
    if (filters.queryField) params.qField = filters.queryField;
    if (filters.tourTitle) params.tourTitle = filters.tourTitle;
    if (typeof filters.ratingMin === "number") params.ratingMin = Number(filters.ratingMin);
    if (typeof filters.ratingMax === "number") params.ratingMax = Number(filters.ratingMax);
    if (filters.isApproved === true || filters.isApproved === false) params.isApproved = filters.isApproved;
    if (filters.tripType != null) params.tripType = String(filters.tripType);
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.includeDeleted === true || filters.includeDeleted === false) 
        params.includeDeleted = filters.includeDeleted;

    return params;
}

/* -------------------------
   Cache Update Helpers
   ------------------------- */

function updateReviewInAllListCaches(
    reviewId: ObjectIdStr,
    updater: (review: ReviewListItemDTO) => ReviewListItemDTO,
    listCache: Record<string, ReviewsListCache>
): Record<string, ReviewsListCache> {
    const updatedCache = { ...listCache };
    
    for (const [key, cacheEntry] of Object.entries(updatedCache)) {
        if (!cacheEntry?.data?.docs) continue;
        
        const docIndex = cacheEntry.data.docs.findIndex(doc => doc._id === reviewId);
        if (docIndex !== -1) {
            const updatedDocs = [...cacheEntry.data.docs];
            updatedDocs[docIndex] = updater(updatedDocs[docIndex]);
            
            updatedCache[key] = {
                ...cacheEntry,
                data: {
                    ...cacheEntry.data,
                    docs: updatedDocs,
                },
                // Update timestamp to show it's been modified
                fetchedAt: nowMs(),
                expiresAt: nowMs() + CACHE_TTL_MS,
            };
        }
    }
    
    return updatedCache;
}

function invalidateRelatedListCaches(
    reviewId: ObjectIdStr,
    listCache: Record<string, ReviewsListCache>
): Record<string, ReviewsListCache> {
    const updatedCache = { ...listCache };
    
    for (const [key, cacheEntry] of Object.entries(updatedCache)) {
        if (!cacheEntry?.data?.docs) continue;
        
        const hasReview = cacheEntry.data.docs.some(doc => doc._id === reviewId);
        if (hasReview) {
            updatedCache[key] = {
                ...cacheEntry,
                isStale: true,
                // Reduce TTL for stale entries to force refresh sooner
                expiresAt: nowMs() + (CACHE_TTL_MS / 2),
            };
        }
    }
    
    return updatedCache;
}

/* -------------------------
   Store Implementation
   ------------------------- */

export const useReviewsStore = create<ReviewsStoreState>()(
    devtools(
        (set, get) => {
            // Request deduplication maps
            const inFlightListRequests = new Map<string, Promise<Paginated<ReviewListItemDTO>>>();
            const inFlightDetailRequests = new Map<string, Promise<ReviewDetailDTO>>();

            const defaultToolbar: ReviewToolbarState = {
                search: "",
                searchField: "comment",
                selectedRatings: [],
                filters: {},
                sort: { field: "createdAt", dir: "desc" },
                page: 1,
                limit: 10,
            };

            return {
                toolbar: defaultToolbar,
                listCache: {},
                detailCache: {},
                currentListKey: null,
                globalLoading: false,
                globalError: null,

                setToolbar: (next: Partial<ReviewToolbarState>) => {
                    set((s) => {
                        const merged = { ...s.toolbar, ...next };
                        return { toolbar: merged };
                    });
                },

                fetchList: async (opts?: { useCache?: boolean; toolbar?: ReviewToolbarState }) => {
                    const toolbar = opts?.toolbar ?? get().toolbar;
                    const key = makeReviewsListKey(toolbar.filters, toolbar.sort, toolbar.page, toolbar.limit);
                    
                    set(() => ({ currentListKey: key }));

                    // Check cache first
                    const existing = get().listCache[key];
                    const useCache = opts?.useCache ?? true;
                    
                    if (useCache && existing?.data && cacheManager.isFresh(existing)) {
                        cacheManager.incrementHit();
                        return existing.data;
                    }

                    if (useCache && existing?.data && cacheManager.isStale(existing)) {
                        // Return stale data but mark for refresh
                        set((s) => ({
                            listCache: {
                                ...s.listCache,
                                [key]: { ...existing, isStale: true }
                            }
                        }));
                        // Refresh in background
                        setTimeout(() => {
                            get().fetchList({ ...opts, useCache: false }).catch(() => {});
                        }, 0);
                        return existing.data;
                    }

                    cacheManager.incrementMiss();

                    // Deduplicate concurrent requests
                    const ongoing = inFlightListRequests.get(key);
                    if (ongoing) return ongoing;

                    const promise = (async (): Promise<Paginated<ReviewListItemDTO>> => {
                        try {
                            // Set loading state
                            set((s) => ({
                                listCache: {
                                    ...s.listCache,
                                    [key]: {
                                        key,
                                        data: null,
                                        fetchedAt: undefined,
                                        expiresAt: undefined,
                                        isStale: false,
                                        isLoading: true,
                                        error: null,
                                        etag: null,
                                        requestFingerprint: key,
                                    }
                                }
                            }));

                            // Build request parameters
                            const params: Record<string, string | number | boolean> = {
                                page: toolbar.page,
                                limit: toolbar.limit,
                                sortField: toolbar.sort.field,
                                sortDir: toolbar.sort.dir,
                                ...flattenFiltersForParams(toolbar.filters),
                            };

                            // Make API request
                            const res = await api.get<{ data: Paginated<ReviewListItemDTO> }>(
                                URL_AFTER_API,
                                { params }
                            );

                            const data = res.data.data;
                            
                            // Update cache with new entry
                            set((s) => {
                                const newEntry = makeListEntry(key, data);
                                const updatedCache = {
                                    ...s.listCache,
                                    [key]: newEntry,
                                };
                                
                                // Apply cache eviction policy
                                const evictedCache = cacheManager.evictOldestListCacheIfNeeded(updatedCache);
                                
                                return {
                                    listCache: evictedCache,
                                };
                            });

                            return data;
                        } catch (err) {
                            const apiErr = normalizeApiError(err);
                            
                            // Store error in cache entry
                            set((s) => ({
                                listCache: {
                                    ...s.listCache,
                                    [key]: {
                                        key,
                                        data: null,
                                        fetchedAt: nowMs(),
                                        expiresAt: nowMs() + CACHE_TTL_MS,
                                        isStale: true,
                                        isLoading: false,
                                        error: apiErr,
                                        etag: null,
                                        requestFingerprint: key,
                                    }
                                },
                                globalError: apiErr,
                            }));
                            
                            throw apiErr;
                        } finally {
                            inFlightListRequests.delete(key);
                        }
                    })();

                    inFlightListRequests.set(key, promise);
                    return promise;
                },

                fetchDetail: async (reviewId: ObjectIdStr, options?: { force?: boolean }) => {
                    const key = reviewId;
                    const existing = get().detailCache[key];

                    // Return cached data if fresh and not forced
                    if (!options?.force && existing?.data && cacheManager.isFresh(existing)) {
                        cacheManager.incrementHit();
                        return existing.data;
                    }

                    // Return stale data immediately while refreshing in background
                    if (!options?.force && existing?.data && cacheManager.isStale(existing)) {
                        // Mark as stale and refresh in background
                        set((s) => ({
                            detailCache: {
                                ...s.detailCache,
                                [key]: { ...existing, isStale: true }
                            }
                        }));
                        
                        // Refresh in background
                        setTimeout(() => {
                            get().fetchDetail(reviewId, { force: true }).catch(() => {});
                        }, 0);
                        
                        return existing.data;
                    }

                    cacheManager.incrementMiss();

                    // Deduplicate requests
                    const detailKey = `detail:${key}`;
                    const ongoing = inFlightDetailRequests.get(detailKey);
                    if (ongoing) return ongoing;

                    const promise = (async (): Promise<ReviewDetailDTO> => {
                        try {
                            // Set loading state
                            set((s) => ({
                                detailCache: {
                                    ...s.detailCache,
                                    [key]: {
                                        key,
                                        data: existing?.data ?? null,
                                        fetchedAt: existing?.fetchedAt,
                                        expiresAt: existing?.expiresAt,
                                        isStale: !(existing && cacheManager.isFresh(existing)),
                                        isLoading: true,
                                        error: null,
                                        etag: existing?.etag ?? null,
                                        requestFingerprint: key,
                                    }
                                }
                            }));

                            // Fetch from API
                            const res = await api.get<{ data: ReviewDetailDTO }>(
                                `${URL_AFTER_API}/${encodeURIComponent(reviewId)}`
                            );
                            
                            const data = res.data.data;
                            const newEntry = makeDetailEntry(key, data);
                            
                            // Update cache
                            set((s) => {
                                const updatedCache = {
                                    ...s.detailCache,
                                    [key]: newEntry,
                                };
                                
                                const evictedCache = cacheManager.evictOldestDetailCacheIfNeeded(updatedCache);
                                
                                return {
                                    detailCache: evictedCache,
                                };
                            });
                            
                            return data;
                        } catch (err) {
                            const apiErr = normalizeApiError(err);
                            
                            set((s) => ({
                                detailCache: {
                                    ...s.detailCache,
                                    [key]: {
                                        key,
                                        data: existing?.data ?? null,
                                        fetchedAt: nowMs(),
                                        expiresAt: nowMs() + CACHE_TTL_MS,
                                        isStale: true,
                                        isLoading: false,
                                        error: apiErr,
                                        etag: existing?.etag ?? null,
                                        requestFingerprint: key,
                                    }
                                },
                                globalError: apiErr,
                            }));
                            
                            throw apiErr;
                        } finally {
                            inFlightDetailRequests.delete(detailKey);
                        }
                    })();

                    inFlightDetailRequests.set(detailKey, promise);
                    return promise;
                },

                approveReview: async (reviewId: ObjectIdStr, note?: string) => {
                    try {
                        const payload = { isApproved: true, note };
                        const res = await api.post<ApiResponse<ReviewDetailDTO>>(
                            `${URL_AFTER_API}/${encodeURIComponent(reviewId)}/moderate/approve`,
                            payload
                        );

                        if (!(res.data && res.data.data)) {
                            throw new Error("Invalid response body");
                        }

                        const updated = res.data.data;
                        
                        // Update detail cache
                        set((s) => ({
                            detailCache: {
                                ...s.detailCache,
                                [reviewId]: makeDetailEntry(reviewId, updated)
                            }
                        }));

                        // Update review in all list caches
                        set((s) => {
                            const updatedListCache = updateReviewInAllListCaches(
                                reviewId,
                                (review) => ({ ...review, isApproved: true }),
                                s.listCache
                            );
                            
                            // Mark related caches as stale for background refresh
                            const invalidatedCache = invalidateRelatedListCaches(
                                reviewId,
                                updatedListCache
                            );
                            
                            return {
                                listCache: invalidatedCache,
                            };
                        });

                        return updated;
                    } catch (err) {
                        throw normalizeApiError(err);
                    }
                },

                rejectReview: async (reviewId: ObjectIdStr, reason?: string) => {
                    try {
                        const payload = { isApproved: false, note: reason };
                        const res = await api.post<ApiResponse<ReviewDetailDTO>>(
                            `${URL_AFTER_API}/${encodeURIComponent(reviewId)}/moderate/reject`,
                            payload
                        );
                        
                        if (!(res.data && res.data.data)) {
                            throw new Error("Invalid response body");
                        }
                        
                        const updated = res.data.data;
                        
                        // Update detail cache
                        set((s) => ({
                            detailCache: {
                                ...s.detailCache,
                                [reviewId]: makeDetailEntry(reviewId, updated)
                            }
                        }));

                        // Update review in all list caches
                        set((s) => {
                            const updatedListCache = updateReviewInAllListCaches(
                                reviewId,
                                (review) => ({ ...review, isApproved: false }),
                                s.listCache
                            );
                            
                            // Mark related caches as stale for background refresh
                            const invalidatedCache = invalidateRelatedListCaches(
                                reviewId,
                                updatedListCache
                            );
                            
                            return {
                                listCache: invalidatedCache,
                            };
                        });

                        return updated;
                    } catch (err) {
                        throw normalizeApiError(err);
                    }
                },

                addReply: async (reviewId: ObjectIdStr, message: string) => {
                    try {
                        const payload = { message };
                        const res = await api.post<ApiResponse<ReviewReplyDTO>>(
                            `${URL_AFTER_API}/${encodeURIComponent(reviewId)}/replies`,
                            payload
                        );
                        
                        if (!(res.data && res.data.data)) {
                            throw new Error("Invalid response body");
                        }
                        
                        const reply = res.data.data;
                        
                        // Update detail cache
                        set((s) => {
                            const existing = s.detailCache[reviewId];
                            if (existing?.data) {
                                const updated: ReviewDetailDTO = {
                                    ...existing.data,
                                    replies: [...existing.data.replies, reply]
                                };
                                return {
                                    detailCache: {
                                        ...s.detailCache,
                                        [reviewId]: makeDetailEntry(reviewId, updated)
                                    }
                                };
                            }
                            return {};
                        });

                        return reply;
                    } catch (err) {
                        throw normalizeApiError(err);
                    }
                },

                updateReply: async (reviewId: ObjectIdStr, replyId: ObjectIdStr, message: string) => {
                    try {
                        const payload = { message, replyId };
                        const res = await api.patch<ApiResponse<ReviewReplyDTO>>(
                            `${URL_AFTER_API}/${encodeURIComponent(reviewId)}/replies/${encodeURIComponent(replyId)}`,
                            payload
                        );
                        
                        if (!(res.data && res.data.data)) {
                            throw new Error("Invalid response body");
                        }
                        
                        const updatedReply = res.data.data;
                        
                        // Update detail cache
                        set((s) => {
                            const existing = s.detailCache[reviewId];
                            if (existing?.data) {
                                const updatedReplies = existing.data.replies.map(reply =>
                                    reply._id === replyId ? updatedReply : reply
                                );
                                const updatedDetail: ReviewDetailDTO = {
                                    ...existing.data,
                                    replies: updatedReplies
                                };
                                return {
                                    detailCache: {
                                        ...s.detailCache,
                                        [reviewId]: makeDetailEntry(reviewId, updatedDetail)
                                    }
                                };
                            }
                            return {};
                        });

                        return updatedReply;
                    } catch (err) {
                        throw normalizeApiError(err);
                    }
                },

                deleteReply: async (reviewId: ObjectIdStr, replyId: ObjectIdStr) => {
                    try {
                        await api.delete(
                            `${URL_AFTER_API}/${encodeURIComponent(reviewId)}/replies/${encodeURIComponent(replyId)}`
                        );

                        // Update detail cache
                        set((s) => {
                            const existing = s.detailCache[reviewId];
                            if (existing?.data) {
                                const updatedReplies = existing.data.replies.filter(reply => reply._id !== replyId);
                                const updatedDetail: ReviewDetailDTO = {
                                    ...existing.data,
                                    replies: updatedReplies
                                };
                                return {
                                    detailCache: {
                                        ...s.detailCache,
                                        [reviewId]: makeDetailEntry(reviewId, updatedDetail)
                                    }
                                };
                            }
                            return {};
                        });

                        return;
                    } catch (err) {
                        throw normalizeApiError(err);
                    }
                },

                deleteReview: async (reviewId: ObjectIdStr) => {
                    try {
                        await api.delete(`${URL_AFTER_API}/${encodeURIComponent(reviewId)}`);
                        
                        // Clear detail cache
                        set((s) => {
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            const { [reviewId]: _, ...restDetail } = s.detailCache;
                            return { detailCache: restDetail };
                        });

                        // Update list caches to mark as deleted
                        set((s) => {
                            const updatedListCache = updateReviewInAllListCaches(
                                reviewId,
                                (review) => ({
                                    ...review,
                                    deletedAt: new Date().toISOString()
                                }),
                                s.listCache
                            );
                            
                            return {
                                listCache: updatedListCache,
                            };
                        });

                        return;
                    } catch (err) {
                        throw normalizeApiError(err);
                    }
                },

                restoreReview: async (reviewId: ObjectIdStr) => {
                    try {
                        const res = await api.post<{ data: ReviewDetailDTO }>(
                            `${URL_AFTER_API}/${encodeURIComponent(reviewId)}/restore`
                        );
                        
                        const restored = res.data.data;
                        
                        // Update detail cache
                        set((s) => ({
                            detailCache: {
                                ...s.detailCache,
                                [reviewId]: makeDetailEntry(reviewId, restored)
                            }
                        }));

                        // Update review in all list caches
                        set((s) => {
                            const updatedListCache = updateReviewInAllListCaches(
                                reviewId,
                                (review) => ({
                                    ...review,
                                    deletedAt: null,
                                    isApproved: restored.isApproved
                                }),
                                s.listCache
                            );
                            
                            // Mark related caches as stale for background refresh
                            const invalidatedCache = invalidateRelatedListCaches(
                                reviewId,
                                updatedListCache
                            );
                            
                            return {
                                listCache: invalidatedCache,
                            };
                        });

                        return restored;
                    } catch (err) {
                        throw normalizeApiError(err);
                    }
                },

                // Cache management
                setListCache: (key: string, entry: ReviewsListCache) => {
                    set((s) => ({
                        listCache: {
                            ...s.listCache,
                            [key]: entry
                        }
                    }));
                },
                
                setDetailCache: (key: string, entry: ReviewDetailCache) => {
                    set((s) => ({
                        detailCache: {
                            ...s.detailCache,
                            [key]: entry
                        }
                    }));
                },
                
                invalidateListCache: (matcher?: (k: string) => boolean) => {
                    set((s) => {
                        if (!matcher) {
                            // Mark all entries as stale instead of deleting
                            const updatedCache: Record<string, ReviewsListCache> = {};
                            
                            for (const [key, entry] of Object.entries(s.listCache)) {
                                updatedCache[key] = {
                                    ...entry,
                                    isStale: true,
                                    expiresAt: nowMs() + (CACHE_TTL_MS / 4), // Short TTL for stale entries
                                };
                            }
                            
                            return { 
                                listCache: updatedCache,
                            };
                        }
                        
                        const next: Record<string, ReviewsListCache> = {};
                        for (const k of Object.keys(s.listCache)) {
                            if (!matcher(k)) {
                                next[k] = s.listCache[k];
                            } else {
                                next[k] = {
                                    ...s.listCache[k],
                                    isStale: true,
                                    expiresAt: nowMs() + (CACHE_TTL_MS / 4),
                                };
                            }
                        }
                        
                        return { 
                            listCache: next,
                        };
                    });
                },
                
                invalidateDetailCache: (reviewId?: ObjectIdStr) => {
                    set((s) => {
                        if (reviewId) {
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            const { [reviewId]: _, ...rest } = s.detailCache;
                            return { detailCache: rest };
                        }
                        
                        // Mark all detail entries as stale instead of deleting
                        const updatedCache: Record<string, ReviewDetailCache> = {};
                        
                        for (const [key, entry] of Object.entries(s.detailCache)) {
                            updatedCache[key] = {
                                ...entry,
                                isStale: true,
                                expiresAt: nowMs() + (CACHE_TTL_MS / 4),
                            };
                        }
                        
                        return { 
                            detailCache: updatedCache,
                        };
                    });
                },
                
                hydrateFromLocalStorage: () => {
                    if (typeof window === "undefined") return;
                    
                    try {
                        const rawQuery = window.localStorage.getItem(LS_KEYS.REVIEWS_QUERY);
                        const rawListCache = window.localStorage.getItem(LS_KEYS.REVIEWS_LIST_CACHE);
                        const rawDetailCache = window.localStorage.getItem(LS_KEYS.REVIEWS_DETAIL_CACHE);

                        const query = rawQuery ? JSON.parse(rawQuery) as ReviewToolbarState : null;
                        const listCache = rawListCache ? JSON.parse(rawListCache) as Record<string, ReviewsListCache> : null;
                        const detailCache = rawDetailCache ? JSON.parse(rawDetailCache) as Record<string, ReviewDetailCache> : null;

                        // Sanitize expired entries
                        const now = nowMs();
                        const sanitizedList: Record<string, ReviewsListCache> = {};
                        if (listCache) {
                            for (const [k, v] of Object.entries(listCache)) {
                                if (v && v.data && v.expiresAt && v.expiresAt > now) {
                                    sanitizedList[k] = v;
                                }
                            }
                        }

                        const sanitizedDetail: Record<string, ReviewDetailCache> = {};
                        if (detailCache) {
                            for (const [k, v] of Object.entries(detailCache)) {
                                if (v && v.data && v.expiresAt && v.expiresAt > now) {
                                    sanitizedDetail[k] = v;
                                }
                            }
                        }

                        set(() => ({
                            toolbar: query ?? defaultToolbar,
                            listCache: sanitizedList,
                            detailCache: sanitizedDetail,
                        }));
                    } catch (error) {
                        console.warn('Failed to hydrate from localStorage:', error);
                    }
                },
                
                persistToLocalStorage: () => {
                    if (typeof window === "undefined") return;
                    
                    try {
                        const s = get();
                        window.localStorage.setItem(LS_KEYS.REVIEWS_QUERY, JSON.stringify(s.toolbar));
                        window.localStorage.setItem(LS_KEYS.REVIEWS_LIST_CACHE, JSON.stringify(s.listCache));
                        window.localStorage.setItem(LS_KEYS.REVIEWS_DETAIL_CACHE, JSON.stringify(s.detailCache));
                    } catch (error) {
                        console.warn('Failed to persist to localStorage:', error);
                    }
                },

                // Clear all cache (for development/debugging)
                clearAllCache: () => {
                    set(() => ({
                        listCache: {},
                        detailCache: {},
                        currentListKey: null,
                    }));
                },

                // Get cache statistics
                getCacheStats: () => {
                    const s = get();
                    return {
                        listCacheSize: Object.keys(s.listCache).length,
                        detailCacheSize: Object.keys(s.detailCache).length,
                        metrics: cacheManager.getMetrics(),
                        currentListKey: s.currentListKey,
                    };
                },
            };
        },
        {
            name: 'reviews-store',
        }
    )
);

// Auto-hydrate on client side
if (typeof window !== 'undefined') {
    const store = useReviewsStore.getState();
    store.hydrateFromLocalStorage();
    
    // Auto-persist on store changes (debounced)
    let persistTimeout: NodeJS.Timeout;
    useReviewsStore.subscribe((state) => {
        clearTimeout(persistTimeout);
        persistTimeout = setTimeout(() => {
            state.persistToLocalStorage();
        }, 1000); // Debounce 1 second
    });
}