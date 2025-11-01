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
//    POST /operations/reports/:id/assign  { userId }
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
    ReportListItem,
    ReportFull,
    ReportDetailResponse,
    ReportActionResponse,
} from "@/types/reports.types";
import api from "@/utils/api/axios";
import { extractErrorMessage } from "@/utils/api/extractErrorMessage";

const URL_AFTER_API = `/mock/operations/reports`;
const DEFAULT_LIMITS = [10, 20, 50];
const DEFAULT_LIMIT = 10;
const CACHE_TTL_MS = Number(process.env.NEXT_PUBLIC_GUIDE_CACHE_TTL ?? 60000);

enableMapSet();

// Stable serialization order for cache keys.
function stableSerializeParams(p: ReportsQueryParams): string {
    const ordered: Record<string, unknown> = {
        page: p.page ?? 1,
        limit: p.limit ?? DEFAULT_LIMIT,
        sortField: p.sort?.field ?? "createdAt",
        sortDirection: p.sort?.direction ?? "desc",
        status: p.status ?? "any",
        priority: p.priority ?? "any",
        reason: p.reason ?? "any",
        search: p.search ?? "",
        searchScope: p.searchScope ?? "any",
        assignedTo: p.assignedTo ?? "any",
        tourId: p.tourId ?? null,
        companyId: p.companyId ?? null,
        includeDeleted: p.includeDeleted ?? false,
    };
    return JSON.stringify(ordered);
}

function makeCacheKey(p?: ReportsQueryParams): ReportsCacheKey {
    const params: ReportsQueryParams = {
        page: p?.page ?? 1,
        limit: p?.limit ?? DEFAULT_LIMIT,
        sort: p?.sort,
        status: p?.status,
        priority: p?.priority,
        reason: p?.reason,
        search: p?.search,
        searchScope: p?.searchScope,
        assignedTo: p?.assignedTo,
        tourId: p?.tourId ?? null,
        companyId: p?.companyId ?? null,
        includeDeleted: p?.includeDeleted ?? false,
    };
    return stableSerializeParams(params);
}

