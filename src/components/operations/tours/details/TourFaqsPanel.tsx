'use client';

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiRefreshCw, FiSearch, FiThumbsUp, FiThumbsDown, FiX } from "react-icons/fi";
import { cn } from "@/lib/utils";

import type { TourFAQDTO } from "@/types/tour/tour-detail-faqs.types";
import { useTourDetailStore } from "@/store/tour-detail.store";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

// ─── Neumorphism Design Tokens ─────────────────────────────────────────────────
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";

const NEU_SURFACE_RAISED =
    "bg-[#E7E5E4] shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]";

const NEU_SURFACE_INSET_SM =
    "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

const NEU_BTN_GHOST =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
    "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none";

const NEU_BTN_ICON =
    "rounded-xl flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
    "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
    "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_BTN_DANGER =
    "rounded-xl bg-[#E7E5E4] text-[#FF2157] font-[family-name:var(--font-space-mono)] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:bg-[#FF2157]/10 hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
    "transition-all duration-200";

const NEU_INPUT =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";

const NEU_BADGE =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#E7E5E4] text-[#1E2938] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_SUCCESS =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_WARNING =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";

const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL = "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_ICON_WELL_PRIMARY = "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_DIVIDER = "border-[#1E2938]/10";

// ─── Types & Constants ─────────────────────────────────────────────────────────
type Props = {
    tourId: string;
    active?: boolean;
};

const PAGE_SIZES = [5, 10, 20];
const DEFAULT_SORT = "";
const DEFAULT_ORDER = "";
const DEFAULT_TOUR_PARAMS = {
    page: 1,
    limit: 10,
    sort: DEFAULT_SORT,
    order: DEFAULT_ORDER,
    search: ""
};

const makeCacheKey = (params: {
    page: number;
    limit: number;
    sort?: string;
    order?: string;
    search?: string
}) => {
    const paginationKey = `${params.page}-${params.limit}-${params.sort ?? ""}-${params.order ?? ""}`;
    const filterKey = JSON.stringify({ search: params.search || "" });
    return `${paginationKey}-${filterKey}`;
};

const EMPTY_OBJ = {};

// ─── Helper ────────────────────────────────────────────────────────────────────
function sanitizeHtml(input: string) {
    return input
        .replaceAll("<script", "&lt;script")
        .replaceAll("</script", "&lt;/script")
        .replaceAll("onerror=", "data-onerror=")
        .replaceAll("onload=", "data-onload=");
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function FaqSkeletonItem({ index }: { index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.04 }}
            className={cn("p-5 border-b last:border-0", NEU_DIVIDER)}
        >
            <div className="flex items-start gap-4">
                <div className={cn("h-10 w-10 rounded-full shrink-0", NEU_SKELETON)} />
                <div className="flex-1 space-y-2.5">
                    <div className={cn("h-4 w-3/4 rounded-lg", NEU_SKELETON)} />
                    <div className={cn("h-3 w-1/2 rounded-lg", NEU_SKELETON)} />
                    <div className={cn("h-3 w-full rounded-lg", NEU_SKELETON)} />
                    <div className={cn("h-3 w-2/3 rounded-lg opacity-60", NEU_SKELETON)} />
                </div>
            </div>
        </motion.div>
    );
}

function FaqEmptyState({ hasSearch, onClear }: { hasSearch: boolean; onClear: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
        >
            <div className={cn("w-16 h-16 flex items-center justify-center rounded-2xl", NEU_SURFACE_RAISED)}>
                <FiSearch size={22} className="text-[#1E2938]/30" />
            </div>
            <div className="text-center space-y-1.5">
                <p className={cn("text-sm", NEU_HEADING)}>
                    {hasSearch ? "No FAQs found" : "No FAQs yet"}
                </p>
                <p className={NEU_MUTED}>
                    {hasSearch
                        ? "No FAQs matched your search query"
                        : "No FAQs found for this tour yet"}
                </p>
                {hasSearch && (
                    <button
                        onClick={onClear}
                        className={cn(NEU_BTN_GHOST, "mt-2 inline-flex px-4 py-2 text-xs text-[#006666]")}
                    >
                        Clear search
                    </button>
                )}
            </div>
        </motion.div>
    );
}

function FaqErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 gap-4"
        >
            <div className={cn("w-14 h-14 flex items-center justify-center rounded-2xl bg-[#FF2157]/10", NEU_SURFACE_RAISED)}>
                <FiRefreshCw size={20} className="text-[#FF2157]/70" />
            </div>
            <div className="text-center space-y-1.5">
                <p className={cn("text-sm", NEU_HEADING)}>Unable to load FAQs</p>
                <p className={cn(NEU_MUTED, "max-w-xs")}>{String(error)}</p>
            </div>
            <button
                onClick={onRetry}
                className={cn(NEU_BTN_DANGER, "flex items-center gap-2 px-4 py-2 text-sm mt-1")}
            >
                <FiRefreshCw /> Retry
            </button>
        </motion.div>
    );
}

function FaqItem({ faq, index }: { faq: TourFAQDTO; index: number }) {
    const shortDate = (iso?: string) => {
        if (!iso) return "—";
        const d = new Date(iso);
        return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    };

    return (
        <motion.div
            key={faq.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, delay: index * 0.03 }}
            className={cn(
                "p-4 sm:p-5 border-b last:border-0 group transition-colors duration-150 hover:bg-white/30",
                NEU_DIVIDER
            )}
        >
            <div className="flex gap-4">
                {/* Avatar */}
                <div className="shrink-0">
                    <div className="shadow-[3px_3px_7px_#c8c6c5,-3px_-3px_7px_#ffffff] rounded-full">
                        <Image
                            src={faq.askedBy.avatarUrl ?? `/api/avatars/${faq.askedBy.id}`}
                            alt={`${faq.askedBy.name} avatar`}
                            width={40}
                            height={40}
                            unoptimized
                            className="h-10 w-10 rounded-full object-cover"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Question row */}
                    <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className={cn("text-sm truncate", NEU_HEADING, "font-semibold")}>
                                    {faq.question}
                                </h4>
                                <span className={faq.isActive ? NEU_BADGE_SUCCESS : NEU_BADGE}>
                                    {faq.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <div className={cn("mt-1 text-xs", NEU_MUTED)}>
                                Asked by{" "}
                                <span className={cn("font-semibold text-[#1E2938]", NEU_MONO)}>
                                    {faq.askedBy.name}
                                </span>
                                {" "}·{" "}
                                {shortDate(faq.createdAt)}
                            </div>
                        </div>

                        {/* Votes */}
                        <div className="flex items-center gap-2 shrink-0">
                            <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1.5", NEU_SURFACE_INSET_SM, "rounded-lg")}>
                                <FiThumbsUp className="text-[#00A63D] text-xs" />
                                <span className={cn("text-xs font-semibold", NEU_MONO)}>{faq.likes}</span>
                            </div>
                            <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1.5", NEU_SURFACE_INSET_SM, "rounded-lg")}>
                                <FiThumbsDown className="text-[#FF2157] text-xs" />
                                <span className={cn("text-xs font-semibold", NEU_MONO)}>{faq.dislikes}</span>
                            </div>
                        </div>
                    </div>

                    {/* Answer */}
                    <div className="mt-3">
                        {faq.answer ? (
                            <div className={cn("rounded-xl p-3", NEU_SURFACE_INSET_SM)}>
                                <div
                                    className={cn("text-sm prose prose-sm max-w-none", NEU_MONO)}
                                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(faq.answer) }}
                                />
                                <div className={cn("mt-2 text-xs", NEU_MUTED)}>
                                    Answered by{" "}
                                    <span className={cn("font-semibold text-[#1E2938]", NEU_MONO)}>
                                        {faq.answeredBy?.name ?? "—"}
                                    </span>
                                    {" "}·{" "}
                                    {shortDate(faq.answeredAt ?? faq.updatedAt)}
                                </div>
                            </div>
                        ) : (
                            <div className={cn("text-sm italic", NEU_MUTED, "mt-1")}>
                                Not answered yet
                            </div>
                        )}
                    </div>

                    {/* Reports */}
                    {faq.reports?.length ? (
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <span className={NEU_BADGE_WARNING}>
                                {faq.reports.length} report{faq.reports.length > 1 ? "s" : ""}
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                                {faq.reports.slice(0, 3).map((r, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5">
                                        <div className="shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff] rounded-full">
                                            <Image
                                                src={r.reportedBy.avatarUrl ?? `/api/avatars/${r.reportedBy.id}`}
                                                alt={r.reportedBy.name}
                                                width={22}
                                                height={22}
                                                unoptimized
                                                className="h-[22px] w-[22px] rounded-full object-cover"
                                            />
                                        </div>
                                        <div className={cn("text-xs", NEU_MUTED)}>
                                            <span className={cn("font-semibold text-[#1E2938]", NEU_MONO)}>
                                                {r.reportedBy.name}
                                            </span>
                                            {" "}·{" "}
                                            {new Date(r.createdAt).toLocaleDateString(undefined, {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </motion.div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function TourFaqsPanel({ tourId, active = true }: Props) {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [forceReloadToken, setForceReloadToken] = useState(0);
    const [localSearch, setLocalSearch] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    const {
        fetchFaqs,
        error: errorState,
        loading: loadingState,
        listCache,
        params,
        invalidateCache
    } = useTourDetailStore();

    const tourParams = params.tourFaqs?.[tourId] ?? DEFAULT_TOUR_PARAMS;
    const tourCache = listCache.tourFaqs?.[tourId] ?? EMPTY_OBJ;

    useEffect(() => {
        if (tourParams.search !== undefined && localSearch === "") {
            setLocalSearch(tourParams.search || "");
        }
    }, [tourParams.search, localSearch]);

    const cacheKey = useMemo(
        () => makeCacheKey({
            page,
            limit,
            sort: tourParams.sort,
            order: tourParams.order,
            search: tourParams.search
        }),
        [page, limit, tourParams.sort, tourParams.order, tourParams.search]
    );

    const cachedList = tourCache[cacheKey] ?? null;
    const loading = Boolean(loadingState[`faqsList:${tourId}`]);
    const error = errorState[`faqsListError:${tourId}`] ?? null;

    const total = cachedList?.total ?? 0;
    const pages = cachedList?.pages ?? Math.max(1, Math.ceil(total / limit));

    const debouncedSearch = useDebouncedCallback(
        useCallback((searchValue: string) => {
            if (!active) return;
            setPage(1);
            invalidateCache?.("tourFaqs", tourId);
            fetchFaqs(tourId, { page: 1, limit, sort: tourParams.sort, order: tourParams.order, search: searchValue }, true);
        }, [active, tourId, limit, tourParams.sort, tourParams.order, fetchFaqs, invalidateCache]),
        500
    );

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalSearch(value);
        if (value === "") {
            setPage(1);
            invalidateCache?.("tourFaqs", tourId);
            fetchFaqs(tourId, { page: 1, limit, sort: tourParams.sort, order: tourParams.order, search: "" }, true);
        } else {
            debouncedSearch(value);
        }
    }, [tourId, limit, tourParams.sort, tourParams.order, fetchFaqs, invalidateCache, debouncedSearch]);

    const handleClearSearch = useCallback(() => {
        setLocalSearch("");
        setPage(1);
        if (searchInputRef.current) searchInputRef.current.focus();
        invalidateCache?.("tourFaqs", tourId);
        fetchFaqs(tourId, { page: 1, limit, sort: tourParams.sort, order: tourParams.order, search: "" }, true);
    }, [tourId, limit, tourParams.sort, tourParams.order, fetchFaqs, invalidateCache]);

    const load = useCallback(
        async (opts?: { force?: boolean }) => {
            if (!active) return;
            try {
                await fetchFaqs(tourId, { page, limit, sort: tourParams.sort, order: tourParams.order, search: tourParams.search }, opts?.force ?? false);
            } catch { /* errors handled in store */ }
        },
        [active, fetchFaqs, tourId, page, limit, tourParams.sort, tourParams.order, tourParams.search]
    );

    useEffect(() => {
        if (!active) return;
        void load({ force: forceReloadToken > 0 });
    }, [active, page, limit, forceReloadToken, load]);

    useEffect(() => {
        if (tourParams.search !== undefined) setLocalSearch(tourParams.search);
    }, [tourParams.search]);

    const goPrevious = () => setPage((p) => Math.max(1, p - 1));
    const goNext = () => setPage((p) => Math.min(pages, p + 1));
    const onRetry = () => setForceReloadToken((t) => t + 1);

    const visibleItems = useMemo(() => {
        const items: TourFAQDTO[] = cachedList?.items ?? [];
        if (!localSearch.trim()) return items;
        const q = localSearch.trim().toLowerCase();
        return items.filter((f) =>
            f.question.toLowerCase().includes(q) || (f.answer ?? "").toLowerCase().includes(q)
        );
    }, [cachedList, localSearch]);

    return (
        <div className="w-full max-w-5xl mx-auto space-y-5">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={cn(NEU_ICON_WELL_PRIMARY, "shrink-0")}>
                        <FiSearch size={16} className="text-[#006666]" />
                    </div>
                    <div>
                        <h3 className={cn(NEU_HEADING, "text-base")}>Frequently Asked Questions</h3>
                        <p className={cn(NEU_MUTED, "text-xs mt-0.5")}>
                            All user-submitted questions for this tour
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Search */}
                    <div className={cn("flex items-center gap-2 px-3 py-2 rounded-xl w-full sm:w-auto", NEU_SURFACE_INSET_SM)}>
                        <FiSearch className="text-[#1E2938]/40 shrink-0" size={13} />
                        <input
                            ref={searchInputRef}
                            aria-label="Filter FAQs"
                            value={localSearch}
                            onChange={handleSearchChange}
                            placeholder="Search questions or answers"
                            className={cn(
                                "w-44 text-sm placeholder:text-[#1E2938]/40 outline-none bg-transparent",
                                "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]"
                            )}
                        />
                        {localSearch && (
                            <button
                                onClick={handleClearSearch}
                                aria-label="Clear search"
                                className="text-[#1E2938]/40 hover:text-[#1E2938]/70 transition-colors shrink-0"
                            >
                                <FiX size={13} />
                            </button>
                        )}
                    </div>

                    {/* Page size */}
                    <div className="flex items-center gap-2">
                        <span className={cn(NEU_LABEL, "hidden sm:block normal-case tracking-normal")}>Show</span>
                        <select
                            value={limit}
                            onChange={(e) => {
                                const v = Number(e.target.value) || 10;
                                setLimit(v);
                                setPage(1);
                            }}
                            className={cn(NEU_INPUT, "px-3 py-2 text-xs appearance-none cursor-pointer")}
                        >
                            {PAGE_SIZES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Reload */}
                    <button
                        onClick={onRetry}
                        title="Reload FAQs"
                        className={cn(NEU_BTN_GHOST, "flex items-center gap-2 px-3 py-2 text-sm")}
                    >
                        <FiRefreshCw size={13} className={cn(loading && "animate-spin")} />
                        <span className="hidden sm:inline text-xs">Reload</span>
                    </button>
                </div>
            </div>

            {/* ── Active search indicator ── */}
            <AnimatePresence>
                {tourParams.search && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border border-[#006666]/20",
                            "bg-[#006666]/5 shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff]"
                        )}
                    >
                        <FiSearch className="text-[#006666] shrink-0" size={13} />
                        <span className={cn(NEU_MUTED, "text-xs")}>Searching for:</span>
                        <span className={cn("text-xs font-semibold text-[#006666]", NEU_MONO)}>
                            &quot;{tourParams.search}&quot;
                        </span>
                        <button
                            onClick={handleClearSearch}
                            className="ml-auto text-[#006666]/70 hover:text-[#006666] text-xs font-semibold font-[family-name:var(--font-space-mono)] transition-colors"
                        >
                            Clear
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Content Card ── */}
            <div className={cn(NEU_CARD, "overflow-hidden")}>

                {loading && !cachedList ? (
                    <div>
                        {Array.from({ length: Math.min(limit, 6) }).map((_, idx) => (
                            <FaqSkeletonItem key={idx} index={idx} />
                        ))}
                    </div>
                ) : error ? (
                    <FaqErrorState error={String(error)} onRetry={onRetry} />
                ) : (cachedList?.items?.length ?? 0) === 0 ? (
                    <FaqEmptyState hasSearch={!!tourParams.search} onClear={handleClearSearch} />
                ) : (
                    <>
                        <div>
                            <AnimatePresence initial={false}>
                                {visibleItems.map((faq, index) => (
                                    <FaqItem key={faq.id} faq={faq} index={index} />
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* ── Pagination Footer ── */}
                        <div className={cn(
                            "flex items-center justify-between gap-4 px-4 sm:px-5 py-4 border-t",
                            NEU_DIVIDER, NEU_SURFACE_INSET_SM
                        )}>
                            <p className={cn(NEU_MUTED, "text-xs")}>
                                Showing{" "}
                                <span className={cn("font-semibold text-[#1E2938]", NEU_MONO)}>
                                    {total === 0 ? 0 : Math.min(total, (page - 1) * limit + 1)}
                                </span>
                                {" "}–{" "}
                                <span className={cn("font-semibold text-[#1E2938]", NEU_MONO)}>
                                    {Math.min(total, page * limit)}
                                </span>
                                {" "}of{" "}
                                <span className={cn("font-semibold text-[#1E2938]", NEU_MONO)}>{total}</span>
                                {tourParams.search && (
                                    <span className="ml-1.5 text-[#006666] font-[family-name:var(--font-space-mono)] text-xs">
                                        (filtered)
                                    </span>
                                )}
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={goPrevious}
                                    disabled={page <= 1 || loading}
                                    className={cn(NEU_BTN_ICON, "w-8 h-8")}
                                    aria-label="Previous page"
                                >
                                    <FiChevronLeft size={14} />
                                </button>

                                <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-xl", NEU_SURFACE_INSET_SM)}>
                                    <span className={cn(NEU_MUTED, "text-xs")}>Page</span>
                                    <input
                                        aria-label="Page"
                                        value={page}
                                        onChange={(e) => {
                                            const v = Number(e.target.value || 1);
                                            if (!Number.isFinite(v)) return;
                                            setPage(Math.min(Math.max(1, Math.floor(v)), pages));
                                        }}
                                        className={cn(
                                            "w-10 text-center bg-transparent outline-none text-xs font-semibold",
                                            "font-[family-name:var(--font-space-mono)] text-[#1E2938]",
                                            "focus:ring-1 focus:ring-[#006666]/40 rounded-md"
                                        )}
                                    />
                                    <span className={cn(NEU_MUTED, "text-xs")}>/ {pages}</span>
                                </div>

                                <button
                                    onClick={goNext}
                                    disabled={page >= pages || loading}
                                    className={cn(NEU_BTN_ICON, "w-8 h-8")}
                                    aria-label="Next page"
                                >
                                    <FiChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}