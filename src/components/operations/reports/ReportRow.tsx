// components/reports/ReportRow.tsx
// Modern, animated expandable row with gradient accents and smooth interactions

"use client";

import type { FC } from "react";
import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ReportListItem } from "@/types/reports.types";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    MdExpandMore,
    MdCheckCircle,
    MdPending,
    MdCancel,
    MdSchedule
} from "react-icons/md";
import { HiSparkles } from "react-icons/hi";
import { ReportActions } from "./ReportActions";
import { ReportDetailsPanel } from "./ReportDetailsPanel";
import { useReportsStore } from "@/store/report.store";
import { formatDateTime } from "@/utils/helpers/format.reports";
import { REPORT_STATUS, ReportStatus } from "@/constants/report.const";
import Image from "next/image";

export const ReportRow: FC<{ item: ReportListItem }> = ({ item }) => {
    const { toggleSelect, selectedIds, fetchReportDetail, detailsCache } = useReportsStore();
    const [expanded, setExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showResolvedTooltip, setShowResolvedTooltip] = useState(false);
    const detailsRegionId = useId();

    const isSelected = selectedIds.has(item._id);
    const isResolved = item.status === REPORT_STATUS.RESOLVED;

    const onToggleExpand = async () => {
        const next = !expanded;
        setExpanded(next);
        if (next) {
            const cache = detailsCache[item._id];
            if (!cache || !cache.data) {
                await fetchReportDetail(item._id);
            }
        }
    };

    const handleCheckboxChange = () => {
        if (isResolved) {
            // Show tooltip for resolved reports
            setShowResolvedTooltip(true);
            setTimeout(() => setShowResolvedTooltip(false), 2000); // Hide after 2 seconds
            return;
        }
        toggleSelect(item._id);
    };

    const getStatusConfig = (status: ReportStatus) => {
        const normalized = status.toLowerCase().replace("_", " ");
        switch (normalized) {
            case REPORT_STATUS.RESOLVED:
                return {
                    icon: MdCheckCircle,
                    color: "text-emerald-600 dark:text-emerald-400",
                    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
                    borderColor: "border-emerald-200 dark:border-emerald-800"
                };
            case REPORT_STATUS.IN_REVIEW:
                return {
                    icon: MdPending,
                    color: "text-amber-600 dark:text-amber-400",
                    bgColor: "bg-amber-100 dark:bg-amber-900/30",
                    borderColor: "border-amber-200 dark:border-amber-800"
                };
            case REPORT_STATUS.REJECTED:
                return {
                    icon: MdCancel,
                    color: "text-red-600 dark:text-red-400",
                    bgColor: "bg-red-100 dark:bg-red-900/30",
                    borderColor: "border-red-200 dark:border-red-800"
                };
            default:
                return {
                    icon: MdSchedule,
                    color: "text-blue-600 dark:text-blue-400",
                    bgColor: "bg-blue-100 dark:bg-blue-900/30",
                    borderColor: "border-blue-200 dark:border-blue-800"
                };
        }
    };

    const statusConfig = getStatusConfig(item.status);
    const StatusIcon = statusConfig.icon;

    return (
        <>
            <TableRow
                className={`
                    group relative transition-all duration-200 cursor-pointer
                    ${isSelected ? 'bg-blue-50 dark:bg-blue-950/30 border-l-4 border-l-blue-500' : ''}
                    ${isHovered ? 'bg-gray-50 dark:bg-gray-900/50' : ''}
                    ${expanded ? 'border-b-0' : ''}
                    hover:shadow-md
                `}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Selection Checkbox */}
                <TableCell className="relative">
                    <div className="relative">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={handleCheckboxChange}
                                aria-label={`Select report ${item._id}`}
                                className={`border-2 ${isResolved ? 'cursor-not-allowed opacity-70' : ''}`}
                                disabled={isResolved}
                            />
                        </motion.div>

                        {/* Tooltip for resolved reports */}
                        <AnimatePresence>
                            {showResolvedTooltip && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 5, scale: 0.9 }}
                                    className="absolute left-0 bottom-full mb-2 z-50"
                                >
                                    <div className="relative">
                                        <div className="bg-red-500 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <MdCancel size={14} />
                                                <span>It&apos;s already resolved.</span>
                                            </div>
                                            {/* Tooltip arrow */}
                                            <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-red-500"></div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {isSelected && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1"
                            >
                                <HiSparkles className="text-blue-500" size={12} />
                            </motion.div>
                        )}
                    </div>
                </TableCell>

                {/* Report ID */}
                <TableCell>
                    <div className="flex items-center gap-2">
                        <code className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-mono text-purple-600 dark:text-purple-400 border border-gray-200 dark:border-gray-700">
                            {item._id.slice(0, 8)}...
                        </code>
                    </div>
                </TableCell>

                {/* Tour */}
                <TableCell>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                            {item.tour?.title ?? "-"}
                        </span>
                    </div>
                </TableCell>

                {/* Reason */}
                <TableCell>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium border border-orange-200 dark:border-orange-800">
                        {item.reason.replace("_", " ")}
                    </span>
                </TableCell>

                {/* Reporter */}
                <TableCell>
                    <div className="flex items-center gap-2">
                        {item.reporter?.avatarUrl ? (
                            <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-sm">
                                <Image
                                    src={item.reporter.avatarUrl}
                                    alt={item.reporter.name || "Reporter Avatar"}
                                    width={32}
                                    height={32}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                                {(item.reporter?.name ?? item.reporter?.email ?? "?")[0].toUpperCase()}
                            </div>
                        )}
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            {item.reporter?.name ?? item.reporter?.email ?? "-"}
                        </span>
                    </div>
                </TableCell>

                {/* Created */}
                <TableCell>
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                            {formatDateTime(item.createdAt).split(" ")[0]}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDateTime(item.createdAt).split(" ").slice(1).join(" ")}
                        </span>
                    </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusConfig.bgColor} border ${statusConfig.borderColor}`}
                    >
                        <StatusIcon className={statusConfig.color} size={16} />
                        <span className={`text-xs font-semibold ${statusConfig.color} capitalize`}>
                            {item.status.replace("_", " ")}
                        </span>
                    </motion.div>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                variant="ghost"
                                size="sm"
                                aria-expanded={expanded}
                                aria-controls={detailsRegionId}
                                onClick={onToggleExpand}
                                className={`
                                    relative overflow-hidden
                                    ${expanded ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                                    hover:bg-blue-100 dark:hover:bg-blue-900/30
                                `}
                            >
                                <motion.div
                                    animate={{ rotate: expanded ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <MdExpandMore size={20} aria-hidden />
                                </motion.div>
                                {expanded && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute inset-0 bg-blue-500/10 rounded"
                                    />
                                )}
                            </Button>
                        </motion.div>
                        <ReportActions item={item}  />
                    </div>
                </TableCell>
            </TableRow>

            {/* Expanded Details Panel */}
            <AnimatePresence initial={false}>
                {expanded && (
                    <TableRow>
                        <TableCell colSpan={8} className="p-0 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-900/50 dark:to-transparent">
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
                                        opacity: { duration: 0.2, delay: 0.1 }
                                    }
                                }}
                                exit={{
                                    height: 0,
                                    opacity: 0,
                                    transition: {
                                        height: { duration: 0.3, ease: "easeIn" },
                                        opacity: { duration: 0.2 }
                                    }
                                }}
                                className="overflow-hidden"
                            >
                                <div className="border-t-2 border-blue-200 dark:border-blue-800">
                                    <ReportDetailsPanel reportId={item._id} />
                                </div>
                            </motion.div>
                        </TableCell>
                    </TableRow>
                )}
            </AnimatePresence>
        </>
    );
};