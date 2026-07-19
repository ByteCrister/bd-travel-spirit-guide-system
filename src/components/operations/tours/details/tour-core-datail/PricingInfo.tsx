"use client";

import { PAYMENT_METHOD, PaymentMethod, TOUR_DISCOUNT_TYPE } from "@/constants/tour/tour.const";
import { TourDetailDTO } from "@/types/tour/tour.types";
import { Banknote, Clock, CreditCard, Wallet, Tag, Calendar, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { FaBangladeshiTakaSign } from "react-icons/fa6";

// ─── Style Constants (Neumorphism Design System) ────────────────────────────

const NEU = {
    surface:  "bg-[#E7E5E4]",
    card:     "bg-[#E7E5E4] rounded-2xl",
    raised:   " rounded-2xl",
    raisedSm: " rounded-xl",
    inset:    " rounded-xl",
    insetSm:  " rounded-lg",
    pill:     " rounded-full",
    iconWrap: "flex items-center justify-center w-10 h-10 rounded-xl bg-[#E7E5E4] ",
    label:    "text-xs font-mono font-semibold uppercase tracking-widest text-[#006666]",
    heading:  "font-bold text-[#1E2938] font-[Space_Mono,monospace]",
    muted:    "text-sm text-[#1E2938]/50 font-[Space_Mono,monospace]",
    body:     "text-sm text-[#1E2938]/80 font-[Space_Mono,monospace]",
    divider:  "border-t border-[#1E2938]/10 my-4",
    accent:   "text-[#006666]",
} as const;

const FADE_UP = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: "easeOut", delay } as const,
});

// ────────────────────────────────────────────────────────────────────────────

interface PricingInfoProps {
    tour: TourDetailDTO;
}

