'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookingsFilterState } from '@/types/tour/booking.types';
import { BOOKING_STATUS, BOOKING_PAYMENT_STATUS, BookingStatus, BookingPaymentStatus } from '@/constants/tour/tour-booking.const';
import { cn } from '@/lib/utils';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'; // adjust path as needed

interface BookingsFiltersProps {
    filters: BookingsFilterState;
    onFilterChange: (filters: Partial<BookingsFilterState>) => void;
    onReset: () => void;
    isLoading?: boolean;
}

const DATE_PRESETS = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 days' },
    { value: 'last30days', label: 'Last 30 days' },
    { value: 'thismonth', label: 'This month' },
    { value: 'lastmonth', label: 'Last month' },
    { value: 'custom', label: 'Custom range' },
];

export function BookingsFilters({ filters, onFilterChange, onReset, isLoading }: BookingsFiltersProps) {
    const [expanded, setExpanded] = useState(false);
    const [searchValue, setSearchValue] = useState(filters.search ?? '');

    // Sync local search state when external filters change (e.g., reset)
    useEffect(() => {
        setSearchValue(filters.search ?? '');
    }, [filters.search]);

    // Debounced search update – only triggers after user stops typing
    const debouncedSearchUpdate = useDebouncedCallback((value: string) => {
        onFilterChange({ search: value || undefined });
    }, 400);

    // Cleanup pending debounce on unmount
    useEffect(() => {
        return () => {
            debouncedSearchUpdate.cancel?.();
        };
    }, [debouncedSearchUpdate]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchValue(newValue);
        debouncedSearchUpdate(newValue);
    };

    const handleSearchSubmit = () => {
        // On Enter key: cancel pending debounce and update immediately
        debouncedSearchUpdate.cancel?.();
        onFilterChange({ search: searchValue || undefined });
    };

    const handleClearSearch = () => {
        debouncedSearchUpdate.cancel?.();
        setSearchValue('');
        onFilterChange({ search: undefined });
    };

    const activeFilterCount = [
        filters.status,
        filters.paymentStatus,
        filters.fromDate,
        filters.toDate,
        filters.search,
    ].filter(Boolean).length;

    return (
        <div className="space-y-3">
            {/* Primary filter row */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-[260px]">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Search bookings, traveler, tour…"
                        value={searchValue}
                        onChange={handleSearchChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                        className="pl-9 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400 h-10 rounded-xl shadow-sm"
                    />
                    {searchValue && (
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Status filter */}
                <Select
                    value={typeof filters.status === 'string' ? filters.status : 'all'}
                    onValueChange={(val) => onFilterChange({ status: val === 'all' ? undefined : val as BookingStatus })}
                >
                    <SelectTrigger className="w-[160px] bg-white border-slate-200 text-slate-700 h-10 rounded-xl shadow-sm focus:ring-indigo-500/30">
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-700 shadow-lg">
                        <SelectItem value="all">All statuses</SelectItem>
                        {Object.values(BOOKING_STATUS).map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">{s.replace('-', ' ')}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Payment status */}
                <Select
                    value={typeof filters.paymentStatus === 'string' ? filters.paymentStatus : 'all'}
                    onValueChange={(val) => onFilterChange({ paymentStatus: val === 'all' ? undefined : val as BookingPaymentStatus })}
                >
                    <SelectTrigger className="w-[170px] bg-white border-slate-200 text-slate-700 h-10 rounded-xl shadow-sm focus:ring-indigo-500/30">
                        <SelectValue placeholder="Payment status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-700 shadow-lg">
                        <SelectItem value="all">All payments</SelectItem>
                        {Object.values(BOOKING_PAYMENT_STATUS).map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Sort */}
                <Select
                    value={`${filters.sortBy ?? 'bookedAt'}-${filters.sortOrder ?? 'desc'}`}
                    onValueChange={(val) => {
                        const [sortBy, sortOrder] = val.split('-') as [BookingsFilterState['sortBy'], 'asc' | 'desc'];
                        onFilterChange({ sortBy, sortOrder });
                    }}
                >
                    <SelectTrigger className="w-[180px] bg-white border-slate-200 text-slate-700 h-10 rounded-xl shadow-sm focus:ring-indigo-500/30">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-700 shadow-lg">
                        <SelectItem value="bookedAt-desc">Newest first</SelectItem>
                        <SelectItem value="bookedAt-asc">Oldest first</SelectItem>
                        <SelectItem value="totalPaid-desc">Highest paid</SelectItem>
                        <SelectItem value="totalPaid-asc">Lowest paid</SelectItem>
                        <SelectItem value="bookingReference-asc">Reference A–Z</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex items-center gap-2 ml-auto">
                    {/* Advanced filters toggle */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                        className={cn(
                            'h-10 px-3.5 rounded-xl border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 gap-2 transition-all shadow-sm',
                            expanded && 'border-indigo-300 text-indigo-600 bg-indigo-50'
                        )}
                    >
                        <SlidersHorizontal size={15} />
                        <span className="text-xs">Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="bg-indigo-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                {activeFilterCount}
                            </span>
                        )}
                        <ChevronDown size={13} className={cn('transition-transform', expanded && 'rotate-180')} />
                    </Button>

                    {activeFilterCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onReset}
                            className="h-10 px-3 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 gap-1.5"
                        >
                            <RotateCcw size={13} />
                            <span className="text-xs">Reset</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Advanced filter panel */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-wrap gap-3">
                            {/* Date preset */}
                            <div className="flex flex-col gap-1.5 min-w-[180px]">
                                <label className="text-[11px] uppercase tracking-widest text-slate-500 font-medium">Date range</label>
                                <Select
                                    value={filters.dateRangePreset ?? ''}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    onValueChange={(val) => onFilterChange({ dateRangePreset: val as any })}
                                >
                                    <SelectTrigger className="bg-white border-slate-200 text-slate-700 h-9 rounded-xl text-sm shadow-sm">
                                        <SelectValue placeholder="Select range" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200 text-slate-700 shadow-lg">
                                        {DATE_PRESETS.map((p) => (
                                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Custom date from */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] uppercase tracking-widest text-slate-500 font-medium">From</label>
                                <Input
                                    type="date"
                                    value={filters.fromDate ?? ''}
                                    onChange={(e) => onFilterChange({ fromDate: e.target.value || undefined, dateRangePreset: 'custom' })}
                                    className="bg-white border-slate-200 text-slate-700 h-9 rounded-xl text-sm focus-visible:ring-indigo-500/30 w-[160px] shadow-sm"
                                />
                            </div>

                            {/* Custom date to */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] uppercase tracking-widest text-slate-500 font-medium">To</label>
                                <Input
                                    type="date"
                                    value={filters.toDate ?? ''}
                                    onChange={(e) => onFilterChange({ toDate: e.target.value || undefined, dateRangePreset: 'custom' })}
                                    className="bg-white border-slate-200 text-slate-700 h-9 rounded-xl text-sm focus-visible:ring-indigo-500/30 w-[160px] shadow-sm"
                                />
                            </div>

                            {/* Limit */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] uppercase tracking-widest text-slate-500 font-medium">Per page</label>
                                <Select
                                    value={String(filters.limit ?? 20)}
                                    onValueChange={(val) => onFilterChange({ limit: Number(val) })}
                                >
                                    <SelectTrigger className="bg-white border-slate-200 text-slate-700 h-9 rounded-xl text-sm w-[100px] shadow-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200 text-slate-700 shadow-lg">
                                        {[10, 20, 50, 100].map((n) => (
                                            <SelectItem key={n} value={String(n)}>{n} rows</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}