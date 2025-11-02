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
    BulkReviewAction,
    BulkActionPayload,
    REVIEWS_CACHE_TTL_MS,
    LS_KEYS,
    ApiError,
} from "@/types/reviews.types";

import api from "@/utils/api/axios";
import { IndexRange, rangeForPage, subtractRanges } from "@/utils/helpers/reviews.cacheSlices";

/* -------------------------
   constants + helpers
   ------------------------- */

const URL_AFTER_API = `/mock/operations/reviews`;
const CACHE_TTL_MS: number =
    Number(process.env.NEXT_PUBLIC_GUIDE_CACHE_TTL ?? REVIEWS_CACHE_TTL_MS) || REVIEWS_CACHE_TTL_MS;
const nowMs = (): number => Date.now();

function makeListEntry(key: string, data: Paginated<ReviewListItemDTO>): ReviewsListCache {
    const fetchedAt = nowMs();
    return {
        key,
        data,
        fetchedAt,
        expiresAt: fetchedAt + CACHE_TTL_MS,
        isStale: false,
        isLoading: false,
        error: null,
        etag: null,
        requestFingerprint: key,
    };
}

function makeDetailEntry(key: string, data: ReviewDetailDTO): ReviewDetailCache {
    const fetchedAt = nowMs();
    return {
        key,
        data,
        fetchedAt,
        expiresAt: fetchedAt + CACHE_TTL_MS,
        isStale: false,
        isLoading: false,
        error: null,
        etag: null,
        requestFingerprint: key,
    };
}

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
                        details:
                            typeof details === "object" && details !== null ? (details as Record<string, unknown>) : undefined,
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
   canonicalize + key
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

export function makeReviewsListKey(filters: ReviewFilters, sort: ReviewSort, page: number, limit: number): string {
    const canonical = canonicalizeFilters(filters);
    return JSON.stringify({ filters: canonical, sort, page: Number(page), limit: Number(limit) });
}

function scopeFromKey(key: string): string | null {
    try {
        const parsed = JSON.parse(key) as { filters?: unknown; sort?: unknown };
        return JSON.stringify({ filters: parsed.filters ?? {}, sort: parsed.sort ?? {} });
    } catch {
        return null;
    }
}

/* -------------------------
   typed helpers
   ------------------------- */

function flattenFiltersForParams(filters: ReviewFilters): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {};
    if (!filters) return params;

    if (typeof filters.query === "string" && filters.query.length > 0) params.q = filters.query;
    if (filters.queryField) params.qField = filters.queryField;
    if (filters.tourId) params.tourId = filters.tourId;
    if (filters.userId) params.userId = filters.userId;
    if (typeof filters.ratingMin === "number") params.ratingMin = Number(filters.ratingMin);
    if (typeof filters.ratingMax === "number") params.ratingMax = Number(filters.ratingMax);
    if (filters.isApproved === true || filters.isApproved === false) params.isApproved = filters.isApproved;
    if (filters.isVerified === true || filters.isVerified === false) params.isVerified = filters.isVerified;
    if (filters.hasImages === true || filters.hasImages === false) params.hasImages = filters.hasImages as boolean;
    if (filters.tripType != null) params.tripType = String(filters.tripType);
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.companyId) params.companyId = filters.companyId;
    if (filters.includeDeleted === true || filters.includeDeleted === false) params.includeDeleted = filters.includeDeleted;

    return params;
}

/* -------------------------
   store: fully typed & error-free
   ------------------------- */

