// store/dashboard.store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { format } from 'date-fns';

import type {
    DashboardFilters,
    DashboardStatsBundle,
    DashboardTabId,
    DateRange,
    Transaction,
    ApiPaginatedResponse,
    TourSummary,
    ReviewSummary,
    BookingSummary,
    ReportSummary,
    EmployeeSummary,
    RunningTourInfo,
    FAQSummary,
    RefundSummary,
    CompanyInfo,
    OwnerInfo,
} from '@/types/dashboard/dashboard.type';
import type { DashboardStore, DashboardStoreState, DashboardDateSection } from '@/types/dashboard/dashboard-store.type';
import api from '@/utils/axios/axios';
import { showToast } from '@/components/global/showToast';
import { extractErrorMessage } from '@/utils/axios/extractErrorMessage';
import { ApiResponse } from '@/types/common/api.types';

const URL_AFTER_API = `/mock/dashboard/v1`;
const API_PATHS = {
    stats: `${URL_AFTER_API}/stats`,
    profile: `${URL_AFTER_API}/profile`,
    tours: `${URL_AFTER_API}/tours`,
    reviews: `${URL_AFTER_API}/reviews`,
    bookings: `${URL_AFTER_API}/bookings`,
    reports: `${URL_AFTER_API}/reports`,
    employees: `${URL_AFTER_API}/employees`,
    runningTours: `${URL_AFTER_API}/running-tours`,
    faqs: `${URL_AFTER_API}/faqs`,
    refunds: `${URL_AFTER_API}/refunds`,
    transactions: `${URL_AFTER_API}/transactions`,
    export: `${URL_AFTER_API}/export`,
} as const;

const CACHE_TTL_MS = Number(process.env.NEXT_PUBLIC_CACHE_TTL ?? 0) * 1000;

function defaultDateRange(): DateRange {
    return {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
    };
}

function buildDefaultFilters(): DashboardFilters {
    const d = defaultDateRange();
    return {
        globalDateRange: d,
        statsDateRange: d,
        toursDateRange: d,
        reviewsDateRange: d,
        bookingsDateRange: d,
        reportsDateRange: d,
        employeesDateRange: d,
        runningToursDateRange: d,
        faqsDateRange: d,
        refundsDateRange: d,
        transactionsDateRange: d,
    };
}

const statsRangeParams = (range: DateRange) => ({
    statsDateRangeFrom: format(range.from, 'yyyy-MM-dd'),
    statsDateRangeTo: format(range.to, 'yyyy-MM-dd'),
});

const toursRangeParams = (range: DateRange) => ({
    toursDateRangeFrom: format(range.from, 'yyyy-MM-dd'),
    toursDateRangeTo: format(range.to, 'yyyy-MM-dd'),
});

const reviewsRangeParams = (range: DateRange) => ({
    reviewsDateRangeFrom: format(range.from, 'yyyy-MM-dd'),
    reviewsDateRangeTo: format(range.to, 'yyyy-MM-dd'),
});

const bookingsRangeParams = (range: DateRange) => ({
    bookingsDateRangeFrom: format(range.from, 'yyyy-MM-dd'),
    bookingsDateRangeTo: format(range.to, 'yyyy-MM-dd'),
});

const reportsRangeParams = (range: DateRange) => ({
    reportsDateRangeFrom: format(range.from, 'yyyy-MM-dd'),
    reportsDateRangeTo: format(range.to, 'yyyy-MM-dd'),
});

const employeesRangeParams = (range: DateRange) => ({
    employeesDateRangeFrom: format(range.from, 'yyyy-MM-dd'),
    employeesDateRangeTo: format(range.to, 'yyyy-MM-dd'),
});

const runningToursRangeParams = (range: DateRange) => ({
    runningToursDateRangeFrom: format(range.from, 'yyyy-MM-dd'),
    runningToursDateRangeTo: format(range.to, 'yyyy-MM-dd'),
});

const faqsRangeParams = (range: DateRange) => ({
    faqsDateRangeFrom: format(range.from, 'yyyy-MM-dd'),
    faqsDateRangeTo: format(range.to, 'yyyy-MM-dd'),
});

const refundsRangeParams = (range: DateRange) => ({
    refundsDateRangeFrom: format(range.from, 'yyyy-MM-dd'),
    refundsDateRangeTo: format(range.to, 'yyyy-MM-dd'),
});

