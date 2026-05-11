import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import type {
    ReportsListResponse,
    ReportListItem,
    ReportsQueryParams,
    ReportFull,
    ReportsSortField,
} from "@/types/tour/reports.types";
import { REPORT_PRIORITY, REPORT_REASON, REPORT_STATUS } from "@/constants/tour/report.const";

// Utilities to pick enum-like values
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

/** Generate a single ReportFull object */
function makeReportFull(overrides?: Partial<ReportFull>): ReportFull {
    const createdAt = faker.date.past({ years: 1 }).toISOString();
    const updatedAt = faker.date.between({ from: new Date(createdAt), to: new Date() }).toISOString();

    return {
        _id: faker.string.uuid(),
        reporter: makeUserRef(),
        tour: makeTourRef(),
        reason: faker.helpers.arrayElement(reasonValues),
        message: faker.lorem.paragraphs(1),
        evidenceImages: faker.helpers.maybe(() => [faker.image.urlLoremFlickr()]),
        evidenceLinks: faker.helpers.maybe(() => [faker.internet.url()]),
        status: faker.helpers.arrayElement(statusValues),
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
}

/** Convert ReportFull -> ReportListItem */
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
        reopenedCount: r.reopenedCount,
        tags: r.tags ?? [],
    };
}

/** Parse query parameters */
function parseQueryParams(urlSearchParams: URLSearchParams): ReportsQueryParams {
    const page = Number(urlSearchParams.get("page") ?? "1");
    const limit = Number(urlSearchParams.get("limit") ?? "10");
    const sortField = urlSearchParams.get("sortField") ?? "createdAt";
    const sortDir = (urlSearchParams.get("sortDir") as "asc" | "desc") ?? "desc";

    // Helper function to parse filter values
    const parseFilterParam = (param: string | null): string | null => {
        if (!param || param === "any" || param === "") {
            return null;
        }
        return param;
    };

    return {
        page: Math.max(1, page),
        limit: Math.max(1, limit),
        sort: { field: sortField as ReportsSortField, direction: sortDir },
        status: parseFilterParam(urlSearchParams.get("status")) as ReportsQueryParams["status"],
        priority: parseFilterParam(urlSearchParams.get("priority")) as ReportsQueryParams["priority"],
        reason: parseFilterParam(urlSearchParams.get("reason")) as ReportsQueryParams["reason"],
        search: urlSearchParams.get("search") || undefined,
        searchScope: (urlSearchParams.get("searchScope") as ReportsQueryParams["searchScope"]) || undefined,
    };
}

/** Generate a paginated list of random reports */
function generateReports(params: ReportsQueryParams): ReportsListResponse {
    // Provide safe defaults
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const sortField = params.sort?.field ?? "createdAt";
    const sortDirection = params.sort?.direction ?? "desc";

    const total = limit * 10; // generate more than needed
    const allReports: ReportFull[] = Array.from({ length: total }, () => makeReportFull());

    // Apply search & filters
    const filtered = allReports.filter((r) => {

        // Handle null filter values (no filter applied)
        if (params.status !== null && r.status !== params.status) return false;
        if (params.priority !== null && r.priority !== params.priority) return false;
        if (params.reason !== null && r.reason !== params.reason) return false;

        if (params.search && params.search.trim()) {
            const q = params.search.toLowerCase();
            const matchAny = [
                r.message,
                r.reporter.name ?? "",
                r.tour.title ?? "",
                r.tags?.join(" ") ?? "",
            ].join(" ").toLowerCase().includes(q);
            return matchAny;
        }
        return true;
    });

    // Sort
    const sorted = filtered.sort((a, b) => {
        const getValue = (r: ReportFull): string | number => {
            switch (sortField) {
                case "createdAt": return Date.parse(r.createdAt);
                case "updatedAt": return Date.parse(r.updatedAt);
                case "priority": return r.priority;
                case "status": return r.status;
                case "reopenedCount": return r.reopenedCount;
                case "reporter.name": return r.reporter.name ?? "";
                default: return 0;
            }
        };
        const aVal = getValue(a);
        const bVal = getValue(b);
        const dir = sortDirection === "asc" ? 1 : -1;
        if (typeof aVal === "number" && typeof bVal === "number") return (aVal - bVal) * dir;
        return String(aVal).localeCompare(String(bVal)) * dir;
    });

    // Pagination
    const start = (page - 1) * limit;
    const paged = sorted.slice(start, start + limit).map(toListItem);

    return {
        docs: paged,
        total: filtered.length,
        page,
        pages: Math.ceil(filtered.length / limit),
        limit,
    };
}

/** GET handler */
export async function GET(request: Request) {
    const url = new URL(request.url);
    const params = parseQueryParams(url.searchParams);
    const payload = generateReports(params);
    return NextResponse.json({ data: payload });
}
