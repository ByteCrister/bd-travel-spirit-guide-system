"use client";

import { TourDetailDTO } from "@/types/tour/tour.types";
import {
    CheckCircle, Shield, XCircle, Calendar,
    FileText, AlertTriangle, Users, Clock
} from "lucide-react";
import { motion } from "framer-motion";

// ── Neumorphism Design Tokens ─────────────────────────────────
const NEU_CARD = "rounded-2xl bg-[#E7E5E4]  border border-white/60";
const NEU_CARD_SM = "rounded-xl bg-[#E7E5E4]  border border-white/60";
const NEU_SURFACE_INSET_SM = "bg-[#E7E5E4] ";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL = "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_ICON_WELL = "p-2.5 rounded-xl bg-[#E7E5E4] ";
const NEU_ICON_WELL_PRIMARY = "p-2.5 rounded-xl bg-[#006666]/10 ";
const NEU_DIVIDER = "border-[#1E2938]/10";
const NEU_BADGE_PRIMARY = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 bg-[#006666]/10 text-[#006666] ";
const NEU_BADGE_SUCCESS = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 bg-[#00A63D]/10 text-[#00A63D] ";
const NEU_BADGE_DANGER = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 bg-[#FF2157]/10 text-[#FF2157] ";
const ROW_ITEM = `flex items-center justify-between p-3 rounded-xl ${NEU_SURFACE_INSET_SM}`;
const STATUS_POSITIVE = `flex items-center gap-3 p-3 rounded-xl border border-[#00A63D]/20 bg-[#00A63D]/5 `;
const STATUS_NEGATIVE = `flex items-center gap-3 p-3 rounded-xl border border-[#FF2157]/20 bg-[#FF2157]/5 `;

interface ComplianceInfoProps {
    tour: TourDetailDTO;
}

const ComplianceInfo = ({ tour }: ComplianceInfoProps) => {
    return (
        <div className={`${NEU_CARD} p-1 overflow-hidden`}>
            {/* Header */}
            <div className="px-6 py-5 rounded-2xl mb-1">
                <div className="flex items-center gap-3">
                    <div className={NEU_ICON_WELL_PRIMARY}>
                        <Shield className="h-5 w-5 text-[#006666]" />
                    </div>
                    <div>
                        <h2 className={`${NEU_HEADING} text-xl`}>Compliance & Accessibility</h2>
                        <p className={`${NEU_MUTED} mt-0.5`}>Policies, access rules & seasonal guidance</p>
                    </div>
                </div>
                <div className={`mt-4 border-t ${NEU_DIVIDER}`} />
            </div>

            {/* Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* ── Basic Compliance ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`${NEU_CARD_SM} p-5 space-y-5`}
                >
                    <div className="flex items-center gap-2">
                        <div className={NEU_ICON_WELL}>
                            <Shield className="h-4 w-4 text-[#006666]" />
                        </div>
                        <span className={`${NEU_HEADING} text-base`}>Basic Compliance</span>
                    </div>
                    <div className={`border-t ${NEU_DIVIDER}`} />

                    <div className="space-y-3">
                        <div className={ROW_ITEM}>
                            <span className={NEU_LABEL}>Difficulty</span>
                            <span className={NEU_BADGE_PRIMARY}>{tour.difficulty}</span>
                        </div>
                        <div className={ROW_ITEM}>
                            <span className={NEU_LABEL}>Age Suitability</span>
                            <span className={`${NEU_MONO} text-sm font-semibold`}>{tour.ageSuitability}</span>
                        </div>
                        <div className={ROW_ITEM}>
                            <span className={NEU_LABEL}>License Required</span>
                            <span className={tour.licenseRequired ? NEU_BADGE_DANGER : NEU_BADGE_SUCCESS}>
                                {tour.licenseRequired ? "Yes" : "No"}
                            </span>
                        </div>
                    </div>

                    <div className={`border-t ${NEU_DIVIDER}`} />

                    {/* Best Seasons */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar className="h-4 w-4 text-[#006666]" />
                            <span className={`${NEU_HEADING} text-sm`}>Best Seasons</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {tour.bestSeason && tour.bestSeason.length > 0 ? (
                                tour.bestSeason.map((season) => (
                                    <span key={season} className={NEU_BADGE_PRIMARY}>{season}</span>
                                ))
                            ) : (
                                <p className={NEU_MUTED}>No seasons specified</p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ── Accessibility ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className={`${NEU_CARD_SM} p-5 space-y-5`}
                >
                    <div className="flex items-center gap-2">
                        <div className={NEU_ICON_WELL}>
                            <Users className="h-4 w-4 text-[#006666]" />
                        </div>
                        <span className={`${NEU_HEADING} text-base`}>Accessibility</span>
                    </div>
                    <div className={`border-t ${NEU_DIVIDER}`} />

                    {tour.accessibility ? (
                        <div className="space-y-3">
                            <div className={tour.accessibility.wheelchair ? STATUS_POSITIVE : STATUS_NEGATIVE}>
                                {tour.accessibility.wheelchair
                                    ? <CheckCircle className="h-5 w-5 text-[#00A63D] shrink-0" />
                                    : <XCircle className="h-5 w-5 text-[#FF2157] shrink-0" />}
                                <span className={`${NEU_MONO} text-sm font-medium`}>Wheelchair Accessible</span>
                            </div>
                            <div className={tour.accessibility.familyFriendly ? STATUS_POSITIVE : STATUS_NEGATIVE}>
                                {tour.accessibility.familyFriendly
                                    ? <CheckCircle className="h-5 w-5 text-[#00A63D] shrink-0" />
                                    : <XCircle className="h-5 w-5 text-[#FF2157] shrink-0" />}
                                <span className={`${NEU_MONO} text-sm font-medium`}>Family Friendly</span>
                            </div>
                            <div className={tour.accessibility.petFriendly ? STATUS_POSITIVE : STATUS_NEGATIVE}>
                                {tour.accessibility.petFriendly
                                    ? <CheckCircle className="h-5 w-5 text-[#00A63D] shrink-0" />
                                    : <XCircle className="h-5 w-5 text-[#FF2157] shrink-0" />}
                                <span className={`${NEU_MONO} text-sm font-medium`}>Pet Friendly</span>
                            </div>
                            {tour.accessibility.notes && (
                                <div className="mt-2 p-3 rounded-xl border border-[#FE9900]/20 bg-[#FE9900]/5  space-y-1">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-[#FE9900]" />
                                        <span className={`${NEU_LABEL} text-[#FE9900]`}>Notes</span>
                                    </div>
                                    <p className={`${NEU_MUTED} leading-relaxed`}>{tour.accessibility.notes}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className={`${NEU_MUTED} p-3 rounded-xl ${NEU_SURFACE_INSET_SM} text-center`}>
                            No accessibility information
                        </p>
                    )}
                </motion.div>

                {/* ── Policies ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className={`${NEU_CARD_SM} p-5 space-y-5`}
                >
                    <div className="flex items-center gap-2">
                        <div className={NEU_ICON_WELL}>
                            <FileText className="h-4 w-4 text-[#006666]" />
                        </div>
                        <span className={`${NEU_HEADING} text-base`}>Policies</span>
                    </div>
                    <div className={`border-t ${NEU_DIVIDER}`} />

                    <div className="space-y-4">
                        {tour.cancellationPolicy && (
                            <div className={`${NEU_SURFACE_INSET_SM} p-4 rounded-xl border border-[#006666]/10 space-y-2`}>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-[#006666]" />
                                    <span className={`${NEU_HEADING} text-sm`}>Cancellation Policy</span>
                                </div>
                                <span className={tour.cancellationPolicy.refundable ? NEU_BADGE_SUCCESS : NEU_BADGE_DANGER}>
                                    {tour.cancellationPolicy.refundable ? "Refundable" : "Non-refundable"}
                                </span>
                            </div>
                        )}
                        {tour.refundPolicy && (
                            <div className={`${NEU_SURFACE_INSET_SM} p-4 rounded-xl border border-[#00A63D]/10 space-y-2`}>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-[#00A63D]" />
                                    <span className={`${NEU_HEADING} text-sm`}>Refund Policy</span>
                                </div>
                                <p className={`${NEU_MUTED}`}>
                                    Processing: <span className="font-semibold text-[#1E2938]">{tour.refundPolicy.processingDays} days</span>
                                </p>
                            </div>
                        )}
                        {tour.terms && (
                            <div className={`${NEU_SURFACE_INSET_SM} p-4 rounded-xl border border-[#1E2938]/10 space-y-2`}>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-[#006666]" />
                                    <span className={`${NEU_HEADING} text-sm`}>Terms & Conditions</span>
                                </div>
                                <p className={`${NEU_MUTED} line-clamp-3 leading-relaxed`}>{tour.terms}</p>
                            </div>
                        )}
                        {!tour.cancellationPolicy && !tour.refundPolicy && !tour.terms && (
                            <p className={`${NEU_MUTED} p-3 rounded-xl ${NEU_SURFACE_INSET_SM} text-center`}>
                                No policies specified
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ComplianceInfo;