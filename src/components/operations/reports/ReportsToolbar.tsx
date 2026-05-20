// components/reports/ReportsToolbar.tsx
// Neumorphism design system — Space Mono + JetBrains Mono
// primary=#006666 | surface=#E7E5E4 | text=#1E2938

"use client";

import type { FC, ChangeEvent } from "react";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { REPORT_STATUS, REPORT_REASON, REPORT_PRIORITY } from "@/types/tour/reports.types";
import type { ReportsQueryParams, ReportsSearchScope, ReportsSortField } from "@/types/tour/reports.types";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useReportsStore } from "@/store/report.store";
import { ReportPriority, ReportReason, ReportStatus } from "@/constants/tour/report.const";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { HiSearch, HiSortAscending, HiSortDescending, HiX, HiRefresh } from "react-icons/hi";
import { HiArrowPath } from "react-icons/hi2";
import { IoFunnel, IoClose, IoCheckmarkDone } from "react-icons/io5";

const SURFACE = "#E7E5E4";
const SHADOW_OUT = "5px 5px 10px #c4c2c0, -5px -5px 10px #ffffff";
const SHADOW_IN = "inset 3px 3px 7px #c4c2c0, inset -3px -3px 7px #ffffff";
const PRIMARY = "#006666";
const TEXT = "#1E2938";
const MUTED = "#5a6475";

const sortFields: ReportsSortField[] = ["createdAt", "updatedAt", "priority", "status", "reopenedCount", "reporter.name"];
const sortFieldLabels: Record<ReportsSortField, string> = {
    createdAt: "Created Date",
    updatedAt: "Last Updated",
    priority: "Priority Level",
    status: "Status",
    reopenedCount: "Reopen Count",
    "reporter.name": "Reporter Name",
};

/** Neumorphic label */
const FieldLabel: FC<{ children: React.ReactNode; icon?: React.ReactNode }> = ({ children, icon }) => (
    <label
        className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest mb-1.5"
        style={{ color: MUTED, fontFamily: "var(--font-space-mono)" }}
    >
        {icon}
        {children}
    </label>
);

/** Neumorphic select trigger override via className */
const selectTriggerClass =
    "h-9 border-0 font-mono text-xs focus:ring-0 focus:ring-offset-0";
const selectTriggerStyle: React.CSSProperties = {
    backgroundColor: SURFACE,
    color: TEXT,
    boxShadow: SHADOW_IN,
    borderRadius: 8,
    fontFamily: "var(--font-jetbrains-mono)",
};

