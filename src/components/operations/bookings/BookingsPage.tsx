'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, RefreshCw } from 'lucide-react';
import {
    useBookings,
    useBookingsPagination,
    useBookingsFilters,
    useBookingsLoading,
    useBookingsSummary,
    useBookingsError,
    useBookingActions,
} from '@/store/booking.store';
import type { IBookingPopulated, BookingsFilterState } from '@/types/tour/booking.types';
import { spaceMono, jetbrainsMono } from '@/styles/fonts';
import { cn } from '@/lib/utils';
import { BookingSummaryCards } from './BookingSummaryCards';
import { BookingsFilters } from './BookingsFilters';
import { BookingsTable } from './BookingsTable';
import { BookingsPagination } from './BookingsPagination';
import { BookingDetailSheet } from './BookingDetailSheet';
import { Breadcrumbs } from '@/components/global/Breadcrumbs';

export function BookingsPage() {
    const bookings = useBookings();
    const pagination = useBookingsPagination();
    const filters = useBookingsFilters();
    const isLoading = useBookingsLoading();
    const summary = useBookingsSummary();
    const error = useBookingsError();

    const { setFilters, resetFilters, fetchBookings, fetchSummary } = useBookingActions();

    const [selectedBooking, setSelectedBooking] = useState<IBookingPopulated | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    useEffect(() => {
        fetchBookings();
        fetchSummary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        fetchBookings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const handleFilterChange = (newFilters: Partial<BookingsFilterState>) => setFilters(newFilters);
    const handleReset = () => resetFilters();
    const handlePageChange = (page: number) => setFilters({ page });
    const handleViewDetail = (booking: IBookingPopulated) => { setSelectedBooking(booking); setSheetOpen(true); };
    const handleRefresh = () => { fetchBookings(true); fetchSummary(true); };

    return (
        // Neumorphic page background — the monochromatic stone surface
        <div
            className="min-h-screen bg-[#E7E5E4] p-2 sm:p-3 lg:p-5 space-y-6"
            style={spaceMono.style}
        >
            {/* ── Breadcrumbs ─────────────────────────────────────────────── */}
            <Breadcrumbs
                items={[
                    { label: 'Operations', href: '/operations' },
                    { label: 'Bookings', href: '/operations/bookings' },
                ]}
                className="text-[10px] text-[#1E2938]/40 uppercase tracking-widest"
            />

            {/* ── Page header ──────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center justify-between flex-wrap gap-4"
            >
                <div className="flex items-center gap-4">
                    {/* Icon — neumorphic outset raised circle */}
                    <div className={cn(
                        'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0',
                        'bg-[#E7E5E4]',
                        '',
                    )}>
                        <BookOpen size={17} className="text-[#006666]" />
                    </div>

                    <div>
                        <h1
                            className="text-2xl font-bold text-[#1E2938] tracking-tight leading-none"
                            style={spaceMono.style}
                        >
                            Bookings
                        </h1>
                        <p
                            className="text-[10px] text-[#1E2938]/40 uppercase tracking-[0.14em] mt-1"
                            style={jetbrainsMono.style}
                        >
                            Manage and monitor all tour bookings
                        </p>
                    </div>
                </div>

                {/* Refresh — neumorphic raised button that presses on click */}
                <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className={cn(
                        'h-9 px-4 rounded-xl inline-flex items-center gap-2 text-xs font-medium transition-all duration-150',
                        'bg-[#E7E5E4] text-[#1E2938]/55',
                        isLoading
                            ? ' cursor-not-allowed opacity-70'
                            : [
                                '',
                                'hover: hover:text-[#006666]',
                                'active:',
                            ].join(' '),
                    )}
                    style={jetbrainsMono.style}
                >
                    <RefreshCw size={13} className={cn(isLoading && 'animate-spin')} />
                    Refresh
                </button>
            </motion.div>

            {/* ── Summary cards ────────────────────────────────────────────── */}
            {summary ? (
                <BookingSummaryCards summary={summary} />
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                'h-28 rounded-2xl animate-pulse',
                                'bg-[#E7E5E4]',
                                '',
                            )}
                        />
                    ))}
                </div>
            )}

            {/* ── Filters ──────────────────────────────────────────────────── */}
            <BookingsFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
                isLoading={isLoading}
            />

            {/* ── Error banner ─────────────────────────────────────────────── */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        'rounded-xl px-4 py-3 text-xs text-[#FF2157]',
                        'bg-[#E7E5E4]',
                        '',
                    )}
                    style={jetbrainsMono.style}
                >
                    {error}
                </motion.div>
            )}

            {/* ── Table ────────────────────────────────────────────────────── */}
            <BookingsTable
                bookings={bookings}
                isLoading={isLoading}
                onViewDetail={handleViewDetail}
            />

            {/* ── Pagination ───────────────────────────────────────────────── */}
            {pagination && pagination.total > 0 && (
                <BookingsPagination
                    pagination={pagination}
                    onPageChange={handlePageChange}
                />
            )}

            {/* ── Detail sheet ─────────────────────────────────────────────── */}
            <BookingDetailSheet
                booking={selectedBooking}
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
            />
        </div>
    );
}