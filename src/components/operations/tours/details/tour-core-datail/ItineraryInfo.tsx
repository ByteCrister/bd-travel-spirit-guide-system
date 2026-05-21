"use client";

import { TRANSPORT_MODE, TransportMode } from "@/constants/tour/tour.const";
import { TourDetailDTO } from "@/types/tour/tour.types";
import {
    Bus, Calendar, Car, Compass, Home,
    Navigation, Plane, Ship, Train, Utensils, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

// ── Neumorphism Design Tokens ─────────────────────────────────
const NEU_CARD = "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM = "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_SURFACE_INSET = "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_SURFACE_INSET_SM = "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL = "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_ICON_WELL = "p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_ICON_WELL_PRIMARY = "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_DIVIDER = "border-[#1E2938]/10";
const NEU_BADGE_PRIMARY = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_WARNING = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 bg-[#E7E5E4] text-[#1E2938] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const DETAIL_PILL = `flex items-start gap-3 p-3 rounded-xl ${NEU_SURFACE_INSET_SM}`;

interface ItineraryInfoProps {
    tour: TourDetailDTO;
}

const ItineraryInfo = ({ tour }: ItineraryInfoProps) => {
    const getTransportIcon = (mode?: TransportMode) => {
        switch (mode) {
            case TRANSPORT_MODE.BUS: return <Bus className="h-4 w-4" />;
            case TRANSPORT_MODE.TRAIN: return <Train className="h-4 w-4" />;
            case TRANSPORT_MODE.DOMESTIC_FLIGHT: return <Plane className="h-4 w-4" />;
            case TRANSPORT_MODE.BOAT: return <Ship className="h-4 w-4" />;
            case TRANSPORT_MODE.PRIVATE_CAR: return <Car className="h-4 w-4" />;
            default: return <Navigation className="h-4 w-4" />;
        }
    };

    return (
        <div className={`${NEU_CARD} p-1 overflow-hidden`}>
            {/* Header */}
            <div className="px-6 py-5 rounded-2xl mb-1">
                <div className="flex items-center gap-3">
                    <div className={NEU_ICON_WELL_PRIMARY}>
                        <Calendar className="h-5 w-5 text-[#006666]" />
                    </div>
                    <div className="flex items-center gap-3">
                        <h2 className={`${NEU_HEADING} text-xl`}>Itinerary</h2>
                        <span className={NEU_BADGE_PRIMARY}>
                            {tour.itinerary?.length || 0} days
                        </span>
                    </div>
                </div>
                <div className={`mt-4 border-t ${NEU_DIVIDER}`} />
            </div>

            <div className="px-6 pb-6">
                {tour.itinerary && tour.itinerary.length > 0 ? (
                    <div className="space-y-6">
                        {tour.itinerary.map((day, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.08 }}
                                className="relative flex gap-4"
                            >
                                {/* Timeline stem */}
                                <div className="flex flex-col items-center">
                                    {/* Day dot — neumorphic raised circle */}
                                    <div className="w-12 h-12 rounded-full bg-[#006666] flex items-center justify-center shrink-0 shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] z-10">
                                        <span className="font-[family-name:var(--font-space-mono)] font-bold text-white text-sm">
                                            {day.day}
                                        </span>
                                    </div>
                                    {/* Connector line */}
                                    {index < tour.itinerary!.length - 1 && (
                                        <div className="flex-1 w-0.5 mt-2 bg-gradient-to-b from-[#006666]/40 to-transparent min-h-[24px]" />
                                    )}
                                </div>

                                {/* Day card */}
                                <div className="flex-1 pb-2">
                                    <div className={`${NEU_CARD_SM} p-5 space-y-4 hover:shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff] hover:-translate-y-0.5 transition-all duration-300`}>
                                        {/* Day title row */}
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <h3 className={`${NEU_HEADING} text-base`}>{day.title}</h3>
                                            <span className={NEU_BADGE_PRIMARY}>Day {day.day}</span>
                                        </div>

                                        {/* Description */}
                                        <p className={`${NEU_MUTED} leading-relaxed`}>{day.description}</p>

                                        <div className={`border-t ${NEU_DIVIDER}`} />

                                        {/* Detail grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {day.accommodation && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.97 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.15 }}
                                                    className={DETAIL_PILL}
                                                >
                                                    <div className={NEU_ICON_WELL}>
                                                        <Home className="h-4 w-4 text-[#006666]" />
                                                    </div>
                                                    <div>
                                                        <p className={`${NEU_LABEL} mb-1`}>Accommodation</p>
                                                        <p className={`${NEU_MONO} text-sm font-medium`}>{day.accommodation}</p>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {day.mealsProvided && day.mealsProvided.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.97 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.2 }}
                                                    className={DETAIL_PILL}
                                                >
                                                    <div className={NEU_ICON_WELL}>
                                                        <Utensils className="h-4 w-4 text-[#006666]" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`${NEU_LABEL} mb-2`}>Meals Provided</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {day.mealsProvided.map((meal) => (
                                                                <span key={meal} className={NEU_BADGE_WARNING}>{meal}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {day.travelMode && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.97 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.25 }}
                                                    className={DETAIL_PILL}
                                                >
                                                    <div className={NEU_ICON_WELL}>
                                                        <span className="text-[#006666]">{getTransportIcon(day.travelMode)}</span>
                                                    </div>
                                                    <div>
                                                        <p className={`${NEU_LABEL} mb-1`}>Transport</p>
                                                        <p className={`${NEU_MONO} text-sm font-medium`}>{day.travelMode}</p>
                                                        {(day.travelDistance || day.estimatedTime) && (
                                                            <p className={`${NEU_MUTED} text-xs mt-1`}>
                                                                {day.travelDistance}
                                                                {day.travelDistance && day.estimatedTime && " · "}
                                                                {day.estimatedTime}
                                                            </p>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {day.activities && day.activities.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.97 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                    className={`${DETAIL_PILL} md:col-span-2`}
                                                >
                                                    <div className={NEU_ICON_WELL}>
                                                        <Compass className="h-4 w-4 text-[#006666]" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`${NEU_LABEL} mb-2`}>Activities</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {day.activities.map((activity, idx) => (
                                                                <span key={idx} className={NEU_BADGE}>{activity}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Important notes */}
                                        {day.importantNotes && day.importantNotes.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.35 }}
                                                className="p-4 rounded-xl border border-[#FE9900]/20 bg-[#FE9900]/5 shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] space-y-2"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="h-4 w-4 text-[#FE9900]" />
                                                    <span className="font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#FE9900] uppercase tracking-widest">
                                                        Important Notes
                                                    </span>
                                                </div>
                                                <ul className="space-y-1 pl-1">
                                                    {day.importantNotes.map((note, idx) => (
                                                        <li key={idx} className="flex items-start gap-2">
                                                            <span className="text-[#FE9900] mt-1 shrink-0">·</span>
                                                            <span className={`${NEU_MUTED} text-xs leading-relaxed`}>{note}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`flex flex-col items-center gap-3 py-16 rounded-2xl ${NEU_SURFACE_INSET}`}
                    >
                        <div className={`${NEU_ICON_WELL} p-5`}>
                            <Calendar className="h-10 w-10 text-[#1E2938]/25" />
                        </div>
                        <p className={`${NEU_HEADING} text-base text-[#1E2938]/40`}>No itinerary available</p>
                        <p className={NEU_MUTED}>Day-by-day plan will appear here once added.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ItineraryInfo;