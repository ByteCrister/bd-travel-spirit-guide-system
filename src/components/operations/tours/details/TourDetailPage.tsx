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
import TourFaqs from "./TourFaqs";
import TourCoreDetails from "./TourCoreDetails";
import { useTourDetailStore } from "@/store/tour-detail.store";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";
import { LuCalendar } from "react-icons/lu";
import TourBookingsPanel from "./TourBookingsPanel";

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
    { value: "details", label: "Details", icon: LayoutDashboard, description: "Core tour information" },
    { value: "bookings", label: "Bookings", icon: LuCalendar, description: "Manage bookings" },
    { value: "reviews", label: "Reviews", icon: MessageSquare, description: "Guest feedback" },
    { value: "reports", label: "Reports", icon: Flag, description: "Analytics & reports" },
    { value: "faqs", label: "FAQs", icon: HelpCircle, description: "Common questions" },
];

export default function TourDetailPage({ tourId }: TourDetailProps) {
    const [activeTab, setActiveTab] = useState<TabValue>("details");
    const [hoveredTab, setHoveredTab] = useState<TabValue | null>(null);

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
        hidden: { opacity: 0, y: 20, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: "spring", stiffness: 280, damping: 28 },
        },
        exit: {
            opacity: 0,
            y: -20,
            scale: 0.98,
            transition: { duration: 0.2, ease: "easeInOut" },
        },
    };

    return (
        <div className="w-full space-y-6 overflow-x-hidden">
            <Breadcrumbs items={breadCrumbs} />

            {/* ================= Enhanced Modern Tabs ================= */}
            <div className="relative">
                {/* Subtle glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 blur-xl opacity-60" />

                <div className="relative bg-gradient-to-br from-background via-card to-background border border-border/40 rounded-2xl shadow-2xl shadow-black/5 p-1.5">
                    {/* Glass morphism overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-2xl pointer-events-none" />

                    <div className="relative flex flex-wrap gap-1 p-1">
                        {tabs.map((tab, index) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.value;
                            const isHovered = hoveredTab === tab.value;

                            return (
                                <motion.button
                                    key={tab.value}
                                    onClick={() => setActiveTab(tab.value)}
                                    onHoverStart={() => setHoveredTab(tab.value)}
                                    onHoverEnd={() => setHoveredTab(null)}
                                    className="relative flex-1 group min-w-[100px] max-w-[200px]"
                                    initial={{ opacity: 0, y: -15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: index * 0.06,
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 25
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {/* Active background with gradient */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-xl border border-primary/20 shadow-lg shadow-primary/10"
                                            transition={{
                                                type: "spring",
                                                stiffness: 380,
                                                damping: 30
                                            }}
                                        />
                                    )}

                                    {/* Hover background */}
                                    {!isActive && isHovered && (
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    )}

                                    {/* Content */}
                                    <div className="relative z-10 flex flex-col items-center justify-center gap-2 px-4 py-3.5 rounded-xl overflow-hidden">
                                        {/* Icon with animated background */}
                                        <div className="relative">
                                            {isActive && (
                                                <motion.div
                                                    className="absolute inset-0 bg-primary/20 rounded-full blur-md"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1.5 }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            )}
                                            <Icon
                                                className={`h-5 w-5 transition-all duration-200 relative z-10 ${isActive
                                                        ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]"
                                                        : isHovered
                                                            ? "text-foreground/90"
                                                            : "text-muted-foreground"
                                                    }`}
                                                strokeWidth={isActive ? 2.5 : 2}
                                            />
                                        </div>

                                        {/* Label */}
                                        <span
                                            className={`text-sm font-semibold transition-all duration-200 ${isActive
                                                    ? "text-foreground"
                                                    : isHovered
                                                        ? "text-foreground/90"
                                                        : "text-muted-foreground"
                                                }`}
                                        >
                                            {tab.label}
                                        </span>

                                        {/* Description - shown on hover or active */}
                                        <AnimatePresence>
                                            {(isHovered || isActive) && (
                                                <motion.span
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="text-[10px] text-muted-foreground/80 text-center leading-tight hidden md:block max-w-[140px]"
                                                >
                                                    {tab.description}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>

                                        {/* Active indicator line */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeIndicator"
                                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 380,
                                                    damping: 30
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Shimmer effect on hover */}
                                    {isHovered && !isActive && (
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                            initial={{ x: "-100%" }}
                                            animate={{ x: "100%" }}
                                            transition={{
                                                duration: 0.6,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ================= Content ================= */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="relative"
                >
                    <div className="relative bg-card/90 rounded-xl border border-border/50 shadow-xl">
                        <div className="relative p-8 md:p-10 overflow-visible">
                            {activeTab === "details" && <TourCoreDetails tourId={tourId} />}
                            {activeTab === "reviews" && <ReviewsPanel tourId={tourId} />}
                            {activeTab === "reports" && <ReportsPanel tourId={tourId} />}
                            {activeTab === "faqs" && <TourFaqs tourId={tourId} />}
                            {activeTab === "bookings" && <TourBookingsPanel tourId={tourId} />}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}