"use client";

import { motion } from "framer-motion";

// ─────────────────────────────────────────────────────────────
// Neumorphism skeleton tokens
// ─────────────────────────────────────────────────────────────
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";
const NEU_CARD = "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_HDR = "px-6 py-4 rounded-t-2xl shadow-[inset_0_-1px_0_#c8c6c5]";
const NEU_INSET_SM = "bg-[#E7E5E4] rounded-xl shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_RAISED_SM = "bg-[#E7E5E4] rounded-xl shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";

// Skeleton pulse on the neu surface
const SK_BASE = "animate-pulse rounded-lg bg-[#d0cecd]";          // neutral
const SK_TEAL = "animate-pulse rounded-lg bg-[#006666]/15";        // primary accent
const SK_WARM = "animate-pulse rounded-lg bg-[#FE9900]/15";        // warning accent
const SK_GREEN = "animate-pulse rounded-lg bg-[#00A63D]/15";        // success accent
const SK_MUTED = "animate-pulse rounded-lg bg-[#1E2938]/10";        // muted

// ─────────────────────────────────────────────────────────────
// Tiny helper so JSX stays readable
// ─────────────────────────────────────────────────────────────
function Sk({ h, w, cls = SK_BASE }: { h: string; w: string; cls?: string }) {
    return <div className={`${cls} ${h} ${w}`} />;
}

// Inset row (mirrors NEU_ROW in the real component)
function SkRow({ wLeft = "w-24", wRight = "w-20", cls = SK_BASE }: { wLeft?: string; wRight?: string; cls?: string }) {
    return (
        <div className={`${NEU_INSET_SM} flex justify-between items-center p-3`}>
            <Sk h="h-4" w={wLeft} />
            <Sk h="h-4" w={wRight} cls={cls} />
        </div>
    );
}

// Section card shell
function SkCard({ children, headerW = "w-48" }: { children: React.ReactNode; headerW?: string }) {
    return (
        <div className={NEU_CARD}>
            <div className={NEU_CARD_HDR}>
                <div className="flex items-center gap-3">
                    <div className={`${NEU_RAISED_SM} p-2 w-9 h-9`} />
                    <Sk h="h-5" w={headerW} cls={SK_TEAL} />
                </div>
            </div>
            <div className="px-6 py-5">{children}</div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
interface TourDetailLoadingProps {
    showFullLayout?: boolean;
}

export default function TourDetailLoading({ showFullLayout = true }: TourDetailLoadingProps) {
    return (
        <div className="w-full">
            <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                >
                    {/* ── Page header ──────────────────────────── */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {/* back button well */}
                            <div className={`${NEU_RAISED_SM} w-10 h-10`} />
                            <div className="space-y-2">
                                <Sk h="h-7" w="w-48 sm:w-64" cls={SK_TEAL} />
                                <Sk h="h-4" w="w-32" />
                            </div>
                        </div>
                        {/* action buttons */}
                        <div className="flex gap-2">
                            <div className={`${NEU_RAISED_SM} h-10 w-24`} />
                            <div className={`${NEU_RAISED_SM} h-10 w-24`} />
                        </div>
                    </div>

                    {/* ── TourBasicInfo skeleton ────────────────── */}
                    <SkCard headerW="w-72">
                        {/* title + badges */}
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Sk h="h-6" w="w-3/4" cls={SK_TEAL} />
                                    <Sk h="h-5" w="w-16" cls={SK_WARM} />
                                </div>
                                <Sk h="h-4" w="w-full" />
                                <Sk h="h-4" w="w-2/3" />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <Sk h="h-6" w="w-20" cls={SK_TEAL} />
                                <Sk h="h-6" w="w-20" cls={SK_GREEN} />
                            </div>
                        </div>

                        {/* hero image */}
                        <div className="space-y-2 mb-6">
                            <Sk h="h-4" w="w-24" />
                            <div className={`${NEU_INSET_SM} w-full h-56 sm:h-64`} />
                        </div>

                        {/* gallery */}
                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between">
                                <Sk h="h-4" w="w-40" />
                                <Sk h="h-5" w="w-12" cls={SK_GREEN} />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[0, 1, 2, 3].map((i) => (
                                    <div key={i} className={`${NEU_INSET_SM} aspect-square`} />
                                ))}
                            </div>
                        </div>

                        {/* info grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[SK_TEAL, SK_GREEN, SK_WARM].map((accent, col) => (
                                <div key={col} className={`${NEU_INSET_SM} p-4 space-y-3`}>
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 rounded-full animate-pulse bg-[#1E2938]/10" />
                                        <Sk h="h-4" w="w-28" cls={accent} />
                                    </div>
                                    {[0, 1, 2].map((r) => (
                                        <div key={r} className="flex items-center gap-2">
                                            <Sk h="h-3" w="w-3" />
                                            <Sk h="h-4" w="w-16" />
                                            <Sk h="h-4" w="w-20 ml-auto" cls={accent} />
                                        </div>
                                    ))}
                                    <div className="flex gap-1 flex-wrap pt-2">
                                        {[0, 1, 2].map((b) => (
                                            <Sk key={b} h="h-5" w="w-12" cls={b === 0 ? SK_TEAL : b === 1 ? SK_GREEN : SK_WARM} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SkCard>

                    {showFullLayout && (
                        <>
                            {/* ── Tabs bar skeleton ─────────────── */}
                            <div className={`${NEU_INSET_SM} p-1.5 flex flex-wrap gap-1`}>
                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className={`${NEU_RAISED_SM} flex-1 min-w-[80px] h-10`} />
                                ))}
                            </div>

                            {/* ── BangladeshInfo skeleton ───────── */}
                            <SkCard headerW="w-64">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[0, 1].map((col) => (
                                        <div key={col} className="space-y-4">
                                            <div className={`${NEU_INSET_SM} p-4 space-y-3`}>
                                                <Sk h="h-5" w="w-32" cls={col === 0 ? SK_TEAL : SK_WARM} />
                                                <SkRow wRight="w-32" cls={col === 0 ? SK_TEAL : SK_WARM} />
                                                <SkRow wRight="w-28" />
                                            </div>
                                            <div className={`${NEU_INSET_SM} p-4 space-y-3`}>
                                                <Sk h="h-5" w="w-40" cls={SK_GREEN} />
                                                <SkRow wRight="w-24" cls={SK_WARM} />
                                                <div className={`${NEU_RAISED_SM} p-3 space-y-2`}>
                                                    <Sk h="h-4" w="w-24" />
                                                    <div className="flex gap-2 flex-wrap">
                                                        {[0, 1, 2].map((b) => (
                                                            <Sk key={b} h="h-5" w="w-16" cls={b === 0 ? SK_TEAL : b === 1 ? SK_GREEN : SK_WARM} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SkCard>

                            {/* ── InclusionsExclusions skeleton ─── */}
                            <SkCard headerW="w-72">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* inclusions */}
                                    <div className={`${NEU_INSET_SM} p-4 space-y-3`}>
                                        <div className="flex items-center gap-2">
                                            <Sk h="h-5" w="w-5" cls={SK_GREEN} />
                                            <Sk h="h-5" w="w-24" cls={SK_GREEN} />
                                        </div>
                                        {[0, 1, 2, 3].map((r) => (
                                            <div key={r} className={`${NEU_RAISED_SM} flex items-start gap-3 p-3`}>
                                                <Sk h="h-5" w="w-5" cls={SK_GREEN} />
                                                <div className="flex-1 space-y-1.5">
                                                    <Sk h="h-4" w="w-3/4" />
                                                    <Sk h="h-3" w="w-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* exclusions */}
                                    <div className={`${NEU_INSET_SM} p-4 space-y-3`}>
                                        <div className="flex items-center gap-2">
                                            <Sk h="h-5" w="w-5" cls={SK_MUTED} />
                                            <Sk h="h-5" w="w-24" cls={SK_WARM} />
                                        </div>
                                        {[0, 1, 2].map((r) => (
                                            <div key={r} className={`${NEU_RAISED_SM} flex items-start gap-3 p-3`}>
                                                <Sk h="h-5" w="w-5" cls={SK_WARM} />
                                                <div className="flex-1 space-y-1.5">
                                                    <Sk h="h-4" w="w-3/4" />
                                                    <Sk h="h-3" w="w-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </SkCard>

                            {/* ── PricingInfo skeleton ──────────── */}
                            <SkCard headerW="w-48">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* base price */}
                                    <div className={`${NEU_INSET_SM} p-4 space-y-3`}>
                                        <Sk h="h-5" w="w-32" cls={SK_WARM} />
                                        <Sk h="h-8" w="w-40" cls={SK_TEAL} />
                                        <Sk h="h-4" w="w-24" />
                                        <div className="flex gap-2">
                                            <Sk h="h-6" w="w-16" cls={SK_GREEN} />
                                            <Sk h="h-6" w="w-16" cls={SK_TEAL} />
                                        </div>
                                    </div>
                                    {/* tier pricing */}
                                    <div className={`${NEU_INSET_SM} p-4 space-y-3`}>
                                        <Sk h="h-5" w="w-32" cls={SK_GREEN} />
                                        {[0, 1].map((r) => (
                                            <div key={r} className={`${NEU_RAISED_SM} flex justify-between p-3`}>
                                                <div className="space-y-1 flex-1">
                                                    <Sk h="h-4" w="w-24" />
                                                    <Sk h="h-3" w="w-20" />
                                                </div>
                                                <Sk h="h-5" w="w-12" cls={r === 0 ? SK_WARM : SK_TEAL} />
                                            </div>
                                        ))}
                                    </div>
                                    {/* discounts */}
                                    <div className={`${NEU_INSET_SM} p-4 space-y-3`}>
                                        <Sk h="h-5" w="w-40" cls={SK_TEAL} />
                                        <div className="flex flex-wrap gap-2">
                                            {[0, 1, 2].map((b) => (
                                                <Sk key={b} h="h-5" w="w-16" cls={b === 0 ? SK_TEAL : b === 1 ? SK_GREEN : SK_WARM} />
                                            ))}
                                        </div>
                                        <Sk h="h-4" w="w-32" />
                                        {[0, 1].map((r) => (
                                            <div key={r} className={`${NEU_RAISED_SM} p-3 space-y-1`}>
                                                <Sk h="h-4" w="w-20" />
                                                <Sk h="h-3" w="w-16" cls={SK_TEAL} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </SkCard>

                            {/* ── LogisticsInfo skeleton ────────── */}
                            <SkCard headerW="w-36">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* transport */}
                                    <div className={`${NEU_INSET_SM} p-4 space-y-3`}>
                                        <Sk h="h-5" w="w-36" cls={SK_TEAL} />
                                        <div className={`${NEU_RAISED_SM} p-3 space-y-2`}>
                                            <Sk h="h-4" w="w-16" />
                                            <Sk h="h-3" w="w-full" />
                                            <Sk h="h-3" w="w-3/4" />
                                        </div>
                                        <div className={`${NEU_RAISED_SM} p-3 space-y-1`}>
                                            <Sk h="h-4" w="w-28" />
                                            <Sk h="h-3" w="w-40" />
                                        </div>
                                    </div>
                                    {/* accommodation */}
                                    <div className={`${NEU_INSET_SM} p-4 space-y-3`}>
                                        <Sk h="h-5" w="w-36" cls={SK_GREEN} />
                                        <div className="flex flex-wrap gap-2">
                                            {[0, 1, 2, 3].map((b) => (
                                                <Sk key={b} h="h-5" w="w-16" cls={b % 2 === 0 ? SK_TEAL : SK_WARM} />
                                            ))}
                                        </div>
                                        {[0, 1, 2].map((r) => (
                                            <div key={r} className={`${NEU_RAISED_SM} p-3 space-y-1`}>
                                                <Sk h="h-4" w="w-20" />
                                                <Sk h="h-3" w="w-12" cls={SK_GREEN} />
                                            </div>
                                        ))}
                                    </div>
                                    {/* stops */}
                                    <div className={`${NEU_INSET_SM} p-4 space-y-3`}>
                                        <div className="flex items-center gap-2">
                                            <Sk h="h-5" w="w-5" cls={SK_GREEN} />
                                            <Sk h="h-5" w="w-28" />
                                        </div>
                                        {[0, 1, 2, 3, 4].map((r) => (
                                            <div key={r} className={`${NEU_RAISED_SM} flex items-center justify-between p-3`}>
                                                <div className="flex items-center gap-2 flex-1">
                                                    <Sk h="h-4" w="w-4" cls={r % 2 === 0 ? SK_TEAL : SK_GREEN} />
                                                    <Sk h="h-4" w="w-32" />
                                                </div>
                                                <Sk h="h-4" w="w-8" cls={SK_WARM} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </SkCard>

                            {/* ── ComplianceInfo skeleton ───────── */}
                            <SkCard headerW="w-64">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[SK_TEAL, SK_WARM, SK_GREEN].map((accent, col) => (
                                        <div key={col} className={`${NEU_INSET_SM} p-4 space-y-3`}>
                                            <Sk h="h-5" w="w-36" cls={accent} />
                                            {[0, 1, 2].map((r) => (
                                                <div key={r} className={`${NEU_RAISED_SM} flex justify-between items-center p-3`}>
                                                    <Sk h="h-4" w="w-28" />
                                                    <Sk h="h-5" w="w-16" cls={accent} />
                                                </div>
                                            ))}
                                            <div className="pt-2 flex flex-wrap gap-2">
                                                {[0, 1, 2].map((b) => (
                                                    <Sk key={b} h="h-5" w="w-16" cls={b === 0 ? SK_TEAL : b === 1 ? SK_WARM : SK_GREEN} />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SkCard>

                            {/* ── ComputedInfo skeleton ─────────── */}
                            <SkCard headerW="w-56">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* availability */}
                                    <div className={`${NEU_INSET_SM} p-5 space-y-4`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`${NEU_RAISED_SM} w-10 h-10`} />
                                            <Sk h="h-5" w="w-36" cls={SK_TEAL} />
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[SK_TEAL, SK_GREEN, SK_WARM].map((accent, i) => (
                                                <div key={i} className={`${NEU_RAISED_SM} p-3 space-y-1`}>
                                                    <Sk h="h-3" w="w-16" />
                                                    <Sk h="h-5" w="w-12" cls={accent} />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <Sk h="h-4" w="w-20" />
                                                <Sk h="h-4" w="w-12" />
                                            </div>
                                            <div className={`${NEU_INSET_SM} h-2 w-full`}>
                                                <div className="h-full w-3/5 rounded-full animate-pulse bg-[#006666]/30" />
                                            </div>
                                        </div>
                                        <SkRow wRight="w-16" cls={SK_GREEN} />
                                    </div>

                                    {/* pricing summary */}
                                    <div className={`${NEU_INSET_SM} p-5 space-y-4`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`${NEU_RAISED_SM} w-10 h-10`} />
                                            <Sk h="h-5" w="w-36" cls={SK_WARM} />
                                        </div>
                                        <div className="space-y-3">
                                            {[0, 1, 2].map((r) => (
                                                <SkRow key={r} wRight="w-20" cls={r === 0 ? SK_TEAL : r === 1 ? SK_WARM : SK_GREEN} />
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 pt-2">
                                            {[SK_GREEN, SK_WARM, SK_TEAL].map((accent, i) => (
                                                <div key={i} className={`${NEU_RAISED_SM} p-3 space-y-1`}>
                                                    <Sk h="h-4" w="w-16" />
                                                    <Sk h="h-7" w="w-10" cls={accent} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SkCard>

                            {/* ── Moderation & System skeleton ─────── */}
                            <SkCard headerW="w-72">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* moderation */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className={`${NEU_RAISED_SM} w-8 h-8`} />
                                            <Sk h="h-3" w="w-32" cls={SK_MUTED} />
                                        </div>
                                        {[SK_WARM, SK_BASE, SK_GREEN].map((accent, r) => (
                                            <SkRow key={r} wRight="w-20" cls={accent} />
                                        ))}
                                    </div>

                                    {/* system */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className={`${NEU_RAISED_SM} w-8 h-8`} />
                                            <Sk h="h-3" w="w-32" cls={SK_MUTED} />
                                        </div>
                                        <SkRow wRight="w-20" cls={SK_GREEN} />
                                        <SkRow wRight="w-24" cls={SK_TEAL} />
                                        <div className={`${NEU_INSET_SM} p-3 space-y-2`}>
                                            <Sk h="h-3" w="w-10" cls={SK_MUTED} />
                                            <div className="flex gap-1.5 flex-wrap">
                                                {[0, 1, 2].map((b) => (
                                                    <Sk key={b} h="h-5" w="w-12" />
                                                ))}
                                            </div>
                                        </div>
                                        <SkRow wRight="w-32" />
                                        <div className={`${NEU_INSET_SM} p-3 space-y-1`}>
                                            <Sk h="h-3" w="w-20" cls={SK_MUTED} />
                                            <Sk h="h-4" w="w-full" />
                                        </div>
                                    </div>
                                </div>

                                {/* footer */}
                                <div className="mt-5 pt-3 border-t border-[#1E2938]/10 flex items-center gap-2">
                                    <div className={`${NEU_RAISED_SM} w-6 h-6`} />
                                    <Sk h="h-3" w="w-48" />
                                </div>
                            </SkCard>
                        </>
                    )}
                </motion.div>
        </div>
    );
}