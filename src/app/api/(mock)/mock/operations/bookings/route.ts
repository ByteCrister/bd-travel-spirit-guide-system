// app/api/(mock)/mock/operations/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import type {
    BookingsApiResponse,
    BookingsQueryParams,
    IBookingPopulated,
    PopulatedTraveler,
    PopulatedTour,
    IAppliedDiscount,
    IPayment,
    ICancellation,
    PaginationMeta,
} from '@/types/tour/booking.types';
import { BookingPaymentStatus, BookingStatus, BOOKING_STATUS, BOOKING_PAYMENT_STATUS } from '@/constants/tour/tour-booking.const';
import { TOUR_DISCOUNT_TYPE, TOUR_DISCOUNT, PAYMENT_METHOD } from '@/constants/tour/tour.const';

// ============================================
// SEED FOR CONSISTENT MOCK DATA
// ============================================
faker.seed(42);

// ============================================
// MOCK DATA POOLS
// ============================================
const generateTraveler = (id: string): PopulatedTraveler => ({
    _id: id,
    name: faker.person.fullName(),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    avatar: faker.string.uuid(),
    address: {
        district: faker.location.city(),
        division: faker.helpers.arrayElement(['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh']),
        upazila: faker.location.city(),
        area: faker.location.street(),
        house: faker.location.buildingNumber(),
        road: faker.location.street(),
        postalCode: faker.location.zipCode(),
    },
    isVerified: faker.datatype.boolean(0.7),
    accountStatus: faker.helpers.arrayElement(['active', 'inactive', 'suspended']),
});

const generateTour = (id: string): PopulatedTour => {
    const title = faker.company.catchPhrase();
    const uniqueTourCode = faker.string.alphanumeric(8).toUpperCase();
    const basePriceAmount = faker.number.int({ min: 2000, max: 25000 });
    return {
        _id: id,
        title,
        slug: faker.helpers.slugify(title.toLowerCase()),
        uniqueTourCode,
        basePrice: {
            amount: basePriceAmount,
            currency: 'BDT',
        },
        duration: {
            days: faker.number.int({ min: 1, max: 14 }),
            nights: faker.number.int({ min: 0, max: 13 }),
        },
        division: faker.helpers.arrayElement(['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh']),
        district: faker.location.city(),
        status: faker.helpers.arrayElement(['active', 'upcoming', 'completed', 'cancelled']),
        heroImage: faker.datatype.boolean(0.8) ? faker.string.uuid() : undefined,
        summary: faker.lorem.paragraph(),
    };
};

// Create pools (reused across bookings for realistic relationships)
const TRAVELERS_COUNT = 20;
const TOURS_COUNT = 15;

const travelersPool: PopulatedTraveler[] = Array.from({ length: TRAVELERS_COUNT }, (_, i) =>
    generateTraveler(faker.string.uuid())
);

const toursPool: PopulatedTour[] = Array.from({ length: TOURS_COUNT }, (_, i) =>
    generateTour(faker.string.uuid())
);

// ============================================
// BOOKING GENERATOR
// ============================================
const getRandomDiscount = (): IAppliedDiscount[] => {
    if (faker.datatype.boolean(0.3)) {
        const type = faker.helpers.enumValue(TOUR_DISCOUNT_TYPE);
        const discount = faker.helpers.enumValue(TOUR_DISCOUNT);
        return [
            {
                type,
                discount,
                value: type === TOUR_DISCOUNT_TYPE.PERCENTAGE
                    ? faker.number.int({ min: 5, max: 30 })
                    : faker.number.int({ min: 100, max: 2000 }),
            },
        ];
    }
    return [];
};

const generatePayment = (bookingStatus: BookingStatus): IPayment => {
    const method = faker.helpers.enumValue(PAYMENT_METHOD);
    let status: BookingPaymentStatus;

    if (bookingStatus === BOOKING_STATUS.CONFIRMED || bookingStatus === BOOKING_STATUS.COMPLETED) {
        status = BOOKING_PAYMENT_STATUS.PAID;
    } else if (bookingStatus === BOOKING_STATUS.CANCELLED) {
        status = faker.helpers.arrayElement([BOOKING_PAYMENT_STATUS.REFUNDED, BOOKING_PAYMENT_STATUS.FAILED]);
    } else if (bookingStatus === BOOKING_STATUS.REFUNDED) {
        status = BOOKING_PAYMENT_STATUS.REFUNDED;
    } else {
        status = BOOKING_PAYMENT_STATUS.PENDING;
    }

    return {
        method,
        transactionId: method !== PAYMENT_METHOD.CASH ? faker.string.alphanumeric(12).toUpperCase() : undefined,
        status,
        paidAt: status === BOOKING_PAYMENT_STATUS.PAID ? faker.date.recent() : undefined,
    };
};

