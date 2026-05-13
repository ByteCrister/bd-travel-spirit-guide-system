// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { faker } from '@faker-js/faker';
import type {
    DashboardData,
    DashboardStats,
    TourSummary,
    ReviewSummary,
    BookingSummary,
    ReportSummary,
    FAQSummary,
    RefundSummary,
    RunningTourInfo,
    EmployeeSummary,
    CompanyInfo,
    OwnerInfo,
    Transaction,
    ApiPaginatedResponse,
} from '@/types/dashboard/dashboard.type';
import { CURRENCY, MODERATION_STATUS, TOUR_STATUS } from '@/constants/tour/tour.const';
import { EMPLOYEE_STATUS } from '@/constants/employee/employee.const';
import { REPORT_STATUS } from '@/constants/tour/report.const';
import { BOOKING_PAYMENT_STATUS, BOOKING_STATUS } from '@/constants/tour/tour-booking.const';

// ============================================================================
// Validation Schemas (same as before)
// ============================================================================

const dashboardQuerySchema = z.object({
    globalDateRangeFrom: z.string().transform((str) => new Date(str)),
    globalDateRangeTo: z.string().transform((str) => new Date(str)),
    toursDateRangeFrom: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
    toursDateRangeTo: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
    reviewsDateRangeFrom: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
    reviewsDateRangeTo: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
    bookingsDateRangeFrom: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
    bookingsDateRangeTo: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
    reportsDateRangeFrom: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
    reportsDateRangeTo: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
    employeesDateRangeFrom: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
    employeesDateRangeTo: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
    transactionsDateRangeFrom: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
    transactionsDateRangeTo: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
    tourStatus: z.nativeEnum(TOUR_STATUS).optional(),
    employeeStatus: z.nativeEnum(EMPLOYEE_STATUS).optional(),
    reportStatus: z.nativeEnum(REPORT_STATUS).optional(),
    bookingStatus: z.nativeEnum(BOOKING_STATUS).optional(),
    transactionsCursor: z.string().optional(),
    transactionsLimit: z.coerce.number().min(1).max(100).default(20),
});

// ============================================================================
// Mock Data Generators
// ============================================================================

// Helper to filter by date range
function isInRange(date: Date, from?: Date, to?: Date): boolean {
    if (!from && !to) return true;
    if (from && date < from) return false;
    if (to && date > to) return false;
    return true;
}

// Generate a list of tours with random dates
function generateMockTours(count: number = 50): TourSummary[] {
    return Array.from({ length: count }, () => ({
        _id: faker.string.uuid(),
        title: faker.company.catchPhrase(),
        slug: faker.helpers.slugify(faker.company.catchPhrase()).toLowerCase(),
        status: faker.helpers.arrayElement(Object.values(TOUR_STATUS)),
        uniqueTourCode: faker.string.alphanumeric(8).toUpperCase(),
        basePrice: {
            amount: faker.number.int({ min: 100, max: 5000 }),
            currency: faker.helpers.arrayElement(Object.values(CURRENCY)),
        },
        createdAt: faker.date.past({ years: 2 }),
        updatedAt: faker.date.recent(),
    }));
}

function generateMockReviews(count: number = 100): ReviewSummary[] {
    return Array.from({ length: count }, () => ({
        _id: faker.string.uuid(),
        tour: {
            _id: faker.string.uuid(),
            title: faker.company.catchPhrase(),
        },
        user: {
            _id: faker.string.uuid(),
            name: faker.person.fullName(),
            avatar: faker.image.avatar(),
        },
        rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
        comment: faker.lorem.paragraph(),
        isApproved: faker.datatype.boolean(0.8),
        createdAt: faker.date.past({ years: 1 }),
    }));
}

