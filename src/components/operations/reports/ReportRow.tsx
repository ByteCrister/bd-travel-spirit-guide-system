// components/reports/ReportRow.tsx
// Neumorphism design system — Space Mono + JetBrains Mono
// primary=#006666 | surface=#E7E5E4 | text=#1E2938

"use client";

import type { FC } from "react";
import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ReportListItem } from "@/types/tour/reports.types";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import {
    MdExpandMore,
    MdCheckCircle,
    MdPending,
    MdCancel,
    MdSchedule,
} from "react-icons/md";
import { ReportActions } from "./ReportActions";
import { ReportDetailsPanel } from "./ReportDetailsPanel";
import { useReportsStore } from "@/store/report.store";
import { formatDateTime } from "@/utils/helpers/format.reports";
import { REPORT_STATUS } from "@/constants/tour/report.const";
import Image from "next/image";

const SURFACE = "#E7E5E4";
const SHADOW_OUT = "4px 4px 9px #c4c2c0, -4px -4px 9px #ffffff";
const SHADOW_IN = "inset 3px 3px 6px #c4c2c0, inset -3px -3px 6px #ffffff";
const PRIMARY = "#006666";
const TEXT = "#1E2938";
const MUTED = "#5a6475";

const statusMeta: Record<string, { icon: FC<{ size?: number; style?: React.CSSProperties }>; color: string; bg: string }> = {
    resolved: { icon: MdCheckCircle, color: "#00A63D", bg: "rgba(0,166,61,0.10)" },
    in_review: { icon: MdPending, color: "#FE9900", bg: "rgba(254,153,0,0.10)" },
    rejected: { icon: MdCancel, color: "#FF2157", bg: "rgba(255,33,87,0.10)" },
    open: { icon: MdSchedule, color: PRIMARY, bg: "rgba(0,102,102,0.10)" },
};

