"use client";

import { tourDetailErrorKey, tourDetailLoadingKey, useTourDetailStore } from "@/store/tour-detail.store";
import {
    AlertCircle, ArrowLeft, Edit, Shield, LayoutDashboard,
    MapPin, Calendar, Package, FileCheck, Archive, Trash2,
    RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TourBasicInfo from "./tour-core-datail/TourBasicInfo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BangladeshInfo from "./tour-core-datail/BangladeshInfo";
import InclusionsExclusions from "./tour-core-datail/InclusionsExclusions";
import PricingInfo from "./tour-core-datail/PricingInfo";
import LogisticsInfo from "./tour-core-datail/LogisticsInfo";
import ComplianceInfo from "./tour-core-datail/ComplianceInfo";
import ComputedInfo from "./tour-core-datail/ComputedInfo";
import ItineraryInfo from "./tour-core-datail/ItineraryInfo";
import DestinationsInfo from "./tour-core-datail/DestinationsInfo";
import { MODERATION_STATUS, TOUR_STATUS } from "@/constants/tour/tour.const";
import { motion } from "framer-motion";
import TourDetailLoading from "./skeletons/TourDetailLoading";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";
import { archiveTourApi, terminateTourApi, restoreTourApi } from "@/utils/api/tour.api";
import ModerationAlert from "./tour-core-datail/ModerationAlert";

// ─────────────────────────────────────────────────────────────
// Neumorphism Design-System Tokens
// ─────────────────────────────────────────────────────────────

// Surfaces
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4]  border border-white/60";
const NEU_CARD_HEADER =
    "rounded-t-2xl bg-[#E7E5E4] ";
const NEU_SURFACE_INSET =
    "bg-[#E7E5E4] ";
const NEU_SURFACE_INSET_SM =
    "bg-[#E7E5E4] ";

// Buttons
const NEU_BTN_PRIMARY =
    "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006666] text-white text-sm " +
    "font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
    " " +
    "hover: hover:bg-[#007777] " +
    "active: " +
    "disabled:opacity-40 disabled:cursor-not-allowed " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";

const NEU_BTN_GHOST =
    "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E7E5E4] text-[#1E2938] text-sm " +
    "font-[family-name:var(--font-space-mono)] " +
    " " +
    "hover: " +
    "active: " +
    "disabled:opacity-40 disabled:cursor-not-allowed " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_BTN_WARNING =
    "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E7E5E4] text-[#FE9900] text-sm " +
    "font-[family-name:var(--font-space-mono)] " +
    " " +
    "hover:bg-[#FE9900]/10 hover: " +
    "disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200";

const NEU_BTN_DANGER =
    "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E7E5E4] text-[#FF2157] text-sm " +
    "font-[family-name:var(--font-space-mono)] " +
    " " +
    "hover:bg-[#FF2157]/10 hover: " +
    "disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200";

const NEU_BTN_SUCCESS =
    "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E7E5E4] text-[#00A63D] text-sm " +
    "font-[family-name:var(--font-space-mono)] " +
    " " +
    "hover:bg-[#00A63D]/10 hover: " +
    "disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200";

const NEU_BTN_ICON =
    "w-10 h-10 flex items-center justify-center rounded-xl bg-[#E7E5E4] text-[#1E2938]/60 " +
    " " +
    "hover:text-[#006666] hover: " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

// Badges
const NEU_BADGE_BASE =
    "inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "";

const NEU_BADGE_SUCCESS = `${NEU_BADGE_BASE} bg-[#00A63D]/10 text-[#00A63D]`;
const NEU_BADGE_WARNING = `${NEU_BADGE_BASE} bg-[#FE9900]/10 text-[#FE9900]`;
const NEU_BADGE_DANGER  = `${NEU_BADGE_BASE} bg-[#FF2157]/10 text-[#FF2157]`;
const NEU_BADGE_PRIMARY = `${NEU_BADGE_BASE} bg-[#006666]/10 text-[#006666]`;
const NEU_BADGE_NEUTRAL = `${NEU_BADGE_BASE} bg-[#1E2938]/10 text-[#1E2938]/70`;

// Typography
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MONO =
    "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";

// Icon well
const NEU_ICON_WELL =
    "p-2 rounded-xl bg-[#E7E5E4] ";
const NEU_ICON_WELL_PRIMARY =
    "p-2 rounded-xl bg-[#006666]/10 ";

