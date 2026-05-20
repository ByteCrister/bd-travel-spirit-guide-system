'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { jakarta } from '@/styles/fonts';
import { cn } from '@/lib/utils';
import { BookingSummaryCards } from './BookingSummaryCards';
import { BookingsFilters } from './BookingsFilters';
import { BookingsTable } from './BookingsTable';
import { BookingsPagination } from './BookingsPagination';
import { BookingDetailSheet } from './BookingDetailSheet';
import { Breadcrumbs } from '@/components/global/Breadcrumbs';

export function BookingsPage() {
    // ── Store state ──────────────────────────────────────────────────────────
    const bookings = useBookings();
    const pagination = useBookingsPagination();
    const filters = useBookingsFilters();
    const isLoading = useBookingsLoading();
    const summary = useBookingsSummary();
    const error = useBookingsError();

    const {
        setFilters,
        resetFilters,
        fetchBookings,
        fetchSummary,
    } = useBookingActions();

    // ── Detail sheet state ───────────────────────────────────────────────────
    const [selectedBooking, setSelectedBooking] = useState<IBookingPopulated | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    // ── Initial data load ────────────────────────────────────────────────────
    useEffect(() => {
        fetchBookings();
        fetchSummary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Re-fetch whenever filters change (skip first render) ─────────────────
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        fetchBookings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleFilterChange = (newFilters: Partial<BookingsFilterState>) => {
        setFilters(newFilters);
    };

    const handleReset = () => {
        resetFilters();
    };

    const handlePageChange = (page: number) => {
        setFilters({ page });
    };

    const handleViewDetail = (booking: IBookingPopulated) => {
        setSelectedBooking(booking);
        setSheetOpen(true);
    };

    const handleRefresh = () => {
        fetchBookings(true);
        fetchSummary(true);
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50 px-6 py-8 space-y-6" style={jakarta.style}>

            {/* ── Breadcrumbs ───────────────────────────────────────────────── */}
            <Breadcrumbs
                items={[
                    { label: 'Operations', href: '/operations' },
                    { label: 'Bookings', href: '/operations/bookings' },
                ]}
                className="text-xs"
            />

            {/* ── Page header ─────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center justify-between flex-wrap gap-4"
            >
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
                            <BookOpen size={17} className="text-indigo-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                            Bookings
                        </h1>
                    </div>
                    <p className="text-xs text-slate-400 ml-12 font-sans">
                        Manage and monitor all tour bookings
                    </p>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="h-9 px-3.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-white gap-2 text-xs font-sans shadow-sm"
                >
                    <RefreshCw size={13} className={cn(isLoading && 'animate-spin')} />
                    Refresh
                </Button>
            </motion.div>

            {/* ── Summary cards ────────────────────────────────────────────── */}
            {summary ? (
                <BookingSummaryCards summary={summary} />
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-28 rounded-2xl bg-white border border-slate-200 animate-pulse"
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
                    className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-600 font-sans"
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