'use client';

import { format } from 'date-fns';
import { CalendarIcon, ChevronDown, Filter } from 'lucide-react';
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
        <div className="rounded-2xl border bg-muted/20 px-4 py-4 sm:px-6">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wide">Stats & charts range</span>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                'h-11 justify-between gap-2 rounded-2xl border-dashed px-4 sm:min-w-[220px]',
                                isLoadingStats && 'opacity-70',
                            )}
                            disabled={isLoadingStats}
                        >
                            <CalendarIcon className="h-4 w-4 shrink-0 opacity-70" />
                            <span className="truncate text-left text-sm font-medium">
                                {range.from && range.to ? (
                                    <>
                                        {format(range.from, 'MMM d, y')} — {format(range.to, 'MMM d, y')}
                                    </>
                                ) : (
                                    'Stats range'
                                )}
                            </span>
                            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
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

                <Select
                    value={filters.tourStatus ?? 'all'}
                    onValueChange={(val) => onTourStatus(val === 'all' ? undefined : val)}
                >
                    <SelectTrigger className="h-11 w-full rounded-2xl sm:w-[150px]">
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
                    <SelectTrigger className="h-11 w-full rounded-2xl sm:w-[160px]">
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
                    <SelectTrigger className="h-11 w-full rounded-2xl sm:w-[160px]">
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
                    <SelectTrigger className="h-11 w-full rounded-2xl sm:w-[160px]">
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
    );
}
