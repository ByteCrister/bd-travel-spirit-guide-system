// components/reviews/ReviewsPagination.tsx
"use client";

import { JSX } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react";

// ── Tokens ───────────────────────────────────────────────────────────────────
const S        = "#E7E5E4";
const SHADOW_OUT = "6px 6px 14px #c9c7c6, -6px -6px 14px #ffffff";
const SHADOW_IN  = "inset 3px 3px 7px #c9c7c6, inset -3px -3px 7px #ffffff";
const PRIMARY  = "#006666";
const TEXT     = "#1E2938";
const MUTED    = "#607080";
const MONO     = "var(--font-jetbrains-mono), monospace";
const BRAND    = "var(--font-space-mono), monospace";

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
    onChangeLimit,
}: Props): JSX.Element {
    const goFirst = () => onChangePage(1);
    const goPrev  = () => onChangePage(Math.max(1, page - 1));
    const goNext  = () => onChangePage(Math.min(pages, page + 1));
    const goLast  = () => onChangePage(pages);

    const isFirstPage = page === 1;
    const isLastPage  = page === pages;

    const getPageNumbers = (): (number | string)[] => {
        if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
        const nums: (number | string)[] = [];
        if (page <= 4) {
            for (let i = 1; i <= Math.min(5, pages); i++) nums.push(i);
            if (pages > 5) nums.push("...", pages);
        } else if (page >= pages - 3) {
            nums.push(1, "...");
            for (let i = Math.max(pages - 4, 2); i <= pages; i++) nums.push(i);
        } else {
            nums.push(1, "...", page - 1, page, page + 1, "...", pages);
        }
        return nums;
    };

    const pageNumbers = getPageNumbers();
    const startItem   = total ? (page - 1) * limit + 1 : 0;
    const endItem     = total ? Math.min(page * limit, total) : 0;

    /** Nav button (press/raised neumorphic) */
    const NavBtn = ({
        onClick, disabled, label, children,
    }: {
        onClick: () => void;
        disabled: boolean;
        label: string;
        children: React.ReactNode;
    }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all focus:outline-none focus-visible:ring-2 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
                background: S,
                boxShadow: disabled ? SHADOW_IN : SHADOW_OUT,
                color: disabled ? MUTED : TEXT,
                border: "none",
            }}
        >
            {children}
        </button>
    );

    return (
        <div className="w-full px-5 py-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-5">

                {/* ── Result info ── */}
                <div
                    className="flex items-center gap-3 order-2 lg:order-1 text-xs"
                    style={{ fontFamily: MONO, color: MUTED }}
                >
                    <div
                        className="flex items-center justify-center w-8 h-8 rounded-xl"
                        style={{ background: S, boxShadow: SHADOW_IN }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: PRIMARY }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        {total !== undefined ? (
                            <>
                                <p className="font-bold" style={{ color: TEXT, fontFamily: BRAND }}>
                                    {startItem.toLocaleString()} – {endItem.toLocaleString()}{" "}
                                    <span style={{ color: MUTED, fontWeight: 400 }}>of</span>{" "}
                                    {total.toLocaleString()}
                                </p>
                                <p className="text-xs" style={{ color: MUTED }}>Total results</p>
                            </>
                        ) : (
                            <>
                                <p className="font-bold" style={{ color: TEXT, fontFamily: BRAND }}>
                                    Page {page}{" "}
                                    <span style={{ color: MUTED, fontWeight: 400 }}>of</span>{" "}
                                    {pages}
                                </p>
                                <p className="text-xs" style={{ color: MUTED }}>Navigation</p>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Page controls ── */}
                <div className="flex items-center gap-2 order-1 lg:order-2">
                    {/* First + Prev */}
                    <div className="flex items-center gap-1.5">
                        <NavBtn onClick={goFirst} disabled={isFirstPage} label="First page">
                            <ChevronsLeft className="h-4 w-4" />
                        </NavBtn>
                        <NavBtn onClick={goPrev} disabled={isFirstPage} label="Previous page">
                            <ChevronLeft className="h-4 w-4" />
                        </NavBtn>
                    </div>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                        {pageNumbers.map((p, idx) =>
                            typeof p === "string" ? (
                                <div
                                    key={`ellipsis-${idx}`}
                                    className="inline-flex items-center justify-center w-9 h-9"
                                    style={{ color: MUTED }}
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </div>
                            ) : (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => onChangePage(p)}
                                    aria-current={p === page ? "page" : undefined}
                                    className="inline-flex items-center justify-center min-w-[2.25rem] h-9 rounded-xl text-xs font-bold transition-all focus:outline-none focus-visible:ring-2"
                                    style={{
                                        background: p === page ? PRIMARY : S,
                                        boxShadow: p === page
                                            ? "3px 3px 8px #004d4d, -1px -1px 4px #008080"
                                            : SHADOW_OUT,
                                        color: p === page ? "#ffffff" : TEXT,
                                        fontFamily: BRAND,
                                        border: "none",
                                        transform: p === page ? "scale(1.05)" : "scale(1)",
                                    }}
                                >
                                    {p}
                                </button>
                            )
                        )}
                    </div>

                    {/* Next + Last */}
                    <div className="flex items-center gap-1.5">
                        <NavBtn onClick={goNext} disabled={isLastPage} label="Next page">
                            <ChevronRight className="h-4 w-4" />
                        </NavBtn>
                        <NavBtn onClick={goLast} disabled={isLastPage} label="Last page">
                            <ChevronsRight className="h-4 w-4" />
                        </NavBtn>
                    </div>
                </div>

                {/* ── Items per page ── */}
                <div className="flex items-center gap-3 order-3">
                    <label
                        htmlFor="page-size"
                        className="text-xs font-medium whitespace-nowrap"
                        style={{ color: MUTED, fontFamily: MONO }}
                    >
                        Show
                    </label>
                    <div className="relative">
                        <select
                            id="page-size"
                            data-testid="pagination-limit"
                            value={limit}
                            onChange={(e) => onChangeLimit(Number(e.target.value))}
                            className="appearance-none rounded-xl text-xs font-medium pl-3 pr-8 py-2 outline-none cursor-pointer transition-all focus-visible:ring-2"
                            style={{
                                background: S,
                                boxShadow: SHADOW_IN,
                                color: TEXT,
                                fontFamily: MONO,
                                border: "none",
                            }}
                        >
                            {[10, 25, 50, 100].map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                        <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center" style={{ color: MUTED }}>
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </div>
                    <span className="text-xs whitespace-nowrap" style={{ color: MUTED, fontFamily: MONO }}>
                        per page
                    </span>
                </div>

            </div>
        </div>
    );
}