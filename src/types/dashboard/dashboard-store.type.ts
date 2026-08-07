// types/dashboard-store.type.ts
import type {
    BookingSummary,
    CompanyInfo,
    DashboardFilters,
    DashboardStats,
    DashboardTabId,
    DateRange,
    EmployeeSummary,
    FAQSummary,
    OwnerInfo,
    RefundSummary,
    ReportSummary,
    ReviewSummary,
    RunningTourInfo,
    TourSummary,
    Transaction,
} from './dashboard.type';

export type DashboardDateSection =
    | 'globalDateRange'
    | 'statsDateRange'
    | 'toursDateRange'
    | 'reviewsDateRange'
    | 'bookingsDateRange'
    | 'reportsDateRange'
    | 'employeesDateRange'
    | 'runningToursDateRange'
    | 'faqsDateRange'
    | 'refundsDateRange'
    | 'transactionsDateRange';

export interface DashboardStoreState {
    error: string | null;

    filters: DashboardFilters;

    activeTab: DashboardTabId;

    stats: DashboardStats | null;
    chartBookings: BookingSummary[] | null;
    chartReviews: ReviewSummary[] | null;
    isLoadingStats: boolean;

    companyInfo: CompanyInfo | null;
    ownerInfo: OwnerInfo | null;
    isLoadingProfile: boolean;

    toursData: TourSummary[] | null;
    reviewsData: ReviewSummary[] | null;
    bookingsData: BookingSummary[] | null;
    reportsData: ReportSummary[] | null;
    employeesData: EmployeeSummary[] | null;
    runningToursData: RunningTourInfo[] | null;
    faqsData: FAQSummary[] | null;
    refundsData: RefundSummary[] | null;

    isLoadingTours: boolean;
    isLoadingReviews: boolean;
    isLoadingBookings: boolean;
    isLoadingReports: boolean;
    isLoadingEmployees: boolean;
    isLoadingRunningTours: boolean;
    isLoadingFaqs: boolean;
    isLoadingRefunds: boolean;

    transactions: Transaction[];
    transactionsNextCursor: string | null;
    transactionsHasMore: boolean;
    isLoadingTransactions: boolean;

    isExporting: boolean;

    lastFetchedTimestamps: Record<string, number>;

    /**
     * True when the most recent API fetch returned fallback data — i.e. no
     * records were found in the selected date range and the API returned the
     * most recent available data for this company instead.
     */
    isInitialData: boolean;
}

export interface DashboardStoreActions {
    /** First paint: stats + profile + active tab + first transactions page */
    fetchInitialDashboard: (forceRefresh?: boolean) => Promise<void>;

    fetchStats: (forceRefresh?: boolean) => Promise<void>;
    fetchProfile: (forceRefresh?: boolean) => Promise<void>;
    fetchTabData: (tab: DashboardTabId, forceRefresh?: boolean) => Promise<void>;

    fetchTours: (forceRefresh?: boolean) => Promise<void>;
    fetchReviews: (forceRefresh?: boolean) => Promise<void>;
    fetchBookings: (forceRefresh?: boolean) => Promise<void>;
    fetchReports: (forceRefresh?: boolean) => Promise<void>;
    fetchEmployees: (forceRefresh?: boolean) => Promise<void>;
    fetchRunningTours: (forceRefresh?: boolean) => Promise<void>;
    fetchFaqs: (forceRefresh?: boolean) => Promise<void>;
    fetchRefunds: (forceRefresh?: boolean) => Promise<void>;

    fetchMoreTransactions: () => Promise<void>;
    /** Replace list with first page (cursor reset) */
    fetchTransactionsFirstPage: (forceRefresh?: boolean) => Promise<void>;

    setActiveTab: (tab: DashboardTabId) => void;

    setSectionDateRange: (section: DashboardDateSection, range: DateRange) => void;

    setFilter: <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => void;
    resetFilters: () => void;

    exportToCSV: (type: 'tours' | 'bookings' | 'reviews' | 'reports' | 'employees' | 'transactions') => Promise<void>;

    clearError: () => void;
}

export type DashboardStore = DashboardStoreState & DashboardStoreActions;
