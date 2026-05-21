"use client";

import { JSX, useEffect, useMemo, useRef, useState } from "react";
import { useReviewsStore } from "@/store/reviews.store";
import ReviewsToolbar from "./ReviewsToolbar";
import ReviewsTable from "./ReviewsTable";
import ReviewsPagination from "./ReviewsPagination";
import { ErrorBanner } from "./primitives/ErrorBanner";
import { TableSkeleton } from "./Skeletons";
import { clampPages, isApiError } from "@/utils/helpers/reviews.uiHelpers";
import type { ApiError, ReviewToolbarState } from "@/types/tour/reviews.types";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";

export default function ReviewsAdminShell(): JSX.Element {
    const {
        toolbar,
        listCache,
        currentListKey,
        fetchList,
        persistToLocalStorage,
        globalError,
    } = useReviewsStore();

    const [draft, setDraft] = useState<ReviewToolbarState>(toolbar);
    const [loading, setLoading] = useState<boolean>(false);
    const [mounted, setMounted] = useState<boolean>(false);
    const announceRef = useRef<HTMLDivElement | null>(null);
    const firstRowRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const activeEntry = useMemo(
        () => (currentListKey ? listCache[currentListKey] : null),
        [currentListKey, listCache]
    );
    const page = draft.page;
    const limit = draft.limit;
    const pages = useMemo(() => clampPages(activeEntry?.data?.pages ?? 1), [activeEntry]);

    useEffect(() => {
        setMounted(true);
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        setLoading(true);
        fetchList({ useCache: true })
            .catch((err) => toast.error(err?.message ?? "Failed to load reviews"))
            .finally(() => setLoading(false));

        return () => {
            setMounted(false);
            abortRef.current?.abort();
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearchChange = (next: Partial<ReviewToolbarState>) => {
        setDraft((d) => ({ ...d, ...next }));
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {}, 300);
    };

    const handleApplyFilters = async () => {
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        setLoading(true);
        try {
            useReviewsStore.getState().setToolbar({ ...draft, page: draft.page ?? 1, limit: draft.limit ?? 10 });
            await fetchList({ useCache: false });
            persistToLocalStorage();
            if (announceRef.current) announceRef.current.textContent = "Filters applied.";
            firstRowRef.current?.focus();
        } catch (err: unknown) {
            const normalized: ApiError = isApiError(err)
                ? err
                : { message: err instanceof Error ? err.message : "Failed to apply filters" };
            toast.error(normalized?.message ?? "Failed to apply filters");
        } finally {
            setLoading(false);
        }
    };

    const handleResetFilters = () => {
        const reset: ReviewToolbarState = {
            search: "",
            selectedRatings: [],
            filters: {},
            sort: { field: "createdAt", dir: "desc" },
            page: 1,
            limit: 10,
            searchField: "comment",
        };
        setDraft(reset);
        useReviewsStore.getState().setToolbar(reset);
    };

    const handleChangePage = async (nextPage: number) => {
        const clamped = clampPages(Math.max(1, nextPage));
        setDraft((d) => ({ ...d, page: clamped }));
        useReviewsStore.getState().setToolbar({ page: clamped });
        setLoading(true);
        try {
            await fetchList({ useCache: true });
            persistToLocalStorage();
        } catch (err: unknown) {
            const normalized: ApiError = isApiError(err)
                ? err
                : { message: err instanceof Error ? err.message : "Failed to change page" };
            toast.error(normalized?.message ?? "Failed to change page");
        } finally {
            setLoading(false);
        }
    };

    const handleChangeLimit = async (nextLimit: number) => {
        setDraft((d) => ({ ...d, limit: nextLimit, page: 1 }));
        useReviewsStore.getState().setToolbar({ limit: nextLimit, page: 1 });
        setLoading(true);
        try {
            await fetchList({ useCache: true });
            persistToLocalStorage();
        } catch (err: unknown) {
            const normalized: ApiError = isApiError(err)
                ? err
                : { message: err instanceof Error ? err.message : "Failed to change page size" };
            toast.error(normalized?.message ?? "Failed to change page size");
        } finally {
            setLoading(false);
        }
    };

    const retryLast = async () => {
        setLoading(true);
        try {
            await fetchList({ useCache: false });
            toast.info("Retried last action");
        } catch (err: unknown) {
            const normalized: ApiError = isApiError(err)
                ? err
                : { message: err instanceof Error ? err.message : "Retry failed" };
            toast.error(normalized?.message ?? "Retry failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main
            className="min-h-screen"
            style={{ background: "#E7E5E4", fontFamily: "var(--font-space-mono), monospace" }}
            aria-label="Reviews management"
        >
            {/* Breadcrumbs */}
            <Breadcrumbs
                items={[
                    { label: 'Home', href: '/' },
                    { label: 'Reviews', href: '/operations/reviews' },
                ]}
                className="mb-4"
            />

            <div className="mx-auto max-w-[1600px] p-2 sm:p-3 lg:p-5">
                <section
                    className="space-y-5"
                    data-testid="reviews-admin-shell"
                    aria-busy={loading}
                    aria-live="polite"
                >
                    {/* ── Header ── */}
                    <header
                        className="rounded-2xl px-6 py-5"
                        style={{
                            background: "#E7E5E4",
                            boxShadow: "6px 6px 14px #c9c7c6, -6px -6px 14px #ffffff",
                        }}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h1
                                    className="text-2xl font-bold tracking-tight sm:text-3xl"
                                    style={{ color: "#1E2938", fontFamily: "var(--font-space-mono), monospace" }}
                                >
                                    Reviews Administration
                                </h1>
                                <p
                                    className="text-xs leading-relaxed"
                                    style={{ color: "#4a5568", fontFamily: "var(--font-jetbrains-mono), monospace" }}
                                >
                                    Moderate · Filter · Analyze user reviews in real-time
                                </p>
                            </div>

                            {mounted && activeEntry?.data && (
                                <div
                                    className="hidden lg:flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold"
                                    style={{
                                        background: "#E7E5E4",
                                        boxShadow: "inset 3px 3px 7px #c9c7c6, inset -3px -3px 7px #ffffff",
                                        color: "#006666",
                                        fontFamily: "var(--font-space-mono), monospace",
                                    }}
                                >
                                    <span
                                        className="h-2 w-2 rounded-full animate-pulse"
                                        style={{ background: "#006666" }}
                                    />
                                    {activeEntry.data.total.toLocaleString()} reviews
                                </div>
                            )}
                        </div>
                    </header>

                    {/* Accessibility live region */}
                    <div ref={announceRef} className="sr-only" aria-live="polite" />

                    {/* ── Toolbar ── */}
                    <div
                        className="rounded-2xl"
                        style={{
                            background: "#E7E5E4",
                            boxShadow: "6px 6px 14px #c9c7c6, -6px -6px 14px #ffffff",
                        }}
                    >
                        <ReviewsToolbar
                            toolbar={draft}
                            onSearchChange={handleSearchChange}
                            onApplyFilters={handleApplyFilters}
                            onResetFilters={handleResetFilters}
                        />
                    </div>

                    {/* ── Error ── */}
                    {globalError && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <ErrorBanner
                                error={globalError}
                                onRetry={retryLast}
                                description="Something went wrong while loading reviews. Please retry."
                            />
                        </div>
                    )}

                    {/* ── Table ── */}
                    <div
                        className="rounded-2xl overflow-hidden"
                        style={{
                            background: "#E7E5E4",
                            boxShadow: "6px 6px 14px #c9c7c6, -6px -6px 14px #ffffff",
                        }}
                    >
                        {!activeEntry && loading ? (
                            <div className="p-6">
                                <TableSkeleton rows={limit} />
                            </div>
                        ) : (
                            <ReviewsTable
                                entry={activeEntry ?? null}
                                page={page}
                                limit={limit}
                                onFirstRowRef={(el) => { firstRowRef.current = el; }}
                            />
                        )}
                    </div>

                    {/* ── Pagination ── */}
                    <div
                        className="rounded-2xl"
                        style={{
                            background: "#E7E5E4",
                            boxShadow: "6px 6px 14px #c9c7c6, -6px -6px 14px #ffffff",
                        }}
                    >
                        <ReviewsPagination
                            page={page}
                            pages={pages}
                            limit={limit}
                            onChangePage={handleChangePage}
                            onChangeLimit={handleChangeLimit}
                        />
                    </div>
                </section>
            </div>
        </main>
    );
}