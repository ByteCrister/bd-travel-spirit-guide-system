"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    LayoutDashboard,
    MessageSquare,
    Flag,
    HelpCircle,
    Plus,
} from "lucide-react";
import Link from "next/link";

import ReviewsPanel from "./ReviewsPanel";
import ReportsPanel from "./ReportsPanel";
import TourFaqsPanel from "./TourFaqsPanel";
import TourCoreDetails from "./TourCoreDetails";
import { useTourDetailStore } from "@/store/tour-detail.store";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";
import { LuCalendar } from "react-icons/lu";
import TourBookingsPanel from "./TourBookingsPanel";
import { cn } from "@/lib/utils";

// ─── Neumorphism Design Tokens ─────────────────────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";
// Tab button states
const NEU_TAB_BASE =
    "relative flex-1 min-w-[80px] max-w-[200px] flex flex-col items-center justify-center gap-1.5 " +
    "px-3 py-3 rounded-xl cursor-pointer select-none outline-none " +
    "transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_TAB_IDLE =
    "bg-[#E7E5E4] text-[#1E2938]/50 " +
    " " +
    "hover:text-[#1E2938]/80 hover:";

const NEU_TAB_ACTIVE =
    "bg-[#E7E5E4] text-[#006666] " +
    "";

const NEU_TAB_WRAPPER =
    "rounded-2xl bg-[#E7E5E4]  border border-white/60 p-2";

const NEU_CONTENT_CARD =
    "rounded-2xl bg-[#E7E5E4]  border border-white/60";
const NEU_ACTIVE_DOT =
    "w-1 h-1 rounded-full bg-[#006666] ";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface TourDetailProps {
    tourId: string;
}

type TabValue = "details" | "reviews" | "reports" | "faqs" | "bookings";

interface Tab {
    value: TabValue;
    label: string;
    icon: React.ElementType;
    description: string;
}

const tabs: Tab[] = [
    { value: "details", label: "Details", icon: LayoutDashboard, description: "Core tour info" },
    { value: "bookings", label: "Bookings", icon: LuCalendar, description: "Manage bookings" },
    { value: "reviews", label: "Reviews", icon: MessageSquare, description: "Guest feedback" },
    { value: "reports", label: "Reports", icon: Flag, description: "Analytics" },
    { value: "faqs", label: "FAQs", icon: HelpCircle, description: "Common questions" },
];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function TourDetailPage({ tourId }: TourDetailProps) {
    const [activeTab, setActiveTab] = useState<TabValue>("details");

    const { tourDetails, fetchTourDetail } = useTourDetailStore();
    const tour = tourDetails[tourId];

    const [breadCrumbs, setBreadCrumbs] = useState<{ label: string; href: string }[]>([]);

    useEffect(() => {
        fetchTourDetail(tourId);
        setBreadCrumbs([
            { label: "Home", href: "/" },
            { label: "Tours", href: "/operations/tours" },
            {
                label: tour?.title ?? "-",
                href: `/operations/tours/${encodeURIComponent(encodeId(tour?.id ?? "-"))}`,
            },
        ]);
    }, [fetchTourDetail, tour?.id, tour?.title, tourId]);

    const contentVariants: Variants = {
        hidden: { opacity: 0, y: 16, scale: 0.985 },
        visible: {
            opacity: 1, y: 0, scale: 1,
            transition: { type: "spring", stiffness: 300, damping: 28 },
        },
        exit: {
            opacity: 0, y: -12, scale: 0.985,
            transition: { duration: 0.18, ease: "easeInOut" },
        },
    };

    return (
        <div className={cn("w-full space-y-6 overflow-x-hidden container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8", NEU_SURFACE, "min-h-screen")}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Breadcrumbs items={breadCrumbs} />
                <div className="flex items-center gap-3">
                    <Link
                        href={`/operations/tours/${encodeURIComponent(encodeId(tourId ?? "-"))}/history`}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-[#006666] text-[#006666] font-[family-name:var(--font-space-mono)] font-bold tracking-wide hover:bg-gray-50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        View History
                    </Link>
                    <Link
                        href="/operations/tours/add-tour"
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide  hover: hover:bg-[#007777] active: transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50"
                    >
                        <Plus className="w-5 h-5" />
                        Create Tour
                    </Link>
                </div>
            </div>

            {/* ── Tab Bar ── */}
            <div className={NEU_TAB_WRAPPER}>
                <div className="flex flex-wrap gap-1.5">
                    {tabs.map((tab, index) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.value;

                        return (
                            <motion.button
                                key={tab.value}
                                type="button"
                                onClick={() => setActiveTab(tab.value)}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: index * 0.055,
                                    type: "spring",
                                    stiffness: 320,
                                    damping: 26,
                                }}
                                whileTap={{ scale: 0.97 }}
                                aria-selected={isActive}
                                aria-controls={`tabpanel-${tab.value}`}
                                role="tab"
                                className={cn(
                                    NEU_TAB_BASE,
                                    isActive ? NEU_TAB_ACTIVE : NEU_TAB_IDLE
                                )}
                            >
                                {/* Icon */}
                                <div className="relative">
                                    <Icon
                                        className={cn(
                                            "h-[18px] w-[18px] transition-all duration-200",
                                            isActive
                                                ? "text-[#006666]"
                                                : "text-[#1E2938]/40 group-hover:text-[#1E2938]/70"
                                        )}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                </div>

                                {/* Label */}
                                <span
                                    className={cn(
                                        "text-xs font-bold font-[family-name:var(--font-space-mono)] tracking-wide transition-colors duration-200",
                                        isActive ? "text-[#006666]" : "text-[#1E2938]/50"
                                    )}
                                >
                                    {tab.label}
                                </span>

                                {/* Description — visible on md+ */}
                                <span
                                    className={cn(
                                        "hidden md:block text-[10px] font-[family-name:var(--font-jetbrains-mono)] text-center leading-tight transition-colors duration-200",
                                        isActive ? "text-[#006666]/60" : "text-[#1E2938]/30"
                                    )}
                                >
                                    {tab.description}
                                </span>

                                {/* Active pulse dot */}
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.span
                                            key="dot"
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className={NEU_ACTIVE_DOT}
                                        />
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* ── Content Panel ── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    id={`tabpanel-${activeTab}`}
                    role="tabpanel"
                    className={cn(NEU_CONTENT_CARD, "p-6 md:p-8 overflow-visible")}
                >
                    {activeTab === "details" && <TourCoreDetails tourId={tourId} />}
                    {activeTab === "bookings" && <TourBookingsPanel tourId={tourId} />}
                    {activeTab === "reviews" && <ReviewsPanel tourId={tourId} />}
                    {activeTab === "reports" && <ReportsPanel tourId={tourId} />}
                    {activeTab === "faqs" && <TourFaqsPanel tourId={tourId} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}