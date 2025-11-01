// components/reports/ReportsToolbar.tsx
// Debounced search, searchScope, filters (status, reason, priority), sort, bulk selection, clear filters, export placeholder.
// Updates store.params through setParams and triggers fetchListPage appropriately.

"use client";

import type { FC, ChangeEvent } from "react";
import { useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import debounce from "lodash.debounce";
import { REPORT_STATUS, REPORT_REASON, REPORT_PRIORITY } from "@/types/reports.types";
import type { ReportsQueryParams, ReportsSearchScope, ReportsSortField } from "@/types/reports.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useReportsStore } from "@/store/useReportStore";
import { ReportPriority, ReportReason, ReportStatus } from "@/constants/report.const";
import { cn } from "@/lib/utils";
import {
    HiSearch,
    HiFilter,
    HiSortAscending,
    HiSortDescending,
    HiX,
    HiCheckCircle,
    HiUserAdd,
    HiRefresh,
    HiDownload,
    HiAdjustments,
    HiViewGrid
} from "react-icons/hi";
import {
    IoFunnel,
    IoClose,
    IoCheckmarkDone,
    IoPersonAdd
} from "react-icons/io5";

const sortFields: ReportsSortField[] = [
    "createdAt",
    "updatedAt",
    "priority",
    "status",
    "reopenedCount",
    "reporter.name",
];

// Prettier field names for display
const sortFieldLabels: Record<ReportsSortField, string> = {
    "createdAt": "Created Date",
    "updatedAt": "Last Updated",
    "priority": "Priority Level",
    "status": "Status",
    "reopenedCount": "Reopen Count",
    "reporter.name": "Reporter Name",
};

export const ReportsToolbar: FC = () => {
    const { params, setParams, fetchListPage, selectedIds, clearSelection } = useReportsStore();

    const onDebouncedSearch = useRef(
        debounce((value: string) => {
            setParams({ search: value, page: 1 });
            void fetchListPage(1);
        }, 400)
    ).current;

    const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        onDebouncedSearch(e.target.value);
    };

    const selectionCount = selectedIds.size;
    const hasSelection = selectionCount > 0;

    const statusItems = useMemo(
        () => Object.values(REPORT_STATUS).map((v) => ({ value: v, label: v.replace("_", " ") })),
        []
    );
    const reasonItems = useMemo(() => Object.values(REPORT_REASON).map((v) => ({ value: v, label: v.replace("_", " ") })), []);
    const priorityItems = useMemo(() => Object.values(REPORT_PRIORITY).map((v) => ({ value: v, label: v })), []);

    const hasActiveFilters =
        (params.status && params.status !== "any") ||
        (params.priority && params.priority !== "any") ||
        (params.reason && params.reason !== "any") ||
        (params.search && params.search.length > 0);

    return (
        <div className="space-y-6">
            {/* Search and Filters Section */}
            <div className="space-y-5">
                {/* Search Bar - Enhanced with icon and styling */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                >
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <HiSearch className="h-5 w-5 text-slate-400" aria-hidden />
                    </div>
                    <Input
                        defaultValue={params.search ?? ""}
                        onChange={onSearchChange}
                        placeholder="Search by message, reporter, tour, or tags..."
                        aria-label="Search reports"
                        className="h-12 pl-12 pr-4 text-base border-slate-300 bg-white/80 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                    {params.search && params.search.length > 0 && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => {
                                setParams({ search: "", page: 1 });
                                void fetchListPage(1);
                            }}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                            aria-label="Clear search"
                        >
                            <HiX className="h-5 w-5" />
                        </motion.button>
                    )}
                </motion.div>

                {/* Filters Grid - Enhanced with better spacing and labels */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <div className="mb-3 flex items-center gap-2">
                        <IoFunnel className="h-4 w-4 text-slate-600" />
                        <h3 className="text-sm font-semibold text-slate-700">Filters & Sorting</h3>
                        {hasActiveFilters && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
                            >
                                Active
                            </motion.span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Search Scope */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                <HiViewGrid className="h-3.5 w-3.5" />
                                Search Scope
                            </label>
                            <Select
                                value={params.searchScope ?? "any"}
                                onValueChange={(val: ReportsSearchScope) => {
                                    setParams({ searchScope: val, page: 1 });
                                    void fetchListPage(1);
                                }}
                            >
                                <SelectTrigger aria-label="Search scope" className="h-10 border-slate-300 bg-white/80 backdrop-blur-sm shadow-sm hover:border-slate-400 transition-colors">
                                    <SelectValue placeholder="Scope" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="any">All Fields</SelectItem>
                                    <SelectItem value="message">Message</SelectItem>
                                    <SelectItem value="reporter">Reporter</SelectItem>
                                    <SelectItem value="tour">Tour</SelectItem>
                                    <SelectItem value="tags">Tags</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                <HiAdjustments className="h-3.5 w-3.5" />
                                Status
                            </label>
                            <Select
                                value={params.status ?? "any"}
                                onValueChange={(val: ReportStatus) => {
                                    setParams({ status: val, page: 1 });
                                    void fetchListPage(1);
                                }}
                            >
                                <SelectTrigger aria-label="Status filter" className="h-10 border-slate-300 bg-white/80 backdrop-blur-sm shadow-sm hover:border-slate-400 transition-colors">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="any">All Status</SelectItem>
                                    {statusItems.map((i) => (
                                        <SelectItem key={i.value} value={i.value}>
                                            {i.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Reason Filter */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                <HiFilter className="h-3.5 w-3.5" />
                                Reason
                            </label>
                            <Select
                                value={params.reason ?? "any"}
                                onValueChange={(val: ReportReason) => {
                                    setParams({ reason: val, page: 1 });
                                    void fetchListPage(1);
                                }}
                            >
                                <SelectTrigger aria-label="Reason filter" className="h-10 border-slate-300 bg-white/80 backdrop-blur-sm shadow-sm hover:border-slate-400 transition-colors">
                                    <SelectValue placeholder="Reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="any">All Reasons</SelectItem>
                                    {reasonItems.map((i) => (
                                        <SelectItem key={i.value} value={i.value}>
                                            {i.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority Filter */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                <HiAdjustments className="h-3.5 w-3.5" />
                                Priority
                            </label>
                            <Select
                                value={params.priority ?? "any"}
                                onValueChange={(val: ReportPriority) => {
                                    setParams({ priority: val, page: 1 });
                                    void fetchListPage(1);
                                }}
                            >
                                <SelectTrigger aria-label="Priority filter" className="h-10 border-slate-300 bg-white/80 backdrop-blur-sm shadow-sm hover:border-slate-400 transition-colors">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="any">All Priority</SelectItem>
                                    {priorityItems.map((i) => (
                                        <SelectItem key={i.value} value={i.value}>
                                            {i.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sort Controls - stacked column */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                {params.sort?.direction === "asc" ? (
                                    <HiSortAscending className="h-3.5 w-3.5" />
                                ) : (
                                    <HiSortDescending className="h-3.5 w-3.5" />
                                )}
                                Sort By
                            </label>

                            {/* Stacked layout: primary select on top, direction select below */}
                            <div className="flex flex-col gap-2">
                                <Select
                                    value={params.sort?.field ?? "createdAt"}
                                    onValueChange={(val) => {
                                        setParams({ sort: { field: val as ReportsSortField, direction: params.sort?.direction ?? "desc" }, page: 1 });
                                        void fetchListPage(1);
                                    }}
                                >
                                    <SelectTrigger
                                        aria-label="Sort field"
                                        className="h-10 w-full border-slate-300 bg-white/80 backdrop-blur-sm shadow-sm hover:border-slate-400 transition-colors"
                                    >
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sortFields.map((f) => (
                                            <SelectItem key={f} value={f}>
                                                {sortFieldLabels[f]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={params.sort?.direction ?? "desc"}
                                    onValueChange={(val) => {
                                        setParams({ sort: { field: params.sort?.field ?? "createdAt", direction: val as "asc" | "desc" }, page: 1 });
                                        void fetchListPage(1);
                                    }}
                                >
                                    <SelectTrigger
                                        aria-label="Sort direction"
                                        className="h-10 w-28 border-slate-300 bg-white/80 backdrop-blur-sm shadow-sm hover:border-slate-400 transition-colors"
                                    >
                                        <SelectValue placeholder="Direction" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="asc">
                                            <div className="flex items-center gap-2">
                                                <HiSortAscending className="h-4 w-4" />
                                                Asc
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="desc">
                                            <div className="flex items-center gap-2">
                                                <HiSortDescending className="h-4 w-4" />
                                                Desc
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>


                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="flex items-center justify-end gap-3"
                >
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const defaults: Partial<ReportsQueryParams> = {
                                status: "any" as ReportsQueryParams["status"],
                                priority: "any" as ReportsQueryParams["priority"],
                                reason: "any" as ReportsQueryParams["reason"],
                                search: "",
                                searchScope: "any" as ReportsQueryParams["searchScope"],
                                page: 1,
                            };

                            useReportsStore.getState().setParams(defaults);
                            void useReportsStore.getState().fetchListPage(1);
                        }}
                        className="border-slate-300 bg-white hover:bg-slate-50 shadow-sm transition-all"
                        disabled={!hasActiveFilters}
                    >
                        <HiRefresh className="mr-2 h-4 w-4" aria-hidden />
                        Reset Filters
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { /* placeholder export */ }}
                        className="border-slate-300 bg-white hover:bg-slate-50 shadow-sm transition-all"
                    >
                        <HiDownload className="mr-2 h-4 w-4" aria-hidden />
                        Export CSV
                    </Button>
                </motion.div>
            </div>

            {/* Bulk Actions Bar - Enhanced with better animations and styling */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className={cn(
                    "relative overflow-hidden rounded-xl border-2 p-5 transition-all duration-300",
                    hasSelection
                        ? "border-blue-400/50 bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 shadow-md"
                        : "border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100/50"
                )}
            >
                {/* Decorative background elements */}
                {hasSelection && (
                    <>
                        <div className="absolute top-0 right-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-blue-300/20 blur-2xl" />
                        <div className="absolute bottom-0 left-0 h-24 w-24 translate-y-1/2 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-2xl" />
                    </>
                )}

                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <Checkbox
                                checked={hasSelection}
                                onCheckedChange={(checked) => {
                                    if (!checked) clearSelection();
                                }}
                                aria-label="Bulk selection toggle"
                                className={cn(
                                    "h-5 w-5 rounded-md border-2 transition-all data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600",
                                    hasSelection ? "border-blue-500 shadow-sm" : "border-slate-300"
                                )}
                            />
                            <div>
                                <span className={cn(
                                    "text-sm font-semibold transition-colors",
                                    hasSelection ? "text-blue-900" : "text-slate-600"
                                )}>
                                    {hasSelection ? `${selectionCount} Report${selectionCount > 1 ? 's' : ''} Selected` : "No items selected"}
                                </span>
                                {hasSelection && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-xs text-blue-700 font-medium"
                                    >
                                        Perform bulk actions on selected reports
                                    </motion.p>
                                )}
                            </div>
                        </div>

                        {hasSelection && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => clearSelection()}
                                className="ml-2 rounded-lg bg-white p-2 text-slate-500 shadow-sm transition-all hover:bg-red-50 hover:text-red-600 hover:shadow"
                                aria-label="Clear selection"
                            >
                                <IoClose className="h-4 w-4" />
                            </motion.button>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        {hasSelection && (
                            <motion.div
                                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="flex items-center gap-3"
                            >
                                <Button
                                    variant="default"
                                    size="sm"
                                    disabled={!hasSelection}
                                    onClick={async () => {
                                        const ids = Array.from(useReportsStore.getState().selectedIds);
                                        for (const id of ids) {
                                            await useReportsStore.getState().resolveReport(id, "Bulk resolve");
                                        }
                                        useReportsStore.getState().clearSelection();
                                    }}
                                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-md hover:shadow-lg transition-all"
                                >
                                    <IoCheckmarkDone className="mr-2 h-4 w-4" aria-hidden />
                                    Resolve Selected
                                </Button>

                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={!hasSelection}
                                    onClick={async () => {
                                        const ids = Array.from(useReportsStore.getState().selectedIds);
                                        const adminUserId = "admin-user-id";
                                        for (const id of ids) {
                                            await useReportsStore.getState().assignReport(id, adminUserId);
                                        }
                                        useReportsStore.getState().clearSelection();
                                    }}
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-md hover:shadow-lg transition-all"
                                >
                                    <IoPersonAdd className="mr-2 h-4 w-4" aria-hidden />
                                    Assign Selected
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};