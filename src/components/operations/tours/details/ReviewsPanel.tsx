"use client";

import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    MdStar, MdVerified, MdThumbUp, MdCalendarToday,
    MdCardTravel, MdSearch, MdStarHalf,
} from "react-icons/md";
import { FiRefreshCw, FiX } from "react-icons/fi";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ReviewListItemDTO, ReviewSummaryDTO } from "@/types/tour/tour-detail-review.type";
import { TourReviewsSkeleton } from "./skeletons/TourReviewsSkeleton";
import { useTourDetailStore } from "@/store/tour-detail.store";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

// ─── Neumorphism Design Tokens ──────────────────────────────────────────────
const NEU_SURFACE          = "bg-[#E7E5E4]";
const NEU_CARD_SM          = "rounded-xl bg-[#E7E5E4]  border border-white/60";
const NEU_SURFACE_INSET    = "bg-[#E7E5E4] ";
const NEU_SURFACE_INSET_SM = "bg-[#E7E5E4] ";
const NEU_BTN_GHOST        =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
    " " +
    "hover: " +
    "active: " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_BTN_ICON         =
    "rounded-xl w-9 h-9 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
    " " +
    "hover:text-[#006666] hover: " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_BTN_ICON_ACTIVE  =
    "rounded-xl w-9 h-9 flex items-center justify-center bg-[#006666] text-white " +
    "";
const NEU_INPUT            =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
    " border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";
const NEU_BADGE_SUCCESS    =
    "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#00A63D]/10 text-[#00A63D] ";
const NEU_BADGE_WARNING    =
    "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#FE9900]/10 text-[#FE9900] ";
const NEU_BADGE            =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#E7E5E4] text-[#1E2938] ";
const NEU_HEADING          = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL            = "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MONO             = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_MUTED            = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_ICON_WELL_PRIMARY = "p-2.5 rounded-xl bg-[#006666]/10 ";

// ─── Star Row ────────────────────────────────────────────────────────────────
const StarRow: React.FC<{ rating: number; size?: number }> = memo(({ rating, size = 16 }) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;

    const stars = useMemo(() => {
        const nodes: React.ReactNode[] = [];
        for (let i = 0; i < full; i++) {
            nodes.push(<MdStar key={`f-${i}`} style={{ width: size, height: size }} className="text-[#FE9900]" />);
        }
        if (half) {
            nodes.push(<MdStarHalf key="half" style={{ width: size, height: size }} className="text-[#FE9900]" />);
        }
        for (let i = nodes.length; i < 5; i++) {
            nodes.push(<MdStar key={`e-${i}`} style={{ width: size, height: size }} className="text-[#1E2938]/20" />);
        }
        return nodes;
    }, [full, half, size]);

    return <div className="flex items-center gap-0.5">{stars}</div>;
});
StarRow.displayName = "StarRow";

// ─── Review Item ─────────────────────────────────────────────────────────────
type ReviewItemProps = { review: ReviewListItemDTO; onOpenImage: (url: string) => void };

