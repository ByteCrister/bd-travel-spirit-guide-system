import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import type {
    ReportsListResponse,
    ReportListItem,
    ReportsQueryParams,
    ReportsCacheKey,
    ReportFull,
    ReportsSortField,
} from "@/types/reports.types";
import { REPORT_PRIORITY, REPORT_REASON, REPORT_STATUS } from "@/constants/report.const";

// In-memory mock DB (Map<id, ReportFull>)
const DB: Map<string, ReportFull> = new Map();

// Utilities to pick enum-like values (typed)
const priorityValues = Object.values(REPORT_PRIORITY) as Array<ReportFull["priority"]>;
const reasonValues = Object.values(REPORT_REASON) as Array<ReportFull["reason"]>;
const statusValues = Object.values(REPORT_STATUS) as Array<ReportFull["status"]>;

/** Create a minimal UserRef */
function makeUserRef(overrides?: Partial<ReportFull["reporter"]>) {
    return {
        _id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        avatarUrl: faker.image.avatarGitHub(),
        role: faker.helpers.arrayElement(["admin", "support", "user"]),
        ...overrides,
    };
}

/** Create a minimal TourRef */
function makeTourRef(overrides?: Partial<ReportFull["tour"]>) {
    return {
        _id: faker.string.uuid(),
        title: faker.lorem.words(3),
        slug: faker.lorem.slug(),
        companyId: faker.string.uuid(),
        heroImage: faker.image.urlLoremFlickr(),
        ...overrides,
    };
}

/** Create ReportFull shaped object */
function makeReportFull(overrides?: Partial<ReportFull>): ReportFull {
    const createdAt = faker.date.past({ years: 1 }).toISOString();
    const updatedAt = faker.date.between({ from: new Date(createdAt), to: new Date() }).toISOString();

    const report: ReportFull = {
        _id: faker.string.uuid(),
        reporter: makeUserRef(),
        tour: makeTourRef(),
        reason: faker.helpers.arrayElement(reasonValues),
        message: faker.lorem.paragraphs(1),
        evidenceImages: faker.helpers.maybe(() => [faker.image.urlLoremFlickr()]),
        evidenceLinks: faker.helpers.maybe(() => [faker.internet.url()]),
        status: faker.helpers.arrayElement(statusValues),
        assignedTo: faker.helpers.maybe(() => makeUserRef()),
        priority: faker.helpers.arrayElement(priorityValues),
        resolutionNotes: null,
        resolvedAt: null,
        reopenedCount: faker.number.int({ min: 0, max: 3 }),
        tags: faker.helpers.arrayElements(["fraud", "safety", "billing", "quality"], { min: 0, max: 3 }),
        createdAt,
        updatedAt,
        deletedAt: null,
        ...overrides,
    };

    return report;
}

/** Seed DB lazily */
function ensureSeed(count = 120) {
    if (DB.size > 0) return;
    for (let i = 0; i < count; i += 1) {
        const r = makeReportFull();
        DB.set(r._id, r);
    }
}

/** Convert ReportFull -> ReportListItem (summary) */
function toListItem(r: ReportFull): ReportListItem {
    return {
        _id: r._id,
        reporter: r.reporter,
        tour: r.tour,
        reason: r.reason,
        priority: r.priority,
        status: r.status,
        messagePreview: r.message.slice(0, 120),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        assignedTo: r.assignedTo ?? null,
        reopenedCount: r.reopenedCount,
        tags: r.tags ?? [],
    };
}

/** Basic query parsing with typed params */
function parseQueryParams(urlSearchParams: URLSearchParams): ReportsQueryParams {
    const pageParam = Number(urlSearchParams.get("page") ?? "1");
    const limitParam = Number(urlSearchParams.get("limit") ?? "10");
    const sortField = urlSearchParams.get("sortField") ?? "createdAt";
    const sortDir = (urlSearchParams.get("sortDir") as "asc" | "desc") ?? "desc";
    const status = (urlSearchParams.get("status") as ReportsQueryParams["status"]) ?? undefined;
    const priority = (urlSearchParams.get("priority") as ReportsQueryParams["priority"]) ?? undefined;
    const reason = (urlSearchParams.get("reason") as ReportsQueryParams["reason"]) ?? undefined;
    const search = urlSearchParams.get("search") ?? undefined;
    const searchScope = (urlSearchParams.get("searchScope") as ReportsQueryParams["searchScope"]) ?? undefined;
    const assignedTo = urlSearchParams.get("assignedTo") ?? undefined;
    const tourId = urlSearchParams.get("tourId") ?? undefined;
    const companyId = urlSearchParams.get("companyId") ?? undefined;
    const includeDeleted = urlSearchParams.get("includeDeleted") === "true";

    const params: ReportsQueryParams = {
        page: Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1,
        limit: Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 10,
        sort: { field: sortField as ReportsSortField, direction: sortDir },
        status,
        priority,
        reason,
        search: search ?? undefined,
        searchScope,
        assignedTo: assignedTo ?? undefined,
        tourId: tourId ?? null,
        companyId: companyId ?? null,
        includeDeleted,
    };

    return params;
}

