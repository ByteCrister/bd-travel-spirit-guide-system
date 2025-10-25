// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import type {
    DashboardApiResponse,
    DashboardKPI,
    DashboardChart,
    DashboardActivity,
    DashboardNotification,
    DashboardQuickAction,
    DashboardTimeRange,
    CacheMeta,
} from "@/types/dashboard.types";

/**
 * Mock GET handler for /api/dashboard
 * Returns production-like DashboardApiResponse with cache metadata.
 * Use this for local development and UI wiring.
 */
export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const timeRange = (url.searchParams.get("timeRange") || "last_30_days") as DashboardTimeRange;
    const limit = Number(url.searchParams.get("activitiesLimit") || 10);
    const page = Number(url.searchParams.get("activitiesPage") || 1);

    // Simple deterministic-ish cacheKey for demo
    const cacheMeta: CacheMeta = {
        cacheKey: `dashboard:${timeRange}:v1`,
        createdAtMs: Date.now(),
        ttlSeconds: 30, // short for development; set longer in prod
        etag: faker.string.uuid(),
        reason: "mock-aggregate",
    };

    // KPIs
    const kpis: DashboardKPI[] = [
        { key: "totalRevenue", title: "Total Revenue", value: Number(faker.finance.amount({ min: 100000, max: 500000, dec: 0 })), currency: "BDT", changePercent: Number(faker.finance.amount({ min: -12, max: 25, dec: 2 })), subLabel: `range ${timeRange}` },
        { key: "bookings", title: "Bookings", value: faker.number.int({ min: 200, max: 500 }), changePercent: Number(faker.finance.amount({ min: -12, max: 25, dec: 2 })) },
        { key: "activeUsers", title: "Active Users", value: faker.number.int({ min: 500, max: 2000 }) },
        { key: "pendingReports", title: "Pending Reports", value: faker.number.int({ min: 0, max: 50 }) },
    ];

    // Charts
    const now = Date.now();
    const days = 30;
    const chartSeries = Array.from({ length: days }, (_, i) => ({
        timestamp: now - (days - i - 1) * 24 * 60 * 60 * 1000,
        value: faker.number.int({ min: 0, max: 20000 }),
    }));

    // Additional charts
    const charts: DashboardChart[] = [
        {
            id: "revenue_over_time",
            type: "area",
            title: "Revenue (30d)",
            seriesName: "Revenue",
            series: chartSeries,
            format: { currency: "BDT", precision: 0 }
        },
        {
            id: "bookings_over_time",
            type: "line",
            title: "Bookings (30d)",
            seriesName: "Bookings",
            series: chartSeries.map(p => ({ timestamp: p.timestamp, value: Math.round(p.value / 1000) }))
        },
        {
            id: "reviews_over_time",
            type: "line",
            title: "Reviews Submitted (30d)",
            seriesName: "Reviews",
            series: Array.from({ length: days }, (_, i) => ({
                timestamp: now - (days - i - 1) * 24 * 60 * 60 * 1000,
                value: faker.number.int({ min: 0, max: 100 }),
            })),
            format: { axisLabel: "reviews" }
        },
        {
            id: "reports_over_time",
            type: "bar",
            title: "Reports Created (30d)",
            seriesName: "Reports",
            series: Array.from({ length: days }, (_, i) => ({
                timestamp: now - (days - i - 1) * 24 * 60 * 60 * 1000,
                value: faker.number.int({ min: 0, max: 50 }),
            })),
            format: { axisLabel: "reports" }
        },
        {
            id: "review_ratings_distribution",
            type: "donut",
            title: "Review Ratings Distribution",
            series: [
                { category: "1 Star", value: faker.number.int({ min: 0, max: 20 }) },
                { category: "2 Stars", value: faker.number.int({ min: 0, max: 30 }) },
                { category: "3 Stars", value: faker.number.int({ min: 0, max: 50 }) },
                { category: "4 Stars", value: faker.number.int({ min: 0, max: 80 }) },
                { category: "5 Stars", value: faker.number.int({ min: 0, max: 120 }) },
            ]
        }
    ];

    // Activities (paged)
    const totalActivities = 120;
    const items: DashboardActivity[] = Array.from({ length: limit }, (_, i) => {
        const id = faker.string.uuid();
        const createdAt = new Date(Date.now() - ((page - 1) * limit + i) * 1000 * 60).toISOString();
        return {
            id,
            kind: faker.helpers.arrayElement(["user", "system", "booking", "order", "content", "employee"]),
            title: faker.hacker.phrase(),
            description: faker.lorem.sentence(),
            related: { model: faker.helpers.arrayElement(["User", "Order", "Tour"]), id: faker.string.uuid() },
            actor: { id: faker.string.uuid(), name: faker.person.fullName(), role: faker.helpers.arrayElement(["admin", "support", "operator"]) },
            createdAt,
            severity: faker.helpers.arrayElement(["info", "warning", "critical"]),
            read: faker.datatype.boolean(),
            meta: { sample: true },
        };
    });

    const activities = {
        items,
        pagination: {
            page,
            limit,
            total: totalActivities,
            pages: Math.ceil(totalActivities / limit),
        },
    };

    // Notifications (top N)
    const notifications: DashboardNotification[] = Array.from({ length: 6 }, () => ({
        id: faker.string.uuid(),
        title: faker.lorem.sentence(3),
        message: faker.lorem.sentence(),
        type: faker.helpers.arrayElement(["info", "success", "warning", "error"]),
        priority: faker.helpers.arrayElement(["low", "medium", "high", "critical"]),
        link: "",
        icon: "",
        createdAt: faker.date.recent({ days: 7 }).toISOString(),
        isRead: faker.datatype.boolean(),
        recipients: [],
        meta: {},
    }));

    // Quick actions
    const quickActions: DashboardQuickAction[] = [
        { id: "qa-recalc", label: "Recalculate Metrics", actionKey: "recalculateMetrics", description: "Run metric recalculation", requiresConfirmation: true, permission: "admin" },
        { id: "qa-clear-cache", label: "Clear Cache", actionKey: "clearDashboardCache", description: "Invalidate dashboard cache", requiresConfirmation: false, permission: "admin" },
    ];

    const payload: DashboardApiResponse = {
        kpis,
        charts,
        activities,
        notifications,
        quickActions,
        meta: { serverTime: new Date().toISOString(), timeRange, generatedFromCache: false, cacheMeta },
    };

    // Respect ETag or conditional flows if needed (skipped in mock)
    return NextResponse.json(payload, { status: 200 });
}