const ReviewItem: React.FC<ReviewItemProps> = React.memo(({ review, onOpenImage }) => (
    <motion.article
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18 }}
        className={`${NEU_CARD_SM} p-4`}
        aria-labelledby={`review-title-${review.id}`}
    >
        <div className="flex gap-4">
            {/* Avatar */}
            <div className="w-12 shrink-0">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-[#006666]/10 flex items-center justify-center text-[#006666] font-[family-name:var(--font-space-mono)] font-bold text-base ">
                    {review.user.avatar ? (
                        <Image src={review.user.avatar} alt={review.user.name} width={48} height={48} className="rounded-full object-cover" />
                    ) : (
                        review.user.name?.charAt(0).toUpperCase()
                    )}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`${NEU_HEADING} text-sm truncate`}>{review.user.name}</h4>
                            {review.isApproved ? (
                                <span className={NEU_BADGE_SUCCESS}>
                                    <MdVerified className="h-3 w-3" /> Approved
                                </span>
                            ) : (
                                <span className={NEU_BADGE_WARNING}>Pending</span>
                            )}
                        </div>
                        <div className={`${NEU_MUTED} flex items-center gap-3 mt-1 flex-wrap`}>
                            <div className="flex items-center gap-1">
                                <MdCalendarToday className="h-3 w-3" />
                                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                            {review.travelDate && (
                                <div className="flex items-center gap-1">
                                    <span aria-hidden>•</span>
                                    <MdCardTravel className="h-3 w-3" />
                                    <span>Traveled {new Date(review.travelDate).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className={`${NEU_SURFACE_INSET_SM} flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl`}>
                            <MdStar className="h-4 w-4 text-[#FE9900]" />
                            <span className={`${NEU_HEADING} text-sm text-[#FE9900]`}>
                                {review.rating.toFixed(1)}
                            </span>
                        </div>
                        {review.helpfulCount ? (
                            <div className={`${NEU_MUTED} flex items-center gap-1.5`}>
                                <MdThumbUp className="h-3.5 w-3.5" />
                                <span>{review.helpfulCount} helpful</span>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Title + comment */}
                {review.title && (
                    <h5 id={`review-title-${review.id}`} className={`${NEU_HEADING} text-sm mt-3`}>
                        {review.title}
                    </h5>
                )}
                {review.comment && (
                    <p className={`${NEU_MONO} text-sm mt-2 leading-relaxed`}>{review.comment}</p>
                )}

                {/* Images */}
                {Array.isArray(review.images) && review.images.length > 0 && (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                        {review.images.slice(0, 8).map((img, i) => (
                            <button
                                key={i}
                                onClick={() => onOpenImage(img)}
                                className="relative h-20 w-full rounded-xl overflow-hidden  focus:outline-none focus:ring-2 focus:ring-[#006666]/40"
                                aria-label="Open photo"
                            >
                                <Image src={img} alt={`photo-${i}`} fill className="object-cover" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Replies */}
                {review.replies && review.replies.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {review.replies.map((reply) => (
                            <div key={reply.id} className={`${NEU_SURFACE_INSET_SM} px-3 py-2.5 rounded-xl`}>
                                <div className={`${NEU_MUTED} flex items-center gap-1.5 mb-1`}>
                                    {reply.employee.avatar && (
                                        <Image src={reply.employee.avatar} alt={reply.employee.name} width={16} height={16} className="rounded-full" />
                                    )}
                                    <span>{reply.employee.name} replied</span>
                                </div>
                                <p className={`${NEU_MONO} text-sm`}>{reply.message}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Trip type */}
                {review.tripType && (
                    <div className="mt-3">
                        <span className={NEU_BADGE}>{review.tripType}</span>
                    </div>
                )}
            </div>
        </div>
    </motion.article>
));
ReviewItem.displayName = "ReviewItem";

// ─── Main Panel ───────────────────────────────────────────────────────────────
interface ReviewsPanelProps { tourId: string; }

export default function ReviewsPanel({ tourId }: ReviewsPanelProps) {
    const { params, loading, error, fetchReviews } = useTourDetailStore();
    const storeParams    = params.tourReviews?.[tourId] ?? { page: 1, limit: 10 };
    const isStoreLoading = loading[`reviewsList:${tourId}`];
    const storeError     = error[`reviewsListError:${tourId}`];

    const [reviews, setReviews]     = useState<ReviewListItemDTO[]>([]);
    const [summary, setSummary]     = useState<ReviewSummaryDTO | null>(null);
    const [pagination, setPagination] = useState({ page: storeParams.page, pages: 1, total: 0 });
    const [isLoading, setIsLoading] = useState(false);

    const [minRating, setMinRating]       = useState<number | null>(null);
    const [approvedOnly, setApprovedOnly] = useState(false);
    const [searchQuery, setSearchQuery]   = useState("");
    const [lightbox, setLightbox]         = useState<{ url: string } | null>(null);

    const currentPage  = storeParams.page ?? 1;
    const currentLimit = storeParams.limit ?? 10;

    const debouncedSearch = useDebouncedCallback((searchValue: string) => {
        load({
            page: 1, limit: currentLimit,
            search: searchValue.trim(),
            rating: minRating as 1 | 2 | 3 | 4 | 5 | undefined,
            approvedOnly,
        });
    }, 300);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (value.trim() === "") {
            load({ page: 1, limit: currentLimit, search: undefined, rating: minRating as 1 | 2 | 3 | 4 | 5 | undefined, approvedOnly });
        } else {
            debouncedSearch(value);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentLimit, minRating, approvedOnly, debouncedSearch]);

    const load = useCallback(async (opts?: {
        page?: number; limit?: number; force?: boolean;
        search?: string; rating?: 1 | 2 | 3 | 4 | 5; approvedOnly?: boolean;
    }) => {
        const page  = opts?.page ?? currentPage;
        const limit = opts?.limit ?? currentLimit;
        setIsLoading(true);
        try {
            const res = await fetchReviews(tourId, {
                page, limit,
                search: opts?.search,
                rating: opts?.rating,
                approvedOnly: opts?.approvedOnly ?? false,
            }, opts?.force);

            if (!res) throw new Error("Invalid response");
            const items = res.items ?? [];
            const total = res.total ?? items.length;
            const pages = res.pages ?? Math.max(1, Math.ceil(total / Math.max(1, limit)));
            setReviews(items);
            setPagination({ page, pages, total });

            const avgRating = res?.meta?.summary?.averageRating ??
                (items.length > 0 ? Number((items.reduce((s, r) => s + (r.rating ?? 0), 0) / items.length).toFixed(1)) : 0);
            const isApprovedCount = res?.meta?.summary?.isApproved ?? items.filter((r) => r.isApproved).length;
            const ratingBreakdown = res?.meta?.summary?.ratingBreakdown ??
                items.reduce((acc, r) => {
                    const key = Math.max(1, Math.min(5, Math.floor(r.rating ?? 0))) as 1 | 2 | 3 | 4 | 5;
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

            setSummary({ totalReviews: total, averageRating: avgRating, isApproved: isApprovedCount, ratingBreakdown });
        } catch (err) {
            console.error("Failed to load reviews:", err);
            setReviews([]); setSummary(null); setPagination({ page: 1, pages: 1, total: 0 });
        } finally {
            setIsLoading(false);
        }
    }, [fetchReviews, tourId, currentPage, currentLimit]);

    useEffect(() => { void load({ page: currentPage, limit: currentLimit }); }, [load, currentPage, currentLimit]);

    useEffect(() => {
        if (currentPage !== 1) return;
        load({ page: 1, limit: currentLimit, search: searchQuery.trim() || undefined, rating: minRating as 1 | 2 | 3 | 4 | 5 | undefined, approvedOnly });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [minRating, approvedOnly, currentLimit]);

    const goToPage = useCallback(async (page: number) => {
        if (page < 1 || page > pagination.pages || page === pagination.page) return;
        await load({ page, limit: currentLimit, search: searchQuery.trim() || undefined, rating: minRating as 1 | 2 | 3 | 4 | 5 | undefined, approvedOnly });
    }, [pagination.pages, pagination.page, load, currentLimit, searchQuery, minRating, approvedOnly]);

    const openImage    = useCallback((url: string) => setLightbox({ url }), []);
    const closeLightbox = useCallback(() => setLightbox(null), []);

    return (
        <div className={`${NEU_SURFACE} rounded-2xl overflow-hidden flex flex-col`}>

            {/* ── Header ── */}
            <div className={`${NEU_SURFACE_INSET} px-6 py-5 rounded-t-2xl space-y-4`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={NEU_ICON_WELL_PRIMARY}>
                            <MdStar className="h-5 w-5 text-[#FE9900]" />
                        </div>
                        <div>
                            <h3 className={`${NEU_HEADING} text-base`}>Reviews</h3>
                            <p className={NEU_MUTED}>Feedback submitted by travelers</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Rating summary */}
                        {summary && (
                            <div className={`${NEU_SURFACE_INSET_SM} flex items-center gap-3 px-4 py-2 rounded-xl`}>
                                <div className="flex flex-col items-end">
                                    <span className="text-2xl font-bold font-[family-name:var(--font-space-mono)] text-[#FE9900]">
                                        {summary.averageRating.toFixed(1)}
                                    </span>
                                    <span className={NEU_MUTED}>{summary.totalReviews} reviews</span>
                                </div>
                                <StarRow rating={summary.averageRating} size={18} />
                            </div>
                        )}

                        {/* Search */}
                        <div className="relative">
                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E2938]/40 pointer-events-none" />
                            <input
                                placeholder="Search reviews"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className={`${NEU_INPUT} pl-9 pr-8 py-2.5 w-52`}
                                aria-label="Search reviews"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => { setSearchQuery(""); load({ page: 1, limit: currentLimit }); }}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1E2938]/40 hover:text-[#FF2157] transition-colors"
                                    aria-label="Clear search"
                                >
                                    <FiX className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Reload */}
                        <button
                            type="button"
                            onClick={() => void load({ force: true })}
                            className={`${NEU_BTN_GHOST} flex items-center gap-2 px-3 py-2 text-sm`}
                            aria-label="Reload reviews"
                        >
                            <FiRefreshCw className="h-4 w-4" />
                            <span className="hidden sm:inline">Reload</span>
                        </button>
                    </div>
                </div>

                {/* Rating breakdown + filters */}
                {summary && (
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Bar breakdown */}
                        <div className="flex items-center gap-3 overflow-x-auto pb-1">
                            {([5, 4, 3, 2, 1] as const).map((star) => {
                                const count = summary.ratingBreakdown[star] ?? 0;
                                const pct   = Math.round((count / Math.max(1, summary.totalReviews)) * 100);
                                return (
                                    <div key={star} className="flex items-center gap-2 min-w-[144px]">
                                        <span className={`${NEU_LABEL} w-4`}>{star}</span>
                                        <div className={`${NEU_SURFACE_INSET_SM} w-28 h-2 rounded-full overflow-hidden`}>
                                            <div className="h-2 bg-[#FE9900] rounded-full transition-all" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className={`${NEU_MUTED} w-6 text-right`}>{count}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <select
                                aria-label="Minimum rating"
                                value={minRating ?? ""}
                                onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : null)}
                                className={`${NEU_INPUT} px-3 py-2`}
                            >
                                <option value="">All ratings</option>
                                <option value={5}>5 stars</option>
                                <option value={4}>4+ stars</option>
                                <option value={3}>3+ stars</option>
                                <option value={2}>2+ stars</option>
                                <option value={1}>1+ star</option>
                            </select>

                            <label className={`${NEU_SURFACE_INSET_SM} flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer`}>
                                <input
                                    type="checkbox"
                                    checked={approvedOnly}
                                    onChange={(e) => setApprovedOnly(e.target.checked)}
                                    className="accent-[#006666]"
                                />
                                <span className={`${NEU_LABEL} normal-case`}>Approved only</span>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Review List ── */}
            <ScrollArea className="h-[560px]">
                <div className="p-5 space-y-3">
                    {isLoading || isStoreLoading ? (
                        <TourReviewsSkeleton rows={4} />
                    ) : reviews.length === 0 ? (
                        <div className={`${NEU_CARD_SM} py-16 flex flex-col items-center gap-3 text-center`}>
                            <div className={NEU_ICON_WELL_PRIMARY}>
                                <MdStar className="h-6 w-6 text-[#FE9900]" />
                            </div>
                            <p className={`${NEU_HEADING} text-sm`}>No reviews found</p>
                            <p className={NEU_MUTED}>Try removing filters or searching</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {reviews.map((review) => (
                                <ReviewItem key={review.id} review={review} onOpenImage={openImage} />
                            ))}
                        </AnimatePresence>
                    )}

                    {storeError && (
                        <div className={`${NEU_SURFACE_INSET_SM} rounded-xl flex items-center gap-2 px-4 py-3`}>
                            <span className={`${NEU_MONO} text-sm text-[#FF2157]`}>{storeError}</span>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* ── Pagination Footer ── */}
            {!isLoading && reviews.length > 0 && (
                <div className={`${NEU_SURFACE_INSET} px-6 py-3 rounded-b-2xl flex items-center justify-between gap-3 flex-wrap`}>
                    <span className={`${NEU_MONO} text-sm`}>
                        Showing{" "}
                        <span className="text-[#006666] font-bold">
                            {(pagination.page - 1) * currentLimit + 1}–{Math.min(pagination.page * currentLimit, pagination.total)}
                        </span>
                        {" of "}
                        <span className="text-[#006666] font-bold">{pagination.total}</span>
                        {" reviews"}
                    </span>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            disabled={pagination.page === 1}
                            onClick={() => goToPage(pagination.page - 1)}
                            className={NEU_BTN_ICON}
                            aria-label="Previous page"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>

                        <div className={`${NEU_BTN_ICON_ACTIVE} w-auto px-3 font-[family-name:var(--font-space-mono)] text-xs font-bold`}>
                            {pagination.page} / {pagination.pages}
                        </div>

                        <button
                            type="button"
                            disabled={pagination.page === pagination.pages}
                            onClick={() => goToPage(pagination.page + 1)}
                            className={NEU_BTN_ICON}
                            aria-label="Next page"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            )}

            {/* ── Lightbox ── */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#1E2938]/80 z-50 flex items-center justify-center p-8"
                        onClick={closeLightbox}
                    >
                        <button
                            type="button"
                            onClick={closeLightbox}
                            className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-colors"
                            aria-label="Close lightbox"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                        <div className="max-w-[90%] max-h-[90%]">
                            <Image
                                src={lightbox.url} alt="Lightbox"
                                width={1400} height={900}
                                className="max-h-[90vh] rounded-2xl object-contain "
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}