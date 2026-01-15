// reports.store.ts
// Production-grade Zustand store for /operations/reports
// - Uses the types from reports.types.ts
// - Persists current query params to localStorage
// - Implements incremental caching behavior (append-on-increase)
// - Uses axios instance `api` and `extractErrorMessage`
// - TTL driven by NEXT_PUBLIC_GUIDE_CACHE_TTL
//
// Usage notes:
// - API endpoints assumed:
//    GET  /operations/reports         -> list with query params
//    GET  /operations/reports/:id     -> single report detail
//    POST /operations/reports/:id/resolve { notes }
//    POST /operations/reports/:id/reopen
//    DELETE /operations/reports/:id   -> soft-delete
//
// - Adapt endpoints as needed to your backend routes.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { produce, enableMapSet } from "immer";
import {
    ReportsStoreState,
    ReportsQueryParams,
    ReportsCacheKey,
    ReportsCacheEntry,
    ReportsListResponse,
    ReportFull,
    ReportDetailResponse,
    ReportActionResponse,
} from "@/types/reports.types";
import api from "@/utils/axios/axios";
import { extractErrorMessage } from "@/utils/axios/extractErrorMessage";
import { ApiResponse } from "@/types/api.types";

const URL_AFTER_API = `/mock/operations/reports`;
// const URL_AFTER_API = `/operations/reports/v1`;

const DEFAULT_LIMITS = [10, 20, 50];
const DEFAULT_LIMIT = 10;
const CACHE_TTL_MS = Number(process.env.NEXT_PUBLIC_GUIDE_CACHE_TTL ?? 60000);

enableMapSet();

// Stable serialization order for cache keys.
function stableSerializeParams(p: ReportsQueryParams): string {
    const ordered: Record<string, unknown> = {
        // page: p.page ?? 1,
        limit: p.limit ?? DEFAULT_LIMIT,
        sortField: p.sort?.field ?? "createdAt",
        sortDirection: p.sort?.direction ?? "desc",
        status: p.status ?? null,
        priority: p.priority ?? null,
        reason: p.reason ?? null,
        search: p.search ?? "",
        searchScope: p.searchScope ?? "any",
    };
    return JSON.stringify(ordered);
}

function makeCacheKey(p?: ReportsQueryParams): ReportsCacheKey {
    const params: ReportsQueryParams = {
        // page: p?.page ?? 1,
        limit: p?.limit ?? DEFAULT_LIMIT,
        sort: p?.sort,
        status: p?.status,
        priority: p?.priority,
        reason: p?.reason,
        search: p?.search,
        searchScope: p?.searchScope,
    };
    return stableSerializeParams(params);
}

function createCacheEntry(params: ReportsQueryParams): ReportsCacheEntry {
    return {
        key: makeCacheKey(params),
        params,
        pages: new Map(),
        // docs: [],
        // pagesLoaded: new Set<number>(),
        total: null,
        lastFetchedAt: Date.now(),
        ttlMs: CACHE_TTL_MS,
        isStale: false,
        error: null,
    };
}

async function fetchListFromApi(params: ReportsQueryParams): Promise<ReportsListResponse> {
    const query: Record<string, unknown> = {
        page: params.page ?? 1,
        limit: params.limit ?? DEFAULT_LIMIT,
    };
    if (params.sort) {
        query.sortField = params.sort.field;
        query.sortDir = params.sort.direction;
    }
    if (params.status !== null) query.status = params.status;
    if (params.priority !== null) query.priority = params.priority;
    if (params.reason !== null) query.reason = params.reason;
    if (params.search) {
        query.search = params.search;
        query.searchScope = params.searchScope ?? "any";
    }

    const resp = await api.get<ApiResponse<ReportsListResponse>>(`${URL_AFTER_API}`, { params: query });
    // Expect backend paginated shape identical to ReportsListResponse
    return resp.data.data as ReportsListResponse;
}

async function fetchDetailFromApi(reportId: string): Promise<ReportFull> {
    const resp = await api.get<ApiResponse<ReportDetailResponse>>(`${URL_AFTER_API}/${reportId}`);
    const payload = resp.data.data as ReportDetailResponse;
    return payload.report;
}

async function rejectReportApi(reportId: string, notes?: string): Promise<ReportActionResponse> {
    const resp = await api.put<ApiResponse<ReportActionResponse>>(
        `${URL_AFTER_API}/${reportId}/reject`,
        { notes }
    );

    if (!resp.data || !resp.data.data)
        throw new Error("Invalid response body.");

    return resp.data.data;
}

