"use client";

import { useFormikContext } from "formik";
import { motion, Variants } from "framer-motion";
import { CreateTourDTO } from "@/types/tour/tour.types";
import { AGE_SUITABILITY } from "@/constants/tour/tour.const";
import {
    Shield,
    Users,
    Accessibility,
    Baby,
    Dog,
    FileText,
    Info,
    CheckCircle2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// ── Neumorphism Style Tokens ──────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4]  border border-white/60";
const NEU_INPUT =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
    " border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";

const NEU_SELECT =
    "w-full h-11 rounded-xl bg-[#E7E5E4] text-[#1E2938] " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm px-3 " +
    " border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200 appearance-none cursor-pointer";
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_DIVIDER = "border-[#1E2938]/10";
const NEU_ICON_WELL =
    "p-2.5 rounded-xl bg-[#E7E5E4] ";

// Toggle card — inactive
const NEU_TOGGLE_CARD =
    "flex flex-col items-center justify-center gap-3 p-5 rounded-2xl cursor-pointer text-center " +
    "bg-[#E7E5E4] border border-white/60 " +
    " " +
    "hover: " +
    "transition-all duration-200 select-none";

// Toggle card — active
const NEU_TOGGLE_CARD_ACTIVE =
    "flex flex-col items-center justify-center gap-3 p-5 rounded-2xl cursor-pointer text-center " +
    "bg-[#006666]/5 border border-[#006666]/30 " +
    " " +
    "transition-all duration-200 select-none";

// Neumorphic toggle switch
const NEU_SWITCH_TRACK_OFF =
    "relative inline-flex w-11 h-6 rounded-full cursor-pointer transition-all duration-200 " +
    "bg-[#E7E5E4] ";
const NEU_SWITCH_TRACK_ON =
    "relative inline-flex w-11 h-6 rounded-full cursor-pointer transition-all duration-200 " +
    "bg-[#006666] ";

// ── Animation Variants ────────────────────────────────────────
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// ── Neumorphic Toggle Switch Component ────────────────────────
function NeuSwitch({
    checked,
    onChange,
    id,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    id?: string;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            id={id}
            onClick={() => onChange(!checked)}
            className={checked ? NEU_SWITCH_TRACK_ON : NEU_SWITCH_TRACK_OFF}
        >
            <span
                className={`inline-block w-4 h-4 rounded-full bg-white  transform transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-1"
                    } mt-1`}
            />
        </button>
    );
}

export default function ComplianceAccessibilityStep() {
    const { values, errors, touched, setFieldValue } =
        useFormikContext<CreateTourDTO>();

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`space-y-8 ${NEU_SURFACE}`}
        >
            {/* Header */}
            <motion.div variants={itemVariants}>
                <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-[#006666]/10 ">
                        <Shield className="w-6 h-6 text-[#006666]" />
                    </div>
                    <div>
                        <h2 className={`text-2xl ${NEU_HEADING}`}>Compliance & Accessibility</h2>
                        <p className={`mt-0.5 ${NEU_MUTED}`}>Set compliance requirements and accessibility features</p>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Age Suitability */}
                <motion.div variants={itemVariants}>
                    <div className={`${NEU_CARD} overflow-hidden h-full`}>
                        <div className="p-5 pb-4">
                            <div className="flex items-center gap-3">
                                <div className={NEU_ICON_WELL}>
                                    <Users className="w-4 h-4 text-[#00A63D]" />
                                </div>
                                <div>
                                    <h3 className={`text-base ${NEU_HEADING}`}>Age Suitability *</h3>
                                    <p className={`text-xs ${NEU_MUTED}`}>Who is this tour appropriate for?</p>
                                </div>
                            </div>
                        </div>
                        <div className={`border-t ${NEU_DIVIDER}`} />
                        <div className="p-5">
                            <div className="relative">
                                <select
                                    value={values.ageSuitability || ""}
                                    onChange={(e) => setFieldValue("ageSuitability", e.target.value)}
                                    className={`${NEU_SELECT} ${touched.ageSuitability && errors.ageSuitability
                                            ? "ring-2 ring-[#FF2157]/40"
                                            : ""
                                        }`}
                                    aria-label="Age Suitability"
                                >
                                    <option value="" disabled>Select age suitability</option>
                                    {Object.values(AGE_SUITABILITY).map((s) => (
                                        <option key={s} value={s}>
                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                {/* Custom chevron */}
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#1E2938]/40">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </div>
                            {touched.ageSuitability && errors.ageSuitability && (
                                <p className="mt-1.5 text-xs text-[#FF2157] font-[family-name:var(--font-jetbrains-mono)]">
                                    {errors.ageSuitability}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* License Required */}
                <motion.div variants={itemVariants}>
                    <div className={`${NEU_CARD} overflow-hidden h-full`}>
                        <div className="p-5 pb-4">
                            <div className="flex items-center gap-3">
                                <div className={NEU_ICON_WELL}>
                                    <FileText className="w-4 h-4 text-[#FF2157]" />
                                </div>
                                <div>
                                    <h3 className={`text-base ${NEU_HEADING}`}>License Required</h3>
                                    <p className={`text-xs ${NEU_MUTED}`}>Check if special permits or licenses are needed</p>
                                </div>
                            </div>
                        </div>
                        <div className={`border-t ${NEU_DIVIDER}`} />
                        <div className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-[family-name:var(--font-space-mono)] font-semibold text-[#1E2938] text-sm">
                                        Requires License
                                    </p>
                                    <p className={`text-xs mt-0.5 ${NEU_MUTED}`}>
                                        Enable if participants need special permits
                                    </p>
                                </div>
                                <NeuSwitch
                                    checked={values.licenseRequired || false}
                                    onChange={(v) => setFieldValue("licenseRequired", v)}
                                    id="licenseRequired"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Accessibility Features */}
                <motion.div variants={itemVariants} className="md:col-span-2">
                    <div className={`${NEU_CARD} overflow-hidden`}>
                        <div className="p-5 pb-4">
                            <div className="flex items-center gap-3">
                                <div className={NEU_ICON_WELL}>
                                    <CheckCircle2 className="w-4 h-4 text-[#006666]" />
                                </div>
                                <div>
                                    <h3 className={`text-base ${NEU_HEADING}`}>Accessibility Features</h3>
                                    <p className={`text-xs ${NEU_MUTED}`}>Toggle the features available for this tour</p>
                                </div>
                            </div>
                        </div>
                        <div className={`border-t ${NEU_DIVIDER}`} />
                        <div className="p-5 space-y-5">
                            {/* Toggle Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Wheelchair */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={values.accessibility?.wheelchair ? NEU_TOGGLE_CARD_ACTIVE : NEU_TOGGLE_CARD}
                                    onClick={() =>
                                        setFieldValue("accessibility.wheelchair", !values.accessibility?.wheelchair)
                                    }
                                    role="checkbox"
                                    aria-checked={values.accessibility?.wheelchair || false}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === " " || e.key === "Enter") {
                                            e.preventDefault();
                                            setFieldValue("accessibility.wheelchair", !values.accessibility?.wheelchair);
                                        }
                                    }}
                                >
                                    <div className={`p-3 rounded-xl transition-colors duration-200 ${values.accessibility?.wheelchair
                                            ? "bg-[#006666] "
                                            : "bg-[#E7E5E4] "
                                        }`}>
                                        <Accessibility className={`w-6 h-6 ${values.accessibility?.wheelchair ? "text-white" : "text-[#1E2938]/50"}`} />
                                    </div>
                                    <div>
                                        <p className={`font-[family-name:var(--font-space-mono)] font-semibold text-sm ${values.accessibility?.wheelchair ? "text-[#006666]" : "text-[#1E2938]"}`}>
                                            Wheelchair
                                        </p>
                                        <p className={`text-xs mt-0.5 ${NEU_MUTED}`}>Suitable for wheelchair users</p>
                                    </div>
                                </motion.div>

                                {/* Family Friendly */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={values.accessibility?.familyFriendly ? NEU_TOGGLE_CARD_ACTIVE : NEU_TOGGLE_CARD}
                                    onClick={() =>
                                        setFieldValue("accessibility.familyFriendly", !values.accessibility?.familyFriendly)
                                    }
                                    role="checkbox"
                                    aria-checked={values.accessibility?.familyFriendly || false}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === " " || e.key === "Enter") {
                                            e.preventDefault();
                                            setFieldValue("accessibility.familyFriendly", !values.accessibility?.familyFriendly);
                                        }
                                    }}
                                >
                                    <div className={`p-3 rounded-xl transition-colors duration-200 ${values.accessibility?.familyFriendly
                                            ? "bg-[#006666] "
                                            : "bg-[#E7E5E4] "
                                        }`}>
                                        <Baby className={`w-6 h-6 ${values.accessibility?.familyFriendly ? "text-white" : "text-[#1E2938]/50"}`} />
                                    </div>
                                    <div>
                                        <p className={`font-[family-name:var(--font-space-mono)] font-semibold text-sm ${values.accessibility?.familyFriendly ? "text-[#006666]" : "text-[#1E2938]"}`}>
                                            Family Friendly
                                        </p>
                                        <p className={`text-xs mt-0.5 ${NEU_MUTED}`}>Suitable for families with children</p>
                                    </div>
                                </motion.div>

                                {/* Pet Friendly */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={values.accessibility?.petFriendly ? NEU_TOGGLE_CARD_ACTIVE : NEU_TOGGLE_CARD}
                                    onClick={() =>
                                        setFieldValue("accessibility.petFriendly", !values.accessibility?.petFriendly)
                                    }
                                    role="checkbox"
                                    aria-checked={values.accessibility?.petFriendly || false}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === " " || e.key === "Enter") {
                                            e.preventDefault();
                                            setFieldValue("accessibility.petFriendly", !values.accessibility?.petFriendly);
                                        }
                                    }}
                                >
                                    <div className={`p-3 rounded-xl transition-colors duration-200 ${values.accessibility?.petFriendly
                                            ? "bg-[#006666] "
                                            : "bg-[#E7E5E4] "
                                        }`}>
                                        <Dog className={`w-6 h-6 ${values.accessibility?.petFriendly ? "text-white" : "text-[#1E2938]/50"}`} />
                                    </div>
                                    <div>
                                        <p className={`font-[family-name:var(--font-space-mono)] font-semibold text-sm ${values.accessibility?.petFriendly ? "text-[#006666]" : "text-[#1E2938]"}`}>
                                            Pet Friendly
                                        </p>
                                        <p className={`text-xs mt-0.5 ${NEU_MUTED}`}>Allows pets to accompany</p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Accessibility Notes */}
                            <div className="space-y-2">
                                <Label className={NEU_LABEL}>Accessibility Notes</Label>
                                <Textarea
                                    rows={3}
                                    value={values.accessibility?.notes || ""}
                                    onChange={(e) => setFieldValue("accessibility.notes", e.target.value)}
                                    placeholder="Provide additional details about accessibility features, limitations, or requirements..."
                                    className={`resize-none ${NEU_INPUT}`}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Info Alert */}
                <motion.div variants={itemVariants} className="md:col-span-2">
                    <div className="flex gap-4 p-5 rounded-2xl bg-[#006666]/5 border border-[#006666]/20 ">
                        <div className="shrink-0 mt-0.5">
                            <div className="p-2 rounded-xl bg-[#006666]/10 ">
                                <Info className="w-4 h-4 text-[#006666]" />
                            </div>
                        </div>
                        <div>
                            <p className="font-[family-name:var(--font-space-mono)] font-bold text-sm text-[#1E2938] mb-1">
                                Compliance Information
                            </p>
                            <p className={`text-sm leading-relaxed ${NEU_MUTED}`}>
                                Ensure all accessibility information is accurate. Misrepresentation may result in tour suspension.
                                Consider factors like physical requirements, medical conditions, and special needs when setting these values.
                            </p>
                        </div>
                    </div>
                </motion.div>

            </div>
        </motion.div>
    );
}