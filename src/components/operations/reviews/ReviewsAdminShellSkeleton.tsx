import React from "react";

// ── Tokens ───────────────────────────────────────────────────────────────────
const S = "#E7E5E4";
const SHADOW_OUT = "6px 6px 14px #c9c7c6, -6px -6px 14px #ffffff";
// const SHADOW_IN  = "inset 3px 3px 7px #c9c7c6, inset -3px -3px 7px #ffffff";
const PULSE = "#d8d6d5";
const MONO = "var(--font-jetbrains-mono), monospace";
// const BRAND      = "var(--font-space-mono), monospace";
// const PRIMARY    = "#006666";

function P({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <div
            className={`rounded-xl animate-pulse ${className}`}
            style={{ background: PULSE, ...style }}
        />
    );
}

type Props = { rows?: number; limit?: number };

export function ReviewsAdminShellSkeleton({ rows = 8, limit = 8 }: Props) {
    return (
        <main
            className="min-h-screen"
            style={{ background: S, fontFamily: MONO }}
            aria-label="Reviews management"
        >
            <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
                <section className="space-y-5" aria-busy="true" aria-live="polite">

                    {/* Header skeleton */}
                    <div className="rounded-2xl px-6 py-5" style={{ background: S, boxShadow: SHADOW_OUT }}>
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-2 flex-1 min-w-0">
                                <P className="h-8 w-52" />
                                <P className="h-3 w-2/3" />
                            </div>
                            <div className="hidden lg:block">
                                <P className="h-8 w-32 rounded-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Toolbar skeleton */}
                    <div className="rounded-2xl p-5 space-y-4" style={{ background: S, boxShadow: SHADOW_OUT }}>
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                            <div className="flex-1 space-y-2.5">
                                <P className="h-10 w-full rounded-xl" />
                                <div className="flex gap-2">
                                    {[60, 48, 52, 44, 48].map((w, i) => (
                                        <P key={i} className="h-7 rounded-xl" style={{ width: w }} />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <P className="h-10 w-28 rounded-xl" />
                                <P className="h-10 w-20 rounded-xl" />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <P className="h-8 w-40 rounded-xl" />
                            <P className="h-8 w-8 rounded-xl" />
                            <P className="h-8 w-36 rounded-xl" />
                            <P className="h-8 w-28 rounded-xl ml-auto" />
                        </div>
                    </div>

                    {/* Table skeleton */}
                    <div className="rounded-2xl overflow-hidden" style={{ background: S, boxShadow: SHADOW_OUT }}>
                        {/* Stats bar */}
                        <div className="px-5 py-3 flex gap-4" style={{ background: "#e0dedd", borderBottom: "1px solid #d1cfce" }}>
                            {[80, 96, 72].map((w, i) => (
                                <P key={i} className="h-6 rounded-lg" style={{ width: w }} />
                            ))}
                        </div>

                        {/* Header row */}
                        <div className="px-5 py-3 grid grid-cols-[100px_minmax(300px,1fr)_180px_160px_160px_140px_80px] gap-3"
                            style={{ background: S, borderBottom: "1px solid #d1cfce" }}>
                            {[80, 120, 100, 80, 80, 72, 56].map((w, i) => (
                                <P key={i} className="h-3 rounded" style={{ width: w }} />
                            ))}
                        </div>

                        {/* Rows */}
                        {Array.from({ length: Math.max(rows, limit) }).map((_, idx) => (
                            <div
                                key={idx}
                                className="px-5 py-4"
                                style={{ borderBottom: "1px solid #d1cfce", background: idx % 2 === 0 ? S : "#dddbd9" }}
                            >
                                <div className="grid grid-cols-[100px_minmax(300px,1fr)_180px_160px_160px_140px_80px] gap-3">
                                    <P className="h-12 rounded-xl" />
                                    <div className="space-y-2">
                                        <P className="h-3 w-3/4" />
                                        <P className="h-3 w-full" />
                                        <P className="h-3 w-1/2" />
                                    </div>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <P key={i} className="h-4 rounded-xl" />
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Footer */}
                        <div className="px-5 py-3 flex items-center justify-between"
                            style={{ background: "#e0dedd", borderTop: "1px solid #d1cfce" }}>
                            <P className="h-3 w-56" />
                            <P className="h-3 w-32" />
                        </div>
                    </div>

                    {/* Pagination skeleton */}
                    <div className="rounded-2xl px-5 py-4" style={{ background: S, boxShadow: SHADOW_OUT }}>
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
                            <div className="flex items-center gap-3">
                                <P className="h-8 w-8 rounded-xl" />
                                <div className="space-y-1.5">
                                    <P className="h-3 w-32" />
                                    <P className="h-2.5 w-20" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {[...Array(7)].map((_, i) => (
                                    <P key={i} className="h-9 w-9 rounded-xl" />
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                <P className="h-3 w-10" />
                                <P className="h-9 w-16 rounded-xl" />
                                <P className="h-3 w-14" />
                            </div>
                        </div>
                    </div>

                </section>
            </div>
        </main>
    );
}