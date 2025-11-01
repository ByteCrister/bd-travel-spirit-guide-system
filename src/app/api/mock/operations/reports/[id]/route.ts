import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import type { ReportFull, ReportDetailResponse, ReportActionResponse } from "@/types/reports.types";
import { REPORT_PRIORITY, REPORT_REASON, REPORT_STATUS } from "@/constants/report.const";

// Reuse the same in-memory DB instance created by the collection handler module.
// To ensure the same DB map reference, import from the collection file, or if keeping separate files
// place a shared module under /lib/mock/reports-db.ts. For brevity here, we will replicate a
// small shared accessor pattern via globalThis to keep single runtime Map.

type DBMap = Map<string, ReportFull>;
const DB_KEY = "__mock_reports_db_v1";

/** Ensure global DB exists and seeded (shared across routes at runtime). */
function getSharedDB(): DBMap {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore access global
    if (!(globalThis)[DB_KEY]) {
        const map: DBMap = new Map();
        const makeReportFull = (overrides?: Partial<ReportFull>): ReportFull => {
            const createdAt = faker.date.past({ years: 1 }).toISOString();
            const updatedAt = faker.date.between({ from: new Date(createdAt), to: new Date() }).toISOString();
            return {
                _id: faker.string.uuid(),
                reporter: {
                    _id: faker.string.uuid(),
                    name: faker.person.fullName(),
                    email: faker.internet.email(),
                    avatarUrl: faker.image.avatar(),
                    role: faker.helpers.arrayElement(["admin", "support", "user"]),
                },
                tour: {
                    _id: faker.string.uuid(),
                    title: faker.lorem.words(3),
                    slug: faker.lorem.slug(),
                    companyId: faker.string.uuid(),
                    heroImage: faker.image.urlLoremFlickr(),
                },
                reason: faker.helpers.arrayElement(Object.values(REPORT_REASON)),
                message: faker.lorem.paragraph(),
                evidenceImages: faker.helpers.maybe(() => [faker.image.urlLoremFlickr()]),
                evidenceLinks: faker.helpers.maybe(() => [faker.internet.url()]),
                status: faker.helpers.arrayElement(Object.values(REPORT_STATUS)),
                assignedTo: faker.helpers.maybe(() => ({
                    _id: faker.string.uuid(),
                    name: faker.person.fullName(),
                    email: faker.internet.email(),
                    avatarUrl: faker.image.avatar(),
                    role: "support",
                })),
                priority: faker.helpers.arrayElement(Object.values(REPORT_PRIORITY)),
                resolutionNotes: null,
                resolvedAt: null,
                reopenedCount: faker.number.int({ min: 0, max: 2 }),
                tags: faker.helpers.arrayElements(["safety", "billing", "quality"], { min: 0, max: 2 }),
                createdAt,
                updatedAt,
                deletedAt: null,
                ...overrides,
            };
        };

        // seed 40 items
        for (let i = 0; i < 40; i += 1) {
            const r = makeReportFull();
            map.set(r._id, r);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any)[DB_KEY] = map;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (globalThis as any)[DB_KEY] as DBMap;
}

const DB = getSharedDB();

/** GET /api/operations/reports/:id */
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const id = params.id;
    const report = DB.get(id) ?? null;
    if (!report) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    const payload: ReportDetailResponse = { report };
    return NextResponse.json(payload);
}

/** POST actions: assign, resolve, reopen */
export async function POST(request: Request, { params }: { params: { id: string } }) {
    const id = params.id;
    const url = new URL(request.url);
    const path = url.pathname;
    const report = DB.get(id);
    if (!report) {
        return NextResponse.json({ success: false, message: "Report not found" }, { status: 404 });
    }

    if (path.endsWith("/assign")) {
        const body = (await request.json().catch(() => ({}))) as { userId?: string };
        const userId = body.userId ?? faker.string.uuid();
        // assign minimal user reference
        report.assignedTo = {
            _id: userId,
            name: faker.person.fullName(),
            email: faker.internet.email(),
            avatarUrl: faker.image.avatar(),
            role: "support",
        };
        report.status = REPORT_STATUS.IN_REVIEW;
        report.updatedAt = new Date().toISOString();
        DB.set(report._id, report);
        const resp: ReportActionResponse = { success: true, report };
        return NextResponse.json(resp);
    }

    if (path.endsWith("/resolve")) {
        const body = (await request.json().catch(() => ({}))) as { notes?: string };
        report.status = REPORT_STATUS.RESOLVED;
        report.resolutionNotes = body.notes ?? "Resolved by support";
        report.resolvedAt = new Date().toISOString();
        report.updatedAt = new Date().toISOString();
        DB.set(report._id, report);
        const resp: ReportActionResponse = { success: true, report };
        return NextResponse.json(resp);
    }

    if (path.endsWith("/reopen")) {
        report.status = REPORT_STATUS.OPEN;
        report.reopenedCount = (report.reopenedCount ?? 0) + 1;
        report.resolvedAt = null;
        report.updatedAt = new Date().toISOString();
        DB.set(report._id, report);
        const resp: ReportActionResponse = { success: true, report };
        return NextResponse.json(resp);
    }

    return NextResponse.json({ success: false, message: "Unknown action" }, { status: 400 });
}

/** DELETE /api/operations/reports/:id -> soft delete */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const id = params.id;
    const report = DB.get(id);
    if (!report) {
        return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }
    report.deletedAt = new Date().toISOString();
    report.updatedAt = new Date().toISOString();
    DB.set(id, report);
    return NextResponse.json({ success: true, reportId: id });
}