export const useReviewsStore = create<ReviewsStoreState>()(
    devtools((set, get) => {
        // separate in-flight maps for list vs detail requests (strongly typed)
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
            selectedIds: [],
        };

        function safeParse<T>(raw: string | null): T | null {
            if (!raw) return null;
            try {
                return JSON.parse(raw) as T;
            } catch {
                return null;
            }
        }

        function hydrateFromLocalStorage(): void {
            if (typeof window === "undefined") return;
            try {
                const rawQuery = window.localStorage.getItem(LS_KEYS.REVIEWS_QUERY);
                const rawListCache = window.localStorage.getItem(LS_KEYS.REVIEWS_LIST_CACHE);
                const rawDetailCache = window.localStorage.getItem(LS_KEYS.REVIEWS_DETAIL_CACHE);

                const query = safeParse<ReviewToolbarState>(rawQuery);
                const listCache = safeParse<Record<string, ReviewsListCache>>(rawListCache);
                const detailCache = safeParse<Record<string, ReviewDetailCache>>(rawDetailCache);

                // sanitize persisted list entries: keep only unexpired entries with a complete data.total
                const now = nowMs();
                const sanitizedList: Record<string, ReviewsListCache> = {};
                if (listCache) {
                    for (const [k, v] of Object.entries(listCache)) {
                        if (!v) continue;
                        if (!v.data || typeof v.data.total !== "number") continue;
                        if (v.expiresAt && v.expiresAt > now) sanitizedList[k] = v;
                    }
                }

                set(() => ({
                    toolbar: query ?? defaultToolbar,
                    listCache: sanitizedList,
                    detailCache: detailCache ?? {},
                }));
            } catch {
                // ignore
            }
        }

        function persistToLocalStorage(): void {
            if (typeof window === "undefined") return;
            try {
                const s = get();
                window.localStorage.setItem(LS_KEYS.REVIEWS_QUERY, JSON.stringify(s.toolbar));
                window.localStorage.setItem(LS_KEYS.REVIEWS_LIST_CACHE, JSON.stringify(s.listCache));
                window.localStorage.setItem(LS_KEYS.REVIEWS_DETAIL_CACHE, JSON.stringify(s.detailCache));
            } catch {
                // ignore
            }
        }

        const initialState: ReviewsStoreState = {
            toolbar: defaultToolbar,
            listCache: {},
            detailCache: {},
            currentListKey: null,

            toggleSelect: (id: string, selected: boolean) => {
                set((s) => {
                    // update toolbar.selectedIds immutably
                    const nextSelected = selected
                        ? Array.from(new Set([...s.toolbar.selectedIds, id]))
                        : s.toolbar.selectedIds.filter((x) => x !== id);

                    return { toolbar: { ...s.toolbar, selectedIds: nextSelected } };
                });
            },
            
            setSelectedIds: (ids: ObjectIdStr[]) => {
                set((s) => ({ toolbar: { ...s.toolbar, selectedIds: ids } }));
            },

            setToolbar: (next: Partial<ReviewToolbarState>) => {
                set((s) => {
                    const merged = { ...s.toolbar, ...next };
                    // persist toolbar snapshot asynchronously
                    try {
                        if (typeof window !== "undefined") window.localStorage.setItem(LS_KEYS.REVIEWS_QUERY, JSON.stringify(merged));
                    } catch { }
                    return { toolbar: merged };
                });
            },

            fetchList: async (opts?: { useCache?: boolean; toolbar?: ReviewToolbarState }) => {
                const toolbar = opts?.toolbar ?? get().toolbar;
                const key = makeReviewsListKey(toolbar.filters, toolbar.sort, toolbar.page, toolbar.limit);

                // fast path: fresh cache (no mutation)
                const now = nowMs();
                const existing = get().listCache[key];
                const useCache = opts?.useCache ?? true;
                if (useCache && existing?.data && existing.expiresAt && existing.expiresAt > now) {
                    set(() => ({ currentListKey: key }));
                    return existing.data;
                }

                // dedupe concurrent list fetches
                const ongoing = inFlightListRequests.get(key);
                if (ongoing) return ongoing;

                const promise = (async (): Promise<Paginated<ReviewListItemDTO>> => {
                    try {
                        // attempt to assemble from cached slices for the same canonical scope
                        const requestedRange = rangeForPage(toolbar.page, toolbar.limit);
                        const canonicalScope = JSON.stringify({ filters: canonicalizeFilters(toolbar.filters), sort: toolbar.sort });

                        const existingRanges: IndexRange[] = [];
                        const existingDocsMap: Map<number, ReviewListItemDTO> = new Map();

                        for (const [k, entry] of Object.entries(get().listCache)) {
                            if (!entry?.data?.docs) continue;
                            const scope = scopeFromKey(k);
                            if (scope !== canonicalScope) continue;
                            try {
                                const parsed = JSON.parse(k) as { page?: number; limit?: number };
                                const page = Number(parsed.page ?? 1);
                                const limit = Number(parsed.limit ?? entry.data.docs.length);
                                const r = rangeForPage(page, limit);
                                existingRanges.push(r);
                                for (let i = 0; i < entry.data.docs.length; i++) {
                                    existingDocsMap.set(r.start + i, entry.data.docs[i]);
                                }
                            } catch {
                                continue;
                            }
                        }

                        let missingRanges = subtractRanges(requestedRange, existingRanges);

                        // fast path: fully covered by cached docs
                        if (missingRanges.length === 0) {
                            const docs: ReviewListItemDTO[] = [];
                            for (let idx = requestedRange.start; idx < requestedRange.end; idx++) {
                                const d = existingDocsMap.get(idx);
                                if (!d) {
                                    missingRanges = [{ start: idx, end: requestedRange.end }];
                                    break;
                                }
                                docs.push(d);
                            }
                            if (missingRanges.length === 0) {
                                const anyEntry = Object.values(get().listCache).find(
                                    (c) => !!c.data && scopeFromKey(c.key) === canonicalScope
                                );
                                const total = anyEntry?.data?.total ?? docs.length;
                                const paginated: Paginated<ReviewListItemDTO> = {
                                    docs,
                                    total,
                                    page: toolbar.page,
                                    pages: Math.max(1, Math.ceil(total / toolbar.limit)),
                                };
                                const entry = makeListEntry(key, paginated);
                                set((s) => ({ listCache: { ...s.listCache, [key]: entry }, currentListKey: key }));
                                persistToLocalStorage();
                                return paginated;
                            }
                        }

                        // merge adjacent missing ranges
                        missingRanges = missingRanges
                            .sort((a, b) => a.start - b.start)
                            .reduce<IndexRange[]>((acc, cur) => {
                                const last = acc[acc.length - 1];
                                if (!last || cur.start > last.end) acc.push({ ...cur });
                                else last.end = Math.max(last.end, cur.end);
                                return acc;
                            }, []);

                        // set a typed loading placeholder
                        const loadingEntry: ReviewsListCache = {
                            key,
                            data: null,
                            fetchedAt: undefined,
                            expiresAt: undefined,
                            isStale: false,
                            isLoading: true,
                            error: null,
                            etag: null,
                            requestFingerprint: key,
                        };
                        set((s) => ({ listCache: { ...s.listCache, [key]: loadingEntry } }));

                        // attempt offset slice fetches
                        const slicePromises = missingRanges.map(async (r) => {
                            const offset = r.start;
                            const limit = r.end - r.start;
                            try {
                                const res = await api.get<{ data: Paginated<ReviewListItemDTO> }>(URL_AFTER_API, {
                                    params: {
                                        ...flattenFiltersForParams(toolbar.filters),
                                        offset,
                                        limit,
                                        sortField: toolbar.sort.field,
                                        sortDir: toolbar.sort.dir,
                                    },
                                });
                                return { offset, docs: res.data.data.docs, total: res.data.data.total };
                            } catch (e) {
                                const apiErr = normalizeApiError(e) as ApiError & { __OFFSET_UNSUPPORTED?: boolean };
                                apiErr.__OFFSET_UNSUPPORTED = true;
                                throw apiErr;
                            }
                        });

                        let fetchedSlices: { offset: number; docs: ReviewListItemDTO[]; total: number }[] = [];
                        try {
                            fetchedSlices = await Promise.all(slicePromises);
                        } catch (e) {
                            const apiErr = normalizeApiError(e) as ApiError & { __OFFSET_UNSUPPORTED?: boolean };
                            if (apiErr.__OFFSET_UNSUPPORTED) {
                                // fallback to page+limit fetch
                                const params: Record<string, string | number | boolean> = {
                                    page: toolbar.page,
                                    limit: toolbar.limit,
                                    sortField: toolbar.sort.field,
                                    sortDir: toolbar.sort.dir,
                                    ...flattenFiltersForParams(toolbar.filters),
                                };
                                const res = await api.get<{ data: Paginated<ReviewListItemDTO> }>(URL_AFTER_API, { params });
                                const data = res.data.data;
                                const entry = makeListEntry(key, data);
                                set((s) => ({ listCache: { ...s.listCache, [key]: entry }, currentListKey: key }));
                                persistToLocalStorage();
                                return data;
                            }
                            throw apiErr;
                        }

                        // merge fetched slices
                        for (const s of fetchedSlices) {
                            for (let i = 0; i < s.docs.length; i++) existingDocsMap.set(s.offset + i, s.docs[i]);
                        }

                        // build final docs and detect holes
                        const finalDocs: ReviewListItemDTO[] = [];
                        for (let idx = requestedRange.start; idx < requestedRange.end; idx++) {
                            const d = existingDocsMap.get(idx);
                            if (!d) {
                                // fallback to page fetch
                                const params: Record<string, string | number | boolean> = {
                                    page: toolbar.page,
                                    limit: toolbar.limit,
                                    sortField: toolbar.sort.field,
                                    sortDir: toolbar.sort.dir,
                                    ...flattenFiltersForParams(toolbar.filters),
                                };
                                const res = await api.get<{ data: Paginated<ReviewListItemDTO> }>(URL_AFTER_API, { params });
                                const data = res.data.data;
                                const entry = makeListEntry(key, data);
                                set((s) => ({ listCache: { ...s.listCache, [key]: entry }, currentListKey: key }));
                                persistToLocalStorage();
                                return data;
                            }
                            finalDocs.push(d);
                        }

                        const total =
                            fetchedSlices[0]?.total ??
                            Object.values(get().listCache).find((c) => scopeFromKey(c.key) === canonicalScope && c.data)?.data?.total ??
                            finalDocs.length;

                        const paginated: Paginated<ReviewListItemDTO> = {
                            docs: finalDocs,
                            total: Number(total ?? finalDocs.length),
                            page: toolbar.page,
                            pages: Math.max(1, Math.ceil(Number(total ?? finalDocs.length) / toolbar.limit)),
                        };

                        const composedEntry = makeListEntry(key, paginated);
                        set((s) => ({ listCache: { ...s.listCache, [key]: composedEntry }, currentListKey: key }));
                        persistToLocalStorage();
                        return paginated;
                    } catch (err) {
                        const apiErr = normalizeApiError(err);
                        // attach typed error entry
                        const errorEntry: ReviewsListCache = {
                            key,
                            data: null,
                            fetchedAt: nowMs(),
                            expiresAt: nowMs() + CACHE_TTL_MS,
                            isStale: true,
                            isLoading: false,
                            error: apiErr,
                            etag: null,
                            requestFingerprint: key,
                        };
                        set((s) => ({ listCache: { ...s.listCache, [key]: errorEntry }, globalError: apiErr }));
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
                const now = nowMs();
                const existing = get().detailCache[key];

                if (!options?.force && existing?.data && existing.expiresAt && existing.expiresAt > now) {
                    return existing.data;
                }

                // dedupe detail fetches
                const detailKey = `detail:${key}`;
                const ongoing = inFlightDetailRequests.get(detailKey);
                if (ongoing) return ongoing;

                const p = (async (): Promise<ReviewDetailDTO> => {
                    // set typed loading stub
                    const loadingDetail: ReviewDetailCache = {
                        key,
                        data: existing?.data ?? null,
                        fetchedAt: existing?.fetchedAt,
                        expiresAt: existing?.expiresAt,
                        isStale: !(existing?.expiresAt && existing.expiresAt > now),
                        isLoading: true,
                        error: null,
                        etag: existing?.etag ?? null,
                        requestFingerprint: key,
                    };
                    set((s) => ({ detailCache: { ...s.detailCache, [key]: loadingDetail } }));

                    try {
                        const res = await api.get<{ data: ReviewDetailDTO }>(`${URL_AFTER_API}/${encodeURIComponent(reviewId)}`);
                        const data = res.data.data;
                        const entry = makeDetailEntry(key, data);
                        set((s) => ({ detailCache: { ...s.detailCache, [key]: entry } }));
                        persistToLocalStorage();
                        return data;
                    } catch (err) {
                        const apiErr = normalizeApiError(err);
                        const errorEntry: ReviewDetailCache = {
                            key,
                            data: existing?.data ?? null,
                            fetchedAt: nowMs(),
                            expiresAt: nowMs() + CACHE_TTL_MS,
                            isStale: true,
                            isLoading: false,
                            error: apiErr,
                            etag: existing?.etag ?? null,
                            requestFingerprint: key,
                        };
                        set((s) => ({ detailCache: { ...s.detailCache, [key]: errorEntry }, globalError: apiErr }));
                        throw apiErr;
                    } finally {
                        inFlightDetailRequests.delete(detailKey);
                    }
                })();

                inFlightDetailRequests.set(detailKey, p);
                return p;
            },

            approveReview: async (reviewId: ObjectIdStr, note?: string) => {
                try {
                    const payload = { isApproved: true, note };
                    const res = await api.post<{ data: ReviewDetailDTO }>(
                        `${URL_AFTER_API}/${encodeURIComponent(reviewId)}/moderate`,
                        payload
                    );
                    const updated = res.data.data;
                    set((s) => ({ detailCache: { ...s.detailCache, [reviewId]: makeDetailEntry(reviewId, updated) } }));
                    get().invalidateListCache?.();
                    persistToLocalStorage();
                    return updated;
                } catch (err) {
                    throw normalizeApiError(err);
                }
            },

            rejectReview: async (reviewId: ObjectIdStr, reason?: string) => {
                try {
                    const payload = { isApproved: false, note: reason };
                    const res = await api.post<{ data: ReviewDetailDTO }>(
                        `${URL_AFTER_API}/${encodeURIComponent(reviewId)}/moderate`,
                        payload
                    );
                    const updated = res.data.data;
                    set((s) => ({ detailCache: { ...s.detailCache, [reviewId]: makeDetailEntry(reviewId, updated) } }));
                    get().invalidateListCache?.();
                    persistToLocalStorage();
                    return updated;
                } catch (err) {
                    throw normalizeApiError(err);
                }
            },

            addReply: async (reviewId: ObjectIdStr, message: string) => {
                try {
                    const payload = { message };
                    const res = await api.post<{ data: ReviewReplyDTO }>(
                        `${URL_AFTER_API}/${encodeURIComponent(reviewId)}/replies`,
                        payload
                    );
                    const reply = res.data.data;
                    const existing = get().detailCache[reviewId];
                    if (existing?.data) {
                        const updated: ReviewDetailDTO = { ...existing.data, replies: [...existing.data.replies, reply] };
                        set((s) => ({ detailCache: { ...s.detailCache, [reviewId]: makeDetailEntry(reviewId, updated) } }));
                        persistToLocalStorage();
                    } else {
                        void get().fetchDetail(reviewId, { force: true }).catch(() => { });
                    }
                    return reply;
                } catch (err) {
                    throw normalizeApiError(err);
                }
            },

            incrementHelpful: async (reviewId: ObjectIdStr) => {
                try {
                    const res = await api.post<{ data: { helpfulCount: number } }>(
                        `${URL_AFTER_API}/${encodeURIComponent(reviewId)}/helpful`
                    );
                    const newCount = res.data.data.helpfulCount;
                    const detail = get().detailCache[reviewId];
                    if (detail?.data) set((s) => ({ detailCache: { ...s.detailCache, [reviewId]: makeDetailEntry(reviewId, { ...detail.data, helpfulCount: newCount } as ReviewDetailDTO) } }));

                    // update list caches safely: ensure Paginated totals remain numbers
                    const listKeys = Object.keys(get().listCache);
                    for (const k of listKeys) {
                        const entry = get().listCache[k];
                        if (!entry?.data) continue;
                        const docs = entry.data.docs.map((d) => (d._id === reviewId ? { ...d, helpfulCount: newCount } : d));
                        const updatedData: Paginated<ReviewListItemDTO> = {
                            docs,
                            total: Number(entry.data.total ?? docs.length),
                            page: Number(entry.data.page ?? 1),
                            pages: Math.max(1, Math.ceil(Number(entry.data.total ?? docs.length) / (entry.data?.docs.length || 1))),
                        };
                        set((s) => ({ listCache: { ...s.listCache, [k]: { ...entry, data: updatedData } } }));
                    }
                    persistToLocalStorage();
                    return newCount;
                } catch (err) {
                    throw normalizeApiError(err);
                }
            },

            deleteReview: async (reviewId: ObjectIdStr, soft = true) => {
                try {
                    if (soft) await api.post(`${URL_AFTER_API}/${encodeURIComponent(reviewId)}/delete`);
                    else await api.delete(`${URL_AFTER_API}/${encodeURIComponent(reviewId)}`);
                    get().invalidateDetailCache(reviewId);
                    get().invalidateListCache();
                    persistToLocalStorage();
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
                    set((s) => ({ detailCache: { ...s.detailCache, [reviewId]: makeDetailEntry(reviewId, restored) } }));
                    get().invalidateListCache();
                    persistToLocalStorage();
                    return restored;
                } catch (err) {
                    throw normalizeApiError(err);
                }
            },

            bulkAction: async (ids: ObjectIdStr[], action: BulkReviewAction, payload?: BulkActionPayload) => {
                try {
                    const body = { ids, action, payload: payload ?? {} };
                    await api.post(`${URL_AFTER_API}/bulk`, body);
                    get().invalidateListCache();
                    for (const id of ids) get().invalidateDetailCache(id);
                    persistToLocalStorage();
                } catch (err) {
                    throw normalizeApiError(err);
                }
            },

            // cache management
            setListCache: (key: string, entry: ReviewsListCache) => {
                set((s) => ({ listCache: { ...s.listCache, [key]: entry } }));
            },
            setDetailCache: (key: string, entry: ReviewDetailCache) => {
                set((s) => ({ detailCache: { ...s.detailCache, [key]: entry } }));
            },
            invalidateListCache: (matcher?: (k: string) => boolean) => {
                set((s) => {
                    if (!matcher) return { listCache: {} };
                    const next: Record<string, ReviewsListCache> = {};
                    for (const k of Object.keys(s.listCache)) {
                        if (!matcher(k)) next[k] = s.listCache[k];
                    }
                    return { listCache: next };
                });
            },
            invalidateDetailCache: (reviewId?: ObjectIdStr) => {
                set((s) => {
                    const next = { ...s.detailCache };
                    if (reviewId) delete next[reviewId];
                    else for (const k of Object.keys(next)) delete next[k];
                    return { detailCache: next };
                });
            },
            hydrateFromLocalStorage: () => hydrateFromLocalStorage(),
            persistToLocalStorage: () => persistToLocalStorage(),

            // flags
            globalLoading: false,
            globalError: null,
        };

        // hydrate on client
        if (typeof window !== "undefined") {
            try {
                initialState.hydrateFromLocalStorage();
            } catch {
                // ignore
            }
        }

        return initialState;
    })
);
