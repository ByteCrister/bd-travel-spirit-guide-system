"use client";

import { useFormikContext } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import { CreateTourDTO } from "@/types/tour/tour.types";
import { SEASON } from "@/constants/tour/tour.const";
import { Sun, Calendar } from "lucide-react";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_HOVER =
    "hover:shadow-[10px_10px_20px_#c8c6c5,-10px_-10px_20px_#ffffff] hover:-translate-y-0.5 transition-all duration-300";
const NEU_ICON_WELL_PRIMARY =
    "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_CHIP_DEFAULT =
    "flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-[family-name:var(--font-space-mono)] font-500 text-[#1E2938]/70 " +
    "bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
    "cursor-pointer transition-all duration-200 select-none w-full";
const NEU_CHIP_ACTIVE =
    "flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-[family-name:var(--font-space-mono)] font-600 text-white " +
    "bg-[#006666] shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_5px_#008080] " +
    "cursor-pointer transition-all duration-200 select-none w-full";

// Season metadata
const SEASON_META: Record<string, { dot: string; emoji: string; desc: string }> = {
    spring: { dot: "bg-[#00A63D]", emoji: "🌸", desc: "Mar – May" },
    summer: { dot: "bg-[#FE9900]", emoji: "☀️", desc: "Jun – Aug" },
    autumn: { dot: "bg-[#FF2157]", emoji: "🍂", desc: "Sep – Nov" },
    winter: { dot: "bg-[#006666]", emoji: "❄️", desc: "Dec – Feb" },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const chipVariants = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.92, transition: { duration: 0.15 } },
};

export default function BestSeasonSection() {
    const { values, setFieldValue } = useFormikContext<CreateTourDTO>();

    const hasSelections = values.bestSeason && values.bestSeason.length > 0;

    return (
        <div className="col-span-12 md:col-span-6">
            <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
            >
                <div className={`${NEU_CARD} ${NEU_CARD_HOVER} p-5 relative overflow-hidden`}>
                    {/* Top accent bar */}
                    <div
                        className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl transition-opacity duration-300 ${hasSelections ? "opacity-100" : "opacity-30"
                            } bg-gradient-to-r from-[#FE9900] to-[#FF2157]`}
                    />

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-5 mt-1">
                        <div className={NEU_ICON_WELL_PRIMARY}>
                            <Sun className="w-5 h-5 text-[#006666]" />
                        </div>
                        <div className="flex-1">
                            <h3 className={`${NEU_HEADING} text-base`}>Best Season *</h3>
                            <p className={NEU_MUTED}>Select one or more ideal seasons</p>
                        </div>
                    </div>

                    {/* Season grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                        {Object.values(SEASON).map((season) => {
                            const isActive = values.bestSeason?.includes(season);
                            const meta = SEASON_META[season.toLowerCase()] ?? {
                                dot: "bg-[#006666]",
                                emoji: "🗓️",
                                desc: "",
                            };

                            return (
                                <motion.button
                                    key={season}
                                    type="button"
                                    whileTap={{ scale: 0.97 }}
                                    className={isActive ? NEU_CHIP_ACTIVE : NEU_CHIP_DEFAULT}
                                    onClick={() => {
                                        const next = !isActive
                                            ? [...(values.bestSeason || []), season]
                                            : (values.bestSeason || []).filter((s) => s !== season);
                                        setFieldValue("bestSeason", next);
                                    }}
                                >
                                    <span className="text-lg leading-none">{meta.emoji}</span>
                                    <span className="flex-1 text-left">
                                        {season.charAt(0).toUpperCase() + season.slice(1)}
                                    </span>
                                    <span
                                        className={`text-xs font-[family-name:var(--font-jetbrains-mono)] ${isActive ? "text-white/70" : "text-[#1E2938]/40"
                                            }`}
                                    >
                                        {meta.desc}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Selection count badge */}
                    <AnimatePresence>
                        {hasSelections && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25 }}
                                className="mt-4 flex items-center gap-2 pt-3 border-t border-[#1E2938]/10"
                            >
                                <Calendar className="w-3.5 h-3.5 text-[#006666]" />
                                <span className={`${NEU_LABEL}`}>
                                    {values.bestSeason!.length} season
                                    {values.bestSeason!.length > 1 ? "s" : ""} selected
                                </span>
                                {/* Selected season dots */}
                                <div className="flex gap-1 ml-auto">
                                    <AnimatePresence mode="popLayout">
                                        {values.bestSeason!.map((s) => {
                                            const m = SEASON_META[s.toLowerCase()];
                                            return (
                                                <motion.span
                                                    key={s}
                                                    variants={chipVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    layout
                                                    className={`w-2.5 h-2.5 rounded-full ${m?.dot ?? "bg-[#006666]"} shadow-sm`}
                                                />
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}