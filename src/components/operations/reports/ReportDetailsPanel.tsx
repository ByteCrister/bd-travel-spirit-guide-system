// components/reports/ReportDetailsPanel.tsx
"use client";

import type { FC } from "react";
import { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import type { ReportFull } from "@/types/tour/reports.types";
import { useReportsStore } from "@/store/report.store";
import { PulseLoader } from "./PulseLoader";
import { formatDateTime } from "@/utils/helpers/format.reports";
import {
    MdPerson,
    MdEmail,
    MdTour,
    MdLink,
    MdBusiness,
    MdAssignment,
    MdPriorityHigh,
    MdToggleOn,
    MdRefresh,
    MdMessage,
    MdNotes,
    MdImage,
    MdAttachFile,
    MdLocalOffer,
    MdCalendarToday,
    MdUpdate,
    MdCheckCircle,
    MdWarning,
} from "react-icons/md";

/* ─── Design tokens ──────────────────────────────────────────────── */
const surface = "#E7E5E4";
const primary = "#006666";
const text = "#1E2938";

const nmCard: React.CSSProperties = {
    background: surface,
    boxShadow:
        "8px 8px 18px rgba(0,0,0,0.13), -5px -5px 14px rgba(255,255,255,0.72)",
    borderRadius: "14px",
    border: "none",
};

const nmInset: React.CSSProperties = {
    background: surface,
    boxShadow:
        "inset 4px 4px 8px rgba(0,0,0,0.10), inset -3px -3px 7px rgba(255,255,255,0.65)",
    borderRadius: "10px",
};

const nmIconPill = (color: string): React.CSSProperties => ({
    background: surface,
    boxShadow: `3px 3px 7px rgba(0,0,0,0.13), -2px -2px 5px rgba(255,255,255,0.68)`,
    borderRadius: "8px",
    padding: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color,
});

const nmBadge = (color: string): React.CSSProperties => ({
    background: surface,
    boxShadow:
        "inset 2px 2px 4px rgba(0,0,0,0.09), inset -1px -1px 3px rgba(255,255,255,0.60)",
    borderRadius: "6px",
    padding: "3px 10px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    fontWeight: 600,
    color,
    fontFamily: "var(--font-space-mono, 'Space Mono', monospace)",
    letterSpacing: "0.04em",
});

const nmTagBadge: React.CSSProperties = {
    background: surface,
    boxShadow:
        "inset 2px 2px 4px rgba(0,0,0,0.09), inset -1px -1px 3px rgba(255,255,255,0.60)",
    borderRadius: "999px",
    padding: "3px 12px",
    fontSize: "11px",
    fontWeight: 600,
    color: primary,
    fontFamily: "var(--font-space-mono, 'Space Mono', monospace)",
};

/* ─── Shared font vars ───────────────────────────────────────────── */
const monoFont = {
    fontFamily: "var(--font-jetbrains-mono, 'JetBrains Mono', monospace)",
};
const displayFont = {
    fontFamily: "var(--font-space-mono, 'Space Mono', monospace)",
};

/* ─── Animation variants ─────────────────────────────────────────── */
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 16, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
};

/* ─── Sub-components ─────────────────────────────────────────────── */
const SectionCard: FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = "",
}) => (
    <div style={nmCard} className={`p-5 ${className}`}>
        {children}
    </div>
);

const CardHeader: FC<{ icon: React.ReactNode; title: string }> = ({
    icon,
    title,
}) => (
    <div className="flex items-center gap-3 mb-4">
        <div style={nmIconPill(primary)}>{icon}</div>
        <h3
            style={{ ...displayFont, color: text }}
            className="text-xs font-bold uppercase tracking-widest"
        >
            {title}
        </h3>
    </div>
);

const InfoRow: FC<{
    icon: FC<{ size?: number; style?: React.CSSProperties }>;
    label: string;
    value: string;
    iconColor?: string;
}> = ({ icon: Icon, label, value, iconColor = primary }) => (
    <div className="flex items-start gap-3">
        <Icon size={16} style={{ color: iconColor, marginTop: 2, flexShrink: 0 }} />
        <div className="flex-1 min-w-0">
            <div
                style={{ ...displayFont, color: `${text}88`, fontSize: "10px", letterSpacing: "0.06em" }}
                className="uppercase font-semibold mb-0.5"
            >
                {label}
            </div>
            <div
                style={{ ...monoFont, color: text, fontSize: "13px" }}
                className="truncate"
            >
                {value}
            </div>
        </div>
    </div>
);

