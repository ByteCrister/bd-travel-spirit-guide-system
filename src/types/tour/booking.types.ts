// types/tour/booking.types.ts

import { PaymentMethod, TourDiscount, TourDiscountType } from "@/constants/tour/tour.const";
import { ApiResponse } from "../common/api.types";
import { BookingPaymentStatus, BookingStatus } from "@/constants/tour/tour-booking.const";


// ============================================
// CORE INTERFACES (matching the models)
// ============================================

export interface IAppliedDiscount {
    type: TourDiscountType;
    discount: TourDiscount;
    value: number;
}

export interface IPayment {
    method: PaymentMethod;
    transactionId?: string;
    status: BookingPaymentStatus;
    paidAt?: Date;
}

export interface ICancellation {
    cancelledAt: Date;
    reason: string;
    cancelledBy: string; // ObjectId as string
    refundAmount?: number;
    refundStatus?: BookingPaymentStatus;
}

export interface IBookingBase {
    _id: string;
    bookingReference: string;
    uniqueTourCode: string;
    traveler: string; // ObjectId
    tour: string; // ObjectId
    totalParticipants: number;
    discounts: IAppliedDiscount[];
    totalPaid: number;
    payment: IPayment;
    status: BookingStatus;
    expiresAt?: Date;
    cancellation?: ICancellation;
    bookedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

// ============================================
// POPULATED TYPES (for UI display)
// ============================================

export interface PopulatedTraveler {
    _id: string;
    name: string;
    phone?: string;
    email: string; // from user population
    avatar?: string; // ObjectId as string
    address?: {
        district: string;
        division: string;
        upazila?: string;
        area?: string;
        house?: string;
        road?: string;
        postalCode?: string;
    };
    isVerified: boolean;
    accountStatus: string;
}

export interface PopulatedTour {
    _id: string;
    title: string;
    slug: string;
    uniqueTourCode: string;
    basePrice: {
        amount: number;
        currency: string;
    };
    duration: {
        days: number;
        nights?: number;
    };
    division: string;
    district: string;
    status: string;
    heroImage?: string; // ObjectId as string
    summary?: string;
}

export interface IBookingPopulated extends Omit<IBookingBase, 'traveler' | 'tour'> {
    traveler: PopulatedTraveler;
    tour: PopulatedTour;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface BookingsQueryParams {
    page?: number;
    limit?: number;
    status?: BookingStatus | BookingStatus[];
    paymentStatus?: BookingPaymentStatus | BookingPaymentStatus[];
    search?: string; // search by bookingReference, traveler name, email, tour title
    fromDate?: string; // ISO date
    toDate?: string;
    tourTitle?: string;
    sortBy?: 'bookedAt' | 'createdAt' | 'totalPaid' | 'bookingReference';
    sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export type BookingsApiResponse = ApiResponse<{
    data: IBookingPopulated[];
    meta: PaginationMeta;
}>

export interface BookingStatusCount {
    pending: number;
    confirmed: number;
    cancelled: number;
    refunded: number;
    completed: number;
    total: number;
}

export type BookingsSummaryApiResponse = ApiResponse<BookingStatusCount>

// ============================================
// ACTION REQUEST / RESPONSE TYPES
// ============================================

export interface CancelBookingRequest {
    /** Human-readable reason for the cancellation */
    reason: string;
}

export interface RefundBookingRequest {
    /** Optional partial refund amount; if omitted the full paid amount is refunded */
    refundAmount?: number;
    /** Optional note for the refund record */
    reason?: string;
}

export type BookingActionApiResponse = ApiResponse<{ message: string }>

// ============================================
// STORE STATE TYPES
// ============================================

export type BookingDateRangePreset = "custom" | "last30days" | "last7days" | "lastmonth" | "thismonth" | "today" | "yesterday";

export interface BookingsFilterState extends BookingsQueryParams {
    // UI-specific filter states (not sent to API)

    /** Include soft-deleted bookings in the list (default: false) */
    showDeleted?: boolean;

    /** Selected statuses for multi-select UI (used when status is not a simple enum) */
    selectedStatuses?: BookingStatus[];

    /** Selected payment statuses for multi-select UI */
    selectedPaymentStatuses?: BookingPaymentStatus[];

    /** Quick date range preset (e.g., 'today', 'yesterday', 'last7days', 'last30days', 'thismonth', 'lastmonth', 'custom') */
    dateRangePreset?: BookingDateRangePreset;

    /** Whether the advanced filters panel is expanded */
    advancedFiltersExpanded?: boolean;

    /** Search input debounce delay in ms (for internal handling) */
    searchDebounceDelay?: number;

    /** Last applied timestamp for UI refresh indicators */
    lastAppliedAt?: Date;
}

export type BookingsCacheData = {
    bookings: IBookingPopulated[];
    pagination: PaginationMeta;
};

export interface BaseCacheItem {
    timestamp: number;
    ttl: number;
}

export interface BookingsCacheItem extends BaseCacheItem {
    type: 'bookings';
    data: BookingsCacheData;
}

export interface SummaryCacheItem extends BaseCacheItem {
    type: 'summary';
    data: BookingStatusCount;
}

export type CacheItem = BookingsCacheItem | SummaryCacheItem;

export interface BookingsStoreState {
    // Data states
    bookings: IBookingPopulated[];
    summary: BookingStatusCount | null;
    pagination: PaginationMeta | null;

    // Filter states
    filters: BookingsFilterState;

    // UI states
    isLoading: boolean;
    isSummaryLoading: boolean;
    error: string | null;

    // Cache system
    cache: Map<string, CacheItem>;
    defaultTTL: number; // 5 minutes default

    // Async action states
    isCancelling: boolean;
    isRefunding: boolean;

    // Actions
    setFilters: (filters: Partial<BookingsFilterState>) => void;
    resetFilters: () => void;
    fetchBookings: (ignoreCache?: boolean) => Promise<void>;
    fetchSummary: (ignoreCache?: boolean) => Promise<void>;
    refetchBookings: () => Promise<void>;
    refetchSummary: () => Promise<void>;
    clearCache: (key?: string) => void;
    invalidateBookingsCache: () => void;
    /** POST /bookings/:id/cancel */
    cancelBooking: (bookingId: string, payload: CancelBookingRequest) => Promise<void>;
    /** POST /bookings/:id/refund */
    refundBooking: (bookingId: string, payload: RefundBookingRequest) => Promise<void>;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}