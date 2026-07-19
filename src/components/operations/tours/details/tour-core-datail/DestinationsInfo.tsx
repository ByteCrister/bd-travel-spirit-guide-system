"use client";

import { TourDetailDTO } from "@/types/tour/tour.types";
import {
    MapPin, Navigation, Clock, Star, Building, Globe,
    ExternalLink, Award, Lightbulb, Map, Sparkles,
    Image as ImageIcon
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaBangladeshiTakaSign } from "react-icons/fa6";

// ── Neumorphism Design Tokens ─────────────────────────────────
const NEU_CARD = "rounded-2xl bg-[#E7E5E4]  border border-white/60";
const NEU_CARD_SM = "rounded-xl bg-[#E7E5E4]  border border-white/60";
const NEU_CARD_HOVER = "hover: hover:-translate-y-0.5 transition-all duration-300";
const NEU_SURFACE_RAISED = "bg-[#E7E5E4] ";
const NEU_SURFACE_INSET = "bg-[#E7E5E4] ";
const NEU_SURFACE_INSET_SM = "bg-[#E7E5E4] ";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL = "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_ICON_WELL = "p-2.5 rounded-xl bg-[#E7E5E4] ";
const NEU_ICON_WELL_PRIMARY = "p-2.5 rounded-xl bg-[#006666]/10 ";
const NEU_DIVIDER = "border-[#1E2938]/10";
const NEU_BADGE = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 bg-[#E7E5E4] text-[#1E2938] ";
const NEU_BADGE_PRIMARY = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 bg-[#006666]/10 text-[#006666] ";
const NEU_BADGE_WARNING = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 bg-[#FE9900]/10 text-[#FE9900] ";

// Detail pill inside attraction/activity card
const DETAIL_PILL = `flex items-start gap-2 p-2.5 rounded-xl ${NEU_SURFACE_INSET_SM}`;

interface DestinationsInfoProps {
    tour: TourDetailDTO;
}

const DestinationsInfo = ({ tour }: DestinationsInfoProps) => {
    return (
        <div className={`${NEU_CARD} p-1 overflow-hidden`}>
            {/* Header */}
            <div className="px-6 py-5 rounded-2xl mb-1">
                <div className="flex items-center gap-3">
                    <div className={NEU_ICON_WELL_PRIMARY}>
                        <MapPin className="h-5 w-5 text-[#006666]" />
                    </div>
                    <div className="flex items-center gap-3">
                        <h2 className={`${NEU_HEADING} text-xl`}>Destinations</h2>
                        <span className={NEU_BADGE_PRIMARY}>{tour.destinations?.length || 0}</span>
                    </div>
                </div>
                <div className={`mt-4 border-t ${NEU_DIVIDER}`} />
            </div>

            <div className="p-6">
                {tour.destinations && tour.destinations.length > 0 ? (
                    <div className="space-y-8">
                        {tour.destinations.map((destination, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className={`${NEU_CARD_SM} p-6 space-y-5`}
                            >
                                {/* Destination header */}
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className={NEU_ICON_WELL}>
                                                <MapPin className="h-4 w-4 text-[#006666]" />
                                            </div>
                                            <h3 className={`${NEU_HEADING} text-lg`}>Destination {index + 1}</h3>
                                        </div>
                                        {destination.coordinates && (
                                            <div className="flex items-center gap-1.5 ml-11">
                                                <Map className="h-3 w-3 text-[#1E2938]/40" />
                                                <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40">
                                                    {destination.coordinates.lat.toFixed(6)}, {destination.coordinates.lng.toFixed(6)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {destination.coordinates && (
                                        <span className={NEU_BADGE_PRIMARY}>
                                            <Navigation className="h-3 w-3" />
                                            GPS Enabled
                                        </span>
                                    )}
                                </div>

                                <div className={`border-t ${NEU_DIVIDER}`} />

                                {/* Description */}
                                {destination.description && (
                                    <div className={`${NEU_SURFACE_INSET} p-4 rounded-xl border-l-4 border-[#006666]`}>
                                        <p className={`${NEU_MUTED} leading-relaxed`}>{destination.description}</p>
                                    </div>
                                )}

                                {/* Highlights */}
                                {destination.highlights && destination.highlights.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-[#FE9900]" />
                                            <span className={`${NEU_HEADING} text-sm`}>Highlights</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {destination.highlights.map((h, idx) => (
                                                <span key={idx} className={NEU_BADGE_WARNING}>
                                                    <Award className="h-3 w-3" />
                                                    {h}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Attractions & Activities */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Attractions */}
                                    {destination.attractions && destination.attractions.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Building className="h-4 w-4 text-[#006666]" />
                                                <span className={`${NEU_HEADING} text-sm`}>Attractions</span>
                                                <span className={`ml-1 ${NEU_BADGE}`}>{destination.attractions.length}</span>
                                            </div>
                                            <div className="space-y-3">
                                                {destination.attractions.map((attraction, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, scale: 0.97 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.05 * idx }}
                                                        className={`${NEU_SURFACE_RAISED} p-4 rounded-xl space-y-3 ${NEU_CARD_HOVER}`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className={`${NEU_MONO} text-sm font-semibold`}>{attraction.title}</span>
                                                            {attraction.coordinates && (
                                                                <Navigation className="h-4 w-4 text-[#1E2938]/30 shrink-0" />
                                                            )}
                                                        </div>
                                                        {attraction.description && (
                                                            <p className={`${NEU_MUTED} text-xs leading-relaxed`}>{attraction.description}</p>
                                                        )}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {attraction.bestFor && (
                                                                <div className={DETAIL_PILL}>
                                                                    <Award className="h-3 w-3 text-[#006666] shrink-0 mt-0.5" />
                                                                    <div>
                                                                        <p className={`${NEU_LABEL} text-[10px]`}>Best for</p>
                                                                        <p className={`${NEU_MONO} text-xs font-medium`}>{attraction.bestFor}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {attraction.insiderTip && (
                                                                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#FE9900]/5 border border-[#FE9900]/20 ">
                                                                    <Lightbulb className="h-3 w-3 text-[#FE9900] shrink-0 mt-0.5" />
                                                                    <div>
                                                                        <p className="font-[family-name:var(--font-space-mono)] text-[10px] font-bold text-[#FE9900] uppercase tracking-widest">Insider Tip</p>
                                                                        <p className={`${NEU_MUTED} text-xs`}>{attraction.insiderTip}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {attraction.address && (
                                                                <div className={DETAIL_PILL}>
                                                                    <MapPin className="h-3 w-3 text-[#006666] shrink-0 mt-0.5" />
                                                                    <div className="min-w-0">
                                                                        <p className={`${NEU_LABEL} text-[10px]`}>Address</p>
                                                                        <p className={`${NEU_MONO} text-xs font-medium truncate`}>{attraction.address}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {attraction.openingHours && (
                                                                <div className={DETAIL_PILL}>
                                                                    <Clock className="h-3 w-3 text-[#006666] shrink-0 mt-0.5" />
                                                                    <div>
                                                                        <p className={`${NEU_LABEL} text-[10px]`}>Hours</p>
                                                                        <p className={`${NEU_MONO} text-xs font-medium`}>{attraction.openingHours}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {attraction.imageIds && attraction.imageIds.length > 0 && (
                                                            <div className="pt-2 border-t border-[#1E2938]/10">
                                                                <p className={`${NEU_LABEL} text-[10px] mb-2 flex items-center gap-1`}>
                                                                    <ImageIcon className="h-3 w-3" />
                                                                    Photos ({attraction.imageIds.length})
                                                                </p>
                                                                <div className="flex gap-2 overflow-x-auto pb-1">
                                                                    {attraction.imageIds.map((image, imgIdx) => (
                                                                        <motion.div
                                                                            key={image.id}
                                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                                            animate={{ opacity: 1, scale: 1 }}
                                                                            transition={{ delay: 0.05 * imgIdx }}
                                                                            className="relative w-20 h-20 rounded-xl shrink-0 overflow-hidden  hover: transition-all group cursor-pointer"
                                                                        >
                                                                            <Image
                                                                                src={image.url}
                                                                                alt={`${attraction.title} image ${imgIdx + 1}`}
                                                                                fill
                                                                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                                                sizes="80px"
                                                                            />
                                                                        </motion.div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Activities */}
                                    {destination.activities && destination.activities.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-[#006666]" />
                                                <span className={`${NEU_HEADING} text-sm`}>Activities</span>
                                                <span className={`ml-1 ${NEU_BADGE}`}>{destination.activities.length}</span>
                                            </div>
                                            <div className="space-y-3">
                                                {destination.activities.map((activity, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, scale: 0.97 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.05 * idx }}
                                                        className={`${NEU_SURFACE_RAISED} p-4 rounded-xl space-y-3 ${NEU_CARD_HOVER}`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className={`${NEU_MONO} text-sm font-semibold`}>{activity.title}</span>
                                                            {activity.url && (
                                                                <a
                                                                    href={activity.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="p-1.5 rounded-lg text-[#006666]  hover: transition-all"
                                                                >
                                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                                </a>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {activity.provider && (
                                                                <div className={DETAIL_PILL}>
                                                                    <Building className="h-3 w-3 text-[#006666] shrink-0 mt-0.5" />
                                                                    <div className="min-w-0">
                                                                        <p className={`${NEU_LABEL} text-[10px]`}>Provider</p>
                                                                        <p className={`${NEU_MONO} text-xs font-medium truncate`}>{activity.provider}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {activity.duration && (
                                                                <div className={DETAIL_PILL}>
                                                                    <Clock className="h-3 w-3 text-[#006666] shrink-0 mt-0.5" />
                                                                    <div>
                                                                        <p className={`${NEU_LABEL} text-[10px]`}>Duration</p>
                                                                        <p className={`${NEU_MONO} text-xs font-medium`}>{activity.duration}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {activity.price && (
                                                                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#00A63D]/5 border border-[#00A63D]/20 ">
                                                                    <FaBangladeshiTakaSign className="h-3 w-3 text-[#00A63D] shrink-0 mt-0.5" />
                                                                    <div>
                                                                        <p className="font-[family-name:var(--font-space-mono)] text-[10px] font-bold text-[#00A63D] uppercase tracking-widest">Price</p>
                                                                        <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs font-semibold text-[#00A63D]">
                                                                            {activity.price.amount} {activity.price.currency}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {activity.rating && (
                                                                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#FE9900]/5 border border-[#FE9900]/20 ">
                                                                    <Star className="h-3 w-3 text-[#FE9900] fill-[#FE9900] shrink-0 mt-0.5" />
                                                                    <div>
                                                                        <p className="font-[family-name:var(--font-space-mono)] text-[10px] font-bold text-[#FE9900] uppercase tracking-widest">Rating</p>
                                                                        <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs font-semibold text-[#FE9900]">
                                                                            {activity.rating.toFixed(1)}/5
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Destination Images */}
                                {destination.imageIds && destination.imageIds.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className={`pt-5 border-t ${NEU_DIVIDER} space-y-3`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <ImageIcon className="h-4 w-4 text-[#006666]" />
                                            <span className={`${NEU_HEADING} text-sm`}>Destination Photos</span>
                                            <span className={`ml-1 ${NEU_BADGE}`}>{destination.imageIds.length}</span>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {destination.imageIds.map((image, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.05 * idx }}
                                                    className="relative aspect-square rounded-xl overflow-hidden  hover: hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
                                                >
                                                    <Image
                                                        src={image.url}
                                                        alt={`Destination ${index + 1} image ${idx + 1}`}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                        sizes="(max-width: 640px) 50vw, 25vw"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E2938]/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="absolute bottom-0 left-0 right-0 p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="font-[family-name:var(--font-space-mono)] text-white text-xs font-bold">
                                                            {idx + 1}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Summary Stats */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className={`pt-5 border-t ${NEU_DIVIDER} grid grid-cols-2 sm:grid-cols-4 gap-3`}
                                >
                                    {[
                                        { label: "Attractions", value: destination.attractions?.length || 0, color: "text-[#006666]" },
                                        { label: "Activities", value: destination.activities?.length || 0, color: "text-[#006666]" },
                                        { label: "Highlights", value: destination.highlights?.length || 0, color: "text-[#FE9900]" },
                                        { label: "Images", value: destination.imageIds?.length || 0, color: "text-[#1E2938]" },
                                    ].map(({ label, value, color }) => (
                                        <div key={label} className={`${NEU_SURFACE_INSET_SM} rounded-xl p-4 text-center`}>
                                            <p className={`font-[family-name:var(--font-space-mono)] text-2xl font-bold ${color}`}>{value}</p>
                                            <p className={`${NEU_LABEL} mt-1`}>{label}</p>
                                        </div>
                                    ))}
                                </motion.div>
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
                            <MapPin className="h-10 w-10 text-[#1E2938]/25" />
                        </div>
                        <p className={`${NEU_HEADING} text-base text-[#1E2938]/40`}>No destinations available</p>
                        <p className={NEU_MUTED}>Destinations will appear here once added.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default DestinationsInfo;