const Divider: FC = () => (
    <div
        style={{
            height: 1,
            background: `linear-gradient(to right, transparent, ${text}18, transparent)`,
            margin: "12px 0",
        }}
    />
);

/* ─── Main component ─────────────────────────────────────────────── */
export const ReportDetailsPanel: FC<{ reportId: string }> = ({ reportId }) => {
    const { detailsCache } = useReportsStore();
    const cache = detailsCache[reportId];
    const loading = cache?.loading ?? false;
    const error = cache?.error ?? null;
    const report: ReportFull | null = useMemo(() => cache?.data ?? null, [cache]);

    /* ── Loading ── */
    if (loading && !report) {
        return (
            <div className="p-8 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div
                        style={{
                            ...nmCard,
                            padding: "20px",
                            borderRadius: "16px",
                        }}
                        className="flex flex-col items-center gap-3"
                    >
                        <PulseLoader size={10} />
                        <span
                            style={{ ...displayFont, color: `${text}70`, fontSize: "11px", letterSpacing: "0.1em" }}
                            className="uppercase font-semibold"
                        >
                            Loading details...
                        </span>
                    </div>
                </motion.div>
            </div>
        );
    }

    /* ── Error ── */
    if (error && !report) {
        return (
            <div className="p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div
                        style={{
                            ...nmCard,
                            borderLeft: "3px solid #FF2157",
                            padding: "20px",
                        }}
                        className="flex items-center gap-4"
                    >
                        <div style={nmIconPill("#FF2157")}>
                            <MdWarning size={22} />
                        </div>
                        <div>
                            <p style={{ ...displayFont, color: text }} className="text-xs font-bold uppercase tracking-widest mb-1">
                                Failed to load
                            </p>
                            <p style={{ ...monoFont, color: `${text}70` }} className="text-xs">
                                {error}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!report) return null;

    return (
        <motion.div
            className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-4"
            style={{ background: surface }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* ── Reporter ── */}
            <motion.div variants={cardVariants}>
                <SectionCard>
                    <CardHeader icon={<MdPerson size={18} />} title="Reporter" />
                    <div className="space-y-3">
                        <InfoRow icon={MdPerson} label="Name" value={report.reporter?.name ?? "—"} />
                        <Divider />
                        <InfoRow icon={MdEmail} label="Email" value={report.reporter?.email ?? "—"} />
                    </div>
                </SectionCard>
            </motion.div>

            {/* ── Tour ── */}
            <motion.div variants={cardVariants}>
                <SectionCard>
                    <CardHeader icon={<MdTour size={18} />} title="Tour" />
                    <div className="space-y-3">
                        <InfoRow icon={MdTour} label="Title" value={report.tour?.title ?? "—"} />
                        <Divider />
                        <InfoRow icon={MdLink} label="Slug" value={report.tour?.slug ?? "—"} />
                        <Divider />
                        <InfoRow icon={MdBusiness} label="Company" value={report.tour?.companyId ?? "—"} />
                    </div>
                </SectionCard>
            </motion.div>

            {/* ── Assignment ── */}
            <motion.div variants={cardVariants}>
                <SectionCard>
                    <CardHeader icon={<MdAssignment size={18} />} title="Assignment" />
                    <div className="space-y-3">
                        <InfoRow icon={MdPriorityHigh} label="Priority" value={report.priority} iconColor="#FE9900" />
                        <Divider />
                        <InfoRow icon={MdToggleOn} label="Status" value={report.status} iconColor="#00A63D" />
                        <Divider />
                        <InfoRow icon={MdRefresh} label="Reopened" value={String(report.reopenedCount)} iconColor="#FF2157" />
                    </div>
                </SectionCard>
            </motion.div>

            {/* ── Message (spans 2 cols) ── */}
            <motion.div variants={cardVariants} className="lg:col-span-2">
                <SectionCard>
                    <CardHeader icon={<MdMessage size={18} />} title="Message" />

                    <div style={nmInset} className="p-4 mb-4">
                        <p style={{ ...monoFont, color: text, fontSize: "13px", lineHeight: 1.7 }}
                            className="whitespace-pre-wrap">
                            {report.message}
                        </p>
                    </div>

                    {report.resolutionNotes && (
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <MdNotes size={15} style={{ color: "#00A63D" }} />
                                <span style={{ ...displayFont, color: "#00A63D", fontSize: "10px", letterSpacing: "0.08em" }}
                                    className="uppercase font-bold">
                                    Resolution Notes
                                </span>
                            </div>
                            <div style={{ ...nmInset, borderLeft: "2px solid #00A63D" }} className="p-4 mb-4">
                                <p style={{ ...monoFont, color: text, fontSize: "13px", lineHeight: 1.7 }}
                                    className="whitespace-pre-wrap">
                                    {report.resolutionNotes}
                                </p>
                            </div>
                        </>
                    )}

                    {/* Timestamps */}
                    <div className="flex flex-wrap gap-2 pt-3" style={{ borderTop: `1px solid ${text}12` }}>
                        <span style={nmBadge(`${text}70`)}>
                            <MdCalendarToday size={12} />
                            Created: {formatDateTime(report.createdAt)}
                        </span>
                        <span style={nmBadge(`${text}70`)}>
                            <MdUpdate size={12} />
                            Updated: {formatDateTime(report.updatedAt)}
                        </span>
                        {report.resolvedAt && (
                            <span style={nmBadge("#00A63D")}>
                                <MdCheckCircle size={12} />
                                Resolved: {formatDateTime(report.resolvedAt)}
                            </span>
                        )}
                    </div>
                </SectionCard>
            </motion.div>

            {/* ── Evidence ── */}
            <motion.div variants={cardVariants}>
                <SectionCard>
                    <CardHeader icon={<MdAttachFile size={18} />} title="Evidence" />

                    <div className="space-y-5">
                        {/* Images */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <MdImage size={14} style={{ color: "#FF2157" }} />
                                <span style={{ ...displayFont, color: `${text}70`, fontSize: "10px", letterSpacing: "0.07em" }}
                                    className="uppercase font-semibold">
                                    Images
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(report.evidenceImages ?? []).length === 0 ? (
                                    <span style={{ ...monoFont, color: `${text}45`, fontSize: "12px" }}>No images</span>
                                ) : (
                                    report.evidenceImages!.map((src, idx) => (
                                        <motion.a
                                            key={src}
                                            href={src}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            initial={{ opacity: 0, scale: 0.85 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            style={{
                                                ...nmBadge("#FF2157"),
                                                textDecoration: "none",
                                                cursor: "pointer",
                                            }}
                                            title={`View image: ${src}`}
                                        >
                                            <MdImage size={12} />
                                            Image {idx + 1}
                                        </motion.a>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Links */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <MdLink size={14} style={{ color: primary }} />
                                <span style={{ ...displayFont, color: `${text}70`, fontSize: "10px", letterSpacing: "0.07em" }}
                                    className="uppercase font-semibold">
                                    Links
                                </span>
                            </div>
                            <div className="space-y-1.5">
                                {(report.evidenceLinks ?? []).length === 0 ? (
                                    <span style={{ ...monoFont, color: `${text}45`, fontSize: "12px" }}>No links</span>
                                ) : (
                                    report.evidenceLinks!.map((href, idx) => {
                                        const displayUrl = href
                                            .replace(/^https?:\/\//, "")
                                            .replace(/^www\./, "")
                                            .slice(0, 32) + (href.length > 32 ? "…" : "");
                                        return (
                                            <motion.a
                                                key={`${href}-${idx}`}
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                style={{
                                                    ...nmInset,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    padding: "6px 10px",
                                                    textDecoration: "none",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <MdLink size={13} style={{ color: primary, flexShrink: 0 }} />
                                                <span style={{ ...monoFont, color: primary, fontSize: "11px" }}
                                                    className="break-all">
                                                    {displayUrl}
                                                </span>
                                            </motion.a>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <MdLocalOffer size={14} style={{ color: primary }} />
                                <span style={{ ...displayFont, color: `${text}70`, fontSize: "10px", letterSpacing: "0.07em" }}
                                    className="uppercase font-semibold">
                                    Tags
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(report.tags ?? []).length === 0 ? (
                                    <span style={{ ...monoFont, color: `${text}45`, fontSize: "12px" }}>No tags</span>
                                ) : (
                                    report.tags!.map((t, idx) => (
                                        <motion.span
                                            key={t}
                                            initial={{ opacity: 0, scale: 0.85 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            style={nmTagBadge}
                                            className="inline-flex items-center gap-1"
                                        >
                                            <MdLocalOffer size={11} />
                                            {t}
                                        </motion.span>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </SectionCard>
            </motion.div>
        </motion.div>
    );
};