export const ReportRow: FC<{ item: ReportListItem }> = ({ item }) => {
    const { toggleSelect, selectedIds, fetchReportDetail, detailsCache } = useReportsStore();
    const [expanded, setExpanded] = useState(false);
    const [showResolvedTooltip, setShowResolvedTooltip] = useState(false);
    const detailsRegionId = useId();

    const isSelected = selectedIds.has(item._id);
    const isResolved = item.status === REPORT_STATUS.RESOLVED;

    const onToggleExpand = async () => {
        const next = !expanded;
        setExpanded(next);
        if (next) {
            const cache = detailsCache[item._id];
            if (!cache || !cache.data) await fetchReportDetail(item._id);
        }
    };

    const handleCheckboxChange = () => {
        if (isResolved) {
            setShowResolvedTooltip(true);
            setTimeout(() => setShowResolvedTooltip(false), 2000);
            return;
        }
        toggleSelect(item._id);
    };

    const normalizedStatus = item.status.toLowerCase().replace(" ", "_") as keyof typeof statusMeta;
    const meta = statusMeta[normalizedStatus] ?? statusMeta.open;
    const StatusIcon = meta.icon;

    const rowStyle: React.CSSProperties = {
        backgroundColor: isSelected ? "rgba(0,102,102,0.06)" : SURFACE,
        borderLeft: isSelected ? `3px solid ${PRIMARY}` : "3px solid transparent",
        transition: "background-color 0.15s ease, border-color 0.15s ease",
    };

    return (
        <>
            <TableRow style={rowStyle}>
                {/* Checkbox */}
                <TableCell className="relative">
                    <div className="relative">
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={handleCheckboxChange}
                            aria-label={`Select report ${item._id}`}
                            disabled={isResolved}
                            className={isResolved ? "cursor-not-allowed opacity-50" : ""}
                        />

                        <AnimatePresence>
                            {showResolvedTooltip && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    style={{
                                        position: "absolute",
                                        left: 0,
                                        bottom: "calc(100% + 8px)",
                                        zIndex: 50,
                                        backgroundColor: "#FF2157",
                                        color: "#fff",
                                        borderRadius: 8,
                                        padding: "6px 10px",
                                        fontSize: 11,
                                        fontFamily: "var(--font-space-mono)",
                                        whiteSpace: "nowrap",
                                        boxShadow: "0 4px 12px rgba(255,33,87,0.3)",
                                    }}
                                >
                                    <div className="flex items-center gap-1">
                                        <MdCancel size={12} />
                                        Already resolved
                                    </div>
                                    {/* arrow */}
                                    <div style={{
                                        position: "absolute",
                                        left: "50%",
                                        top: "100%",
                                        transform: "translateX(-50%)",
                                        borderLeft: "5px solid transparent",
                                        borderRight: "5px solid transparent",
                                        borderTop: "5px solid #FF2157",
                                    }} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </TableCell>

                {/* Report ID */}
                <TableCell>
                    <code
                        style={{
                            padding: "3px 7px",
                            borderRadius: 6,
                            backgroundColor: SURFACE,
                            boxShadow: SHADOW_IN,
                            fontSize: 11,
                            color: "#9966cc",
                            fontFamily: "var(--font-jetbrains-mono)",
                        }}
                    >
                        {item._id.slice(0, 8)}…
                    </code>
                </TableCell>

                {/* Tour */}
                <TableCell>
                    <div className="flex items-center gap-2">
                        <span
                            style={{
                                width: 6, height: 6, borderRadius: "50%",
                                backgroundColor: "#00A63D",
                                boxShadow: "0 0 4px #00A63D",
                                flexShrink: 0,
                            }}
                        />
                        <span
                            className="truncate max-w-[180px] text-sm font-medium"
                            style={{ color: TEXT, fontFamily: "var(--font-jetbrains-mono)" }}
                        >
                            {item.tour?.title ?? "—"}
                        </span>
                    </div>
                </TableCell>

                {/* Reason */}
                <TableCell>
                    <span
                        style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: 999,
                            backgroundColor: SURFACE,
                            boxShadow: SHADOW_IN,
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#FE9900",
                            fontFamily: "var(--font-space-mono)",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                        }}
                    >
                        {item.reason.replace("_", " ")}
                    </span>
                </TableCell>

                {/* Reporter */}
                <TableCell>
                    <div className="flex items-center gap-2">
                        {item.reporter?.avatarUrl ? (
                            <div
                                style={{
                                    width: 30, height: 30, borderRadius: "50%",
                                    overflow: "hidden",
                                    boxShadow: SHADOW_OUT,
                                    flexShrink: 0,
                                }}
                            >
                                <Image
                                    src={item.reporter.avatarUrl}
                                    alt={item.reporter.name || "Reporter Avatar"}
                                    width={30}
                                    height={30}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        ) : (
                            <div
                                style={{
                                    width: 30, height: 30, borderRadius: "50%",
                                    backgroundColor: SURFACE,
                                    boxShadow: SHADOW_OUT,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 12, fontWeight: 700,
                                    color: PRIMARY,
                                    fontFamily: "var(--font-space-mono)",
                                    flexShrink: 0,
                                }}
                            >
                                {(item.reporter?.name ?? item.reporter?.email ?? "?")[0].toUpperCase()}
                            </div>
                        )}
                        <span
                            className="text-xs"
                            style={{ color: TEXT, fontFamily: "var(--font-jetbrains-mono)" }}
                        >
                            {item.reporter?.name ?? item.reporter?.email ?? "—"}
                        </span>
                    </div>
                </TableCell>

                {/* Created */}
                <TableCell>
                    <div className="flex flex-col">
                        <span
                            className="text-xs font-semibold"
                            style={{ color: TEXT, fontFamily: "var(--font-jetbrains-mono)" }}
                        >
                            {formatDateTime(item.createdAt).split(" ")[0]}
                        </span>
                        <span
                            className="text-[11px]"
                            style={{ color: MUTED, fontFamily: "var(--font-jetbrains-mono)" }}
                        >
                            {formatDateTime(item.createdAt).split(" ").slice(1).join(" ")}
                        </span>
                    </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "4px 10px",
                            borderRadius: 8,
                            backgroundColor: meta.bg,
                            boxShadow: SHADOW_IN,
                        }}
                    >
                        <StatusIcon size={14} style={{ color: meta.color }} />
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: meta.color,
                                fontFamily: "var(--font-space-mono)",
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                            }}
                        >
                            {item.status.replace("_", " ")}
                        </span>
                    </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        {/* Expand button — neumorphic */}
                        <button
                            aria-expanded={expanded}
                            aria-controls={detailsRegionId}
                            onClick={onToggleExpand}
                            style={{
                                width: 32, height: 32, borderRadius: 8, border: "none",
                                backgroundColor: SURFACE,
                                boxShadow: expanded ? SHADOW_IN : SHADOW_OUT,
                                color: expanded ? PRIMARY : MUTED,
                                cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "box-shadow 0.2s ease, color 0.2s ease",
                            }}
                        >
                            <motion.span
                                animate={{ rotate: expanded ? 180 : 0 }}
                                transition={{ duration: 0.25 }}
                                style={{ display: "flex" }}
                            >
                                <MdExpandMore size={20} aria-hidden />
                            </motion.span>
                        </button>

                        <ReportActions item={item} />
                    </div>
                </TableCell>
            </TableRow>

            {/* Expanded Details Panel */}
            <AnimatePresence initial={false}>
                {expanded && (
                    <TableRow style={{ backgroundColor: SURFACE }}>
                        <TableCell
                            colSpan={8}
                            style={{ padding: 0, borderTop: `2px solid rgba(0,102,102,0.2)` }}
                        >
                            <motion.div
                                id={detailsRegionId}
                                role="region"
                                aria-label={`Details for report ${item._id}`}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{
                                    height: "auto",
                                    opacity: 1,
                                    transition: {
                                        height: { duration: 0.3, ease: "easeOut" },
                                        opacity: { duration: 0.2, delay: 0.1 },
                                    },
                                }}
                                exit={{
                                    height: 0,
                                    opacity: 0,
                                    transition: {
                                        height: { duration: 0.25, ease: "easeIn" },
                                        opacity: { duration: 0.15 },
                                    },
                                }}
                                style={{ overflow: "hidden" }}
                            >
                                <ReportDetailsPanel reportId={item._id} />
                            </motion.div>
                        </TableCell>
                    </TableRow>
                )}
            </AnimatePresence>
        </>
    );
};