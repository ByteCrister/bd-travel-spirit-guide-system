"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    LayoutDashboard,
    MessageSquare,
    Flag,
    HelpCircle,
} from "lucide-react";

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
    "shadow-[3px_3px_7px_#c8c6c5,-3px_-3px_7px_#ffffff] " +
    "hover:text-[#1E2938]/80 hover:shadow-[4px_4px_9px_#c8c6c5,-4px_-4px_9px_#ffffff]";

const NEU_TAB_ACTIVE =
    "bg-[#E7E5E4] text-[#006666] " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff]";

const NEU_TAB_WRAPPER =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_18px_#c8c6c5,-8px_-8px_18px_#ffffff] border border-white/60 p-2";

const NEU_CONTENT_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[10px_10px_20px_#c8c6c5,-10px_-10px_20px_#ffffff] border border-white/60";
const NEU_ACTIVE_DOT =
    "w-1 h-1 rounded-full bg-[#006666] shadow-[0_0_6px_#006666]";

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
        <div className={cn("w-full space-y-6 overflow-x-hidden", NEU_SURFACE, "min-h-screen p-0")}>
            <Breadcrumbs items={breadCrumbs} />

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