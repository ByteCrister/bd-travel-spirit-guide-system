import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import type { ReportFull, ReportDetailResponse, ReportActionResponse } from "@/types/reports.types";
import { REPORT_PRIORITY, REPORT_REASON, REPORT_STATUS } from "@/constants/report.const";

type DBMap = Map<string, ReportFull>;
const DB_KEY = "__mock_reports_db_v1";

function getSharedDB(): DBMap {
  if (!(globalThis as any)[DB_KEY]) {
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
    for (let i = 0; i < 40; i++) {
      const r = makeReportFull();
      map.set(r._id, r);
    }

    (globalThis as any)[DB_KEY] = map;
  }

  return (globalThis as any)[DB_KEY] as DBMap;
}

const DB = getSharedDB();

/** GET /api/operations/reports/:id */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  let report = DB.get((await params).id);
  if (!report) {
    // create a new report on the fly if not found
    const createdAt = new Date().toISOString();
    report = {
      _id: (await params).id,
      reporter: {
        _id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        avatarUrl: faker.image.avatar(),
        role: "user",
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
      assignedTo: null,
      priority: faker.helpers.arrayElement(Object.values(REPORT_PRIORITY)),
      resolutionNotes: null,
      resolvedAt: null,
      reopenedCount: 0,
      tags: [],
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
    };
    DB.set(report._id, report);
  }

  const payload: ReportDetailResponse = { report };
  return NextResponse.json(payload);
};

/** POST actions: assign, resolve, reopen */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const id = (await params).id;
  const url = new URL(request.url);
  const path = url.pathname;
  const report = DB.get(id);
  if (!report) {
    return NextResponse.json({ success: false, message: "Report not found" }, { status: 404 });
  }

  if (path.endsWith("/assign")) {
    const body = (await request.json().catch(() => ({}))) as { userId?: string };
    const userId = body.userId ?? faker.string.uuid();
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
    const now = new Date().toISOString();
    report.resolvedAt = now;
    report.updatedAt = now;
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
  const id = (await params).id;
  let report = DB.get(id);
  if (!report) {
    // create a soft-deleted placeholder if missing
    const now = new Date().toISOString();
    report = {
      _id: id,
      reporter: {
        _id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        avatarUrl: faker.image.avatar(),
        role: "user",
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
      evidenceImages: [],
      evidenceLinks: [],
      status: REPORT_STATUS.OPEN,
      assignedTo: null,
      priority: faker.helpers.arrayElement(Object.values(REPORT_PRIORITY)),
      resolutionNotes: null,
      resolvedAt: null,
      reopenedCount: 0,
      tags: [],
      createdAt: now,
      updatedAt: now,
      deletedAt: now,
    };
    DB.set(id, report);
  } else {
    report.deletedAt = new Date().toISOString();
    report.updatedAt = new Date().toISOString();
    DB.set(id, report);
  }

  return NextResponse.json({ success: true, reportId: id });
};
