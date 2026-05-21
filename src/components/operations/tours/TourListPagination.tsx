"use client";

import React from "react";
import { useTourDetailStore } from "@/store/tour-detail.store";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    FileText,
} from "lucide-react";
import { motion } from "framer-motion";

// ─── Neumorphism Design Tokens ──────────────────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";
const NEU_BTN_ICON =
    "rounded-xl w-9 h-9 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
    "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
    "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_BTN_ICON_ACTIVE =
    "rounded-xl w-9 h-9 flex items-center justify-center bg-[#006666] text-white " +
    "shadow-[inset_2px_2px_5px_#004d4d,inset_-2px_-2px_5px_#008080]";
const NEU_SURFACE_INSET_SM =
    "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";

// ─── Types ──────────────────────────────────────────────────────────────────
type Props = {
    pagination?: {
        page: number;
        limit: number;
        sort?: string;
        order?: "asc" | "desc";
    };
};

const TourListPagination: React.FC<Props> = ({ pagination }) => {
    const { fetchTours, listCache, activeCacheKey } = useTourDetailStore();
    const activeKey = activeCacheKey.tours;
    const current = activeKey ? listCache.tours[activeKey] : undefined;

    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const pages = current?.pages ?? 1;
    const total = current?.total ?? 0;

    const goto = (p: number) => fetchTours({ page: p, limit }).catch(() => { });

    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    const getPageNumbers = () => {
        const delta = 2;
        const range: number[] = [];
        const rangeWithDots: (number | string)[] = [];

        for (
            let i = Math.max(2, page - delta);
            i <= Math.min(pages - 1, page + delta);
            i++
        ) {
            range.push(i);
        }

        if (page - delta > 2) rangeWithDots.push(1, "...");
        else rangeWithDots.push(1);

        rangeWithDots.push(...range);

        if (page + delta < pages - 1) rangeWithDots.push("...", pages);
        else if (pages > 1) rangeWithDots.push(pages);

        return rangeWithDots;
    };

    const pageNumbers = pages > 1 ? getPageNumbers() : [1];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`${NEU_SURFACE} rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4`}
        >
            {/* ── Info ── */}
            <div className="flex items-center gap-2.5">
                <div
                    className={`${NEU_SURFACE_INSET_SM} rounded-xl flex items-center gap-2 px-3 py-2`}
                >
                    <FileText className="h-4 w-4 text-[#006666]" />
                    <span className={`${NEU_MONO} text-sm font-medium`}>
                        {total === 0 ? (
                            <span className={NEU_MUTED}>No items</span>
                        ) : (
                            <>
                                <span className="text-[#006666] font-bold">{startItem}</span>
                                <span className="text-[#1E2938]/40 mx-1">–</span>
                                <span className="text-[#006666] font-bold">{endItem}</span>
                                <span className="text-[#1E2938]/40 mx-1"> of </span>
                                <span className="text-[#1E2938] font-bold">{total}</span>
                            </>
                        )}
                    </span>
                </div>
                <span className={`${NEU_MUTED} hidden sm:block`}>
                    Page <span className="text-[#1E2938] font-bold">{page}</span>
                    <span className="mx-1 text-[#1E2938]/30">/</span>
                    <span className="text-[#1E2938] font-bold">{pages}</span>
                </span>
            </div>

            {/* ── Pagination Controls ── */}
            <div className="flex items-center gap-1.5">
                {/* First */}
                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => goto(1)}
                    className={NEU_BTN_ICON}
                    title="First page"
                    aria-label="Go to first page"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </button>

                {/* Prev */}
                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => goto(page - 1)}
                    className={NEU_BTN_ICON}
                    title="Previous page"
                    aria-label="Go to previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Page Numbers */}
                <div className="hidden sm:flex items-center gap-1">
                    {pageNumbers.map((pageNum, index) => {
                        if (pageNum === "...") {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    className={`${NEU_MUTED} w-7 text-center`}
                                >
                                    …
                                </span>
                            );
                        }

                        const isActive = pageNum === page;
                        return (
                            <motion.button
                                key={pageNum}
                                type="button"
                                whileHover={{ scale: isActive ? 1 : 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => goto(pageNum as number)}
                                className={isActive ? NEU_BTN_ICON_ACTIVE : NEU_BTN_ICON}
                                aria-label={`Go to page ${pageNum}`}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <span
                                    className={`text-sm font-[family-name:var(--font-space-mono)] font-bold`}
                                >
                                    {pageNum}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Mobile: current page indicator */}
                <div className="sm:hidden">
                    <div className={`${NEU_SURFACE_INSET_SM} rounded-xl px-3 py-2`}>
                        <span className={`${NEU_LABEL} text-[10px]`}>
                            {page} / {pages}
                        </span>
                    </div>
                </div>

                {/* Next */}
                <button
                    type="button"
                    disabled={page >= pages}
                    onClick={() => goto(page + 1)}
                    className={NEU_BTN_ICON}
                    title="Next page"
                    aria-label="Go to next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>

                {/* Last */}
                <button
                    type="button"
                    disabled={page >= pages}
                    onClick={() => goto(pages)}
                    className={NEU_BTN_ICON}
                    title="Last page"
                    aria-label="Go to last page"
                >
                    <ChevronsRight className="h-4 w-4" />
                </button>
            </div>
        </motion.div>
    );
};

export default TourListPagination;
