// app/api/dashboard/v1/export/route.ts
import { NextRequest } from "next/server";
import mongoose, { FilterQuery } from "mongoose";
import { z } from "zod";

import {
  withErrorHandler,
  ApiError,
  HandlerResult,
} from "@/lib/helpers/withErrorHandler";
import UserModel, { IUser } from "@/models/user.model";


import { Types } from "mongoose";
import { USER_ROLE } from "@/constants/current-user/user.const";
import { PAYROLL_STATUS } from "@/constants/employee/employee.const";
import {
  BOOKING_PAYMENT_STATUS,
  BOOKING_STATUS,
} from "@/constants/tour/tour-booking.const";
import { CURRENCY } from "@/constants/tour/tour.const";
import ConnectDB from "@/config/db";
import TourModel, { ITour } from "@/models/tours/tour.model";
import EmployeeModel, { IEmployee } from "@/models/employees/employees.model";
import { IReport, ReportModel } from "@/models/tours/report.model";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import BookingModel, { IBooking } from "@/models/tours/booking.model";
import { IReview, ReviewModel } from "@/models/tours/review.model";
import GuideModel, { IGuide } from "@/models/guide/guide.model";

// ─── CSV Helper (generic, no `any`) ──────────────────────────────
function arrayToCSV(data: object[], headers?: string[]): string {
  if (!data.length) return "";
  const cols = headers ?? Object.keys(data[0]);
  const rows = data.map((row) =>
    cols
      .map((field) => {
        const value = (row as Record<string, string>)[field];
        return JSON.stringify(value ?? "");
      })
      .join(","),
  );
  return [cols.join(","), ...rows].join("\n");
}

// ─── Zod schema for query parameters ──────────────────────────────
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

// ─── Strongly‑typed document interfaces ──────────────────────────
type ITourLean = Omit<ITour, keyof mongoose.Document>;
type IEmployeeLean = Omit<IEmployee, keyof mongoose.Document>;
type IReportLean = Omit<IReport, keyof mongoose.Document>;
type IReviewLean = Omit<IReview, keyof mongoose.Document>;
type IBookingLean = Omit<IBooking, keyof mongoose.Document>;

interface IBookingPaymentTx {
  type: "booking_payment";
  reference: string;
  amount: number;
  currency: string;
  status: string;
  date: Date;
  transactionId?: string;
}

interface IPayrollPaymentTx {
  type: "salary_payment";
  reference: string;
  amount: number;
  currency: string;
  status: string;
  date: Date;
  transactionId?: string;
  employeeId: Types.ObjectId;
}

type TransactionRecord = IBookingPaymentTx | IPayrollPaymentTx;

// ─── Company resolution (throws ApiError) ────────────────────────
async function resolveCompanyId(userId: string): Promise<Types.ObjectId> {
  const user = await UserModel.findById(userId).select("role").lean<IUser>();
  if (!user) throw new ApiError("User not found", 404);

  if (user.role === USER_ROLE.ASSISTANT) {
    const employee = await EmployeeModel.findOne({
      user: userId,
      deletedAt: null,
    })
      .select("companyId")
      .lean<IEmployee>();
    if (!employee?.companyId)
      throw new ApiError("No company assigned to assistant", 403);
    return employee.companyId;
  }

  if (user.role === USER_ROLE.GUIDE) {
    const guide = await GuideModel.findOne({
      "owner.user": userId,
      deletedAt: null,
    })
      .select("_id")
      .lean<IGuide>();
    if (!guide) throw new ApiError("No guide profile found", 404);
    return guide._id as Types.ObjectId;
  }

  throw new ApiError("Unauthorized role", 403);
}

// ─── Data fetchers (identical to original, typed) ────────────────
async function fetchTours(
  companyId: Types.ObjectId,
  from?: Date,
  to?: Date,
  status?: string,
): Promise<ITourLean[]> {
  const filter: FilterQuery<ITour> = { companyId, deletedAt: null };

  if (from) filter.createdAt = { ...filter.createdAt, $gte: from };
  if (to) filter.createdAt = { ...filter.createdAt, $lte: to };

  if (status) filter.status = status;

  return TourModel.find(filter).lean<ITourLean[]>();
}

async function fetchEmployees(
  companyId: Types.ObjectId,
  from?: Date,
  to?: Date,
  status?: string,
): Promise<IEmployeeLean[]> {
  const filter: FilterQuery<IEmployee> = { companyId, deletedAt: null };

  if (from) filter.createdAt = { ...filter.createdAt, $gte: from };
  if (to) filter.createdAt = { ...filter.createdAt, $lte: to };

  if (status) filter.status = status;
  return EmployeeModel.find(filter).lean<IEmployeeLean[]>();
}

async function fetchReports(
  companyId: Types.ObjectId,
  from?: Date,
  to?: Date,
  status?: string,
): Promise<IReportLean[]> {
  const tours = await TourModel.find({ companyId, deletedAt: null })
    .select("_id")
    .lean<Pick<ITour, "_id">[]>();
  const tourIds = tours.map((t) => t._id);

  const filter: FilterQuery<IReport> = {
    tour: { $in: tourIds },
    deletedAt: null,
  };

  if (from) filter.createdAt = { ...filter.createdAt, $gte: from };
  if (to) filter.createdAt = { ...filter.createdAt, $lte: to };

  if (status) filter.status = status;

  return ReportModel.find(filter).lean<IReportLean[]>();
}

