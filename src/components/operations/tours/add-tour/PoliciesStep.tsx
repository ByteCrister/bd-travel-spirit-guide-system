"use client";

import { Field, FieldArray, getIn, useFormikContext } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import { CreateTourDTO } from "@/types/tour/tour.types";
import { PAYMENT_METHOD } from "@/constants/tour/tour.const";
import {
    FileText, XCircle, CreditCard, Clock, Plus, Trash2,
    AlertTriangle, Info, Shield, CheckCircle2,
} from "lucide-react";

// ─── Neumorphic Design Tokens ──────────────────────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";
const NEU_CARD = "rounded-2xl bg-[#E7E5E4]  border border-white/60";
const NEU_CARD_SM = "rounded-xl bg-[#E7E5E4]  border border-white/60";

const NEU_BTN_GHOST =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
    " " +
    "hover: " +
    "active: " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_BTN_DANGER =
    "rounded-xl bg-[#E7E5E4] text-[#FF2157] font-[family-name:var(--font-space-mono)] " +
    " " +
    "hover:bg-[#FF2157]/10 hover: " +
    "transition-all duration-200 focus-visible:outline-none";

const NEU_INPUT =
    "w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm px-4 py-2.5 " +
    " border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";

const NEU_TEXTAREA =
    "w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm px-4 py-3 resize-none " +
    " border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";

const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL = "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_DIVIDER = "border-[#1E2938]/10";

const NEU_ICON_WELL = "p-2.5 rounded-xl bg-[#E7E5E4] ";
const NEU_ICON_WELL_PRIMARY = "p-2.5 rounded-xl bg-[#006666]/10 ";
const NEU_ICON_WELL_SM = "p-2 rounded-lg bg-[#E7E5E4] ";

// Toggle (checkbox) pressed/unpressed states
const NEU_TOGGLE_ON =
    "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 " +
    "bg-[#006666]  " +
    "transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#006666]/50";
const NEU_TOGGLE_OFF =
    "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 " +
    "bg-[#E7E5E4]  " +
    "transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#006666]/40";

// Pill toggle for method selection
const NEU_PILL_ON =
    "px-3 py-1.5 rounded-xl text-xs font-[family-name:var(--font-space-mono)] font-bold cursor-pointer " +
    "bg-[#006666] text-white  " +
    "transition-all duration-200";
const NEU_PILL_OFF =
    "px-3 py-1.5 rounded-xl text-xs font-[family-name:var(--font-space-mono)] font-bold cursor-pointer " +
    "bg-[#E7E5E4] text-[#1E2938]/70  " +
    "hover: " +
    "transition-all duration-200";

// ─── Animation Variants ────────────────────────────────────────────────────────
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};
const cardVariants = {
    hidden: { opacity: 0, scale: 0.97 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.97, transition: { duration: 0.15 } },
};

// ─── Sub-components ────────────────────────────────────────────────────────────
function SectionTitle({
    icon,
    color,
    title,
    subtitle,
    required,
}: {
    icon: React.ReactNode;
    color: string;
    title: string;
    subtitle?: string;
    required?: boolean;
}) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <div
                className="p-2.5 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                style={{ background: color }}
            >
                {icon}
            </div>
            <div>
                <h3 className={`${NEU_HEADING} text-base`}>
                    {title}
                    {required && <span className="text-[#FF2157] ml-1">*</span>}
                </h3>
                {subtitle && <p className={NEU_MUTED}>{subtitle}</p>}
            </div>
        </div>
    );
}

