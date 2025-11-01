// components/reports/ReportDetailsPanel.tsx
// Modern details panel with gradient cards, icons, and smooth animations

"use client";

import type { FC } from "react";
import { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import type { ReportFull } from "@/types/reports.types";
import { Card } from "@/components/ui/card";
import { useReportsStore } from "@/store/useReportStore";
import { PulseLoader } from "./PulseLoader";
import { formatDateTime } from "@/utils/helpers/format.reports";
import {
    MdPerson,
    MdEmail,
    MdBadge,
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
    MdWarning
} from "react-icons/md";
import { HiSparkles } from "react-icons/hi";

export const ReportDetailsPanel: FC<{ reportId: string }> = ({ reportId }) => {
    const { detailsCache } = useReportsStore();
    const cache = detailsCache[reportId];
    const loading = cache?.loading ?? false;
    const error = cache?.error ?? null;
    const report: ReportFull | null = useMemo(() => cache?.data ?? null, [cache]);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    if (loading && !report) {
        return (
            <div className="p-8 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                        <PulseLoader />
                    </div>
                    <div className="flex items-center gap-2">
                        <HiSparkles className="text-blue-500 animate-spin" size={16} />
                        <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                            Loading details...
                        </span>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (error && !report) {
        return (
            <div className="p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Card className="p-6 border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50">
                                <MdWarning className="text-red-600 dark:text-red-400" size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-red-900 dark:text-red-100">Failed to load details</p>
                                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        );
    }

    if (!report) {
        return null;
    }

    const InfoRow: FC<{ icon: FC<{ size?: number; className?: string }>; label: string; value: string; iconColor?: string }> = ({
        icon: Icon,
        label,
        value,
        iconColor = "text-gray-500 dark:text-gray-400"
    }) => (
        <div className="flex items-start gap-3 group">
            <div className={`mt-0.5 ${iconColor} group-hover:scale-110 transition-transform`}>
                <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">{label}</div>
                <div className="text-sm text-gray-900 dark:text-gray-100 truncate">{value}</div>
            </div>
        </div>
    );

    return (
        <motion.div
            className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Reporter Card */}
            <motion.div variants={cardVariants}>
                <Card className="relative p-6 border-2 border-cyan-200 dark:border-cyan-800 bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-950/20 dark:to-blue-950/20 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />

                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg">
                                <MdPerson className="text-white" size={20} />
                            </div>
                            <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                                Reporter
                            </h3>
                        </div>

                        <div className="space-y-3">
                            <InfoRow
                                icon={MdPerson}
                                label="Name"
                                value={report.reporter?.name ?? "-"}
                                iconColor="text-cyan-500 dark:text-cyan-400"
                            />
                            <InfoRow
                                icon={MdEmail}
                                label="Email"
                                value={report.reporter?.email ?? "-"}
                                iconColor="text-blue-500 dark:text-blue-400"
                            />
                            <InfoRow
                                icon={MdBadge}
                                label="Role"
                                value={report.reporter?.role ?? "-"}
                                iconColor="text-purple-500 dark:text-purple-400"
                            />
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Tour Card */}
            <motion.div variants={cardVariants}>
                <Card className="relative p-6 border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />

                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                                <MdTour className="text-white" size={20} />
                            </div>
                            <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                                Tour
                            </h3>
                        </div>

                        <div className="space-y-3">
                            <InfoRow
                                icon={MdTour}
                                label="Title"
                                value={report.tour?.title ?? "-"}
                                iconColor="text-green-500 dark:text-green-400"
                            />
                            <InfoRow
                                icon={MdLink}
                                label="Slug"
                                value={report.tour?.slug ?? "-"}
                                iconColor="text-emerald-500 dark:text-emerald-400"
                            />
                            <InfoRow
                                icon={MdBusiness}
                                label="Company"
                                value={report.tour?.companyId ?? "-"}
                                iconColor="text-teal-500 dark:text-teal-400"
                            />
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Assignment Card */}
            <motion.div variants={cardVariants}>
                <Card className="relative p-6 border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />

                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                                <MdAssignment className="text-white" size={20} />
                            </div>
                            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                                Assignment
                            </h3>
                        </div>

                        <div className="space-y-3">
                            <InfoRow
                                icon={MdPerson}
                                label="Assigned to"
                                value={report.assignedTo?.name ?? "-"}
                                iconColor="text-purple-500 dark:text-purple-400"
                            />
                            <InfoRow
                                icon={MdPriorityHigh}
                                label="Priority"
                                value={report.priority}
                                iconColor="text-orange-500 dark:text-orange-400"
                            />
                            <InfoRow
                                icon={MdToggleOn}
                                label="Status"
                                value={report.status}
                                iconColor="text-emerald-500 dark:text-emerald-400"
                            />
                            <InfoRow
                                icon={MdRefresh}
                                label="Reopened"
                                value={String(report.reopenedCount)}
                                iconColor="text-pink-500 dark:text-pink-400"
                            />
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Message Card */}
            <motion.div variants={cardVariants} className="lg:col-span-2">
                <Card className="relative p-6 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />

                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
                                <MdMessage className="text-white" size={20} />
                            </div>
                            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                                Message
                            </h3>
                        </div>

                        <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-4 border border-blue-100 dark:border-blue-900">
                            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                                {report.message}
                            </p>
                        </div>

                        {report.resolutionNotes && (
                            <div className="mt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <MdNotes className="text-emerald-500 dark:text-emerald-400" size={18} />
                                    <h4 className="font-semibold text-sm text-emerald-700 dark:text-emerald-300">
                                        Resolution Notes
                                    </h4>
                                </div>
                                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg p-4 border border-emerald-100 dark:border-emerald-900">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                        {report.resolutionNotes}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="mt-5 pt-4 border-t border-blue-100 dark:border-blue-900">
                            <div className="flex flex-wrap gap-4 text-xs">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                    <MdCalendarToday className="text-blue-600 dark:text-blue-400" size={14} />
                                    <span className="text-blue-700 dark:text-blue-300 font-medium">
                                        Created: {formatDateTime(report.createdAt)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                                    <MdUpdate className="text-indigo-600 dark:text-indigo-400" size={14} />
                                    <span className="text-indigo-700 dark:text-indigo-300 font-medium">
                                        Updated: {formatDateTime(report.updatedAt)}
                                    </span>
                                </div>
                                {report.resolvedAt && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                        <MdCheckCircle className="text-emerald-600 dark:text-emerald-400" size={14} />
                                        <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                                            Resolved: {formatDateTime(report.resolvedAt)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Evidence Card */}
            <motion.div variants={cardVariants}>
                <Card className="relative p-6 border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />

                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                                <MdAttachFile className="text-white" size={20} />
                            </div>
                            <h3 className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                                Evidence
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {/* Images */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <MdImage className="text-pink-500 dark:text-pink-400" size={16} />
                                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Images</div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(report.evidenceImages ?? []).length === 0 ? (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">No images</span>
                                    ) : (
                                        report.evidenceImages!.map((src, idx) => (
                                            <motion.span
                                                key={src}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="inline-flex items-center rounded-lg border-2 border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-950/30 px-3 py-1.5 text-xs font-medium text-pink-700 dark:text-pink-300 hover:shadow-md transition-all"
                                            >
                                                {src.slice(0, 20)}...
                                            </motion.span>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Links */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <MdLink className="text-blue-500 dark:text-blue-400" size={16} />
                                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Links</div>
                                </div>
                                <div className="space-y-1">
                                    {(report.evidenceLinks ?? []).length === 0 ? (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">No links</span>
                                    ) : (
                                        report.evidenceLinks!.map((href, idx) => (
                                            <motion.div
                                                key={href}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="flex items-start gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 hover:shadow-sm transition-all"
                                            >
                                                <MdLink className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" size={14} />
                                                <span className="text-xs text-blue-700 dark:text-blue-300 break-all font-mono">
                                                    {href}
                                                </span>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <MdLocalOffer className="text-purple-500 dark:text-purple-400" size={16} />
                                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Tags</div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(report.tags ?? []).length === 0 ? (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">No tags</span>
                                    ) : (
                                        report.tags!.map((t, idx) => (
                                            <motion.span
                                                key={t}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:shadow-md transition-all"
                                            >
                                                <MdLocalOffer size={12} />
                                                {t}
                                            </motion.span>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
};