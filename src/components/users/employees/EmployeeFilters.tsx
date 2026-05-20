"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Field } from "./primitives/Field";
import { Skeleton } from "./primitives/Skeleton";

import { EmployeesQuery } from "@/types/employee/employee.types";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    EMPLOYEE_ROLE,
    EMPLOYEE_STATUS,
    EmployeeRole,
    EmployeeStatus,
    EMPLOYMENT_TYPE,
    EmploymentType,
    PAYROLL_STATUS,
    PayrollStatus,
} from "@/constants/employee/employee.const";

import { motion, AnimatePresence } from "framer-motion";

import {
    Search,
    Filter,
    X,
    ChevronDown,
    Trash2,
    Activity,
    FileText,
    Loader2,
    Sparkles,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock,
} from "lucide-react";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

type EnumsShape = {
    roles?: EmployeeRole[];
    statuses?: EmployeeStatus[];
    employmentTypes?: EmploymentType[];
    paymentStatuses?: PayrollStatus[];
};

const STATUS_LABELS: Record<EmployeeStatus, string> = {
    active: "Active",
    onLeave: "On Leave",
    suspended: "Suspended",
    terminated: "Terminated",
};

const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
    full_time: "Full Time",
    part_time: "Part Time",
    contract: "Contract",
    intern: "Intern",
};

const PAYMENT_STATUS_LABELS: Record<PayrollStatus, string> = {
    pending: "Pending",
    paid: "Paid",
    failed: "Failed",
};

const PAYMENT_STATUS_ICONS: Record<PayrollStatus, React.ReactNode> = {
    pending: <Clock className="h-3 w-3" />,
    paid: <CheckCircle className="h-3 w-3" />,
    failed: <XCircle className="h-3 w-3" />,
};

const PAYMENT_STATUS_VARIANTS: Record<PayrollStatus, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "secondary",
    paid: "default",
    failed: "destructive",
};

const STATUS_VARIANTS: Record<EmployeeStatus, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    onLeave: "secondary",
    suspended: "destructive",
    terminated: "outline",
};

// ── Shared neumorphism class strings ──────────────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4] shadow-[6px_6px_12px_#c9c7c5,-6px_-6px_12px_#ffffff]";
const NEU_INSET = "bg-[#E7E5E4] shadow-[inset_3px_3px_7px_#c9c7c5,inset_-3px_-3px_7px_#ffffff]";
const NEU_BTN = "bg-[#E7E5E4] shadow-[4px_4px_8px_#c9c7c5,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_10px_#c9c7c5,-6px_-6px_10px_#ffffff] active:shadow-[inset_2px_2px_5px_#c9c7c5,inset_-2px_-2px_5px_#ffffff] transition-all duration-150 border-0";
const MONO = "font-[family-name:var(--font-space-mono,'Space_Mono',monospace)]";
const JETBRAINS = "font-[family-name:var(--font-jetbrains-mono,'JetBrains_Mono',monospace)]";

