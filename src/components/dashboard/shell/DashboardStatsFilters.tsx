'use client';

import { format } from 'date-fns';
import { CalendarIcon, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { DateRange, DashboardFilters } from '@/types/dashboard/dashboard.type';
import { TOUR_STATUS } from '@/constants/tour/tour.const';
import { EMPLOYEE_STATUS } from '@/constants/employee/employee.const';
import { REPORT_STATUS } from '@/constants/tour/report.const';
import { BOOKING_STATUS } from '@/constants/tour/tour-booking.const';
import { cn } from '@/lib/utils';

type DashboardStatsFiltersProps = {
    filters: DashboardFilters;
    isLoadingStats: boolean;
    onStatsDateRangeChange: (range: DateRange) => void;
    onTourStatus: (v: string | undefined) => void;
    onEmployeeStatus: (v: string | undefined) => void;
    onReportStatus: (v: string | undefined) => void;
    onBookingStatus: (v: string | undefined) => void;
};

export function DashboardStatsFilters({
    filters,
    isLoadingStats,
    onStatsDateRangeChange,
    onTourStatus,
    onEmployeeStatus,
    onReportStatus,
    onBookingStatus,
}: DashboardStatsFiltersProps) {
    const range = filters.statsDateRange;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-4 py-4 shadow-sm dark:border-slate-700/60 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-slate-800/80 sm:px-6">
            {/* Glossy top sheen */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/10"
                aria-hidden
            />

            <div className="mb-3 flex flex-wrap items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800/10 dark:bg-slate-200/10">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" aria-hidden />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                    Stats &amp; charts range
                </span>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
                {/* Date range picker */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                'h-11 justify-between gap-2 rounded-xl border-slate-200 bg-white/90 px-4 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md dark:border-slate-600 dark:bg-slate-700/80 dark:hover:bg-slate-700 sm:min-w-[240px]',
                                isLoadingStats && 'opacity-60',
                            )}
                            disabled={isLoadingStats}
                        >
                            <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
                            <span className="truncate text-left text-sm font-medium text-slate-700 dark:text-slate-200">
                                {range.from && range.to ? (
                                    <>
                                        {format(range.from, 'MMM d, y')} — {format(range.to, 'MMM d, y')}
                                    </>
                                ) : (
                                    'Stats range'
                                )}
                            </span>
                            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="range"
                            selected={{ from: range.from, to: range.to }}
                            onSelect={(next) => {
                                if (next?.from && next?.to) onStatsDateRangeChange(next as DateRange);
                            }}
                            numberOfMonths={2}
                            disabled={(date) => date > new Date()}
                        />
                    </PopoverContent>
                </Popover>

                <div className="flex flex-wrap gap-3">
                    <Select
                        value={filters.tourStatus ?? 'all'}
                        onValueChange={(val) => onTourStatus(val === 'all' ? undefined : val)}
                    >
                        <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white/90 shadow-sm dark:border-slate-600 dark:bg-slate-700/80 sm:w-[150px]">
                            <SelectValue placeholder="Tour status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All tours</SelectItem>
                            {Object.values(TOUR_STATUS).map((s) => (
                                <SelectItem key={s} value={s}>
                                    {s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.employeeStatus ?? 'all'}
                        onValueChange={(val) => onEmployeeStatus(val === 'all' ? undefined : val)}
                    >
                        <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white/90 shadow-sm dark:border-slate-600 dark:bg-slate-700/80 sm:w-[160px]">
                            <SelectValue placeholder="Employee" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All employees</SelectItem>
                            {Object.values(EMPLOYEE_STATUS).map((s) => (
                                <SelectItem key={s} value={s}>
                                    {String(s).replace(/_/g, ' ')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.reportStatus ?? 'all'}
                        onValueChange={(val) => onReportStatus(val === 'all' ? undefined : val)}
                    >
                        <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white/90 shadow-sm dark:border-slate-600 dark:bg-slate-700/80 sm:w-[160px]">
                            <SelectValue placeholder="Reports" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All reports</SelectItem>
                            {Object.values(REPORT_STATUS).map((s) => (
                                <SelectItem key={s} value={s}>
                                    {String(s).replace(/_/g, ' ')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.bookingStatus ?? 'all'}
                        onValueChange={(val) => onBookingStatus(val === 'all' ? undefined : val)}
                    >
                        <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white/90 shadow-sm dark:border-slate-600 dark:bg-slate-700/80 sm:w-[160px]">
                            <SelectValue placeholder="Bookings" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All bookings</SelectItem>
                            {Object.values(BOOKING_STATUS).map((s) => (
                                <SelectItem key={s} value={s}>
                                    {String(s).replace(/-/g, ' ')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}