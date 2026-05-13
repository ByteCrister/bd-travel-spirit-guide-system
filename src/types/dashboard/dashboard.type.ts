// types/dashboard.type.ts
import { TourStatus } from '@/constants/tour/tour.const';
import { EmployeeStatus } from '@/constants/employee/employee.const';
import { BookingStatus, BookingPaymentStatus } from '@/constants/tour/tour-booking.const';
import { ReportStatus } from '@/constants/tour/report.const';
import { ModerationStatus } from '@/constants/tour/tour.const';
import { Currency } from '@/constants/tour/tour.const';

// ============================================================================
//  Core Entity Summaries (what the dashboard shows)
// ============================================================================

export interface TourSummary {
    _id: string;
    title: string;
    slug: string;
    status: TourStatus;
    uniqueTourCode: string;
    basePrice: { amount: number; currency: Currency };
    createdAt: Date;
    updatedAt: Date;
}

export interface ReviewSummary {
    _id: string;
    tour: { _id: string; title: string };
    user: { _id: string; name: string; avatar?: string };
    rating: number;
    comment: string;
    isApproved: boolean;
    createdAt: Date;
}

export interface BookingSummary {
    _id: string;
    bookingReference: string;
    traveler: { _id: string; name: string; email: string };
    tour: { _id: string; title: string };
    totalParticipants: number;
    totalPaid: number;
    currency: Currency;
    status: BookingStatus;
    paymentStatus: BookingPaymentStatus;
    bookedAt: Date;
}

export interface ReportSummary {
    _id: string;
    reporter: { _id: string; name: string };
    tour: { _id: string; title: string };
    reason: string;
    message: string;
    status: ReportStatus;
    priority: string;
    createdAt: Date;
}

export interface FAQSummary {
    _id: string;
    tour: { _id: string; title: string };
    question: string;
    answer?: string;
    status: ModerationStatus;
    likeCount: number;
    dislikeCount: number;
    createdAt: Date;
}

export interface RefundSummary {
    _id: string;
    booking: string;
    amount: number;
    currency: Currency;
    status: BookingPaymentStatus;
    requestedAt: Date;
    processedAt?: Date;
}

export interface RunningTourInfo {
    tourId: string;
    slug: string;
    title: string;
    totalSeats: number;           // sum of seatsTotal across active departures
    currentBookings: number;      // sum of seatsBooked
    windowStart: Date;             // earliest departure date
    windowEnd: Date;               // latest departure date
}

export interface EmployeeSummary {
    _id: string;
    user: { _id: string; name: string; email: string };
    status: EmployeeStatus;
    employmentType?: string;
    salary: number;
    currency: Currency;
    dateOfJoining: Date;
}

export interface CompanyInfo {
    _id: string;
    companyName: string;
    logoUrl?: string;              // URL of the logo asset
    createdAt: Date;
    address?: {
        country?: string;
        division?: string;
        city?: string;
        zip?: string;
        street?: string;
    };
    owner: OwnerInfo;
}

export interface OwnerInfo {
    user: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
        createdAt: Date;
    };
    phone?: string;
    oauthProvider?: string;
}

export interface Transaction {
    _id: string;
    bookingReference: string;
    amount: number;
    currency: Currency;
    method: string;
    status: BookingPaymentStatus;
    paidAt?: Date;
    createdAt: Date;
}

// ============================================================================
//  Filter & Date Range
// ============================================================================

export interface DateRange {
    from: Date;
    to: Date;
}

export interface DashboardFilters {
    /** Default window for export CSV and bulk reset */
    globalDateRange: DateRange;

    /** KPIs + charts (bookings / reviews series use this range on the server) */
    statsDateRange: DateRange;

    tourStatus?: TourStatus;
    employeeStatus?: EmployeeStatus;
    reportStatus?: ReportStatus;
    bookingStatus?: BookingStatus;

    toursDateRange: DateRange;
    reviewsDateRange: DateRange;
    bookingsDateRange: DateRange;
    reportsDateRange: DateRange;
    employeesDateRange: DateRange;
    runningToursDateRange: DateRange;
    faqsDateRange: DateRange;
    refundsDateRange: DateRange;
    transactionsDateRange: DateRange;
}

export const DASHBOARD_TAB_IDS = [
    'tours',
    'bookings',
    'reviews',
    'reports',
    'employees',
    'running',
    'faqs',
    'refunds',
] as const;

export type DashboardTabId = (typeof DASHBOARD_TAB_IDS)[number];

// ============================================================================
//  API Response Wrappers (matching the backend structure)
// ============================================================================

export interface ApiPaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
    nextCursor?: string;          // for cursor-based pagination (transactions)
}

export interface DashboardStats {
    totalTours: number;
    totalBookings: number;
    totalRevenue: number;
    pendingReports: number;
    averageRating: number;
    activeEmployees: number;
}

/** Response from `GET .../stats` */
export interface DashboardStatsBundle {
    stats: DashboardStats;
    bookingsForCharts: BookingSummary[];
    reviewsForCharts: ReviewSummary[];
}

export interface DashboardData {
    stats: DashboardStats;
    tours: TourSummary[];
    reviews: ReviewSummary[];
    bookings: BookingSummary[];
    reports: ReportSummary[];
    faqs: FAQSummary[];
    refunds: RefundSummary[];
    runningTours: RunningTourInfo[];
    employees: EmployeeSummary[];
    companyInfo: CompanyInfo;
    ownerInfo: OwnerInfo;
    recentTransactions: ApiPaginatedResponse<Transaction>;
}

/** Tab tables only (composed on the client) */
export type DashboardTablesData = Pick<
    DashboardData,
    'tours' | 'bookings' | 'reviews' | 'reports' | 'faqs' | 'refunds' | 'runningTours' | 'employees'
>;