// Row item inside cards
const NEU_ROW =
    "flex justify-between items-center p-3 rounded-xl " + NEU_SURFACE_INSET_SM;

// ─────────────────────────────────────────────────────────────
// Helper: moderation-status badge
// ─────────────────────────────────────────────────────────────
function ModerationBadge({ status }: { status: string }) {
    const cls =
        status === MODERATION_STATUS.APPROVED ? NEU_BADGE_SUCCESS :
        status === MODERATION_STATUS.PENDING   ? NEU_BADGE_WARNING :
        status === MODERATION_STATUS.DENIED    ? NEU_BADGE_DANGER  :
        NEU_BADGE_NEUTRAL;
    return <span className={cls}>{status}</span>;
}

// ─────────────────────────────────────────────────────────────
// Helper: tour-status badge
// ─────────────────────────────────────────────────────────────
function TourStatusBadge({ status }: { status: string }) {
    const cls =
        status === TOUR_STATUS.ACTIVE    ? NEU_BADGE_SUCCESS :
        status === TOUR_STATUS.DRAFT     ? NEU_BADGE_PRIMARY :
        status === TOUR_STATUS.SUBMITTED ? NEU_BADGE_WARNING :
        status === TOUR_STATUS.COMPLETED ? `${NEU_BADGE_BASE} bg-purple-100 text-purple-700` :
        status === TOUR_STATUS.ARCHIVED  ? NEU_BADGE_NEUTRAL :
        NEU_BADGE_DANGER;
    return <span className={cls}>{status}</span>;
}

// ─────────────────────────────────────────────────────────────
// Tab configuration
// ─────────────────────────────────────────────────────────────
const TABS = [
    { value: "overview",     label: "Overview",     Icon: LayoutDashboard },
    { value: "itinerary",    label: "Itinerary",    Icon: Calendar },
    { value: "destinations", label: "Destinations", Icon: MapPin },
    { value: "logistics",    label: "Logistics",    Icon: Package },
    { value: "compliance",   label: "Compliance",   Icon: FileCheck },
    { value: "pricing",      label: "Pricing",      Icon: FaBangladeshiTakaSign },
] as const;

