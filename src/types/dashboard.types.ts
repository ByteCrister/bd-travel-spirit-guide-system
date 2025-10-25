// dashboard.types.ts
// Purpose: single source of truth for all types used by /api/dashboard, the persisted zustand store,
// and dashboard UI components. Written for Next.js 15 + TypeScript + MongoDB production usage.

/* ------------------------------------------------------------------
  Enums & lightweight helpers
------------------------------------------------------------------- */

/** Time ranges commonly used for charts and stats */
export enum DashboardTimeRange {
    LAST_24_HOURS = "last_24_hours",
    LAST_7_DAYS = "last_7_days",
    LAST_30_DAYS = "last_30_days",
    LAST_90_DAYS = "last_90_days",
    YEAR_TO_DATE = "ytd",
}

/** Types of dashboard widgets */
export enum DashboardWidgetType {
    KPI = "kpi",
    CHART = "chart",
    TABLE = "table",
    RECENT_ACTIVITY = "recent_activity",
    NOTIFICATIONS = "notifications",
    QUICK_ACTIONS = "quick_actions",
}

/* ------------------------------------------------------------------
  Core API shapes (what /api/dashboard should return)
------------------------------------------------------------------- */

/** High level numbers displayed as KPIs */
export interface DashboardKPI {
    /** unique key for the KPI (e.g., "totalRevenue") */
    key: string;
    /** human title displayed in UI */
    title: string;
    /** numeric value */
    value: number;
    /** currency code when applicable (e.g., "BDT", "USD") */
    currency?: string;
    /** small change indicator compared to previous period; positive/negative */
    changePercent?: number;
    /** optional sublabel or suffix (e.g., "vs last 30d") */
    subLabel?: string;
    /** optional metadata for drilldown */
    meta?: Record<string, unknown>;
}

/** Simple timeseries point */
export type TimeSeriesPoint = {
    /** unix ms or ISO string depending on serialization strategy; prefer number(ms) for compactness */
    timestamp: number;
    value: number;
    /** optional secondary value for stacked/dual-axis charts */
    value2?: number;
};

/** Generic chart payload for line/area/bar/pie */
export interface DashboardChart {
    id: string;
    type: "line" | "area" | "bar" | "pie" | "donut";
    title?: string;
    seriesName?: string;
    /** time series or category data */
    series: TimeSeriesPoint[] | { category: string; value: number }[];
    /** optional formatting hints for UI */
    format?: {
        currency?: string;
        precision?: number;
        axisLabel?: string;
    };
    meta?: Record<string, unknown>;
}

/** Recent activity item (audit-friendly) */
export interface DashboardActivity {
    id: string;
    kind: "user" | "system" | "booking" | "order" | "content" | "employee" | string;
    title: string;
    description?: string;
    /** reference to model and id for quick navigation */
    related?: { model: string; id: string };
    actor?: { id?: string; name?: string; role?: string };
    createdAt: string; // ISO
    severity?: "info" | "warning" | "critical";
    read?: boolean;
    meta?: Record<string, unknown>;
}

/** Notification item shown in realtime notification list */
export interface DashboardNotification {
    id: string;
    title: string;
    message?: string;
    type?: "info" | "success" | "warning" | "error";
    priority?: "low" | "medium" | "high" | "critical";
    link?: string;
    icon?: string;
    createdAt: string; // ISO
    isRead?: boolean;
    recipients?: string[]; // ids
    meta?: Record<string, unknown>;
}

/** Quick actions available to admin on dashboard */
export interface DashboardQuickAction {
    id: string;
    label: string;
    /** internal action key consumed by UI/handlers (e.g., "recalculateRevenue") */
    actionKey: string;
    description?: string;
    icon?: string;
    /** optional confirmation requirement */
    requiresConfirmation?: boolean;
    /** optional guard: permission key required to show/execute */
    permission?: string;
    /** optional payload template */
    payload?: Record<string, unknown>;
}

/** Pagination used by APIs for lists such as activities */
export interface DashboardPagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

/** Top-level API response for /api/dashboard */
export interface DashboardApiResponse {
    /** KPI summary set */
    kpis: DashboardKPI[];
    /** charts for visualizations */
    charts?: DashboardChart[];
    /** most recent activities (paged) */
    activities: {
        items: DashboardActivity[];
        pagination: DashboardPagination;
    };
    /** notifications for admin (top N) */
    notifications: DashboardNotification[];
    /** quick actions available */
    quickActions: DashboardQuickAction[];
    /** metadata helpful for UI and caching */
    meta?: {
        serverTime: string; // ISO
        timeRange?: DashboardTimeRange;
        generatedFromCache?: boolean;
        cacheMeta?: CacheMeta;
    };
}

/* ------------------------------------------------------------------
  Cache metadata & freshness model (for production-grade caching)
------------------------------------------------------------------- */

