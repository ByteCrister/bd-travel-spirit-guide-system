// stores/dashboard.store.ts
import { AxiosResponse } from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import api from "@/utils/api/axios";
import {
    CacheMeta,
    DashboardActivity,
    DashboardApiResponse,
    DashboardChart,
    DashboardNotification,
    DashboardStoreState,
    DashboardTimeRange,
} from "@/types/dashboard.types";

/**
 * Notes
 * - No use of `any`. Errors are typed as `unknown` and normalized where needed.
 * - STALE_MS is a number; env value is parsed safely.
 * - createNormalizedMap is generic and avoids implicit any.
 * - API calls use AxiosResponse<DashboardApiResponse> to keep types strict.
 */
const ROOT_API_DIRECTORY = "/mock/dashboard";

const STORAGE_KEY = "app:dashboard:v1";

const STALE_MS = (() => {
    const env = process.env.NEXT_PUBLIC_GUIDE_CACHE_TTL;
    if (!env) return 1000 * 60; // 1 minute
    const n = Number(env);
    return Number.isFinite(n) && n > 0 ? n : 1000 * 60;
})();

export type NormalizedMap<T> = Record<string, T>;

/** Create a normalized id -> item map from array. Uses provided idKey fallback. */
function createNormalizedMap<T extends object>(
    arr: T[] | undefined,
    idKey = "id"
): NormalizedMap<T> {
    const map: NormalizedMap<T> = {};
    if (!Array.isArray(arr)) return map;

    for (const item of arr) {
        // safely extract id without `any`
        const raw = item as unknown as Record<string, unknown>;
        const idFromKey = typeof raw[idKey] === "string" ? (raw[idKey] as string) : undefined;
        const idFromKeyAlt = typeof raw.key === "string" ? (raw.key as string) : undefined;
        const id = idFromKey ?? idFromKeyAlt ?? Math.random().toString(36).slice(2);
        map[id] = item;
    }

    return map;
}

/** Small typed helpers */
function isAxiosErrorWithMessage(err: unknown): err is { message: string } {
    return typeof err === "object" && err !== null && "message" in err;
}

