'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PaginationMeta } from '@/types/tour/booking.types';
import { cn } from '@/lib/utils';
import { spaceMono, jetbrainsMono } from '@/styles/fonts';

interface BookingsPaginationProps {
    pagination: PaginationMeta;
    onPageChange: (page: number) => void;
}

// Neumorphic icon nav button
function NavBtn({
    onClick,
    disabled,
    children,
}: {
    onClick: () => void;
    disabled: boolean;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-150',
                'bg-[#E7E5E4] text-[#1E2938]/50',
                disabled
                    ? 'opacity-30 cursor-not-allowed shadow-none'
                    : [
                        'shadow-[3px_3px_6px_#c8c6c4,-2px_-2px_5px_#ffffff]',
                        'hover:shadow-[4px_4px_8px_#c8c6c4,-3px_-3px_6px_#ffffff] hover:text-[#006666]',
                        'active:shadow-[inset_2px_2px_4px_#c8c6c4,inset_-1px_-1px_3px_#ffffff]',
                    ].join(' '),
            )}
            aria-disabled={disabled}
        >
            {children}
        </button>
    );
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
            {/* Count label */}
            <p
                className="text-[11px] text-[#1E2938]/45"
                style={jetbrainsMono.style}
            >
                Showing{' '}
                <span className="text-[#1E2938]/70 font-semibold">{from}–{to}</span>{' '}
                of{' '}
                <span className="text-[#1E2938]/70 font-semibold">{total}</span>{' '}
                bookings
            </p>

            {/* Page controls */}
            <div className="flex items-center gap-1.5" style={spaceMono.style}>
                <NavBtn disabled={!hasPrevPage} onClick={() => onPageChange(1)}>
                    <ChevronsLeft size={13} />
                </NavBtn>
                <NavBtn disabled={!hasPrevPage} onClick={() => onPageChange(page - 1)}>
                    <ChevronLeft size={13} />
                </NavBtn>

                <div className="flex items-center gap-1 mx-1">
                    {pages.map((p, idx) =>
                        p === '...' ? (
                            <span
                                key={`ellipsis-${idx}`}
                                className="text-[#1E2938]/35 px-1 text-xs"
                                style={jetbrainsMono.style}
                            >
                                …
                            </span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => onPageChange(p as number)}
                                className={cn(
                                    'h-8 min-w-[32px] px-2.5 rounded-lg text-[11px] font-medium transition-all duration-150',
                                    p === page
                                        // Active page: pressed inset with teal accent
                                        ? [
                                            'bg-[#E7E5E4] text-[#006666]',
                                            'shadow-[inset_3px_3px_6px_#c0bebb,inset_-2px_-2px_5px_#ffffff]',
                                            'ring-1 ring-[#006666]/20',
                                        ].join(' ')
                                        // Inactive: raised
                                        : [
                                            'bg-[#E7E5E4] text-[#1E2938]/50',
                                            'shadow-[3px_3px_6px_#c8c6c4,-2px_-2px_5px_#ffffff]',
                                            'hover:text-[#006666] hover:shadow-[4px_4px_8px_#c8c6c4,-3px_-3px_6px_#ffffff]',
                                            'active:shadow-[inset_2px_2px_4px_#c8c6c4,inset_-1px_-1px_3px_#ffffff]',
                                        ].join(' '),
                                )}
                                style={jetbrainsMono.style}
                            >
                                {p}
                            </button>
                        )
                    )}
                </div>

                <NavBtn disabled={!hasNextPage} onClick={() => onPageChange(page + 1)}>
                    <ChevronRight size={13} />
                </NavBtn>
                <NavBtn disabled={!hasNextPage} onClick={() => onPageChange(totalPages)}>
                    <ChevronsRight size={13} />
                </NavBtn>
            </div>
        </motion.div>
    );
}