function createCacheEntry(params: ReportsQueryParams): ReportsCacheEntry {
    return {
        key: makeCacheKey(params),
        params,
        docs: [],
        total: null,
        pagesLoaded: new Set<number>(),
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
    if (params.status && params.status !== "any") query.status = params.status;
    if (params.priority && params.priority !== "any") query.priority = params.priority;
    if (params.reason && params.reason !== "any") query.reason = params.reason;
    if (params.search) {
        query.search = params.search;
        query.searchScope = params.searchScope ?? "any";
    }
    if (params.assignedTo && params.assignedTo !== "any") query.assignedTo = params.assignedTo;
    if (params.tourId) query.tourId = params.tourId;
    if (params.companyId) query.companyId = params.companyId;
    if (params.includeDeleted) query.includeDeleted = true;

    const resp = await api.get(`${URL_AFTER_API}`, { params: query });
    // Expect backend paginated shape identical to ReportsListResponse
    return resp.data as ReportsListResponse;
}

async function fetchDetailFromApi(reportId: string): Promise<ReportFull> {
    const resp = await api.get(`${URL_AFTER_API}/${reportId}`);
    const payload = resp.data as ReportDetailResponse;
    return payload.report;
}

async function assignReportApi(reportId: string, userId: string): Promise<ReportFull> {
    const resp = await api.post(`${URL_AFTER_API}/${reportId}/assign`, { userId });
    const payload = resp.data as ReportActionResponse;
    if (!payload.success) throw new Error(payload.message ?? "Assign failed");
    return payload.report!;
}

async function resolveReportApi(reportId: string, notes?: string): Promise<ReportFull> {
    const resp = await api.post(`${URL_AFTER_API}/${reportId}/resolve`, { notes });
    const payload = resp.data as ReportActionResponse;
    if (!payload.success) throw new Error(payload.message ?? "Resolve failed");
    return payload.report!;
}

async function reopenReportApi(reportId: string): Promise<ReportFull> {
    const resp = await api.post(`${URL_AFTER_API}/${reportId}/reopen`);
    const payload = resp.data as ReportActionResponse;
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
                status: "any",
                priority: "any",
                reason: "any",
                search: "",
                searchScope: "any",
                assignedTo: "any",
                tourId: null,
                companyId: null,
                includeDeleted: false,
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

                // Ensure cache entry
                let entry = state.cache[key];
                if (!entry) {
                    entry = createCacheEntry(params);
                    set(produce((s: ReportsStoreState) => {
                        s.cache[key] = entry;
                    }));
                }

                const pageToFetch = params.page ?? 1;
                const limit = params.limit ?? state.defaultLimit;
                const now = Date.now();

                // Return cached page if still valid
                if (entry.pagesLoaded.has(pageToFetch) && now - entry.lastFetchedAt < entry.ttlMs) {
                    const start = (pageToFetch - 1) * limit;
                    const docs = entry.docs.slice(start, start + limit);
                    return {
                        docs,
                        total: entry.total ?? docs.length,
                        page: pageToFetch,
                        pages: entry.total ? Math.ceil(entry.total / limit) : 1,
                        limit,
                    } as ReportsListResponse;
                }

                // Start loading
                set(produce((s: ReportsStoreState) => {
                    s.loading = { type: "loading", context: "list" };
                    s.cache[key]!.error = null;
                }));

                try {
                    const resp = await fetchListFromApi(params);

                    set(produce((s: ReportsStoreState) => {
                        const entryRef = s.cache[key]!;
                        const start = (pageToFetch - 1) * limit;

                        // Replace/insert fetched docs
                        entryRef.docs.splice(start, resp.docs.length, ...resp.docs);

                        entryRef.total = resp.total;
                        entryRef.pagesLoaded.add(pageToFetch);
                        entryRef.lastFetchedAt = Date.now();
                        entryRef.isStale = false;
                        entryRef.error = null;
                        s.loading = { type: "success" };
                    }));


                    return resp;
                } catch (err) {
                    const message = extractErrorMessage(err);
                    set(produce((s: ReportsStoreState) => {
                        s.loading = { type: "error", message };
                        s.cache[key]?.pagesLoaded.add(pageToFetch); // Optional: mark as attempted
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

            assignReport: async (reportId: string, userId: string) => {
                set(
                    produce((s: ReportsStoreState) => {
                        s.loading = { type: "loading", context: "action" };
                    })
                );
                try {
                    const report = await assignReportApi(reportId, userId);
                    // update detail and cached lists
                    set(
                        produce((s: ReportsStoreState) => {
                            s.detailsCache[reportId] = {
                                data: report,
                                loading: false,
                                error: null,
                                fetchedAt: Date.now(),
                            };
                            // Update any cached list entries that include this report
                            for (const key of Object.keys(s.cache)) {
                                const e = s.cache[key];
                                const idx = e.docs.findIndex((d) => d._id === report._id);
                                if (idx >= 0) {
                                    e.docs[idx] = {
                                        ...e.docs[idx],
                                        assignedTo: report.assignedTo ?? null,
                                        status: report.status,
                                        updatedAt: report.updatedAt,
                                    };
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
                                const idx = e.docs.findIndex((d) => d._id === report._id);
                                if (idx >= 0) {
                                    e.docs[idx] = {
                                        ...e.docs[idx],
                                        status: report.status,
                                        updatedAt: report.updatedAt,
                                    };
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
                                const idx = e.docs.findIndex((d) => d._id === report._id);
                                if (idx >= 0) {
                                    e.docs[idx] = {
                                        ...e.docs[idx],
                                        status: report.status,
                                        reopenedCount: report.reopenedCount,
                                        updatedAt: report.updatedAt,
                                    };
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
                            for (const key of Object.keys(s.cache)) {
                                const e = s.cache[key];
                                const oldLen = e.docs.length;
                                e.docs = e.docs.filter((d) => d._id !== reportId);
                                if (e.docs.length !== oldLen) {
                                    // keep pagesLoaded as-is; front-end may trigger refetch
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
            name: "operations-reports-store", // localStorage key

            /**
             * Persist only plain-serializable parts:
             * - params (object)
             * - selectedIds as array (convert Set -> array)
             *
             * Typed as unknown here to satisfy the persist generic signature,
             * but we ensure runtime shape is correct and safe.
             */
            partialize: (state) =>
            // Return plain serializable object only
            ({
                params: state.params,
                selectedIds: Array.from(state.selectedIds),
            } as unknown),

            /**
             * merge receives persisted state as unknown (Zustand definition).
             * Safely cast to our persisted shape and rehydrate Set for selectedIds.
             */
            merge: (persistedState: unknown, currentState: ReportsStoreState) => {
                const persisted = (persistedState as
                    | { params?: ReportsQueryParams; selectedIds?: string[] }
                    | undefined) ?? {};

                const selectedIds = new Set<string>(persisted.selectedIds ?? []);
                return {
                    ...currentState,
                    params: persisted.params ?? currentState.params,
                    selectedIds,
                };
            },
        }
    )
);
