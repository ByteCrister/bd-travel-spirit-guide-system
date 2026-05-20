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
} from "@/types/tour/reviews.types";

import { DetailSkeleton } from "./Skeletons";
import { ErrorBanner } from "./primitives/ErrorBanner";
import { isApiError, formatRelativeDate } from "@/utils/helpers/reviews.uiHelpers";
import { useCurrentUserStore } from "@/store/current-user.store";

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
    const { fetchDetail, addReply, updateReply, deleteReply, detailCache } = useReviewsStore();
    const { baseUser } = useCurrentUserStore();
    const currentUserId = baseUser?._id;
    const cache = detailCache[reviewId];

    const [loading, setLoading] = useState<boolean>(false);
    const [localError, setLocalError] = useState<ApiError | null>(null);
    const [message, setMessage] = useState<string>("");
    const [editingReplyId, setEditingReplyId] = useState<ObjectIdStr | null>(null);
    const [editMessage, setEditMessage] = useState<string>("");
    const [processingReplyId, setProcessingReplyId] = useState<ObjectIdStr | null>(null);

    const inputRef = useRef<HTMLInputElement | null>(null);
    const abortRef = useRef<AbortController | null>(null);

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
                setEditingReplyId(null);
                setEditMessage("");
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
            setLoading(true);
            await addReply(reviewId, trimmed);
            setMessage("");
            toast.success("Reply added");
            await fetchDetail(reviewId, { force: true });
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

    const startEditReply = useCallback((reply: ReviewReplyDTO) => {
        setEditingReplyId(reply._id);
        setEditMessage(reply.message);
        setProcessingReplyId(null);
    }, []);

    const cancelEditReply = useCallback(() => {
        setEditingReplyId(null);
        setEditMessage("");
        setProcessingReplyId(null);
    }, []);

    const saveEditReply = useCallback(async (replyId: ObjectIdStr) => {
        const trimmed = editMessage.trim();
        if (!trimmed) { toast.error("Reply message cannot be empty"); return; }
        try {
            setProcessingReplyId(replyId);
            await updateReply(reviewId, replyId, trimmed);
            toast.success("Reply updated");
            setEditingReplyId(null);
            setEditMessage("");
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

    const handleDeleteReply = useCallback(async (replyId: ObjectIdStr) => {
        if (!confirm("Are you sure you want to delete this reply?")) return;
        try {
            setProcessingReplyId(replyId);
            await deleteReply(reviewId, replyId);
            toast.success("Reply deleted");
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

    const canModifyReply = useCallback(
        (reply: ReviewReplyDTO) => currentUserId === reply.employeeId,
        [currentUserId]
    );

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                editingReplyId ? cancelEditReply() : onClose();
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
                onRetry={() => void loadDetail(true)}
                description="Unable to load review details."
            />
        );
    }

    const avatarSrc = detail?.userAvatar ?? undefined;
    const tourHero  = detail?.tourHeroImage ?? undefined;
    const tourSlug  = detail?.tourSlug ?? null;

    /** Section heading */
    const SectionLabel = ({ children }: { children: React.ReactNode }) => (
        <div className="flex items-center gap-2 mb-3">
            <div className="h-1 w-4 rounded-full" style={{ background: PRIMARY }} />
            <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: MUTED, fontFamily: BRAND }}
            >
                {children}
            </span>
        </div>
    );

    /** Neumorphic card */
    const NeuCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
        <div
            className={`rounded-2xl p-5 ${className}`}
            style={{ background: S, boxShadow: SHADOW_OUT }}
        >
            {children}
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
            role="region"
            aria-labelledby={`review-${reviewId}-heading`}
        >
            {/* ── Full comment ── */}
            <NeuCard>
                <SectionLabel>Full Comment</SectionLabel>
                <p
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: TEXT, fontFamily: MONO }}
                    id={`review-${reviewId}-heading`}
                >
                    {detail?.comment ?? "—"}
                </p>

                {/* Images */}
                {detail?.imageUrls && detail.imageUrls.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <SectionLabel>Attached Images</SectionLabel>
                        <div className="flex flex-wrap gap-2">
                            {detail.imageUrls.map((url, index) => (
                                <a
                                    key={index}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                                    style={{
                                        background: S,
                                        boxShadow: SHADOW_OUT,
                                        color: PRIMARY,
                                        fontFamily: MONO,
                                    }}
                                >
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Image {index + 1}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                <div
                    className="mt-4 flex items-center gap-3 text-xs"
                    style={{ color: MUTED, fontFamily: MONO }}
                >
                    <span className="flex items-center gap-1.5">
                        <strong style={{ color: TEXT, fontFamily: BRAND }}>{detail?.rating ?? "—"}</strong>
                        <span
                            className="px-2 py-0.5 rounded-lg font-medium"
                            style={{ background: "#fffbeb", color: "#b45309" }}
                        >
                            rating
                        </span>
                    </span>
                    <span>·</span>
                    <span>Posted {detail?.createdAt ? formatRelativeDate(detail.createdAt) : "—"}</span>
                </div>
            </NeuCard>

            {/* ── User / Tour cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User */}
                <NeuCard>
                    <SectionLabel>Reviewer</SectionLabel>
                    <div className="flex items-center gap-3">
                        <div
                            className="relative h-12 w-12 rounded-xl overflow-hidden flex-shrink-0"
                            style={{ background: S, boxShadow: SHADOW_IN }}
                        >
                            {avatarSrc ? (
                                <Image
                                    src={avatarSrc}
                                    alt={detail?.userName ?? "User avatar"}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: MUTED }}>
                                        <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div>
                            <div
                                className="text-sm font-bold"
                                style={{ color: TEXT, fontFamily: BRAND }}
                            >
                                {detail?.userName ?? detail?.userId}
                            </div>
                            <div
                                className="text-xs mt-0.5"
                                style={{ color: MUTED, fontFamily: MONO }}
                            >
                                {detail?.userEmail ?? "—"}
                            </div>
                        </div>
                    </div>
                </NeuCard>

                {/* Tour */}
                <NeuCard>
                    <SectionLabel>Tour</SectionLabel>
                    <div className="flex items-center gap-3">
                        <div
                            className="relative h-12 w-20 rounded-xl overflow-hidden flex-shrink-0"
                            style={{ background: S, boxShadow: SHADOW_IN }}
                        >
                            {tourHero ? (
                                <Image src={tourHero} alt={detail?.tourTitle ?? "tour"} fill sizes="80px" className="object-cover" />
                            ) : (
                                <div
                                    className="h-full w-full flex items-center justify-center text-xs"
                                    style={{ color: MUTED, fontFamily: MONO }}
                                >
                                    No img
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div
                                className="text-sm font-bold truncate"
                                style={{ color: TEXT, fontFamily: BRAND }}
                            >
                                {detail?.tourTitle ?? "—"}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs" style={{ fontFamily: MONO }}>
                                {tourSlug ? (
                                    <Link
                                        href={`/tours/${tourSlug}`}
                                        className="underline font-medium"
                                        style={{ color: PRIMARY }}
                                    >
                                        View tour
                                    </Link>
                                ) : (
                                    <span style={{ color: MUTED }}>No slug</span>
                                )}
                                <span style={{ color: MUTED }}>· {detail?.tourId}</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4 text-xs" style={{ fontFamily: MONO }}>
                        <div>
                            <div className="mb-0.5 font-medium" style={{ color: MUTED }}>Trip type</div>
                            <div style={{ color: TEXT }}>{detail?.tripType ?? "—"}</div>
                        </div>
                        <div>
                            <div className="mb-0.5 font-medium" style={{ color: MUTED }}>Travel date</div>
                            <div style={{ color: TEXT }}>
                                {detail?.travelDate
                                    ? new Date(detail.travelDate).toLocaleDateString()
                                    : "—"}
                            </div>
                        </div>
                    </div>
                </NeuCard>
            </div>

            {/* ── Replies ── */}
            <NeuCard>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-4 rounded-full" style={{ background: "#7c3aed" }} />
                        <span
                            className="text-xs font-bold uppercase tracking-widest"
                            style={{ color: MUTED, fontFamily: BRAND }}
                        >
                            Replies
                        </span>
                    </div>
                    {detail?.replies && detail.replies.length > 0 && (
                        <span
                            className="px-2 py-0.5 rounded-xl text-xs font-bold"
                            style={{ background: S, boxShadow: SHADOW_IN, color: "#7c3aed", fontFamily: BRAND }}
                        >
                            {detail.replies.length}
                        </span>
                    )}
                </div>

                {detail?.replies && detail.replies.length > 0 ? (
                    <ul className="mb-4 space-y-3">
                        {detail.replies.map((reply) => (
                            <li
                                key={reply._id}
                                className="rounded-2xl p-4 transition-all"
                                style={{
                                    background: S,
                                    boxShadow: editingReplyId === reply._id ? SHADOW_IN : "3px 3px 8px #c9c7c6, -3px -3px 8px #ffffff",
                                }}
                            >
                                {editingReplyId === reply._id ? (
                                    <div className="space-y-3">
                                        <textarea
                                            value={editMessage}
                                            onChange={(e) => setEditMessage(e.target.value)}
                                            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none transition-all"
                                            style={{
                                                background: S,
                                                boxShadow: SHADOW_IN,
                                                color: TEXT,
                                                fontFamily: MONO,
                                                border: "none",
                                                caretColor: PRIMARY,
                                            }}
                                            rows={3}
                                            placeholder="Edit your reply…"
                                            disabled={processingReplyId === reply._id}
                                        />
                                        <div className="flex items-center justify-between">
                                            <span
                                                className="text-xs"
                                                style={{ color: MUTED, fontFamily: MONO }}
                                            >
                                                {reply.employeeId} · {reply.createdAt ? formatRelativeDate(reply.createdAt) : ""}
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={cancelEditReply}
                                                    className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                                                    style={{ background: S, boxShadow: SHADOW_OUT, color: MUTED, fontFamily: MONO, border: "none" }}
                                                    disabled={processingReplyId === reply._id}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => saveEditReply(reply._id)}
                                                    disabled={!editMessage.trim() || processingReplyId === reply._id}
                                                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                                                    style={{
                                                        background: PRIMARY,
                                                        boxShadow: "3px 3px 8px #004d4d, -1px -1px 4px #008080",
                                                        color: "#fff",
                                                        fontFamily: BRAND,
                                                        border: "none",
                                                    }}
                                                >
                                                    {processingReplyId === reply._id ? "Saving…" : "Save"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div
                                            className="text-xs leading-relaxed mb-2"
                                            style={{ color: TEXT, fontFamily: MONO }}
                                        >
                                            {reply.message}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-xs" style={{ color: MUTED, fontFamily: MONO }}>
                                                <span className="font-medium" style={{ color: TEXT }}>{reply.employeeId}</span>
                                                <span>·</span>
                                                <span>{reply.createdAt ? formatRelativeDate(reply.createdAt) : ""}</span>
                                                {reply.updatedAt !== reply.createdAt && (
                                                    <>
                                                        <span>·</span>
                                                        <span
                                                            className="italic"
                                                            title={`Edited ${formatRelativeDate(reply.updatedAt)}`}
                                                        >
                                                            (edited)
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            {canModifyReply(reply) && (
                                                <div className="flex gap-1.5">
                                                    <button
                                                        onClick={() => startEditReply(reply)}
                                                        className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                                                        style={{ background: S, boxShadow: SHADOW_OUT, color: PRIMARY, fontFamily: MONO, border: "none" }}
                                                        disabled={processingReplyId !== null}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteReply(reply._id)}
                                                        className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
                                                        style={{ background: S, boxShadow: SHADOW_OUT, color: "#b91c1c", fontFamily: MONO, border: "none" }}
                                                        disabled={processingReplyId !== null}
                                                    >
                                                        {processingReplyId === reply._id ? "Deleting…" : "Delete"}
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
                    <div
                        className="mb-4 rounded-2xl p-6 text-center"
                        style={{ background: S, boxShadow: SHADOW_IN }}
                    >
                        <svg
                            className="mx-auto mb-2 h-8 w-8"
                            style={{ color: MUTED }}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                        >
                            <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-xs" style={{ color: MUTED, fontFamily: MONO }}>
                            No replies yet. Be the first to respond!
                        </p>
                    </div>
                )}

                {/* Reply input */}
                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <label
                            htmlFor={`reply-${reviewId}`}
                            className="mb-1.5 block text-xs font-medium"
                            style={{ color: MUTED, fontFamily: MONO }}
                        >
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
                            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder:opacity-40"
                            style={{
                                background: S,
                                boxShadow: SHADOW_IN,
                                color: TEXT,
                                fontFamily: MONO,
                                border: "none",
                                caretColor: PRIMARY,
                            }}
                            placeholder="Type your reply…"
                            aria-label="Reply message"
                            disabled={loading || editingReplyId !== null}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => void submitReply()}
                            disabled={!message.trim() || loading || editingReplyId !== null}
                            className="rounded-xl px-5 py-2.5 text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                background: PRIMARY,
                                boxShadow: "3px 3px 8px #004d4d, -1px -1px 4px #008080",
                                color: "#fff",
                                fontFamily: BRAND,
                                border: "none",
                            }}
                        >
                            Send
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMessage("");
                                if (editingReplyId) cancelEditReply();
                                onClose();
                            }}
                            className="rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
                            style={{
                                background: S,
                                boxShadow: SHADOW_OUT,
                                color: TEXT,
                                fontFamily: MONO,
                                border: "none",
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </NeuCard>
        </motion.div>
    );
}