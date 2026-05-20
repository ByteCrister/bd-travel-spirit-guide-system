"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { useResetRequestsStore } from "@/store/reset-requests.store";

export default function PaginationControls() {
    const { currentQuery, fetchList, queryCache } = useResetRequestsStore();

    const page = currentQuery.page ?? 1;
    const limit = currentQuery.limit ?? 20;

    // Calculate total pages from cache
    const totalPages = useMemo(() => {
        const cacheKeys = Object.keys(queryCache);
        const relevantCache = cacheKeys.find((key) => {
            try {
                const cached = queryCache[key];
                return (
                    cached?.query?.status === currentQuery.status &&
                    cached?.query?.search === currentQuery.search
                );
            } catch {
                return false;
            }
        });

        if (relevantCache && queryCache[relevantCache]) {
            const total = queryCache[relevantCache].total;
            return Math.ceil(total / limit);
        }
        return page; // Fallback to current page
    }, [queryCache, currentQuery, page, limit]);

    const goToPage = async (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        await fetchList({ ...currentQuery, page: newPage });
    };

    const prev = () => goToPage(page - 1);
    const next = () => goToPage(page + 1);
    const first = () => goToPage(1);
    const last = () => goToPage(totalPages);

    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
        >
            {/* Page Info */}
            <div className="flex items-center text-sm font-medium">
                {/* Mobile: compact display */}
                <span className="sm:hidden text-gray-900 dark:text-gray-100">
                    {page} / {totalPages}
                </span>
                {/* Desktop: full label with highlighted page number */}
                <span className="hidden sm:flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    Page
                    <span className="font-semibold text-gray-900 dark:text-gray-100 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md">
                        {page}
                    </span>
                    of {totalPages}
                </span>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1 sm:gap-1.5">
                {/* First Page */}
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    disabled={!hasPrev}
                    className="shadow-sm"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={first}
                        aria-label="First page"
                        type="button"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </motion.button>
                </Button>

                {/* Previous Page */}
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    disabled={!hasPrev}
                    className="shadow-sm gap-1"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={prev}
                        aria-label="Previous page"
                        type="button"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Previous</span>
                    </motion.button>
                </Button>

                {/* Next Page */}
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    disabled={!hasNext}
                    className="shadow-sm gap-1"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={next}
                        aria-label="Next page"
                        type="button"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-4 h-4" />
                    </motion.button>
                </Button>

                {/* Last Page */}
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    disabled={!hasNext}
                    className="shadow-sm"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={last}
                        aria-label="Last page"
                        type="button"
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </motion.button>
                </Button>
            </div>
        </motion.div>
    );
}