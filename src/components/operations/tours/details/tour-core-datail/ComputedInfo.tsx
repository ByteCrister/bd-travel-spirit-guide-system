"use client";

import { TourDetailDTO } from "@/types/tour/tour.types";
import { FileText, Users, TrendingUp, CheckCircle2, XCircle, Percent } from "lucide-react";
import { motion } from "framer-motion";
import { FaBangladeshiTakaSign } from "react-icons/fa6";

// ── Neumorphism Design Tokens ─────────────────────────────────
const NEU_CARD = "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM = "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_SURFACE_INSET = "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_SURFACE_INSET_SM = "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL = "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_ICON_WELL = "p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_ICON_WELL_PRIMARY = "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_DIVIDER = "border-[#1E2938]/10";
const NEU_BADGE_SUCCESS = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_DANGER = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 bg-[#FF2157]/10 text-[#FF2157] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

// Seat stat block
const STAT_BLOCK = `flex flex-col items-center gap-1 p-3 rounded-xl flex-1 ${NEU_SURFACE_INSET_SM}`;

interface ComputedInfoProps {
    tour: TourDetailDTO;
}

const ComputedInfo = ({ tour }: ComputedInfoProps) => {
    return (
        <div className={`${NEU_CARD} p-1 overflow-hidden`}>
            {/* Header */}
            <div className="px-6 py-5 rounded-2xl mb-1">
                <div className="flex items-center gap-3">
                    <div className={NEU_ICON_WELL_PRIMARY}>
                        <FileText className="h-5 w-5 text-[#006666]" />
                    </div>
                    <div>
                        <h2 className={`${NEU_HEADING} text-xl`}>Computed Information</h2>
                        <p className={`${NEU_MUTED} mt-0.5`}>Live pricing, seats & status indicators</p>
                    </div>
                </div>
                <div className={`mt-4 border-t ${NEU_DIVIDER}`} />
            </div>

            <div className="p-6 space-y-6">
                {/* Price + Booking row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Price Summary */}
                    {tour.priceSummary && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className={`${NEU_CARD_SM} p-5 space-y-4`}
                        >
                            <div className="flex items-center gap-2">
                                <div className={NEU_ICON_WELL}>
                                    <FaBangladeshiTakaSign className="h-4 w-4 text-[#006666]" />
                                </div>
                                <span className={`${NEU_HEADING} text-base`}>Price Summary</span>
                            </div>
                            <div className={`border-t ${NEU_DIVIDER}`} />

                            <div className={`${NEU_SURFACE_INSET} p-4 rounded-xl`}>
                                <p className={`${NEU_LABEL} mb-1`}>Price Range</p>
                                <p className="font-[family-name:var(--font-space-mono)] text-2xl font-bold text-[#006666] tracking-tight">
                                    {tour.priceSummary.minAmount.toLocaleString()}
                                    <span className="text-[#1E2938]/40 mx-1">–</span>
                                    {tour.priceSummary.maxAmount.toLocaleString()}
                                    <span className="text-sm ml-1 text-[#1E2938]/50">{tour.priceSummary.currency}</span>
                                </p>
                            </div>

                            {tour.priceSummary.discountedAmount && (
                                <motion.div
                                    initial={{ scale: 0.95 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="p-4 rounded-xl border border-[#FE9900]/20 bg-[#FE9900]/5 shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] space-y-1"
                                >
                                    <div className="flex items-center gap-2">
                                        <Percent className="h-4 w-4 text-[#FE9900]" />
                                        <span className={`${NEU_LABEL} text-[#FE9900]`}>Discounted Price</span>
                                    </div>
                                    <p className="font-[family-name:var(--font-space-mono)] text-xl font-bold text-[#FE9900]">
                                        {tour.priceSummary.discountedAmount.toLocaleString()}
                                        <span className="text-sm ml-1">{tour.priceSummary.currency}</span>
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* Booking Summary */}
                    {tour.bookingSummary && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className={`${NEU_CARD_SM} p-5 space-y-4`}
                        >
                            <div className="flex items-center gap-2">
                                <div className={NEU_ICON_WELL}>
                                    <Users className="h-4 w-4 text-[#006666]" />
                                </div>
                                <span className={`${NEU_HEADING} text-base`}>Booking Summary</span>
                            </div>
                            <div className={`border-t ${NEU_DIVIDER}`} />

                            {/* Seat stats */}
                            <div className="flex gap-3">
                                <div className={STAT_BLOCK}>
                                    <span className={NEU_LABEL}>Total</span>
                                    <span className="font-[family-name:var(--font-space-mono)] text-lg font-bold text-[#1E2938]">
                                        {tour.bookingSummary.totalSeats}
                                    </span>
                                </div>
                                <div className={STAT_BLOCK}>
                                    <span className={NEU_LABEL}>Booked</span>
                                    <span className="font-[family-name:var(--font-space-mono)] text-lg font-bold text-[#006666]">
                                        {tour.bookingSummary.bookedSeats}
                                    </span>
                                </div>
                                <div className={STAT_BLOCK}>
                                    <span className={NEU_LABEL}>Available</span>
                                    <span className="font-[family-name:var(--font-space-mono)] text-lg font-bold text-[#00A63D]">
                                        {tour.bookingSummary.availableSeats}
                                    </span>
                                </div>
                            </div>

                            {/* Occupancy bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className={NEU_LABEL}>Occupancy</span>
                                    <span className="font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#006666]">
                                        {tour.bookingSummary.occupancyPercentage}%
                                    </span>
                                </div>
                                {/* Custom neumorphic progress bar */}
                                <div className={`h-3 w-full rounded-full ${NEU_SURFACE_INSET_SM}`}>
                                    <div
                                        className="h-full rounded-full bg-[#006666] shadow-[2px_2px_4px_#004d4d,-1px_-1px_3px_#008080] transition-all duration-700"
                                        style={{ width: `${tour.bookingSummary.occupancyPercentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <span className={NEU_LABEL}>Status</span>
                                <span className={tour.bookingSummary.isFull ? NEU_BADGE_DANGER : NEU_BADGE_SUCCESS}>
                                    {tour.bookingSummary.isFull ? "Full" : "Available"}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Status Indicators */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                    {/* Upcoming */}
                    <div className={`${tour.isUpcoming ? "border border-[#006666]/20 bg-[#006666]/5" : "border border-[#1E2938]/10"} rounded-xl p-5 shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] space-y-2`}>
                        <div className="flex items-center gap-2">
                            {tour.isUpcoming
                                ? <CheckCircle2 className="h-5 w-5 text-[#006666]" />
                                : <XCircle className="h-5 w-5 text-[#1E2938]/30" />}
                            <span className={NEU_LABEL}>Upcoming</span>
                        </div>
                        <p className={`font-[family-name:var(--font-space-mono)] text-2xl font-bold ${tour.isUpcoming ? "text-[#006666]" : "text-[#1E2938]/30"}`}>
                            {tour.isUpcoming ? "Yes" : "No"}
                        </p>
                    </div>

                    {/* Expired */}
                    <div className={`${tour.isExpired ? "border border-[#FF2157]/20 bg-[#FF2157]/5" : "border border-[#00A63D]/20 bg-[#00A63D]/5"} rounded-xl p-5 shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] space-y-2`}>
                        <div className="flex items-center gap-2">
                            {tour.isExpired
                                ? <XCircle className="h-5 w-5 text-[#FF2157]" />
                                : <CheckCircle2 className="h-5 w-5 text-[#00A63D]" />}
                            <span className={NEU_LABEL}>Expired</span>
                        </div>
                        <p className={`font-[family-name:var(--font-space-mono)] text-2xl font-bold ${tour.isExpired ? "text-[#FF2157]" : "text-[#00A63D]"}`}>
                            {tour.isExpired ? "Yes" : "No"}
                        </p>
                    </div>

                    {/* Active Discount */}
                    <div className={`${tour.hasActiveDiscount ? "border border-[#FE9900]/20 bg-[#FE9900]/5" : "border border-[#1E2938]/10"} rounded-xl p-5 shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] space-y-2`}>
                        <div className="flex items-center gap-2">
                            {tour.hasActiveDiscount
                                ? <TrendingUp className="h-5 w-5 text-[#FE9900]" />
                                : <XCircle className="h-5 w-5 text-[#1E2938]/30" />}
                            <span className={NEU_LABEL}>Active Discount</span>
                        </div>
                        <p className={`font-[family-name:var(--font-space-mono)] text-2xl font-bold ${tour.hasActiveDiscount ? "text-[#FE9900]" : "text-[#1E2938]/30"}`}>
                            {tour.hasActiveDiscount ? "Yes" : "No"}
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ComputedInfo;