function generateMockBookings(count: number = 100): BookingSummary[] {
    return Array.from({ length: count }, () => ({
        _id: faker.string.uuid(),
        bookingReference: faker.string.alphanumeric(10).toUpperCase(),
        traveler: {
            _id: faker.string.uuid(),
            name: faker.person.fullName(),
            email: faker.internet.email(),
        },
        tour: {
            _id: faker.string.uuid(),
            title: faker.company.catchPhrase(),
        },
        totalParticipants: faker.number.int({ min: 1, max: 20 }),
        totalPaid: faker.number.int({ min: 100, max: 10000 }),
        currency: faker.helpers.arrayElement(Object.values(CURRENCY)),
        status: faker.helpers.arrayElement(Object.values(BOOKING_STATUS)),
        paymentStatus: faker.helpers.arrayElement(Object.values(BOOKING_PAYMENT_STATUS)),
        bookedAt: faker.date.past({ years: 1 }),
    }));
}

function generateMockReports(count: number = 30): ReportSummary[] {
    return Array.from({ length: count }, () => ({
        _id: faker.string.uuid(),
        reporter: {
            _id: faker.string.uuid(),
            name: faker.person.fullName(),
        },
        tour: {
            _id: faker.string.uuid(),
            title: faker.company.catchPhrase(),
        },
        reason: faker.lorem.sentence(),
        message: faker.lorem.paragraph(),
        status: faker.helpers.arrayElement(Object.values(REPORT_STATUS)),
        priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
        createdAt: faker.date.past({ years: 1 }),
    }));
}

function generateMockFAQs(count: number = 50): FAQSummary[] {
    return Array.from({ length: count }, () => ({
        _id: faker.string.uuid(),
        tour: {
            _id: faker.string.uuid(),
            title: faker.company.catchPhrase(),
        },
        question: faker.lorem.sentence() + '?',
        answer: faker.datatype.boolean(0.7) ? faker.lorem.paragraph() : undefined,
        status: faker.helpers.arrayElement(Object.values(MODERATION_STATUS)),
        likeCount: faker.number.int({ min: 0, max: 100 }),
        dislikeCount: faker.number.int({ min: 0, max: 50 }),
        createdAt: faker.date.past({ years: 1 }),
    }));
}

function generateMockRefunds(count: number = 30): RefundSummary[] {
    return Array.from({ length: count }, () => ({
        _id: faker.string.uuid(),
        booking: faker.string.uuid(),
        amount: faker.number.int({ min: 50, max: 5000 }),
        currency: faker.helpers.arrayElement(Object.values(CURRENCY)),
        status: faker.helpers.arrayElement(Object.values(BOOKING_PAYMENT_STATUS)),
        requestedAt: faker.date.past({ years: 1 }),
        processedAt: faker.datatype.boolean(0.6) ? faker.date.recent() : undefined,
    }));
}

function generateMockRunningTours(count: number = 10): RunningTourInfo[] {
    const now = new Date();
    return Array.from({ length: count }, () => ({
        tourId: faker.string.uuid(),
        slug: faker.helpers.slugify(faker.company.catchPhrase()).toLowerCase(),
        title: faker.company.catchPhrase(),
        totalSeats: faker.number.int({ min: 20, max: 200 }),
        currentBookings: faker.number.int({ min: 0, max: 150 }),
        windowStart: faker.date.between({ from: now, to: faker.date.future({ years: 1 }) }),
        windowEnd: faker.date.future({ years: 2 }),
    }));
}

function generateMockEmployees(count: number = 40): EmployeeSummary[] {
    return Array.from({ length: count }, () => ({
        _id: faker.string.uuid(),
        user: {
            _id: faker.string.uuid(),
            name: faker.person.fullName(),
            email: faker.internet.email(),
        },
        status: faker.helpers.arrayElement(Object.values(EMPLOYEE_STATUS)),
        employmentType: faker.helpers.arrayElement(['full-time', 'part-time', 'contract']),
        salary: faker.number.int({ min: 30000, max: 120000 }),
        currency: faker.helpers.arrayElement(Object.values(CURRENCY)),
        dateOfJoining: faker.date.past({ years: 5 }),
    }));
}

