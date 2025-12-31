import React from "react";

type Props = {
    rows?: number;
    limit?: number;
};

export function ReviewsAdminShellSkeleton({ rows = 8, limit = 8 }: Props) {
    return (
        <main
            className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50"
            aria-label="Reviews management"
        >
            <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
                <section
                    className="space-y-6 font-sans"
                    data-testid="reviews-admin-shell"
                    aria-busy="true"
                    aria-live="polite"
                >
                    {/* Header skeleton */}
                    <header className="space-y-3 border-b border-slate-200/60 pb-6">
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-2 flex-1 min-w-0">
                                <div className="h-9 w-52 rounded-md bg-slate-200 animate-pulse" />
                                <div className="h-4 w-3/4 rounded-md bg-slate-200 animate-pulse" />
                            </div>

                            <div className="hidden lg:flex items-center gap-2">
                                <div className="h-6 w-24 rounded-full bg-slate-100 animate-pulse" />
                            </div>
                        </div>
                    </header>

                    {/* Screen reader live region placeholder */}
                    <div className="sr-only" aria-live="polite" />

                    {/* Toolbar skeleton (glass) */}
                    <div className="rounded-xl border border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-sm transition-all hover:shadow-md p-4">
                        <ToolbarSkeleton />
                    </div>

                    {/* Error placeholder (hidden in skeleton mode) */}
                    {/* Main content elevated card */}
                    <div className="rounded-xl border border-slate-200/60 bg-white shadow-sm transition-all hover:shadow-md">
                        <div className="p-6">
                            <TableSkeleton rows={rows} limit={limit} />
                        </div>
                    </div>

                    {/* Pagination skeleton */}
                    <div className="rounded-xl border border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-sm p-4">
                        <PaginationSkeleton />
                    </div>
                </section>
            </div>
        </main>
    );
}

/* -------------------------
   Toolbar skeleton
   ------------------------- */

