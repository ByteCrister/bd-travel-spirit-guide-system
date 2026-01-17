"use client";

import React, { JSX, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { useReviewsStore } from "@/store/reviews.store";
import type {
    ReviewDetailDTO,
    ObjectIdStr,
    ApiError,
    ReviewReplyDTO,
} from "@/types/reviews.types";

import { DetailSkeleton } from "./Skeletons";
import { ErrorBanner } from "./primitives/ErrorBanner";
import { isApiError, formatRelativeDate } from "@/utils/helpers/reviews.uiHelpers";
import { useCurrentUserStore } from "@/store/current-user.store";

/**
 * ReviewDetailAccordion
 *
 * Client component that shows full review detail, user/tour metadata and replies.
 * Preserves the same Tailwind design tokens and spacing used earlier while tightening
 * accessibility, keyboard support and Next.js integration (Image / Link).
 */

interface Props {
    reviewId: ObjectIdStr;
    isOpen: boolean;
    onClose: () => void;
    onFocusFirst?: () => void;
}

export default function ReviewDetailAccordion({
    reviewId,
    isOpen,
    onClose,
    onFocusFirst,
}: Props): JSX.Element | null {
    const {
        fetchDetail,
        addReply,
        updateReply,
        deleteReply,
        detailCache
    } = useReviewsStore();

    const { baseUser } = useCurrentUserStore();
    const currentUserId = baseUser?._id;

    const cache = detailCache[reviewId];

    const [loading, setLoading] = useState<boolean>(false);
    const [localError, setLocalError] = useState<ApiError | null>(null);
    const [message, setMessage] = useState<string>("");

    // State for editing replies
    const [editingReplyId, setEditingReplyId] = useState<ObjectIdStr | null>(null);
    const [editMessage, setEditMessage] = useState<string>("");
    const [processingReplyId, setProcessingReplyId] = useState<ObjectIdStr | null>(null);

    const inputRef = useRef<HTMLInputElement | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    // Derived detail (may be null)
    const detail: ReviewDetailDTO | null = cache?.data ?? null;

    const loadDetail = useCallback(
        async (force = false) => {
            setLocalError(null);
            setLoading(true);
            abortRef.current?.abort();
            abortRef.current = new AbortController();
            try {
                await fetchDetail(reviewId, { force });
                setLocalError(null);
                // Reset editing state when loading new details
                setEditingReplyId(null);
                setEditMessage("");
                // focus the first interactive item after load if requested
                onFocusFirst?.();
            } catch (err: unknown) {
                const normalized: ApiError = isApiError(err)
                    ? (err as ApiError)
                    : { message: err instanceof Error ? err.message : "Failed to load details" };
                setLocalError(normalized);
            } finally {
                setLoading(false);
            }
        },
        [fetchDetail, reviewId, onFocusFirst]
    );

    useEffect(() => {
        if (!isOpen) return;
        void loadDetail(false);
        return () => abortRef.current?.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const submitReply = useCallback(async () => {
        const trimmed = message.trim();
        if (!trimmed) return;
        try {
            // Optimistic UX: disable input while submitting
            setLoading(true);
            await addReply(reviewId, trimmed);
            setMessage("");
            toast.success("Reply added");
            // refetch detail to get canonical reply payload (server-generated ids/dates)
            await fetchDetail(reviewId, { force: true });
            // focus input after adding for convenience
            inputRef.current?.focus();
        } catch (err: unknown) {
            const normalized: ApiError = isApiError(err)
                ? (err as ApiError)
                : { message: err instanceof Error ? err.message : "Failed to add reply" };
            toast.error(normalized.message);
        } finally {
            setLoading(false);
        }
    }, [addReply, fetchDetail, message, reviewId]);

    // Handler for starting to edit a reply
    const startEditReply = useCallback((reply: ReviewReplyDTO) => {
        setEditingReplyId(reply._id);
        setEditMessage(reply.message);
        setProcessingReplyId(null);
    }, []);

    // Handler for canceling edit
    const cancelEditReply = useCallback(() => {
        setEditingReplyId(null);
        setEditMessage("");
        setProcessingReplyId(null);
    }, []);

    // Handler for saving edited reply
    const saveEditReply = useCallback(async (replyId: ObjectIdStr) => {
        const trimmed = editMessage.trim();
        if (!trimmed) {
            toast.error("Reply message cannot be empty");
            return;
        }

        try {
            setProcessingReplyId(replyId);
            await updateReply(reviewId, replyId, trimmed);
            toast.success("Reply updated");
            setEditingReplyId(null);
            setEditMessage("");
            // Force refresh the detail to get updated timestamps
            await fetchDetail(reviewId, { force: true });
        } catch (err: unknown) {
            const normalized: ApiError = isApiError(err)
                ? (err as ApiError)
                : { message: err instanceof Error ? err.message : "Failed to update reply" };
            toast.error(normalized.message);
        } finally {
            setProcessingReplyId(null);
        }
    }, [updateReply, reviewId, editMessage, fetchDetail]);

    // Handler for deleting a reply
    const handleDeleteReply = useCallback(async (replyId: ObjectIdStr) => {
        if (!confirm("Are you sure you want to delete this reply? This action cannot be undone.")) {
            return;
        }

        try {
            setProcessingReplyId(replyId);
            await deleteReply(reviewId, replyId);
            toast.success("Reply deleted");
            // Force refresh the detail to reflect deletion
            await fetchDetail(reviewId, { force: true });
        } catch (err: unknown) {
            const normalized: ApiError = isApiError(err)
                ? (err as ApiError)
                : { message: err instanceof Error ? err.message : "Failed to delete reply" };
            toast.error(normalized.message);
        } finally {
            setProcessingReplyId(null);
        }
    }, [deleteReply, reviewId, fetchDetail]);

    // Check if current user can edit/delete a reply
    const canModifyReply = useCallback((reply: ReviewReplyDTO) => {
        // Allow if current user is the owner of the reply OR is an admin
        return currentUserId === reply.employeeId;
    }, [currentUserId]);

    // keyboard: Escape closes the accordion
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (editingReplyId) {
                    cancelEditReply();
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingReplyId]);

    if (!isOpen) return null;

    if (loading && !detail) return <DetailSkeleton />;

    if (localError) {
        return (
            <ErrorBanner
                error={localError}
                onRetry={() => {
                    void loadDetail(true);
                }}
                description="Unable to load review details."
            />
        );
    }

    // safe fallbacks
    const avatarSrc = detail?.userAvatar ?? undefined;
    const tourHero = detail?.tourHeroImage ?? undefined;
    const tourSlug = detail?.tourSlug ?? null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            role="region"
            aria-labelledby={`review-${reviewId}-heading`}
        >
            {/* Header: comment + meta */}
            <div className="border-b border-gray-100 bg-gradient-to-br from-slate-50 to-gray-50 p-6">
                <div className="mb-2 flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-blue-500" />
                    <h4 id={`review-${reviewId}-heading`} className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                        Full Comment
                    </h4>
                </div>

                <p className="text-base leading-relaxed text-gray-800 whitespace-pre-wrap">{detail?.comment ?? "-"}</p>

                {/* Add Images Section Here */}
                {detail?.imageUrls && detail.imageUrls.length > 0 && (
                    <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <h5 className="text-sm font-medium text-gray-700">Attached Images</h5>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {detail.imageUrls.map((url, index) => (
                                <a
                                    key={index}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors border border-blue-100"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Image {index + 1}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                        <strong className="text-gray-800 font-medium">{detail?.rating ?? "-"}</strong>
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700">rating</span>
                    </span>

                    <span>•</span>

                    <span className="text-gray-500">Posted {detail?.createdAt ? formatRelativeDate(detail.createdAt) : "-"}</span>
                </div>
            </div>

            {/* Grid: user / tour */}
            <div className="grid grid-cols-1 gap-px bg-gray-200 md:grid-cols-2">
                {/* User card */}
                <div className="bg-white p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        {avatarSrc ? (
                            <div className="relative h-12 w-12 rounded-full overflow-hidden bg-slate-100">
                                <Image src={avatarSrc} alt={detail?.userName ?? "User avatar"} fill sizes="48px" className="object-cover" />
                            </div>
                        ) : (
                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        )}

                        <div>
                            <div className="text-sm font-semibold text-gray-900">{detail?.userName ?? detail?.userId}</div>
                            <div className="text-xs text-gray-500">{detail?.userEmail ?? "—"}</div>
                        </div>
                    </div>
                </div>

                {/* Tour card */}
                <div className="bg-white p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="relative h-12 w-20 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                            {tourHero ? (
                                <Image src={tourHero} alt={detail?.tourTitle ?? "tour hero"} fill sizes="80px" className="object-cover" />
                            ) : (
                                <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-300 text-xs">No image</div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900">{detail?.tourTitle ?? "—"}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                                {tourSlug ? (
                                    <Link href={`/tours/${tourSlug}`} className="text-xs text-emerald-600 underline">
                                        View tour
                                    </Link>
                                ) : (
                                    <span className="text-xs text-gray-400">No slug</span>
                                )}
                                <span>•</span>
                                <span className="text-xs text-gray-500">Tour id {detail?.tourId}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <div className="text-xs text-gray-500">Trip type</div>
                            <div className="text-sm text-gray-800">{detail?.tripType ?? "—"}</div>
                        </div>

                        <div>
                            <div className="text-xs text-gray-500">Travel date</div>
                            <div className="text-sm text-gray-800">{detail?.travelDate ? new Date(detail.travelDate).toLocaleDateString() : "—"}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Replies */}
            <div className="border-t border-gray-100 p-6">
                <div className="mb-4 flex items-center gap-2">
                    <svg className="h-5 w-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>

                    <h5 className="font-semibold text-gray-900">Replies</h5>

                    {detail?.replies && detail.replies.length > 0 && (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                            {detail.replies.length}
                        </span>
                    )}
                </div>

                {detail?.replies && detail.replies.length > 0 ? (
                    <ul className="mb-4 space-y-3">
                        {detail.replies.map((reply) => (
                            <li key={reply._id} className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:border-gray-300 hover:shadow-sm">
                                {editingReplyId === reply._id ? (
                                    // Edit mode
                                    <div className="space-y-3">
                                        <textarea
                                            value={editMessage}
                                            onChange={(e) => setEditMessage(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            rows={3}
                                            placeholder="Edit your reply..."
                                            disabled={processingReplyId === reply._id}
                                        />
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span className="font-medium text-gray-700">{reply.employeeId}</span>
                                                <span>•</span>
                                                <span>{reply.createdAt ? formatRelativeDate(reply.createdAt) : reply.createdAt}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => cancelEditReply()}
                                                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
                                                    disabled={processingReplyId === reply._id}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => saveEditReply(reply._id)}
                                                    disabled={!editMessage.trim() || processingReplyId === reply._id}
                                                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {processingReplyId === reply._id ? "Saving..." : "Save"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // View mode
                                    <>
                                        <div className="mb-2 text-sm leading-relaxed text-gray-800">{reply.message}</div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span className="font-medium text-gray-700">{reply.employeeId}</span>
                                                <span>•</span>
                                                <span>{reply.createdAt ? formatRelativeDate(reply.createdAt) : reply.createdAt}</span>
                                                {reply.updatedAt !== reply.createdAt && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-gray-400" title={`Edited ${formatRelativeDate(reply.updatedAt)}`}>
                                                            (edited)
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            {canModifyReply(reply) && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => startEditReply(reply)}
                                                        className="px-2 py-1 text-xs text-gray-600 hover:text-blue-600 disabled:opacity-50"
                                                        disabled={processingReplyId !== null}
                                                        title="Edit reply"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteReply(reply._id)}
                                                        className="px-2 py-1 text-xs text-gray-600 hover:text-red-600 disabled:opacity-50"
                                                        disabled={processingReplyId !== null}
                                                        title="Delete reply"
                                                    >
                                                        {processingReplyId === reply._id ? "Deleting..." : "Delete"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="mb-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                        <svg className="mx-auto mb-2 h-8 w-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>

                        <p className="text-sm text-gray-500">No replies yet. Be the first to respond!</p>
                    </div>
                )}

                {/* Reply input */}
                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <label htmlFor={`reply-${reviewId}`} className="mb-1.5 block text-xs font-medium text-gray-700">
                            Add a reply
                        </label>

                        <input
                            id={`reply-${reviewId}`}
                            ref={inputRef}
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    void submitReply();
                                }
                            }}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-all placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Type your reply..."
                            aria-label="Reply message"
                            disabled={loading || editingReplyId !== null}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => void submitReply()}
                            disabled={!message.trim() || loading || editingReplyId !== null}
                            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Send
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setMessage("");
                                if (editingReplyId) {
                                    cancelEditReply();
                                }
                                onClose();
                            }}
                            className="rounded-lg bg-white border border-gray-200 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}