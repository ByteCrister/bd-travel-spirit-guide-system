// stores/bookingStore.ts

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import type {
  BookingsStoreState,
  BookingsFilterState,
  BookingsApiResponse,
  BookingsSummaryApiResponse,
  CancelBookingRequest,
  RefundBookingRequest,
  BookingActionApiResponse,
} from "@/types/tour/booking.types";
import api from "@/utils/axios/axios";
import { extractErrorMessage } from "@/utils/axios/extractErrorMessage";
import {
  BookingStatus,
  BOOKING_STATUS,
} from "@/constants/tour/tour-booking.const";

// ============================================
// API CONFIGURATION (relative paths – axios instance already prefixes with /api)
// ============================================
// export const API_BOOKINGS_URL = '/mock/operations/bookings';
export const API_BOOKINGS_URL = "/operations/bookings/v1";
export const API_BOOKINGS_SUMMARY_URL = `${API_BOOKINGS_URL}/summary`;

// ============================================
// CACHE & DEFAULT VALUES
// ============================================
const DEFAULT_FILTERS: BookingsFilterState = {
  page: 1,
  limit: 20,
  status: undefined,
  paymentStatus: undefined,
  search: "",
  fromDate: undefined,
  toDate: undefined,
  tourTitle: undefined,
  sortBy: "bookedAt",
  sortOrder: "desc",
};

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

const generateCacheKey = (
  filters: BookingsFilterState,
  suffix = "list",
): string => `${suffix}:${JSON.stringify(filters)}`;

const isCacheValid = (cacheItem: { timestamp: number; ttl: number }): boolean =>
  Date.now() - cacheItem.timestamp < cacheItem.ttl;