const generateCancellation = (bookingStatus: BookingStatus): ICancellation | undefined => {
    if (bookingStatus === 'cancelled' || bookingStatus === 'refunded') {
        return {
            cancelledAt: faker.date.recent(),
            reason: faker.helpers.arrayElement([
                'Customer request',
                'Payment failed',
                'Tour operator cancelled',
                'Weather conditions',
                'Medical emergency',
            ]),
            cancelledBy: faker.string.uuid(),
            refundAmount: faker.number.int({ min: 500, max: 15000 }),
            refundStatus: bookingStatus === 'refunded' ? 'refunded' : 'failed',
        };
    }
    return undefined;
};

const calculateTotalPaid = (
    tour: PopulatedTour,
    totalParticipants: number,
    discounts: IAppliedDiscount[]
): number => {
    let total = tour.basePrice.amount * totalParticipants;
    for (const discount of discounts) {
        if (discount.type === 'percentage') {
            total = total * (1 - discount.value / 100);
        } else {
            total = Math.max(0, total - discount.value);
        }
    }
    return Math.round(total);
};

const generateBooking = (): IBookingPopulated => {
    const traveler = faker.helpers.arrayElement(travelersPool);
    const tour = faker.helpers.arrayElement(toursPool);
    const totalParticipants = faker.number.int({ min: 1, max: 10 });
    const discounts = getRandomDiscount();
    const totalPaid = calculateTotalPaid(tour, totalParticipants, discounts);
    const status = faker.helpers.weightedArrayElement<BookingStatus>([
        { value: 'pending', weight: 0.2 },
        { value: 'confirmed', weight: 0.4 },
        { value: 'cancelled', weight: 0.1 },
        { value: 'refunded', weight: 0.1 },
        { value: 'completed', weight: 0.2 },
    ]);

    const bookedAt = faker.date.past({ years: 1 });
    const createdAt = faker.date.past({ refDate: bookedAt });
    const updatedAt = faker.date.recent({ refDate: bookedAt });

    return {
        _id: faker.string.uuid(),
        bookingReference: `BK-${faker.date.recent().getFullYear()}-${faker.string.alphanumeric(8).toUpperCase()}`,
        uniqueTourCode: tour.uniqueTourCode,
        traveler,
        tour,
        totalParticipants,
        discounts,
        totalPaid,
        payment: generatePayment(status),
        status,
        expiresAt: status === 'pending' ? faker.date.future() : undefined,
        cancellation: generateCancellation(status),
        bookedAt,
        createdAt,
        updatedAt,
        deletedAt: undefined,
    };
};

// Generate 300 mock bookings
const MOCK_BOOKINGS: IBookingPopulated[] = Array.from({ length: 300 }, () =>
    generateBooking()
);

// ============================================
// HELPER FUNCTIONS FOR FILTERING/SORTING
// ============================================
const filterBookings = (
    bookings: IBookingPopulated[],
    params: BookingsQueryParams
): IBookingPopulated[] => {
    let filtered = [...bookings];

    // Filter by status (single or array)
    if (params.status) {
        const statuses = Array.isArray(params.status) ? params.status : [params.status];
        filtered = filtered.filter((b) => statuses.includes(b.status));
    }

    // Filter by payment status
    if (params.paymentStatus) {
        const paymentStatuses = Array.isArray(params.paymentStatus)
            ? params.paymentStatus
            : [params.paymentStatus];
        filtered = filtered.filter((b) => paymentStatuses.includes(b.payment.status));
    }

    // Search by bookingReference, traveler name/email, tour title
    if (params.search) {
        const searchLower = params.search.toLowerCase();
        filtered = filtered.filter(
            (b) =>
                b.bookingReference.toLowerCase().includes(searchLower) ||
                b.traveler.name.toLowerCase().includes(searchLower) ||
                b.traveler.email.toLowerCase().includes(searchLower) ||
                b.tour.title.toLowerCase().includes(searchLower)
        );
    }

    // Filter by date range
    if (params.fromDate) {
        const from = new Date(params.fromDate);
        filtered = filtered.filter((b) => b.bookedAt >= from);
    }
    if (params.toDate) {
        const to = new Date(params.toDate);
        filtered = filtered.filter((b) => b.bookedAt <= to);
    }

    // Filter by tour title (partial match)
    if (params.tourTitle) {
        const titleLower = params.tourTitle.toLowerCase();
        filtered = filtered.filter((b) => b.tour.title.toLowerCase().includes(titleLower));
    }

    return filtered;
};