const transactionsRangeParams = (range: DateRange) => ({
    transactionsDateRangeFrom: format(range.from, 'yyyy-MM-dd'),
    transactionsDateRangeTo: format(range.to, 'yyyy-MM-dd'),
});

const globalRangeParams = (range: DateRange) => ({
    globalDateRangeFrom: format(range.from, 'yyyy-MM-dd'),
    globalDateRangeTo: format(range.to, 'yyyy-MM-dd'),
});

const initialState: DashboardStoreState = {
    error: null,
    filters: buildDefaultFilters(),
    activeTab: 'tours',
    stats: null,
    chartBookings: null,
    chartReviews: null,
    isLoadingStats: false,
    companyInfo: null,
    ownerInfo: null,
    isLoadingProfile: false,
    toursData: null,
    reviewsData: null,
    bookingsData: null,
    reportsData: null,
    employeesData: null,
    runningToursData: null,
    faqsData: null,
    refundsData: null,
    isLoadingTours: false,
    isLoadingReviews: false,
    isLoadingBookings: false,
    isLoadingReports: false,
    isLoadingEmployees: false,
    isLoadingRunningTours: false,
    isLoadingFaqs: false,
    isLoadingRefunds: false,
    transactions: [],
    transactionsNextCursor: null,
    transactionsHasMore: true,
    isLoadingTransactions: false,
    isExporting: false,
    lastFetchedTimestamps: {},
};

function assertRangeNotFuture(range: DateRange): boolean {
    if (range.to > new Date()) {
        const msg = 'End date cannot be in the future';
        showToast.error(msg);
        return false;
    }
    return true;
}