/** Apply filters/sort/search on in-memory DB and return paginated response */
function queryReports(params: ReportsQueryParams): ReportsListResponse {
    // Convert map to array
    const all: ReportFull[] = Array.from(DB.values()).filter((r) => {
        if (!params.includeDeleted && r.deletedAt) return false;
        if (params.status && params.status !== "any" && r.status !== params.status) return false;
        if (params.priority && params.priority !== "any" && r.priority !== params.priority) return false;
        if (params.reason && params.reason !== "any" && r.reason !== params.reason) return false;
        if (params.tourId && r.tour._id !== params.tourId) return false;
        if (params.companyId && r.tour.companyId !== params.companyId) return false;
        if (params.assignedTo && params.assignedTo !== "any" && r.assignedTo?._id !== params.assignedTo) return false;
        if (params.search && params.search.trim().length > 0) {
            const q = params.search.toLowerCase();
            const scope = params.searchScope ?? "any";
            const matchAny = ([
                r.message,
                r.reporter.name ?? "",
                r.tour.title ?? "",
                r.tags?.join(" ") ?? "",
            ].join(" ").toLowerCase().includes(q));
            if (scope === "any") {
                if (!matchAny) return false;
            } else if (scope === "message" && !r.message.toLowerCase().includes(q)) return false;
            else if (scope === "reporter" && !(r.reporter.name ?? "").toLowerCase().includes(q)) return false;
            else if (scope === "tour" && !(r.tour.title ?? "").toLowerCase().includes(q)) return false;
            else if (scope === "tags" && !(r.tags ?? []).join(" ").toLowerCase().includes(q)) return false;
        }
        return true;
    });

    // Sort
    const sorted = all.sort((a, b) => {
        // Extract field value safely based on known sort keys
        const getValue = (r: ReportFull): string | number | undefined => {
            switch (params.sort?.field) {
                case "createdAt":
                    return Date.parse(r.createdAt);
                case "updatedAt":
                    return Date.parse(r.updatedAt);
                case "priority":
                    return r.priority;
                case "status":
                    return r.status;
                case "reopenedCount":
                    return r.reopenedCount;
                case "reporter.name":
                    return r.reporter.name ?? "";
                default:
                    return 0;
            }
        };

        const aVal = getValue(a);
        const bVal = getValue(b);
        const direction = params.sort?.direction === "asc" ? 1 : -1;

        if (aVal === bVal) return 0;
        if (aVal == null) return 1 * direction;
        if (bVal == null) return -1 * direction;

        // Compare numbers or strings properly
        if (typeof aVal === "number" && typeof bVal === "number") {
            return (aVal - bVal) * direction;
        }
        return String(aVal).localeCompare(String(bVal)) * direction;
    });


    // Pagination
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const total = sorted.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const paged = sorted.slice(start, start + limit);

    const docs: ReportListItem[] = paged.map(toListItem);

    const response: ReportsListResponse = {
        docs,
        total,
        page,
        pages,
        limit,
    };

    return response;
}

// Ensure seed on module init
ensureSeed();

/** GET handler for list endpoint */
export async function GET(request: Request) {
    const url = new URL(request.url);
    const params = parseQueryParams(url.searchParams);
    const payload = queryReports(params);
    return NextResponse.json(payload);
}

/** POST not implemented on collection (could seed or bulk actions) */
export async function POST(request: Request) {
    const body = await request.json().catch(() => ({}));
    // Allow quick creation of a new mock report when body provided
    const incoming = body as Partial<ReportFull> | undefined;
    const newReport = makeReportFull(incoming ?? {});
    DB.set(newReport._id, newReport);
    const response: ReportsListResponse = {
        docs: [toListItem(newReport)],
        total: DB.size,
        page: 1,
        pages: Math.ceil(DB.size / 10),
        limit: 10,
    };
    return NextResponse.json(response, { status: 201 });
}