function generateMockCompanyInfo(): CompanyInfo {
    return {
        _id: faker.string.uuid(),
        companyName: faker.company.name(),
        logoUrl: faker.image.url(),
        createdAt: faker.date.past({ years: 5 }),
        address: {
            country: faker.location.country(),
            division: faker.location.state(),
            city: faker.location.city(),
            zip: faker.location.zipCode(),
            street: faker.location.streetAddress(),
        },
        owner: {
            user: {
                _id: faker.string.uuid(),
                name: faker.person.fullName(),
                email: faker.internet.email(),
                avatar: faker.image.avatar(),
                createdAt: faker.date.past({ years: 3 }),
            },
            phone: faker.phone.number(),
            oauthProvider: faker.helpers.arrayElement(['google', 'facebook', null]) ?? undefined,
        },
    };
}

function generateMockOwnerInfo(): OwnerInfo {
    return {
        user: {
            _id: faker.string.uuid(),
            name: faker.person.fullName(),
            email: faker.internet.email(),
            avatar: faker.image.avatar(),
            createdAt: faker.date.past({ years: 3 }),
        },
        phone: faker.phone.number(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        oauthProvider: faker.helpers.arrayElement(['google', 'facebook']) as any,
    };
}

function generateMockTransactions(count: number = 200): Transaction[] {
    return Array.from({ length: count }, () => ({
        _id: faker.string.uuid(),
        bookingReference: faker.string.alphanumeric(10).toUpperCase(),
        amount: faker.number.int({ min: 50, max: 5000 }),
        currency: faker.helpers.arrayElement(Object.values(CURRENCY)),
        method: faker.helpers.arrayElement(['credit_card', 'paypal', 'bank_transfer', 'cash']),
        status: faker.helpers.arrayElement(Object.values(BOOKING_PAYMENT_STATUS)),
        paidAt: faker.datatype.boolean(0.8) ? faker.date.past() : undefined,
        createdAt: faker.date.past({ years: 1 }),
    }));
}

// ============================================================================
// Main API Handler
// ============================================================================

export async function GET(request: NextRequest) {
    try {
        // Optional: uncomment for auth testing
        // const session = await getServerSession();
        // if (!session?.user) {
        //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        // Parse query params
        const searchParams = request.nextUrl.searchParams;
        const queryParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            queryParams[key] = value;
        });

        const validationResult = dashboardQuerySchema.safeParse(queryParams);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid query parameters', details: validationResult.error },
                { status: 400 },
            );
        }

        const params = validationResult.data;

        // Helper to extract date ranges
        const getRange = (
            fromProp?: Date,
            toProp?: Date,
        ): { from?: Date; to?: Date } => ({
            from: fromProp,
            to: toProp,
        });

        const globalRange = { from: params.globalDateRangeFrom, to: params.globalDateRangeTo };
        const toursRange = getRange(params.toursDateRangeFrom, params.toursDateRangeTo) || globalRange;
        const reviewsRange = getRange(params.reviewsDateRangeFrom, params.reviewsDateRangeTo) || globalRange;
        const bookingsRange = getRange(params.bookingsDateRangeFrom, params.bookingsDateRangeTo) || globalRange;
        const reportsRange = getRange(params.reportsDateRangeFrom, params.reportsDateRangeTo) || globalRange;
        const employeesRange = getRange(params.employeesDateRangeFrom, params.employeesDateRangeTo) || globalRange;
        const transactionsRange = getRange(params.transactionsDateRangeFrom, params.transactionsDateRangeTo) || globalRange;

        // Generate full mock datasets
        const allTours = generateMockTours(80);
        const allReviews = generateMockReviews(150);
        const allBookings = generateMockBookings(120);
        const allReports = generateMockReports(40);
        const allFAQs = generateMockFAQs(60);
        const allRefunds = generateMockRefunds(35);
        const allRunningTours = generateMockRunningTours(12);
        const allEmployees = generateMockEmployees(50);
        const allTransactions = generateMockTransactions(250);

        // Filter by date ranges and statuses
        const filteredTours = allTours.filter((tour) => {
            if (!isInRange(tour.createdAt, toursRange.from, toursRange.to)) return false;
            if (params.tourStatus && tour.status !== params.tourStatus) return false;
            return true;
        });

        const filteredReviews = allReviews.filter((review) =>
            isInRange(review.createdAt, reviewsRange.from, reviewsRange.to)
        );

        const filteredBookings = allBookings.filter((booking) => {
            if (!isInRange(booking.bookedAt, bookingsRange.from, bookingsRange.to)) return false;
            if (params.bookingStatus && booking.status !== params.bookingStatus) return false;
            return true;
        });

        const filteredReports = allReports.filter((report) => {
            if (!isInRange(report.createdAt, reportsRange.from, reportsRange.to)) return false;
            if (params.reportStatus && report.status !== params.reportStatus) return false;
            return true;
        });

        const filteredEmployees = allEmployees.filter((employee) => {
            if (!isInRange(employee.dateOfJoining, employeesRange.from, employeesRange.to)) return false;
            if (params.employeeStatus && employee.status !== params.employeeStatus) return false;
            return true;
        });

        // Filter transactions with date range + pagination
        const filteredTransactions = allTransactions.filter((tx) =>
            isInRange(tx.createdAt, transactionsRange.from, transactionsRange.to)
        );
        // Sort by createdAt desc (latest first)
        filteredTransactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        // Pagination (cursor: transaction _id)
        const limit = params.transactionsLimit;
        let startIndex = 0;
        if (params.transactionsCursor) {
            const cursorIndex = filteredTransactions.findIndex((tx) => tx._id === params.transactionsCursor);
            if (cursorIndex !== -1) startIndex = cursorIndex + 1;
        }
        const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + limit);
        const hasNextPage = startIndex + limit < filteredTransactions.length;
        const nextCursor = hasNextPage ? paginatedTransactions[paginatedTransactions.length - 1]?._id : undefined;

        const transactionsResponse: ApiPaginatedResponse<Transaction> = {
            data: paginatedTransactions,
            total: filteredTransactions.length,
            page: 1, // simplified, not used in cursor pagination
            limit,
            hasNextPage,
            nextCursor,
        };

        // Compute stats based on filtered data
        const stats: DashboardStats = {
            totalTours: filteredTours.length,
            totalBookings: filteredBookings.length,
            totalRevenue: filteredBookings
                .filter((b) => b.paymentStatus === BOOKING_PAYMENT_STATUS.PAID)
                .reduce((sum, b) => sum + b.totalPaid, 0),
            pendingReports: filteredReports.filter((r) => r.status === REPORT_STATUS.IN_REVIEW).length,
            averageRating: (() => {
                const approvedReviews = filteredReviews.filter((r) => r.isApproved);
                if (approvedReviews.length === 0) return 0;
                const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
                return parseFloat((sum / approvedReviews.length).toFixed(1));
            })(),
            activeEmployees: filteredEmployees.filter((e) => e.status === EMPLOYEE_STATUS.ACTIVE).length,
        };

        const dashboardData: DashboardData = {
            stats,
            tours: filteredTours.slice(0, 100), // limit for response size
            reviews: filteredReviews.slice(0, 100),
            bookings: filteredBookings.slice(0, 100),
            reports: filteredReports.slice(0, 100),
            faqs: allFAQs.slice(0, 100), // FAQs not filtered by date range in this mock (could be added)
            refunds: allRefunds.slice(0, 100),
            runningTours: allRunningTours,
            employees: filteredEmployees.slice(0, 100),
            companyInfo: generateMockCompanyInfo(),
            ownerInfo: generateMockOwnerInfo(),
            recentTransactions: transactionsResponse,
        };

        return NextResponse.json({ data: dashboardData });
    } catch (error) {
        console.error('Dashboard API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 },
        );
    }
}