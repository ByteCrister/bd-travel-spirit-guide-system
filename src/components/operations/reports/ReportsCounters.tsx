// components/reports/ReportsCounters.tsx
// Neumorphism design system — Space Mono + JetBrains Mono
// primary=#006666 | surface=#E7E5E4 | text=#1E2938

"use client";

import type { FC } from "react";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { REPORT_STATUS, REPORT_PRIORITY } from "@/types/tour/reports.types";
import type { ReportListItem } from "@/types/tour/reports.types";
import { MdReport, MdPriorityHigh } from "react-icons/md";
import { HiCheckCircle, HiClock, HiExclamationCircle, HiXCircle } from "react-icons/hi";
import { useReportsStore } from "@/store/report.store";

const SURFACE = "#E7E5E4";
const SHADOW_OUT = "6px 6px 14px #c4c2c0, -6px -6px 14px #ffffff";
const SHADOW_IN = "inset 4px 4px 8px #c4c2c0, inset -4px -4px 8px #ffffff";

const statusOrder: Array<keyof typeof REPORT_STATUS> = ["OPEN", "IN_REVIEW", "RESOLVED", "REJECTED"];
const priorityOrder: Array<keyof typeof REPORT_PRIORITY> = ["URGENT", "HIGH", "NORMAL", "LOW"];

const statusConfig: Record<string, { icon: FC<{ size?: number; style?: React.CSSProperties }>; accent: string; label: string }> = {
    open: { icon: HiExclamationCircle, accent: "#FE9900", label: "Open" },
    in_review: { icon: HiClock, accent: "#006666", label: "In Review" },
    resolved: { icon: HiCheckCircle, accent: "#00A63D", label: "Resolved" },
    rejected: { icon: HiXCircle, accent: "#FF2157", label: "Rejected" },
};

const priorityConfig: Record<string, { accent: string }> = {
    urgent: { accent: "#FF2157" },
    high: { accent: "#FE9900" },
    normal: { accent: "#006666" },
    low: { accent: "#8899aa" },
};

const ReportsCounters: FC = () => {
    const { params, readCachedList } = useReportsStore();
    const currentEntry = readCachedList(params);

    const docs: ReportListItem[] = useMemo(
        () => currentEntry?.pages.get(params.page ?? 1) ?? [],
        [currentEntry, params.page]
    );

    const byStatus = useMemo(() => {
        const m = new Map<string, number>();
        statusOrder.forEach((k) => m.set(REPORT_STATUS[k], 0));
        for (const d of docs) m.set(d.status, (m.get(d.status) ?? 0) + 1);
        return m;
    }, [docs]);

    const byPriority = useMemo(() => {
        const m = new Map<string, number>();
        priorityOrder.forEach((k) => m.set(REPORT_PRIORITY[k], 0));
        for (const d of docs) m.set(d.priority, (m.get(d.priority) ?? 0) + 1);
        return m;
    }, [docs]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Status Card */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                style={{ backgroundColor: SURFACE, borderRadius: 16, padding: "18px 20px", boxShadow: SHADOW_OUT }}
            >
                {/* Card header */}
                <div className="flex items-center gap-3 mb-4">
                    <div
                        style={{
                            width: 36, height: 36, borderRadius: 10,
                            backgroundColor: SURFACE, boxShadow: SHADOW_OUT,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        <MdReport size={18} style={{ color: "#006666" }} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold" style={{ color: "#1E2938", fontFamily: "var(--font-space-mono)" }}>
                            Report Status
                        </h2>
                        <p className="text-[11px]" style={{ color: "#5a6475", fontFamily: "var(--font-jetbrains-mono)" }}>
                            Current page overview
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {statusOrder.map((k, index) => {
                        const label = REPORT_STATUS[k];
                        const count = byStatus.get(label) ?? 0;
                        const cfg = statusConfig[label.toLowerCase().replace(" ", "_")] ?? statusConfig.open;
                        const Icon = cfg.icon;

                        return (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25, delay: index * 0.05 }}
                                style={{
                                    backgroundColor: SURFACE,
                                    borderRadius: 12,
                                    padding: "12px 14px",
                                    boxShadow: SHADOW_IN,
                                    cursor: "default",
                                }}
                                role="group"
                                aria-label={`${label} count: ${count}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <Icon size={18} style={{ color: cfg.accent }} />
                                    <motion.span
                                        key={count}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        className="text-xl font-bold"
                                        style={{ color: cfg.accent, fontFamily: "var(--font-space-mono)" }}
                                    >
                                        {count}
                                    </motion.span>
                                </div>
                                <p
                                    className="text-[11px] font-semibold uppercase tracking-wide"
                                    style={{ color: "#5a6475", fontFamily: "var(--font-jetbrains-mono)" }}
                                >
                                    {label.replace("_", " ")}
                                </p>
                                {/* accent underline */}
                                <div
                                    style={{
                                        marginTop: 8, height: 2, borderRadius: 1,
                                        backgroundColor: cfg.accent, opacity: 0.35,
                                    }}
                                />
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Priority Card */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.07 }}
                style={{ backgroundColor: SURFACE, borderRadius: 16, padding: "18px 20px", boxShadow: SHADOW_OUT }}
            >
                <div className="flex items-center gap-3 mb-4">
                    <div
                        style={{
                            width: 36, height: 36, borderRadius: 10,
                            backgroundColor: SURFACE, boxShadow: SHADOW_OUT,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        <MdPriorityHigh size={18} style={{ color: "#FF2157" }} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold" style={{ color: "#1E2938", fontFamily: "var(--font-space-mono)" }}>
                            Priority Levels
                        </h2>
                        <p className="text-[11px]" style={{ color: "#5a6475", fontFamily: "var(--font-jetbrains-mono)" }}>
                            Urgency breakdown
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {priorityOrder.map((k, index) => {
                        const label = REPORT_PRIORITY[k];
                        const count = byPriority.get(label) ?? 0;
                        const cfg = priorityConfig[label.toLowerCase()] ?? priorityConfig.normal;

                        return (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25, delay: index * 0.05 }}
                                style={{
                                    backgroundColor: SURFACE,
                                    borderRadius: 12,
                                    padding: "12px 14px",
                                    boxShadow: SHADOW_IN,
                                }}
                                role="group"
                                aria-label={`${label} priority count: ${count}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span
                                        style={{
                                            width: 8, height: 8, borderRadius: "50%",
                                            backgroundColor: cfg.accent,
                                            boxShadow: `0 0 6px ${cfg.accent}80`,
                                            display: "inline-block",
                                        }}
                                    />
                                    <motion.span
                                        key={count}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        className="text-xl font-bold"
                                        style={{ color: cfg.accent, fontFamily: "var(--font-space-mono)" }}
                                    >
                                        {count}
                                    </motion.span>
                                </div>
                                <p
                                    className="text-[11px] font-semibold uppercase tracking-wide"
                                    style={{ color: "#5a6475", fontFamily: "var(--font-jetbrains-mono)" }}
                                >
                                    {label}
                                </p>
                                <div
                                    style={{
                                        marginTop: 8, height: 2, borderRadius: 1,
                                        backgroundColor: cfg.accent, opacity: 0.35,
                                    }}
                                />
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
};

export default ReportsCounters;