export const useDashboardStore = create<DashboardStore>()(
    devtools(
        (set, get) => ({
            ...initialState,

            fetchInitialDashboard: async (forceRefresh = false) => {
                const { activeTab } = get();
                await Promise.all([
                    get().fetchStats(forceRefresh),
                    get().fetchProfile(forceRefresh),
                    get().fetchTabData(activeTab, forceRefresh),
                    get().fetchTransactionsFirstPage(forceRefresh),
                ]);
            },

            fetchStats: async (forceRefresh = false) => {
                const CACHE_KEY = 'statsBundle';
                const now = Date.now();
                if (
                    !forceRefresh &&
                    get().lastFetchedTimestamps[CACHE_KEY] &&
                    now - get().lastFetchedTimestamps[CACHE_KEY] < CACHE_TTL_MS
                ) {
                    return;
                }
                set({ isLoadingStats: true, error: null });
                try {
                    const { filters } = get();
                    const range = filters.statsDateRange;
                    const params = {
                        ...statsRangeParams(range),
                        tourStatus: filters.tourStatus,
                        employeeStatus: filters.employeeStatus,
                        reportStatus: filters.reportStatus,
                        bookingStatus: filters.bookingStatus,
                    };
                    const response = await api.get<ApiResponse<DashboardStatsBundle>>(API_PATHS.stats, { params });
                    if (response.data.error) throw new Error(response.data.error);
                    const bundle = response.data.data;
                    if (!bundle?.stats) throw new Error('Invalid stats payload');
                    set({
                        stats: bundle.stats,
                        chartBookings: bundle.bookingsForCharts ?? [],
                        chartReviews: bundle.reviewsForCharts ?? [],
                        isLoadingStats: false,
                        lastFetchedTimestamps: { ...get().lastFetchedTimestamps, [CACHE_KEY]: now },
                    });
                } catch (err: unknown) {
                    const message = extractErrorMessage(err);
                    set({ error: message, isLoadingStats: false });
                    showToast.error(message);
                }
            },

            fetchProfile: async (forceRefresh = false) => {
                const CACHE_KEY = 'profile';
                const now = Date.now();
                if (
                    !forceRefresh &&
                    get().lastFetchedTimestamps[CACHE_KEY] &&
                    now - get().lastFetchedTimestamps[CACHE_KEY] < CACHE_TTL_MS
                ) {
                    return;
                }
                set({ isLoadingProfile: true, error: null });
                try {
                    const response = await api.get<ApiResponse<{ companyInfo: CompanyInfo; ownerInfo: OwnerInfo }>>(
                        API_PATHS.profile,
                    );
                    if (response.data.error) throw new Error(response.data.error);
                    const payload = response.data.data;
                    if (!payload?.companyInfo || !payload?.ownerInfo) {
                        throw new Error('Invalid profile payload');
                    }
                    set({
                        companyInfo: payload.companyInfo,
                        ownerInfo: payload.ownerInfo,
                        isLoadingProfile: false,
                        lastFetchedTimestamps: { ...get().lastFetchedTimestamps, [CACHE_KEY]: now },
                    });
                } catch (err: unknown) {
                    const message = extractErrorMessage(err);
                    set({ error: message, isLoadingProfile: false });
                    showToast.error(message);
                }
            },

            fetchTabData: async (tab: DashboardTabId, forceRefresh = false) => {
                const g = get();
                switch (tab) {
                    case 'tours':
                        await g.fetchTours(forceRefresh);
                        break;
                    case 'bookings':
                        await g.fetchBookings(forceRefresh);
                        break;
                    case 'reviews':
                        await g.fetchReviews(forceRefresh);
                        break;
                    case 'reports':
                        await g.fetchReports(forceRefresh);
                        break;
                    case 'employees':
                        await g.fetchEmployees(forceRefresh);
                        break;
                    case 'running':
                        await g.fetchRunningTours(forceRefresh);
                        break;
                    case 'faqs':
                        await g.fetchFaqs(forceRefresh);
                        break;
                    case 'refunds':
                        await g.fetchRefunds(forceRefresh);
                        break;
                    default:
                        break;
                }
            },

            setActiveTab: (tab) => {
                set({ activeTab: tab });
                void get().fetchTabData(tab, true);
            },

            fetchTours: async (forceRefresh = false) => {
                const CACHE_KEY = 'toursData';
                const now = Date.now();
                if (
                    !forceRefresh &&
                    get().lastFetchedTimestamps[CACHE_KEY] &&
                    now - get().lastFetchedTimestamps[CACHE_KEY] < CACHE_TTL_MS
                ) {
                    return;
                }
                set({ isLoadingTours: true, error: null });
                try {
                    const { filters } = get();
                    const range = filters.toursDateRange;
                    const params = {
                        ...toursRangeParams(range),
                        tourStatus: filters.tourStatus,
                    };
                    const response = await api.get<ApiResponse<TourSummary[]>>(API_PATHS.tours, { params });
                    if (response.data.error) throw new Error(response.data.error);
                    const toursData = response.data.data;
                    if (!toursData || !Array.isArray(toursData)) throw new Error('Invalid tours data');
                    set({
                        toursData,
                        isLoadingTours: false,
                        lastFetchedTimestamps: { ...get().lastFetchedTimestamps, [CACHE_KEY]: now },
                    });
                } catch (err: unknown) {
                    const message = extractErrorMessage(err);
                    set({ error: message, isLoadingTours: false });
                    showToast.error(message);
                }
            },

            fetchReviews: async (forceRefresh = false) => {
                const CACHE_KEY = 'reviewsData';
                const now = Date.now();
                if (
                    !forceRefresh &&
                    get().lastFetchedTimestamps[CACHE_KEY] &&
                    now - get().lastFetchedTimestamps[CACHE_KEY] < CACHE_TTL_MS
                ) {
                    return;
                }
                set({ isLoadingReviews: true, error: null });
                try {
                    const { filters } = get();
                    const range = filters.reviewsDateRange;
                    const params = { ...reviewsRangeParams(range) };
                    const response = await api.get<ApiResponse<ReviewSummary[]>>(API_PATHS.reviews, { params });
                    if (response.data.error) throw new Error(response.data.error);
                    const reviewsData = response.data.data;
                    if (!reviewsData || !Array.isArray(reviewsData)) throw new Error('Invalid reviews data');
                    set({
                        reviewsData,
                        isLoadingReviews: false,
                        lastFetchedTimestamps: { ...get().lastFetchedTimestamps, [CACHE_KEY]: now },
                    });
                } catch (err: unknown) {
                    const message = extractErrorMessage(err);
                    set({ error: message, isLoadingReviews: false });
                    showToast.error(message);
                }
            },

            fetchBookings: async (forceRefresh = false) => {
                const CACHE_KEY = 'bookingsData';
                const now = Date.now();
                if (
                    !forceRefresh &&
                    get().lastFetchedTimestamps[CACHE_KEY] &&
                    now - get().lastFetchedTimestamps[CACHE_KEY] < CACHE_TTL_MS
                ) {
                    return;
                }
                set({ isLoadingBookings: true, error: null });
                try {
                    const { filters } = get();
                    const range = filters.bookingsDateRange;
                    const params = {
                        ...bookingsRangeParams(range),
                        bookingStatus: filters.bookingStatus,
                    };
                    const response = await api.get<ApiResponse<BookingSummary[]>>(API_PATHS.bookings, { params });
                    if (response.data.error) throw new Error(response.data.error);
                    const bookingsData = response.data.data;
                    if (!bookingsData || !Array.isArray(bookingsData)) throw new Error('Invalid bookings data');
                    set({
                        bookingsData,
                        isLoadingBookings: false,
                        lastFetchedTimestamps: { ...get().lastFetchedTimestamps, [CACHE_KEY]: now },
                    });
                } catch (err: unknown) {
                    const message = extractErrorMessage(err);
                    set({ error: message, isLoadingBookings: false });
                    showToast.error(message);
                }
            },

            fetchReports: async (forceRefresh = false) => {
                const CACHE_KEY = 'reportsData';
                const now = Date.now();
                if (
                    !forceRefresh &&
                    get().lastFetchedTimestamps[CACHE_KEY] &&
                    now - get().lastFetchedTimestamps[CACHE_KEY] < CACHE_TTL_MS
                ) {
                    return;
                }
                set({ isLoadingReports: true, error: null });
                try {
                    const { filters } = get();
                    const range = filters.reportsDateRange;
                    const params = {
                        ...reportsRangeParams(range),
                        reportStatus: filters.reportStatus,
                    };
                    const response = await api.get<ApiResponse<ReportSummary[]>>(API_PATHS.reports, { params });
                    if (response.data.error) throw new Error(response.data.error);
                    const reportsData = response.data.data;
                    if (!reportsData || !Array.isArray(reportsData)) throw new Error('Invalid reports data');
                    set({
                        reportsData,
                        isLoadingReports: false,
                        lastFetchedTimestamps: { ...get().lastFetchedTimestamps, [CACHE_KEY]: now },
                    });
                } catch (err: unknown) {
                    const message = extractErrorMessage(err);
                    set({ error: message, isLoadingReports: false });
                    showToast.error(message);
                }
            },

            fetchEmployees: async (forceRefresh = false) => {
                const CACHE_KEY = 'employeesData';
                const now = Date.now();
                if (
                    !forceRefresh &&
                    get().lastFetchedTimestamps[CACHE_KEY] &&
                    now - get().lastFetchedTimestamps[CACHE_KEY] < CACHE_TTL_MS
                ) {
                    return;
                }
                set({ isLoadingEmployees: true, error: null });
                try {
                    const { filters } = get();
                    const range = filters.employeesDateRange;
                    const params = {
                        ...employeesRangeParams(range),
                        employeeStatus: filters.employeeStatus,
                    };
                    const response = await api.get<ApiResponse<EmployeeSummary[]>>(API_PATHS.employees, { params });
                    if (response.data.error) throw new Error(response.data.error);
                    const employeesData = response.data.data;
                    if (!employeesData || !Array.isArray(employeesData)) throw new Error('Invalid employees data');
                    set({
                        employeesData,
                        isLoadingEmployees: false,
                        lastFetchedTimestamps: { ...get().lastFetchedTimestamps, [CACHE_KEY]: now },
                    });
                } catch (err: unknown) {
                    const message = extractErrorMessage(err);
                    set({ error: message, isLoadingEmployees: false });
                    showToast.error(message);
                }
            },

            fetchRunningTours: async (forceRefresh = false) => {
                const CACHE_KEY = 'runningToursData';
                const now = Date.now();
                if (
                    !forceRefresh &&
                    get().lastFetchedTimestamps[CACHE_KEY] &&
                    now - get().lastFetchedTimestamps[CACHE_KEY] < CACHE_TTL_MS
                ) {
                    return;
                }
                set({ isLoadingRunningTours: true, error: null });
                try {
                    const { filters } = get();
                    const range = filters.runningToursDateRange;
                    const params = { ...runningToursRangeParams(range) };
                    const response = await api.get<ApiResponse<RunningTourInfo[]>>(API_PATHS.runningTours, { params });
                    if (response.data.error) throw new Error(response.data.error);
                    const runningToursData = response.data.data;
                    if (!runningToursData || !Array.isArray(runningToursData)) throw new Error('Invalid running tours');
                    set({
                        runningToursData,
                        isLoadingRunningTours: false,
                        lastFetchedTimestamps: { ...get().lastFetchedTimestamps, [CACHE_KEY]: now },
                    });
                } catch (err: unknown) {
                    const message = extractErrorMessage(err);
                    set({ error: message, isLoadingRunningTours: false });
                    showToast.error(message);
                }
            },

            fetchFaqs: async (forceRefresh = false) => {
                const CACHE_KEY = 'faqsData';
                const now = Date.now();
                if (
                    !forceRefresh &&
                    get().lastFetchedTimestamps[CACHE_KEY] &&
                    now - get().lastFetchedTimestamps[CACHE_KEY] < CACHE_TTL_MS
                ) {
                    return;
                }
                set({ isLoadingFaqs: true, error: null });
                try {
                    const { filters } = get();
                    const range = filters.faqsDateRange;
                    const params = { ...faqsRangeParams(range) };
                    const response = await api.get<ApiResponse<FAQSummary[]>>(API_PATHS.faqs, { params });
                    if (response.data.error) throw new Error(response.data.error);
                    const faqsData = response.data.data;
                    if (!faqsData || !Array.isArray(faqsData)) throw new Error('Invalid FAQs data');
                    set({
                        faqsData,
                        isLoadingFaqs: false,
                        lastFetchedTimestamps: { ...get().lastFetchedTimestamps, [CACHE_KEY]: now },
                    });
                } catch (err: unknown) {
                    const message = extractErrorMessage(err);
                    set({ error: message, isLoadingFaqs: false });
                    showToast.error(message);
                }
            },

            fetchRefunds: async (forceRefresh = false) => {
                const CACHE_KEY = 'refundsData';
                const now = Date.now();
                if (
                    !forceRefresh &&
                    get().lastFetchedTimestamps[CACHE_KEY] &&
                    now - get().lastFetchedTimestamps[CACHE_KEY] < CACHE_TTL_MS
                ) {
                    return;
                }
                set({ isLoadingRefunds: true, error: null });
                try {
                    const { filters } = get();
                    const range = filters.refundsDateRange;
                    const params = { ...refundsRangeParams(range) };
                    const response = await api.get<ApiResponse<RefundSummary[]>>(API_PATHS.refunds, { params });
                    if (response.data.error) throw new Error(response.data.error);
                    const refundsData = response.data.data;
                    if (!refundsData || !Array.isArray(refundsData)) throw new Error('Invalid refunds data');
                    set({
                        refundsData,
                        isLoadingRefunds: false,
                        lastFetchedTimestamps: { ...get().lastFetchedTimestamps, [CACHE_KEY]: now },
                    });
                } catch (err: unknown) {
                    const message = extractErrorMessage(err);
                    set({ error: message, isLoadingRefunds: false });
                    showToast.error(message);
                }
            },

            fetchTransactionsFirstPage: async (forceRefresh = false) => {
                const CACHE_KEY = 'transactionsFirst';
                const now = Date.now();
                if (
                    !forceRefresh &&
                    get().transactions.length > 0 &&
                    get().lastFetchedTimestamps[CACHE_KEY] &&
                    now - get().lastFetchedTimestamps[CACHE_KEY] < CACHE_TTL_MS
                ) {
                    return;
                }

                set({
                    isLoadingTransactions: true,
                    error: null,
                    transactions: [],
                    transactionsNextCursor: null,
                    transactionsHasMore: true,
                });
                try {
                    const { filters } = get();
                    const range = filters.transactionsDateRange;
                    const params = {
                        ...transactionsRangeParams(range),
                        transactionsLimit: 20,
                    };
                    const response = await api.get<ApiResponse<ApiPaginatedResponse<Transaction>>>(
                        API_PATHS.transactions,
                        { params },
                    );
                    if (response.data.error) throw new Error(response.data.error);
                    const paginated = response.data.data;
                    if (!paginated) throw new Error('Invalid paginated response');
                    const { data, nextCursor, hasNextPage } = paginated;
                    set({
                        transactions: data,
                        transactionsNextCursor: nextCursor ?? null,
                        transactionsHasMore: hasNextPage,
                        isLoadingTransactions: false,
                        lastFetchedTimestamps: { ...get().lastFetchedTimestamps, [CACHE_KEY]: now },
                    });
                } catch (err: unknown) {
                    const message = extractErrorMessage(err);
                    set({ error: message, isLoadingTransactions: false });
                    showToast.error(message);
                }
            },

            fetchMoreTransactions: async () => {
                const { transactionsHasMore, isLoadingTransactions, transactionsNextCursor, filters } = get();
                if (!transactionsHasMore || isLoadingTransactions) return;

                set({ isLoadingTransactions: true });
                try {
                    const range = filters.transactionsDateRange;
                    const params = {
                        ...transactionsRangeParams(range),
                        transactionsCursor: transactionsNextCursor ?? undefined,
                        transactionsLimit: 20,
                    };
                    const response = await api.get<ApiResponse<ApiPaginatedResponse<Transaction>>>(
                        API_PATHS.transactions,
                        { params },
                    );
                    if (response.data.error) throw new Error(response.data.error);
                    const paginated = response.data.data;
                    if (!paginated) throw new Error('Invalid paginated response');
                    const { data, nextCursor, hasNextPage } = paginated;
                    set((state) => ({
                        transactions: [...state.transactions, ...data],
                        transactionsNextCursor: nextCursor ?? null,
                        transactionsHasMore: hasNextPage,
                        isLoadingTransactions: false,
                    }));
                } catch (err: unknown) {
                    const message = extractErrorMessage(err);
                    set({ error: message, isLoadingTransactions: false });
                    showToast.error(message);
                }
            },

            setSectionDateRange: (section: DashboardDateSection, range: DateRange) => {
                if (!assertRangeNotFuture(range)) return;
                set((state) => {
                    const nextTs = { ...state.lastFetchedTimestamps };
                    if (section === 'statsDateRange') delete nextTs.statsBundle;
                    if (section === 'toursDateRange') delete nextTs.toursData;
                    if (section === 'reviewsDateRange') delete nextTs.reviewsData;
                    if (section === 'bookingsDateRange') delete nextTs.bookingsData;
                    if (section === 'reportsDateRange') delete nextTs.reportsData;
                    if (section === 'employeesDateRange') delete nextTs.employeesData;
                    if (section === 'runningToursDateRange') delete nextTs.runningToursData;
                    if (section === 'faqsDateRange') delete nextTs.faqsData;
                    if (section === 'refundsDateRange') delete nextTs.refundsData;
                    if (section === 'transactionsDateRange') delete nextTs.transactionsFirst;
                    return {
                        filters: { ...state.filters, [section]: range },
                        lastFetchedTimestamps: nextTs,
                    };
                });
                const g = get();
                if (section === 'statsDateRange') void g.fetchStats(true);
                else if (section === 'toursDateRange') void g.fetchTours(true);
                else if (section === 'reviewsDateRange') void g.fetchReviews(true);
                else if (section === 'bookingsDateRange') void g.fetchBookings(true);
                else if (section === 'reportsDateRange') void g.fetchReports(true);
                else if (section === 'employeesDateRange') void g.fetchEmployees(true);
                else if (section === 'runningToursDateRange') void g.fetchRunningTours(true);
                else if (section === 'faqsDateRange') void g.fetchFaqs(true);
                else if (section === 'refundsDateRange') void g.fetchRefunds(true);
                else if (section === 'transactionsDateRange') void g.fetchTransactionsFirstPage(true);
            },

            setFilter: <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => {
                set((state) => ({
                    filters: { ...state.filters, [key]: value },
                    lastFetchedTimestamps: {},
                }));
                const g = get();
                void Promise.all([
                    g.fetchStats(true),
                    g.fetchTabData(g.activeTab, true),
                    g.fetchTransactionsFirstPage(true),
                ]);
            },

            resetFilters: () => {
                set({
                    filters: buildDefaultFilters(),
                    lastFetchedTimestamps: {},
                });
                void get().fetchInitialDashboard(true);
            },

            exportToCSV: async (type) => {
                set({ isExporting: true });
                try {
                    const { filters } = get();
                    const params = {
                        ...globalRangeParams(filters.globalDateRange),
                        tourStatus: filters.tourStatus,
                        employeeStatus: filters.employeeStatus,
                        reportStatus: filters.reportStatus,
                        bookingStatus: filters.bookingStatus,
                        type,
                    };
                    const response = await api.get(API_PATHS.export, {
                        params,
                        responseType: 'blob',
                    });
                    const blob = new Blob([response.data], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `dashboard_${type}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url);
                    showToast.success(`${type} exported successfully`);
                } catch (err: unknown) {
                    const message = extractErrorMessage(err);
                    set({ error: message });
                    showToast.error(message);
                } finally {
                    set({ isExporting: false });
                }
            },

            clearError: () => set({ error: null }),
        }),
        { name: 'dashboard-store' },
    ),
);