// ============================================
// ZUSTAND STORE
// ============================================
export const useBookingStore = create<BookingsStoreState>()(
  devtools(
    (set, get) => ({
      // initial state
      bookings: [],
      summary: null,
      pagination: null,
      filters: { ...DEFAULT_FILTERS },
      isLoading: false,
      isSummaryLoading: false,
      isCancelling: false,
      isRefunding: false,
      error: null,
      cache: new Map(),
      defaultTTL: DEFAULT_TTL,

      // filter actions
      setFilters: (newFilters) => {
        set(
          (state) => ({
            filters: {
              ...state.filters,
              ...newFilters,
              page: newFilters.page !== undefined ? newFilters.page : 1,
            },
          }),
          false,
          "bookingStore/setFilters",
        );
      },
      resetFilters: () => {
        set(
          { filters: { ...DEFAULT_FILTERS } },
          false,
          "bookingStore/resetFilters",
        );
      },

      // cache management
      clearCache: (key) => {
        set(
          (state) => {
            const newCache = new Map(state.cache);
            if (key) newCache.delete(key);
            else newCache.clear();
            return { cache: newCache };
          },
          false,
          "bookingStore/clearCache",
        );
      },
      invalidateBookingsCache: () => {
        set(
          (state) => {
            const newCache = new Map(state.cache);
            for (const key of newCache.keys()) {
              if (key.startsWith("list:")) newCache.delete(key);
            }
            return { cache: newCache };
          },
          false,
          "bookingStore/invalidateBookingsCache",
        );
      },

      // ============================================
      // FETCH BOOKINGS
      // ============================================
      fetchBookings: async (ignoreCache = false) => {
        const { filters, cache, defaultTTL } = get();
        const cacheKey = generateCacheKey(filters, "list");

        if (!ignoreCache) {
          const cachedItem = cache.get(cacheKey);
          if (
            cachedItem &&
            isCacheValid(cachedItem) &&
            cachedItem.type === "bookings"
          ) {
            set(
              {
                bookings: cachedItem.data.bookings,
                pagination: cachedItem.data.pagination,
                isLoading: false,
                error: null,
              },
              false,
              "bookingStore/fetchBookings/cache-hit",
            );
            return;
          }
        }

        set(
          { isLoading: true, error: null },
          false,
          "bookingStore/fetchBookings/start",
        );

        try {
          // Build query params
          const params = new URLSearchParams();
          if (filters.page) params.append("page", filters.page.toString());
          if (filters.limit) params.append("limit", filters.limit.toString());
          if (filters.status) {
            const statuses = Array.isArray(filters.status)
              ? filters.status
              : [filters.status];
            statuses.forEach((s) => params.append("status", s));
          }
          if (filters.paymentStatus) {
            const pStatuses = Array.isArray(filters.paymentStatus)
              ? filters.paymentStatus
              : [filters.paymentStatus];
            pStatuses.forEach((ps) => params.append("paymentStatus", ps));
          }
          if (filters.search) params.append("search", filters.search);
          if (filters.fromDate) params.append("fromDate", filters.fromDate);
          if (filters.toDate) params.append("toDate", filters.toDate);
          if (filters.tourTitle) params.append("tourTitle", filters.tourTitle);
          if (filters.sortBy) params.append("sortBy", filters.sortBy);
          if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

          const url = `${API_BOOKINGS_URL}?${params.toString()}`;
          const response = await api.get<BookingsApiResponse>(url);

          // Check for error (ApiResponse standard)
          if (!response.data.error && response.data.data) {
            const { data: bookings, meta } = response.data.data;
            const cachedData = { bookings, pagination: meta };

            set(
              (state) => ({
                bookings,
                pagination: meta,
                isLoading: false,
                error: null,
                cache: new Map(state.cache).set(cacheKey, {
                  type: "bookings",
                  data: cachedData,
                  timestamp: Date.now(),
                  ttl: defaultTTL,
                }),
              }),
              false,
              "bookingStore/fetchBookings/success",
            );

            toast.success(`Loaded ${bookings.length} bookings`);
          } else {
            throw new Error(response.data.error || "Failed to fetch bookings");
          }
        } catch (error) {
          const errorMessage = extractErrorMessage(error);
          set(
            { isLoading: false, error: errorMessage },
            false,
            "bookingStore/fetchBookings/error",
          );
          toast.error(errorMessage);
        }
      },

      // ============================================
      // FETCH SUMMARY
      // ============================================
      fetchSummary: async (ignoreCache = false) => {
        const { cache, defaultTTL } = get();
        const cacheKey = "summary:all";

        if (!ignoreCache) {
          const cachedItem = cache.get(cacheKey);
          if (
            cachedItem &&
            isCacheValid(cachedItem) &&
            cachedItem.type === "summary"
          ) {
            set(
              { summary: cachedItem.data, isSummaryLoading: false },
              false,
              "bookingStore/fetchSummary/cache-hit",
            );
            return;
          }
        }

        set(
          { isSummaryLoading: true, error: null },
          false,
          "bookingStore/fetchSummary/start",
        );

        try {
          const response = await api.get<BookingsSummaryApiResponse>(
            API_BOOKINGS_SUMMARY_URL,
          );
          if (!response.data.error && response.data.data) {
            const summary = response.data.data;
            set(
              (state) => ({
                ...state,
                summary,
                isSummaryLoading: false,
                cache: new Map(state.cache).set(cacheKey, {
                  type: "summary",
                  data: summary,
                  timestamp: Date.now(),
                  ttl: defaultTTL,
                }),
              }),
              false,
              "bookingStore/fetchSummary/success",
            );
          } else {
            throw new Error(response.data.error || "Failed to fetch summary");
          }
        } catch (error) {
          const errorMessage = extractErrorMessage(error);
          set(
            { isSummaryLoading: false, error: errorMessage },
            false,
            "bookingStore/fetchSummary/error",
          );
          toast.error(errorMessage);
        }
      },

      refetchBookings: async () => {
        await get().fetchBookings(true);
      },
      refetchSummary: async () => {
        await get().fetchSummary(true);
      },

      // ============================================
      // CANCEL BOOKING
      // ============================================
      cancelBooking: async (
        bookingId: string,
        payload: CancelBookingRequest,
      ) => {
        set(
          { isCancelling: true, error: null },
          false,
          "bookingStore/cancelBooking/start",
        );
        try {
          const url = `${API_BOOKINGS_URL}/${bookingId}/cancel`;
          const response = await api.post<BookingActionApiResponse>(
            url,
            payload,
          );

          if (!response.data.error) {
            // Optimistic: mark as cancelled in local list
            set(
              (state) => ({
                isCancelling: false,
                bookings: state.bookings.map((b) =>
                  b._id === bookingId
                    ? {
                        ...b,
                        status: BOOKING_STATUS.CANCELLED as BookingStatus,
                      }
                    : b,
                ),
              }),
              false,
              "bookingStore/cancelBooking/success",
            );
            get().invalidateBookingsCache();
            get().fetchSummary(true);
            toast.success("Booking cancelled successfully");
          } else {
            throw new Error(response.data.error || "Failed to cancel booking");
          }
        } catch (error) {
          const msg = extractErrorMessage(error);
          set(
            { isCancelling: false, error: msg },
            false,
            "bookingStore/cancelBooking/error",
          );
          toast.error(msg);
        }
      },

      // ============================================
      // REFUND BOOKING
      // ============================================
      refundBooking: async (
        bookingId: string,
        payload: RefundBookingRequest,
      ) => {
        set(
          { isRefunding: true, error: null },
          false,
          "bookingStore/refundBooking/start",
        );
        try {
          const url = `${API_BOOKINGS_URL}/${bookingId}/refund`;
          const response = await api.post<BookingActionApiResponse>(
            url,
            payload,
          );

          if (!response.data.error) {
            // Optimistic: mark as refunded in local list
            set(
              (state) => ({
                isRefunding: false,
                bookings: state.bookings.map((b) =>
                  b._id === bookingId
                    ? { ...b, status: BOOKING_STATUS.REFUNDED as BookingStatus }
                    : b,
                ),
              }),
              false,
              "bookingStore/refundBooking/success",
            );
            get().invalidateBookingsCache();
            get().fetchSummary(true);
            toast.success("Booking refunded successfully");
          } else {
            throw new Error(response.data.error || "Failed to refund booking");
          }
        } catch (error) {
          const msg = extractErrorMessage(error);
          set(
            { isRefunding: false, error: msg },
            false,
            "bookingStore/refundBooking/error",
          );
          toast.error(msg);
        }
      },

      // UI helpers
      setLoading: (loading) => {
        set({ isLoading: loading }, false, "bookingStore/setLoading");
      },
      setError: (error) => {
        set({ error }, false, "bookingStore/setError");
      },
    }),
    {
      name: "booking-store",
      enabled: process.env.NODE_ENV === "development",
    },
  ),
);