async function resolveReportApi(reportId: string, notes?: string): Promise<ReportFull> {
    const resp = await api.put<ApiResponse<ReportActionResponse>>(`${URL_AFTER_API}/${reportId}/resolve`, { notes });
    const payload = resp.data.data as ReportActionResponse;
    if (!payload.success) throw new Error(payload.message ?? "Resolve failed");
    return payload.report!;
}

async function bulkResolveApi(reportIds: string[], notes?: string): Promise<{ success: boolean; message?: string; resolvedCount?: number }> {
    const resp = await api.patch<ApiResponse<{ success: boolean; message?: string; resolvedCount?: number }>>(
        `${URL_AFTER_API}/bulk-resolve`,
        { reportIds, notes }
    );

    if (!resp.data || !resp.data.data)
        throw new Error("Invalid response body.");

    return resp.data.data;
}

async function reopenReportApi(reportId: string): Promise<ReportFull> {
    const resp = await api.put<ApiResponse<ReportActionResponse>>(`${URL_AFTER_API}/${reportId}/reopen`);
    const payload = resp.data.data as ReportActionResponse;
    if (!payload.success) throw new Error(payload.message ?? "Reopen failed");
    return payload.report!;
}

async function softDeleteApi(reportId: string): Promise<{ success: boolean; reportId?: string }> {
    const resp = await api.delete(`${URL_AFTER_API}/${reportId}`);
    return resp.data as { success: boolean; reportId?: string };
}