export const ReportsToolbar: FC = () => {
    const { params, setParams, fetchListPage, selectedIds, clearSelection, loading } = useReportsStore();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const onDebouncedSearch = useDebouncedCallback((value: string) => {
        setParams({ search: value, page: 1 });
        void fetchListPage(1);
    }, 400);

    const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        onDebouncedSearch(e.target.value);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await fetchListPage(params.page);
        } finally {
            setTimeout(() => setIsRefreshing(false), 300);
        }
    };

    const selectionCount = selectedIds.size;
    const hasSelection = selectionCount > 0;

    const statusItems = useMemo(() => Object.values(REPORT_STATUS).map((v) => ({ value: v, label: v.replace("_", " ") })), []);
    const reasonItems = useMemo(() => Object.values(REPORT_REASON).map((v) => ({ value: v, label: v.replace("_", " ") })), []);
    const priorityItems = useMemo(() => Object.values(REPORT_PRIORITY).map((v) => ({ value: v, label: v })), []);

    const hasActiveFilters =
        params.status !== null ||
        params.priority !== null ||
        params.reason !== null ||
        (params.search && params.search.length > 0);

    return (
        <div className="space-y-5">
            {/* Search bar */}
            <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <HiSearch size={16} style={{ color: PRIMARY }} />
                </span>
                <input
                    defaultValue={params.search ?? ""}
                    onChange={onSearchChange}
                    placeholder="Search by message, reporter, tour, or tags…"
                    aria-label="Search reports"
                    style={{
                        width: "100%",
                        height: 40,
                        paddingLeft: 36,
                        paddingRight: params.search ? 36 : 14,
                        border: "none",
                        outline: "none",
                        backgroundColor: SURFACE,
                        borderRadius: 10,
                        boxShadow: SHADOW_IN,
                        color: TEXT,
                        fontSize: 13,
                        fontFamily: "var(--font-jetbrains-mono)",
                    }}
                />
                {params.search && params.search.length > 0 && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => {
                            if ("cancel" in onDebouncedSearch && typeof onDebouncedSearch.cancel === "function") {
                                onDebouncedSearch.cancel();
                            }
                            setParams({ search: "", page: 1 });
                            void fetchListPage(1);
                        }}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        aria-label="Clear search"
                        style={{ color: MUTED }}
                    >
                        <HiX size={16} />
                    </motion.button>
                )}
            </div>

            {/* Filters row */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <IoFunnel size={14} style={{ color: PRIMARY }} />
                    <span
                        className="text-xs font-bold uppercase tracking-widest"
                        style={{ color: PRIMARY, fontFamily: "var(--font-space-mono)" }}
                    >
                        Filters &amp; Sorting
                    </span>
                    {hasActiveFilters && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                backgroundColor: PRIMARY,
                                color: "#fff",
                                borderRadius: 999,
                                padding: "1px 8px",
                                fontSize: 10,
                                fontFamily: "var(--font-space-mono)",
                                fontWeight: 700,
                            }}
                        >
                            Active
                        </motion.span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Search Scope */}
                    <div>
                        <FieldLabel>Scope</FieldLabel>
                        <Select
                            value={params.searchScope ?? "any"}
                            onValueChange={(val: ReportsSearchScope) => {
                                setParams({ searchScope: val, page: 1 });
                                void fetchListPage(1);
                            }}
                        >
                            <SelectTrigger aria-label="Search scope" className={selectTriggerClass} style={selectTriggerStyle}>
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
                    <div>
                        <FieldLabel>Status</FieldLabel>
                        <Select
                            value={params.status ?? "null"}
                            onValueChange={(val: string) => {
                                const newStatus = val === "null" ? null : (val as ReportStatus);
                                setParams({ status: newStatus, page: 1 });
                                void fetchListPage(1);
                            }}
                        >
                            <SelectTrigger aria-label="Status filter" className={selectTriggerClass} style={selectTriggerStyle}>
                                <SelectValue placeholder="All Status">
                                    {params.status ? params.status.replace("_", " ") : "All Status"}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="null">All Status</SelectItem>
                                {statusItems.map((i) => (
                                    <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Reason Filter */}
                    <div>
                        <FieldLabel>Reason</FieldLabel>
                        <Select
                            value={params.reason ?? "null"}
                            onValueChange={(val: string) => {
                                const newReason = val === "null" ? null : (val as ReportReason);
                                setParams({ reason: newReason, page: 1 });
                                void fetchListPage(1);
                            }}
                        >
                            <SelectTrigger aria-label="Reason filter" className={selectTriggerClass} style={selectTriggerStyle}>
                                <SelectValue placeholder="All Reasons">
                                    {params.reason ? params.reason.replace("_", " ") : "All Reasons"}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="null">All Reasons</SelectItem>
                                {reasonItems.map((i) => (
                                    <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Priority Filter */}
                    <div>
                        <FieldLabel>Priority</FieldLabel>
                        <Select
                            value={params.priority ?? "null"}
                            onValueChange={(val: string) => {
                                const newPriority = val === "null" ? null : (val as ReportPriority);
                                setParams({ priority: newPriority, page: 1 });
                                void fetchListPage(1);
                            }}
                        >
                            <SelectTrigger aria-label="Priority filter" className={selectTriggerClass} style={selectTriggerStyle}>
                                <SelectValue placeholder="All Priority">
                                    {params.priority || "All Priority"}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="null">All Priority</SelectItem>
                                {priorityItems.map((i) => (
                                    <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Sort Controls */}
                    <div>
                        <FieldLabel
                            icon={params.sort?.direction === "asc"
                                ? <HiSortAscending size={12} />
                                : <HiSortDescending size={12} />}
                        >
                            Sort By
                        </FieldLabel>
                        <div className="flex flex-col gap-2">
                            <Select
                                value={params.sort?.field ?? "createdAt"}
                                onValueChange={(val) => {
                                    setParams({ sort: { field: val as ReportsSortField, direction: params.sort?.direction ?? "desc" }, page: 1 });
                                    void fetchListPage(1);
                                }}
                            >
                                <SelectTrigger aria-label="Sort field" className={selectTriggerClass} style={selectTriggerStyle}>
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sortFields.map((f) => (
                                        <SelectItem key={f} value={f}>{sortFieldLabels[f]}</SelectItem>
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
                                <SelectTrigger aria-label="Sort direction" className={selectTriggerClass} style={{ ...selectTriggerStyle, width: "100%" }}>
                                    <SelectValue placeholder="Direction" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="asc">
                                        <div className="flex items-center gap-2"><HiSortAscending size={14} /> Ascending</div>
                                    </SelectItem>
                                    <SelectItem value="desc">
                                        <div className="flex items-center gap-2"><HiSortDescending size={14} /> Descending</div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3">
                {/* Refresh */}
                <button
                    onClick={handleRefresh}
                    disabled={loading.type === "loading" || isRefreshing}
                    aria-label="Refresh data"
                    style={{
                        height: 36,
                        paddingInline: 16,
                        borderRadius: 8,
                        border: "none",
                        backgroundColor: SURFACE,
                        boxShadow: SHADOW_OUT,
                        color: isRefreshing ? PRIMARY : TEXT,
                        fontFamily: "var(--font-space-mono)",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: loading.type === "loading" ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        opacity: loading.type === "loading" ? 0.6 : 1,
                    }}
                >
                    <motion.span
                        animate={{ rotate: isRefreshing ? 360 : 0 }}
                        transition={{ duration: 0.6, repeat: isRefreshing ? Infinity : 0 }}
                    >
                        <HiArrowPath size={14} />
                    </motion.span>
                    {isRefreshing ? "Refreshing…" : "Refresh"}
                </button>

                {/* Reset */}
                <button
                    onClick={() => {
                        if ("cancel" in onDebouncedSearch && typeof onDebouncedSearch.cancel === "function") {
                            onDebouncedSearch.cancel();
                        }
                        const defaults: Partial<ReportsQueryParams> = {
                            status: null as ReportsQueryParams["status"],
                            priority: null as ReportsQueryParams["priority"],
                            reason: null as ReportsQueryParams["reason"],
                            search: "",
                            searchScope: "any" as ReportsQueryParams["searchScope"],
                            page: 1,
                        };
                        useReportsStore.getState().setParams(defaults);
                        void useReportsStore.getState().fetchListPage(1);
                    }}
                    disabled={!hasActiveFilters}
                    aria-label="Reset filters"
                    style={{
                        height: 36,
                        paddingInline: 16,
                        borderRadius: 8,
                        border: "none",
                        backgroundColor: SURFACE,
                        boxShadow: hasActiveFilters ? SHADOW_OUT : SHADOW_IN,
                        color: hasActiveFilters ? TEXT : MUTED,
                        fontFamily: "var(--font-space-mono)",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: hasActiveFilters ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                    }}
                >
                    <HiRefresh size={14} />
                    Reset Filters
                </button>
            </div>

            {/* Bulk Actions Bar */}
            <div
                style={{
                    borderRadius: 12,
                    padding: "14px 18px",
                    backgroundColor: SURFACE,
                    boxShadow: hasSelection ? SHADOW_OUT : SHADOW_IN,
                    transition: "box-shadow 0.25s ease",
                    borderLeft: hasSelection ? `3px solid ${PRIMARY}` : "3px solid transparent",
                }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Checkbox
                            checked={hasSelection}
                            onCheckedChange={(checked) => { if (!checked) clearSelection(); }}
                            aria-label="Bulk selection toggle"
                            className="h-4 w-4"
                        />
                        <div>
                            <span
                                className="text-xs font-bold"
                                style={{
                                    color: hasSelection ? PRIMARY : MUTED,
                                    fontFamily: "var(--font-space-mono)",
                                }}
                            >
                                {hasSelection
                                    ? `${selectionCount} Report${selectionCount > 1 ? "s" : ""} Selected`
                                    : "No items selected"}
                            </span>
                            {hasSelection && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-[11px]"
                                    style={{ color: MUTED, fontFamily: "var(--font-jetbrains-mono)" }}
                                >
                                    Perform bulk actions on selected reports
                                </motion.p>
                            )}
                        </div>

                        {hasSelection && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => clearSelection()}
                                aria-label="Clear selection"
                                style={{
                                    width: 28, height: 28, borderRadius: 6, border: "none",
                                    backgroundColor: SURFACE, boxShadow: SHADOW_OUT,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", color: "#FF2157",
                                }}
                            >
                                <IoClose size={14} />
                            </motion.button>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        {hasSelection && (
                            <motion.div
                                initial={{ opacity: 0, x: 16, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 16, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 280, damping: 24 }}
                            >
                                <button
                                    onClick={async () => {
                                        const ids = Array.from(useReportsStore.getState().selectedIds);
                                        for (const id of ids) {
                                            await useReportsStore.getState().resolveReport(id, "Bulk resolve");
                                        }
                                        useReportsStore.getState().clearSelection();
                                    }}
                                    style={{
                                        height: 34,
                                        paddingInline: 16,
                                        borderRadius: 8,
                                        border: "none",
                                        backgroundColor: "#00A63D",
                                        color: "#fff",
                                        fontFamily: "var(--font-space-mono)",
                                        fontSize: 12,
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        boxShadow: "3px 3px 8px rgba(0,166,61,0.35), -1px -1px 4px rgba(255,255,255,0.4)",
                                    }}
                                >
                                    <IoCheckmarkDone size={15} />
                                    Resolve Selected
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};