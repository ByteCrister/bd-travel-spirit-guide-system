"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    AlertCircle, Calendar as CalendarIcon, ChevronDown, Filter, Loader2,
    RefreshCw, Shield, X, Clock, Activity, TrendingUp, CalendarDays, FileText, Database,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AuditDateFilter, AuditLog } from "@/types/current-user.types";
import { useCurrentUserStore } from "@/store/current-user.store";
import { AUDIT_ACTION, AuditAction } from "@/constants/current-user/audit-action.const";

// Shared neumorphic button
const NeuBtn = ({
    onClick, disabled, children, variant = "raised", className = "",
}: {
    onClick?: () => void; disabled?: boolean; children: React.ReactNode;
    variant?: "raised" | "inset" | "primary"; className?: string;
}) => {
    const shadows = {
        raised: " hover: active:",
        inset: "",
        primary: "bg-[#006666] text-white  hover:bg-[#005555] active:",
    };
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`px-3 py-2 rounded-xl text-xs font-semibold font-[var(--font-space-mono)]
                bg-[#E7E5E4] text-[#1E2938]/70 ${shadows[variant]}
                disabled:opacity-40 transition-all duration-150 ${className}`}
        >
            {children}
        </button>
    );
};

const filterVariants: Variants = {
    hidden: { height: 0, opacity: 0 },
    visible: { height: "auto", opacity: 1, transition: { height: { duration: 0.25 }, opacity: { duration: 0.2, delay: 0.1 } } },
    exit: { height: 0, opacity: 0, transition: { height: { duration: 0.2 }, opacity: { duration: 0.15 } } },
};

const ACTION_COLORS: Record<string, string> = {
    create: "text-[#00A63D]",
    update: "text-[#006666]",
    delete: "text-[#FF2157]",
    read: "text-[#1E2938]/50",
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
    create: <TrendingUp className="h-3 w-3" />,
    update: <Activity className="h-3 w-3" />,
    delete: <X className="h-3 w-3" />,
    read: <Shield className="h-3 w-3" />,
};

