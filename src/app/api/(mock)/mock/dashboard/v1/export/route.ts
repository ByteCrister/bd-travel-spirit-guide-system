// app/api/dashboard/v1/export/mock/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { faker } from "@faker-js/faker";
import { Types } from "mongoose";

import {
  withErrorHandler,
  ApiError,
  HandlerResult,
} from "@/lib/helpers/withErrorHandler";

// ─── CSV Helper (relaxed typing to accept any object) ──────────────
function arrayToCSV(data: object[], headers?: string[]): string {
  if (!data.length) return "";
  const cols = headers ?? (Object.keys(data[0]) as string[]);
  const rows = data.map((row) =>
    cols
      .map((field) => {
        // row is object, field is keyof that object
        const value = (row as Record<string, unknown>)[field];
        return JSON.stringify(value ?? "");
      })
      .join(","),
  );
  return [cols.join(","), ...rows].join("\n");
}

// ─── Zod schema for query parameters (same as real API) ─────────
const exportQuerySchema = z.object({
  globalDateRangeFrom: z.string().datetime().optional(),
  globalDateRangeTo: z.string().datetime().optional(),
  tourStatus: z.string().optional(),
  employeeStatus: z.string().optional(),
  reportStatus: z.string().optional(),
  bookingStatus: z.string().optional(),
  type: z.enum([
    "bookings",
    "employees",
    "reports",
    "reviews",
    "tours",
    "transactions",
  ]),
});

type ExportQuery = z.infer<typeof exportQuerySchema>;

// ─── Mock Data Types (matching real interfaces) ─────────────────
interface MockTour {
  _id: string;
  title: string;
  slug: string;
  uniqueTourCode: string;
  status: string;
  summary: string;
  basePrice: { amount: number; currency: string };
  duration: { days: number; nights: number };
  createdAt: Date;
  updatedAt: Date;
}

