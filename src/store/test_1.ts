"use client"

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  AddDepartureDTO,
  CompanyKpisDTO,
  CreateTourDTO,
  RequestReapprovalDTO,
  TourDetailDTO,
  TourFilterOptions,
  TourListItemDTO,
  UpdateDepartureDTO,
  UpdateDepartureSeatsDTO,
  UpdateTourBangladeshFieldsDTO,
  UpdateTourBasicInfoDTO,
  UpdateTourComplianceDTO,
  UpdateTourContentItineraryDTO,
  UpdateTourGalleryDTO,
  UpdateTourHeroImageDTO,
  UpdateTourLogisticsDTO,
  UpdateTourPoliciesDTO,
  UpdateTourPricingDTO,
} from "@/types/tour.types";
import {
  GetTourReviewsResponse,
  ReviewListItemDTO,
  ReviewSummaryDTO,
} from "@/types/review.tour.response.type";
import {
  GetTourReportsResponse,
  TourReportListItemDTO,
} from "@/types/report.tour.response.types";
import { GetTourFaqsResponse, TourFAQDTO } from "@/types/faqs.types";
import api from "@/utils/axios/axios";
import { extractErrorMessage } from "@/utils/axios/extractErrorMessage";
import { TourStatus } from "@/constants/tour.const";

const URL_AFTER_API = "/mock/operations/tours";

// --------------------
// Types
// --------------------
type TourResponse = {
  data: {
    docs: TourListItemDTO[];
    total: number;
    page: number;
    pages: number;
    company?: CompanyKpisDTO;
  };
};

interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: "asc" | "desc";
}

interface ListCache<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  params: {
    pagination: PaginationParams;
    filters?: TourFilterOptions;
  };
  meta?: {
    summary?: ReviewSummaryDTO;
  };
}

// --------------------
// Simplified store types (removed employee-related)
// --------------------
type ListCacheBucket<T> = Record<string, ListCache<T>>; // cacheKey -> ListCache
type CompanyListCache = {
  tours: ListCacheBucket<TourListItemDTO>;
  tourReviews: Record<string, ListCacheBucket<ReviewListItemDTO>>;
  tourReports: Record<string, ListCacheBucket<TourReportListItemDTO>>;
  tourFaqs: Record<string, ListCacheBucket<TourFAQDTO>>;
};

type ParamsMap = {
  tours: {
    pagination: PaginationParams;
    filters?: TourFilterOptions;
  };
  tourReviews: Record<string, PaginationParams>;
  tourReports: Record<string, PaginationParams>;
  tourFaqs: Record<string, PaginationParams>;
};

type ActiveCacheKeyMap = {
  tours: string | undefined;
  tourReviews: Record<string, string | undefined>;
  tourReports: Record<string, string | undefined>;
  tourFaqs: Record<string, string | undefined>;
};

// --------------------
// Store interface
// --------------------
interface CompanyDashboardState {
  // Single company context - no need for multiple companies
  company: CompanyKpisDTO | undefined;

  tourFilters: TourFilterOptions | undefined;

  // Cache and state
  listCache: CompanyListCache;
  params: ParamsMap;
  activeCacheKey: ActiveCacheKeyMap;
  tourDetails: Record<string, TourDetailDTO | undefined>;
  loading: Record<string, boolean>;
  error: Record<string, string | undefined>;
  cacheTimestamps: Record<string, number>;

  selectCompanyKpisFromActiveTours: () => CompanyKpisDTO
  fetchTours: (
    paginationParams?: Partial<PaginationParams>,
    filters?: TourFilterOptions,
    force?: boolean
  ) => Promise<ListCache<TourListItemDTO>>;
  fetchTourDetail: (tourId: string, force?: boolean) => Promise<TourDetailDTO>;
  fetchReviews: (
    tourId: string,
    params?: Partial<PaginationParams>,
    force?: boolean
  ) => Promise<ListCache<ReviewListItemDTO>>;
  fetchReports: (
    tourId: string,
    params?: Partial<PaginationParams>,
    force?: boolean
  ) => Promise<ListCache<TourReportListItemDTO>>;
  fetchFaqs: (
    tourId: string,
    params?: Partial<PaginationParams>,
    force?: boolean
  ) => Promise<ListCache<TourFAQDTO>>;


  // =============== CREATE TOUR ===============
  createTour: (
    data: CreateTourDTO
  ) => Promise<TourDetailDTO>;

  // =============== IMAGE UPDATE METHODS ===============
  updateTourHeroImage: (
    tourId: string,
    data: UpdateTourHeroImageDTO
  ) => Promise<TourDetailDTO>;

  updateTourGallery: (
    tourId: string,
    data: UpdateTourGalleryDTO
  ) => Promise<TourDetailDTO>;

  // =============== MODULAR UPDATE METHODS ===============
  updateTourBasicInfo: (
    tourId: string,
    data: UpdateTourBasicInfoDTO
  ) => Promise<TourDetailDTO>;

  updateTourBangladeshFields: (
    tourId: string,
    data: UpdateTourBangladeshFieldsDTO
  ) => Promise<TourDetailDTO>;

  updateTourContentItinerary: (
    tourId: string,
    data: UpdateTourContentItineraryDTO
  ) => Promise<TourDetailDTO>;

  updateTourLogistics: (
    tourId: string,
    data: UpdateTourLogisticsDTO
  ) => Promise<TourDetailDTO>;

  updateTourPricing: (
    tourId: string,
    data: UpdateTourPricingDTO
  ) => Promise<TourDetailDTO>;

  updateTourCompliance: (
    tourId: string,
    data: UpdateTourComplianceDTO
  ) => Promise<TourDetailDTO>;

  updateTourPolicies: (
    tourId: string,
    data: UpdateTourPoliciesDTO
  ) => Promise<TourDetailDTO>;

  // =============== STATUS & FEATURE UPDATES ===============
  updateTourStatus: (
    tourId: string,
    status: TourStatus
  ) => Promise<TourDetailDTO>;

  updateTourFeatured: (
    tourId: string,
    featured: boolean
  ) => Promise<TourDetailDTO>;