export function EmployeeFilters({
    query,
    onChange,
    loading,
    fetchEnums,
}: {
    query: EmployeesQuery;
    onChange: (q: EmployeesQuery) => void;
    loading: boolean;
    fetchEnums: (force?: boolean) => Promise<unknown>;
}) {
    const [enums, setEnums] = useState<EnumsShape | null>(null);
    const [isExpanded, setIsExpanded] = useState(true);
    const [searchValue, setSearchValue] = useState(query.filters?.search ?? "");

    const debouncedUpdateSearch = useDebouncedCallback(
        (searchTerm: string) => {
            setFilters({ search: searchTerm || undefined });
        },
        1000
    );

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                await fetchEnums();
            } catch {
                console.warn("fetchEnums failed, using static enums");
            }

            if (!mounted) return;

            setEnums({
                roles: Object.values(EMPLOYEE_ROLE),
                statuses: Object.values(EMPLOYEE_STATUS),
                employmentTypes: Object.values(EMPLOYMENT_TYPE),
                paymentStatuses: Object.values(PAYROLL_STATUS),
            });
        };

        void load();

        return () => {
            mounted = false;
        };
    }, [fetchEnums]);

    const filters = useMemo(() => query.filters ?? {}, [query.filters]);

    const setFilters = useCallback(
        (patch: Partial<NonNullable<EmployeesQuery["filters"]>>) => {
            onChange({
                ...query,
                page: 1,
                filters: { ...(query.filters ?? {}), ...patch },
            });
        },
        [onChange, query]
    );

    const clearFilters = () => {
        debouncedUpdateSearch.cancel?.();
        setSearchValue("");
        onChange({ ...query, page: 1, filters: {} });
    };

    const activeFilterCount = useMemo(() => {
        return Object.values(filters).filter(
            (v) => v !== undefined && v !== "" && (Array.isArray(v) ? v.length > 0 : true)
        ).length;
    }, [filters]);

    const hasActiveFilters = activeFilterCount > 0;

    const filterChips = useMemo(() => {
        const chips: Array<{
            key: string;
            label: string;
            variant?: "default" | "secondary" | "destructive" | "outline";
            onRemove: () => void;
        }> = [];

        if (filters.statuses?.[0]) {
            const s = filters.statuses[0];
            chips.push({
                key: `status:${s}`,
                label: STATUS_LABELS[s] ?? s,
                variant: STATUS_VARIANTS[s],
                onRemove: () => setFilters({ statuses: undefined }),
            });
        }

        if (filters.employmentTypes?.[0]) {
            const t = filters.employmentTypes[0];
            chips.push({
                key: `type:${t}`,
                label: EMPLOYMENT_TYPE_LABELS[t] ?? t,
                onRemove: () => setFilters({ employmentTypes: undefined }),
            });
        }

        if (filters.paymentStatuses?.[0]) {
            const p = filters.paymentStatuses[0];
            chips.push({
                key: `payment:${p}`,
                label: PAYMENT_STATUS_LABELS[p] ?? p,
                variant: PAYMENT_STATUS_VARIANTS[p],
                onRemove: () => setFilters({ paymentStatuses: undefined }),
            });
        }

        if (filters.search) {
            chips.push({
                key: `search:${filters.search}`,
                label: `"${filters.search}"`,
                onRemove: () => {
                    debouncedUpdateSearch.cancel?.();
                    setSearchValue("");
                    setFilters({ search: undefined });
                },
            });
        }

        if (filters.includeDeleted) {
            chips.push({
                key: `deleted:true`,
                label: "Deleted Records",
                variant: "outline",
                onRemove: () => setFilters({ includeDeleted: undefined }),
            });
        }

        return chips;
    }, [debouncedUpdateSearch, filters.employmentTypes, filters.includeDeleted, filters.paymentStatuses, filters.search, filters.statuses, setFilters]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        debouncedUpdateSearch(value);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className={`rounded-2xl ${NEU_SURFACE}`}>
                {/* ── Header ──────────────────────────────────────────────── */}
                <div className="flex items-start justify-between gap-4 p-5">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Icon chip — inset */}
                        <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${NEU_INSET} text-[#006666]`}
                            aria-hidden="true"
                        >
                            <Filter className="h-4 w-4" />
                        </div>

                        <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className={`text-sm font-bold uppercase tracking-widest text-[#1E2938] ${MONO}`}>
                                    Filter Employees
                                </h2>
                                {hasActiveFilters && (
                                    <motion.span
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold ${MONO} ${NEU_INSET} text-[#006666]`}
                                    >
                                        <Sparkles className="h-2.5 w-2.5" />
                                        {activeFilterCount}
                                    </motion.span>
                                )}
                            </div>
                            <p className={`text-[11px] text-[#1E2938]/40 ${JETBRAINS}`}>
                                {hasActiveFilters
                                    ? `${activeFilterCount} active ${activeFilterCount === 1 ? "filter" : "filters"} applied`
                                    : "Refine and narrow down your employee search"}
                            </p>
                        </div>
                    </div>

                    {/* Collapse toggle */}
                    <button
                        type="button"
                        onClick={() => setIsExpanded((v) => !v)}
                        className={`h-9 w-9 shrink-0 flex items-center justify-center rounded-xl ${NEU_BTN} text-[#1E2938]/50 hover:text-[#006666] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/30`}
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
                    >
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        >
                            <ChevronDown className="h-4 w-4" />
                        </motion.div>
                    </button>
                </div>

                {/* ── Active filter chips ──────────────────────────────────── */}
                <AnimatePresence>
                    {hasActiveFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-wrap gap-2 px-5 pb-4">
                                {filterChips.map((chip, idx) => (
                                    <motion.div
                                        key={chip.key}
                                        initial={{ scale: 0.85, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.85, opacity: 0 }}
                                        transition={{ delay: idx * 0.04, duration: 0.2 }}
                                    >
                                        <span
                                            className={[
                                                "inline-flex items-center gap-1.5 rounded-lg pl-2.5 pr-1.5 py-1",
                                                NEU_INSET,
                                                `text-[11px] font-semibold ${MONO} text-[#006666]`,
                                            ].join(" ")}
                                        >
                                            {chip.key.startsWith("payment:") && (
                                                <span>{PAYMENT_STATUS_ICONS[chip.key.split(":")[1] as PayrollStatus]}</span>
                                            )}
                                            {chip.label}
                                            <button
                                                type="button"
                                                className={`ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-md ${NEU_BTN} text-[#1E2938]/40 hover:text-[#FF2157]`}
                                                aria-label={`Remove ${chip.label} filter`}
                                                onClick={chip.onRemove}
                                            >
                                                <X className="h-2.5 w-2.5" />
                                            </button>
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Divider */}
                <div className="mx-5 h-px bg-gradient-to-r from-transparent via-[#c9c7c5] to-transparent" />

                {/* ── Expandable body ──────────────────────────────────────── */}
                <AnimatePresence initial={false}>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-6 p-5">
                                {/* Search */}
                                <Field label="Quick Search" hint="Search by name, email, phone, or department">
                                    <div className="relative">
                                        <Search
                                            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1E2938]/30"
                                            aria-hidden="true"
                                        />
                                        {loading ? (
                                            <Skeleton className="h-10 w-full rounded-xl" />
                                        ) : (
                                            <Input
                                                placeholder="Start typing to search..."
                                                value={searchValue}
                                                onChange={handleSearchChange}
                                                className={[
                                                    "h-10 rounded-xl pl-10 pr-4",
                                                    NEU_INSET,
                                                    "border-0 text-sm text-[#1E2938]",
                                                    `${JETBRAINS}`,
                                                    "placeholder:text-[#1E2938]/30",
                                                    "focus-visible:ring-2 focus-visible:ring-[#006666]/20 focus-visible:ring-offset-0",
                                                ].join(" ")}
                                                aria-label="Search employees"
                                            />
                                        )}
                                    </div>
                                </Field>

                                <div className="h-px bg-gradient-to-r from-transparent via-[#c9c7c5]/60 to-transparent" />

                                {/* Filter grid */}
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <ShadcnFilterSelect
                                        label="Employment Status"
                                        icon={<Activity className="h-4 w-4" aria-hidden="true" />}
                                        value={filters.statuses?.[0] ?? ""}
                                        onValueChange={(value) =>
                                            setFilters({ statuses: value ? [value as EmployeeStatus] : undefined })
                                        }
                                        options={
                                            enums?.statuses?.map((s) => ({ value: s, label: STATUS_LABELS[s] })) ?? []
                                        }
                                        loading={!enums || loading}
                                        placeholder="Select status"
                                        disabled={loading}
                                    />

                                    <ShadcnFilterSelect
                                        label="Contract Type"
                                        icon={<FileText className="h-4 w-4" aria-hidden="true" />}
                                        value={filters.employmentTypes?.[0] ?? ""}
                                        onValueChange={(value) =>
                                            setFilters({
                                                employmentTypes: value ? [value as EmploymentType] : undefined,
                                            })
                                        }
                                        options={
                                            enums?.employmentTypes?.map((t) => ({
                                                value: t,
                                                label: EMPLOYMENT_TYPE_LABELS[t],
                                            })) ?? []
                                        }
                                        loading={!enums || loading}
                                        placeholder="Select type"
                                        disabled={loading}
                                    />

                                    <ShadcnFilterSelect
                                        label="Payment Status"
                                        icon={<CreditCard className="h-4 w-4" aria-hidden="true" />}
                                        value={filters.paymentStatuses?.[0] ?? ""}
                                        onValueChange={(value) =>
                                            setFilters({
                                                paymentStatuses: value ? [value as PayrollStatus] : undefined,
                                            })
                                        }
                                        options={
                                            enums?.paymentStatuses?.map((p) => ({
                                                value: p,
                                                label: PAYMENT_STATUS_LABELS[p],
                                            })) ?? []
                                        }
                                        loading={!enums || loading}
                                        placeholder="Select payment status"
                                        disabled={loading}
                                    />
                                </div>

                                {/* Deleted records toggle */}
                                <Field label="Advanced Options" hint="Additional filtering preferences">
                                    <div
                                        className={[
                                            "flex h-11 items-center justify-between rounded-xl px-4",
                                            NEU_INSET,
                                        ].join(" ")}
                                    >
                                        <Label
                                            htmlFor="include-deleted"
                                            className={`flex cursor-pointer items-center gap-2.5 text-[12px] font-semibold text-[#1E2938] ${MONO}`}
                                        >
                                            <div
                                                className={`flex h-7 w-7 items-center justify-center rounded-lg ${NEU_BTN} text-[#FF2157]`}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </div>
                                            Include Deleted Records
                                        </Label>
                                        <Switch
                                            id="include-deleted"
                                            checked={!!filters.includeDeleted}
                                            onCheckedChange={(checked) =>
                                                setFilters({ includeDeleted: checked || undefined })
                                            }
                                            disabled={loading}
                                            aria-checked={!!filters.includeDeleted}
                                            aria-label="Include deleted employees"
                                        />
                                    </div>
                                </Field>

                                <div className="h-px bg-gradient-to-r from-transparent via-[#c9c7c5]/60 to-transparent" />

                                {/* Footer */}
                                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        {hasActiveFilters ? (
                                            <motion.div
                                                className="flex items-center gap-2"
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                            >
                                                <span className="relative flex h-2 w-2">
                                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#006666] opacity-60" />
                                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#006666]" />
                                                </span>
                                                <p className={`text-[12px] font-semibold text-[#1E2938] ${MONO}`}>
                                                    {activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"} active
                                                </p>
                                            </motion.div>
                                        ) : (
                                            <p className={`text-[11px] text-[#1E2938]/30 ${MONO}`}>No active filters</p>
                                        )}
                                        {loading && (
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-semibold ${MONO} ${NEU_INSET} text-[#1E2938]/50`}
                                            >
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                Loading
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        disabled={!hasActiveFilters || loading}
                                        className={[
                                            "inline-flex items-center gap-2 rounded-xl px-4 py-2",
                                            NEU_BTN,
                                            `text-[12px] font-semibold ${MONO}`,
                                            "text-[#1E2938]/60 hover:text-[#FF2157]",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/30",
                                            "disabled:opacity-30 disabled:cursor-not-allowed",
                                        ].join(" ")}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

function ShadcnFilterSelect({
    label,
    icon,
    value,
    onValueChange,
    options,
    loading,
    placeholder,
    disabled,
}: {
    label: string;
    icon?: React.ReactNode;
    value: string;
    onValueChange: (value: string) => void;
    options: { value: string; label: string }[];
    loading?: boolean;
    placeholder?: string;
    disabled?: boolean;
}) {
    return (
        <Field label={label}>
            {loading ? (
                <Skeleton className="h-10 w-full rounded-xl" />
            ) : (
                <Select
                    value={value || "__all__"}
                    onValueChange={(v) => onValueChange(v === "__all__" ? "" : v)}
                    disabled={disabled}
                >
                    <SelectTrigger
                        className={[
                            "h-10 gap-2 rounded-xl px-3",
                            NEU_INSET,
                            "border-0 text-sm text-[#1E2938]",
                            `font-[family-name:var(--font-jetbrains-mono,'JetBrains_Mono',monospace)]`,
                            "focus:ring-2 focus:ring-[#006666]/20 focus:ring-offset-0",
                            "data-[placeholder]:text-[#1E2938]/30",
                        ].join(" ")}
                    >
                        {icon && <span className="text-[#1E2938]/30">{icon}</span>}
                        <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent
                        className={[
                            "rounded-xl border-0",
                            "bg-[#E7E5E4]",
                            "shadow-[8px_8px_20px_#c9c7c5,-8px_-8px_20px_#ffffff]",
                        ].join(" ")}
                    >
                        <SelectItem
                            value="__all__"
                            className={`rounded-lg text-[12px] font-medium ${JETBRAINS} text-[#1E2938]/40 focus:bg-[#006666]/10`}
                        >
                            All {label}
                        </SelectItem>
                        {options.map((opt) => (
                            <SelectItem
                                key={opt.value}
                                value={opt.value}
                                className={`rounded-lg text-[12px] font-medium ${JETBRAINS} text-[#1E2938] focus:bg-[#006666]/10`}
                            >
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </Field>
    );
}