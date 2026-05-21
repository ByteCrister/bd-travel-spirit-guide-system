"use client";

import { useState } from "react";
import { useFormikContext } from "formik";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    FileText, MapPin, Tag, Calendar, CreditCard, CheckCircle, XCircle,
    Navigation, Clock, Shield, Users, Bed, Mountain, Package, Phone,
    Home, Bus, Map, FileCheck, Eye, Flag, Layers, Target, BarChart,
    BookOpen, Globe2, Languages, Accessibility as AccessibilityIcon,
    Baby, ShieldAlert, CalendarDays, Timer, Percent, Info, ChevronDown,
    ShieldCheck, MapPinned, Thermometer,
} from "lucide-react";
import { CreateTourDTO } from "@/types/tour/tour.types";
import {
    DestinationBlockDTO, ItineraryEntryDTO, DiscountDTO, InclusionDTO,
    ExclusionDTO, PackingListItemDTO, AddressDTO, CancellationPolicyDTO,
    RefundPolicyDTO, AccessibilityDTO, EmergencyContactsDTO,
    TranslationBlockDTO, PriceDTO,
} from "@/types/tour/tour.types";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { TOUR_DISCOUNT_TYPE } from "@/constants/tour/tour.const";

// ─── Neumorphic Design Tokens ──────────────────────────────────────────────────
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";
const NEU_CARD = "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM = "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_CARD_INSET = "rounded-xl bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_ICON_WELL = "p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_ICON_WELL_PRIMARY = "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_ICON_WELL_SM = "p-2 rounded-lg bg-[#E7E5E4] shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL = "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_DIVIDER = "border-[#1E2938]/10";

// Status badge helpers
const NEU_BADGE_SUCCESS = "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_WARNING = "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_DANGER = "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#FF2157]/10 text-[#FF2157] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_DEFAULT = "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#E7E5E4] text-[#1E2938]/60 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_PRIMARY = "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

// Stat card
const NEU_STAT_CARD = "rounded-2xl bg-[#E7E5E4] shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff] border border-white/60 p-4 flex items-center justify-between";

// Progress bar track
const NEU_PROGRESS_TRACK = "w-full rounded-full bg-[#E7E5E4] shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] h-3 overflow-hidden";

// ─── Type Definitions ──────────────────────────────────────────────────────────
type FieldType =
    | 'text' | 'boolean' | 'array' | 'tags' | 'payment' | 'count'
    | 'destinations' | 'itinerary' | 'inclusions' | 'exclusions' | 'discounts'
    | 'pickup' | 'packing' | 'windows' | 'departures' | 'cancellation'
    | 'refund' | 'emergency' | 'translations' | 'price' | 'address'
    | 'accessibility' | 'duration' | 'seo' | 'coordinates';

type FieldStatus = 'success' | 'warning' | 'default' | 'error';

interface FieldConfig<T = unknown> {
    label: string;
    value?: string | number | boolean | null;
    type: FieldType;
    icon: React.ComponentType<{ className?: string }>;
    status?: FieldStatus;
    count?: number;
    data?: T;
    tooltip?: string;
    required?: boolean;
}

interface SectionConfig {
    id: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    accentBg: string;
    fields: FieldConfig[];
}

// ─── Helper Functions ──────────────────────────────────────────────────────────
const getStatusBadge = (status?: FieldStatus) => {
    switch (status) {
        case "success": return { cls: NEU_BADGE_SUCCESS, label: "Valid" };
        case "warning": return { cls: NEU_BADGE_WARNING, label: "Warning" };
        case "error": return { cls: NEU_BADGE_DANGER, label: "Required" };
        default: return { cls: NEU_BADGE_DEFAULT, label: "Optional" };
    }
};

const formatAddress = (address?: AddressDTO): string => {
    if (!address) return "Not set";
    return [address.line1, address.line2, address.city, address.district, address.region, address.postalCode]
        .filter(Boolean).join(", ") || "Address not specified";
};

const formatCoordinates = (coords?: { lat: number; lng: number }): string => {
    if (!coords) return "Not set";
    return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
};

const formatSeo = (seo?: { metaTitle?: string; metaDescription?: string }): string => {
    if (!seo?.metaTitle && !seo?.metaDescription) return "Not set";
    const parts = [];
    if (seo.metaTitle) parts.push(`Title: ${seo.metaTitle.substring(0, 30)}…`);
    if (seo.metaDescription) parts.push(`Desc: ${seo.metaDescription.substring(0, 40)}…`);
    return parts.join(" · ");
};

const formatDuration = (duration?: { days: number; nights?: number }): string => {
    if (!duration?.days) return "Not set";
    return `${duration.days} days${duration.nights ? `, ${duration.nights} nights` : ""}`;
};

const formatAccessibility = (a?: AccessibilityDTO): string => {
    if (!a) return "Not set";
    const f = [];
    if (a.wheelchair) f.push("Wheelchair");
    if (a.familyFriendly) f.push("Family");
    if (a.petFriendly) f.push("Pet");
    return f.length > 0 ? f.join(", ") : "No special features";
};

const formatEmergencyContacts = (c?: EmergencyContactsDTO): string => {
    if (!c) return "Not set";
    const n = [];
    if (c.policeNumber) n.push("Police");
    if (c.ambulanceNumber) n.push("Ambulance");
    if (c.fireServiceNumber) n.push("Fire");
    if (c.localEmergency) n.push("Local");
    return n.length > 0 ? `${n.length} contacts set` : "No contacts set";
};

const formatTranslations = (t?: TranslationBlockDTO): string => {
    if (!t) return "Not set";
    const langs = [];
    if (t.bn?.title || t.bn?.summary) langs.push("BN");
    if (t.en?.title || t.en?.summary) langs.push("EN");
    return langs.length > 0 ? `${langs.join(", ")} available` : "No translations";
};

// ─── Tag Pill ──────────────────────────────────────────────────────────────────
function TagPill({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
    return (
        <span className={`${NEU_BADGE_DEFAULT} py-1 px-2.5`}>
            {icon && <span className="text-[#006666]">{icon}</span>}
            {children}
        </span>
    );
}

// ─── Render Field Value ────────────────────────────────────────────────────────
const renderFieldValue = (
    field: FieldConfig,
    formatCurrency: (amount: number, currency: string) => string
): React.ReactNode => {
    const { type, value, data, count } = field;

    switch (type) {
        case "tags":
            if (Array.isArray(data) && data.length) {
                return (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {(data as string[]).map((tag, i) => (
                            <TagPill key={i} icon={<Tag className="w-2.5 h-2.5" />}>{tag}</TagPill>
                        ))}
                    </div>
                );
            }
            return <span className={`${NEU_MUTED} italic`}>Not set</span>;

        case "boolean": {
            const bv = typeof value === "boolean" ? value : false;
            return (
                <div className="flex items-center gap-2 mt-0.5">
                    <div className={`${bv ? "bg-[#00A63D]" : "bg-[#E7E5E4]"} w-5 h-5 rounded-lg flex items-center justify-center ${bv ? "shadow-[inset_2px_2px_4px_#007a2d,inset_-1px_-1px_3px_#00c94d]" : "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]"}`}>
                        {bv
                            ? <CheckCircle className="w-3 h-3 text-white" />
                            : <XCircle className="w-3 h-3 text-[#1E2938]/30" />}
                    </div>
                    <span className={`${NEU_MONO} text-sm font-bold ${bv ? "text-[#00A63D]" : "text-[#1E2938]/40"}`}>
                        {bv ? "Yes" : "No"}
                    </span>
                </div>
            );
        }

        case "array":
            if (Array.isArray(data) && data.length) {
                return (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {(data as string[]).map((item, i) => (
                            <TagPill key={i}>{item}</TagPill>
                        ))}
                    </div>
                );
            }
            return <span className={`${NEU_MUTED} italic`}>Not set</span>;

        case "payment":
            if (Array.isArray(data) && data.length) {
                return (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {(data as string[]).map((method, i) => (
                            <span key={i} className={NEU_BADGE_PRIMARY}>
                                <CreditCard className="w-2.5 h-2.5" />{method}
                            </span>
                        ))}
                    </div>
                );
            }
            return <span className={`${NEU_MUTED} italic`}>Not set</span>;

        case "count":
            return (
                <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className={`${NEU_HEADING} text-xl`}>{count ?? 0}</span>
                    <span className={NEU_MUTED}>items</span>
                </div>
            );

        case "price": {
            const price = data as PriceDTO;
            return price
                ? <span className={`${NEU_HEADING} text-base text-[#006666]`}>{formatCurrency(price.amount, price.currency)}</span>
                : <span className={`${NEU_MUTED} italic`}>Not set</span>;
        }

        case "address":
            return <span className={`${NEU_MONO} text-sm break-words`}>{formatAddress(data as AddressDTO)}</span>;

        case "seo":
            return <span className={`${NEU_MONO} text-sm break-words`}>{formatSeo(data as { metaTitle?: string; metaDescription?: string })}</span>;

        case "duration":
            return <span className={`${NEU_MONO} text-sm`}>{formatDuration(data as { days: number; nights?: number })}</span>;

        case "accessibility":
            return <span className={`${NEU_MONO} text-sm`}>{formatAccessibility(data as AccessibilityDTO)}</span>;

        case "emergency":
            return <span className={`${NEU_MONO} text-sm`}>{formatEmergencyContacts(data as EmergencyContactsDTO)}</span>;

        case "translations":
            return <span className={`${NEU_MONO} text-sm`}>{formatTranslations(data as TranslationBlockDTO)}</span>;

        case "coordinates":
            return (
                <span className={`${NEU_MONO} text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#006666]`}>
                    {formatCoordinates(data as { lat: number; lng: number })}
                </span>
            );

        default:
            return value
                ? <span className={`${NEU_MONO} text-sm font-medium break-words`}>{value.toString()}</span>
                : <span className={`${NEU_MUTED} italic`}>Not set</span>;
    }
};

// ─── Detailed Section Render ───────────────────────────────────────────────────
interface DetailSectionProps {
    sectionId: string;
    data: unknown;
    formatDate: (d?: string) => string;
    formatCurrency: (amount: number, currency: string) => string;
    currency: string;
}

const renderDetailedSection = ({
    sectionId, data, formatDate, formatCurrency, currency,
}: DetailSectionProps): React.ReactNode => {
    switch (sectionId) {
        case "destinations": {
            const destinations = data as DestinationBlockDTO[];
            if (!destinations?.length) return null;
            return (
                <div className="space-y-3">
                    {destinations.map((dest, idx) => (
                        <div key={idx} className={`${NEU_CARD_SM} p-4`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`${NEU_BADGE_PRIMARY}`}>#{idx + 1}</span>
                                <span className={`${NEU_HEADING} text-sm`}>Destination {idx + 1}</span>
                            </div>
                            {dest.description && <p className={`${NEU_MUTED} mb-2`}>{dest.description}</p>}
                            {dest.highlights && dest.highlights.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {dest.highlights.map((h, i) => <TagPill key={i}>{h}</TagPill>)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        case "itinerary": {
            const itinerary = data as ItineraryEntryDTO[];
            if (!itinerary?.length) return null;
            return (
                <div className="space-y-3">
                    {itinerary.map((day, idx) => (
                        <div key={idx} className={`${NEU_CARD_SM} p-4`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className={`${NEU_HEADING} text-sm`}>Day {day.day}: {day.title || `Day ${day.day}`}</span>
                                <span className={NEU_BADGE_DEFAULT}>Day {day.day}</span>
                            </div>
                            {day.description && <p className={`${NEU_MUTED} mb-2`}>{day.description}</p>}
                            {day.activities && day.activities.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {day.activities.map((a, i) => <TagPill key={i}>{a}</TagPill>)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        case "discounts": {
            const discounts = data as DiscountDTO[];
            if (!discounts?.length) return null;
            return (
                <div className="space-y-3">
                    {discounts.map((d, idx) => (
                        <div key={idx} className={`${NEU_CARD_SM} p-4`}>
                            <div className="flex items-center justify-between">
                                <span className={`${NEU_HEADING} text-sm`}>{d.discount}</span>
                                <span className={NEU_BADGE_SUCCESS}>
                                    {d.type === TOUR_DISCOUNT_TYPE.PERCENTAGE ? `${d.value}%` : formatCurrency(d.value, currency)}
                                </span>
                            </div>
                            {d.code && <p className={`${NEU_MUTED} mt-1`}>Code: <span className={`${NEU_BADGE_PRIMARY} ml-1`}>{d.code}</span></p>}
                            {d.validFrom && (
                                <p className={`${NEU_MUTED} mt-1`}>{formatDate(d.validFrom)} — {formatDate(d.validUntil)}</p>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        case "inclusions": {
            const inclusions = data as InclusionDTO[];
            if (!inclusions?.length) return null;
            return (
                <div className="space-y-2">
                    {inclusions.map((inc, idx) => (
                        <div key={idx} className={`${NEU_CARD_SM} p-3 flex items-start gap-3`}>
                            <div className="w-5 h-5 rounded-lg bg-[#00A63D]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <CheckCircle className="w-3 h-3 text-[#00A63D]" />
                            </div>
                            <div>
                                <span className={`${NEU_HEADING} text-sm`}>{inc.label}</span>
                                {inc.description && <p className={NEU_MUTED}>{inc.description}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        case "exclusions": {
            const exclusions = data as ExclusionDTO[];
            if (!exclusions?.length) return null;
            return (
                <div className="space-y-2">
                    {exclusions.map((ex, idx) => (
                        <div key={idx} className={`${NEU_CARD_SM} p-3 flex items-start gap-3`}>
                            <div className="w-5 h-5 rounded-lg bg-[#FF2157]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <XCircle className="w-3 h-3 text-[#FF2157]" />
                            </div>
                            <div>
                                <span className={`${NEU_HEADING} text-sm`}>{ex.label}</span>
                                {ex.description && <p className={NEU_MUTED}>{ex.description}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        case "packing": {
            const packing = data as PackingListItemDTO[];
            if (!packing?.length) return null;
            return (
                <div className="space-y-2">
                    {packing.map((item, idx) => (
                        <div key={idx} className={`${NEU_CARD_SM} p-3 flex items-start gap-3`}>
                            <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${item.required ? "bg-[#006666]/10" : "bg-[#E7E5E4] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]"}`}>
                                {item.required
                                    ? <CheckCircle className="w-3 h-3 text-[#006666]" />
                                    : <Info className="w-3 h-3 text-[#1E2938]/40" />}
                            </div>
                            <div>
                                <span className={`${NEU_HEADING} text-sm`}>{item.item}</span>
                                {item.notes && <p className={NEU_MUTED}>{item.notes}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        case "cancellation": {
            const policy = data as CancellationPolicyDTO;
            if (!policy) return null;
            return (
                <div className={`${NEU_CARD_SM} p-4 space-y-3`}>
                    <span className={policy.refundable ? NEU_BADGE_SUCCESS : NEU_BADGE_DANGER}>
                        {policy.refundable ? "Refundable" : "Non-refundable"}
                    </span>
                    {policy.rules?.length > 0 && (
                        <div className="space-y-2 mt-2">
                            <span className={NEU_LABEL}>Cancellation Rules</span>
                            {policy.rules.map((rule, idx) => (
                                <div key={idx} className={`${NEU_CARD_INSET} px-3 py-2 flex justify-between`}>
                                    <span className={NEU_MUTED}>{rule.daysBefore} days before</span>
                                    <span className={`${NEU_MONO} font-bold text-[#006666] text-sm`}>{rule.refundPercent}% refund</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        case "refund": {
            const policy = data as RefundPolicyDTO;
            if (!policy) return null;
            return (
                <div className={`${NEU_CARD_SM} p-4 space-y-3`}>
                    <div className="flex items-center gap-3">
                        <span className={NEU_LABEL}>Processing Time</span>
                        <span className={`${NEU_HEADING} text-sm text-[#006666]`}>{policy.processingDays} days</span>
                    </div>
                    {policy.method?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {policy.method.map((m, i) => <TagPill key={i}>{m}</TagPill>)}
                        </div>
                    )}
                </div>
            );
        }

        default:
            return null;
    }
};

// ─── Animation Variants ────────────────────────────────────────────────────────
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants: Variants = {
    hidden: { y: 12, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 18 } },
};
const fieldVariants: Variants = {
    hidden: { opacity: 0, x: -8 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ReviewStep() {
    const { values } = useFormikContext<CreateTourDTO>();

    const formatCurrency = (amount: number, currency: string) =>
        new Intl.NumberFormat("en-BD", { style: "currency", currency, minimumFractionDigits: 0 }).format(amount);

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Not set";
        try {
            return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        } catch { return "Invalid date"; }
    };

    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        basic: true, bangladesh: true, content: false, logistics: false,
        pricing: false, compliance: false, policies: false, emergency: false, translations: false,
    });

    const toggleSection = (id: string) =>
        setExpandedSections((p) => ({ ...p, [id]: !p[id] }));

    const calculateCompletion = (): number => {
        const required = ['title', 'summary', 'tourType', 'division', 'district', 'difficulty', 'bestSeason', 'basePrice', 'paymentMethods', 'ageSuitability', 'cancellationPolicy', 'refundPolicy', 'terms'];
        const done = required.filter((f) => {
            const v = values[f as keyof CreateTourDTO];
            if (Array.isArray(v)) return v.length > 0;
            if (typeof v === "object" && v !== null) return Object.keys(v).length > 0;
            return !!v;
        }).length;
        return Math.round((done / required.length) * 100);
    };

    const sections: SectionConfig[] = [
        {
            id: "basic", title: "Basic Information", icon: FileText,
            accentColor: "text-[#00A63D]", accentBg: "bg-[#00A63D]/10",
            fields: [
                { label: "Title", value: values.title, icon: FileText, type: "text", status: values.title ? "success" : "error", required: true, tooltip: "Required: 10–200 characters" },
                { label: "Summary", value: values.summary, icon: BookOpen, type: "text", status: values.summary ? "success" : "error", required: true, tooltip: "Required: 50–500 characters" },
                { label: "SEO Settings", value: values.seo ? "Configured" : "Not set", icon: Globe2, type: "seo", data: values.seo, status: values.seo?.metaTitle ? "success" : "default" },
                { label: "Tags", value: values.tags?.join(", "), icon: Tag, type: "tags", data: values.tags, status: values.tags?.length ? "success" : "default" },
            ],
        },
        {
            id: "bangladesh", title: "Bangladesh Specific", icon: MapPin,
            accentColor: "text-[#006666]", accentBg: "bg-[#006666]/10",
            fields: [
                { label: "Tour Type", value: values.tourType, icon: Flag, type: "text", status: values.tourType ? "success" : "error", required: true },
                { label: "Division", value: values.division, icon: Map, type: "text", status: values.division ? "success" : "error", required: true },
                { label: "District", value: values.district, icon: MapPin, type: "text", status: values.district ? "success" : "error", required: true },
                { label: "Accommodation Types", value: values.accommodationType?.join(", "), icon: Bed, type: "array", data: values.accommodationType, status: values.accommodationType?.length ? "success" : "default" },
                { label: "Guide Included", value: values.guideIncluded ?? true, icon: Users, type: "boolean", status: "default" },
                { label: "Transport Included", value: values.transportIncluded ?? true, icon: Bus, type: "boolean", status: "default" },
            ],
        },
        {
            id: "content", title: "Content & Itinerary", icon: BookOpen,
            accentColor: "text-[#FE9900]", accentBg: "bg-[#FE9900]/10",
            fields: [
                { label: "Destinations", value: `${values.destinations?.length || 0} destinations`, icon: MapPinned, type: "destinations", count: values.destinations?.length, data: values.destinations, status: values.destinations?.length ? "success" : "default" },
                { label: "Itinerary Days", value: `${values.itinerary?.length || 0} days`, icon: CalendarDays, type: "itinerary", count: values.itinerary?.length, data: values.itinerary, status: values.itinerary?.length ? "success" : "default" },
                { label: "Inclusions", value: `${values.inclusions?.length || 0} inclusions`, icon: CheckCircle, type: "inclusions", count: values.inclusions?.length, data: values.inclusions, status: values.inclusions?.length ? "success" : "default" },
                { label: "Exclusions", value: `${values.exclusions?.length || 0} exclusions`, icon: XCircle, type: "exclusions", count: values.exclusions?.length, data: values.exclusions, status: values.exclusions?.length ? "success" : "default" },
                { label: "Difficulty Level", value: values.difficulty, icon: Mountain, type: "text", status: values.difficulty ? "success" : "error", required: true },
                { label: "Best Seasons", value: values.bestSeason?.join(", "), icon: Thermometer, type: "array", data: values.bestSeason, status: values.bestSeason?.length ? "success" : "error", required: true },
                { label: "Target Audience", value: values.audience?.join(", "), icon: Target, type: "array", data: values.audience, status: values.audience?.length ? "success" : "default" },
                { label: "Categories", value: values.categories?.join(", "), icon: Layers, type: "array", data: values.categories, status: values.categories?.length ? "success" : "default" },
            ],
        },
        {
            id: "logistics", title: "Logistics & Transport", icon: Navigation,
            accentColor: "text-[#006666]", accentBg: "bg-[#006666]/10",
            fields: [
                { label: "Main Location", value: values.mainLocation?.address ? "Address set" : "Not set", icon: Home, type: "address", data: values.mainLocation?.address, status: values.mainLocation?.address ? "success" : "default" },
                { label: "Coordinates", value: values.mainLocation?.coordinates ? "Set" : "Not set", icon: MapPin, type: "coordinates", data: values.mainLocation?.coordinates, status: values.mainLocation?.coordinates ? "success" : "default" },
                { label: "Transport Modes", value: values.transportModes?.join(", "), icon: Bus, type: "array", data: values.transportModes, status: values.transportModes?.length ? "success" : "default" },
                { label: "Pickup Options", value: `${values.pickupOptions?.length || 0} options`, icon: Navigation, type: "pickup", count: values.pickupOptions?.length, data: values.pickupOptions, status: values.pickupOptions?.length ? "success" : "default" },
                { label: "Meeting Point", value: values.meetingPoint || "Not set", icon: Map, type: "text" },
                { label: "Packing List", value: `${values.packingList?.length || 0} items`, icon: Package, type: "packing", count: values.packingList?.length, data: values.packingList, status: values.packingList?.length ? "success" : "default" },
            ],
        },
        {
            id: "pricing", title: "Pricing & Commerce", icon: FaBangladeshiTakaSign,
            accentColor: "text-[#00A63D]", accentBg: "bg-[#00A63D]/10",
            fields: [
                { label: "Base Price", value: formatCurrency(values.basePrice.amount, values.basePrice.currency), icon: FaBangladeshiTakaSign, type: "price", data: values.basePrice, status: "success", required: true },
                { label: "Discounts", value: `${values.discounts?.length || 0} discounts`, icon: Percent, type: "discounts", count: values.discounts?.length, data: values.discounts, status: values.discounts?.length ? "success" : "default" },
                { label: "Duration", value: formatDuration(values.duration), icon: Clock, type: "duration", data: values.duration, status: values.duration?.days ? "success" : "default" },
                { label: "Operating Windows", value: `${values.operatingWindows?.length || 0} windows`, icon: Calendar, type: "windows", count: values.operatingWindows?.length, data: values.operatingWindows, status: values.operatingWindows?.length ? "success" : "default" },
                { label: "Departures", value: `${values.departures?.length || 0} scheduled`, icon: CalendarDays, type: "departures", count: values.departures?.length, data: values.departures, status: values.departures?.length ? "success" : "default" },
                { label: "Payment Methods", value: values.paymentMethods?.join(", "), icon: CreditCard, type: "payment", data: values.paymentMethods, status: values.paymentMethods?.length ? "success" : "error", required: true },
            ],
        },
        {
            id: "compliance", title: "Compliance & Accessibility", icon: Shield,
            accentColor: "text-[#FF2157]", accentBg: "bg-[#FF2157]/10",
            fields: [
                { label: "License Required", value: values.licenseRequired ?? false, icon: ShieldAlert, type: "boolean" },
                { label: "Age Suitability", value: values.ageSuitability, icon: Baby, type: "text", status: values.ageSuitability ? "success" : "error", required: true },
                { label: "Accessibility Features", value: formatAccessibility(values.accessibility), icon: AccessibilityIcon, type: "accessibility", data: values.accessibility, status: values.accessibility ? "success" : "default" },
            ],
        },
        {
            id: "policies", title: "Policies & Terms", icon: FileCheck,
            accentColor: "text-[#1E2938]", accentBg: "bg-[#1E2938]/10",
            fields: [
                { label: "Cancellation Policy", value: values.cancellationPolicy ? "Configured" : "Not set", icon: Timer, type: "cancellation", data: values.cancellationPolicy, status: values.cancellationPolicy ? "success" : "error", required: true },
                { label: "Refund Policy", value: values.refundPolicy ? "Configured" : "Not set", icon: FaBangladeshiTakaSign, type: "refund", data: values.refundPolicy, status: values.refundPolicy ? "success" : "error", required: true },
                { label: "Terms & Conditions", value: values.terms ? "Set" : "Not set", icon: FileText, type: "text", status: values.terms ? "success" : "error", required: true },
            ],
        },
        {
            id: "emergency", title: "Emergency Contacts", icon: Phone,
            accentColor: "text-[#FE9900]", accentBg: "bg-[#FE9900]/10",
            fields: [
                { label: "Emergency Contacts", value: formatEmergencyContacts(values.emergencyContacts), icon: Shield, type: "emergency", data: values.emergencyContacts, status: values.emergencyContacts ? "success" : "default" },
            ],
        },
        {
            id: "translations", title: "Translations", icon: Languages,
            accentColor: "text-[#006666]", accentBg: "bg-[#006666]/10",
            fields: [
                { label: "Available Translations", value: formatTranslations(values.translations), icon: Languages, type: "translations", data: values.translations, status: values.translations ? "success" : "default" },
            ],
        },
    ];

    const complexSectionIds = ["destinations", "itinerary", "discounts", "inclusions", "exclusions", "packing", "cancellation", "refund"];
    const completionPct = calculateCompletion();
    const totalFields = sections.reduce((acc, s) => acc + s.fields.length, 0);
    const requiredFields = sections.flatMap((s) => s.fields).filter((f) => f.required).length;

    return (
        <div className={`${NEU_PAGE_BG} p-4 sm:p-6 lg:p-8`}>
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="max-w-5xl mx-auto"
            >
                {/* ── Page Header ───────────────────────────────────────────────────── */}
                <div className="mb-8">
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className={NEU_ICON_WELL_PRIMARY}>
                                <ShieldCheck className="w-6 h-6 text-[#006666]" />
                            </div>
                            <div>
                                <h1 className={`${NEU_HEADING} text-2xl sm:text-3xl`}>Tour Review</h1>
                                <p className={NEU_MUTED}>
                                    {totalFields} fields across {sections.length} sections
                                </p>
                            </div>
                        </div>

                        <div className={`${NEU_CARD_SM} px-4 py-3 text-right`}>
                            <p className={NEU_LABEL}>Sections</p>
                            <p className={`${NEU_HEADING} text-3xl text-[#006666]`}>{sections.length}</p>
                        </div>
                    </div>

                    {/* Completion progress */}
                    <div className={`${NEU_CARD} p-4 sm:p-5`}>
                        <div className="flex items-center justify-between mb-3">
                            <span className={NEU_LABEL}>Validation Status</span>
                            <span className={
                                completionPct === 100
                                    ? NEU_BADGE_SUCCESS
                                    : completionPct >= 80
                                        ? NEU_BADGE_WARNING
                                        : NEU_BADGE_DANGER
                            }>
                                {completionPct}% Valid
                            </span>
                        </div>
                        <div className={NEU_PROGRESS_TRACK}>
                            <motion.div
                                className={`h-full rounded-full ${completionPct === 100 ? "bg-[#00A63D]" : completionPct >= 80 ? "bg-[#FE9900]" : "bg-[#FF2157]"
                                    }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${completionPct}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Summary Stat Cards ─────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                    {[
                        {
                            label: "Tour Days",
                            value: values.duration?.days || 0,
                            icon: <Calendar className="w-6 h-6 text-[#006666]" />,
                        },
                        {
                            label: "Base Price",
                            value: formatCurrency(values.basePrice.amount, values.basePrice.currency),
                            icon: <FaBangladeshiTakaSign className="w-5 h-5 text-[#00A63D]" />,
                            small: true,
                        },
                        {
                            label: "Payment Methods",
                            value: values.paymentMethods.length,
                            icon: <CreditCard className="w-6 h-6 text-[#006666]" />,
                        },
                        {
                            label: "Tags",
                            value: values.tags?.length || 0,
                            icon: <Tag className="w-6 h-6 text-[#FE9900]" />,
                        },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className={NEU_STAT_CARD}
                        >
                            <div>
                                <p className={NEU_LABEL}>{stat.label}</p>
                                <p className={`${NEU_HEADING} ${stat.small ? "text-base mt-1" : "text-2xl mt-0.5"} text-[#1E2938]`}>
                                    {stat.value}
                                </p>
                            </div>
                            <div className={NEU_ICON_WELL}>{stat.icon}</div>
                        </motion.div>
                    ))}
                </div>

                {/* ── Sections ──────────────────────────────────────────────────────── */}
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                    {sections.map((section) => {
                        const isOpen = expandedSections[section.id];
                        const errorCount = section.fields.filter((f) => f.status === "error").length;

                        return (
                            <motion.div key={section.id} variants={itemVariants} className={NEU_CARD}>
                                {/* Section Header */}
                                <button
                                    type="button"
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 rounded-2xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`${NEU_ICON_WELL} ${section.accentBg}`}>
                                            <section.icon className={`w-5 h-5 ${section.accentColor}`} />
                                        </div>
                                        <div className="text-left">
                                            <h2 className={`${NEU_HEADING} text-base`}>{section.title}</h2>
                                            <p className={NEU_MUTED}>
                                                {section.fields.length} fields · {isOpen ? "Expanded" : "Collapsed"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {errorCount > 0 && (
                                            <span className={NEU_BADGE_DANGER}>{errorCount} missing</span>
                                        )}
                                        <div className={`${NEU_ICON_WELL_SM} transition-transform duration-300 ${isOpen ? "rotate-0" : "-rotate-90"}`}>
                                            <ChevronDown className="w-4 h-4 text-[#1E2938]/60" />
                                        </div>
                                    </div>
                                </button>

                                {/* Section Body */}
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            key="content"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="overflow-hidden"
                                        >
                                            <div className={`border-t ${NEU_DIVIDER} px-4 sm:px-5 py-5`}>
                                                {/* Fields Grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {section.fields.map((field, fi) => {
                                                        const { cls: badgeCls, label: badgeLabel } = getStatusBadge(field.status);
                                                        return (
                                                            <motion.div
                                                                key={field.label}
                                                                variants={fieldVariants}
                                                                initial="hidden"
                                                                animate="visible"
                                                                transition={{ delay: fi * 0.03 }}
                                                                className={`${NEU_CARD_SM} p-3.5 group`}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className={NEU_ICON_WELL_SM}>
                                                                        <field.icon className="w-3.5 h-3.5 text-[#1E2938]/60" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
                                                                            <span className={`${NEU_LABEL} flex items-center gap-1`}>
                                                                                {field.label}
                                                                                {field.required && <span className="text-[#FF2157]">*</span>}
                                                                                {field.tooltip && (
                                                                                    <span title={field.tooltip} className="cursor-help">
                                                                                        <Info className="w-2.5 h-2.5 text-[#1E2938]/30" />
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                            {field.status && (
                                                                                <span className={badgeCls}>{badgeLabel}</span>
                                                                            )}
                                                                        </div>
                                                                        <div className="mt-0.5">
                                                                            {renderFieldValue(field, formatCurrency)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Detailed View for complex sections */}
                                                {section.fields.some((f) => complexSectionIds.includes(f.type) && Array.isArray(f.data) && (f.data as unknown[]).length > 0) && (
                                                    <div className={`mt-5 pt-5 border-t ${NEU_DIVIDER}`}>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className={NEU_ICON_WELL_SM}>
                                                                <Eye className="w-3.5 h-3.5 text-[#006666]" />
                                                            </div>
                                                            <span className={`${NEU_LABEL} text-[#006666]`}>Detailed View</span>
                                                        </div>
                                                        {section.fields
                                                            .filter((f) => complexSectionIds.includes(f.type) && Array.isArray(f.data) && (f.data as unknown[]).length > 0)
                                                            .map((f) => (
                                                                <div key={f.label}>
                                                                    {renderDetailedSection({
                                                                        sectionId: f.type,
                                                                        data: f.data,
                                                                        formatDate,
                                                                        formatCurrency,
                                                                        currency: values.basePrice.currency,
                                                                    })}
                                                                </div>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}

                    {/* ── Validation Summary ───────────────────────────────────────────── */}
                    <motion.div variants={itemVariants} className={NEU_CARD}>
                        <div className="p-4 sm:p-5">
                            <div className="flex items-center gap-3 mb-5">
                                <div className={`${NEU_ICON_WELL} bg-[#1E2938]/5`}>
                                    <BarChart className="w-5 h-5 text-[#1E2938]/70" />
                                </div>
                                <h3 className={`${NEU_HEADING} text-base`}>Validation Summary</h3>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: "Total Fields", value: totalFields, color: "text-[#1E2938]" },
                                    { label: "Required", value: requiredFields, color: "text-[#FF2157]" },
                                    { label: "Optional", value: totalFields - requiredFields, color: "text-[#1E2938]/60" },
                                    {
                                        label: "Errors",
                                        value: sections.flatMap((s) => s.fields).filter((f) => f.status === "error").length,
                                        color: "text-[#FF2157]",
                                    },
                                ].map((stat, i) => (
                                    <div key={i} className={`${NEU_CARD_INSET} p-3 text-center`}>
                                        <p className={NEU_LABEL}>{stat.label}</p>
                                        <p className={`${NEU_HEADING} text-2xl mt-1 ${stat.color}`}>{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Final Verification ───────────────────────────────────────────── */}
                    <motion.div variants={itemVariants} className={NEU_CARD}>
                        <div className="p-4 sm:p-5 flex items-start gap-4">
                            <div className={`${NEU_ICON_WELL_PRIMARY} flex-shrink-0`}>
                                <ShieldCheck className="w-6 h-6 text-[#006666]" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                                    <h4 className={`${NEU_HEADING} text-base`}>Final Verification</h4>
                                    <span className={completionPct === 100 ? NEU_BADGE_SUCCESS : NEU_BADGE_WARNING}>
                                        {completionPct === 100 ? "Ready to Submit" : "Review Required"}
                                    </span>
                                </div>

                                <p className={`${NEU_MUTED} leading-relaxed`}>
                                    By submitting, you confirm that all information is accurate and complies with our terms of service.
                                    {completionPct < 100 && (
                                        <span className="block mt-2 font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#FE9900]">
                                            ⚠ Some required fields are incomplete. Please review sections with errors.
                                        </span>
                                    )}
                                </p>

                                <div className={`flex flex-wrap items-center gap-4 mt-4 pt-4 border-t ${NEU_DIVIDER}`}>
                                    <div className="flex items-center gap-2">
                                        <div className={NEU_ICON_WELL_SM}>
                                            <Clock className="w-3.5 h-3.5 text-[#1E2938]/50" />
                                        </div>
                                        <span className={NEU_MUTED}>Updated {new Date().toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={NEU_ICON_WELL_SM}>
                                            <Eye className="w-3.5 h-3.5 text-[#1E2938]/50" />
                                        </div>
                                        <span className={NEU_MUTED}>Preview available before submission</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                <div className="h-20" />
            </motion.div>
        </div>
    );
}