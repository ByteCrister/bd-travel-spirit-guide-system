"use client";

import { useTourDetailStore } from "@/store/tour-detail.store";
import { useEffect } from "react";
import { Kpis } from "./Kpis";
import { Filters } from "./Filters";
import { TourTable } from "./TourTable";
import TourListPagination from "./TourListPagination";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";
import { motion, Variants } from "framer-motion";
import { PlusCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

// ─── Neumorphism Design Tokens ──────────────────────────────────────────────
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4]  border border-white/60";
const NEU_BTN_PRIMARY =
    "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
    " " +
    "hover: hover:bg-[#007777] " +
    "active: " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_DIVIDER = "border-[#1E2938]/10";
const NEU_ICON_WELL_PRIMARY = "p-2.5 rounded-xl bg-[#006666]/10 ";

// ─── Animation Variants ─────────────────────────────────────────────────────
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ─── Breadcrumb Items ────────────────────────────────────────────────────────
const BREADCRUMB_ITEMS = [
    { label: "Home", href: "/" },
    { label: "Tours", href: "/operations/tours" },
];

export default function ToursPage() {
    const router = useRouter();
    const { fetchTours, listCache, activeCacheKey, params: p } = useTourDetailStore();
    const params = p.tours;

    useEffect(() => {
        fetchTours();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const activeKey = activeCacheKey.tours;
    const currentList = activeKey ? listCache.tours[activeKey] : undefined;

    return (
        <div className={NEU_PAGE_BG}>
            <div className="container mx-auto py-6 px-4 max-w-screen-2xl">

                {/* ── Top Bar: Breadcrumbs + Add Tour ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1"
                    >
                        <Breadcrumbs items={BREADCRUMB_ITEMS} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <button
                            type="button"
                            onClick={() => router.push("/operations/tours/add-tour")}
                            className={`${NEU_BTN_PRIMARY} group flex items-center gap-3 px-5 py-3 w-full sm:w-auto`}
                        >
                            <div className={NEU_ICON_WELL_PRIMARY}>
                                <PlusCircle className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-bold">Add Tour</span>
                                <span className="text-[10px] text-white/70 font-[family-name:var(--font-jetbrains-mono)]">
                                    Create new tour package
                                </span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-white/70 group-hover:translate-x-1 transition-transform ml-1" />
                        </button>
                    </motion.div>
                </div>

                {/* ── Page Heading ── */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="mb-6"
                >
                    <h1 className={`${NEU_HEADING} text-2xl sm:text-3xl`}>Tours</h1>
                    <p className={`${NEU_MUTED} mt-1`}>Manage and monitor all tour packages</p>
                </motion.div>

                {/* ── Main Content ── */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {/* KPIs */}
                    <motion.div variants={itemVariants}>
                        <Kpis />
                    </motion.div>

                    {/* Filters */}
                    <motion.div variants={itemVariants}>
                        <Filters />
                    </motion.div>

                    {/* Table + Pagination */}
                    <motion.div variants={itemVariants}>
                        <div className={`${NEU_CARD} overflow-hidden`}>
                            {/* Table */}
                            <div className="p-6">
                                <TourTable list={currentList} />
                            </div>

                            {/* Pagination */}
                            <div className={`px-6 pb-6 border-t ${NEU_DIVIDER} pt-4`}>
                                <TourListPagination pagination={params.pagination} />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}