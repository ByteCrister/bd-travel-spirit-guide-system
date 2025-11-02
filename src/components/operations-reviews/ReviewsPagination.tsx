// components/reviews/ReviewsPagination.tsx
"use client";

import { JSX } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react";

interface Props {
    page: number;
    pages: number;
    limit: number;
    total?: number;
    onChangePage: (next: number) => void;
    onChangeLimit: (next: number) => void;
}

export default function ReviewsPagination({
    page,
    pages,
    limit,
    total,
    onChangePage,
    onChangeLimit
}: Props): JSX.Element {
    const goFirst = () => onChangePage(1);
    const goPrev = () => onChangePage(Math.max(1, page - 1));
    const goNext = () => onChangePage(Math.min(pages, page + 1));
    const goLast = () => onChangePage(pages);

    const isFirstPage = page === 1;
    const isLastPage = page === pages;

    // Generate visible page numbers with ellipsis logic
    const getPageNumbers = (): (number | string)[] => {
        if (pages <= 7) {
            return Array.from({ length: pages }, (_, i) => i + 1);
        }

        const pageNumbers: (number | string)[] = [];

        if (page <= 4) {
            // Near start: 1 2 3 4 5 ... last
            for (let i = 1; i <= Math.min(5, pages); i++) {
                pageNumbers.push(i);
            }
            if (pages > 5) {
                pageNumbers.push('...', pages);
            }
        } else if (page >= pages - 3) {
            // Near end: 1 ... last-4 last-3 last-2 last-1 last
            pageNumbers.push(1, '...');
            for (let i = Math.max(pages - 4, 2); i <= pages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Middle: 1 ... page-1 page page+1 ... last
            pageNumbers.push(1, '...', page - 1, page, page + 1, '...', pages);
        }

        return pageNumbers;
    };

    const pageNumbers = getPageNumbers();

    // Calculate range display
    const startItem = total ? (page - 1) * limit + 1 : 0;
    const endItem = total ? Math.min(page * limit, total) : 0;

    return (
        <div className="w-full">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 rounded-xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/50 px-5 py-4 shadow-md backdrop-blur-sm">
                {/* Results info with icon */}
                <div className="flex items-center gap-3 text-sm text-gray-600 order-2 lg:order-1">
                    <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        {total !== undefined ? (
                            <div className="space-y-0.5">
                                <p className="font-medium text-gray-900">
                                    {startItem.toLocaleString()} – {endItem.toLocaleString()} <span className="text-gray-400 font-normal">of</span> {total.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">Total results</p>
                            </div>
                        ) : (
                            <div className="space-y-0.5">
                                <p className="font-medium text-gray-900">
                                    Page {page} <span className="text-gray-400 font-normal">of</span> {pages}
                                </p>
                                <p className="text-xs text-gray-500">Navigation</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Page controls with modern design */}
                <div className="flex items-center gap-2 order-1 lg:order-2">
                    {/* First & Previous */}
                    <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
                        <button
                            data-testid="pagination-first"
                            className="group relative inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
                            onClick={goFirst}
                            disabled={isFirstPage}
                            aria-label="First page"
                            title="First page"
                        >
                            <ChevronsLeft className="h-4 w-4 transition-transform group-hover:scale-110" />
                        </button>
                        <button
                            data-testid="pagination-prev"
                            className="group relative inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
                            onClick={goPrev}
                            disabled={isFirstPage}
                            aria-label="Previous page"
                            title="Previous page"
                        >
                            <ChevronLeft className="h-4 w-4 transition-transform group-hover:scale-110" />
                        </button>
                    </div>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                        {pageNumbers.map((p, idx) =>
                            typeof p === 'string' ? (
                                <div
                                    key={`ellipsis-${idx}`}
                                    className="inline-flex items-center justify-center w-9 h-9 text-gray-400"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </div>
                            ) : (
                                <button
                                    key={p}
                                    className={`relative inline-flex items-center justify-center min-w-[2.25rem] h-9 rounded-lg px-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${p === page
                                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105 focus:ring-blue-500/40"
                                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:scale-105 focus:ring-gray-400/40"
                                        }`}
                                    onClick={() => onChangePage(p)}
                                    aria-current={p === page ? "page" : undefined}
                                >
                                    {p}
                                    {p === page && (
                                        <span className="absolute inset-0 rounded-lg bg-white/20 animate-pulse" />
                                    )}
                                </button>
                            )
                        )}
                    </div>

                    {/* Next & Last */}
                    <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
                        <button
                            data-testid="pagination-next"
                            className="group relative inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
                            onClick={goNext}
                            disabled={isLastPage}
                            aria-label="Next page"
                            title="Next page"
                        >
                            <ChevronRight className="h-4 w-4 transition-transform group-hover:scale-110" />
                        </button>
                        <button
                            data-testid="pagination-last"
                            className="group relative inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
                            onClick={goLast}
                            disabled={isLastPage}
                            aria-label="Last page"
                            title="Last page"
                        >
                            <ChevronsRight className="h-4 w-4 transition-transform group-hover:scale-110" />
                        </button>
                    </div>
                </div>

                {/* Items per page with modern select */}
                <div className="flex items-center gap-3 order-3">
                    <label htmlFor="page-size" className="text-sm font-medium text-gray-600 whitespace-nowrap">
                        Show
                    </label>
                    <div className="relative">
                        <select
                            id="page-size"
                            data-testid="pagination-limit"
                            value={limit}
                            className="appearance-none rounded-lg border border-gray-300 bg-white pl-3 pr-10 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 cursor-pointer"
                            onChange={(e) => onChangeLimit(Number(e.target.value))}
                        >
                            {[10, 25, 50, 100].map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">per page</span>
                </div>
            </div>
        </div>
    );
}