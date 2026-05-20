'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaginationMeta } from '@/types/tour/booking.types';
import { cn } from '@/lib/utils';

interface BookingsPaginationProps {
    pagination: PaginationMeta;
    onPageChange: (page: number) => void;
}

export function BookingsPagination({ pagination, onPageChange }: BookingsPaginationProps) {
    const { page, totalPages, total, limit, hasNextPage, hasPrevPage } = pagination;

    const from = (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);

    const getPageNumbers = (): (number | '...')[] => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

        const pages: (number | '...')[] = [1];
        if (page > 3) pages.push('...');
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
            pages.push(i);
        }
        if (page < totalPages - 2) pages.push('...');
        pages.push(totalPages);
        return pages;
    };

    const pages = getPageNumbers();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between gap-4 flex-wrap"
        >
            <p className="text-xs text-slate-500">
                Showing <span className="text-slate-700 font-medium">{from}–{to}</span>{' '}
                of <span className="text-slate-700 font-medium">{total}</span> bookings
            </p>

            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={!hasPrevPage}
                    onClick={() => onPageChange(1)}
                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                >
                    <ChevronsLeft size={14} />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={!hasPrevPage}
                    onClick={() => onPageChange(page - 1)}
                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                >
                    <ChevronLeft size={14} />
                </Button>

                <div className="flex items-center gap-1 mx-1">
                    {pages.map((p, idx) =>
                        p === '...' ? (
                            <span key={`ellipsis-${idx}`} className="text-slate-400 px-1 text-sm">…</span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => onPageChange(p as number)}
                                className={cn(
                                    'h-8 min-w-[32px] px-2.5 rounded-lg text-xs font-medium transition-all duration-150',
                                    p === page
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                )}
                            >
                                {p}
                            </button>
                        )
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    disabled={!hasNextPage}
                    onClick={() => onPageChange(page + 1)}
                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                >
                    <ChevronRight size={14} />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={!hasNextPage}
                    onClick={() => onPageChange(totalPages)}
                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                >
                    <ChevronsRight size={14} />
                </Button>
            </div>
        </motion.div>
    );
}