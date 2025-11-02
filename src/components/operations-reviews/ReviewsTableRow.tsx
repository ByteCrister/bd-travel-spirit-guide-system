"use client";

import { JSX, useCallback, useRef, useState } from "react";
import Link from "next/link";
import {
    FaChevronDown,
    FaChevronUp,
    FaThumbsUp,
    FaCheckCircle,
    FaTimesCircle,
    FaTrash,
    FaUndo,
    FaStar,
    FaRegStar,
    FaImage,
    FaShieldAlt,
    FaExternalLinkAlt,
    FaEllipsisV,
    FaClock,
    FaEdit,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ReviewDetailAccordion from "./ReviewDetailAccordion";
import ConfirmDialog from "./primitives/ConfirmDialog";
import { useReviewsStore } from "@/store/useReviewsStore";
import type { ApiError, ReviewListItemDTO } from "@/types/reviews.types";
import { formatFullDate, formatRelativeDate, isApiError, ratingToStars, statusBadgeProps, truncate } from "@/utils/helpers/reviews.uiHelpers";
import { toast } from "sonner";

interface Props {
    review: ReviewListItemDTO;
    isFirst?: boolean;
    onFirstRef?: (el: HTMLButtonElement | HTMLAnchorElement | null) => void;
}

function ReviewsTableRow({ review, isFirst, onFirstRef }: Props): JSX.Element {
    const [open, setOpen] = useState<boolean>(false);
    const [showActions, setShowActions] = useState<boolean>(false);
    const [confirm, setConfirm] = useState<{ type: "approve" | "reject" | "delete" | "restore" | null }>({ type: null });
    const firstActionRef = useRef<HTMLButtonElement | null>(null);

    const {
        toolbar,
        toggleSelect,
        incrementHelpful,
        approveReview,
        rejectReview,
        deleteReview,
        restoreReview,
    } = useReviewsStore();

    const isChecked = toolbar.selectedIds.includes(review._id);

    // Star rating component using ratingToStars utility
    const StarRating = ({ rating }: { rating: number }) => {
        const fullStars = Math.floor(rating);
        const emptyStars = 5 - fullStars;
        const starsString = ratingToStars(rating); // Using utility function

        return (
            <div className="flex items-center gap-0.5" title={`${starsString} (${rating.toFixed(1)}/5)`}>
                {[...Array(fullStars)].map((_, i) => (
                    <FaStar key={`full-${i}`} className="w-3.5 h-3.5 text-amber-400" />
                ))}
                {[...Array(emptyStars)].map((_, i) => (
                    <FaRegStar key={`empty-${i}`} className="w-3.5 h-3.5 text-slate-300" />
                ))}
            </div>
        );
    };

    // Optimistic helpful increment with rollback
    const handleHelpful = async () => {
        try {
            await incrementHelpful(review._id);
            toast.success("Marked as helpful");
        } catch (err: unknown) {
            const normalized: ApiError = isApiError(err)
                ? err
                : { message: err instanceof Error ? err.message : "Failed to mark helpful" };
            toast.error(normalized?.message ?? "Failed to mark helpful");
        }
    };

    const toggleAccordion = () => {
        setOpen((v) => !v);
    };

    const onKeyRow = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && e.target === e.currentTarget) toggleAccordion();
        if (e.key === " " && e.target === e.currentTarget) {
            e.preventDefault();
            toggleAccordion();
        }
        if (e.key === "Escape") setOpen(false);
    };

    const onConfirmAction = async () => {
        try {
            switch (confirm.type) {
                case "approve":
                    await approveReview(review._id);
                    toast.success("Review approved successfully");
                    break;
                case "reject":
                    await rejectReview(review._id);
                    toast.success("Review rejected");
                    break;
                case "delete":
                    await deleteReview(review._id, true);
                    toast.success("Review deleted");
                    break;
                case "restore":
                    await restoreReview(review._id);
                    toast.success("Review restored");
                    break;
            }
        } catch (err: unknown) {
            const normalized: ApiError = isApiError(err)
                ? err
                : { message: err instanceof Error ? err.message : "Action failed" };
            toast.error(normalized?.message ?? "Action failed");
        } finally {
            setConfirm({ type: null });
        }
    };

    // Using utility functions
    const createdRel = formatRelativeDate(review.createdAt);
    const createdFull = formatFullDate(review.createdAt);
    const updatedRel = review.updatedAt ? formatRelativeDate(review.updatedAt) : null;
    const commentPreview = truncate(review.comment, 180);
    const { label: statusLabel, color: statusColor } = statusBadgeProps(review.isApproved);

    const setFirstRef = useCallback(
        (el: HTMLAnchorElement | HTMLButtonElement | null) => {
            if (isFirst) onFirstRef?.(el);
        },
        [isFirst, onFirstRef]
    );

    const hasImages = review.images && review.images.length > 0;
    const isDeleted = !!review.deletedAt;
    const isEdited = review.updatedAt && review.updatedAt !== review.createdAt;

    // Status badge with proper styling based on utility
    const statusColorClasses = statusColor === "green"
        ? "text-emerald-700 bg-emerald-50 ring-emerald-600/10"
        : "text-amber-700 bg-amber-50 ring-amber-600/10";

    return (
        <>
            <div
                role="row"
                tabIndex={0}
                onKeyDown={onKeyRow}
                onClick={(e) => {
                    if (e.target === e.currentTarget) toggleAccordion();
                }}
                className={`relative grid grid-cols-[40px_60px_1fr_200px_140px_100px_120px_50px] gap-4 px-4 py-3 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-inset ${open ? "bg-blue-50/30" : ""
                    } ${isDeleted ? "opacity-60" : ""}`}
            >
                {/* Checkbox */}
                <div role="cell" className="flex items-center" onClick={(e) => e.stopPropagation()}>
                    <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => toggleSelect(review._id, e.target.checked)}                        
                        className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                        aria-label={`Select review ${review._id}`}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>

                {/* Rating */}
                <div role="cell" className="flex items-center">
                    <div className="flex flex-col gap-1">
                        <StarRating rating={review.rating} />
                        <span className="text-xs font-semibold text-slate-900">{review.rating.toFixed(1)}</span>
                    </div>
                </div>

                {/* Review Content */}
                <div role="cell" className="flex flex-col gap-1 min-w-0">
                    {review.title && (
                        <h4 className="font-semibold text-sm text-slate-900 truncate" title={review.title}>
                            {review.title}
                        </h4>
                    )}
                    <p className="text-sm text-slate-600 line-clamp-2" title={review.comment}>
                        {commentPreview}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {hasImages && (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                <FaImage className="w-3 h-3" />
                                {review.images!.length} {review.images!.length === 1 ? 'image' : 'images'}
                            </span>
                        )}
                        {review.isVerified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-full">
                                <FaShieldAlt className="w-2.5 h-2.5" />
                                Verified
                            </span>
                        )}
                        {isEdited && (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500" title={`Last updated: ${updatedRel}`}>
                                <FaEdit className="w-2.5 h-2.5" />
                                Edited
                            </span>
                        )}
                        {isDeleted && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-red-700 bg-red-50 rounded-full">
                                <FaTrash className="w-2.5 h-2.5" />
                                Deleted
                            </span>
                        )}
                    </div>
                </div>

                {/* Tour */}
                <div role="cell" className="flex items-center min-w-0">
                    <Link
                        href={`/tours/${review.tourId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors truncate group"
                        ref={setFirstRef}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span className="truncate">{review.tourTitle ?? review.tourId}</span>
                        <FaExternalLinkAlt className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                </div>

                {/* User */}
                <div role="cell" className="flex items-center min-w-0">
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-medium text-slate-900 truncate" title={review.userName ?? review.userId}>
                            {review.userName ?? review.userId}
                        </span>
                        {review.tripType && (
                            <span className="text-xs text-slate-500 truncate capitalize">{review.tripType}</span>
                        )}
                        {review.travelDate && (
                            <span className="text-xs text-slate-400 truncate">
                                Traveled: {new Date(review.travelDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </span>
                        )}
                    </div>
                </div>

                {/* Date */}
                <div role="cell" className="flex items-center">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-slate-900 flex items-center gap-1" title={createdFull}>
                            <FaClock className="w-3 h-3 text-slate-400" />
                            {createdRel}
                        </span>
                        <span className="text-xs text-slate-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        {isEdited && updatedRel && (
                            <span className="text-xs text-slate-400 italic">
                                Updated {updatedRel}
                            </span>
                        )}
                    </div>
                </div>

                {/* Status */}
                <div role="cell" className="flex items-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium ${statusColorClasses} rounded-lg ring-1`}>
                            {review.isApproved ? (
                                <FaCheckCircle className="w-3 h-3" />
                            ) : (
                                <FaTimesCircle className="w-3 h-3" />
                            )}
                            {statusLabel}
                        </span>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            onClick={handleHelpful}
                            aria-label="Mark helpful"
                            title={`${review.helpfulCount} people found this helpful`}
                        >
                            <FaThumbsUp className="w-3 h-3" />
                            {review.helpfulCount}
                        </motion.button>
                    </div>
                </div>

                {/* Actions */}
                <div role="cell" className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            className={`p-2 rounded-lg transition-colors ${open ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-600"
                                }`}
                            aria-label={open ? "Collapse details" : "Expand details"}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleAccordion();
                            }}
                        >
                            {open ? (
                                <FaChevronUp className="w-4 h-4" />
                            ) : (
                                <FaChevronDown className="w-4 h-4" />
                            )}
                        </motion.button>
                    </div>

                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowActions(!showActions);
                            }}
                            aria-label="More actions"
                        >
                            <FaEllipsisV className="w-4 h-4 text-slate-600" />
                        </motion.button>

                        <AnimatePresence>
                            {showActions && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50"
                                    onMouseLeave={() => setShowActions(false)}
                                >
                                    {review.isApproved ? (
                                        <button
                                            type="button"
                                            className="w-full px-3 py-2 text-left text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setConfirm({ type: "reject" });
                                                setShowActions(false);
                                            }}
                                            ref={firstActionRef}
                                        >
                                            <FaTimesCircle className="w-3.5 h-3.5" />
                                            Reject
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="w-full px-3 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setConfirm({ type: "approve" });
                                                setShowActions(false);
                                            }}
                                            ref={firstActionRef}
                                        >
                                            <FaCheckCircle className="w-3.5 h-3.5" />
                                            Approve
                                        </button>
                                    )}
                                    {!isDeleted ? (
                                        <button
                                            type="button"
                                            className="w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setConfirm({ type: "delete" });
                                                setShowActions(false);
                                            }}
                                        >
                                            <FaTrash className="w-3.5 h-3.5" />
                                            Delete
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="w-full px-3 py-2 text-left text-sm text-blue-700 hover:bg-blue-50 flex items-center gap-2 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setConfirm({ type: "restore" });
                                                setShowActions(false);
                                            }}
                                        >
                                            <FaUndo className="w-3.5 h-3.5" />
                                            Restore
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Hover indicator */}
                <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r"
                    initial={{ scaleY: 0 }}
                    whileHover={{ scaleY: 1 }}
                    transition={{ duration: 0.2 }}
                />
            </div>

            {/* Accordion Detail Panel */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        role="region"
                        aria-label="Review details"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-slate-100 bg-slate-50/30"
                    >
                        <div className="px-4 py-4">
                            <ReviewDetailAccordion
                                reviewId={review._id}
                                isOpen={open}
                                onClose={() => setOpen(false)}
                                onFocusFirst={() => firstActionRef.current?.focus()}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                open={!!confirm.type}
                title={`Confirm ${confirm.type}`}
                description={`Are you sure you want to ${confirm.type} this review by ${review.userName ?? 'this user'}? This action may affect the review's visibility and status.`}
                onCancel={() => setConfirm({ type: null })}
                onConfirm={onConfirmAction}
            />
        </>
    );
}

export default ReviewsTableRow;