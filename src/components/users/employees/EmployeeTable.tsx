"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, ChevronDown, Banknote } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
    FaUser,
    FaEnvelope,
    FaUsers,
    FaCalendarAlt,
    FaCreditCard,
} from "react-icons/fa";

import { cn } from "@/lib/utils";
import {
    EmployeesListResponse,
    EmployeeListItemDTO,
    EmployeeSortKey,
} from "@/types/employee/employee.types";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

import {
    Table,
    TableHeader,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { spaceMono, jetbrainsMono } from "@/styles/fonts";

// ─── Design tokens ────────────────────────────────────────────────────────────
const TOKEN = {
    surface: "#E7E5E4",
    primary: "#006666",
    text: "#1E2938",
    muted: "#6B7280",
    success: "#00A63D",
    warning: "#FE9900",
    danger: "#FF2157",
    neu_raised: "6px 6px 12px rgba(0,0,0,0.13), -4px -4px 10px rgba(255,255,255,0.75)",
    neu_inset: "inset 3px 3px 7px rgba(0,0,0,0.11), inset -3px -3px 7px rgba(255,255,255,0.68)",
    neu_subtle: "3px 3px 7px rgba(0,0,0,0.1), -2px -2px 6px rgba(255,255,255,0.65)",
};

const fontMono = `var(--font-jetbrains-mono), 'JetBrains Mono', monospace`;
const fontDisplay = `var(--font-space-mono), 'Space Mono', monospace`;

type SortOrder = "asc" | "desc";

interface EmployeeTableProps {
    list: EmployeesListResponse | null;
    loading: boolean;
    onRowClick: (id: string) => void;
    onSort: (sortBy: EmployeeSortKey, sortOrder: SortOrder) => void;
    sortBy: EmployeeSortKey;
    sortOrder: SortOrder;
    onRetryPayment?: (employeeId: string) => void;
    retryLoading?: string;
    selectedIds?: Set<string>;
    onToggleSelect?: (id: string) => void;
    onToggleSelectAll?: (ids: string[]) => void;
    onManualPay?: (employee: EmployeeListItemDTO) => void;
    manualPayLoading?: string;
}

const primaryFields = [
    { key: "user.name", label: "Name", icon: <FaUser className="h-3 w-3" />, width: "w-48" },
    { key: "user.email", label: "Email", icon: <FaEnvelope className="h-3 w-3" />, width: "w-56" },
    { key: "status", label: "Status", icon: <FaUsers className="h-3 w-3" />, width: "w-28" },
    { key: "dateOfJoining", label: "Joined", icon: <FaCalendarAlt className="h-3 w-3" />, width: "w-28" },
    { key: "paymentStatus", label: "Payment", icon: <FaCreditCard className="h-3 w-3" />, width: "w-40" },
] as const;

export function EmployeeTable({
    list,
    loading,
    onRowClick,
    onSort,
    sortBy,
    sortOrder,
    onRetryPayment,
    retryLoading,
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    onManualPay,
    manualPayLoading,
}: EmployeeTableProps) {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const showSelection = !!onToggleSelect;

    const payableIds = (list?.docs ?? [])
        .filter((d) => d.paymentMode === "manual" && !d.isDeleted && d.currentMonthPayment?.status !== "paid")
        .map((d) => d.id);

    const headers = [
        ...(showSelection
            ? [{ key: "select", label: "", icon: null, width: "w-10", sortable: false }]
            : []),
        { key: "accordion", label: "", icon: null, width: "w-10", sortable: false },
        { key: "avatar", label: "", icon: null, width: "w-14", sortable: false },
        ...primaryFields.map((field) => ({
            ...field,
            sortable: ["user.name", "user.email", "status", "dateOfJoining", "paymentStatus"].includes(field.key),
        })),
    ];

    const sortToggle = (key: EmployeeSortKey) =>
        onSort(key, sortBy === key ? (sortOrder === "asc" ? "desc" : "asc") : "asc");

    const isSortableKey = (key: string): key is EmployeeSortKey => {
        const sortableKeys: EmployeeSortKey[] = [
            "user.name", "user.email", "status", "employmentType",
            "salary", "dateOfJoining", "dateOfLeaving", "createdAt",
            "updatedAt", "paymentStatus",
        ];
        return sortableKeys.includes(key as EmployeeSortKey);
    };

    const toggleRow = (id: string) => {
        const next = new Set(expandedRows);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setExpandedRows(next);
    };

    return (
        <div
            className={cn(spaceMono.variable, jetbrainsMono.variable)}
            style={{
                background: TOKEN.surface,
                fontFamily: fontDisplay,
                overflow: "hidden",
                borderRadius: "16px",
            }}
        >
            <div className="overflow-x-auto">
                <Table>
                    {/* ── Header ─────────────────────────────────────────── */}
                    <TableHeader>
                        <TableRow
                            style={{
                                background: TOKEN.surface,
                                boxShadow: TOKEN.neu_inset,
                                borderBottom: "none",
                            }}
                        >
                            {headers.map((h) => (
                                <TableHead
                                    key={h.key}
                                    className={cn("px-3 py-2.5 text-left", h.width)}
                                    style={{ background: "transparent" }}
                                >
                                    {h.sortable && isSortableKey(h.key) ? (
                                        <button
                                            type="button"
                                            onClick={() => sortToggle(h.key as EmployeeSortKey)}
                                            aria-label={`Sort by ${h.label}`}
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "5px",
                                                fontFamily: fontDisplay,
                                                fontSize: "0.65rem",
                                                fontWeight: sortBy === h.key ? 700 : 400,
                                                letterSpacing: "0.08em",
                                                textTransform: "uppercase",
                                                color: sortBy === h.key ? TOKEN.primary : TOKEN.muted,
                                                background: "transparent",
                                                border: "none",
                                                padding: 0,
                                                cursor: "pointer",
                                                transition: "color 0.15s",
                                            }}
                                        >
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                                {h.icon}
                                                <span>{h.label}</span>
                                            </span>
                                            <motion.span
                                                animate={{ rotate: sortBy === h.key && sortOrder === "desc" ? 180 : 0 }}
                                                transition={{ duration: 0.18 }}
                                            >
                                                <ArrowUpDown
                                                    style={{
                                                        width: 10,
                                                        height: 10,
                                                        color: sortBy === h.key ? TOKEN.primary : TOKEN.muted,
                                                    }}
                                                />
                                            </motion.span>
                                        </button>
                                    ) : h.key === "select" ? (
                                        <Checkbox
                                            checked={
                                                payableIds.length > 0 &&
                                                payableIds.every((id) => selectedIds?.has(id))
                                            }
                                            onCheckedChange={() => onToggleSelectAll?.(payableIds)}
                                            aria-label="Select all payable"
                                        />
                                    ) : h.key !== "accordion" && h.key !== "avatar" ? (
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 4,
                                                fontFamily: fontDisplay,
                                                fontSize: "0.65rem",
                                                fontWeight: 400,
                                                letterSpacing: "0.08em",
                                                textTransform: "uppercase",
                                                color: TOKEN.muted,
                                            }}
                                        >
                                            {h.icon}
                                            <span>{h.label}</span>
                                        </span>
                                    ) : null}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    {/* ── Body ───────────────────────────────────────────── */}
                    <TableBody>
                        <AnimatePresence mode="wait">
                            {loading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <motion.tr
                                        key={`skeleton-${i}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        style={{
                                            borderBottom: `1px solid rgba(0,0,0,0.06)`,
                                        }}
                                    >
                                        {showSelection && (
                                            <TableCell className="w-10 px-3 py-3">
                                                <Skeleton
                                                    className="h-4 w-4 rounded"
                                                    style={{ background: "rgba(0,0,0,0.07)" }}
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell className="w-10 px-3 py-3">
                                            <Skeleton
                                                className="h-4 w-4 rounded"
                                                style={{ background: "rgba(0,0,0,0.07)" }}
                                            />
                                        </TableCell>
                                        <TableCell className="w-14 px-3 py-3">
                                            <Skeleton
                                                className="h-9 w-9 rounded-full"
                                                style={{ background: "rgba(0,0,0,0.07)" }}
                                            />
                                        </TableCell>
                                        {headers.slice(showSelection ? 3 : 2).map((h, j) => (
                                            <TableCell key={j} className={cn("px-3 py-3", h.width)}>
                                                <Skeleton
                                                    className="h-4 w-full rounded-md"
                                                    style={{ background: "rgba(0,0,0,0.07)" }}
                                                />
                                            </TableCell>
                                        ))}
                                    </motion.tr>
                                ))
                            ) : list && list.docs.length > 0 ? (
                                list.docs.map((row) => (
                                    <EmployeeAccordionRow
                                        key={row.id}
                                        row={row}
                                        onClick={onRowClick}
                                        isExpanded={expandedRows.has(row.id)}
                                        onToggle={() => toggleRow(row.id)}
                                        onRetryPayment={onRetryPayment}
                                        retryLoading={retryLoading === row.id}
                                        showSelection={showSelection}
                                        selected={!!selectedIds?.has(row.id)}
                                        onToggleSelect={onToggleSelect ? () => onToggleSelect(row.id) : undefined}
                                        onManualPay={onManualPay}
                                        manualPayLoading={manualPayLoading === row.id}
                                    />
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={headers.length}
                                        style={{ padding: "64px 24px", textAlign: "center" }}
                                    >
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                                            <p
                                                style={{
                                                    fontFamily: fontDisplay,
                                                    fontSize: "0.8rem",
                                                    fontWeight: 700,
                                                    color: TOKEN.muted,
                                                    letterSpacing: "0.04em",
                                                }}
                                            >
                                                No employees found
                                            </p>
                                            <p
                                                style={{
                                                    fontFamily: fontMono,
                                                    fontSize: "0.7rem",
                                                    color: TOKEN.muted,
                                                    opacity: 0.7,
                                                }}
                                            >
                                                Try adjusting your filters or search criteria
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

// ─── Accordion Row ─────────────────────────────────────────────────────────────

interface EmployeeAccordionRowProps {
    row: EmployeeListItemDTO;
    onClick: (id: string) => void;
    isExpanded: boolean;
    onToggle: () => void;
    onRetryPayment?: (employeeId: string) => void;
    retryLoading?: boolean;
    showSelection?: boolean;
    selected?: boolean;
    onToggleSelect?: () => void;
    onManualPay?: (employee: EmployeeListItemDTO) => void;
    manualPayLoading?: boolean;
}

function EmployeeAccordionRow({
    row,
    onClick,
    isExpanded,
    onToggle,
    onRetryPayment,
    retryLoading = false,
    showSelection = false,
    selected = false,
    onToggleSelect,
    onManualPay,
    manualPayLoading = false,
}: EmployeeAccordionRowProps) {
    const isPayable =
        row.paymentMode === "manual" && !row.isDeleted && row.currentMonthPayment?.status !== "paid";

    /* ── Status configs ── */
    const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
        active: { label: "Active", color: TOKEN.success, bg: "rgba(0,166,61,0.12)" },
        onLeave: { label: "On Leave", color: TOKEN.warning, bg: "rgba(254,153,0,0.12)" },
        suspended: { label: "Suspended", color: TOKEN.danger, bg: "rgba(255,33,87,0.10)" },
        terminated: { label: "Terminated", color: TOKEN.muted, bg: "rgba(0,0,0,0.07)" },
    };
    const employmentTypeConfig: Record<string, { label: string; color: string; bg: string }> = {
        full_time: { label: "Full Time", color: TOKEN.primary, bg: "rgba(0,102,102,0.1)" },
        part_time: { label: "Part Time", color: "#7C3AED", bg: "rgba(124,58,237,0.1)" },
        contract: { label: "Contract", color: TOKEN.warning, bg: "rgba(254,153,0,0.1)" },
        intern: { label: "Intern", color: TOKEN.success, bg: "rgba(0,166,61,0.1)" },
    };
    const paymentModeConfig: Record<string, { label: string; color: string; bg: string }> = {
        auto: { label: "Auto", color: TOKEN.success, bg: "rgba(0,166,61,0.1)" },
        manual: { label: "Manual", color: TOKEN.primary, bg: "rgba(0,102,102,0.1)" },
    };

    const statusData = statusConfig[row.status] ?? { label: row.status ?? "Unknown", color: TOKEN.muted, bg: "rgba(0,0,0,0.07)" };
    const empData = employmentTypeConfig[row.employmentType || "full_time"] ?? { label: row.employmentType || "Unknown", color: TOKEN.muted, bg: "rgba(0,0,0,0.07)" };
    const payModeData = paymentModeConfig[row.paymentMode || "manual"] ?? { label: row.paymentMode || "Unknown", color: TOKEN.muted, bg: "rgba(0,0,0,0.07)" };

    const handleRetry = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onRetryPayment && !retryLoading) onRetryPayment(row.id);
    };

    /* ── Shared row style ── */
    const rowStyle: React.CSSProperties = {
        background: isExpanded ? "rgba(0,102,102,0.04)" : TOKEN.surface,
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        cursor: "pointer",
        opacity: row.isDeleted ? 0.55 : 1,
        transition: "background 0.15s",
    };

    return (
        <>
            {/* ── Primary Row ─────────────────────────────────── */}
            <TableRow
                style={rowStyle}
                onClick={() => onClick(row.id)}
                onMouseEnter={(e) => {
                    if (!isExpanded)
                        (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.025)";
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = isExpanded
                        ? "rgba(0,102,102,0.04)"
                        : TOKEN.surface;
                }}
            >
                {/* Select checkbox */}
                {showSelection && (
                    <TableCell
                        className="w-10 px-2 py-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Checkbox
                            checked={selected}
                            disabled={!isPayable}
                            onCheckedChange={() => onToggleSelect?.()}
                            aria-label={`Select ${row.user.name}`}
                        />
                    </TableCell>
                )}

                {/* Accordion toggle */}
                <TableCell className="w-10 px-2 py-3">
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onToggle(); }}
                        aria-label={isExpanded ? "Collapse details" : "Expand details"}
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            border: "none",
                            background: TOKEN.surface,
                            boxShadow: isExpanded ? TOKEN.neu_inset : TOKEN.neu_subtle,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "box-shadow 0.15s",
                        }}
                    >
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                            <ChevronDown style={{ width: 14, height: 14, color: TOKEN.primary }} />
                        </motion.div>
                    </button>
                </TableCell>

                {/* Avatar */}
                <TableCell className="w-14 px-2 py-3">
                    {row.user.avatar ? (
                        <Image
                            src={row.user.avatar}
                            alt={`${row.user.name} avatar`}
                            width={34}
                            height={34}
                            style={{
                                borderRadius: "50%",
                                objectFit: "cover",
                                boxShadow: TOKEN.neu_subtle,
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                background: TOKEN.surface,
                                boxShadow: TOKEN.neu_subtle,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: fontDisplay,
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                    color: TOKEN.primary,
                                }}
                            >
                                {row.user.name?.charAt(0)?.toUpperCase()}
                            </span>
                        </div>
                    )}
                </TableCell>

                {/* Name */}
                <TableCell className="w-48 px-3 py-3">
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span
                            style={{
                                fontFamily: fontDisplay,
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                color: TOKEN.text,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {row.user.name}
                        </span>
                        {row.isDeleted && (
                            <NeuBadge label="Deleted" color={TOKEN.danger} bg="rgba(255,33,87,0.1)" />
                        )}
                    </div>
                </TableCell>

                {/* Email */}
                <TableCell className="w-56 px-3 py-3">
                    <span
                        style={{
                            fontFamily: fontMono,
                            fontSize: "0.7rem",
                            color: TOKEN.muted,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "block",
                        }}
                    >
                        {row.user.email}
                    </span>
                </TableCell>

                {/* Status */}
                <TableCell className="w-28 px-3 py-3">
                    <NeuBadge label={statusData.label} color={statusData.color} bg={statusData.bg} />
                </TableCell>

                {/* Date of Joining */}
                <TableCell className="w-28 px-3 py-3">
                    <span
                        style={{
                            fontFamily: fontMono,
                            fontSize: "0.7rem",
                            color: TOKEN.muted,
                            whiteSpace: "nowrap",
                        }}
                    >
                        {formatDate(row.dateOfJoining)}
                    </span>
                </TableCell>

                {/* Payment Status */}
                <TableCell
                    className="w-40 px-3 py-3"
                    onClick={(e) => e.stopPropagation()}
                >
                    {row.currentMonthPayment ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <PaymentStatusBadge
                                status={row.currentMonthPayment.status}
                                amount={row.currentMonthPayment.amount}
                                currency={row.currency}
                                isRetryable={row.currentMonthPayment.status === "failed"}
                                onRetry={handleRetry}
                                isLoading={retryLoading}
                            />
                            {isPayable && onManualPay && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!manualPayLoading) onManualPay(row);
                                    }}
                                    disabled={manualPayLoading}
                                    aria-label="Mark as paid"
                                    style={{
                                        width: 26,
                                        height: 26,
                                        borderRadius: 8,
                                        border: "none",
                                        background: TOKEN.surface,
                                        boxShadow: TOKEN.neu_subtle,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: manualPayLoading ? "not-allowed" : "pointer",
                                        opacity: manualPayLoading ? 0.5 : 1,
                                    }}
                                >
                                    <Banknote style={{ width: 13, height: 13, color: TOKEN.primary }} />
                                </button>
                            )}
                        </div>
                    ) : (
                        <span
                            style={{
                                fontFamily: fontMono,
                                fontSize: "0.68rem",
                                color: TOKEN.muted,
                                opacity: 0.6,
                            }}
                        >
                            No payment
                        </span>
                    )}
                </TableCell>
            </TableRow>

            {/* ── Accordion Expanded Row ───────────────────────── */}
            <AnimatePresence>
                {isExpanded && (
                    <TableRow
                        style={{
                            background: "rgba(0,102,102,0.03)",
                            borderBottom: "1px solid rgba(0,0,0,0.06)",
                        }}
                    >
                        <TableCell colSpan={showSelection ? 8 : 7} style={{ padding: 0 }}>
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                style={{ overflow: "hidden" }}
                            >
                                <div
                                    style={{
                                        padding: "14px 16px",
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                                        gap: "12px",
                                    }}
                                >
                                    {/* Employment Type */}
                                    <DetailCell label="Employment Type">
                                        <NeuBadge label={empData.label} color={empData.color} bg={empData.bg} />
                                    </DetailCell>

                                    {/* Salary */}
                                    <DetailCell label="Salary">
                                        <span style={{ fontFamily: fontMono, fontSize: "0.72rem", fontWeight: 600, color: TOKEN.text }}>
                                            {typeof row.salary === "number" ? (
                                                <>
                                                    <span style={{ fontSize: "0.62rem", color: TOKEN.muted }}>{row.currency} </span>
                                                    {row.salary.toLocaleString()}
                                                </>
                                            ) : (
                                                <span style={{ color: TOKEN.muted }}>Not set</span>
                                            )}
                                        </span>
                                    </DetailCell>

                                    {/* Payment Mode */}
                                    <DetailCell label="Payment Mode">
                                        <NeuBadge label={payModeData.label} color={payModeData.color} bg={payModeData.bg} />
                                    </DetailCell>

                                    {/* Date of Leaving */}
                                    <DetailCell label="Date Left">
                                        <span style={{ fontFamily: fontMono, fontSize: "0.7rem", color: TOKEN.muted }}>
                                            {row.dateOfLeaving
                                                ? formatDate(row.dateOfLeaving)
                                                : <span style={{ color: TOKEN.success, fontWeight: 600 }}>Active</span>}
                                        </span>
                                    </DetailCell>

                                    {/* Shift */}
                                    <DetailCell label="Shift">
                                        <span style={{ fontFamily: fontMono, fontSize: "0.7rem", color: TOKEN.muted }}>
                                            {row.shiftSummary || "Not assigned"}
                                        </span>
                                    </DetailCell>

                                    {/* Phone */}
                                    <DetailCell label="Phone">
                                        <span style={{ fontFamily: fontMono, fontSize: "0.7rem", color: TOKEN.muted }}>
                                            {row.contactPhone || row.user.phone || "—"}
                                        </span>
                                    </DetailCell>

                                    {/* Last Login */}
                                    {row.lastLogin && (
                                        <DetailCell label="Last Login">
                                            <span style={{ fontFamily: fontMono, fontSize: "0.7rem", color: TOKEN.muted }}>
                                                {formatDateTime(row.lastLogin)}
                                            </span>
                                        </DetailCell>
                                    )}

                                    {/* Created */}
                                    <DetailCell label="Created">
                                        <span style={{ fontFamily: fontMono, fontSize: "0.7rem", color: TOKEN.muted }}>
                                            {formatDate(row.createdAt)}
                                        </span>
                                    </DetailCell>

                                    {/* Updated */}
                                    <DetailCell label="Updated">
                                        <span style={{ fontFamily: fontMono, fontSize: "0.7rem", color: TOKEN.muted }}>
                                            {formatDate(row.updatedAt)}
                                        </span>
                                    </DetailCell>
                                </div>

                                {/* Payment failure details */}
                                {row.currentMonthPayment && row.currentMonthPayment.status !== "paid" && (
                                    <div
                                        style={{
                                            margin: "0 16px 14px",
                                            padding: "12px",
                                            borderRadius: "10px",
                                            background: TOKEN.surface,
                                            boxShadow: TOKEN.neu_inset,
                                        }}
                                    >
                                        <p
                                            style={{
                                                fontFamily: fontDisplay,
                                                fontSize: "0.6rem",
                                                fontWeight: 700,
                                                letterSpacing: "0.08em",
                                                textTransform: "uppercase",
                                                color: TOKEN.muted,
                                                marginBottom: 8,
                                            }}
                                        >
                                            Payment Details
                                        </p>
                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                                                gap: 10,
                                            }}
                                        >
                                            {row.currentMonthPayment.dueDate && (
                                                <DetailCell label="Due Date">
                                                    <span style={{ fontFamily: fontMono, fontSize: "0.7rem", color: TOKEN.muted }}>
                                                        {formatDate(row.currentMonthPayment.dueDate)}
                                                    </span>
                                                </DetailCell>
                                            )}
                                            {row.currentMonthPayment.attemptedAt && (
                                                <DetailCell label="Last Attempt">
                                                    <span style={{ fontFamily: fontMono, fontSize: "0.7rem", color: TOKEN.muted }}>
                                                        {formatDateTime(row.currentMonthPayment.attemptedAt)}
                                                    </span>
                                                </DetailCell>
                                            )}
                                            {row.currentMonthPayment.failureReason && (
                                                <DetailCell label="Failure Reason">
                                                    <span style={{ fontFamily: fontMono, fontSize: "0.7rem", color: TOKEN.danger, fontWeight: 600 }}>
                                                        {row.currentMonthPayment.failureReason}
                                                    </span>
                                                </DetailCell>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </TableCell>
                    </TableRow>
                )}
            </AnimatePresence>
        </>
    );
}

// ─── Micro-components ─────────────────────────────────────────────────────────

function NeuBadge({ label, color, bg }: { label: string; color: string; bg: string }) {
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 10px",
                borderRadius: 20,
                background: bg,
                color,
                fontFamily: `var(--font-space-mono), monospace`,
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                boxShadow: "2px 2px 4px rgba(0,0,0,0.08), -1px -1px 3px rgba(255,255,255,0.6)",
                whiteSpace: "nowrap",
            }}
        >
            {label}
        </span>
    );
}

function DetailCell({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <p
                style={{
                    fontFamily: `var(--font-space-mono), monospace`,
                    fontSize: "0.58rem",
                    fontWeight: 700,
                    letterSpacing: "0.09em",
                    textTransform: "uppercase",
                    color: "#9CA3AF",
                    margin: 0,
                }}
            >
                {label}
            </p>
            {children}
        </div>
    );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(s?: string | null) {
    if (!s) return "-";
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(s?: string | null) {
    if (!s) return "-";
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default EmployeeTable;