/** Minimal cache metadata returned from API to coordinate client cache */
export interface CacheMeta {
    /** unique cache key used on server for this payload */
    cacheKey: string;
    /** when cache was created on server (ms epoch) */
    createdAtMs: number;
    /** ttl in seconds used on server (0 = no expiry) */
    ttlSeconds: number;
    /** server-side invalidation token / etag for optimistic revalidation */
    etag?: string;
    /** optional reasons why this response is cached (e.g., aggregated expensive queries) */
    reason?: string;
}

/* ------------------------------------------------------------------
  Zustand persisted store types (client-side)
  - design intent: keep normalized state, cache metadata, request lifecycle,
    and lightweight selectors. store methods are typed to help implementers.
------------------------------------------------------------------- */

/** Loading & error fingerprint for any request */
export interface RequestState {
    loading: boolean;
    error?: string | null;
    lastUpdatedMs?: number; // epoch ms when request last succeeded
}

/** Normalized map keyed by id for quick lookups */
export type NormalizedMap<T> = Record<string, T>;

/** Dashboard store shape used by zustand + persist */
export interface DashboardStoreState {
    /* Data */
    kpis: DashboardKPI[];
    charts: NormalizedMap<DashboardChart>;
    activitiesById: NormalizedMap<DashboardActivity>;
    activityIds: string[]; // ordered newest-first
    notificationsById: NormalizedMap<DashboardNotification>;
    notificationIds: string[]; // ordered newest-first
    quickActions: DashboardQuickAction[];

    /* Pagination + filters */
    activitiesPage: number;
    activitiesLimit: number;
    activitiesTotal: number;
    selectedTimeRange: DashboardTimeRange;
    searchQuery?: string;

    /* Cache & request metadata */
    cacheMeta?: CacheMeta;
    lastHydratedMs?: number;

    /* Request states */
    fetchDashboardState: RequestState;
    fetchActivitiesState: RequestState;
    fetchNotificationsState: RequestState;

    /* Actions (store methods) */
    // fetch the whole dashboard (kpis, charts, top activities, notifications)
    fetchDashboard: (opts?: { timeRange?: DashboardTimeRange; force?: boolean }) => Promise<void>;

    // fetch next page of activities (appends)
    fetchActivitiesPage: (opts?: { page?: number; limit?: number; force?: boolean }) => Promise<void>;

    // refresh notifications realtime/simple poll
    fetchNotifications: (opts?: { force?: boolean }) => Promise<void>;

    // mark notification read/unread locally and optionally send to server
    markNotificationRead: (id: string, read?: boolean, syncServer?: boolean) => Promise<void>;

    // perform a quick action (UI triggers this)
    performQuickAction: (actionKey: string, payload?: Record<string, unknown>) => Promise<{ ok: boolean; error?: string }>;

    // client cache helpers
    setCacheMeta: (meta?: CacheMeta) => void;
    hydrateFromServer: (payload: DashboardApiResponse) => void;
    clearStore: () => void;

    /* Selectors & utilities included for typing convenience */
    getTopKPI: (key: string) => DashboardKPI | undefined;
    getRecentActivities: (limit?: number) => DashboardActivity[];
    getUnreadNotificationCount: () => number;
}

/* ------------------------------------------------------------------
  Lightweight UI types (component props)
------------------------------------------------------------------- */

/** Props for a KPI card component */
export interface KPIProps {
    kpi: DashboardKPI;
    onClick?: (kpi: DashboardKPI) => void;
}

/** Props for a chart component */
export interface ChartProps {
    chart: DashboardChart;
    timeRange?: DashboardTimeRange;
    onPointClick?: (point: TimeSeriesPoint) => void;
}

/** Props for activity list */
export interface ActivityListProps {
    items: DashboardActivity[];
    loading?: boolean;
    onLoadMore?: () => void;
    onItemClick?: (item: DashboardActivity) => void;
}

/* ------------------------------------------------------------------
  Implementation notes (comments to guide /api/dashboard & zustand usage)
  - Keep these in sync with server-side handler and shared DTOs
-------------------------------------------------------------------
  1) Server should return cacheMeta and generatedFromCache boolean so client
     can decide to use persisted store cache or revalidate (ETag style).
  2) Use normalized maps in store for O(1) updates and small payload diffs.
  3) All timestamps stored as ISO strings in API payloads. Store holds
     lastUpdatedMs for freshness checks in epoch ms.
  4) fetchDashboard should accept { force: true } to bypass cache checks and
     always request server (useful for manual refresh or after actions).
  5) Quick actions return a result; client should optimistically update UI
     where safe, then re-sync by fetching affected resources.
  6) Persist strategy: store kpis, charts, notifications, cacheMeta, and
     lastHydratedMs. Keep request-state transient (non-persisted) if desired.
------------------------------------------------------------------- */