export const useReportsStore = create<ReportsStoreState>()(
    // Persist params only (so queries survive reload). We persist entire store minimal fields if needed.
    persist(
        (set, get) => ({
            // initial state
            params: {
                page: 1,
                limit: DEFAULT_LIMIT,
                sort: { field: "createdAt", direction: "desc" },
                status: null,
                priority: null,
                reason: null,
                search: "",
                searchScope: "any",
            },
            cache: {},
            detailsCache: {},
            loading: { type: "idle" },
            selectedIds: new Set<string>(),
            pageLimitOptions: DEFAULT_LIMITS,
            defaultLimit: DEFAULT_LIMIT,
            cacheTtlMs: CACHE_TTL_MS,

            // actions
            setParams: (partial) =>
                set(
                    produce((state: ReportsStoreState) => {
                        state.params = { ...state.params, ...partial };
                        // when params change, keep page if user changes limit? if page param omitted, default to 1
                        if (partial.page === undefined) {
                            state.params.page = 1;
                        }
                    })
                ),

            replaceParams: (next) =>
                set(
                    produce((state: ReportsStoreState) => {
                        state.params = { ...next };
                    })
                ),

            invalidateCache: (keyOrPredicate) =>
                set(
                    produce((state: ReportsStoreState) => {
                        if (!keyOrPredicate) {
                            state.cache = {};
                            return;
                        }
                        if (typeof keyOrPredicate === "string") {
                            delete state.cache[keyOrPredicate];
                            return;
                        }
                        const pred = keyOrPredicate;
                        for (const k of Object.keys(state.cache)) {
                            const e = state.cache[k];
                            if (pred(k, e)) {
                                delete state.cache[k];
                            }
                        }
                    })
                ),

            ensureCacheEntry: (params) => {
                const key = makeCacheKey(params);
                const state = get();
                const existing = state.cache[key];
                if (existing) return existing;
                const entry = createCacheEntry(params);
                set(
                    produce((s: ReportsStoreState) => {
                        s.cache[key] = entry;
                    })
                );
                return entry;
            },

            getCacheKeyForParams: (params) => makeCacheKey(params ?? get().params),

            readCachedList: (params) => {
                const key = makeCacheKey(params ?? get().params);
                const state = get();
                return state.cache[key] ?? null;
            },

            fetchListPage: async (page?: number) => {
                const state = get();
                const params = { ...state.params, page: page ?? state.params.page ?? 1 };
                const key = makeCacheKey(params);

                let entry = state.cache[key];
                if (!entry) {
                    entry = createCacheEntry(params);
                    set(produce((s: ReportsStoreState) => {
                        s.cache[key] = entry;
                    }));
                }

                const pageToFetch = params.page!;
                const limit = params.limit ?? state.defaultLimit;
                const now = Date.now();

                // return cached page
                const cachedPage = entry.pages.get(pageToFetch);
                if (cachedPage && now - entry.lastFetchedAt < entry.ttlMs) {
                    return {
                        docs: cachedPage,
                        total: entry.total ?? cachedPage.length,
                        page: pageToFetch,
                        pages: entry.total ? Math.ceil(entry.total / limit) : 1,
                        limit,
                    };
                }

                set(produce((s: ReportsStoreState) => {
                    s.loading = { type: "loading", context: "list" };
                }));

                try {
                    const resp = await fetchListFromApi(params);

                    set(produce((s: ReportsStoreState) => {
                        const e = s.cache[key]!;
                        e.pages.set(pageToFetch, resp.docs);
                        e.total = resp.total;
                        e.lastFetchedAt = Date.now();
                        e.error = null;
                        s.loading = { type: "success" };
                    }));

                    return resp;
                } catch (err) {
                    const message = extractErrorMessage(err);
                    set(produce((s: ReportsStoreState) => {
                        s.loading = { type: "error", message };
                        s.cache[key]!.error = message;
                    }));
                    throw new Error(message);
                }
            },

            fetchReportDetail: async (reportId: string) => {
                const state = get();
                const cached = state.detailsCache[reportId];
                // If cached and within TTL return
                const now = Date.now();
                if (cached && cached.data && cached.fetchedAt && now - (cached.fetchedAt ?? 0) < state.cacheTtlMs) {
                    return cached.data;
                }

                // Set loading placeholder
                set(
                    produce((s: ReportsStoreState) => {
                        s.detailsCache[reportId] = {
                            data: cached?.data ?? null,
                            loading: true,
                            error: null,
                            fetchedAt: cached?.fetchedAt,
                        };
                        s.loading = { type: "loading", context: "detail" };
                    })
                );

                try {
                    const report = await fetchDetailFromApi(reportId);
                    set(
                        produce((s: ReportsStoreState) => {
                            s.detailsCache[reportId] = {
                                data: report,
                                loading: false,
                                error: null,
                                fetchedAt: Date.now(),
                            };
                            s.loading = { type: "success" };
                        })
                    );
                    return report;
                } catch (err) {
                    const message = extractErrorMessage(err);
                    set(
                        produce((s: ReportsStoreState) => {
                            s.detailsCache[reportId] = {
                                data: cached?.data ?? null,
                                loading: false,
                                error: message,
                                fetchedAt: cached?.fetchedAt,
                            };
                            s.loading = { type: "error", message };
                        })
                    );
                    throw new Error(message);
                }
            },

            resolveReport: async (reportId: string, notes?: string) => {
                set(
                    produce((s: ReportsStoreState) => {
                        s.loading = { type: "loading", context: "action" };
                    })
                );
                try {
                    const report = await resolveReportApi(reportId, notes);
                    set(
                        produce((s: ReportsStoreState) => {
                            s.detailsCache[reportId] = {
                                data: report,
                                loading: false,
                                error: null,
                                fetchedAt: Date.now(),
                            };
                            for (const key of Object.keys(s.cache)) {
                                const e = s.cache[key];
                                for (const [pageNum, pageDocs] of e.pages.entries()) {
                                    const idx = pageDocs.findIndex((d) => d._id === report._id);
                                    if (idx >= 0) {
                                        pageDocs[idx] = {
                                            ...pageDocs[idx],
                                            status: report.status,
                                            updatedAt: report.updatedAt,
                                        };
                                        // Update the page in the Map
                                        e.pages.set(pageNum, pageDocs);
                                    }
                                }
                            }
                            s.loading = { type: "success" };
                        })
                    );
                    return report;
                } catch (err) {
                    const message = extractErrorMessage(err);
                    set(
                        produce((s: ReportsStoreState) => {
                            s.loading = { type: "error", message };
                        })
                    );
                    throw new Error(message);
                }
            },

            bulkResolveReports: async (reportIds: string[], notes?: string) => {
                set(
                    produce((s: ReportsStoreState) => {
                        s.loading = { type: "loading", context: "bulkAction" };
                    })
                );
                try {
                    const result = await bulkResolveApi(reportIds, notes);
                    // Invalidate the cache so that the next fetch will get updated data
                    // We can invalidate all cache entries that have these reportIds, or simply invalidate all.
                    // For simplicity, we invalidate all cache entries.
                    set(
                        produce((s: ReportsStoreState) => {
                            s.cache = {};
                            s.loading = { type: "success" };
                        })
                    );
                    return result;
                } catch (err) {
                    const message = extractErrorMessage(err);
                    set(
                        produce((s: ReportsStoreState) => {
                            s.loading = { type: "error", message };
                        })
                    );
                    throw new Error(message);
                }
            },

            rejectReport: async (reportId: string, notes?: string) => {
                set(
                    produce((s: ReportsStoreState) => {
                        s.loading = { type: 'loading', context: 'action' };
                    })
                );
                try {
                    const result = await rejectReportApi(reportId, notes);
                    if (!result.success) throw new Error(result.message ?? 'Reject failed');

                    const report = result.report!;
                    set(
                        produce((s: ReportsStoreState) => {
                            s.detailsCache[reportId] = {
                                data: report,
                                loading: false,
                                error: null,
                                fetchedAt: Date.now(),
                            };
                            for (const key of Object.keys(s.cache)) {
                                const e = s.cache[key];
                                for (const [pageNum, pageDocs] of e.pages.entries()) {
                                    const idx = pageDocs.findIndex((d) => d._id === report._id);
                                    if (idx >= 0) {
                                        pageDocs[idx] = {
                                            ...pageDocs[idx],
                                            status: report.status,
                                            updatedAt: report.updatedAt,
                                        };
                                        // Update the page in the Map
                                        e.pages.set(pageNum, pageDocs);
                                    }
                                }
                            }
                            s.loading = { type: 'success' };
                        })
                    );
                    return report;
                } catch (err) {
                    const message = extractErrorMessage(err);
                    set(
                        produce((s: ReportsStoreState) => {
                            s.loading = { type: 'error', message };
                        })
                    );
                    throw new Error(message);
                }
            },

            reopenReport: async (reportId: string) => {
                set(
                    produce((s: ReportsStoreState) => {
                        s.loading = { type: "loading", context: "action" };
                    })
                );
                try {
                    const report = await reopenReportApi(reportId);
                    set(
                        produce((s: ReportsStoreState) => {
                            s.detailsCache[reportId] = {
                                data: report,
                                loading: false,
                                error: null,
                                fetchedAt: Date.now(),
                            };
                            for (const key of Object.keys(s.cache)) {
                                const e = s.cache[key];
                                for (const [pageNum, pageDocs] of e.pages.entries()) {
                                    const idx = pageDocs.findIndex((d) => d._id === report._id);
                                    if (idx >= 0) {
                                        pageDocs[idx] = {
                                            ...pageDocs[idx],
                                            status: report.status,
                                            updatedAt: report.updatedAt,
                                        };
                                        // Update the page in the Map
                                        e.pages.set(pageNum, pageDocs);
                                    }
                                }
                            }
                            s.loading = { type: "success" };
                        })
                    );
                    return report;
                } catch (err) {
                    const message = extractErrorMessage(err);
                    set(
                        produce((s: ReportsStoreState) => {
                            s.loading = { type: "error", message };
                        })
                    );
                    throw new Error(message);
                }
            },

            softDeleteReport: async (reportId: string) => {
                set(
                    produce((s: ReportsStoreState) => {
                        s.loading = { type: "loading", context: "action" };
                    })
                );
                try {
                    const result = await softDeleteApi(reportId);
                    // Remove from caches
                    set(
                        produce((s: ReportsStoreState) => {
                            delete s.detailsCache[reportId];

                            // Remove the report from all pages in all cache entries
                            for (const key of Object.keys(s.cache)) {
                                const e = s.cache[key];
                                let reportFound = false;

                                // Check each page for the report
                                for (const [pageNum, pageItems] of e.pages.entries()) {
                                    const oldLen = pageItems.length;
                                    const newPageItems = pageItems.filter((d) => d._id !== reportId);

                                    if (newPageItems.length !== oldLen) {
                                        reportFound = true;
                                        e.pages.set(pageNum, newPageItems);
                                    }
                                }

                                // If we found and removed the report, decrement total count
                                if (reportFound && e.total !== null) {
                                    e.total = Math.max(0, e.total - 1);
                                }
                            }
                            s.loading = { type: "success" };
                        })
                    );
                    return result;
                } catch (err) {
                    const message = extractErrorMessage(err);
                    set(
                        produce((s: ReportsStoreState) => {
                            s.loading = { type: "error", message };
                        })
                    );
                    throw new Error(message);
                }
            },

            toggleSelect: (reportId) =>
                set(produce((s) => {
                    if (s.selectedIds.has(reportId)) s.selectedIds.delete(reportId);
                    else s.selectedIds.add(reportId);
                })),

            clearSelection: () =>
                set(produce((s) => {
                    s.selectedIds.clear();
                })),

            selectAllOnPage: (reportIds: string[]) =>
                set(produce((s) => {
                    reportIds.forEach((id) => s.selectedIds.add(id));
                })),


            hydrateCacheEntry: (entry) =>
                set(
                    produce((s: ReportsStoreState) => {
                        s.cache[entry.key] = entry;
                    })
                ),
        }),
        {
            name: "operations-reports-store",

            partialize: (state) =>
            // Return only selectedIds, NOT params
            ({
                selectedIds: Array.from(state.selectedIds),
            } as unknown),

            merge: (persistedState: unknown, currentState: ReportsStoreState) => {
                const persisted = (persistedState as
                    | { selectedIds?: string[] }
                    | undefined) ?? {};

                const selectedIds = new Set<string>(persisted.selectedIds ?? []);
                return {
                    ...currentState,
                    // DO NOT merge params from persisted state
                    // Keep currentState.params (which has defaults)
                    selectedIds,
                };
            },
        }
    )
);
