// src/app/api/dashboard/v1/search/route.ts

import { NextRequest } from "next/server";
import UserModel from "@/models/user.model";
import { sanitizeSearch } from "@/lib/helpers/sanitize-search";
import { redisCache } from "@/lib/upstash-redis/redis-cache";
import TourModel from "@/models/tours/tour.model";
import { Types } from "mongoose";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";
import ConnectDB from "@/config/db";
import { USER_ROLE } from "@/constants/current-user/user.const";
import EmployeeModel from "@/models/employees/employees.model";
import { EMPLOYEE_STATUS } from "@/constants/employee/employee.const";
import { getCollectionName } from "@/lib/helpers/get-collection-name";
import GuideModel from "@/models/guide/guide.model"; // adjust import path as needed
import BookingModel from "@/models/tours/booking.model";
import { ReviewModel } from "@/models/tours/review.model";
import { ReportModel } from "@/models/tours/report.model";
import { TourFAQModel } from "@/models/tours/tourFAQ.model";

// Limits per collection
const LIMIT = 5;

// ---------------------------------------------------------------------------
// Shared result shape
// ---------------------------------------------------------------------------

interface SearchResult {
    /** Human-readable label shown in the UI */
    title: string;
    /** The model/source that produced this hit, e.g. "Tour", "Booking" */
    source: string;
    /** Always "/operations/tours/" for tour-related results */
    route: string;
    /** Array of path segments appended to route, e.g. [tourId] */
    ids: string[];
}