  // =============== DEPARTURE MANAGEMENT ===============
  addTourDeparture: (
    tourId: string,
    data: AddDepartureDTO
  ) => Promise<TourDetailDTO>;

  updateTourDeparture: (
    tourId: string,
    departureId: string,
    data: UpdateDepartureDTO
  ) => Promise<TourDetailDTO>;

  updateTourDepartureSeats: (
    tourId: string,
    departureId: string,
    data: UpdateDepartureSeatsDTO
  ) => Promise<TourDetailDTO>;

  removeTourDeparture: (
    tourId: string,
    departureId: string
  ) => Promise<TourDetailDTO>;

  // =============== MODERATION ACTIONS ===============
  submitTourForApproval: (
    tourId: string
  ) => Promise<TourDetailDTO>;

  requestTourReapproval: (
    tourId: string,
    data?: RequestReapprovalDTO
  ) => Promise<TourDetailDTO>;

  publishTour: (
    tourId: string
  ) => Promise<TourDetailDTO>;

  archiveTour: (
    tourId: string
  ) => Promise<TourDetailDTO>;

  // =============== DELETE OPERATIONS ===============
  deleteTour: (
    tourId: string
  ) => Promise<void>;

  restoreTour: (
    tourId: string
  ) => Promise<TourDetailDTO>;

  // Cache utilities
  invalidateCache?: (
    scope:
      | "tours"
      | "tourReviews"
      | "tourReports"
      | "tourFaqs"
      | "company"
      | "tourDetails",
    id?: string,
    key?: string
  ) => void;
  clearAllCaches?: () => void;
}

// --------------------
// Helpers & cache TTL
// --------------------
const makeCacheKey = (
  pagination: PaginationParams,
  filters?: TourFilterOptions
) => {
  const paginationKey = `${pagination.page}-${pagination.limit}-${pagination.sort ?? ""}-${pagination.order ?? ""}`;
  if (!filters) return paginationKey;
  const filterStr = JSON.stringify(filters, Object.keys(filters).sort());
  return `${paginationKey}-${filterStr}`;
};

// Helper function to get mutation loading/error keys
const mutationLoadingKey = (operation: string, tourId: string) =>
  `mutation:${operation}:${tourId}`;
const mutationErrorKey = (operation: string, tourId: string) =>
  `mutationError:${operation}:${tourId}`;

const defaultPagination: PaginationParams = { page: 1, limit: 10 };
const defaultTourParams = {
  pagination: defaultPagination,
  filters: undefined,
};

const tourDetailLoadingKey = (id: string) => `tourDetail:${id}`;
const tourDetailErrorKey = (id: string) => `tourDetailError:${id}`;

const tourListLoadingKey = (
  tourId: string,
  type: "reviews" | "reports" | "faqs"
) => `${type}List:${tourId}`;
const tourListErrorKey = (
  tourId: string,
  type: "reviews" | "reports" | "faqs"
) => `${type}ListError:${tourId}`;

// TTL behavior: entries older than CACHE_TTL_MS are considered stale
const CACHE_TTL_MS = Number(process.env.NEXT_PUBLIC_CACHE_TTL) || 1000 * 60 * 2; // 2 minutes

// In-flight dedupe maps
const inFlightRequests: Map<string, Promise<unknown>> = new Map();

// Helper: returns true if timestamp still fresh
const isFresh = (ts?: number) =>
  typeof ts === "number" ? Date.now() - ts < CACHE_TTL_MS : false;

// Small helper to build request key for dedupe
const makeRequestKey = (method: string, url: string, params?: unknown) =>
  `${method}:${url}:${JSON.stringify(params ?? {})}`;

