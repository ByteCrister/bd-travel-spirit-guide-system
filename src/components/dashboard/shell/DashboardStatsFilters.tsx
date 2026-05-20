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

const brand = {
    primary: '#006666',
    surface: '#E7E5E4',
    text: '#1E2938',
    muted: '#6B7A8D',
    border: 'rgba(0,102,102,0.12)',
    shadowOut: '5px 5px 10px #c8c6c4, -5px -5px 10px #ffffff',
    shadowIn: 'inset 3px 3px 6px #c8c6c4, inset -3px -3px 6px #ffffff',
};

const selectStyle = {
    background: brand.surface,
    boxShadow: brand.shadowIn,
    border: `1px solid ${brand.border}`,
    color: brand.text,
    fontFamily: 'var(--font-jetbrains-mono)',
    fontSize: '12px',
};

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
        <div
            className="relative overflow-hidden rounded-2xl px-4 py-4 sm:px-6"
            style={{
                background: brand.surface,
                boxShadow: brand.shadowOut,
                border: `1px solid ${brand.border}`,
            }}
        >
            {/* Teal left accent bar */}
            <div
                className="pointer-events-none absolute inset-y-0 left-0 w-[3px] rounded-l-2xl"
                style={{ background: `linear-gradient(180deg, ${brand.primary}, #00a8a8)` }}
                aria-hidden
            />

            {/* Label row */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
                <div
                    className="flex h-6 w-6 items-center justify-center rounded-lg"
                    style={{ boxShadow: brand.shadowOut, background: brand.surface }}
                >
                    <SlidersHorizontal className="h-3 w-3" style={{ color: brand.primary }} aria-hidden />
                </div>
                <span
                    className="text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: brand.primary, fontFamily: 'var(--font-space-mono)' }}
                >
                    Stats &amp; charts range
                </span>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
                {/* Date range picker */}
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            className={cn(
                                'flex h-10 items-center justify-between gap-2 rounded-xl px-4 text-xs font-medium transition-all sm:min-w-[240px]',
                                isLoadingStats && 'opacity-50',
                            )}
                            disabled={isLoadingStats}
                            style={{
                                background: brand.surface,
                                boxShadow: isLoadingStats ? brand.shadowIn : brand.shadowOut,
                                border: `1px solid ${brand.border}`,
                                color: brand.text,
                                fontFamily: 'var(--font-jetbrains-mono)',
                            }}
                        >
                            <CalendarIcon className="h-3.5 w-3.5 shrink-0" style={{ color: brand.primary }} />
                            <span className="flex-1 truncate text-left">
                                {range.from && range.to ? (
                                    <>
                                        {format(range.from, 'MMM d, y')} — {format(range.to, 'MMM d, y')}
                                    </>
                                ) : (
                                    'Stats range'
                                )}
                            </span>
                            <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color: brand.muted }} />
                        </button>
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

                {/* Status filters */}
                <div className="flex flex-wrap gap-3">
                    {[
                        { value: filters.tourStatus, onChange: onTourStatus, all: 'All tours', options: TOUR_STATUS, width: '140px', label: 'Tour status' },
                        { value: filters.employeeStatus, onChange: onEmployeeStatus, all: 'All employees', options: EMPLOYEE_STATUS, width: '152px', label: 'Employee' },
                        { value: filters.reportStatus, onChange: onReportStatus, all: 'All reports', options: REPORT_STATUS, width: '152px', label: 'Reports', replace: /_/g },
                        { value: filters.bookingStatus, onChange: onBookingStatus, all: 'All bookings', options: BOOKING_STATUS, width: '152px', label: 'Bookings', replace: /-/g },
                    ].map(({ value, onChange, all, options, width, replace }) => (
                        <Select
                            key={all}
                            value={value ?? 'all'}
                            onValueChange={(val) => onChange(val === 'all' ? undefined : val)}
                        >
                            <SelectTrigger
                                className="h-10 w-full rounded-xl text-xs"
                                style={{ ...selectStyle, width, minWidth: width }}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                                    {all}
                                </SelectItem>
                                {Object.values(options).map((s) => (
                                    <SelectItem key={s} value={s} className="text-xs" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                                        {replace ? String(s).replace(replace, ' ') : String(s)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ))}
                </div>
            </div>
        </div>
    );
}