"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { useResetRequestsStore } from "@/store/reset-requests.store";

/* ─── Neumorphic style tokens ────────────────────────────────────────────── */
const N = {
    surface: "bg-[#E7E5E4] dark:bg-[#2A2A2A]",
    text: "text-[#1E2938] dark:text-white",
    textMuted: "text-[#1E2938]/60 dark:text-white/50",
    raisedMd:
        " dark:",
    raisedSm:
        " dark:",
    raisedXs:
        " dark:",
    pressedSm:
        "[box-shadow:inset_3px_3px_6px_#cac8c7,inset_-3px_-3px_6px_#ffffff] dark:[box-shadow:inset_3px_3px_6px_#1a1a1a,inset_-3px_-3px_6px_#3a3a3a]",
    font: "font-['Space_Mono']",
} as const;

/* ─── Nav Button ─────────────────────────────────────────────────────────── */
function NavButton({
    onClick,
    disabled,
    label,
    children,
}: {
    onClick: () => void;
    disabled: boolean;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            whileHover={!disabled ? { scale: 1.04 } : undefined}
            whileTap={!disabled ? { scale: 0.96 } : undefined}
            className={`
        h-9 w-9 flex items-center justify-center rounded-xl border-none
        ${N.surface} ${N.text} ${N.raisedSm}
        hover:${N.raisedXs} active:${N.pressedSm}
        transition-all duration-150
        disabled:opacity-40 disabled:pointer-events-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666] focus-visible:ring-offset-1
      `}
        >
            {children}
        </motion.button>
    );
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function PaginationControls() {
    const { currentQuery, fetchList, queryCache } = useResetRequestsStore();

    const page = currentQuery.page ?? 1;
    const limit = currentQuery.limit ?? 20;

    const totalPages = useMemo(() => {
        const cacheKeys = Object.keys(queryCache);
        const relevantKey = cacheKeys.find((key) => {
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

        if (relevantKey && queryCache[relevantKey]) {
            const total = queryCache[relevantKey].total;
            return Math.ceil(total / limit);
        }
        return page;
    }, [queryCache, currentQuery, page, limit]);

    const goToPage = async (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        await fetchList({ ...currentQuery, page: newPage });
    };

    const hasPrev = page > 1;
    const hasNext = page < totalPages;

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
        flex items-center justify-between gap-3 px-4 py-3 rounded-2xl
        ${N.surface} ${N.raisedMd} ${N.font}
      `}
        >
            {/* Page info */}
            <div className={`flex items-center gap-2 text-sm font-medium select-none ${N.textMuted}`}>
                {/* Mobile: compact */}
                <span className="sm:hidden">
                    <span className={N.text}>{page}</span>
                    {" / "}
                    {totalPages}
                </span>

                {/* Desktop: verbose */}
                <span className="hidden sm:flex items-center gap-2">
                    Page
                    <span
                        className={`
              inline-flex items-center justify-center h-7 min-w-[1.75rem] px-2 rounded-lg text-sm
              ${N.text} font-semibold
              ${N.surface} ${N.pressedSm}
            `}
                    >
                        {page}
                    </span>
                    of
                    <span className={`font-semibold ${N.text}`}>{totalPages}</span>
                </span>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-1.5">
                <NavButton onClick={() => goToPage(1)} disabled={!hasPrev} label="First page">
                    <ChevronsLeft className="w-4 h-4" />
                </NavButton>

                <NavButton onClick={() => goToPage(page - 1)} disabled={!hasPrev} label="Previous page">
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs font-medium ml-0.5">Prev</span>
                </NavButton>

                <NavButton onClick={() => goToPage(page + 1)} disabled={!hasNext} label="Next page">
                    <span className="hidden sm:inline text-xs font-medium mr-0.5">Next</span>
                    <ChevronRight className="w-4 h-4" />
                </NavButton>

                <NavButton onClick={() => goToPage(totalPages)} disabled={!hasNext} label="Last page">
                    <ChevronsRight className="w-4 h-4" />
                </NavButton>
            </div>
        </motion.div>
    );
}