// --------------------
// Store
// --------------------
export const useCompanyDashboardStoreTest_1 = create<CompanyDashboardState>()(
  devtools(
    persist(
      (set, get) => ({
        company: undefined,
        tourFilters: undefined,

        listCache: {
          tours: {},
          tourReviews: {},
          tourReports: {},
          tourFaqs: {},
        },
        params: {
          tours: defaultTourParams,
          tourReviews: {},
          tourReports: {},
          tourFaqs: {},
        },
        activeCacheKey: {
          tours: undefined,
          tourReviews: {},
          tourReports: {},
          tourFaqs: {},
        },
        tourDetails: {},
        loading: {},
        error: {},
        cacheTimestamps: {},

        // --------------------
        // Cache utilities
        // --------------------
        invalidateCache: (scope, id, key) => {
          set((state) => {
            const next = {
              ...state,
              listCache: {
                tours: { ...state.listCache.tours },
                tourReviews: { ...state.listCache.tourReviews },
                tourReports: { ...state.listCache.tourReports },
                tourFaqs: { ...state.listCache.tourFaqs },
              },
              cacheTimestamps: { ...state.cacheTimestamps },
            };

            if (scope === "company") {
              next.company = undefined;
            } else if (scope === "tourDetails" && id) {
              delete next.tourDetails[id];
            } else if (scope === "tours") {
              if (key) {
                delete next.listCache.tours[key];
                delete next.cacheTimestamps[`tours:${key}`];
              } else {
                next.listCache.tours = {};
                // remove matching timestamps
                Object.keys(next.cacheTimestamps).forEach((k) => {
                  if (k.startsWith(`tours:`)) delete next.cacheTimestamps[k];
                });
              }
            } else if (scope === "tourReviews" && id) {
              if (key) {
                delete next.listCache.tourReviews[id]?.[key];
                delete next.cacheTimestamps[`tourReviews:${id}:${key}`];
              } else {
                delete next.listCache.tourReviews[id];
                Object.keys(next.cacheTimestamps).forEach((k) => {
                  if (k.startsWith(`tourReviews:${id}:`))
                    delete next.cacheTimestamps[k];
                });
              }
            } else if (scope === "tourReports" && id) {
              if (key) {
                delete next.listCache.tourReports[id]?.[key];
                delete next.cacheTimestamps[`tourReports:${id}:${key}`];
              } else {
                delete next.listCache.tourReports[id];
                Object.keys(next.cacheTimestamps).forEach((k) => {
                  if (k.startsWith(`tourReports:${id}:`))
                    delete next.cacheTimestamps[k];
                });
              }
            } else if (scope === "tourFaqs" && id) {
              if (key) {
                delete next.listCache.tourFaqs[id]?.[key];
                delete next.cacheTimestamps[`tourFaqs:${id}:${key}`];
              } else {
                delete next.listCache.tourFaqs[id];
                Object.keys(next.cacheTimestamps).forEach((k) => {
                  if (k.startsWith(`tourFaqs:${id}:`))
                    delete next.cacheTimestamps[k];
                });
              }
            }

            return next;
          });
        },

        clearAllCaches: () => {
          set(() => ({
            listCache: {
              tours: {},
              tourReviews: {},
              tourReports: {},
              tourFaqs: {},
            },
            params: {
              tours: defaultTourParams,
              tourReviews: {},
              tourReports: {},
              tourFaqs: {},
            },
            activeCacheKey: {
              tours: undefined,
              tourReviews: {},
              tourReports: {},
              tourFaqs: {},
            },
            tourDetails: {},
            company: undefined,
            cacheTimestamps: {},
          }));
        },

        selectCompanyKpisFromActiveTours: () => {
          const state = get();
          const activeKey = state.activeCacheKey.tours;

          if (!activeKey) {
            return {
              totalTours: 0,
              openReports: 0,
              publishedTours: 0,
              totalBookings: 0,
              avgTourRating: 0,
            };
          }

          const cache = state.listCache.tours[activeKey];

          if (!cache) {
            return {
              totalTours: 0,
              openReports: 0,
              publishedTours: 0,
              totalBookings: 0,
              avgTourRating: 0,
            };
          }

          const tours = Array.isArray(cache.items) ? cache.items : [];

          const publishedTours = tours.filter(
            (t) => t.status === "published"
          );

          const ratings = publishedTours
            .map((t) => t.ratings?.average)
            .filter((r): r is number => typeof r === "number");

          return {
            totalTours: tours.length,
            openReports: 0,
            publishedTours: publishedTours.length,
            totalBookings: 0,
            avgTourRating:
              ratings.length > 0
                ? ratings.reduce((a, b) => a + b, 0) / ratings.length
                : 0,
          };
        },

        // --------------------
        // Fetch tours
        // --------------------
        fetchTours: async (
          paginationParams = {},
          filters?: TourFilterOptions,
          force = false
        ) => {
          const state = get();
          const prevParams = state.params.tours;
          const prevPagination = prevParams.pagination;

          const pagination: PaginationParams = {
            ...defaultPagination,
            ...prevPagination,
            ...paginationParams,
          };

          // Update tourFilters if provided
          if (filters !== undefined) {
            set({ tourFilters: filters });
          }

          const currentFilters = state.tourFilters;

          const cacheKey = makeCacheKey(pagination, currentFilters);

          const cached = state.listCache.tours[cacheKey];
          const tsKey = `tours:${cacheKey}`;
          const tsVal = state.cacheTimestamps[tsKey];

          if (!force && cached && isFresh(tsVal)) {
            set((s) => ({
              params: {
                ...s.params,
                tours: {
                  pagination,
                  filters: currentFilters,
                },
              },
              activeCacheKey: { ...s.activeCacheKey, tours: cacheKey },
              loading: { ...s.loading, tours: false },
              error: { ...s.error, tours: undefined },
            }));
            return cached;
          }

          // Build request params combining pagination and filters
          const requestParams: Record<string, unknown> = {
            page: pagination.page,
            limit: pagination.limit,
          };

          if (pagination.sort) requestParams.sort = pagination.sort;
          if (pagination.order) requestParams.order = pagination.order;

          // Add filters if they exist
          if (currentFilters) {
            Object.entries(currentFilters).forEach(([key, value]) => {
              if (value !== undefined && value !== null && value !== "") {
                if (Array.isArray(value) && value.length > 0) {
                  requestParams[key] = value.join(",");
                } else {
                  requestParams[key] = value;
                }
              }
            });
          }

          const url = `${URL_AFTER_API}`;
          const reqKey = makeRequestKey("GET", url, requestParams);

          if (!force && inFlightRequests.has(reqKey)) {
            return inFlightRequests.get(reqKey) as Promise<
              ListCache<TourListItemDTO>
            >;
          }

          set((s) => ({
            loading: { ...s.loading, tours: true },
            error: { ...s.error, tours: undefined },
          }));

          const p = api
            .get<TourResponse>(url, { params: requestParams })
            .then((res) => {
              const list: ListCache<TourListItemDTO> = {
                items: res.data.data.docs,
                total: res.data.data.total,
                page: res.data.data.page,
                pages: res.data.data.pages,
                params: {
                  pagination,
                  filters: currentFilters,
                },
              };

              set((s) => {
                const toursBucket: ListCacheBucket<TourListItemDTO> = {
                  ...s.listCache.tours,
                  [cacheKey]: list,
                };
                return {
                  listCache: { ...s.listCache, tours: toursBucket },
                  params: {
                    ...s.params,
                    tours: {
                      pagination,
                      filters: currentFilters,
                    },
                  },
                  activeCacheKey: { ...s.activeCacheKey, tours: cacheKey },
                  loading: { ...s.loading, tours: false },
                  cacheTimestamps: {
                    ...s.cacheTimestamps,
                    [tsKey]: Date.now(),
                  },
                };
              });

              return list;
            })
            .catch((err: unknown) => {
              const message = extractErrorMessage(err);
              set((s) => ({
                error: { ...s.error, tours: message },
                loading: { ...s.loading, tours: false },
              }));
              throw new Error(message);
            })
            .finally(() => inFlightRequests.delete(reqKey));

          inFlightRequests.set(reqKey, p);
          return p;
        },

        // --------------------
        // Fetch tour detail (no companyId parameter)
        // --------------------
        fetchTourDetail: async (tourId, force = false) => {
          const state = get();
          if (!force && state.tourDetails[tourId])
            return state.tourDetails[tourId]!;

          const loadingKey = tourDetailLoadingKey(tourId);
          const errorKey = tourDetailErrorKey(tourId);

          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          const url = `${URL_AFTER_API}/tours/${tourId}`;
          const reqKey = makeRequestKey("GET", url);

          if (!force && inFlightRequests.has(reqKey))
            return inFlightRequests.get(reqKey) as Promise<TourDetailDTO>;

          const p = api
            .get<{ data: TourDetailDTO }>(url)
            .then((res) => {
              set((s) => ({
                tourDetails: { ...s.tourDetails, [tourId]: res.data.data },
                loading: { ...s.loading, [loadingKey]: false },
              }));
              return res.data.data;
            })
            .catch((err: unknown) => {
              const message = extractErrorMessage(err);
              set((s) => ({
                error: { ...s.error, [errorKey]: message },
                loading: { ...s.loading, [loadingKey]: false },
              }));
              throw new Error(message);
            })
            .finally(() => inFlightRequests.delete(reqKey));

          inFlightRequests.set(reqKey, p);
          return p;
        },

        // --------------------
        // Per-tour lists: reviews/reports/faqs (no companyId parameter)
        // --------------------
        fetchReviews: async (tourId, overrideParams = {}, force = false) => {
          const state = get();
          if (!state.params.tourReviews) state.params.tourReviews = {};
          if (!state.params.tourReviews[tourId])
            state.params.tourReviews[tourId] = { ...defaultPagination };

          const currentParams = state.params.tourReviews[tourId];
          const params: PaginationParams = {
            ...defaultPagination,
            ...currentParams,
            ...overrideParams,
          };
          const cacheKey = `${params.page}-${params.limit}-${params.sort ?? ""}-${params.order ?? ""}`;

          const cached = state.listCache.tourReviews?.[tourId]?.[cacheKey];
          const tsKey = `tourReviews:${tourId}:${cacheKey}`;
          const tsVal = state.cacheTimestamps[tsKey];

          if (!force && cached && isFresh(tsVal)) {
            set((s) => ({
              params: {
                ...s.params,
                tourReviews: { ...s.params.tourReviews, [tourId]: params },
              },
              activeCacheKey: {
                ...s.activeCacheKey,
                tourReviews: {
                  ...s.activeCacheKey.tourReviews,
                  [tourId]: cacheKey,
                },
              },
              loading: {
                ...s.loading,
                [tourListLoadingKey(tourId, "reviews")]: false,
              },
              error: {
                ...s.error,
                [tourListErrorKey(tourId, "reviews")]: undefined,
              },
            }));
            return cached;
          }

          const url = `${URL_AFTER_API}/tours/${tourId}/reviews`;
          const reqKey = makeRequestKey("GET", url, params);
          if (!force && inFlightRequests.has(reqKey))
            return inFlightRequests.get(reqKey) as Promise<
              ListCache<ReviewListItemDTO>
            >;

          const loadingKey = tourListLoadingKey(tourId, "reviews");
          const errorKey = tourListErrorKey(tourId, "reviews");
          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          const p = api
            .get<GetTourReviewsResponse>(url, { params })
            .then((res) => {
              const list: ListCache<ReviewListItemDTO> = {
                items: res.data.data.docs,
                total: res.data.data.total,
                page: res.data.data.page,
                pages: res.data.data.pages,
                meta: { summary: res.data.data.summary },
                params: {
                  pagination: params,
                  filters: undefined,
                },
              };

              set((s) => {
                const bucket: ListCacheBucket<ReviewListItemDTO> = {
                  ...(s.listCache.tourReviews[tourId] || {}),
                  [cacheKey]: list,
                };
                return {
                  listCache: {
                    ...s.listCache,
                    tourReviews: {
                      ...s.listCache.tourReviews,
                      [tourId]: bucket,
                    },
                  },
                  params: {
                    ...s.params,
                    tourReviews: { ...s.params.tourReviews, [tourId]: params },
                  },
                  activeCacheKey: {
                    ...s.activeCacheKey,
                    tourReviews: {
                      ...s.activeCacheKey.tourReviews,
                      [tourId]: cacheKey,
                    },
                  },
                  loading: { ...s.loading, [loadingKey]: false },
                  cacheTimestamps: {
                    ...s.cacheTimestamps,
                    [tsKey]: Date.now(),
                  },
                };
              });

              return list;
            })
            .catch((err: unknown) => {
              const message = extractErrorMessage(err);
              set((s) => ({
                error: { ...s.error, [errorKey]: message },
                loading: { ...s.loading, [loadingKey]: false },
              }));
              throw new Error(message);
            })
            .finally(() => inFlightRequests.delete(reqKey));

          inFlightRequests.set(reqKey, p);
          return p;
        },

        fetchReports: async (tourId, overrideParams = {}, force = false) => {
          const state = get();
          if (!state.params.tourReports) state.params.tourReports = {};
          if (!state.params.tourReports[tourId])
            state.params.tourReports[tourId] = { ...defaultPagination };

          const currentParams = state.params.tourReports[tourId];
          const params: PaginationParams = {
            ...defaultPagination,
            ...currentParams,
            ...overrideParams,
          };
          const cacheKey = `${params.page}-${params.limit}-${params.sort ?? ""}-${params.order ?? ""}`;

          const cached = state.listCache.tourReports?.[tourId]?.[cacheKey];
          const tsKey = `tourReports:${tourId}:${cacheKey}`;
          const tsVal = state.cacheTimestamps[tsKey];

          if (!force && cached && isFresh(tsVal)) {
            set((s) => ({
              params: {
                ...s.params,
                tourReports: { ...s.params.tourReports, [tourId]: params },
              },
              activeCacheKey: {
                ...s.activeCacheKey,
                tourReports: {
                  ...s.activeCacheKey.tourReports,
                  [tourId]: cacheKey,
                },
              },
              loading: {
                ...s.loading,
                [tourListLoadingKey(tourId, "reports")]: false,
              },
              error: {
                ...s.error,
                [tourListErrorKey(tourId, "reports")]: undefined,
              },
            }));
            return cached;
          }

          const url = `${URL_AFTER_API}/tours/${tourId}/reports`;
          const reqKey = makeRequestKey("GET", url, params);
          if (!force && inFlightRequests.has(reqKey))
            return inFlightRequests.get(reqKey) as Promise<
              ListCache<TourReportListItemDTO>
            >;

          const loadingKey = tourListLoadingKey(tourId, "reports");
          const errorKey = tourListErrorKey(tourId, "reports");
          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          const p = api
            .get<GetTourReportsResponse>(url, { params })
            .then((res) => {
              const list: ListCache<TourReportListItemDTO> = {
                items: res.data.data.docs,
                total: res.data.data.total,
                page: res.data.data.page,
                pages: res.data.data.pages,
                params: {
                  pagination: params,
                  filters: undefined,
                },
              };

              set((s) => {
                const bucket: ListCacheBucket<TourReportListItemDTO> = {
                  ...(s.listCache.tourReports[tourId] || {}),
                  [cacheKey]: list,
                };
                return {
                  listCache: {
                    ...s.listCache,
                    tourReports: {
                      ...s.listCache.tourReports,
                      [tourId]: bucket,
                    },
                  },
                  params: {
                    ...s.params,
                    tourReports: { ...s.params.tourReports, [tourId]: params },
                  },
                  activeCacheKey: {
                    ...s.activeCacheKey,
                    tourReports: {
                      ...s.activeCacheKey.tourReports,
                      [tourId]: cacheKey,
                    },
                  },
                  loading: { ...s.loading, [loadingKey]: false },
                  cacheTimestamps: {
                    ...s.cacheTimestamps,
                    [tsKey]: Date.now(),
                  },
                };
              });

              return list;
            })
            .catch((err: unknown) => {
              const message = extractErrorMessage(err);
              set((s) => ({
                error: { ...s.error, [errorKey]: message },
                loading: { ...s.loading, [loadingKey]: false },
              }));
              throw new Error(message);
            })
            .finally(() => inFlightRequests.delete(reqKey));

          inFlightRequests.set(reqKey, p);
          return p;
        },

        fetchFaqs: async (tourId, overrideParams = {}, force = false) => {
          const state = get();
          if (!state.params.tourFaqs) state.params.tourFaqs = {};
          if (!state.params.tourFaqs[tourId])
            state.params.tourFaqs[tourId] = { ...defaultPagination };

          const currentParams = state.params.tourFaqs[tourId];
          const params: PaginationParams = {
            ...defaultPagination,
            ...currentParams,
            ...overrideParams,
          };
          const cacheKey = `${params.page}-${params.limit}-${params.sort ?? ""}-${params.order ?? ""}`;

          const cached = state.listCache.tourFaqs?.[tourId]?.[cacheKey];
          const tsKey = `tourFaqs:${tourId}:${cacheKey}`;
          const tsVal = state.cacheTimestamps[tsKey];

          if (!force && cached && isFresh(tsVal)) {
            set((s) => ({
              params: {
                ...s.params,
                tourFaqs: { ...s.params.tourFaqs, [tourId]: params },
              },
              activeCacheKey: {
                ...s.activeCacheKey,
                tourFaqs: { ...s.activeCacheKey.tourFaqs, [tourId]: cacheKey },
              },
              loading: {
                ...s.loading,
                [tourListLoadingKey(tourId, "faqs")]: false,
              },
              error: {
                ...s.error,
                [tourListErrorKey(tourId, "faqs")]: undefined,
              },
            }));
            return cached;
          }

          const url = `${URL_AFTER_API}/tours/${tourId}/faqs`;
          const reqKey = makeRequestKey("GET", url, params);
          if (!force && inFlightRequests.has(reqKey))
            return inFlightRequests.get(reqKey) as Promise<
              ListCache<TourFAQDTO>
            >;

          const loadingKey = tourListLoadingKey(tourId, "faqs");
          const errorKey = tourListErrorKey(tourId, "faqs");
          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          const p = api
            .get<GetTourFaqsResponse>(url, { params })
            .then((res) => {
              const list: ListCache<TourFAQDTO> = {
                items: res.data.data.docs,
                total: res.data.data.total,
                page: res.data.data.page,
                pages: res.data.data.pages,
                params: {
                  pagination: params,
                  filters: undefined,
                },
              };

              set((s) => {
                const faqBucket: ListCacheBucket<TourFAQDTO> = {
                  ...(s.listCache.tourFaqs[tourId] || {}),
                  [cacheKey]: list,
                };
                return {
                  listCache: {
                    ...s.listCache,
                    tourFaqs: { ...s.listCache.tourFaqs, [tourId]: faqBucket },
                  },
                  params: {
                    ...s.params,
                    tourFaqs: { ...s.params.tourFaqs, [tourId]: params },
                  },
                  activeCacheKey: {
                    ...s.activeCacheKey,
                    tourFaqs: {
                      ...s.activeCacheKey.tourFaqs,
                      [tourId]: cacheKey,
                    },
                  },
                  loading: { ...s.loading, [loadingKey]: false },
                  cacheTimestamps: {
                    ...s.cacheTimestamps,
                    [tsKey]: Date.now(),
                  },
                };
              });

              return list;
            })
            .catch((err: unknown) => {
              const message = extractErrorMessage(err);
              set((s) => ({
                error: { ...s.error, [errorKey]: message },
                loading: { ...s.loading, [loadingKey]: false },
              }));
              throw new Error(message);
            })
            .finally(() => inFlightRequests.delete(reqKey));

          inFlightRequests.set(reqKey, p);
          return p;
        },


        createTour: async (data) => {
          const loadingKey = mutationLoadingKey('create', 'new');
          const errorKey = mutationErrorKey('create', 'new');

          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          try {
            const response = await api.post<{ data: TourDetailDTO }>(
              `${URL_AFTER_API}`,
              data
            );

            // Invalidate tours cache since we added a new tour
            set((s) => ({
              tourDetails: { ...s.tourDetails, [response.data.data.id]: response.data.data },
              loading: { ...s.loading, [loadingKey]: false },
              listCache: {
                ...s.listCache,
                tours: {}, // Clear tours cache to refetch with new data
              },
            }));

            return response.data.data;
          } catch (err: unknown) {
            const message = extractErrorMessage(err);
            set((s) => ({
              error: { ...s.error, [errorKey]: message },
              loading: { ...s.loading, [loadingKey]: false },
            }));
            throw new Error(message);
          }
        },

        // =============== IMAGE UPDATE METHODS ===============
        updateTourHeroImage: async (tourId, data) => {
          const loadingKey = mutationLoadingKey('updateHeroImage', tourId);
          const errorKey = mutationErrorKey('updateHeroImage', tourId);

          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          try {
            const response = await api.patch<{ data: TourDetailDTO }>(
              `${URL_AFTER_API}/tours/${tourId}/hero-image`,
              data
            );

            // Update local cache
            set((s) => ({
              tourDetails: { ...s.tourDetails, [tourId]: response.data.data },
              loading: { ...s.loading, [loadingKey]: false },
            }));

            // Invalidate tours list cache since hero image might affect list view
            get().invalidateCache?.('tours');

            return response.data.data;
          } catch (err: unknown) {
            const message = extractErrorMessage(err);
            set((s) => ({
              error: { ...s.error, [errorKey]: message },
              loading: { ...s.loading, [loadingKey]: false },
            }));
            throw new Error(message);
          }
        },

        updateTourGallery: async (tourId, data) => {
          const loadingKey = mutationLoadingKey('updateGallery', tourId);
          const errorKey = mutationErrorKey('updateGallery', tourId);

          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          try {
            const response = await api.patch<{ data: TourDetailDTO }>(
              `${URL_AFTER_API}/tours/${tourId}/gallery`,
              data
            );

            // Update local cache
            set((s) => ({
              tourDetails: { ...s.tourDetails, [tourId]: response.data.data },
              loading: { ...s.loading, [loadingKey]: false },
            }));

            return response.data.data;
          } catch (err: unknown) {
            const message = extractErrorMessage(err);
            set((s) => ({
              error: { ...s.error, [errorKey]: message },
              loading: { ...s.loading, [loadingKey]: false },
            }));
            throw new Error(message);
          }
        },

        // =============== STATUS & FEATURE UPDATES ===============
        updateTourStatus: async (tourId, status) => {
          const loadingKey = mutationLoadingKey('updateStatus', tourId);
          const errorKey = mutationErrorKey('updateStatus', tourId);

          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          try {
            const response = await api.patch<{ data: TourDetailDTO }>(
              `${URL_AFTER_API}/tours/${tourId}/status`,
              { status }
            );

            // Update local cache
            set((s) => ({
              tourDetails: { ...s.tourDetails, [tourId]: response.data.data },
              loading: { ...s.loading, [loadingKey]: false },
            }));

            // Invalidate tours list cache since status affects filtering
            get().invalidateCache?.('tours');

            return response.data.data;
          } catch (err: unknown) {
            const message = extractErrorMessage(err);
            set((s) => ({
              error: { ...s.error, [errorKey]: message },
              loading: { ...s.loading, [loadingKey]: false },
            }));
            throw new Error(message);
          }
        },

        updateTourFeatured: async (tourId, featured) => {
          const loadingKey = mutationLoadingKey('updateFeatured', tourId);
          const errorKey = mutationErrorKey('updateFeatured', tourId);

          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          try {
            const response = await api.patch<{ data: TourDetailDTO }>(
              `${URL_AFTER_API}/tours/${tourId}/featured`,
              { featured }
            );

            // Update local cache
            set((s) => ({
              tourDetails: { ...s.tourDetails, [tourId]: response.data.data },
              loading: { ...s.loading, [loadingKey]: false },
            }));

            // Invalidate tours list cache since featured status affects filtering
            get().invalidateCache?.('tours');

            return response.data.data;
          } catch (err: unknown) {
            const message = extractErrorMessage(err);
            set((s) => ({
              error: { ...s.error, [errorKey]: message },
              loading: { ...s.loading, [loadingKey]: false },
            }));
            throw new Error(message);
          }
        },

        // =============== DEPARTURE MANAGEMENT ===============
        addTourDeparture: async (tourId, data) => {
          const loadingKey = mutationLoadingKey('addDeparture', tourId);
          const errorKey = mutationErrorKey('addDeparture', tourId);

          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          try {
            const response = await api.post<{ data: TourDetailDTO }>(
              `${URL_AFTER_API}/tours/${tourId}/departures`,
              data
            );

            // Update local cache
            set((s) => ({
              tourDetails: { ...s.tourDetails, [tourId]: response.data.data },
              loading: { ...s.loading, [loadingKey]: false },
            }));

            return response.data.data;
          } catch (err: unknown) {
            const message = extractErrorMessage(err);
            set((s) => ({
              error: { ...s.error, [errorKey]: message },
              loading: { ...s.loading, [loadingKey]: false },
            }));
            throw new Error(message);
          }
        },

        updateTourDeparture: async (tourId, departureId, data) => {
          const loadingKey = mutationLoadingKey('updateDeparture', tourId);
          const errorKey = mutationErrorKey('updateDeparture', tourId);

          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          try {
            const response = await api.patch<{ data: TourDetailDTO }>(
              `${URL_AFTER_API}/tours/${tourId}/departures/${departureId}`,
              data
            );

            // Update local cache
            set((s) => ({
              tourDetails: { ...s.tourDetails, [tourId]: response.data.data },
              loading: { ...s.loading, [loadingKey]: false },
            }));

            return response.data.data;
          } catch (err: unknown) {
            const message = extractErrorMessage(err);
            set((s) => ({
              error: { ...s.error, [errorKey]: message },
              loading: { ...s.loading, [loadingKey]: false },
            }));
            throw new Error(message);
          }
        },

        updateTourDepartureSeats: async (tourId, departureId, data) => {
          const loadingKey = mutationLoadingKey('updateDepartureSeats', tourId);
          const errorKey = mutationErrorKey('updateDepartureSeats', tourId);

          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          try {
            const response = await api.patch<{ data: TourDetailDTO }>(
              `${URL_AFTER_API}/tours/${tourId}/departures/${departureId}/seats`,
              data
            );

            // Update local cache
            set((s) => ({
              tourDetails: { ...s.tourDetails, [tourId]: response.data.data },
              loading: { ...s.loading, [loadingKey]: false },
            }));

            return response.data.data;
          } catch (err: unknown) {
            const message = extractErrorMessage(err);
            set((s) => ({
              error: { ...s.error, [errorKey]: message },
              loading: { ...s.loading, [loadingKey]: false },
            }));
            throw new Error(message);
          }
        },

        removeTourDeparture: async (tourId, departureId) => {
          const loadingKey = mutationLoadingKey('removeDeparture', tourId);
          const errorKey = mutationErrorKey('removeDeparture', tourId);

          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          try {
            const response = await api.delete<{ data: TourDetailDTO }>(
              `${URL_AFTER_API}/tours/${tourId}/departures/${departureId}`
            );

            // Update local cache
            set((s) => ({
              tourDetails: { ...s.tourDetails, [tourId]: response.data.data },
              loading: { ...s.loading, [loadingKey]: false },
            }));

            return response.data.data;
          } catch (err: unknown) {
            const message = extractErrorMessage(err);
            set((s) => ({
              error: { ...s.error, [errorKey]: message },
              loading: { ...s.loading, [loadingKey]: false },
            }));
            throw new Error(message);
          }
        },

        // =============== MODERATION ACTIONS ===============
        submitTourForApproval: async (tourId) => {
          const loadingKey = mutationLoadingKey('submitForApproval', tourId);
          const errorKey = mutationErrorKey('submitForApproval', tourId);

          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          try {
            const response = await api.post<{ data: TourDetailDTO }>(
              `${URL_AFTER_API}/tours/${tourId}/submit`
            );

            // Update local cache
            set((s) => ({
              tourDetails: { ...s.tourDetails, [tourId]: response.data.data },
              loading: { ...s.loading, [loadingKey]: false },
            }));

            // Invalidate tours cache since moderation status changed
            get().invalidateCache?.('tours');

            return response.data.data;
          } catch (err: unknown) {
            const message = extractErrorMessage(err);
            set((s) => ({
              error: { ...s.error, [errorKey]: message },
              loading: { ...s.loading, [loadingKey]: false },
            }));
            throw new Error(message);
          }
        },

        requestTourReapproval: async (tourId, data) => {
          const loadingKey = mutationLoadingKey('requestReapproval', tourId);
          const errorKey = mutationErrorKey('requestReapproval', tourId);

          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          try {
            const response = await api.post<{ data: TourDetailDTO }>(
              `${URL_AFTER_API}/tours/${tourId}/request-reapproval`,
              data
            );

            // Update local cache
            set((s) => ({
              tourDetails: { ...s.tourDetails, [tourId]: response.data.data },
              loading: { ...s.loading, [loadingKey]: false },
            }));

            // Invalidate tours cache since moderation status changed
            get().invalidateCache?.('tours');

            return response.data.data;
          } catch (err: unknown) {
            const message = extractErrorMessage(err);
            set((s) => ({
              error: { ...s.error, [errorKey]: message },
              loading: { ...s.loading, [loadingKey]: false },
            }));
            throw new Error(message);
          }
        },

        publishTour: async (tourId) => {
          const loadingKey = mutationLoadingKey('publish', tourId);
          const errorKey = mutationErrorKey('publish', tourId);

          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          try {
            const response = await api.post<{ data: TourDetailDTO }>(
              `${URL_AFTER_API}/tours/${tourId}/publish`
            );

            // Update local cache
            set((s) => ({
              tourDetails: { ...s.tourDetails, [tourId]: response.data.data },
              loading: { ...s.loading, [loadingKey]: false },
            }));

            // Invalidate tours cache since status changed
            get().invalidateCache?.('tours');

            return response.data.data;
          } catch (err: unknown) {
            const message = extractErrorMessage(err);
            set((s) => ({
              error: { ...s.error, [errorKey]: message },
              loading: { ...s.loading, [loadingKey]: false },
            }));
            throw new Error(message);
          }
        },

        archiveTour: async (tourId) => {
          const loadingKey = mutationLoadingKey('archive', tourId);
          const errorKey = mutationErrorKey('archive', tourId);

          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          try {
            const response = await api.post<{ data: TourDetailDTO }>(
              `${URL_AFTER_API}/tours/${tourId}/archive`
            );

            // Update local cache
            set((s) => ({
              tourDetails: { ...s.tourDetails, [tourId]: response.data.data },
              loading: { ...s.loading, [loadingKey]: false },
            }));

            // Invalidate tours cache since status changed
            get().invalidateCache?.('tours');

            return response.data.data;
          } catch (err: unknown) {
            const message = extractErrorMessage(err);
            set((s) => ({
              error: { ...s.error, [errorKey]: message },
              loading: { ...s.loading, [loadingKey]: false },
            }));
            throw new Error(message);
          }
        },

        // =============== DELETE OPERATIONS ===============
        deleteTour: async (tourId) => {
          const loadingKey = mutationLoadingKey('delete', tourId);
          const errorKey = mutationErrorKey('delete', tourId);

          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          try {
            await api.delete(`${URL_AFTER_API}/tours/${tourId}`);

            // Remove from caches
            set((s) => ({
              loading: { ...s.loading, [loadingKey]: false },
            }));

            // Invalidate all caches for this tour
            get().invalidateCache?.('tourDetails', tourId);
            get().invalidateCache?.('tours');

          } catch (err: unknown) {
            const message = extractErrorMessage(err);
            set((s) => ({
              error: { ...s.error, [errorKey]: message },
              loading: { ...s.loading, [loadingKey]: false },
            }));
            throw new Error(message);
          }
        },

        restoreTour: async (tourId) => {
          const loadingKey = mutationLoadingKey('restore', tourId);
          const errorKey = mutationErrorKey('restore', tourId);

          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          try {
            const response = await api.post<{ data: TourDetailDTO }>(
              `${URL_AFTER_API}/tours/${tourId}/restore`
            );

            // Update local cache
            set((s) => ({
              tourDetails: { ...s.tourDetails, [tourId]: response.data.data },
              loading: { ...s.loading, [loadingKey]: false },
            }));

            // Invalidate tours cache
            get().invalidateCache?.('tours');

            return response.data.data;
          } catch (err: unknown) {
            const message = extractErrorMessage(err);
            set((s) => ({
              error: { ...s.error, [errorKey]: message },
              loading: { ...s.loading, [loadingKey]: false },
            }));
            throw new Error(message);
          }
        },

        // =============== MODULAR UPDATE METHODS ===============
        updateTourBasicInfo: async (tourId, data) => {
          const loadingKey = mutationLoadingKey('updateBasicInfo', tourId);
          const errorKey = mutationErrorKey('updateBasicInfo', tourId);

          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          try {
            const response = await api.patch<{ data: TourDetailDTO }>(
              `${URL_AFTER_API}/tours/${tourId}/basic-info`,
              data
            );

            set((s) => ({
              tourDetails: { ...s.tourDetails, [tourId]: response.data.data },
              loading: { ...s.loading, [loadingKey]: false },
            }));

            get().invalidateCache?.('tours');

            return response.data.data;
          } catch (err: unknown) {
            const message = extractErrorMessage(err);
            set((s) => ({
              error: { ...s.error, [errorKey]: message },
              loading: { ...s.loading, [loadingKey]: false },
            }));
            throw new Error(message);
          }
        },

        updateTourBangladeshFields: async (tourId, data) => {
          const loadingKey = mutationLoadingKey('updateBangladeshFields', tourId);
          const errorKey = mutationErrorKey('updateBangladeshFields', tourId);

          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          try {
            const response = await api.patch<{ data: TourDetailDTO }>(
              `${URL_AFTER_API}/tours/${tourId}/bangladesh-fields`,
              data
            );

            set((s) => ({
              tourDetails: { ...s.tourDetails, [tourId]: response.data.data },
              loading: { ...s.loading, [loadingKey]: false },
            }));

            get().invalidateCache?.('tours');

            return response.data.data;
          } catch (err: unknown) {
            const message = extractErrorMessage(err);
            set((s) => ({
              error: { ...s.error, [errorKey]: message },
              loading: { ...s.loading, [loadingKey]: false },
            }));
            throw new Error(message);
          }
        },

        updateTourContentItinerary: async (tourId, data) => {
          const loadingKey = mutationLoadingKey('updateContentItinerary', tourId);
          const errorKey = mutationErrorKey('updateContentItinerary', tourId);

          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          try {
            const response = await api.patch<{ data: TourDetailDTO }>(
              `${URL_AFTER_API}/tours/${tourId}/content-itinerary`,
              data
            );

            set((s) => ({
              tourDetails: { ...s.tourDetails, [tourId]: response.data.data },
              loading: { ...s.loading, [loadingKey]: false },
            }));

            get().invalidateCache?.('tours');

            return response.data.data;
          } catch (err: unknown) {
            const message = extractErrorMessage(err);
            set((s) => ({
              error: { ...s.error, [errorKey]: message },
              loading: { ...s.loading, [loadingKey]: false },
            }));
            throw new Error(message);
          }
        },

        updateTourLogistics: async (tourId, data) => {
          const loadingKey = mutationLoadingKey('updateLogistics', tourId);
          const errorKey = mutationErrorKey('updateLogistics', tourId);

          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          try {
            const response = await api.patch<{ data: TourDetailDTO }>(
              `${URL_AFTER_API}/tours/${tourId}/logistics`,
              data
            );

            set((s) => ({
              tourDetails: { ...s.tourDetails, [tourId]: response.data.data },
              loading: { ...s.loading, [loadingKey]: false },
            }));

            get().invalidateCache?.('tours');

            return response.data.data;
          } catch (err: unknown) {
            const message = extractErrorMessage(err);
            set((s) => ({
              error: { ...s.error, [errorKey]: message },
              loading: { ...s.loading, [loadingKey]: false },
            }));
            throw new Error(message);
          }
        },

        updateTourPricing: async (tourId, data) => {
          const loadingKey = mutationLoadingKey('updatePricing', tourId);
          const errorKey = mutationErrorKey('updatePricing', tourId);

          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          try {
            const response = await api.patch<{ data: TourDetailDTO }>(
              `${URL_AFTER_API}/tours/${tourId}/pricing`,
              data
            );

            set((s) => ({
              tourDetails: { ...s.tourDetails, [tourId]: response.data.data },
              loading: { ...s.loading, [loadingKey]: false },
            }));

            get().invalidateCache?.('tours');

            return response.data.data;
          } catch (err: unknown) {
            const message = extractErrorMessage(err);
            set((s) => ({
              error: { ...s.error, [errorKey]: message },
              loading: { ...s.loading, [loadingKey]: false },
            }));
            throw new Error(message);
          }
        },

        updateTourCompliance: async (tourId, data) => {
          const loadingKey = mutationLoadingKey('updateCompliance', tourId);
          const errorKey = mutationErrorKey('updateCompliance', tourId);

          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          try {
            const response = await api.patch<{ data: TourDetailDTO }>(
              `${URL_AFTER_API}/tours/${tourId}/compliance`,
              data
            );

            set((s) => ({
              tourDetails: { ...s.tourDetails, [tourId]: response.data.data },
              loading: { ...s.loading, [loadingKey]: false },
            }));

            get().invalidateCache?.('tours');

            return response.data.data;
          } catch (err: unknown) {
            const message = extractErrorMessage(err);
            set((s) => ({
              error: { ...s.error, [errorKey]: message },
              loading: { ...s.loading, [loadingKey]: false },
            }));
            throw new Error(message);
          }
        },

        updateTourPolicies: async (tourId, data) => {
          const loadingKey = mutationLoadingKey('updatePolicies', tourId);
          const errorKey = mutationErrorKey('updatePolicies', tourId);

          set((s) => ({
            loading: { ...s.loading, [loadingKey]: true },
            error: { ...s.error, [errorKey]: undefined },
          }));

          try {
            const response = await api.patch<{ data: TourDetailDTO }>(
              `${URL_AFTER_API}/tours/${tourId}/policies`,
              data
            );

            set((s) => ({
              tourDetails: { ...s.tourDetails, [tourId]: response.data.data },
              loading: { ...s.loading, [loadingKey]: false },
            }));

            get().invalidateCache?.('tours');

            return response.data.data;
          } catch (err: unknown) {
            const message = extractErrorMessage(err);
            set((s) => ({
              error: { ...s.error, [errorKey]: message },
              loading: { ...s.loading, [loadingKey]: false },
            }));
            throw new Error(message);
          }
        },

      }),
      {
        name: "company-detail.store",
        partialize: (state) => ({
          params: state.params,
          activeCacheKey: state.activeCacheKey,
        }),
      }
    )
  )
);