async function fetchReviews(
  companyId: Types.ObjectId,
  from?: Date,
  to?: Date,
): Promise<IReviewLean[]> {
  const tours = await TourModel.find({ companyId, deletedAt: null })
    .select("_id")
    .lean<Pick<ITour, "_id">[]>();
  const tourIds = tours.map((t) => t._id);

  const filter: FilterQuery<IReview> = {
    tour: { $in: tourIds },
    deletedAt: null,
  };

  if (from) filter.createdAt = { ...filter.createdAt, $gte: from };
  if (to) filter.createdAt = { ...filter.createdAt, $lte: to };

  return ReviewModel.find(filter).lean<IReviewLean[]>();
}

async function fetchBookings(
  companyId: Types.ObjectId,
  from?: Date,
  to?: Date,
  status?: string,
): Promise<IBookingLean[]> {
  const tours = await TourModel.find({ companyId, deletedAt: null })
    .select("_id")
    .lean<Pick<ITour, "_id">[]>();
  const tourIds = tours.map((t) => t._id);

  const filter: FilterQuery<IBooking> = {
    tour: { $in: tourIds },
    deletedAt: null,
  };

  if (from) filter.createdAt = { ...filter.createdAt, $gte: from };
  if (to) filter.createdAt = { ...filter.createdAt, $lte: to };

  if (status) filter.status = status;

  return BookingModel.find(filter).lean<IBookingLean[]>();
}

async function fetchTransactions(
  companyId: Types.ObjectId,
  from?: Date,
  to?: Date,
): Promise<TransactionRecord[]> {
  const tours = await TourModel.find({ companyId, deletedAt: null })
    .select("_id")
    .lean<Pick<ITour, "_id">[]>();
  const tourIds = tours.map((t) => t._id);

  const bookingFilter: FilterQuery<IBooking> = {
    tour: { $in: tourIds },
    "payment.status": BOOKING_PAYMENT_STATUS.PAID,
    "payment.paidAt": { $gte: from, $lte: to },
    deletedAt: null,
  };
  const bookings = await BookingModel.find(bookingFilter)
    .select("bookingReference payment totalPaid createdAt")
    .lean<
      Pick<
        IBooking,
        "bookingReference" | "payment" | "totalPaid" | "createdAt"
      >[]
    >();

  const bookingTx: IBookingPaymentTx[] = bookings.map((b) => ({
    type: "booking_payment",
    reference: b.bookingReference,
    amount: b.totalPaid,
    currency: CURRENCY.BDT,
    status: BOOKING_STATUS.COMPLETED,
    date: b.payment.paidAt ?? b.createdAt,
    transactionId: b.payment.transactionId,
  }));

  const employees = await EmployeeModel.find({
    companyId,
    deletedAt: null,
  }).lean<(IEmployeeLean & { _id: Types.ObjectId })[]>();

  const payrollTx: IPayrollPaymentTx[] = [];
  for (const emp of employees) {
    if (!emp.payroll?.length) continue;
    for (const payroll of emp.payroll) {
      if (
        payroll.status === PAYROLL_STATUS.PAID &&
        payroll.paidAt &&
        (!from || payroll.paidAt >= from) &&
        (!to || payroll.paidAt <= to)
      ) {
        payrollTx.push({
          type: "salary_payment",
          reference: emp._id.toString(),
          amount: payroll.amount,
          currency: payroll.currency,
          status: payroll.status,
          date: payroll.paidAt,
          transactionId: payroll.transactionRef,
          employeeId: emp._id as Types.ObjectId,
        });
      }
    }
  }

  return [...bookingTx, ...payrollTx];
}

// ─── Inner handler (returns HandlerResult<string>) ────────────────
async function exportHandler(
  request: NextRequest,
): Promise<HandlerResult<{ csvContent: string }>> {
  await ConnectDB();

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

  // 2. Authentication
  const userId = await getUserIdFromSession();
  if (!userId) {
    throw new ApiError("Unauthorized", 401);
  }

  // 3. Authorization + company resolution
  const companyId = await resolveCompanyId(userId);

  // 4. Date range conversion (Zod already ensures valid ISO strings)
  let fromDate: Date | undefined;
  let toDate: Date | undefined;
  if (params.globalDateRangeFrom && params.globalDateRangeTo) {
    fromDate = new Date(params.globalDateRangeFrom);
    toDate = new Date(params.globalDateRangeTo);
  }

  // 5. Fetch data based on type
  type ExportableRecord =
    | ITourLean
    | IEmployeeLean
    | IReportLean
    | IReviewLean
    | IBookingLean
    | TransactionRecord;

  let data: ExportableRecord[] = [];

  switch (params.type) {
    case "tours":
      data = await fetchTours(companyId, fromDate, toDate, params.tourStatus);
      break;
    case "employees":
      data = await fetchEmployees(
        companyId,
        fromDate,
        toDate,
        params.employeeStatus,
      );
      break;
    case "reports":
      data = await fetchReports(
        companyId,
        fromDate,
        toDate,
        params.reportStatus,
      );
      break;
    case "reviews":
      data = await fetchReviews(companyId, fromDate, toDate);
      break;
    case "bookings":
      data = await fetchBookings(
        companyId,
        fromDate,
        toDate,
        params.bookingStatus,
      );
      break;
    case "transactions":
      data = await fetchTransactions(companyId, fromDate, toDate);
      break;
  }

  const csvString = arrayToCSV(data);
  const base64Csv = Buffer.from(csvString, "utf-8").toString("base64");
  return { data: { csvContent: base64Csv }, status: 200 };
}

// ─── Exported GET handler wrapped with error handler ─────────────
export const GET = withErrorHandler(exportHandler);