export function ToolbarSkeleton() {
    return (
        <div role="region" aria-label="Reviews filters" className="w-full">
            <div className="space-y-4">
                {/* Top row: search + actions */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="flex-1 min-w-0">
                        <div className="relative">
                            <div className="h-10 w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-100 animate-pulse" />
                            <div className="flex items-center gap-2 mt-2">
                                <div className="h-7 w-20 rounded-md bg-slate-100 animate-pulse" />
                                <div className="h-7 w-20 rounded-md bg-slate-100 animate-pulse" />
                                <div className="h-7 w-14 rounded-md bg-slate-100 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="h-10 w-36 rounded-md bg-slate-200 animate-pulse" />
                        <div className="h-10 w-28 rounded-md bg-slate-100 animate-pulse" />
                    </div>
                </div>

                {/* Second row: sort / toggles / bulk */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="h-9 w-44 rounded-md bg-slate-100 animate-pulse" />
                        <div className="h-9 w-9 rounded-md bg-slate-100 animate-pulse" />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="h-9 w-28 rounded-md bg-slate-100 animate-pulse" />
                        <div className="h-9 w-36 rounded-md bg-slate-100 animate-pulse" />
                    </div>

                    <div className="ml-auto">
                        <div className="h-9 w-48 rounded-md bg-slate-100 animate-pulse" />
                    </div>
                </div>

                {/* Advanced filters area skeleton (collapsed look) */}
                <div className="border-t border-slate-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
                                <div className="h-10 w-full rounded bg-white border border-slate-200 shadow-sm animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* -------------------------
   Table skeleton
   ------------------------- */

export function TableSkeleton({ rows = 8, limit = 8 }: Props) {
    const rowCount = Math.max(rows, limit);
    return (
        <section data-testid="table-skeleton" aria-hidden="true">
            {/* Stats bar placeholder */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4 text-xs">
                        <div className="h-6 w-24 rounded-md bg-white shadow-sm animate-pulse" />
                        <div className="h-6 w-24 rounded-md bg-white shadow-sm animate-pulse" />
                        <div className="h-6 w-24 rounded-md bg-white shadow-sm animate-pulse" />
                        <div className="h-6 w-24 rounded-md bg-white shadow-sm animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Table header skeleton (sticky) */}
            <div className="sticky top-0 z-20 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <div className="grid grid-cols-[40px_60px_1fr_200px_140px_100px_120px_50px] gap-4 px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <div className="h-4 w-4 rounded bg-slate-200 animate-pulse" />
                    <div className="h-4 w-10 rounded bg-slate-200 animate-pulse" />
                    <div className="h-4 w-40 rounded bg-slate-200 animate-pulse" />
                    <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
                    <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
                    <div className="h-4 w-20 rounded bg-slate-200 animate-pulse" />
                    <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
                    <div className="h-4 w-8 rounded bg-slate-200 animate-pulse" />
                </div>
            </div>

            {/* Table rows skeleton */}
            <div role="rowgroup" className="divide-y divide-slate-100">
                {Array.from({ length: rowCount }).map((_, idx) => (
                    <div
                        key={idx}
                        className="px-4 py-4 animate-pulse"
                        style={{ minHeight: 72 }}
                    >
                        <div className="grid grid-cols-[40px_60px_1fr_200px_140px_100px_120px_50px] gap-4">
                            <div className="h-4 w-4 rounded bg-slate-200" />
                            <div className="h-8 w-12 rounded bg-slate-200" />
                            <div className="space-y-2">
                                <div className="h-4 w-3/4 rounded bg-slate-200" />
                                <div className="h-3 w-full rounded bg-slate-200" />
                                <div className="h-3 w-32 rounded bg-slate-200 mt-2" />
                            </div>
                            <div className="h-4 rounded bg-slate-200" />
                            <div className="h-4 rounded bg-slate-200" />
                            <div className="h-4 rounded bg-slate-200" />
                            <div className="h-4 rounded bg-slate-200" />
                            <div className="h-8 w-8 rounded bg-slate-200" />
                        </div>

                        {/* Accordion detail placeholder for some rows on larger screens */}
                        <div className="mt-3 border-t border-slate-100 pt-3">
                            <div className="h-3 w-3/5 rounded bg-slate-100" />
                            <div className="h-3 w-2/5 rounded bg-slate-100 mt-2" />
                        </div>
                    </div>
                ))}

                {/* Empty state placeholder not shown in skeleton mode */}
            </div>

            {/* Footer summary placeholder */}
            <div className="sticky bottom-0 z-10 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200">
                <div className="flex items-center justify-between px-4 py-2.5 text-xs">
                    <div className="flex items-center gap-4">
                        <div className="h-4 w-56 rounded bg-slate-200 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-4 text-slate-600">
                        <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
                        <div className="h-6 w-28 rounded bg-slate-100 animate-pulse" />
                    </div>
                </div>
            </div>
        </section>
    );
}

/* -------------------------
   Pagination skeleton
   ------------------------- */

export function PaginationSkeleton() {
    return (
        <nav
            className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
            aria-label="Pagination skeleton"
        >
            <div className="text-sm text-gray-600 order-2 sm:order-1">
                <div className="h-4 w-48 rounded bg-slate-200 animate-pulse" />
            </div>

            <div className="flex items-center gap-1 order-1 sm:order-2">
                <div className="h-10 w-10 rounded-md bg-slate-100 animate-pulse" />
                <div className="h-10 w-10 rounded-md bg-slate-100 animate-pulse" />
                <div className="flex items-center gap-1 mx-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-10 w-10 rounded-md bg-slate-100 animate-pulse" />
                    ))}
                </div>
                <div className="h-10 w-10 rounded-md bg-slate-100 animate-pulse" />
                <div className="h-10 w-10 rounded-md bg-slate-100 animate-pulse" />
            </div>

            <div className="flex items-center gap-2 text-sm order-3">
                <div className="h-6 w-16 rounded bg-slate-100 animate-pulse" />
                <div className="h-8 w-24 rounded bg-slate-100 animate-pulse" />
            </div>
        </nav>
    );
}