interface MockEmployee {
  _id: string;
  user: string;
  companyId: string;
  status: string;
  employmentType: string;
  salary: number;
  currency: string;
  contactInfo: { phone: string; email?: string };
  dateOfJoining: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface MockReport {
  _id: string;
  reporter: string;
  tour: string;
  reason: string;
  message: string;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MockReview {
  _id: string;
  tour: string;
  user: string;
  rating: number;
  title?: string;
  comment: string;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MockBooking {
  _id: string;
  bookingReference: string;
  uniqueTourCode: string;
  traveler: string;
  tour: string;
  totalParticipants: number;
  totalPaid: number;
  status: string;
  bookedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface MockTransaction {
  type: "booking_payment" | "salary_payment";
  reference: string;
  amount: number;
  currency: string;
  status: string;
  date: Date;
  transactionId?: string;
  employeeId?: string;
}

// Helper function to generate a Bangladeshi phone number
function generateBangladeshPhone(): string {
  const operatorCode = faker.helpers.arrayElement([
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
  ]);
  const rest = faker.string.numeric(8);
  return `+880${operatorCode}${rest}`;
}

// ─── Mock Data Generators ───────────────────────────────────────
function generateMockTours(count: number = 20): MockTour[] {
  return Array.from({ length: count }, () => ({
    _id: new Types.ObjectId().toString(),
    title: faker.company.catchPhrase(),
    slug: faker.helpers.slugify(faker.company.catchPhrase()).toLowerCase(),
    uniqueTourCode: faker.string.alphanumeric(10).toUpperCase(),
    status: faker.helpers.arrayElement(["ACTIVE", "DRAFT", "COMPLETED"]),
    summary: faker.lorem.paragraph(),
    basePrice: {
      amount: faker.number.int({ min: 500, max: 50000 }),
      currency: "BDT",
    },
    duration: {
      days: faker.number.int({ min: 1, max: 10 }),
      nights: faker.number.int({ min: 0, max: 9 }),
    },
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: faker.date.recent(),
  }));
}

function generateMockEmployees(count: number = 15): MockEmployee[] {
  return Array.from({ length: count }, () => ({
    _id: new Types.ObjectId().toString(),
    user: new Types.ObjectId().toString(),
    companyId: new Types.ObjectId().toString(),
    status: faker.helpers.arrayElement(["ACTIVE", "ON_LEAVE", "TERMINATED"]),
    employmentType: faker.helpers.arrayElement([
      "FULL_TIME",
      "PART_TIME",
      "CONTRACT",
    ]),
    salary: faker.number.int({ min: 15000, max: 100000 }),
    currency: "BDT",
    contactInfo: {
      phone: generateBangladeshPhone(),
      email: faker.internet.email(),
    },
    dateOfJoining: faker.date.past({ years: 2 }),
    createdAt: faker.date.past({ years: 2 }),
    updatedAt: faker.date.recent(),
  }));
}

function generateMockReports(count: number = 10): MockReport[] {
  return Array.from({ length: count }, () => ({
    _id: new Types.ObjectId().toString(),
    reporter: new Types.ObjectId().toString(),
    tour: new Types.ObjectId().toString(),
    reason: faker.helpers.arrayElement([
      "MISLEADING_INFO",
      "FRAUD",
      "SAFETY_ISSUE",
      "OTHER",
    ]),
    message: faker.lorem.sentence(),
    status: faker.helpers.arrayElement([
      "OPEN",
      "IN_REVIEW",
      "RESOLVED",
      "REJECTED",
    ]),
    priority: faker.helpers.arrayElement(["LOW", "NORMAL", "HIGH", "URGENT"]),
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: faker.date.recent(),
  }));
}

function generateMockReviews(count: number = 25): MockReview[] {
  return Array.from({ length: count }, () => ({
    _id: new Types.ObjectId().toString(),
    tour: new Types.ObjectId().toString(),
    user: new Types.ObjectId().toString(),
    rating: faker.number.int({ min: 1, max: 5 }),
    title: faker.lorem.words(3),
    comment: faker.lorem.paragraph(),
    isApproved: faker.datatype.boolean(0.8),
    helpfulCount: faker.number.int({ min: 0, max: 50 }),
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: faker.date.recent(),
  }));
}

function generateMockBookings(count: number = 30): MockBooking[] {
  return Array.from({ length: count }, () => ({
    _id: new Types.ObjectId().toString(),
    bookingReference: `BKG${faker.string.numeric(6)}`,
    uniqueTourCode: faker.string.alphanumeric(10).toUpperCase(),
    traveler: new Types.ObjectId().toString(),
    tour: new Types.ObjectId().toString(),
    totalParticipants: faker.number.int({ min: 1, max: 10 }),
    totalPaid: faker.number.int({ min: 1000, max: 100000 }),
    status: faker.helpers.arrayElement([
      "PENDING",
      "CONFIRMED",
      "CANCELLED",
      "COMPLETED",
    ]),
    bookedAt: faker.date.past({ years: 1 }),
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: faker.date.recent(),
  }));
}

function generateMockTransactions(count: number = 20): MockTransaction[] {
  const bookingTx: MockTransaction[] = Array.from(
    { length: Math.floor(count / 2) },
    () => ({
      type: "booking_payment",
      reference: `BKG${faker.string.numeric(6)}`,
      amount: faker.number.int({ min: 1000, max: 50000 }),
      currency: "BDT",
      status: faker.helpers.arrayElement(["COMPLETED", "PENDING", "FAILED"]),
      date: faker.date.past({ years: 1 }),
      transactionId: faker.string.alphanumeric(15),
    }),
  );

  const salaryTx: MockTransaction[] = Array.from(
    { length: count - bookingTx.length },
    () => ({
      type: "salary_payment",
      reference: new Types.ObjectId().toString(),
      amount: faker.number.int({ min: 15000, max: 80000 }),
      currency: "BDT",
      status: faker.helpers.arrayElement(["PAID", "PENDING", "FAILED"]),
      date: faker.date.past({ years: 1 }),
      transactionId: faker.string.alphanumeric(15),
      employeeId: new Types.ObjectId().toString(),
    }),
  );

  return [...bookingTx, ...salaryTx].sort(() => Math.random() - 0.5);
}

// ─── Mock Fetchers with proper typing ───────────────────────────
function filterByDateRange<T extends object>(
  items: T[],
  from?: Date,
  to?: Date,
  dateField: keyof T = "createdAt" as keyof T,
): T[] {
  if (!from && !to) return items;
  return items.filter((item) => {
    const date = (item as Record<string, unknown>)[dateField as string];
    if (!(date instanceof Date)) return true;
    if (from && date < from) return false;
    if (to && date > to) return false;
    return true;
  });
}

function filterByStatus<T extends object>(items: T[], status?: string): T[] {
  if (!status) return items;
  return items.filter((item) => {
    const itemStatus = (item as Record<string, unknown>).status;
    return typeof itemStatus === "string" && itemStatus === status;
  });
}

async function fetchMockTours(
  _companyId: Types.ObjectId,
  from?: Date,
  to?: Date,
  status?: string,
): Promise<MockTour[]> {
  let tours = generateMockTours(25);
  tours = filterByDateRange(tours, from, to, "createdAt");
  tours = filterByStatus(tours, status);
  return tours;
}

async function fetchMockEmployees(
  _companyId: Types.ObjectId,
  from?: Date,
  to?: Date,
  status?: string,
): Promise<MockEmployee[]> {
  let employees = generateMockEmployees(20);
  employees = filterByDateRange(employees, from, to, "createdAt");
  employees = filterByStatus(employees, status);
  return employees;
}

async function fetchMockReports(
  _companyId: Types.ObjectId,
  from?: Date,
  to?: Date,
  status?: string,
): Promise<MockReport[]> {
  let reports = generateMockReports(15);
  reports = filterByDateRange(reports, from, to, "createdAt");
  reports = filterByStatus(reports, status);
  return reports;
}

async function fetchMockReviews(
  _companyId: Types.ObjectId,
  from?: Date,
  to?: Date,
): Promise<MockReview[]> {
  let reviews = generateMockReviews(30);
  reviews = filterByDateRange(reviews, from, to, "createdAt");
  return reviews;
}

async function fetchMockBookings(
  _companyId: Types.ObjectId,
  from?: Date,
  to?: Date,
  status?: string,
): Promise<MockBooking[]> {
  let bookings = generateMockBookings(35);
  bookings = filterByDateRange(bookings, from, to, "createdAt");
  bookings = filterByStatus(bookings, status);
  return bookings;
}

async function fetchMockTransactions(
  _companyId: Types.ObjectId,
  from?: Date,
  to?: Date,
): Promise<MockTransaction[]> {
  let transactions = generateMockTransactions(25);
  transactions = filterByDateRange(transactions, from, to, "date");
  return transactions;
}

// ─── Inner handler (returns HandlerResult<string>) ───────────────
async function mockExportHandler(
  request: NextRequest,
): Promise<HandlerResult<string>> {
  // 1. Validate query parameters
  const rawParams = Object.fromEntries(request.nextUrl.searchParams);
  const validation = exportQuerySchema.safeParse(rawParams);
  if (!validation.success) {
    throw new ApiError(
      `Invalid query parameters: ${validation.error.message}`,
      400,
    );
  }
  const params: ExportQuery = validation.data;

  // 2. Fake company ID (no real auth needed)
  const companyId = new Types.ObjectId();

  // 3. Date range conversion
  let fromDate: Date | undefined;
  let toDate: Date | undefined;
  if (params.globalDateRangeFrom && params.globalDateRangeTo) {
    fromDate = new Date(params.globalDateRangeFrom);
    toDate = new Date(params.globalDateRangeTo);
  }

  // 4. Fetch mock data based on type – all branches return a specific type
  //    but we assign to a union type so arrayToCSV works.
  type ExportableRecord =
    | MockTour
    | MockEmployee
    | MockReport
    | MockReview
    | MockBooking
    | MockTransaction;

  let data: ExportableRecord[] = [];

  switch (params.type) {
    case "tours":
      data = await fetchMockTours(
        companyId,
        fromDate,
        toDate,
        params.tourStatus,
      );
      break;
    case "employees":
      data = await fetchMockEmployees(
        companyId,
        fromDate,
        toDate,
        params.employeeStatus,
      );
      break;
    case "reports":
      data = await fetchMockReports(
        companyId,
        fromDate,
        toDate,
        params.reportStatus,
      );
      break;
    case "reviews":
      data = await fetchMockReviews(companyId, fromDate, toDate);
      break;
    case "bookings":
      data = await fetchMockBookings(
        companyId,
        fromDate,
        toDate,
        params.bookingStatus,
      );
      break;
    case "transactions":
      data = await fetchMockTransactions(companyId, fromDate, toDate);
      break;
  }

  const csvString = arrayToCSV(data);
  return { data: csvString, status: 200 };
}

// ─── Exported GET handler wrapped with error handler ─────────────
export const GET = withErrorHandler(mockExportHandler);
