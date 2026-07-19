// components/faqs/FaqPagination.tsx
'use client';

import React from 'react';

// ─── Design Tokens ───────────────────────────────────────────────────────────
// surface: #E7E5E4 | text: #1E2938 | primary: #006666
// outer: 8px 8px 16px #cac8c7, -8px -8px 16px #ffffff
// active page: inset 2px 2px 5px #004d4d, inset -2px -2px 5px #009999

interface FaqPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function FaqPagination({ currentPage, totalPages, onPageChange }: FaqPaginationProps) {
    const getPageNumbers = (): number[] => {
        const pages: number[] = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        const end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    if (totalPages <= 1) return null;

    const pageNumbers = getPageNumbers();
    const showStartFirst = pageNumbers[0] > 1;
    const showStartEllipsis = pageNumbers[0] > 2;
    const showEndLast = pageNumbers[pageNumbers.length - 1] < totalPages;
    const showEndEllipsis = pageNumbers[pageNumbers.length - 1] < totalPages - 1;

    const navBtn =
        'inline-flex h-9 w-9 items-center justify-center rounded-full ' +
        'bg-[#E7E5E4] text-[#1E2938] ' +
        ' ' +
        'hover: ' +
        'active: ' +
        'disabled:pointer-events-none disabled:opacity-35 ' +
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006666] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E5E4] ' +
        'transition-shadow duration-150 select-none';

    return (
        <nav
            aria-label="FAQ pagination"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#E7E5E4] px-3 py-2
                "
        >
            {/* Previous */}
            <button
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={navBtn}
                aria-label="Previous page"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* First page */}
            {showStartFirst && (
                <>
                    <PageButton page={1} currentPage={currentPage} onClick={onPageChange} />
                    {showStartEllipsis && (
                        <span
                            className="w-6 text-center font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/40"
                            aria-hidden="true"
                        >
                            …
                        </span>
                    )}
                </>
            )}

            {/* Page window */}
            {pageNumbers.map((page) => (
                <PageButton key={page} page={page} currentPage={currentPage} onClick={onPageChange} />
            ))}

            {/* Last page */}
            {showEndLast && (
                <>
                    {showEndEllipsis && (
                        <span
                            className="w-6 text-center font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/40"
                            aria-hidden="true"
                        >
                            …
                        </span>
                    )}
                    <PageButton page={totalPages} currentPage={currentPage} onClick={onPageChange} />
                </>
            )}

            {/* Next */}
            <button
                onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={navBtn}
                aria-label="Next page"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </nav>
    );
}

function PageButton({
    page,
    currentPage,
    onClick,
}: {
    page: number;
    currentPage: number;
    onClick: (page: number) => void;
}) {
    const isActive = page === currentPage;

    return (
        <button
            onClick={() => onClick(page)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={`Page ${page}`}
            className={[
                'inline-flex h-9 w-9 items-center justify-center rounded-full',
                'font-[family-name:var(--font-jetbrains-mono)] text-sm',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-[#E7E5E4]',
                'transition-shadow duration-150 select-none',
                isActive
                    ? 'bg-[#006666] text-white '
                    : [
                        'bg-[#E7E5E4] text-[#1E2938]',
                        '',
                        'hover:',
                        'active:',
                    ].join(' '),
            ].join(' ')}
        >
            {page}
        </button>
    );
}