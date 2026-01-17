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
import {
    truncate,
    formatRelativeDate,
} from "@/utils/helpers/reviews.uiHelpers";
import ReviewsTableRow from "./ReviewsTableRow";
import type { ReviewsListCache } from "@/types/reviews.types";

interface Props {
    entry: ReviewsListCache | null;
    page: number;
    limit: number;
    onFirstRowRef?: (el: HTMLButtonElement | HTMLAnchorElement | null) => void;
}

function ReviewsTable({
    entry,
    page,
    limit,
    onFirstRowRef,
}: Props): JSX.Element {
    const docs = useMemo(() => entry?.data?.docs ?? [], [entry?.data?.docs]);
    const empty = !entry?.isLoading && docs.length === 0;
    const isLoading = entry?.isLoading ?? false;

    const rows = useMemo(() => docs, [docs]);
    // Calculate statistics from rows
    const stats = useMemo(() => {
        const approvedCount = rows.filter((r) => r.isApproved).length;
        const withImagesCount =
            rows.length > 0 ? rows.reduce((sum, r) => sum + r.imageCount, 0) : 0;
        const avgRating =
            rows.length > 0
                ? rows.reduce((sum, r) => sum + r.rating, 0) / rows.length
                : 0;

        return { approvedCount, withImagesCount, avgRating };
    }, [rows]);

    return (
        <div className="relative" data-testid="table">
            {/* Statistics Bar - Using calculated stats */}
            {!empty && !isLoading && rows.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200"
                >
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-2">
                                <FaInfoCircle className="w-3.5 h-3.5 text-blue-600" />
                                <span className="font-medium text-slate-700">Page Stats:</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg shadow-sm">
                                <FaCheckCircle className="w-3 h-3 text-emerald-600" />
                                <span className="font-medium text-slate-900">
                                    {stats.approvedCount}
                                </span>
                                <span className="text-slate-500">approved</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg shadow-sm">
                                <FaImage className="w-3 h-3 text-purple-600" />
                                <span className="font-medium text-slate-900">
                                    {stats.withImagesCount}
                                </span>
                                <span className="text-slate-500">with images</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg shadow-sm">
                                <FaStar className="w-3 h-3 text-amber-400" />
                                <span className="font-medium text-slate-900">
                                    {stats.avgRating.toFixed(2)}
                                </span>
                                <span className="text-slate-500">avg rating</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Modern Table Container */}
            <div className="overflow-hidden">
                {/* Table Header - Sticky with modern styling */}
                <div className="sticky top-0 z-20 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <div className="grid grid-cols-[40px_60px_1fr_200px_140px_100px_120px_50px] gap-4 px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        <div className="flex items-center">Rating</div>
                        <div className="flex items-center">Review Content</div>
                        <div className="flex items-center gap-1">
                            <FaMapMarkerAlt className="w-3 h-3" />
                            Tour
                        </div>
                        <div className="flex items-center gap-1">
                            <FaUserCircle className="w-3 h-3" />
                            User
                        </div>
                        <div className="flex items-center gap-1">
                            <FaClock className="w-3 h-3" />
                            Date
                        </div>
                        <div className="flex items-center gap-1">Status</div>
                        <div className="flex items-center justify-center">Actions</div>
                    </div>
                </div>

                {/* Table Body */}
                <div role="rowgroup" className="divide-y divide-slate-100">
                    {isLoading ? (
                        // Loading skeletons
                        <div className="space-y-0">
                            {[...Array(limit)].map((_, idx) => (
                                <div key={idx} className="px-4 py-4 animate-pulse">
                                    <div className="grid grid-cols-[40px_60px_1fr_200px_140px_100px_120px_50px] gap-4">
                                        <div className="h-4 bg-slate-200 rounded" />
                                        <div className="h-4 bg-slate-200 rounded" />
                                        <div className="space-y-2">
                                            <div className="h-4 bg-slate-200 rounded w-3/4" />
                                            <div className="h-3 bg-slate-200 rounded w-full" />
                                        </div>
                                        <div className="h-4 bg-slate-200 rounded" />
                                        <div className="h-4 bg-slate-200 rounded" />
                                        <div className="h-4 bg-slate-200 rounded" />
                                        <div className="h-4 bg-slate-200 rounded" />
                                        <div className="h-4 bg-slate-200 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {rows.map((review, idx) => {
                                // Use truncate utility for preview
                                const commentPreview = truncate(review.comment, 160);

                                return (
                                    <motion.div
                                        key={review._id}
                                        layout
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                                        className="group hover:bg-slate-50/50 transition-colors"
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

                    {/* Empty State with helpful suggestions */}
                    {empty && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="py-16 px-4"
                        >
                            <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <FaFilter className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                    No reviews found
                                </h3>
                                <p className="text-sm text-slate-600 mb-6">
                                    {entry?.error
                                        ? `Error: ${entry.error.message}. Please try again.`
                                        : "No reviews match your current filters. Try adjusting your search criteria or resetting filters to see more results."}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg">
                                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                                        <span>Clear search</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg">
                                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                                        <span>Reset filters</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                        <span>Try again</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Results Summary Footer with enhanced info */}
            {!empty && !isLoading && entry?.data && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="sticky bottom-0 z-10 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200"
                >
                    <div className="flex items-center justify-between px-4 py-2.5 text-xs">
                        <div className="flex items-center gap-4">
                            <span className="font-medium text-slate-900">
                                Showing {(page - 1) * limit + 1}-
                                {Math.min(page * limit, entry.data.total)} of{" "}
                                {entry.data.total.toLocaleString()} reviews
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-600">
                            {entry.fetchedAt && (
                                <span className="flex items-center gap-1.5">
                                    <FaClock className="w-3 h-3" />
                                    Updated{" "}
                                    {formatRelativeDate(new Date(entry.fetchedAt).toISOString())}
                                </span>
                            )}
                            {entry.isStale && (
                                <span className="flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
                                    <FaInfoCircle className="w-3 h-3" />
                                    Stale data
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default ReviewsTable;
