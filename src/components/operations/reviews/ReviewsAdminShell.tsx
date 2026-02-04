"use client";

import { JSX, useEffect, useMemo, useRef, useState } from "react";
import { useReviewsStore } from "@/store/reviews.store";
import ReviewsToolbar from "./ReviewsToolbar";
import ReviewsTable from "./ReviewsTable";
import ReviewsPagination from "./ReviewsPagination";
import { ErrorBanner } from "./primitives/ErrorBanner";
import { TableSkeleton } from "./Skeletons";
import { clampPages, isApiError } from "@/utils/helpers/reviews.uiHelpers";
import type { ApiError, ReviewToolbarState } from "@/types/reviews.types";
import { toast } from "sonner";

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

    // Initial mount fetch with cache and abort support
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

    // Debounced search change
    const handleSearchChange = (next: Partial<ReviewToolbarState>) => {
        setDraft((d) => ({ ...d, ...next }));
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            // no auto-apply; draft only
        }, 300);
    };

    // Apply filters
    const handleApplyFilters = async () => {
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        setLoading(true);

        try {
            // first sync the entire draft into the store toolbar so fetchList uses the updated key
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
        // update local draft for UI immediately
        setDraft((d) => ({ ...d, page: clamped }));
        // sync to store toolbar so fetchList builds correct cache key
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
        // local draft
        setDraft((d) => ({ ...d, limit: nextLimit, page: 1 }));
        // sync to store toolbar (reset page to 1)
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
            className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50"
            aria-label="Reviews management"
        >
            <div className="mx-auto max-w-[1600px]">
                <section
                    className="space-y-6 font-sans"
                    data-testid="reviews-admin-shell"
                    aria-busy={loading}
                    aria-live="polite"
                >
                    {/* Modern header with subtle gradient and improved typography */}
                    <header className="space-y-3 border-b border-slate-200/60 pb-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1.5">
                                <h1 className="font-brand text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                    Reviews Administration
                                </h1>
                                <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                                    Efficiently manage, moderate, and analyze user reviews with advanced filtering, bulk operations, and real-time updates.
                                </p>
                            </div>

                            {/* Optional status indicator */}
                            {mounted && activeEntry?.data && (
                                <div className="hidden lg:flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 ring-1 ring-emerald-600/10">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    {activeEntry.data.total.toLocaleString()} reviews
                                </div>
                            )}
                        </div>
                    </header>

                    {/* Accessibility announcements */}
                    <div ref={announceRef} className="sr-only" aria-live="polite" />

                    {/* Toolbar with glass morphism effect */}
                    <div className="rounded-xl border border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
                        <ReviewsToolbar
                            toolbar={draft}
                            onSearchChange={handleSearchChange}
                            onApplyFilters={handleApplyFilters}
                            onResetFilters={handleResetFilters}
                        />
                    </div>

                    {/* Error state with modern styling */}
                    {globalError && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <ErrorBanner
                                error={globalError}
                                onRetry={retryLast}
                                description="Something went wrong while loading reviews. Please retry."
                            />
                        </div>
                    )}

                    {/* Main content area with elevated card */}
                    <div className="rounded-xl border border-slate-200/60 bg-white shadow-sm transition-all hover:shadow-md">
                        {!activeEntry && loading ? (
                            <div className="p-6">
                                <TableSkeleton rows={limit} />
                            </div>
                        ) : (
                            <div className="overflow-hidden">
                                <ReviewsTable
                                    entry={activeEntry ?? null}
                                    page={page}
                                    limit={limit}
                                    onFirstRowRef={(el) => {
                                        firstRowRef.current = el;
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Pagination with enhanced spacing */}
                    <div className="rounded-xl border border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-sm">
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