// ─────────────────────────────────────────────────────────────
// Framer-motion fade-up helper
// ─────────────────────────────────────────────────────────────
const FadeUp = ({
    children,
    delay = 0,
    className = "",
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay }}
        className={className}
    >
        {children}
    </motion.div>
);

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────
interface TourCoreDetailPageProps {
    tourId: string;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export default function TourCoreDetails({ tourId }: TourCoreDetailPageProps) {
    const router = useRouter();
    const { tourDetails, loading, error } = useTourDetailStore();
    const tour = tourDetails[tourId];

    const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
    const [archiveDialogOpen,   setArchiveDialogOpen]   = useState(false);
    const [restoreDialogOpen,   setRestoreDialogOpen]   = useState(false);
    const [terminateReason,     setTerminateReason]     = useState("");
    const [isProcessing,        setIsProcessing]        = useState(false);

    const loadingKey = tourDetailLoadingKey(tourId);
    const errorKey   = tourDetailErrorKey(tourId);

    // ── Moderation handlers ────────────────────────────────
    const handleArchive = async () => {
        if (!tour) return;
        setIsProcessing(true);
        try {
            await archiveTourApi(tourId);
            setArchiveDialogOpen(false);
        } catch (err) {
            console.error("Failed to archive tour:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleTerminate = async () => {
        if (!tour || !terminateReason.trim()) return;
        setIsProcessing(true);
        try {
            await terminateTourApi(tourId, terminateReason.trim());
            setTerminateDialogOpen(false);
            setTerminateReason("");
        } catch (err) {
            console.error("Failed to terminate tour:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRestore = async () => {
        if (!tour) return;
        setIsProcessing(true);
        try {
            await restoreTourApi(tourId);
            setRestoreDialogOpen(false);
        } catch (err) {
            console.error("Failed to restore tour:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    // ── Button visibility ─────────────────────────────────
    const showArchiveButton  = tour && [TOUR_STATUS.DRAFT, TOUR_STATUS.SUBMITTED, TOUR_STATUS.COMPLETED].includes(tour.status as never);
    const showTerminateButton = tour && tour.status === TOUR_STATUS.ACTIVE;
    const showRestoreButton   = tour && tour.status === TOUR_STATUS.ARCHIVED;
    const showEditButton      = tour && tour.status !== TOUR_STATUS.ARCHIVED;

    // ── Loading state ─────────────────────────────────────
    if (loading[loadingKey]) {
        return <TourDetailLoading />;
    }

    // ── Error state ───────────────────────────────────────
    if (error[errorKey] || !tour) {
        return (
            <div className="w-full">
                    <FadeUp>
                        <div className={`${NEU_CARD} p-6 border-l-4 border-l-[#FF2157]`}>
                            <div className="flex items-start gap-3 mb-4">
                                <div className={`${NEU_ICON_WELL} text-[#FF2157]`}>
                                    <AlertCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className={`${NEU_HEADING} text-base text-[#FF2157]`}>
                                        Error Loading Tour
                                    </p>
                                    <p className={`${NEU_MUTED} mt-1`}>
                                        {error[errorKey] || "Tour not found"}
                                    </p>
                                </div>
                            </div>
                            <button
                                className={NEU_BTN_GHOST}
                                onClick={() => router.back()}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Go Back
                            </button>
                        </div>
                    </FadeUp>
                </div>
        );
    }

    // ── Main render ───────────────────────────────────────
    return (
        <div className="w-full space-y-8">

                {/* ── Page Header ──────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                    {/* Left: back + title */}
                    <div className="flex items-center gap-3">
                        <button
                            aria-label="Go back"
                            className={NEU_BTN_ICON}
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <div>
                            <h1 className={`${NEU_HEADING} text-2xl sm:text-3xl`}>
                                Tour Details
                            </h1>
                            <p className={`${NEU_MUTED} mt-0.5`}>
                                {tour.tourCode && (
                                    <span className={`${NEU_BADGE_PRIMARY} mr-2`}>{tour.tourCode}</span>
                                )}
                                {tour.title ?? "–"}
                            </p>
                        </div>
                    </div>

                    {/* Right: action buttons */}
                    <div className="flex flex-wrap gap-2">
                        {showArchiveButton && (
                            <button
                                className={NEU_BTN_WARNING}
                                disabled={isProcessing}
                                onClick={() => setArchiveDialogOpen(true)}
                            >
                                <Archive className="h-4 w-4" />
                                Archive
                            </button>
                        )}
                        {showTerminateButton && (
                            <button
                                className={NEU_BTN_DANGER}
                                disabled={isProcessing}
                                onClick={() => setTerminateDialogOpen(true)}
                            >
                                <Trash2 className="h-4 w-4" />
                                Terminate
                            </button>
                        )}
                        {showRestoreButton && (
                            <button
                                className={NEU_BTN_SUCCESS}
                                disabled={isProcessing}
                                onClick={() => setRestoreDialogOpen(true)}
                            >
                                <RotateCcw className="h-4 w-4" />
                                Restore
                            </button>
                        )}
                        {showEditButton && (
                            <button
                                className={NEU_BTN_PRIMARY}
                                onClick={() =>
                                    router.push(`/operations/tours/${encodeURIComponent(encodeId(tourId))}/update-tour`)
                                }
                            >
                                <Edit className="h-4 w-4" />
                                Edit Tour
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* ── Moderation Dialogs ────────────────────────── */}
                <ModerationAlert
                    open={terminateDialogOpen}
                    onOpenChange={setTerminateDialogOpen}
                    title="Terminate Tour"
                    description="Are you sure you want to terminate this tour? This action cannot be undone. Please provide a reason for termination."
                    confirmText="Confirm Termination"
                    variant="destructive"
                    onConfirm={handleTerminate}
                    isProcessing={isProcessing}
                    requireReason={true}
                    reason={terminateReason}
                    onReasonChange={setTerminateReason}
                />
                <ModerationAlert
                    open={archiveDialogOpen}
                    onOpenChange={setArchiveDialogOpen}
                    title="Archive Tour"
                    description="Are you sure you want to archive this tour? The tour will be moved to the archived section and will no longer be visible to users."
                    confirmText="Archive Tour"
                    variant="warning"
                    onConfirm={handleArchive}
                    isProcessing={isProcessing}
                    requireReason={false}
                />
                <ModerationAlert
                    open={restoreDialogOpen}
                    onOpenChange={setRestoreDialogOpen}
                    title="Restore Tour"
                    description="Are you sure you want to restore this tour? The tour will be moved from the archived section and become available again."
                    confirmText="Restore Tour"
                    variant="success"
                    onConfirm={handleRestore}
                    isProcessing={isProcessing}
                    requireReason={false}
                />

                {/* ── Basic Info ────────────────────────────────── */}
                <FadeUp delay={0.1}>
                    <TourBasicInfo tour={tour} />
                </FadeUp>

                {/* ── Tabs ──────────────────────────────────────── */}
                <FadeUp delay={0.2}>
                    <Tabs defaultValue="overview" className="w-full">
                        {/* Tab bar */}
                        <div className={`${NEU_SURFACE_INSET} rounded-2xl p-1.5`}>
                            <TabsList className="flex flex-wrap gap-1 bg-transparent h-auto p-0 w-full">
                                {TABS.map(({ value, label, Icon }) => (
                                    <TabsTrigger
                                        key={value}
                                        value={value}
                                        className={
                                            "flex-1 min-w-[80px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl " +
                                            "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 " +
                                            "transition-all duration-200 " +
                                            "data-[state=active]:bg-[#E7E5E4] " +
                                            "data-[state=active]: " +
                                            "data-[state=active]:text-[#006666] " +
                                            "hover:text-[#1E2938] " +
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40"
                                        }
                                    >
                                        <Icon className="h-3.5 w-3.5 shrink-0" />
                                        <span className="hidden sm:inline">{label}</span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        {/* ── Overview tab ─────────────────────── */}
                        <TabsContent value="overview" className="space-y-6 mt-6">
                            <FadeUp delay={0}><BangladeshInfo tour={tour} /></FadeUp>
                            <FadeUp delay={0.08}><InclusionsExclusions tour={tour} /></FadeUp>
                            <FadeUp delay={0.12}><PricingInfo tour={tour} /></FadeUp>
                            <FadeUp delay={0.16}><LogisticsInfo tour={tour} /></FadeUp>
                            <FadeUp delay={0.20}><ComplianceInfo tour={tour} /></FadeUp>
                            <FadeUp delay={0.24}><ComputedInfo tour={tour} /></FadeUp>
                        </TabsContent>

                        {/* ── Itinerary tab ─────────────────────── */}
                        <TabsContent value="itinerary" className="space-y-6 mt-6">
                            <FadeUp delay={0}><ItineraryInfo tour={tour} /></FadeUp>
                            <FadeUp delay={0.08}><InclusionsExclusions tour={tour} /></FadeUp>
                        </TabsContent>

                        {/* ── Destinations tab ──────────────────── */}
                        <TabsContent value="destinations" className="space-y-6 mt-6">
                            <FadeUp delay={0}><DestinationsInfo tour={tour} /></FadeUp>
                            <FadeUp delay={0.08}><ComplianceInfo tour={tour} /></FadeUp>
                        </TabsContent>

                        {/* ── Logistics tab ─────────────────────── */}
                        <TabsContent value="logistics" className="space-y-6 mt-6">
                            <FadeUp delay={0}><LogisticsInfo tour={tour} /></FadeUp>
                            <FadeUp delay={0.08}><ComplianceInfo tour={tour} /></FadeUp>
                            <FadeUp delay={0.12}><InclusionsExclusions tour={tour} /></FadeUp>
                        </TabsContent>

                        {/* ── Compliance tab ────────────────────── */}
                        <TabsContent value="compliance" className="space-y-6 mt-6">
                            <FadeUp delay={0}><ComplianceInfo tour={tour} /></FadeUp>
                            <FadeUp delay={0.08}><BangladeshInfo tour={tour} /></FadeUp>
                            <FadeUp delay={0.12}><LogisticsInfo tour={tour} /></FadeUp>
                        </TabsContent>

                        {/* ── Pricing tab ───────────────────────── */}
                        <TabsContent value="pricing" className="space-y-6 mt-6">
                            <FadeUp delay={0}><PricingInfo tour={tour} /></FadeUp>
                            <FadeUp delay={0.08}><ComputedInfo tour={tour} /></FadeUp>
                            <FadeUp delay={0.12}><InclusionsExclusions tour={tour} /></FadeUp>
                        </TabsContent>
                    </Tabs>
                </FadeUp>

                {/* ── Moderation & System Info card ─────────────── */}
                <FadeUp delay={0.3}>
                    <div className={NEU_CARD}>
                        {/* Card header */}
                        <div className={`${NEU_CARD_HEADER} px-6 py-4 flex items-center gap-3`}>
                            <div className={NEU_ICON_WELL_PRIMARY}>
                                <Shield className="h-4 w-4 text-[#006666]" />
                            </div>
                            <h2 className={`${NEU_HEADING} text-lg`}>
                                Moderation &amp; System Information
                            </h2>
                        </div>

                        {/* Card body */}
                        <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* ── Moderation column ─────────────── */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={NEU_ICON_WELL}>
                                        <Shield className="h-3.5 w-3.5 text-[#1E2938]/60" />
                                    </div>
                                    <span className={NEU_LABEL}>Moderation Details</span>
                                </div>

                                <div className={NEU_ROW}>
                                    <span className={`${NEU_MUTED} font-medium`}>Status</span>
                                    <ModerationBadge status={tour.moderationStatus} />
                                </div>

                                {tour.rejectionReason && (
                                    <div className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3 flex flex-col gap-1`}>
                                        <span className={`${NEU_LABEL} text-[#FF2157]`}>Rejection Reason</span>
                                        <span className={`${NEU_MONO} text-sm`}>{tour.rejectionReason}</span>
                                    </div>
                                )}

                                {tour.completedAt && (
                                    <div className={NEU_ROW}>
                                        <span className={`${NEU_MUTED} font-medium`}>Completed At</span>
                                        <span className={`${NEU_MONO} text-sm`}>
                                            {new Date(tour.completedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}

                                {tour.reApprovalRequestedAt && (
                                    <div className={NEU_ROW}>
                                        <span className={`${NEU_MUTED} font-medium`}>Re-approval Requested</span>
                                        <span className={`${NEU_MONO} text-sm`}>
                                            {new Date(tour.reApprovalRequestedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* ── System column ─────────────────── */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={NEU_ICON_WELL}>
                                        <LayoutDashboard className="h-3.5 w-3.5 text-[#1E2938]/60" />
                                    </div>
                                    <span className={NEU_LABEL}>System Information</span>
                                </div>

                                <div className={NEU_ROW}>
                                    <span className={`${NEU_MUTED} font-medium`}>Tour Status</span>
                                    <TourStatusBadge status={tour.status} />
                                </div>

                                <div className={NEU_ROW}>
                                    <span className={`${NEU_MUTED} font-medium`}>Tour Code</span>
                                    <span className={`${NEU_BADGE_NEUTRAL} font-mono tracking-wide`}>
                                        {tour.tourCode || "N/A"}
                                    </span>
                                </div>

                                <div className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3 flex flex-col gap-2`}>
                                    <span className={NEU_LABEL}>Tags</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {tour.tags && tour.tags.length > 0 ? (
                                            tour.tags.map((tag, index) => (
                                                <span key={`${tag}-${index}`} className={NEU_BADGE_NEUTRAL}>{tag}</span>
                                            ))
                                        ) : (
                                            <span className={NEU_MUTED}>No tags</span>
                                        )}
                                    </div>
                                </div>

                                {tour.deletedAt && (
                                    <div className="flex justify-between items-center p-3 rounded-xl bg-[#FF2157]/5  border border-[#FF2157]/20">
                                        <span className={`${NEU_MUTED} font-medium`}>Deleted At</span>
                                        <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm font-semibold text-[#FF2157]">
                                            {new Date(tour.deletedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}

                                <div className={NEU_ROW}>
                                    <span className={`${NEU_MUTED} font-medium`}>SEO Title</span>
                                    <span className={`${NEU_MONO} text-sm max-w-[14rem] truncate text-right`}>
                                        {tour.seo?.metaTitle || "Not set"}
                                    </span>
                                </div>

                                <div className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3 flex flex-col gap-1`}>
                                    <span className={NEU_LABEL}>SEO Description</span>
                                    <span className={`${NEU_MONO} text-xs line-clamp-2`}>
                                        {tour.seo?.metaDescription || "Not set"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Card footer */}
                        <div className="px-6 py-3 rounded-b-2xl border-t border-[#1E2938]/10 flex items-center gap-2">
                            <div className={NEU_ICON_WELL}>
                                <Calendar className="h-3 w-3 text-[#1E2938]/50" />
                            </div>
                            <span className={`${NEU_MUTED} text-xs`}>
                                Last updated: {new Date(tour.updatedAt).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </FadeUp>

            </div>
    );
}