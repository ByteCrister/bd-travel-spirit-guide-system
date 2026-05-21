"use client";

import { AUDIENCE_TYPE, AudienceType, TRAVEL_TYPE, TravelType } from "@/constants/tour/tour.const";
import { TourDetailDTO } from "@/types/tour/tour.types";
import {
    Briefcase, Building, Castle, CheckCircle, Coffee, Compass,
    Globe, Heart, Map, MapPin, Mountain, Package, Shield,
    User, Users, Waves, XCircle, Phone, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

// ── Neumorphism Design Tokens ─────────────────────────────────
const NEU_CARD = "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM = "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_SURFACE_INSET_SM = "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_BADGE_PRIMARY = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_SUCCESS = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_DANGER = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 bg-[#FF2157]/10 text-[#FF2157] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL = "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_ICON_WELL = "p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_ICON_WELL_PRIMARY = "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_DIVIDER = "border-[#1E2938]/10";

const ROW_ITEM = `flex items-center justify-between p-3 rounded-xl ${NEU_SURFACE_INSET_SM}`;
const STATUS_POSITIVE = `flex items-center gap-3 p-3 rounded-xl border border-[#00A63D]/20 bg-[#00A63D]/5 shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]`;
const STATUS_NEGATIVE = `flex items-center gap-3 p-3 rounded-xl border border-[#FF2157]/20 bg-[#FF2157]/5 shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]`;
const EMERGENCY_ROW = `flex items-center justify-between p-3 rounded-xl border border-[#FF2157]/20 bg-[#FF2157]/5 shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff]`;

interface BangladeshInfoProps {
    tour: TourDetailDTO;
}

const BangladeshInfo = ({ tour }: BangladeshInfoProps) => {
    const getAudienceIcon = (audience: AudienceType) => {
        switch (audience) {
            case AUDIENCE_TYPE.COUPLES: return <Heart className="h-4 w-4" />;
            case AUDIENCE_TYPE.FAMILIES: return <Users className="h-4 w-4" />;
            case AUDIENCE_TYPE.SOLO: return <User className="h-4 w-4" />;
            case AUDIENCE_TYPE.BUSINESS: return <Building className="h-4 w-4" />;
            default: return <Users className="h-4 w-4" />;
        }
    };

    const getTravelTypeIcon = (type: TravelType) => {
        switch (type) {
            case TRAVEL_TYPE.BEACHES: return <Waves className="h-4 w-4" />;
            case TRAVEL_TYPE.FOOD_DRINK: return <Coffee className="h-4 w-4" />;
            case TRAVEL_TYPE.CULTURE_HISTORY: return <Castle className="h-4 w-4" />;
            case TRAVEL_TYPE.ADVENTURE_SEEKERS: return <Mountain className="h-4 w-4" />;
            case TRAVEL_TYPE.COUPLES: return <Heart className="h-4 w-4" />;
            case TRAVEL_TYPE.GROUP_OF_FRIENDS: return <Users className="h-4 w-4" />;
            case TRAVEL_TYPE.SOLO: return <User className="h-4 w-4" />;
            case TRAVEL_TYPE.FAMILIES: return <Users className="h-4 w-4" />;
            case TRAVEL_TYPE.BUSINESS: return <Briefcase className="h-4 w-4" />;
            case TRAVEL_TYPE.DESTINATION_GUIDE: return <Map className="h-4 w-4" />;
            default: return <Compass className="h-4 w-4" />;
        }
    };

    return (
        <div className={`${NEU_CARD} p-1 overflow-hidden`}>
            {/* Header */}
            <div className={`px-6 py-5 rounded-2xl mb-1 bg-[#E7E5E4]`}>
                <div className="flex items-center gap-3">
                    <div className={NEU_ICON_WELL_PRIMARY}>
                        <Globe className="h-5 w-5 text-[#006666]" />
                    </div>
                    <div>
                        <h2 className={`${NEU_HEADING} text-xl`}>Bangladesh Specific Information</h2>
                        <p className={`${NEU_MUTED} mt-0.5`}>Location, tour type & emergency data</p>
                    </div>
                </div>
                <div className={`mt-4 border-t ${NEU_DIVIDER}`} />
            </div>

            {/* Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ── Left column ── */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-5"
                >
                    {/* Location */}
                    <div className={`${NEU_CARD_SM} p-5 space-y-4`}>
                        <div className="flex items-center gap-2">
                            <div className={NEU_ICON_WELL}>
                                <MapPin className="h-4 w-4 text-[#006666]" />
                            </div>
                            <span className={`${NEU_HEADING} text-base`}>Location</span>
                        </div>
                        <div className={`border-t ${NEU_DIVIDER}`} />
                        <div className="space-y-3">
                            <div className={ROW_ITEM}>
                                <span className={NEU_LABEL}>Division</span>
                                <span className="font-[family-name:var(--font-space-mono)] text-sm font-semibold text-[#1E2938]">
                                    {tour.division}
                                </span>
                            </div>
                            <div className={ROW_ITEM}>
                                <span className={NEU_LABEL}>District</span>
                                <span className="font-[family-name:var(--font-space-mono)] text-sm font-semibold text-[#1E2938]">
                                    {tour.district}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tour Type & Audience */}
                    <div className={`${NEU_CARD_SM} p-5 space-y-4`}>
                        <div className="flex items-center gap-2">
                            <div className={NEU_ICON_WELL}>
                                <Package className="h-4 w-4 text-[#006666]" />
                            </div>
                            <span className={`${NEU_HEADING} text-base`}>Tour Type & Audience</span>
                        </div>
                        <div className={`border-t ${NEU_DIVIDER}`} />
                        <div className="space-y-3">
                            <div className={ROW_ITEM}>
                                <span className={NEU_LABEL}>Tour Type</span>
                                <span className={NEU_BADGE_PRIMARY}>
                                    {getTravelTypeIcon(tour.tourType)}
                                    {tour.tourType}
                                </span>
                            </div>
                            {tour.audience && tour.audience.length > 0 && (
                                <div className={`${NEU_SURFACE_INSET_SM} p-3 rounded-xl`}>
                                    <p className={`${NEU_LABEL} mb-2`}>Audience</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {tour.audience.map((aud) => (
                                            <span key={aud} className={NEU_BADGE_PRIMARY}>
                                                {getAudienceIcon(aud)}
                                                {aud}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ── Right column ── */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="space-y-5"
                >
                    {/* Inclusions */}
                    <div className={`${NEU_CARD_SM} p-5 space-y-4`}>
                        <div className="flex items-center gap-2">
                            <div className={NEU_ICON_WELL}>
                                <Shield className="h-4 w-4 text-[#006666]" />
                            </div>
                            <span className={`${NEU_HEADING} text-base`}>Inclusions</span>
                        </div>
                        <div className={`border-t ${NEU_DIVIDER}`} />
                        <div className="space-y-3">
                            <div className={tour.guideIncluded ? STATUS_POSITIVE : STATUS_NEGATIVE}>
                                {tour.guideIncluded
                                    ? <CheckCircle className="h-5 w-5 text-[#00A63D] shrink-0" />
                                    : <XCircle className="h-5 w-5 text-[#FF2157] shrink-0" />}
                                <span className="font-[family-name:var(--font-space-mono)] text-sm font-semibold text-[#1E2938]">
                                    Guide Included
                                </span>
                                <span className={`ml-auto ${tour.guideIncluded ? NEU_BADGE_SUCCESS : NEU_BADGE_DANGER}`}>
                                    {tour.guideIncluded ? "Yes" : "No"}
                                </span>
                            </div>
                            <div className={tour.transportIncluded ? STATUS_POSITIVE : STATUS_NEGATIVE}>
                                {tour.transportIncluded
                                    ? <CheckCircle className="h-5 w-5 text-[#00A63D] shrink-0" />
                                    : <XCircle className="h-5 w-5 text-[#FF2157] shrink-0" />}
                                <span className="font-[family-name:var(--font-space-mono)] text-sm font-semibold text-[#1E2938]">
                                    Transport Included
                                </span>
                                <span className={`ml-auto ${tour.transportIncluded ? NEU_BADGE_SUCCESS : NEU_BADGE_DANGER}`}>
                                    {tour.transportIncluded ? "Yes" : "No"}
                                </span>
                            </div>
                            {tour.accommodationType && tour.accommodationType.length > 0 && (
                                <div className={`${NEU_SURFACE_INSET_SM} p-3 rounded-xl`}>
                                    <p className={`${NEU_LABEL} mb-2`}>Accommodation Types</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {tour.accommodationType.map((type) => (
                                            <span key={type} className={NEU_BADGE_PRIMARY}>{type}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Emergency Contacts */}
                    <div className={`${NEU_CARD_SM} p-5 space-y-4`}>
                        <div className="flex items-center gap-2">
                            <div className="p-2.5 rounded-xl bg-[#FF2157]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
                                <AlertCircle className="h-4 w-4 text-[#FF2157]" />
                            </div>
                            <span className={`${NEU_HEADING} text-base`}>Emergency Contacts</span>
                        </div>
                        <div className={`border-t ${NEU_DIVIDER}`} />
                        {tour.emergencyContacts ? (
                            <div className="space-y-3">
                                {tour.emergencyContacts.policeNumber && (
                                    <div className={EMERGENCY_ROW}>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-[#FF2157]" />
                                            <span className={NEU_LABEL}>Police</span>
                                        </div>
                                        <a
                                            href={`tel:${tour.emergencyContacts.policeNumber}`}
                                            className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-[#FF2157] hover:underline"
                                        >
                                            {tour.emergencyContacts.policeNumber}
                                        </a>
                                    </div>
                                )}
                                {tour.emergencyContacts.ambulanceNumber && (
                                    <div className={EMERGENCY_ROW}>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-[#FF2157]" />
                                            <span className={NEU_LABEL}>Ambulance</span>
                                        </div>
                                        <a
                                            href={`tel:${tour.emergencyContacts.ambulanceNumber}`}
                                            className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-[#FF2157] hover:underline"
                                        >
                                            {tour.emergencyContacts.ambulanceNumber}
                                        </a>
                                    </div>
                                )}
                                {tour.emergencyContacts.localEmergency && (
                                    <div className={EMERGENCY_ROW}>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-[#FF2157]" />
                                            <span className={NEU_LABEL}>Local Emergency</span>
                                        </div>
                                        <a
                                            href={`tel:${tour.emergencyContacts.localEmergency}`}
                                            className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-[#FF2157] hover:underline"
                                        >
                                            {tour.emergencyContacts.localEmergency}
                                        </a>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className={`${NEU_MUTED} p-3 rounded-xl ${NEU_SURFACE_INSET_SM} text-center`}>
                                No emergency contacts provided
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default BangladeshInfo;