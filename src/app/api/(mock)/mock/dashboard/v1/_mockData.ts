import { faker } from '@faker-js/faker';
import type {
    BookingSummary,
    CompanyInfo,
    DashboardStats,
    EmployeeSummary,
    FAQSummary,
    OwnerInfo,
    RefundSummary,
    ReportSummary,
    ReviewSummary,
    RunningTourInfo,
    TourSummary,
    Transaction,
} from '@/types/dashboard/dashboard.type';
import { CURRENCY, MODERATION_STATUS, TOUR_STATUS } from '@/constants/tour/tour.const';
import { EMPLOYEE_STATUS } from '@/constants/employee/employee.const';
import { REPORT_STATUS } from '@/constants/tour/report.const';
import { BOOKING_PAYMENT_STATUS, BOOKING_STATUS } from '@/constants/tour/tour-booking.const';

export function isInRange(date: Date, from?: Date, to?: Date): boolean {
    if (!from && !to) return true;
    if (from && date < from) return false;
    if (to && date > to) return false;
    return true;
}

function generateMockTours(count: number = 80): TourSummary[] {
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

function generateMockReviews(count: number = 150): ReviewSummary[] {
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

function generateMockBookings(count: number = 120): BookingSummary[] {
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

function generateMockReports(count: number = 40): ReportSummary[] {
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

function generateMockFAQs(count: number = 60): FAQSummary[] {
    return Array.from({ length: count }, () => ({
        _id: faker.string.uuid(),
        tour: {
            _id: faker.string.uuid(),
            title: faker.company.catchPhrase(),
        },
        question: `${faker.lorem.sentence()}?`,
        answer: faker.datatype.boolean(0.7) ? faker.lorem.paragraph() : undefined,
        status: faker.helpers.arrayElement(Object.values(MODERATION_STATUS)),
        likeCount: faker.number.int({ min: 0, max: 100 }),
        dislikeCount: faker.number.int({ min: 0, max: 50 }),
        createdAt: faker.date.past({ years: 1 }),
    }));
}

function generateMockRefunds(count: number = 35): RefundSummary[] {
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

function generateMockRunningTours(count: number = 12): RunningTourInfo[] {
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

function generateMockEmployees(count: number = 50): EmployeeSummary[] {
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

export function generateMockCompanyInfo(): CompanyInfo {
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

export function generateMockOwnerInfo(): OwnerInfo {
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

export function generateMockTransactions(count: number = 250): Transaction[] {
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

export type MasterMockData = {
    tours: TourSummary[];
    reviews: ReviewSummary[];
    bookings: BookingSummary[];
    reports: ReportSummary[];
    faqs: FAQSummary[];
    refunds: RefundSummary[];
    runningTours: RunningTourInfo[];
    employees: EmployeeSummary[];
    transactions: Transaction[];
};

let cached: MasterMockData | null = null;

/** Stable pool so separate mock routes see the same underlying universe */
export function getMasterMockData(): MasterMockData {
    if (!cached) {
        faker.seed(42_424_242);
        cached = {
            tours: generateMockTours(80),
            reviews: generateMockReviews(150),
            bookings: generateMockBookings(120),
            reports: generateMockReports(40),
            faqs: generateMockFAQs(60),
            refunds: generateMockRefunds(35),
            runningTours: generateMockRunningTours(12),
            employees: generateMockEmployees(50),
            transactions: generateMockTransactions(250),
        };
    }
    return cached;
}

export function computeDashboardStats(
    filteredTours: TourSummary[],
    filteredBookings: BookingSummary[],
    filteredReviews: ReviewSummary[],
    filteredReports: ReportSummary[],
    filteredEmployees: EmployeeSummary[],
): DashboardStats {
    return {
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
}

let profileCache: { companyInfo: CompanyInfo; ownerInfo: OwnerInfo } | null = null;

export function getProfileMock(): { companyInfo: CompanyInfo; ownerInfo: OwnerInfo } {
    if (!profileCache) {
        faker.seed(99_887_766);
        profileCache = {
            companyInfo: generateMockCompanyInfo(),
            ownerInfo: generateMockOwnerInfo(),
        };
    }
    return profileCache;
}
