"use client";

import { motion, Variants } from "framer-motion";
import { Sparkles } from "lucide-react";
import DifficultySection from "./DifficultySection";
import BestSeasonSection from "./BestSeasonSection";
import DestinationsSection from "./DestinationsSection";
import ItinerarySection from "./ItinerarySection";
import InclusionsSection from "./InclusionsSection";
import ExclusionsSection from "./ExclusionsSection";
import AudienceSection from "./AudienceSection";
import CategoriesSection from "./CategoriesSection";
import TranslationsSection from "./TranslationsSection";

// ── Neumorphic Style Tokens ──────────────────────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4]  border border-white/60";
const NEU_ICON_WELL_GRADIENT =
    "p-3 rounded-xl flex items-center justify-center";
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_DIVIDER = "border-[#1E2938]/10";
const NEU_SURFACE_INSET =
    "bg-[#E7E5E4] ";

// ── Animation Variants ───────────────────────────────────────────────────────
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: "easeOut" },
    },
};

const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: "easeOut" },
    },
};

// ── Section Wrapper ──────────────────────────────────────────────────────────
function SectionCard({ children }: { children: React.ReactNode }) {
    return (
        <motion.div variants={sectionVariants} className="w-full">
            <div className={`${NEU_CARD} p-5 md:p-6`}>{children}</div>
        </motion.div>
    );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function ContentItineraryStep() {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`${NEU_SURFACE} rounded-3xl p-4 md:p-6 lg:p-8`}
        >
            {/* ── Header ──────────────────────────────────────────────────────── */}
            <motion.div variants={itemVariants} className="mb-8">
                <div className="flex items-center gap-3 mb-1.5">
                    {/* Icon well with gradient background */}
                    <div
                        className={`${NEU_ICON_WELL_GRADIENT} `}
                        style={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                    >
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex flex-col">
                        <h2 className={`${NEU_HEADING} text-xl md:text-2xl`}>
                            Content &amp; Itinerary
                        </h2>
                        <p className={`${NEU_MUTED} mt-0.5`}>
                            Define your tour&apos;s destinations, itinerary, and categorization
                        </p>
                    </div>
                </div>

                {/* Inset divider line */}
                <div
                    className={`mt-5 h-px ${NEU_SURFACE_INSET} rounded-full border-t ${NEU_DIVIDER}`}
                />
            </motion.div>

            {/* ── Section Grid ─────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-5">

                {/* Row 1: Difficulty + Best Season (side by side on md+) */}
                <motion.div
                    variants={sectionVariants}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                    <div className={`${NEU_CARD} p-5 md:p-6`}>
                        <DifficultySection />
                    </div>
                    <div className={`${NEU_CARD} p-5 md:p-6`}>
                        <BestSeasonSection />
                    </div>
                </motion.div>

                {/* Row 2: Destinations – full width */}
                <SectionCard>
                    <DestinationsSection />
                </SectionCard>

                {/* Row 3: Itinerary – full width */}
                <SectionCard>
                    <ItinerarySection />
                </SectionCard>

                {/* Row 4: Inclusions + Exclusions (side by side on md+) */}
                <motion.div
                    variants={sectionVariants}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                    <div className={`${NEU_CARD} p-5 md:p-6`}>
                        <InclusionsSection />
                    </div>
                    <div className={`${NEU_CARD} p-5 md:p-6`}>
                        <ExclusionsSection />
                    </div>
                </motion.div>

                {/* Row 5: Audience + Categories (side by side on md+) */}
                <motion.div
                    variants={sectionVariants}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                    <div className={`${NEU_CARD} p-5 md:p-6`}>
                        <AudienceSection />
                    </div>
                    <div className={`${NEU_CARD} p-5 md:p-6`}>
                        <CategoriesSection />
                    </div>
                </motion.div>

                {/* Row 6: Translations – full width */}
                <SectionCard>
                    <TranslationsSection />
                </SectionCard>

            </div>
        </motion.div>
    );
}