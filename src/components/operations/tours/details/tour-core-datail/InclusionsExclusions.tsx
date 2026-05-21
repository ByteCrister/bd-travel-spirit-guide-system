"use client";

import { TourDetailDTO } from "@/types/tour/tour.types";
import { CheckCircle, Package, XCircle, Info } from "lucide-react";
import { motion } from "framer-motion";

// ── Neumorphism Design Tokens ─────────────────────────────────
const NEU_CARD = "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM = "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_SURFACE_INSET_SM = "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_ICON_WELL_PRIMARY = "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_DIVIDER = "border-[#1E2938]/10";

const INCLUSION_ROW =
    "flex items-start gap-3 p-3 rounded-xl border border-[#00A63D]/20 bg-[#00A63D]/5 " +
    "shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "hover:shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] transition-shadow duration-200";

const EXCLUSION_ROW =
    "flex items-start gap-3 p-3 rounded-xl border border-[#FF2157]/20 bg-[#FF2157]/5 " +
    "shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "hover:shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] transition-shadow duration-200";

const EMPTY_STATE = `flex flex-col items-center gap-2 p-6 rounded-xl text-center ${NEU_SURFACE_INSET_SM}`;

interface InclusionsExclusionsProps {
    tour: TourDetailDTO;
}

const InclusionsExclusions = ({ tour }: InclusionsExclusionsProps) => {
    return (
        <div className={`${NEU_CARD} p-1 overflow-hidden`}>
            {/* Header */}
            <div className="px-6 py-5 rounded-2xl mb-1">
                <div className="flex items-center gap-3">
                    <div className={NEU_ICON_WELL_PRIMARY}>
                        <Package className="h-5 w-5 text-[#006666]" />
                    </div>
                    <div>
                        <h2 className={`${NEU_HEADING} text-xl`}>What&apos;s Included & Excluded</h2>
                        <p className={`${NEU_MUTED} mt-0.5`}>A clear breakdown of what the package covers</p>
                    </div>
                </div>
                <div className={`mt-4 border-t ${NEU_DIVIDER}`} />
            </div>

            {/* Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ── Inclusions ── */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`${NEU_CARD_SM} p-5 space-y-4`}
                >
                    <div className="flex items-center gap-2">
                        <div className="p-2.5 rounded-xl bg-[#00A63D]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
                            <CheckCircle className="h-4 w-4 text-[#00A63D]" />
                        </div>
                        <span className={`${NEU_HEADING} text-base`}>Inclusions</span>
                        {tour.inclusions && tour.inclusions.length > 0 && (
                            <span className="ml-auto font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#00A63D] bg-[#00A63D]/10 px-2 py-0.5 rounded-lg shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]">
                                {tour.inclusions.length}
                            </span>
                        )}
                    </div>
                    <div className={`border-t ${NEU_DIVIDER}`} />

                    {tour.inclusions && tour.inclusions.length > 0 ? (
                        <ul className="space-y-3">
                            {tour.inclusions.map((inc, idx) => (
                                <motion.li
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.08 * idx }}
                                    className={INCLUSION_ROW}
                                >
                                    <CheckCircle className="h-5 w-5 text-[#00A63D] shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className={`${NEU_MONO} text-sm font-semibold`}>{inc.label}</p>
                                        {inc.description && (
                                            <p className={`${NEU_MUTED} mt-1 leading-relaxed`}>{inc.description}</p>
                                        )}
                                    </div>
                                </motion.li>
                            ))}
                        </ul>
                    ) : (
                        <div className={EMPTY_STATE}>
                            <Info className="h-8 w-8 text-[#1E2938]/25" />
                            <p className={NEU_MUTED}>No inclusions specified</p>
                        </div>
                    )}
                </motion.div>

                {/* ── Exclusions ── */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className={`${NEU_CARD_SM} p-5 space-y-4`}
                >
                    <div className="flex items-center gap-2">
                        <div className="p-2.5 rounded-xl bg-[#FF2157]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
                            <XCircle className="h-4 w-4 text-[#FF2157]" />
                        </div>
                        <span className={`${NEU_HEADING} text-base`}>Exclusions</span>
                        {tour.exclusions && tour.exclusions.length > 0 && (
                            <span className="ml-auto font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#FF2157] bg-[#FF2157]/10 px-2 py-0.5 rounded-lg shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]">
                                {tour.exclusions.length}
                            </span>
                        )}
                    </div>
                    <div className={`border-t ${NEU_DIVIDER}`} />

                    {tour.exclusions && tour.exclusions.length > 0 ? (
                        <ul className="space-y-3">
                            {tour.exclusions.map((exc, idx) => (
                                <motion.li
                                    key={idx}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.08 * idx }}
                                    className={EXCLUSION_ROW}
                                >
                                    <XCircle className="h-5 w-5 text-[#FF2157] shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className={`${NEU_MONO} text-sm font-semibold`}>{exc.label}</p>
                                        {exc.description && (
                                            <p className={`${NEU_MUTED} mt-1 leading-relaxed`}>{exc.description}</p>
                                        )}
                                    </div>
                                </motion.li>
                            ))}
                        </ul>
                    ) : (
                        <div className={EMPTY_STATE}>
                            <Info className="h-8 w-8 text-[#1E2938]/25" />
                            <p className={NEU_MUTED}>No exclusions specified</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default InclusionsExclusions;