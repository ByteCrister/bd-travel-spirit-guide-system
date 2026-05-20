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
import type { ApiError, ReviewListItemDTO } from "@/types/tour/reviews.types";
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

// ── Tokens ───────────────────────────────────────────────────────────────────
const S          = "#E7E5E4";
const SHADOW_OUT = "6px 6px 14px #c9c7c6, -6px -6px 14px #ffffff";
const SHADOW_IN  = "inset 3px 3px 7px #c9c7c6, inset -3px -3px 7px #ffffff";
const PRIMARY    = "#006666";
const TEXT       = "#1E2938";
const MUTED      = "#607080";
const MONO       = "var(--font-jetbrains-mono), monospace";
const BRAND      = "var(--font-space-mono), monospace";

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

    const { approveReview, rejectReview, deleteReview, restoreReview } = useReviewsStore();

    const StarRating = ({ rating }: { rating: number }) => {
        const fullStars  = Math.floor(rating);
        const hasHalf    = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
        return (
            <div
                className="flex flex-col items-center gap-1"
                title={`${ratingToStars(rating)} (${rating.toFixed(1)}/5)`}
            >
                <div className="flex items-center gap-0.5">
                    {[...Array(fullStars)].map((_, i) => (
                        <Star key={`f${i}`} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    {hasHalf && <StarHalf className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                    {[...Array(emptyStars)].map((_, i) => (
                        <Star key={`e${i}`} className="w-3.5 h-3.5" style={{ color: "#c9c7c6" }} />
                    ))}
                </div>
                <span className="text-xs font-bold" style={{ color: TEXT, fontFamily: BRAND }}>
                    {rating.toFixed(1)}
                </span>
            </div>
        );
    };

    const toggleAccordion = () => setOpen((v) => !v);

    const onKeyRow = (e: React.KeyboardEvent) => {
        if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
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

    const createdRel  = formatRelativeDate(review.createdAt);
    const createdFull = formatFullDate(review.createdAt);
    const updatedRel  = review.updatedAt ? formatRelativeDate(review.updatedAt) : null;
    const commentPreview = truncate(review.comment, 120);
    const { label: statusLabel, color: statusColor } = statusBadgeProps(review.isApproved);

    const setFirstRef = useCallback(
        (el: HTMLAnchorElement | HTMLButtonElement | null) => {
            if (isFirst) onFirstRef?.(el);
        },
        [isFirst, onFirstRef]
    );

    const hasImages = review.imageCount && review.imageCount > 0;
    const isDeleted = !!review.deletedAt;
    const isEdited  = review.updatedAt && review.updatedAt !== review.createdAt;

    const statusStyle =
        statusColor === "green"
            ? { color: "#00A63D", background: "#f0fdf4", border: "1px solid #bbf7d0" }
            : { color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a" };

    /** Small icon action button */
    const IconBtn = ({
        onClick,
        label,
        active,
        children,
    }: {
        onClick: (e: React.MouseEvent) => void;
        label: string;
        active?: boolean;
        children: React.ReactNode;
    }) => (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            aria-label={label}
            onClick={onClick}
            className="p-2 rounded-xl transition-all focus:outline-none focus-visible:ring-2"
            style={{
                background: S,
                boxShadow: active ? SHADOW_IN : SHADOW_OUT,
                color: active ? PRIMARY : TEXT,
                border: "none",
            }}
        >
            {children}
        </motion.button>
    );

    return (
        <>
            <div
                role="row"
                tabIndex={0}
                onKeyDown={onKeyRow}
                onClick={(e) => { if (e.target === e.currentTarget) toggleAccordion(); }}
                className={`relative grid grid-cols-[100px_minmax(300px,1fr)_180px_160px_160px_140px_80px] gap-3 px-5 py-4 cursor-pointer transition-all focus:outline-none focus-visible:ring-2 ${isDeleted ? "opacity-60" : ""}`}
                style={{
                    background: open ? "#dddbd9" : S,
                    borderBottom: "1px solid #d1cfce",
                }}
            >
                {/* ── Left accent bar ── */}
                <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                    style={{ background: PRIMARY }}
                    initial={{ scaleY: 0 }}
                    whileHover={{ scaleY: 1 }}
                    transition={{ duration: 0.18 }}
                />

                {/* Rating */}
                <div role="cell" className="flex items-center justify-center">
                    <div
                        className="rounded-xl p-2"
                        style={{ background: S, boxShadow: SHADOW_IN }}
                    >
                        <StarRating rating={review.rating} />
                    </div>
                </div>

                {/* Review content */}
                <div role="cell" className="flex flex-col gap-1.5 min-w-0 justify-center">
                    {review.title && (
                        <h4
                            className="font-bold text-xs line-clamp-1"
                            style={{ color: TEXT, fontFamily: BRAND }}
                            title={review.title}
                        >
                            {review.title}
                        </h4>
                    )}
                    <p
                        className="text-xs line-clamp-2 leading-relaxed"
                        style={{ color: MUTED, fontFamily: MONO }}
                        title={review.comment}
                    >
                        {commentPreview}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        {hasImages && (
                            <span
                                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg"
                                style={{ background: S, boxShadow: SHADOW_IN, color: MUTED, fontFamily: MONO }}
                            >
                                <ImageIcon className="w-3 h-3" />
                                {review.imageCount}
                            </span>
                        )}
                        {isEdited && (
                            <span
                                className="inline-flex items-center gap-1 text-xs italic"
                                style={{ color: MUTED, fontFamily: MONO }}
                                title={`Updated: ${updatedRel}`}
                            >
                                <Edit className="w-3 h-3" /> Edited
                            </span>
                        )}
                        {isDeleted && (
                            <span
                                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg font-medium"
                                style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}
                            >
                                <Trash2 className="w-3 h-3" /> Deleted
                            </span>
                        )}
                    </div>
                </div>

                {/* Tour */}
                <div role="cell" className="flex items-center min-w-0">
                    <Link
                        href={`/operations/tours/${encodeURIComponent(encodeId(review.tourId)!)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-xl transition-all truncate group"
                        style={{ color: PRIMARY, fontFamily: MONO }}
                        ref={setFirstRef}
                        onClick={(e) => e.stopPropagation()}
                        title={review.tourTitle ?? review.tourId}
                    >
                        <span className="truncate">{review.tourTitle ?? review.tourId}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Link>
                </div>

                {/* User */}
                <div role="cell" className="flex items-center min-w-0">
                    <div className="flex flex-col gap-1 min-w-0 px-1">
                        <span
                            className="text-xs font-medium truncate flex items-center gap-1"
                            style={{ color: TEXT, fontFamily: MONO }}
                            title={review.userName ?? review.userId}
                        >
                            <User className="w-3 h-3 flex-shrink-0" />
                            {review.userName ?? review.userId}
                        </span>
                        {review.tripType && (
                            <span
                                className="text-xs truncate capitalize px-2 py-0.5 rounded-lg flex items-center gap-1"
                                style={{ background: S, boxShadow: SHADOW_IN, color: MUTED, fontFamily: MONO }}
                            >
                                <Tag className="w-3 h-3" /> {review.tripType}
                            </span>
                        )}
                        {review.travelDate && (
                            <span
                                className="text-xs truncate flex items-center gap-1"
                                style={{ color: MUTED, fontFamily: MONO }}
                            >
                                <Calendar className="w-3 h-3" />
                                {new Date(review.travelDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    year: "numeric",
                                })}
                            </span>
                        )}
                    </div>
                </div>

                {/* Date */}
                <div role="cell" className="flex items-center">
                    <div className="flex flex-col gap-1 px-1 min-w-0">
                        <span
                            className="text-xs flex items-center gap-1.5"
                            style={{ color: TEXT, fontFamily: MONO }}
                            title={createdFull}
                        >
                            <Clock className="w-3 h-3 flex-shrink-0" style={{ color: MUTED }} />
                            <span className="truncate">{createdRel}</span>
                        </span>
                        <span className="text-xs truncate" style={{ color: MUTED, fontFamily: MONO }}>
                            {new Date(review.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </span>
                        {isEdited && updatedRel && (
                            <span
                                className="text-xs truncate italic flex items-center gap-1"
                                style={{ color: MUTED, fontFamily: MONO }}
                            >
                                <Edit className="w-3 h-3" /> Updated {updatedRel}
                            </span>
                        )}
                    </div>
                </div>

                {/* Status */}
                <div
                    role="cell"
                    className="flex items-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col gap-1.5 w-full px-1">
                        <span
                            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl"
                            style={{ ...statusStyle, fontFamily: MONO }}
                        >
                            {review.isApproved
                                ? <CheckCircle className="w-3 h-3" />
                                : <XCircle className="w-3 h-3" />
                            }
                            <span className="truncate">{statusLabel}</span>
                        </span>
                        <div
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-medium rounded-xl"
                            style={{ background: S, boxShadow: SHADOW_IN, color: MUTED, fontFamily: MONO }}
                        >
                            <ThumbsUp className="w-3 h-3" />
                            {review.helpfulCount}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div
                    role="cell"
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    <IconBtn
                        onClick={(e) => { e.stopPropagation(); toggleAccordion(); }}
                        label={open ? "Collapse details" : "Expand details"}
                        active={open}
                    >
                        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </IconBtn>

                    <div className="relative">
                        <IconBtn
                            onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }}
                            label="More actions"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </IconBtn>

                        <AnimatePresence>
                            {showActions && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                                    transition={{ duration: 0.14 }}
                                    className="absolute right-0 top-full mt-2 w-48 rounded-2xl py-1.5 z-50 overflow-hidden"
                                    style={{ background: S, boxShadow: SHADOW_OUT }}
                                    onMouseLeave={() => setShowActions(false)}
                                >
                                    {review.isApproved ? (
                                        <button
                                            type="button"
                                            className="w-full px-4 py-2.5 text-left text-xs flex items-center gap-3 transition-all hover:pl-5"
                                            style={{ color: "#b45309", fontFamily: MONO }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setConfirm({ type: "reject" });
                                                setShowActions(false);
                                            }}
                                            ref={firstActionRef}
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject Review
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="w-full px-4 py-2.5 text-left text-xs flex items-center gap-3 transition-all hover:pl-5"
                                            style={{ color: "#00A63D", fontFamily: MONO }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setConfirm({ type: "approve" });
                                                setShowActions(false);
                                            }}
                                            ref={firstActionRef}
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve Review
                                        </button>
                                    )}
                                    {!isDeleted ? (
                                        <button
                                            type="button"
                                            className="w-full px-4 py-2.5 text-left text-xs flex items-center gap-3 transition-all hover:pl-5"
                                            style={{ color: "#b91c1c", fontFamily: MONO }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setConfirm({ type: "delete" });
                                                setShowActions(false);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete Review
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="w-full px-4 py-2.5 text-left text-xs flex items-center gap-3 transition-all hover:pl-5"
                                            style={{ color: PRIMARY, fontFamily: MONO }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setConfirm({ type: "restore" });
                                                setShowActions(false);
                                            }}
                                        >
                                            <Undo2 className="w-4 h-4" />
                                            Restore Review
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* ── Accordion Detail ── */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        role="region"
                        aria-label="Review details"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ borderBottom: "1px solid #d1cfce", background: "#dddbd9" }}
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

            {/* ── Confirm Dialog ── */}
            <ConfirmDialog
                open={!!confirm.type}
                title={`Confirm ${confirm.type}`}
                description={`Are you sure you want to ${confirm.type} this review by ${review.userName ?? "this user"}?`}
                onCancel={() => setConfirm({ type: null })}
                onConfirm={onConfirmAction}
            />
        </>
    );
}

export default ReviewsTableRow;