// Selectors & action hooks
export const useBookings = () => useBookingStore((state) => state.bookings);
export const useBookingsPagination = () =>
  useBookingStore((state) => state.pagination);
export const useBookingsFilters = () =>
  useBookingStore((state) => state.filters);
export const useBookingsLoading = () =>
  useBookingStore((state) => state.isLoading);
export const useBookingsSummary = () =>
  useBookingStore((state) => state.summary);
export const useBookingsError = () => useBookingStore((state) => state.error);
export const useIsCancelling = () =>
  useBookingStore((state) => state.isCancelling);
export const useIsRefunding = () =>
  useBookingStore((state) => state.isRefunding);

export const useBookingActions = () => {
  const setFilters = useBookingStore((state) => state.setFilters);
  const resetFilters = useBookingStore((state) => state.resetFilters);
  const fetchBookings = useBookingStore((state) => state.fetchBookings);
  const fetchSummary = useBookingStore((state) => state.fetchSummary);
  const refetchBookings = useBookingStore((state) => state.refetchBookings);
  const refetchSummary = useBookingStore((state) => state.refetchSummary);
  const cancelBooking = useBookingStore((state) => state.cancelBooking);
  const refundBooking = useBookingStore((state) => state.refundBooking);
  const clearCache = useBookingStore((state) => state.clearCache);
  const invalidateBookingsCache = useBookingStore(
    (state) => state.invalidateBookingsCache,
  );

  return {
    setFilters,
    resetFilters,
    fetchBookings,
    fetchSummary,
    refetchBookings,
    refetchSummary,
    cancelBooking,
    refundBooking,
    clearCache,
    invalidateBookingsCache,
  };
};
