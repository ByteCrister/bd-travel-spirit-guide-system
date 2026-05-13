'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useDashboardStore } from '@/store/dashboard.store';
import type { DashboardFilters, DashboardTabId, DateRange } from '@/types/dashboard/dashboard.type';
import type { DashboardDateSection } from '@/types/dashboard/dashboard-store.type';
import { DashboardPageHeader, type ExportDataset } from '@/components/dashboard/shell/DashboardPageHeader';
import { DashboardStatsFilters } from '@/components/dashboard/shell/DashboardStatsFilters';
import { DashboardStatsGrid } from '@/components/dashboard/shell/DashboardStatsGrid';
import { DashboardChartsSection } from '@/components/dashboard/shell/DashboardChartsSection';
import { DashboardProfileSection } from '@/components/dashboard/shell/DashboardProfileSection';
import { DashboardDataTabs } from '@/components/dashboard/shell/DashboardDataTabs';
import { DashboardTransactionsCard } from '@/components/dashboard/shell/DashboardTransactionsCard';
import { DashboardErrorState } from '@/components/dashboard/shell/DashboardErrorState';
import { StatsGridSkeleton } from '@/components/dashboard/shell/loadings/StatsGridSkeleton';
import { ChartRowSkeleton } from '@/components/dashboard/shell/loadings/ChartRowSkeleton';
import { ProfileCardsSkeleton } from '@/components/dashboard/shell/loadings/ProfileCardsSkeleton';
import {
    buildBookingsChartData,
    buildRatingDistribution,
} from '@/components/dashboard/shell/dashboard-shell-utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, ChevronDown } from 'lucide-react';

const TAB_TO_RANGE: Record<DashboardTabId, DashboardDateSection> = {
    tours: 'toursDateRange',
    bookings: 'bookingsDateRange',
    reviews: 'reviewsDateRange',
    reports: 'reportsDateRange',
    employees: 'employeesDateRange',
    running: 'runningToursDateRange',
    faqs: 'faqsDateRange',
    refunds: 'refundsDateRange',
};

