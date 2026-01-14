// components/reports/ReportsTable.tsx

"use client";

import type { FC } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import type { ReportsCacheEntry, ReportListItem } from "@/types/reports.types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ReportRow } from "./ReportRow";
import {
    MdChevronLeft,
    MdChevronRight,
    MdFirstPage,
    MdLastPage,
    MdCheckBox,
    MdFingerprint,
    MdTour,
    MdReport,
    MdPerson,
    MdCalendarToday,
    MdToggleOn,
    MdMoreVert
} from "react-icons/md";
import { HiDocumentText, HiFilter, HiSparkles } from "react-icons/hi";
import { useReportsStore } from "@/store/report.store";
import { PulseLoader } from "./PulseLoader";

export const ReportsTable: FC = () => {
    const { params, pageLimitOptions, readCachedList, fetchListPage, setParams, loading } = useReportsStore();

    const localLoading = loading.type === "loading" && loading.context === "list";

    const entry: ReportsCacheEntry | null = readCachedList(params);
    const limit = params.limit ?? 10;
    const page = params.page ?? 1;

    const docsPageSlice: ReportListItem[] =
        entry?.pages.get(page) ?? [];

    const total = entry?.total ?? 0;
    const pages = total > 0 ? Math.ceil(total / limit) : 1;

    const startIdx = total > 0 ? (page - 1) * limit + 1 : 0;
    const endIdx = total > 0 ? Math.min(page * limit, total) : 0;

    const containerVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    const headerVariants: Variants = {
        hidden: { opacity: 0, y: -10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        }
    };

    return (
        <motion.div
            className="flex flex-col gap-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Enhanced Table Container with Gradient Border */}
            <div className="relative rounded-2xl bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/20 p-[1px] shadow-lg">
                <div className="relative rounded-2xl bg-white dark:bg-gray-950 overflow-hidden">
                    {/* Decorative Background Pattern */}
                    <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900/30 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />

                    {/* Loading Overlay */}
                    <AnimatePresence>
                        {localLoading && docsPageSlice.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md z-20 flex items-center justify-center"
                            >
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                                        <PulseLoader />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <HiSparkles className="text-blue-500 animate-spin" size={16} />
                                        <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                            Refreshing data...
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b-2 border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 via-gray-50/80 to-gray-50 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-900/80 hover:from-gray-100 hover:via-gray-100/80 hover:to-gray-100 dark:hover:from-gray-900 dark:hover:via-gray-900/80 dark:hover:to-gray-900 transition-colors">
                                    <TableHead className="w-12">
                                        <motion.div
                                            className="flex items-center gap-2"
                                            variants={headerVariants}
                                        >
                                            <MdCheckBox className="text-blue-500 dark:text-blue-400" size={18} />
                                        </motion.div>
                                    </TableHead>
                                    <TableHead>
                                        <motion.div
                                            className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300"
                                            variants={headerVariants}
                                        >
                                            <MdFingerprint className="text-purple-500 dark:text-purple-400" size={18} />
                                            <span>Report ID</span>
                                        </motion.div>
                                    </TableHead>
                                    <TableHead>
                                        <motion.div
                                            className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300"
                                            variants={headerVariants}
                                        >
                                            <MdTour className="text-green-500 dark:text-green-400" size={18} />
                                            <span>Tour</span>
                                        </motion.div>
                                    </TableHead>
                                    <TableHead>
                                        <motion.div
                                            className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300"
                                            variants={headerVariants}
                                        >
                                            <MdReport className="text-orange-500 dark:text-orange-400" size={18} />
                                            <span>Reason</span>
                                        </motion.div>
                                    </TableHead>
                                    <TableHead>
                                        <motion.div
                                            className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300"
                                            variants={headerVariants}
                                        >
                                            <MdPerson className="text-cyan-500 dark:text-cyan-400" size={18} />
                                            <span>Reporter</span>
                                        </motion.div>
                                    </TableHead>
                                    <TableHead>
                                        <motion.div
                                            className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300"
                                            variants={headerVariants}
                                        >
                                            <MdCalendarToday className="text-pink-500 dark:text-pink-400" size={16} />
                                            <span>Created</span>
                                        </motion.div>
                                    </TableHead>
                                    <TableHead>
                                        <motion.div
                                            className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300"
                                            variants={headerVariants}
                                        >
                                            <MdToggleOn className="text-emerald-500 dark:text-emerald-400" size={18} />
                                            <span>Status</span>
                                        </motion.div>
                                    </TableHead>
                                    <TableHead className="text-right">
                                        <motion.div
                                            className="flex items-center justify-end gap-2 font-semibold text-gray-700 dark:text-gray-300"
                                            variants={headerVariants}
                                        >
                                            <span>Actions</span>
                                            <MdMoreVert className="text-gray-500 dark:text-gray-400" size={18} />
                                        </motion.div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence mode="wait">
                                    {localLoading && docsPageSlice.length === 0 ? (
                                        <TableRow key="loading">
                                            <TableCell colSpan={8} className="text-center py-20">
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="flex flex-col items-center justify-center gap-6"
                                                >
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-pulse" />
                                                        <div className="relative flex items-center gap-3">
                                                            <PulseLoader />
                                                            <motion.div
                                                                animate={{ rotate: 360 }}
                                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                            >
                                                                <HiSparkles className="text-blue-500" size={24} />
                                                            </motion.div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                                            Loading reports
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Fetching your data with care...
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            </TableCell>
                                        </TableRow>
                                    ) : docsPageSlice.length === 0 ? (
                                        <TableRow key="empty">
                                            <TableCell colSpan={8} className="text-center py-20">
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    className="flex flex-col items-center justify-center gap-6"
                                                >
                                                    <motion.div
                                                        animate={{
                                                            y: [0, -10, 0],
                                                            rotate: [0, 5, -5, 0]
                                                        }}
                                                        transition={{
                                                            duration: 3,
                                                            repeat: Infinity,
                                                            ease: "easeInOut"
                                                        }}
                                                        className="relative"
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full blur-2xl opacity-50" />
                                                        <HiDocumentText className="relative text-gray-300 dark:text-gray-700" size={72} />
                                                    </motion.div>
                                                    <div className="space-y-2">
                                                        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                                            No reports found
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                                                            Try adjusting your filters or search criteria to find what you&apos;re looking for
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        docsPageSlice.map((item) => <ReportRow key={item._id} item={item} />)
                                    )}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Enhanced Pagination Controls */}
            <motion.div
                className="flex items-center justify-between px-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
            >
                {/* Results Info with Gradient */}
                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-sm opacity-0 group-hover:opacity-20 transition-opacity" />
                        <div className="relative flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <HiFilter className="text-blue-600 dark:text-blue-400" size={14} />
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                    Showing
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 font-semibold text-blue-700 dark:text-blue-300">
                                    {startIdx}–{endIdx}
                                </span>
                                <span className="text-gray-400 dark:text-gray-600">of</span>
                                <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/30 font-bold text-purple-700 dark:text-purple-300">
                                    {total}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-3">
                    {/* Page Size Selector */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-sm opacity-0 group-hover:opacity-20 transition-opacity" />
                        <Select
                            value={String(limit)}
                            onValueChange={(val) => {
                                const nextLimit = Number(val);
                                useReportsStore.getState().setParams({ limit: nextLimit, page: 1 });
                                void useReportsStore.getState().fetchListPage(1);
                            }}
                        >
                            <SelectTrigger className="relative w-[140px] h-10 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:ring-2 focus:ring-purple-500 shadow-sm" aria-label="Page size">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {pageLimitOptions.map((opt) => (
                                    <SelectItem key={opt} value={String(opt)}>
                                        <span className="font-semibold">{opt}</span> per page
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Page Navigation with Enhanced Design */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur-sm opacity-0 group-hover:opacity-20 transition-opacity" />
                        <div className="relative flex items-center gap-1 p-1.5 rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 shadow-sm">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-all"
                                disabled={page <= 1}
                                onClick={() => {
                                    setParams({ page: 1 });
                                    void fetchListPage(1);
                                }}
                                aria-label="First page"
                            >
                                <MdFirstPage size={20} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-purple-100 hover:text-purple-600 dark:hover:bg-purple-900/30 dark:hover:text-purple-400 transition-all"
                                disabled={page <= 1}
                                onClick={() => {
                                    const next = page - 1;
                                    setParams({ page: next });
                                    void fetchListPage(next);
                                }}
                                aria-label="Previous page"
                            >
                                <MdChevronLeft size={20} />
                            </Button>

                            <div className="px-4 min-w-[90px] text-center">
                                <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                    {page}
                                </span>
                                <span className="text-sm text-gray-400 dark:text-gray-600 mx-1.5">/</span>
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                    {pages}
                                </span>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-purple-100 hover:text-purple-600 dark:hover:bg-purple-900/30 dark:hover:text-purple-400 transition-all"
                                disabled={page >= pages}
                                onClick={() => {
                                    const next = page + 1;
                                    setParams({ page: next });
                                    void fetchListPage(next);
                                }}
                                aria-label="Next page"
                            >
                                <MdChevronRight size={20} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-all"
                                disabled={page >= pages}
                                onClick={() => {
                                    setParams({ page: pages });
                                    void fetchListPage(pages);
                                }}
                                aria-label="Last page"
                            >
                                <MdLastPage size={20} />
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};