const PricingInfo = ({ tour }: PricingInfoProps) => {
    const getPaymentIcon = (method: PaymentMethod) => {
        const cls = `h-4 w-4 ${NEU.accent}`;
        switch (method) {
            case PAYMENT_METHOD.CASH:          return <Banknote className={cls} />;
            case PAYMENT_METHOD.BANK_TRANSFER: return <Wallet className={cls} />;
            default:                           return <CreditCard className={cls} />;
        }
    };

    const formatDiscountValue = (type: string, value: number) => {
        if (type === TOUR_DISCOUNT_TYPE.FLAT_AMOUNT) {
            return `${value} ${tour.basePrice.currency} off`;
        }
        return `${value}% off`;
    };

    return (
        <div className={`${NEU.card} ${NEU.raised} p-1`}>
            {/* Header */}
            <div className="flex items-center gap-4 px-6 pt-6 pb-4">
                <div className={NEU.iconWrap}>
                    <FaBangladeshiTakaSign className={`h-5 w-5 ${NEU.accent}`} />
                </div>
                <div>
                    <p className={NEU.label}>Tour Info</p>
                    <h2 className={`${NEU.heading} text-xl mt-0.5`}>Pricing & Commerce</h2>
                </div>
            </div>

            <div className={`mx-4 ${NEU.divider}`} />

            {/* Body */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5">

                {/* ── Base Price & Duration ────────────────── */}
                <motion.div {...FADE_UP(0)} className={`${NEU.inset} p-5 space-y-5`}>
                    {/* Price Display */}
                    <div>
                        <p className={`${NEU.label} mb-3`}>Base Price</p>
                        <div className={`${NEU.insetSm} p-4 flex items-baseline gap-2`}>
                            <FaBangladeshiTakaSign className="h-5 w-5 text-[#006666] self-center" />
                            <span className="text-4xl font-bold font-mono text-[#006666] tracking-tight">
                                {tour.basePrice.amount.toLocaleString()}
                            </span>
                            <span className={`text-sm font-mono font-semibold text-[#1E2938]/40 uppercase`}>
                                {tour.basePrice.currency}
                            </span>
                        </div>
                    </div>

                    <div className={NEU.divider} />

                    {/* Duration */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className={`h-4 w-4 ${NEU.accent}`} />
                            <p className={NEU.label}>Duration</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center gap-1.5 px-4 py-2 ${NEU.pill} text-sm font-mono font-bold text-[#1E2938] bg-[#E7E5E4]`}>
                                {tour.duration?.days}
                                <span className="font-normal text-[#1E2938]/50">days</span>
                            </span>
                            {tour.duration?.nights && (
                                <>
                                    <span className="text-[#1E2938]/30 text-lg">·</span>
                                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 ${NEU.pill} text-sm font-mono font-bold text-[#1E2938] bg-[#E7E5E4]`}>
                                        {tour.duration.nights}
                                        <span className="font-normal text-[#1E2938]/50">nights</span>
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ── Discounts ────────────────────────────── */}
                <motion.div {...FADE_UP(0.1)} className={`${NEU.inset} p-5 space-y-4`}>
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className={`h-4 w-4 ${NEU.accent}`} />
                        <p className={NEU.label}>Discounts</p>
                    </div>

                    {tour.discounts && tour.discounts.length > 0 ? (
                        <div className="space-y-3">
                            {tour.discounts.map((discount, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 + index * 0.1 }}
                                    className={`${NEU.raisedSm} bg-[#E7E5E4] p-4 flex items-center justify-between gap-3`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-semibold text-sm text-[#1E2938] font-[Space_Mono,monospace] truncate mb-1`}>
                                            {discount.discount}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-mono text-[#FE9900] font-bold">
                                            <Tag className="h-3 w-3" />
                                            {formatDiscountValue(discount.type, discount.value)}
                                        </div>
                                    </div>
                                    {discount.code && (
                                        <span className={`flex-shrink-0 text-xs font-mono font-bold tracking-wider px-3 py-1.5 ${NEU.insetSm} text-[#006666] bg-[#E7E5E4]`}>
                                            {discount.code}
                                        </span>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className={`${NEU.insetSm} p-4 text-center`}>
                            <p className={NEU.muted}>No active discounts</p>
                        </div>
                    )}
                </motion.div>

                {/* ── Payment Methods & Departures ─────────── */}
                <motion.div {...FADE_UP(0.2)} className={`${NEU.inset} p-5 space-y-5`}>
                    {/* Payment Methods */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <CreditCard className={`h-4 w-4 ${NEU.accent}`} />
                            <p className={NEU.label}>Payment Methods</p>
                        </div>
                        {tour.paymentMethods && tour.paymentMethods.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {tour.paymentMethods.map((method) => (
                                    <span
                                        key={method}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${NEU.pill} text-xs font-mono font-semibold text-[#1E2938]/70 bg-[#E7E5E4]`}
                                    >
                                        {getPaymentIcon(method)}
                                        {method}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className={NEU.muted}>No payment methods specified</p>
                        )}
                    </div>

                    <div className={NEU.divider} />

                    {/* Departure */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar className={`h-4 w-4 ${NEU.accent}`} />
                            <p className={NEU.label}>Departure</p>
                        </div>
                        <div className="space-y-2">
                            {tour.departure ? (
                                <>
                                    <div className={`${NEU.insetSm} px-4 py-3 flex items-center justify-between`}>
                                        <span className={NEU.muted}>Departure Date</span>
                                        <span className={`text-sm font-mono font-bold text-[#1E2938] ${NEU.pill} px-3 py-1 bg-[#E7E5E4]`}>
                                            {new Date(tour.departure.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className={`${NEU.insetSm} px-4 py-3 flex items-center justify-between`}>
                                        <span className={NEU.muted}>Total Seats</span>
                                        <span className={`text-sm font-mono font-bold text-[#1E2938] ${NEU.pill} px-3 py-1 bg-[#E7E5E4]`}>
                                            {tour.departure.seatsTotal}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className={`${NEU.insetSm} px-4 py-3 text-center`}>
                                    <span className={NEU.muted}>No departure specified</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PricingInfo;