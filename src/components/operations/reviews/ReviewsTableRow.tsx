"use client";

import { JSX, useCallback, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    ChevronUp,
    ThumbsUp,
    CheckCircle,
    XCircle,
    Trash2,
    Undo2,
    Star,
    StarHalf,
    Image as ImageIcon,
    ExternalLink,
    MoreVertical,
    Clock,
    Edit,
    Calendar,
    User,
    Tag,
} from "lucide-react";
import ReviewDetailAccordion from "./ReviewDetailAccordion";
import ConfirmDialog from "./primitives/ConfirmDialog";
import { useReviewsStore } from "@/store/reviews.store";
import type { ApiError, ReviewListItemDTO } from "@/types/reviews.types";
import {
    formatFullDate,
    formatRelativeDate,
    isApiError,
    ratingToStars,
    statusBadgeProps,
    truncate,
} from "@/utils/helpers/reviews.uiHelpers";
import { toast } from "sonner";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";

interface Props {
    review: ReviewListItemDTO;
    isFirst?: boolean;
    onFirstRef?: (el: HTMLButtonElement | HTMLAnchorElement | null) => void;
}

function ReviewsTableRow({ review, isFirst, onFirstRef }: Props): JSX.Element {
    const [open, setOpen] = useState<boolean>(false);
    const [showActions, setShowActions] = useState<boolean>(false);
    const [confirm, setConfirm] = useState<{
        type: "approve" | "reject" | "delete" | "restore" | null;
    }>({ type: null });
    const firstActionRef = useRef<HTMLButtonElement | null>(null);

    const {
        approveReview,
        rejectReview,
        deleteReview,
        restoreReview,
    } = useReviewsStore();

    // Star rating component using ratingToStars utility
    const StarRating = ({ rating }: { rating: number }) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <div
                className="flex flex-col items-center gap-1"
                title={`${ratingToStars(rating)} (${rating.toFixed(1)}/5)`}
            >
                <div className="flex items-center gap-0.5">
                    {[...Array(fullStars)].map((_, i) => (
                        <Star
                            key={`full-${i}`}
                            className="w-4 h-4 fill-amber-400 text-amber-400"
                        />
                    ))}
                    {hasHalfStar && (
                        <StarHalf className="w-4 h-4 fill-amber-400 text-amber-400" />
                    )}
                    {[...Array(emptyStars)].map((_, i) => (
                        <Star key={`empty-${i}`} className="w-4 h-4 text-slate-300" />
                    ))}
                </div>
                <span className="text-sm font-semibold text-slate-900">
                    {rating.toFixed(1)}
                </span>
            </div>
        );
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
                    await deleteReview(review._id);
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
    const updatedRel = review.updatedAt
        ? formatRelativeDate(review.updatedAt)
        : null;
    const commentPreview = truncate(review.comment, 120);
    const { label: statusLabel, color: statusColor } = statusBadgeProps(
        review.isApproved
    );

    const setFirstRef = useCallback(
        (el: HTMLAnchorElement | HTMLButtonElement | null) => {
            if (isFirst) onFirstRef?.(el);
        },
        [isFirst, onFirstRef]
    );

    const hasImages = review.imageCount && review.imageCount > 0;
    const isDeleted = !!review.deletedAt;
    const isEdited = review.updatedAt && review.updatedAt !== review.createdAt;

    // Status badge with proper styling based on utility
    const statusColorClasses =
        statusColor === "green"
            ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
            : "text-amber-700 bg-amber-50 border border-amber-200";

    return (
        <>
            <div
                role="row"
                tabIndex={0}
                onKeyDown={onKeyRow}
                onClick={(e) => {
                    if (e.target === e.currentTarget) toggleAccordion();
                }}
                className={`relative grid grid-cols-[100px_minmax(300px,1fr)_180px_160px_160px_140px_80px] gap-3 px-4 py-4 cursor-pointer transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-inset ${open ? "bg-blue-50/50" : "bg-white"
                    } ${isDeleted ? "opacity-70" : ""} border-b border-slate-100`}
            >
                {/* Rating Column */}
                <div role="cell" className="flex items-center justify-center">
                    <StarRating rating={review.rating} />
                </div>

                {/* Review Content Column - Made wider */}
                <div role="cell" className="flex flex-col gap-2 min-w-0">
                    {review.title && (
                        <h4
                            className="font-semibold text-sm text-slate-900 line-clamp-1"
                            title={review.title}
                        >
                            {review.title}
                        </h4>
                    )}
                    <p
                        className="text-sm text-slate-600 line-clamp-2"
                        title={review.comment}
                    >
                        {commentPreview}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {hasImages && (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                <ImageIcon className="w-3 h-3" />
                                {review.imageCount}
                            </span>
                        )}
                        {isEdited && (
                            <span
                                className="inline-flex items-center gap-1 text-xs text-slate-500 italic"
                                title={`Last updated: ${updatedRel}`}
                            >
                                <Edit className="w-3 h-3" />
                                Edited
                            </span>
                        )}
                        {isDeleted && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded-md">
                                <Trash2 className="w-3 h-3" />
                                Deleted
                            </span>
                        )}
                    </div>
                </div>

                {/* Tour Column */}
                <div role="cell" className="flex items-center min-w-0">
                    <Link
                        href={`/operations/tours/${encodeURIComponent(encodeId(review.tourId)!)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors truncate group p-2 rounded hover:bg-blue-50"
                        ref={setFirstRef}
                        onClick={(e) => e.stopPropagation()}
                        title={review.tourTitle ?? review.tourId}
                    >
                        <span className="truncate font-medium">
                            {review.tourTitle ?? review.tourId}
                        </span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </Link>
                </div>

                {/* User Column */}
                <div role="cell" className="flex items-center min-w-0">
                    <div className="flex flex-col gap-1 min-w-0 p-2">
                        <span
                            className="text-sm font-medium text-slate-900 truncate flex items-center gap-1"
                            title={review.userName ?? review.userId}
                        >
                            <User className="w-3 h-3" />
                            {review.userName ?? review.userId}
                        </span>
                        {review.tripType && (
                            <span className="text-xs text-slate-500 truncate capitalize bg-slate-100 px-2 py-1 rounded flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {review.tripType}
                            </span>
                        )}
                        {review.travelDate && (
                            <span className="text-xs text-slate-400 truncate mt-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(review.travelDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    year: "numeric",
                                })}
                            </span>
                        )}
                    </div>
                </div>

                {/* Date Column */}
                <div role="cell" className="flex items-center">
                    <div className="flex flex-col gap-1 p-2 min-w-0">
                        <span
                            className="text-sm text-slate-900 flex items-center gap-2"
                            title={createdFull}
                        >
                            <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{createdRel}</span>
                        </span>
                        <span className="text-xs text-slate-500 truncate">
                            {new Date(review.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </span>
                        {isEdited && updatedRel && (
                            <span className="text-xs text-slate-400 truncate italic mt-1 flex items-center gap-1">
                                <Edit className="w-3 h-3" />
                                Updated {updatedRel}
                            </span>
                        )}
                    </div>
                </div>

                {/* Status Column */}
                <div
                    role="cell"
                    className="flex items-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col gap-2 w-full p-2">
                        <span
                            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium ${statusColorClasses} rounded-lg`}
                        >
                            {review.isApproved ? (
                                <CheckCircle className="w-3.5 h-3.5" />
                            ) : (
                                <XCircle className="w-3.5 h-3.5" />
                            )}
                            <span className="truncate">{statusLabel}</span>
                        </span>
                        <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 rounded-lg border border-slate-200">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{review.helpfulCount}</span>
                        </div>
                    </div>
                </div>

                {/* Actions Column */}
                <div
                    role="cell"
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center gap-1">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            className={`p-2 rounded-lg transition-colors ${open
                                ? "bg-blue-100 text-blue-700"
                                : "hover:bg-slate-100 text-slate-600"
                                }`}
                            aria-label={open ? "Collapse details" : "Expand details"}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleAccordion();
                            }}
                        >
                            {open ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </motion.button>

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
                                <MoreVertical className="w-4 h-4 text-slate-600" />
                            </motion.button>

                            <AnimatePresence>
                                {showActions && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50"
                                        onMouseLeave={() => setShowActions(false)}
                                    >
                                        {review.isApproved ? (
                                            <button
                                                type="button"
                                                className="w-full px-4 py-2.5 text-left text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-3 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConfirm({ type: "reject" });
                                                    setShowActions(false);
                                                }}
                                                ref={firstActionRef}
                                            >
                                                <XCircle className="w-4 h-4" />
                                                <span>Reject Review</span>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="w-full px-4 py-2.5 text-left text-sm text-emerald-700 hover:bg-emerald-50 flex items-center gap-3 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConfirm({ type: "approve" });
                                                    setShowActions(false);
                                                }}
                                                ref={firstActionRef}
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Approve Review</span>
                                            </button>
                                        )}
                                        {!isDeleted ? (
                                            <button
                                                type="button"
                                                className="w-full px-4 py-2.5 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConfirm({ type: "delete" });
                                                    setShowActions(false);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span>Delete Review</span>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="w-full px-4 py-2.5 text-left text-sm text-blue-700 hover:bg-blue-50 flex items-center gap-3 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConfirm({ type: "restore" });
                                                    setShowActions(false);
                                                }}
                                            >
                                                <Undo2 className="w-4 h-4" />
                                                <span>Restore Review</span>
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
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
                        className="border-t border-slate-200 bg-slate-50/50"
                    >
                        <div className="px-6 py-5">
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
                description={`Are you sure you want to ${confirm.type} this review by ${review.userName ?? "this user"}? This action may affect the review's visibility and status.`}
                onCancel={() => setConfirm({ type: null })}
                onConfirm={onConfirmAction}
            />
        </>
    );
}

export default ReviewsTableRow;