/** Zustand store */
export const useDashboardStore = create<DashboardStoreState>()(
    persist(
        (set, get) => ({
            // Data
            kpis: [],
            charts: {},
            activitiesById: {},
            activityIds: [],
            notificationsById: {},
            notificationIds: [],
            quickActions: [],

            // Pagination & filters
            activitiesPage: 1,
            activitiesLimit: 10,
            activitiesTotal: 0,
            selectedTimeRange: DashboardTimeRange.LAST_30_DAYS,
            searchQuery: undefined,

            // Cache & metadata
            cacheMeta: undefined,
            lastHydratedMs: undefined,

            // Request states
            fetchDashboardState: { loading: false, error: null, lastUpdatedMs: undefined },
            fetchActivitiesState: { loading: false, error: null, lastUpdatedMs: undefined },
            fetchNotificationsState: { loading: false, error: null, lastUpdatedMs: undefined },

            // Actions
            setCacheMeta: (meta?: CacheMeta) => {
                set({ cacheMeta: meta, lastHydratedMs: meta ? Date.now() : undefined });
            },

            hydrateFromServer: (payload: DashboardApiResponse) => {
                const chartsArr = Array.isArray(payload.charts) ? payload.charts : [];
                const chartsMap = createNormalizedMap<DashboardChart>(chartsArr, "id");

                const activitiesArr = Array.isArray(payload.activities?.items) ? payload.activities.items : [];
                const activitiesMap = createNormalizedMap<DashboardActivity>(activitiesArr, "id");
                const activityIds = activitiesArr.map(a => a.id);

                const notificationsArr = Array.isArray(payload.notifications) ? payload.notifications : [];
                const notificationsMap = createNormalizedMap<DashboardNotification>(notificationsArr, "id");
                const notificationIds = notificationsArr.map(n => n.id);

                set({
                    kpis: payload.kpis,
                    charts: chartsMap,
                    activitiesById: activitiesMap,
                    activityIds,
                    activitiesPage: payload.activities.pagination.page,
                    activitiesLimit: payload.activities.pagination.limit,
                    activitiesTotal: payload.activities.pagination.total,
                    notificationsById: notificationsMap,
                    notificationIds,
                    quickActions: payload.quickActions ?? [],
                    cacheMeta: payload.meta?.cacheMeta,
                    lastHydratedMs: Date.now(),
                    fetchDashboardState: { loading: false, error: null, lastUpdatedMs: Date.now() },
                });
            },

            clearStore: () =>
                set({
                    kpis: [],
                    charts: {},
                    activitiesById: {},
                    activityIds: [],
                    notificationsById: {},
                    notificationIds: [],
                    quickActions: [],
                    cacheMeta: undefined,
                    lastHydratedMs: undefined,
                    activitiesPage: 1,
                    activitiesTotal: 0,
                }),

            // Selectors
            getTopKPI: (key: string) => get().kpis.find((k) => k.key === key),

            getRecentActivities: (limit = 10) => {
                const ids = get().activityIds.slice(0, limit);
                return ids.map((id) => get().activitiesById[id]).filter(Boolean) as DashboardActivity[];
            },

            getUnreadNotificationCount: () =>
                Object.values(get().notificationsById).filter((n) => !n.isRead).length,

            // fetchDashboard: respects cacheMeta + staleness unless force=true
            fetchDashboard: async ({ timeRange, force } = {}) => {
                const s = get();
                const selectedRange = timeRange ?? s.selectedTimeRange;
                set({ selectedTimeRange: selectedRange });

                const isStale =
                    s.lastHydratedMs === undefined || Date.now() - s.lastHydratedMs > STALE_MS;

                if (!force && !isStale && s.cacheMeta && s.cacheMeta.ttlSeconds > 0) {
                    // fresh enough, skip
                    return;
                }

                set((state) => ({
                    fetchDashboardState: { ...state.fetchDashboardState, loading: true, error: null },
                }));

                try {
                    const res: AxiosResponse<DashboardApiResponse> = await api.get(`${ROOT_API_DIRECTORY}`, {
                        params: { timeRange: selectedRange, activitiesLimit: s.activitiesLimit, activitiesPage: 1 },
                    });
                    get().hydrateFromServer(res.data);
                } catch (err: unknown) {
                    const message =
                        (isAxiosErrorWithMessage(err) && err.message) ||
                        (err instanceof Error && err.message) ||
                        "Failed to fetch dashboard";
                    set({ fetchDashboardState: { loading: false, error: message, lastUpdatedMs: s.fetchDashboardState.lastUpdatedMs } });
                    throw err;
                } finally {
                    set((state) => ({ fetchDashboardState: { ...state.fetchDashboardState, loading: false } }));
                }
            },

            // fetchActivitiesPage: append or replace activities page
            fetchActivitiesPage: async ({ page, limit, force } = {}) => {
                const s = get();
                const targetPage = page ?? s.activitiesPage;
                const targetLimit = limit ?? s.activitiesLimit;

                if (s.fetchActivitiesState.loading && !force) return;

                set((state) => ({ fetchActivitiesState: { ...state.fetchActivitiesState, loading: true, error: null } }));

                try {
                    const res: AxiosResponse<DashboardApiResponse> = await api.get(`${ROOT_API_DIRECTORY}`, {
                        params: { activitiesPage: targetPage, activitiesLimit: targetLimit, timeRange: s.selectedTimeRange },
                    });
                    const payload = res.data;

                    const newActivitiesById = { ...s.activitiesById };
                    const newActivityIds = [...s.activityIds];

                    for (const act of payload.activities.items) {
                        newActivitiesById[act.id] = act;
                        if (!newActivityIds.includes(act.id)) newActivityIds.push(act.id);
                    }

                    set({
                        activitiesById: newActivitiesById,
                        activityIds: newActivityIds,
                        activitiesPage: payload.activities.pagination.page,
                        activitiesLimit: payload.activities.pagination.limit,
                        activitiesTotal: payload.activities.pagination.total,
                        fetchActivitiesState: { loading: false, error: null, lastUpdatedMs: Date.now() },
                    });
                } catch (err: unknown) {
                    const message =
                        (isAxiosErrorWithMessage(err) && err.message) ||
                        (err instanceof Error && err.message) ||
                        "Failed to fetch activities";
                    set({ fetchActivitiesState: { loading: false, error: message, lastUpdatedMs: s.fetchActivitiesState.lastUpdatedMs } });
                    throw err;
                }
            },

            // fetchNotifications: replace notifications set
            fetchNotifications: async ({ force } = {}) => {
                const s = get();
                if (s.fetchNotificationsState.loading && !force) return;

                set((state) => ({ fetchNotificationsState: { ...state.fetchNotificationsState, loading: true, error: null } }));

                try {
                    const res: AxiosResponse<DashboardApiResponse> = await api.get(`${ROOT_API_DIRECTORY}`, {
                        params: { timeRange: s.selectedTimeRange },
                    });
                    const payload = res.data;
                    const notificationsById = createNormalizedMap<DashboardNotification>(payload.notifications, "id");
                    const notificationIds = payload.notifications.map((n) => n.id);

                    set({
                        notificationsById,
                        notificationIds,
                        fetchNotificationsState: { loading: false, error: null, lastUpdatedMs: Date.now() },
                    });
                } catch (err: unknown) {
                    const message =
                        (isAxiosErrorWithMessage(err) && err.message) ||
                        (err instanceof Error && err.message) ||
                        "Failed to fetch notifications";
                    set({ fetchNotificationsState: { loading: false, error: message, lastUpdatedMs: s.fetchNotificationsState.lastUpdatedMs } });
                    throw err;
                }
            },

            // markNotificationRead: optimistic update; reverts on server failure
            markNotificationRead: async (id, read = true, syncServer = true) => {
                const s = get();
                const notif = s.notificationsById[id];
                if (!notif) return;

                const previous = notif;
                const updated: DashboardNotification = { ...notif, isRead: read };
                set({ notificationsById: { ...s.notificationsById, [id]: updated } });

                if (!syncServer) return;

                try {
                    await api.post(`${ROOT_API_DIRECTORY}/notifications/${id}/read`, { isRead: read });
                } catch {
                    // revert quietly on failure
                    set((state) => ({ notificationsById: { ...state.notificationsById, [id]: previous } }));
                }
            },

            // performQuickAction: typed return
            performQuickAction: async (actionKey, payload) => {
                try {
                    const res = await api.post<{ ok: boolean; message?: string; invalidateKeys?: string[] }>(`${ROOT_API_DIRECTORY}/quick-action`, {
                        actionKey,
                        payload,
                    });
                    const data = res.data;
                    if (data.invalidateKeys?.includes("dashboard")) {
                        set({ cacheMeta: undefined, lastHydratedMs: undefined });
                    }
                    return { ok: data.ok, error: data.ok ? undefined : data.message ?? "action failed" };
                } catch (err: unknown) {
                    const message =
                        (isAxiosErrorWithMessage(err) && err.message) ||
                        (err instanceof Error && err.message) ||
                        "Failed to perform action";
                    return { ok: false, error: message };
                }
            },
        }),
        {
            name: STORAGE_KEY,
            partialize: (state) => ({
                kpis: state.kpis,
                charts: state.charts,
                notificationsById: state.notificationsById,
                notificationIds: state.notificationIds,
                quickActions: state.quickActions,
                cacheMeta: state.cacheMeta,
                lastHydratedMs: state.lastHydratedMs,
                activitiesById: state.activitiesById,
                activityIds: state.activityIds,
                activitiesPage: state.activitiesPage,
                activitiesLimit: state.activitiesLimit,
                activitiesTotal: state.activitiesTotal,
                selectedTimeRange: state.selectedTimeRange,
            }),
            version: 1,
        }
    )
);

export default useDashboardStore;