// ---------------------------------------------------------------------------
// Helper: case-insensitive regex from a sanitised query string
// ---------------------------------------------------------------------------
const buildRegex = (sanitized: string) =>
    new RegExp(sanitized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

// ---------------------------------------------------------------------------
// Helper: resolve companyId from the current user
//   - GUIDE  → Guide._id  (the guide doc whose owner.user === userId)
//   - ASSISTANT → Employee.companyId  (the employee doc whose user === userId)
// ---------------------------------------------------------------------------
async function resolveCompanyId(userId: Types.ObjectId): Promise<Types.ObjectId> {
    const user = await UserModel.findById(userId).select("role").lean();
    if (!user) throw new ApiError("User not found", 404);

    if (user.role === USER_ROLE.GUIDE) {
        const guide = await GuideModel.findOne({ "owner.user": userId })
            .select("_id")
            .lean();
        if (!guide) throw new ApiError("Guide profile not found", 404);
        return guide._id as Types.ObjectId;
    }

    if (user.role === USER_ROLE.ASSISTANT) {
        const employee = await EmployeeModel.findOne({ user: userId })
            .select("companyId")
            .lean();
        if (!employee?.companyId)
            throw new ApiError("Employee profile or companyId not found", 404);
        return employee.companyId as Types.ObjectId;
    }

    throw new ApiError("Unsupported user role for this endpoint", 403);
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export const GET = withErrorHandler(async (request: NextRequest) => {
    // 1. Authentication
    const userId = await getUserIdFromSession();
    if (!userId) throw new ApiError("Unauthorized", 401);

    await ConnectDB();

    // 2. Authorization – guide or assistant only
    await VERIFY_USER_ROLE.MULTIPLE(userId, [USER_ROLE.GUIDE, USER_ROLE.ASSISTANT]);

    // 3. Resolve the company this user belongs to
    const companyId = await resolveCompanyId(new Types.ObjectId(userId));

    // 4. Query parameter
    const { searchParams } = request.nextUrl;
    const rawQuery = searchParams.get("q");
    if (!rawQuery) throw new ApiError("Missing search query parameter 'q'", 400);

    // 5. Sanitize input
    const sanitized = sanitizeSearch(rawQuery);
    if (!sanitized) return { data: { results: [] } };

    // 6. Redis cache – keyed per company so results are fully isolated
    const cacheKey = `bd-travel-spirit-guide-system:search:company:${companyId.toString()}:${sanitized}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
        let results: SearchResult[] | undefined;
        if (typeof cached === "string") {
            try { results = JSON.parse(cached); }
            catch { await redisCache.del(cacheKey); }
        } else {
            results = cached as SearchResult[];
        }
        if (results) return { data: { results } };
    }

    // 7. Build regex once; run all six searches in parallel
    const pattern = buildRegex(sanitized);

    const [tourResults, bookingResults, reviewResults, reportResults, faqResults, employeeResults] =
        await Promise.all([
            searchTours(pattern, companyId),
            searchBookings(pattern, companyId),
            searchReviews(pattern, companyId),
            searchReports(pattern, companyId),
            searchFAQs(pattern, companyId),
            searchEmployees(pattern, companyId),
        ]);

    // 8. Merge — all tour-related results come first, employees last
    const results: SearchResult[] = [
        ...tourResults,
        ...bookingResults,
        ...reviewResults,
        ...reportResults,
        ...faqResults,
        ...employeeResults,
    ];

    // 9. Cache for 120 s
    await redisCache.set(cacheKey, JSON.stringify(results), 120);

    return { data: { results } };
});

// ---------------------------------------------------------------------------
// Per-model search helpers
// ---------------------------------------------------------------------------

/**
 * Tours — search title, summary, tags.
 * tourId is the document's own _id.
 */
async function searchTours(
    regex: RegExp,
    companyId: Types.ObjectId,
): Promise<SearchResult[]> {
    const tours = await TourModel.find({
        companyId,
        deletedAt: null,
        $or: [
            { title: { $regex: regex } },
            { summary: { $regex: regex } },
            { tags: { $regex: regex } },
        ],
    })
        .select("_id title")
        .limit(LIMIT)
        .lean();

    return tours.map((tour) => ({
        title: tour.title,
        source: "Tour",
        route: "/operations/tours/",
        ids: [(tour._id as Types.ObjectId).toString()],
    }));
}

/**
 * Bookings — search bookingReference, uniqueTourCode.
 * We join to Tour to confirm the booking belongs to this company,
 * then surface the tourId so the UI can navigate to the tour page.
 */
async function searchBookings(
    regex: RegExp,
    companyId: Types.ObjectId,
): Promise<SearchResult[]> {
    // Fetch all tour IDs that belong to this company (lightweight — just _id)
    const companyTourIds = await TourModel.find({ companyId, deletedAt: null })
        .select("_id")
        .lean()
        .then((tours) => tours.map((t) => t._id));

    if (companyTourIds.length === 0) return [];

    const bookings = await BookingModel.find({
        deletedAt: null,
        tour: { $in: companyTourIds },
        $or: [
            { bookingReference: { $regex: regex } },
            { uniqueTourCode: { $regex: regex } },
        ],
    })
        .select("_id bookingReference tour")
        .limit(LIMIT)
        .lean();

    return bookings.map((booking) => ({
        title: `Booking · ${booking.bookingReference}`,
        source: "Booking",
        route: "/operations/tours/",
        ids: [(booking.tour as Types.ObjectId).toString()],
    }));
}

/**
 * Reviews — search title, comment.
 * We scope by joining through TourModel (companyId filter on the tour side).
 */
async function searchReviews(
    regex: RegExp,
    companyId: Types.ObjectId,
): Promise<SearchResult[]> {
    const companyTourIds = await TourModel.find({ companyId, deletedAt: null })
        .select("_id")
        .lean()
        .then((tours) => tours.map((t) => t._id));

    if (companyTourIds.length === 0) return [];

    const reviews = await ReviewModel.find({
        deletedAt: null,
        tour: { $in: companyTourIds },
        $or: [
            { title: { $regex: regex } },
            { comment: { $regex: regex } },
        ],
    })
        .select("_id title comment tour")
        .limit(LIMIT)
        .lean();

    return reviews.map((review) => ({
        // Prefer the review's own title; fall back to a truncated comment snippet
        title: `Review · ${review.title ?? (review.comment as string).slice(0, 60)}`,
        source: "Review",
        route: "/operations/tours/",
        ids: [(review.tour as Types.ObjectId).toString()],
    }));
}

/**
 * Reports — search message, reason, tags.
 * Scoped to this company's tours.
 */
async function searchReports(
    regex: RegExp,
    companyId: Types.ObjectId,
): Promise<SearchResult[]> {
    const companyTourIds = await TourModel.find({ companyId, deletedAt: null })
        .select("_id")
        .lean()
        .then((tours) => tours.map((t) => t._id));

    if (companyTourIds.length === 0) return [];

    const reports = await ReportModel.find({
        deletedAt: null,
        tour: { $in: companyTourIds },
        $or: [
            { message: { $regex: regex } },
            { reason: { $regex: regex } },
            { tags: { $regex: regex } },
        ],
    })
        .select("_id message reason tour")
        .limit(LIMIT)
        .lean();

    return reports.map((report) => ({
        title: `Report · ${report.reason} — ${(report.message as string).slice(0, 50)}`,
        source: "Report",
        route: "/operations/tours/",
        ids: [(report.tour as Types.ObjectId).toString()],
    }));
}

/**
 * Tour FAQs — search question, answer.
 * Scoped to this company's tours.
 */
async function searchFAQs(
    regex: RegExp,
    companyId: Types.ObjectId,
): Promise<SearchResult[]> {
    const companyTourIds = await TourModel.find({ companyId, deletedAt: null })
        .select("_id")
        .lean()
        .then((tours) => tours.map((t) => t._id));

    if (companyTourIds.length === 0) return [];

    const faqs = (await TourFAQModel.find({
        deletedAt: null,
        tour: { $in: companyTourIds },
        $or: [
            { question: { $regex: regex } },
            { answer: { $regex: regex } },
        ],
    })
        .select("_id question tour")
        .limit(LIMIT)
        .lean()) as unknown as { _id: Types.ObjectId; question: string; tour: Types.ObjectId }[];

    return faqs.map((faq) => ({
        title: `FAQ · ${faq.question.slice(0, 80)}`,
        source: "TourFAQ",
        route: "/operations/tours/",
        ids: [faq.tour.toString()],
    }));
}

/**
 * Employees — search by linked User's name.
 * Scoped to this company. Routes to the employee detail page.
 */
async function searchEmployees(
    regex: RegExp,
    companyId: Types.ObjectId,
): Promise<SearchResult[]> {
    const employees = await EmployeeModel.aggregate([
        {
            $match: {
                companyId,
                deletedAt: null,
                status: EMPLOYEE_STATUS.ACTIVE,
            },
        },
        {
            $lookup: {
                from: getCollectionName(UserModel),
                localField: "user",
                foreignField: "_id",
                as: "userDoc",
            },
        },
        { $unwind: "$userDoc" },
        {
            $match: { "userDoc.name": { $regex: regex } },
        },
        { $limit: LIMIT },
        {
            $project: {
                _id: 1,
                name: "$userDoc.name",
            },
        },
    ]);

    return employees.map((emp) => ({
        title: emp.name,
        source: "Employee",
        route: "/users/employees/",
        ids: [(emp._id as Types.ObjectId).toString()],
    }));
}