const sortBookings = (
    bookings: IBookingPopulated[],
    sortBy?: BookingsQueryParams['sortBy'],
    sortOrder?: 'asc' | 'desc'
): IBookingPopulated[] => {
    if (!sortBy) return bookings;

    const sorted = [...bookings];
    const order = sortOrder === 'desc' ? -1 : 1;

    sorted.sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let aVal: any, bVal: any;
        switch (sortBy) {
            case 'bookedAt':
                aVal = a.bookedAt.getTime();
                bVal = b.bookedAt.getTime();
                break;
            case 'createdAt':
                aVal = a.createdAt.getTime();
                bVal = b.createdAt.getTime();
                break;
            case 'totalPaid':
                aVal = a.totalPaid;
                bVal = b.totalPaid;
                break;
            case 'bookingReference':
                aVal = a.bookingReference;
                bVal = b.bookingReference;
                break;
            default:
                return 0;
        }
        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
        return 0;
    });

    return sorted;
};

const paginate = (
    bookings: IBookingPopulated[],
    page: number,
    limit: number
): { data: IBookingPopulated[]; meta: PaginationMeta } => {
    const total = bookings.length;
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.max(1, Math.min(page, totalPages || 1));
    const start = (currentPage - 1) * limit;
    const end = start + limit;
    const data = bookings.slice(start, end);

    return {
        data,
        meta: {
            page: currentPage,
            limit,
            total,
            totalPages,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1,
        },
    };
};

// ============================================
// MAIN MOCK API HANDLERS
// ============================================

/**
 * Mock GET /api/bookings handler
 * Supports all query parameters defined in BookingsQueryParams
 */
export const mockGetBookingsHandler = async (
    query: BookingsQueryParams = {}
): Promise<BookingsApiResponse> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100);
    const sortBy = query.sortBy;
    const sortOrder = query.sortOrder;

    let filtered = filterBookings(MOCK_BOOKINGS, query);
    filtered = sortBookings(filtered, sortBy, sortOrder);
    const { data, meta } = paginate(filtered, page, limit);

    // ApiResponse<T> wraps payload under `data`
    return { data: { data, meta } };
};

// ============================================
// NEXT.JS ROUTE HANDLER
// ============================================

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // Parse query params — mirrors the real /api/operations/bookings route
        const query: BookingsQueryParams = {
            page: searchParams.has('page') ? Math.max(1, parseInt(searchParams.get('page')!)) : undefined,
            limit: searchParams.has('limit') ? Math.min(100, parseInt(searchParams.get('limit')!)) : undefined,
            search: searchParams.get('search') ?? undefined,
            tourTitle: searchParams.get('tourTitle') ?? undefined,
            fromDate: searchParams.get('fromDate') ?? undefined,
            toDate: searchParams.get('toDate') ?? undefined,
            sortBy: (searchParams.get('sortBy') as BookingsQueryParams['sortBy']) ?? undefined,
            sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') ?? undefined,
            // Comma-separated: ?status=pending,confirmed
            status: searchParams.has('status')
                ? (searchParams.get('status')!.split(',') as BookingStatus[])
                : undefined,
            // Comma-separated: ?paymentStatus=paid,failed
            paymentStatus: searchParams.has('paymentStatus')
                ? (searchParams.get('paymentStatus')!.split(',') as BookingPaymentStatus[])
                : undefined,
        };

        const response = await mockGetBookingsHandler(query);
        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message } satisfies BookingsApiResponse, { status: 500 });
    }
}