export default function Dashboard() {
    const {
        error,
        filters,
        activeTab,
        stats,
        chartBookings,
        chartReviews,
        isLoadingStats,
        companyInfo,
        ownerInfo,
        isLoadingProfile,
        toursData,
        reviewsData,
        bookingsData,
        reportsData,
        employeesData,
        runningToursData,
        faqsData,
        refundsData,
        isLoadingTours,
        isLoadingReviews,
        isLoadingBookings,
        isLoadingReports,
        isLoadingEmployees,
        isLoadingRunningTours,
        isLoadingFaqs,
        isLoadingRefunds,
        transactions,
        transactionsHasMore,
        isLoadingTransactions,
        isExporting,
        setActiveTab,
        setSectionDateRange,
        setFilter,
        resetFilters,
        fetchInitialDashboard,
        fetchMoreTransactions,
        exportToCSV,
        clearError,
    } = useDashboardStore();

    const [exportType, setExportType] = useState<ExportDataset>('tours');

    useEffect(() => {
        void fetchInitialDashboard();
    }, [fetchInitialDashboard]);

    const tabDateRange = filters[TAB_TO_RANGE[activeTab]];

    const onTabDateRangeChange = useCallback(
        (range: DateRange) => {
            setSectionDateRange(TAB_TO_RANGE[activeTab], range);
        },
        [activeTab, setSectionDateRange],
    );

    const isTabLoading = useCallback(
        (tab: DashboardTabId) => {
            switch (tab) {
                case 'tours':
                    return isLoadingTours;
                case 'bookings':
                    return isLoadingBookings;
                case 'reviews':
                    return isLoadingReviews;
                case 'reports':
                    return isLoadingReports;
                case 'employees':
                    return isLoadingEmployees;
                case 'running':
                    return isLoadingRunningTours;
                case 'faqs':
                    return isLoadingFaqs;
                case 'refunds':
                    return isLoadingRefunds;
                default:
                    return false;
            }
        },
        [
            isLoadingTours,
            isLoadingBookings,
            isLoadingReviews,
            isLoadingReports,
            isLoadingEmployees,
            isLoadingRunningTours,
            isLoadingFaqs,
            isLoadingRefunds,
        ],
    );

    const tables = useMemo(
        () => ({
            tours: toursData ?? [],
            bookings: bookingsData ?? [],
            reviews: reviewsData ?? [],
            reports: reportsData ?? [],
            employees: employeesData ?? [],
            runningTours: runningToursData ?? [],
            faqs: faqsData ?? [],
            refunds: refundsData ?? [],
        }),
        [toursData, bookingsData, reviewsData, reportsData, employeesData, runningToursData, faqsData, refundsData],
    );

    const bookingsChartData = useMemo(
        () => buildBookingsChartData(chartBookings ?? undefined),
        [chartBookings],
    );

    const ratingDistribution = useMemo(
        () => buildRatingDistribution(chartReviews ?? undefined),
        [chartReviews],
    );

    const statsAnimateKey = useMemo(
        () =>
            [
                format(filters.statsDateRange.from, 'yyyy-MM-dd'),
                format(filters.statsDateRange.to, 'yyyy-MM-dd'),
                filters.tourStatus ?? '',
                filters.employeeStatus ?? '',
                filters.reportStatus ?? '',
                filters.bookingStatus ?? '',
            ].join('|'),
        [filters],
    );

    if (error) {
        return (
            <DashboardErrorState
                message={error}
                onRetry={() => {
                    clearError();
                    void fetchInitialDashboard(true);
                }}
            />
        );
    }

    const showStatsSkeleton = isLoadingStats && !stats;
    const showProfileSkeleton = isLoadingProfile && !companyInfo;

    return (
        <div className="space-y-10 pb-16">
            <DashboardPageHeader
                exportWindow={filters.globalDateRange}
                onExportWindowChange={(range) => setSectionDateRange('globalDateRange', range)}
                isExporting={isExporting}
                exportType={exportType}
                onExportTypeChange={setExportType}
                onResetFilters={resetFilters}
                onExport={() => void exportToCSV(exportType)}
            />

            <DashboardStatsFilters
                filters={filters}
                isLoadingStats={isLoadingStats}
                onStatsDateRangeChange={(range) => setSectionDateRange('statsDateRange', range)}
                onTourStatus={(v) => setFilter('tourStatus', v as DashboardFilters['tourStatus'])}
                onEmployeeStatus={(v) => setFilter('employeeStatus', v as DashboardFilters['employeeStatus'])}
                onReportStatus={(v) => setFilter('reportStatus', v as DashboardFilters['reportStatus'])}
                onBookingStatus={(v) => setFilter('bookingStatus', v as DashboardFilters['bookingStatus'])}
            />

            {showStatsSkeleton ? (
                <StatsGridSkeleton />
            ) : (
                <DashboardStatsGrid stats={stats ?? undefined} animateKey={statsAnimateKey} />
            )}

            {showStatsSkeleton ? <ChartRowSkeleton /> : <DashboardChartsSection bookingsSeries={bookingsChartData} ratingSlices={ratingDistribution} />}

            {showProfileSkeleton ? (
                <ProfileCardsSkeleton />
            ) : (
                <DashboardProfileSection companyInfo={companyInfo ?? undefined} ownerInfo={ownerInfo ?? undefined} />
            )}

            <DashboardDataTabs
                data={tables}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabDateRange={tabDateRange}
                onTabDateRangeChange={onTabDateRangeChange}
                isTabLoading={isTabLoading}
            />

            <div className="rounded-2xl border bg-card/60 p-4 shadow-sm backdrop-blur-sm sm:p-6">
                <h2 className="mb-4 text-sm font-semibold text-muted-foreground">Transactions feed</h2>
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border bg-muted/15 px-3 py-3">
                    <p className="text-xs text-muted-foreground">Date range for transaction API (separate from stats)</p>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 justify-between gap-2 rounded-xl border-dashed"
                            >
                                <CalendarIcon className="h-3.5 w-3.5 opacity-70" />
                                <span className="text-xs font-medium">
                                    {format(filters.transactionsDateRange.from, 'MMM d, y')} —{' '}
                                    {format(filters.transactionsDateRange.to, 'MMM d, y')}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="range"
                                selected={{
                                    from: filters.transactionsDateRange.from,
                                    to: filters.transactionsDateRange.to,
                                }}
                                onSelect={(next) => {
                                    if (next?.from && next?.to) {
                                        setSectionDateRange('transactionsDateRange', next as DateRange);
                                    }
                                }}
                                numberOfMonths={2}
                                disabled={(date) => date > new Date()}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <DashboardTransactionsCard
                    transactions={transactions}
                    hasMore={transactionsHasMore}
                    isLoadingMore={isLoadingTransactions}
                    isInitialDashboardLoad={isLoadingTransactions && transactions.length === 0}
                    onLoadMore={() => void fetchMoreTransactions()}
                />
            </div>
        </div>
    );
}
