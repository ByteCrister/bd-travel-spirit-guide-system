// components/reports/ReportsTable.tsx
// Neumorphism design system — Space Mono + JetBrains Mono
// primary=#006666 | surface=#E7E5E4 | text=#1E2938

"use client";

import type { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ReportsCacheEntry, ReportListItem } from "@/types/tour/reports.types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
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
    MdMoreVert,
} from "react-icons/md";
import { HiDocumentText } from "react-icons/hi";
import { useReportsStore } from "@/store/report.store";
import { PulseLoader } from "./PulseLoader";

const SURFACE = "#E7E5E4";
const SHADOW_OUT = "5px 5px 10px #c4c2c0, -5px -5px 10px #ffffff";
const SHADOW_IN = "inset 3px 3px 7px #c4c2c0, inset -3px -3px 7px #ffffff";
const PRIMARY = "#006666";
const TEXT = "#1E2938";
const MUTED = "#5a6475";

const navBtnStyle = (disabled: boolean): React.CSSProperties => ({
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "none",
    backgroundColor: SURFACE,
    boxShadow: disabled ? SHADOW_IN : SHADOW_OUT,
    color: disabled ? MUTED : TEXT,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: disabled ? 0.5 : 1,
});

export const ReportsTable: FC = () => {
    const { params, pageLimitOptions, readCachedList, fetchListPage, setParams, loading } = useReportsStore();

    const localLoading = loading.type === "loading" && loading.context === "list";
    const entry: ReportsCacheEntry | null = readCachedList(params);
    const limit = params.limit ?? 10;
    const page = params.page ?? 1;
    const docsPageSlice: ReportListItem[] = entry?.pages.get(page) ?? [];
    const total = entry?.total ?? 0;
    const pages = total > 0 ? Math.ceil(total / limit) : 1;
    const startIdx = total > 0 ? (page - 1) * limit + 1 : 0;
    const endIdx = total > 0 ? Math.min(page * limit, total) : 0;

    const headers = [
        { icon: <MdCheckBox size={16} style={{ color: PRIMARY }} />, label: null, width: 48 },
        { icon: <MdFingerprint size={16} style={{ color: "#9966cc" }} />, label: "Report ID" },
        { icon: <MdTour size={16} style={{ color: "#00A63D" }} />, label: "Tour" },
        { icon: <MdReport size={16} style={{ color: "#FE9900" }} />, label: "Reason" },
        { icon: <MdPerson size={16} style={{ color: PRIMARY }} />, label: "Reporter" },
        { icon: <MdCalendarToday size={16} style={{ color: MUTED }} />, label: "Created" },
        { icon: <MdToggleOn size={16} style={{ color: "#00A63D" }} />, label: "Status" },
        { icon: <MdMoreVert size={16} style={{ color: MUTED }} />, label: "Actions", align: "right" as const },
    ];

    return (
        <div className="flex flex-col gap-0">
            {/* Table wrapper — inset neumorphic surface */}
            <div
                style={{
                    backgroundColor: SURFACE,
                    borderRadius: 16,
                    boxShadow: SHADOW_IN,
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Loading overlay */}
                <AnimatePresence>
                    {localLoading && docsPageSlice.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: "absolute", inset: 0,
                                backgroundColor: "rgba(231,229,228,0.85)",
                                backdropFilter: "blur(4px)",
                                zIndex: 20,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                                gap: 12,
                            }}
                        >
                            <PulseLoader />
                            <span style={{ color: PRIMARY, fontFamily: "var(--font-space-mono)", fontSize: 12, fontWeight: 700 }}>
                                Refreshing data…
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow
                                style={{
                                    borderBottom: "1px solid #cccac8",
                                    backgroundColor: "transparent",
                                }}
                            >
                                {headers.map((h, i) => (
                                    <TableHead
                                        key={i}
                                        style={{ width: h.width, textAlign: h.align ?? "left" }}
                                    >
                                        <div
                                            className="flex items-center gap-1.5"
                                            style={{ justifyContent: h.align === "right" ? "flex-end" : "flex-start" }}
                                        >
                                            {h.icon}
                                            {h.label && (
                                                <span
                                                    className="text-[11px] font-bold uppercase tracking-wider"
                                                    style={{ color: MUTED, fontFamily: "var(--font-space-mono)" }}
                                                >
                                                    {h.label}
                                                </span>
                                            )}
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            <AnimatePresence mode="wait">
                                {localLoading && docsPageSlice.length === 0 ? (
                                    <TableRow key="loading">
                                        <TableCell colSpan={8} className="text-center py-16">
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex flex-col items-center gap-4"
                                            >
                                                <PulseLoader />
                                                <span
                                                    className="text-xs font-semibold"
                                                    style={{ color: PRIMARY, fontFamily: "var(--font-space-mono)" }}
                                                >
                                                    Loading reports…
                                                </span>
                                            </motion.div>
                                        </TableCell>
                                    </TableRow>
                                ) : docsPageSlice.length === 0 ? (
                                    <TableRow key="empty">
                                        <TableCell colSpan={8} className="text-center py-16">
                                            <motion.div
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="flex flex-col items-center gap-3"
                                            >
                                                <HiDocumentText size={48} style={{ color: "#cccac8" }} />
                                                <p
                                                    className="text-sm font-bold"
                                                    style={{ color: TEXT, fontFamily: "var(--font-space-mono)" }}
                                                >
                                                    No reports found
                                                </p>
                                                <p
                                                    className="text-xs"
                                                    style={{ color: MUTED, fontFamily: "var(--font-jetbrains-mono)" }}
                                                >
                                                    Try adjusting your filters or search criteria
                                                </p>
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

            {/* Pagination */}
            <div
                className="flex items-center justify-between"
                style={{ padding: "16px 4px 4px" }}
            >
                {/* Results info */}
                <div
                    style={{
                        backgroundColor: SURFACE,
                        borderRadius: 8,
                        padding: "6px 14px",
                        boxShadow: SHADOW_IN,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                    }}
                >
                    <span
                        className="text-xs"
                        style={{ color: MUTED, fontFamily: "var(--font-jetbrains-mono)" }}
                    >
                        Showing
                    </span>
                    <span
                        className="text-xs font-bold"
                        style={{ color: PRIMARY, fontFamily: "var(--font-space-mono)" }}
                    >
                        {startIdx}–{endIdx}
                    </span>
                    <span
                        className="text-xs"
                        style={{ color: MUTED, fontFamily: "var(--font-jetbrains-mono)" }}
                    >
                        of
                    </span>
                    <span
                        className="text-xs font-bold"
                        style={{ color: TEXT, fontFamily: "var(--font-space-mono)" }}
                    >
                        {total}
                    </span>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3">
                    {/* Page size selector */}
                    <Select
                        value={String(limit)}
                        onValueChange={(val) => {
                            const nextLimit = Number(val);
                            useReportsStore.getState().setParams({ limit: nextLimit, page: 1 });
                            void useReportsStore.getState().fetchListPage(1);
                        }}
                    >
                        <SelectTrigger
                            aria-label="Page size"
                            className="h-9 w-[130px] border-0 text-xs focus:ring-0"
                            style={{
                                backgroundColor: SURFACE,
                                boxShadow: SHADOW_OUT,
                                borderRadius: 8,
                                color: TEXT,
                                fontFamily: "var(--font-jetbrains-mono)",
                            }}
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {pageLimitOptions.map((opt) => (
                                <SelectItem key={opt} value={String(opt)}>
                                    <span style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                                        {opt} per page
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Page nav */}
                    <div className="flex items-center gap-2">
                        <button
                            style={navBtnStyle(page <= 1)}
                            disabled={page <= 1}
                            onClick={() => { setParams({ page: 1 }); void fetchListPage(1); }}
                            aria-label="First page"
                        >
                            <MdFirstPage size={18} />
                        </button>
                        <button
                            style={navBtnStyle(page <= 1)}
                            disabled={page <= 1}
                            onClick={() => { const n = page - 1; setParams({ page: n }); void fetchListPage(n); }}
                            aria-label="Previous page"
                        >
                            <MdChevronLeft size={18} />
                        </button>

                        {/* Page indicator — inset pill */}
                        <div
                            style={{
                                backgroundColor: SURFACE,
                                borderRadius: 8,
                                padding: "4px 16px",
                                boxShadow: SHADOW_IN,
                                minWidth: 80,
                                textAlign: "center",
                            }}
                        >
                            <span
                                className="text-xs font-bold"
                                style={{ color: PRIMARY, fontFamily: "var(--font-space-mono)" }}
                            >
                                {page}
                            </span>
                            <span
                                className="text-xs"
                                style={{ color: MUTED, marginInline: 4, fontFamily: "var(--font-space-mono)" }}
                            >
                                /
                            </span>
                            <span
                                className="text-xs font-semibold"
                                style={{ color: TEXT, fontFamily: "var(--font-space-mono)" }}
                            >
                                {pages}
                            </span>
                        </div>

                        <button
                            style={navBtnStyle(page >= pages)}
                            disabled={page >= pages}
                            onClick={() => { const n = page + 1; setParams({ page: n }); void fetchListPage(n); }}
                            aria-label="Next page"
                        >
                            <MdChevronRight size={18} />
                        </button>
                        <button
                            style={navBtnStyle(page >= pages)}
                            disabled={page >= pages}
                            onClick={() => { setParams({ page: pages }); void fetchListPage(pages); }}
                            aria-label="Last page"
                        >
                            <MdLastPage size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};