"use client";

import { JSX, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    FaStar,
    FaCheckCircle,
    FaClock,
    FaImage,
    FaUserCircle,
    FaMapMarkerAlt,
    FaFilter,
    FaInfoCircle,
} from "react-icons/fa";
import { truncate, formatRelativeDate } from "@/utils/helpers/reviews.uiHelpers";
import ReviewsTableRow from "./ReviewsTableRow";
import type { ReviewsListCache } from "@/types/tour/reviews.types";

// ── Tokens ───────────────────────────────────────────────────────────────────
const S       = "#E7E5E4";
const TEXT    = "#1E2938";
const MUTED   = "#607080";
const PRIMARY = "#006666";
const MONO    = "var(--font-jetbrains-mono), monospace";
const BRAND   = "var(--font-space-mono), monospace";
const SHADOW_IN = "inset 3px 3px 7px #c9c7c6, inset -3px -3px 7px #ffffff";

interface Props {
    entry: ReviewsListCache | null;
    page: number;
    limit: number;
    onFirstRowRef?: (el: HTMLButtonElement | HTMLAnchorElement | null) => void;
}

function ReviewsTable({ entry, page, limit, onFirstRowRef }: Props): JSX.Element {
    const docs = useMemo(() => entry?.data?.docs ?? [], [entry?.data?.docs]);
    const empty     = !entry?.isLoading && docs.length === 0;
    const isLoading = entry?.isLoading ?? false;
    const rows = useMemo(() => docs, [docs]);

    const stats = useMemo(() => {
        const approvedCount   = rows.filter((r) => r.isApproved).length;
        const withImagesCount = rows.reduce((sum, r) => sum + r.imageCount, 0);
        const avgRating       = rows.length > 0
            ? rows.reduce((sum, r) => sum + r.rating, 0) / rows.length
            : 0;
        return { approvedCount, withImagesCount, avgRating };
    }, [rows]);

    /** Compact neumorphic stat chip */
    const StatChip = ({
        icon,
        value,
        label,
        iconColor,
    }: {
        icon: React.ReactNode;
        value: string | number;
        label: string;
        iconColor: string;
    }) => (
        <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
            style={{ background: S, boxShadow: SHADOW_IN, fontFamily: MONO, color: TEXT }}
        >
            <span style={{ color: iconColor }}>{icon}</span>
            <span className="font-bold">{value}</span>
            <span style={{ color: MUTED }}>{label}</span>
        </div>
    );

    return (
        <div className="relative" data-testid="table">
            {/* ── Stats bar ── */}
            {!empty && !isLoading && rows.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-5 py-3 flex items-center gap-4 flex-wrap"
                    style={{
                        background: "#e0dedd",
                        borderBottom: "1px solid #d1cfce",
                    }}
                >
                    <span
                        className="flex items-center gap-1.5 text-xs font-medium"
                        style={{ color: MUTED, fontFamily: MONO }}
                    >
                        <FaInfoCircle className="w-3 h-3" style={{ color: PRIMARY }} />
                        Page Stats:
                    </span>
                    <StatChip
                        icon={<FaCheckCircle className="w-3 h-3" />}
                        iconColor="#00A63D"
                        value={stats.approvedCount}
                        label="approved"
                    />
                    <StatChip
                        icon={<FaImage className="w-3 h-3" />}
                        iconColor="#7c3aed"
                        value={stats.withImagesCount}
                        label="images"
                    />
                    <StatChip
                        icon={<FaStar className="w-3 h-3" />}
                        iconColor="#FE9900"
                        value={stats.avgRating.toFixed(2)}
                        label="avg"
                    />
                </motion.div>
            )}

            {/* ── Column header ── */}
            <div
                className="sticky top-0 z-20"
                style={{ background: S, borderBottom: "1px solid #d1cfce" }}
            >
                <div
                    className="grid grid-cols-[100px_minmax(300px,1fr)_180px_160px_160px_140px_80px] gap-3 px-5 py-3 text-xs font-bold uppercase tracking-widest"
                    style={{ color: MUTED, fontFamily: BRAND }}
                >
                    <div>Rating</div>
                    <div>Review</div>
                    <div className="flex items-center gap-1">
                        <FaMapMarkerAlt className="w-3 h-3" /> Tour
                    </div>
                    <div className="flex items-center gap-1">
                        <FaUserCircle className="w-3 h-3" /> User
                    </div>
                    <div className="flex items-center gap-1">
                        <FaClock className="w-3 h-3" /> Date
                    </div>
                    <div>Status</div>
                    <div className="text-center">Actions</div>
                </div>
            </div>

            {/* ── Body ── */}
            <div role="rowgroup">
                {isLoading ? (
                    <div>
                        {[...Array(limit)].map((_, idx) => (
                            <div
                                key={idx}
                                className="px-5 py-4 animate-pulse"
                                style={{ borderBottom: "1px solid #d1cfce" }}
                            >
                                <div className="grid grid-cols-[100px_minmax(300px,1fr)_180px_160px_160px_140px_80px] gap-3">
                                    <div className="h-8 rounded-lg" style={{ background: "#d8d6d5" }} />
                                    <div className="space-y-2">
                                        <div className="h-3 rounded w-3/4" style={{ background: "#d8d6d5" }} />
                                        <div className="h-3 rounded w-full" style={{ background: "#d8d6d5" }} />
                                    </div>
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-4 rounded" style={{ background: "#d8d6d5" }} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {rows.map((review, idx) => {
                            const commentPreview = truncate(review.comment, 160);
                            return (
                                <motion.div
                                    key={review._id}
                                    layout
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.18, delay: idx * 0.025 }}
                                    title={commentPreview}
                                >
                                    <ReviewsTableRow
                                        review={review}
                                        isFirst={idx === 0}
                                        onFirstRef={onFirstRowRef}
                                    />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}

                {/* ── Empty state ── */}
                {empty && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25 }}
                        className="py-16 px-4"
                    >
                        <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto gap-4">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                style={{ background: S, boxShadow: "6px 6px 14px #c9c7c6, -6px -6px 14px #ffffff" }}
                            >
                                <FaFilter className="w-7 h-7" style={{ color: MUTED }} />
                            </div>
                            <h3
                                className="text-base font-bold"
                                style={{ color: TEXT, fontFamily: BRAND }}
                            >
                                No reviews found
                            </h3>
                            <p className="text-xs leading-relaxed" style={{ color: MUTED, fontFamily: MONO }}>
                                {entry?.error
                                    ? `Error: ${entry.error.message}. Please try again.`
                                    : "No reviews match your current filters. Try adjusting your search or resetting filters."}
                            </p>
                            <div className="flex items-center gap-2 text-xs" style={{ fontFamily: MONO }}>
                                {[
                                    { label: "Clear search", dot: PRIMARY },
                                    { label: "Reset filters", dot: "#FE9900" },
                                    { label: "Try again", dot: "#00A63D" },
                                ].map(({ label, dot }) => (
                                    <div
                                        key={label}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                                        style={{ background: S, boxShadow: "3px 3px 7px #c9c7c6, -3px -3px 7px #ffffff", color: MUTED }}
                                    >
                                        <div className="w-2 h-2 rounded-full" style={{ background: dot }} />
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* ── Footer summary ── */}
            {!empty && !isLoading && entry?.data && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="sticky bottom-0 z-10 flex items-center justify-between px-5 py-2.5 text-xs"
                    style={{
                        background: "#e0dedd",
                        borderTop: "1px solid #d1cfce",
                        fontFamily: MONO,
                        color: MUTED,
                    }}
                >
                    <span style={{ color: TEXT, fontFamily: BRAND, fontWeight: 700 }}>
                        Showing {(page - 1) * limit + 1}–
                        {Math.min(page * limit, entry.data.total)} of{" "}
                        {entry.data.total.toLocaleString()} reviews
                    </span>
                    <div className="flex items-center gap-4">
                        {entry.fetchedAt && (
                            <span className="flex items-center gap-1.5">
                                <FaClock className="w-3 h-3" />
                                Updated {formatRelativeDate(new Date(entry.fetchedAt).toISOString())}
                            </span>
                        )}
                        {entry.isStale && (
                            <span
                                className="flex items-center gap-1.5 px-2 py-1 rounded-lg font-medium"
                                style={{ background: "#fff7ed", color: "#c2410c" }}
                            >
                                <FaInfoCircle className="w-3 h-3" />
                                Stale
                            </span>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default ReviewsTable;