function NeuLabel({ children }: { children: React.ReactNode }) {
    return <label className={`${NEU_LABEL} block mb-1.5`}>{children}</label>;
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#FF2157] mt-1.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
            {message}
        </p>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PoliciesStep() {
    const {
        values, errors, touched, setFieldValue, handleChange, handleBlur,
    } = useFormikContext<CreateTourDTO>();

    const getFieldError = (path: string): string => getIn(errors, path) as string;
    const isFieldTouched = (path: string): boolean => getIn(touched, path) as boolean;

    const isRefundable = values.cancellationPolicy?.refundable || false;

    // All available payment methods for refund selection
    const allMethods = Object.values(PAYMENT_METHOD);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`min-h-screen ${NEU_SURFACE} p-4 sm:p-6 lg:p-8`}
        >
            {/* ── Page Header ───────────────────────────────────────────────────── */}
            <motion.div variants={itemVariants} className="mb-8">
                <div className="flex items-center gap-4">
                    <div className={NEU_ICON_WELL_PRIMARY}>
                        <Shield className="w-6 h-6 text-[#006666]" />
                    </div>
                    <div>
                        <h2 className={`${NEU_HEADING} text-2xl`}>Policies</h2>
                        <p className={NEU_MUTED}>
                            Set cancellation, refund policies, and terms &amp; conditions
                        </p>
                    </div>
                </div>
                <div className={`mt-5 border-t ${NEU_DIVIDER}`} />
            </motion.div>

            <div className="space-y-8">

                {/* ── Cancellation Policy ───────────────────────────────────────────── */}
                <motion.section variants={itemVariants}>
                    <SectionTitle
                        icon={<XCircle className="w-4 h-4" />}
                        color="linear-gradient(135deg,#ee0979,#ff6a00)"
                        title="Cancellation Policy"
                    />

                    <div className={`${NEU_CARD} p-5 sm:p-6`}>

                        {/* Refundable toggle */}
                        <label className="flex items-start gap-4 cursor-pointer group select-none">
                            <button
                                type="button"
                                role="checkbox"
                                aria-checked={isRefundable}
                                onClick={() =>
                                    setFieldValue("cancellationPolicy.refundable", !isRefundable)
                                }
                                className={isRefundable ? NEU_TOGGLE_ON : NEU_TOGGLE_OFF}
                            >
                                {isRefundable && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                )}
                            </button>
                            <div className="pt-0.5">
                                <span className={`${NEU_HEADING} text-sm block`}>Refundable</span>
                                <span className={NEU_MUTED}>
                                    Allow customers to cancel and receive refunds
                                </span>
                            </div>
                        </label>

                        {/* Refund Rules (shown when refundable) */}
                        <AnimatePresence>
                            {isRefundable && (
                                <motion.div
                                    key="rules"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className={`mt-6 pt-5 border-t ${NEU_DIVIDER}`}>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className={NEU_ICON_WELL_SM}>
                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#006666]" />
                                            </div>
                                            <span className={`${NEU_LABEL} text-[#006666]`}>
                                                Refund Rules — days before departure
                                            </span>
                                        </div>

                                        <FieldArray name="cancellationPolicy.rules">
                                            {({ push, remove }) => (
                                                <div className="space-y-3">
                                                    {/* Column headers (desktop) */}
                                                    {(values.cancellationPolicy?.rules?.length ?? 0) > 0 && (
                                                        <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_40px] gap-3 px-1">
                                                            <span className={NEU_LABEL}>Days Before</span>
                                                            <span className={NEU_LABEL}>Refund %</span>
                                                            <span />
                                                        </div>
                                                    )}

                                                    <AnimatePresence mode="popLayout">
                                                        {values.cancellationPolicy?.rules?.map((rule, idx) => (
                                                            <motion.div
                                                                key={idx}
                                                                variants={cardVariants}
                                                                initial="hidden"
                                                                animate="visible"
                                                                exit="exit"
                                                                layout
                                                                className={`${NEU_CARD_SM} p-3`}
                                                            >
                                                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_40px] gap-3 items-center">
                                                                    <div>
                                                                        <span className={`${NEU_LABEL} sm:hidden`}>Days Before</span>
                                                                        <input
                                                                            type="number"
                                                                            min={0}
                                                                            value={rule.daysBefore}
                                                                            onChange={(e) =>
                                                                                setFieldValue(
                                                                                    `cancellationPolicy.rules[${idx}].daysBefore`,
                                                                                    parseInt(e.target.value)
                                                                                )
                                                                            }
                                                                            placeholder="e.g. 7"
                                                                            className={NEU_INPUT}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <span className={`${NEU_LABEL} sm:hidden`}>Refund %</span>
                                                                        <div className="relative">
                                                                            <input
                                                                                type="number"
                                                                                min={0}
                                                                                max={100}
                                                                                value={rule.refundPercent}
                                                                                onChange={(e) =>
                                                                                    setFieldValue(
                                                                                        `cancellationPolicy.rules[${idx}].refundPercent`,
                                                                                        parseInt(e.target.value)
                                                                                    )
                                                                                }
                                                                                placeholder="e.g. 80"
                                                                                className={`${NEU_INPUT} pr-10`}
                                                                            />
                                                                            <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${NEU_MUTED} pointer-events-none`}>
                                                                                %
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => remove(idx)}
                                                                        className={`${NEU_BTN_DANGER} w-9 h-9 flex items-center justify-center mx-auto`}
                                                                        aria-label="Remove rule"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>

                                                    <button
                                                        type="button"
                                                        onClick={() => push({ daysBefore: 0, refundPercent: 0 })}
                                                        className={`${NEU_BTN_GHOST} flex items-center gap-2 px-4 py-2 text-sm mt-1`}
                                                    >
                                                        <Plus className="w-4 h-4 text-[#006666]" />
                                                        Add Refund Rule
                                                    </button>
                                                </div>
                                            )}
                                        </FieldArray>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Non-refundable warning */}
                        <AnimatePresence>
                            {!isRefundable && (
                                <motion.div
                                    key="warning"
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.25 }}
                                    className={`mt-5`}
                                >
                                    <div className={`${NEU_CARD_SM} p-4 flex items-start gap-3 border-[#FE9900]/30`}>
                                        <div className="w-8 h-8 rounded-xl bg-[#FE9900]/10 flex items-center justify-center flex-shrink-0">
                                            <AlertTriangle className="w-4 h-4 text-[#FE9900]" />
                                        </div>
                                        <div>
                                            <p className="font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#FE9900] mb-0.5">
                                                Non-Refundable
                                            </p>
                                            <p className={NEU_MUTED}>
                                                Non-refundable tours cannot be cancelled for a refund under any circumstances.
                                                Consider this carefully as it affects customer satisfaction.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.section>

                {/* ── Refund Policy ─────────────────────────────────────────────────── */}
                <motion.section variants={itemVariants}>
                    <SectionTitle
                        icon={<CreditCard className="w-4 h-4" />}
                        color="linear-gradient(135deg,#11998e,#38ef7d)"
                        title="Refund Policy"
                        required
                    />

                    <div className={`${NEU_CARD} p-5 sm:p-6 space-y-6`}>

                        {/* Refund Methods */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className={NEU_ICON_WELL_SM}>
                                    <CreditCard className="w-3.5 h-3.5 text-[#006666]" />
                                </div>
                                <span className={`${NEU_LABEL} text-[#006666]`}>
                                    Refund Methods <span className="text-[#FF2157]">*</span>
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {allMethods.map((method) => {
                                    const selected = values.refundPolicy?.method?.includes(method);
                                    return (
                                        <button
                                            key={method}
                                            type="button"
                                            onClick={() => {
                                                const current = values.refundPolicy?.method || [];
                                                setFieldValue(
                                                    "refundPolicy.method",
                                                    selected
                                                        ? current.filter((m) => m !== method)
                                                        : [...current, method]
                                                );
                                            }}
                                            className={selected ? NEU_PILL_ON : NEU_PILL_OFF}
                                        >
                                            {method}
                                        </button>
                                    );
                                })}
                            </div>

                            {isFieldTouched("refundPolicy.method") &&
                                getFieldError("refundPolicy.method") && (
                                    <FieldError message={getFieldError("refundPolicy.method")} />
                                )}
                        </div>

                        <div className={`border-t ${NEU_DIVIDER}`} />

                        {/* Processing Days */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className={NEU_ICON_WELL_SM}>
                                    <Clock className="w-3.5 h-3.5 text-[#006666]" />
                                </div>
                                <span className={`${NEU_LABEL} text-[#006666]`}>
                                    Processing Days <span className="text-[#FF2157]">*</span>
                                </span>
                            </div>

                            <div className="max-w-xs">
                                <input
                                    type="number"
                                    name="refundPolicy.processingDays"
                                    min={0}
                                    max={60}
                                    value={values.refundPolicy?.processingDays || 0}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="e.g. 7"
                                    className={`${NEU_INPUT} ${isFieldTouched("refundPolicy.processingDays") &&
                                            getFieldError("refundPolicy.processingDays")
                                            ? "ring-2 ring-[#FF2157]/50"
                                            : ""
                                        }`}
                                />
                            </div>
                            <p className={`${NEU_MUTED} mt-1.5`}>
                                Number of business days to process refunds (max 60)
                            </p>
                            {isFieldTouched("refundPolicy.processingDays") &&
                                getFieldError("refundPolicy.processingDays") && (
                                    <FieldError message={getFieldError("refundPolicy.processingDays")} />
                                )}
                        </div>
                    </div>
                </motion.section>

                {/* ── Terms & Conditions ────────────────────────────────────────────── */}
                <motion.section variants={itemVariants}>
                    <SectionTitle
                        icon={<FileText className="w-4 h-4" />}
                        color="linear-gradient(135deg,#4facfe,#00f2fe)"
                        title="Terms & Conditions"
                    />

                    <div className={`${NEU_CARD} p-5 sm:p-6`}>
                        <NeuLabel>Terms &amp; Conditions</NeuLabel>
                        <Field name="terms">
                            {({ field }: { field: React.InputHTMLAttributes<HTMLTextAreaElement> }) => (
                                <textarea
                                    {...field}
                                    rows={10}
                                    placeholder={`Enter terms and conditions for this tour…

Example:
1. All participants must have valid travel insurance.
2. The tour operator reserves the right to modify the itinerary due to weather conditions or unforeseen circumstances.
3. Participants must follow the guide's instructions at all times.
4. Minimum age requirement: 12 years (unless otherwise specified).
5. Force majeure: In case of natural disasters, political unrest, or other unforeseen events, the tour may be cancelled or postponed.
6. Health requirements: Participants must disclose any medical conditions before the tour.

You can use markdown formatting for better readability.`}
                                    className={NEU_TEXTAREA}
                                />
                            )}
                        </Field>
                        <p className={`${NEU_MUTED} mt-2`}>
                            Use clear and comprehensive terms to avoid misunderstandings
                        </p>
                    </div>
                </motion.section>

                {/* ── Policy Guidelines Info ────────────────────────────────────────── */}
                <motion.section variants={itemVariants}>
                    <div className={`${NEU_CARD} p-5 sm:p-6`}>
                        <div className="flex items-start gap-4">
                            <div className={`${NEU_ICON_WELL} flex-shrink-0`}>
                                <Info className="w-5 h-5 text-[#006666]" />
                            </div>
                            <div className="flex-1">
                                <h4 className={`${NEU_HEADING} text-sm mb-3`}>Policy Guidelines</h4>
                                <ul className="space-y-2">
                                    {[
                                        "Cancellation policies must comply with local consumer protection laws",
                                        "Refund processing days should be realistic and achievable",
                                        "Clearly state all terms to avoid disputes",
                                        "Consider offering flexible cancellation options to attract more bookings",
                                        "Policies will be displayed prominently on the tour booking page",
                                    ].map((guideline, i) => (
                                        <li key={i} className="flex items-start gap-2.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#006666]/40 flex-shrink-0 mt-2" />
                                            <span className={NEU_MUTED}>{guideline}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.section>

            </div>
        </motion.div>
    );
}