export default function AuditLogsSection() {
    const {
        audits, auditsMeta, auditFilters,
        fetchUserAudits, setAuditDateFilter, resetAuditFilters, loadMoreAudits,
    } = useCurrentUserStore();

    const [date, setDate] = useState<Date>();
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const debounceRef = useRef<number | null>(null);

    useEffect(() => {
        if (auditFilters.date) { const d = new Date(auditFilters.date); if (!isNaN(d.getTime())) setDate(d); } else setDate(undefined);
        if (auditFilters.startDate) { const d = new Date(auditFilters.startDate); if (!isNaN(d.getTime())) setStartDate(d); } else setStartDate(undefined);
        if (auditFilters.endDate) { const d = new Date(auditFilters.endDate); if (!isNaN(d.getTime())) setEndDate(d); } else setEndDate(undefined);
    }, [auditFilters.date, auditFilters.startDate, auditFilters.endDate]);

    const handleAccordionChange = useCallback(async (value: string) => {
        if (value === "audits" && (auditsMeta.stale || audits.length === 0)) await fetchUserAudits();
    }, [audits.length, auditsMeta.stale, fetchUserAudits]);

    const applyFilters = useCallback(async () => {
        const filters: AuditDateFilter = {};
        if (date) filters.date = date.toISOString();
        else { if (startDate) filters.startDate = startDate.toISOString(); if (endDate) filters.endDate = endDate.toISOString(); }
        setAuditDateFilter(filters);
        await fetchUserAudits({ ...filters, force: true });
        setIsFilterOpen(false);
    }, [date, startDate, endDate, setAuditDateFilter, fetchUserAudits]);

    const clearFilters = useCallback(async () => {
        setDate(undefined); setStartDate(undefined); setEndDate(undefined);
        resetAuditFilters();
        await fetchUserAudits({ force: true });
        setIsFilterOpen(false);
    }, [resetAuditFilters, fetchUserAudits]);

    const handleScroll = useCallback(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => {
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            if (scrollTop + clientHeight >= scrollHeight - 100 && !auditsMeta.loading && auditFilters.hasMore) loadMoreAudits();
        }, 200);
    }, [auditsMeta.loading, auditFilters.hasMore, loadMoreAudits]);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => { window.removeEventListener("scroll", handleScroll); if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [handleScroll]);

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const hasActiveFilters = auditFilters.date || auditFilters.startDate || auditFilters.endDate;

    if (auditsMeta.error) {
        return (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-[#E7E5E4]
                    ">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-[#E7E5E4]
                        ">
                        <AlertCircle className="h-5 w-5 text-[#FF2157]" />
                    </div>
                    <h3 className="font-bold text-[#1E2938] font-[var(--font-space-mono)]">Error Loading Audit Logs</h3>
                </div>
                <p className="text-sm text-[#1E2938]/60 mb-4 font-[var(--font-jetbrains-mono)]">{auditsMeta.error}</p>
                <NeuBtn onClick={() => fetchUserAudits({ force: true })}>
                    <span className="flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Retry</span>
                </NeuBtn>
            </motion.div>
        );
    }

    const DatePickerBtn = ({ value, label }: { value?: Date; label: string }) => (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-[var(--font-jetbrains-mono)]
            text-[#1E2938]/60 bg-[#E7E5E4]
            
            min-w-[140px]">
            <CalendarIcon className="h-3.5 w-3.5 text-[#006666]" />
            {value ? format(value, "MMM d, yyyy") : <span className="text-[#1E2938]/30">{label}</span>}
        </div>
    );

    return (
        <Accordion type="single" collapsible className="w-full" onValueChange={handleAccordionChange} defaultValue="">
            <AccordionItem value="audits" className="border-0">
                {/* Trigger */}
                <div className="rounded-2xl bg-[#E7E5E4]
                    ">
                    <AccordionTrigger className="hover:no-underline px-6 py-5 rounded-2xl hover:bg-transparent
                        data-[state=open]:rounded-b-none">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-[#E7E5E4]
                                ">
                                <Shield className="h-5 w-5 text-[#006666]" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-[#1E2938] font-[var(--font-space-mono)]">Audit Logs</h3>
                                <p className="text-xs text-[#1E2938]/50 font-[var(--font-jetbrains-mono)] mt-0.5">
                                    Track your account activity
                                </p>
                            </div>
                        </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-6 pb-6 pt-2">
                        {/* Filter panel */}
                        <div className="mb-6 p-4 rounded-xl bg-[#E7E5E4]
                            ">
                            <div className="flex items-center justify-between mb-3">
                                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest
                                    text-[#1E2938]/60 font-[var(--font-space-mono)]">
                                    <Filter className="h-3.5 w-3.5" /> Filters
                                </span>
                                <div className="flex items-center gap-2">
                                    <AnimatePresence>
                                        {hasActiveFilters && (
                                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                                                <NeuBtn onClick={clearFilters}>
                                                    <span className="flex items-center gap-1"><X className="h-3 w-3" /> Clear</span>
                                                </NeuBtn>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <NeuBtn onClick={() => setIsFilterOpen(!isFilterOpen)}>
                                        <span className="flex items-center gap-1">
                                            {isFilterOpen ? "Hide" : "Show"}
                                            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", isFilterOpen && "rotate-180")} />
                                        </span>
                                    </NeuBtn>
                                </div>
                            </div>

                            {/* Active filter badges */}
                            <AnimatePresence>
                                {hasActiveFilters && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                        className="flex flex-wrap gap-2 mb-3 overflow-hidden">
                                        {auditFilters.date && (
                                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs
                                                text-[#006666] font-[var(--font-jetbrains-mono)]
                                                bg-[#E7E5E4] ">
                                                <CalendarIcon className="h-3 w-3" />
                                                {format(new Date(auditFilters.date), "MMM d, yyyy")}
                                            </span>
                                        )}
                                        {auditFilters.startDate && (
                                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs
                                                text-[#006666] font-[var(--font-jetbrains-mono)]
                                                bg-[#E7E5E4] ">
                                                From: {format(new Date(auditFilters.startDate), "MMM d, yyyy")}
                                            </span>
                                        )}
                                        {auditFilters.endDate && (
                                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs
                                                text-[#006666] font-[var(--font-jetbrains-mono)]
                                                bg-[#E7E5E4] ">
                                                To: {format(new Date(auditFilters.endDate), "MMM d, yyyy")}
                                            </span>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {isFilterOpen && (
                                    <motion.div variants={filterVariants} initial="hidden" animate="visible" exit="exit" className="overflow-hidden">
                                        <div className="space-y-4 pt-3 border-t border-[#1E2938]/8 mt-2">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {/* Specific Date */}
                                                <div className="space-y-1.5">
                                                    <label className="flex items-center gap-1.5 text-xs font-semibold
                                                        text-[#1E2938]/50 font-[var(--font-space-mono)]">
                                                        <CalendarIcon className="h-3 w-3" /> Specific Date
                                                    </label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <button type="button" className="w-full">
                                                                <DatePickerBtn value={date} label="Pick a date" />
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus
                                                                disabled={(d) => { const n = new Date(d); n.setHours(0,0,0,0); return n > today; }} />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                                {/* Start Date */}
                                                <div className="space-y-1.5">
                                                    <label className="flex items-center gap-1.5 text-xs font-semibold
                                                        text-[#1E2938]/50 font-[var(--font-space-mono)]">
                                                        <CalendarDays className="h-3 w-3" /> Start Date
                                                    </label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <button type="button" className="w-full">
                                                                <DatePickerBtn value={startDate} label="Start date" />
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar mode="single" selected={startDate}
                                                                onSelect={(d) => { if (!d) return; if (endDate && d > endDate) setEndDate(d); setStartDate(d); }}
                                                                initialFocus
                                                                disabled={(d) => { const n = new Date(d); n.setHours(0,0,0,0); return n > today || (!!endDate && n > endDate); }} />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                                {/* End Date */}
                                                <div className="space-y-1.5">
                                                    <label className="flex items-center gap-1.5 text-xs font-semibold
                                                        text-[#1E2938]/50 font-[var(--font-space-mono)]">
                                                        <CalendarDays className="h-3 w-3" /> End Date
                                                    </label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <button type="button" className="w-full">
                                                                <DatePickerBtn value={endDate} label="End date" />
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar mode="single" selected={endDate}
                                                                onSelect={(d) => { if (!d) return; if (startDate && d < startDate) setStartDate(d); setEndDate(d); }}
                                                                initialFocus
                                                                disabled={(d) => { const n = new Date(d); n.setHours(0,0,0,0); return n > today || (!!startDate && n < startDate); }} />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <NeuBtn variant="primary" onClick={applyFilters} disabled={auditsMeta.loading} className="flex-1 flex items-center justify-center gap-2">
                                                    {auditsMeta.loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                                    Apply Filters
                                                </NeuBtn>
                                                <NeuBtn onClick={() => setIsFilterOpen(false)} className="flex-1 text-center">Cancel</NeuBtn>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Table */}
                        <div className="rounded-xl overflow-hidden bg-[#E7E5E4]
                            ">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-b border-[#1E2938]/8">
                                        {["Action", "Target", "Changes", "IP Address", "Timestamp"].map((h) => (
                                            <TableHead key={h} className="text-xs font-bold uppercase tracking-widest
                                                text-[#1E2938]/40 font-[var(--font-space-mono)] py-3">
                                                {h === "Timestamp" ? (
                                                    <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" />{h}</span>
                                                ) : h}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {auditsMeta.loading && audits.length === 0 ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i} className="border-b border-[#1E2938]/5">
                                                <TableCell colSpan={5}>
                                                    <Skeleton className="h-10 w-full rounded-lg bg-[#1E2938]/8" />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : audits.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-16">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-4 rounded-xl bg-[#E7E5E4]
                                                        ">
                                                        <FileText className="h-6 w-6 text-[#1E2938]/30" />
                                                    </div>
                                                    <p className="font-bold text-[#1E2938]/50 text-sm font-[var(--font-space-mono)]">
                                                        No audit logs found
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        audits.map((log: AuditLog, index: number) => {
                                            const actionKey = log.action.toLowerCase();
                                            return (
                                                <motion.tr
                                                    key={log._id}
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.02 }}
                                                    className="border-b border-[#1E2938]/5 last:border-0 hover:bg-[#1E2938]/3 transition-colors"
                                                >
                                                    <TableCell className="py-3.5">
                                                        <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1.5 rounded-lg text-xs font-bold
                                                            font-[var(--font-space-mono)] bg-[#E7E5E4]
                                                            
                                                            ${ACTION_COLORS[actionKey] || "text-[#1E2938]/50"}`}>
                                                            {ACTION_ICONS[actionKey] || <Shield className="h-3 w-3" />}
                                                            {log.action}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="py-3.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 rounded-lg bg-[#E7E5E4]
                                                                ">
                                                                <Database className="h-3.5 w-3.5 text-[#006666]" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-[#1E2938] font-[var(--font-space-mono)]">{log.targetModel}</p>
                                                                <p className="text-xs text-[#1E2938]/40 font-[var(--font-jetbrains-mono)]">{log.target}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-3.5">
                                                        {log.changes ? (
                                                            <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs
                                                                text-[#006666] font-[var(--font-jetbrains-mono)]
                                                                bg-[#E7E5E4] ">
                                                                <Activity className="h-3 w-3" /> Modified
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-[#1E2938]/40 font-[var(--font-jetbrains-mono)]">
                                                                {log.note || "—"}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="py-3.5">
                                                        <code className="px-2 py-1 rounded-lg text-xs font-[var(--font-jetbrains-mono)]
                                                            text-[#1E2938]/60 bg-[#E7E5E4]
                                                            ">
                                                            {log.ip || "—"}
                                                        </code>
                                                    </TableCell>
                                                    <TableCell className="py-3.5 text-xs text-[#1E2938]/50 font-[var(--font-jetbrains-mono)]">
                                                        {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                                                    </TableCell>
                                                </motion.tr>
                                            );
                                        })
                                    )}

                                    {auditsMeta.loading && audits.length > 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-5">
                                                <span className="flex items-center justify-center gap-2 text-xs text-[#1E2938]/50 font-[var(--font-jetbrains-mono)]">
                                                    <Loader2 className="h-4 w-4 animate-spin" /> Loading more…
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {!auditsMeta.loading && auditFilters.hasMore && audits.length > 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4">
                                                <NeuBtn onClick={() => loadMoreAudits()}>
                                                    <span className="flex items-center gap-1.5">
                                                        <ChevronDown className="h-3.5 w-3.5" /> Load More
                                                    </span>
                                                </NeuBtn>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Stats footer */}
                        {audits.length > 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                                className="mt-4 flex items-center justify-between px-4 py-3 rounded-xl
                                    bg-[#E7E5E4]
                                    ">
                                <span className="flex items-center gap-2 text-xs text-[#1E2938]/50 font-[var(--font-jetbrains-mono)]">
                                    <Database className="h-3.5 w-3.5 text-[#006666]" />
                                    <span className="font-bold text-[#1E2938]">{audits.length}</span> records shown
                                </span>
                                {auditsMeta.total && (
                                    <span className="text-xs text-[#1E2938]/50 font-[var(--font-jetbrains-mono)]">
                                        Total: <span className="font-bold text-[#1E2938]">{auditsMeta.total}</span>
                                    </span>
                                )}
                            </motion.div>
                        )}
                    </AccordionContent>
                </div>
            </AccordionItem>
        </Accordion>
    );
}