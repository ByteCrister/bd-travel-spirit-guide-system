"use client";

import { JSX, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaSearch,
    FaFilter,
    FaRedo,
    FaCheck,
    FaChevronDown,
    FaChevronUp,
    FaCalendar,
    FaMapMarkerAlt,
    FaSortAmountDown,
    FaSortAmountUp,
    FaTimes,
} from "react-icons/fa";
import { formatFullDate } from "@/utils/helpers/reviews.uiHelpers";
import type {
    ReviewToolbarState,
    ReviewSearchField,
    ReviewSortField,
} from "@/types/tour/reviews.types";
import { TRAVEL_TYPE } from "@/constants/tour/tour.const";

// ── Design tokens ────────────────────────────────────────────────────────────
const S = "#E7E5E4";
const SHADOW_OUT = "6px 6px 14px #c9c7c6, -6px -6px 14px #ffffff";
const SHADOW_IN  = "inset 3px 3px 7px #c9c7c6, inset -3px -3px 7px #ffffff";
const PRIMARY    = "#006666";
const TEXT       = "#1E2938";
const MUTED      = "#607080";
const MONO       = "var(--font-jetbrains-mono), monospace";
const BRAND      = "var(--font-space-mono), monospace";

/** Small neumorphic pill button */
function PillBtn({
    active,
    onClick,
    children,
    title,
}: {
    active?: boolean;
    onClick: () => void;
    children: React.ReactNode;
    title?: string;
}) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all focus:outline-none focus-visible:ring-2"
            style={{
                background: S,
                boxShadow: active ? SHADOW_IN : SHADOW_OUT,
                color: active ? PRIMARY : TEXT,
                fontFamily: MONO,
                border: "none",
            }}
        >
            {children}
        </button>
    );
}

/** Neumorphic text input */
function NeuInput({
    id,
    type = "text",
    value,
    onChange,
    placeholder,
    "aria-label": ariaLabel,
    min,
    max,
    disabled,
}: {
    id?: string;
    type?: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    "aria-label"?: string;
    min?: string;
    max?: string;
    disabled?: boolean;
}) {
    return (
        <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-label={ariaLabel}
            min={min}
            max={max}
            disabled={disabled}
            className="w-full text-sm px-4 py-2.5 rounded-xl outline-none transition-all focus-visible:ring-2 placeholder:opacity-50"
            style={{
                background: S,
                boxShadow: SHADOW_IN,
                color: TEXT,
                fontFamily: MONO,
                border: "none",
                caretColor: PRIMARY,
            }}
        />
    );
}

/** Neumorphic select */
function NeuSelect({
    id,
    value,
    onChange,
    "aria-label": ariaLabel,
    children,
}: {
    id?: string;
    value: string | number;
    onChange: (v: string) => void;
    "aria-label"?: string;
    children: React.ReactNode;
}) {
    return (
        <select
            id={id}
            value={value}
            aria-label={ariaLabel}
            onChange={(e) => onChange(e.target.value)}
            className="text-sm px-3 py-2 rounded-xl outline-none transition-all focus-visible:ring-2 appearance-none cursor-pointer"
            style={{
                background: S,
                boxShadow: SHADOW_IN,
                color: TEXT,
                fontFamily: MONO,
                border: "none",
                paddingRight: "2rem",
            }}
        >
            {children}
        </select>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
    toolbar: ReviewToolbarState;
    onSearchChange: (next: Partial<ReviewToolbarState>) => void;
    onApplyFilters: () => void;
    onResetFilters: () => void;
}

export default function ReviewsToolbar({
    toolbar,
    onSearchChange,
    onApplyFilters,
    onResetFilters,
}: Props): JSX.Element {
    const [openAdvanced, setOpenAdvanced] = useState<boolean>(false);
    const limitOptions = useMemo(() => [10, 25, 50, 100], []);

    const setField = <K extends keyof ReviewToolbarState>(key: K, value: ReviewToolbarState[K]) =>
        onSearchChange({ [key]: value } as Partial<ReviewToolbarState>);

    const setFilter = <K extends keyof ReviewToolbarState["filters"]>(
        key: K,
        value: ReviewToolbarState["filters"][K]
    ) => onSearchChange({ filters: { ...toolbar.filters, [key]: value } });

    const onEnterApply = (e: React.KeyboardEvent): void => {
        if (e.key === "Enter") onApplyFilters();
    };

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (toolbar.search) count++;
        if (toolbar.selectedRatings.length > 0) count++;
        if (toolbar.filters.dateFrom) count++;
        if (toolbar.filters.dateTo) count++;
        if (toolbar.filters.tourTitle) count++;
        if (toolbar.filters.tripType) count++;
        if (toolbar.filters.includeDeleted) count++;
        return count;
    }, [toolbar]);

    const searchLabels: Record<string, string> = {
        comment: "Comment",
        title: "Title",
        userName: "User",
        tourTitle: "Tour",
        userEmail: "Email",
    };

    return (
        <div
            className="relative"
            data-testid="toolbar"
            role="region"
            aria-label="Reviews filters"
            onKeyDown={onEnterApply}
        >
            <div className="p-5 space-y-4">
                {/* ── Row 1: Search + Actions ── */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                    {/* Search */}
                    <div className="flex-1 min-w-0 space-y-2.5">
                        <div className="relative">
                            <span
                                className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none"
                                aria-hidden
                            >
                                <FaSearch
                                    className="w-3.5 h-3.5"
                                    style={{ color: MUTED }}
                                />
                            </span>
                            <input
                                data-testid="toolbar-search"
                                type="text"
                                value={toolbar.search}
                                onChange={(e) => setField("search", e.target.value)}
                                placeholder="Search reviews, users, tours…"
                                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl outline-none transition-all focus-visible:ring-2 placeholder:opacity-40"
                                style={{
                                    background: S,
                                    boxShadow: SHADOW_IN,
                                    color: TEXT,
                                    fontFamily: MONO,
                                    border: "none",
                                    caretColor: PRIMARY,
                                }}
                                aria-label="Search"
                            />
                            {toolbar.search && (
                                <button
                                    onClick={() => setField("search", "")}
                                    className="absolute inset-y-0 right-3 flex items-center transition-opacity hover:opacity-70"
                                    aria-label="Clear search"
                                    style={{ color: MUTED }}
                                >
                                    <FaTimes className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Search-field pills */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span
                                className="text-xs font-medium"
                                style={{ color: MUTED, fontFamily: MONO }}
                            >
                                Search in:
                            </span>
                            {Object.keys(searchLabels).map((f) => (
                                <PillBtn
                                    key={f}
                                    active={toolbar.searchField === f}
                                    onClick={() => setField("searchField", f as ReviewSearchField)}
                                >
                                    {searchLabels[f]}
                                </PillBtn>
                            ))}
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            data-testid="toolbar-apply"
                            type="button"
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all focus:outline-none focus-visible:ring-2"
                            style={{
                                background: PRIMARY,
                                boxShadow: "4px 4px 10px #004d4d, -2px -2px 6px #008080",
                                color: "#ffffff",
                                fontFamily: BRAND,
                                border: "none",
                            }}
                            onClick={() => {
                                onSearchChange({
                                    filters: {
                                        ...toolbar.filters,
                                        query: toolbar.search || undefined,
                                        queryField: toolbar.searchField || undefined,
                                    },
                                    page: 1,
                                });
                                onApplyFilters();
                            }}
                        >
                            <FaCheck className="w-3.5 h-3.5" aria-hidden />
                            Apply
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            data-testid="toolbar-reset"
                            type="button"
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all focus:outline-none focus-visible:ring-2"
                            style={{
                                background: S,
                                boxShadow: SHADOW_OUT,
                                color: TEXT,
                                fontFamily: BRAND,
                                border: "none",
                            }}
                            onClick={onResetFilters}
                        >
                            <FaRedo className="w-3.5 h-3.5" aria-hidden />
                            Reset
                        </motion.button>
                    </div>
                </div>

                {/* ── Row 2: Sort + Toggles + Advanced ── */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Sort field + direction */}
                    <div
                        className="flex items-center gap-1 rounded-xl px-3 py-1.5"
                        style={{ background: S, boxShadow: SHADOW_IN }}
                    >
                        {toolbar.sort.dir === "desc" ? (
                            <FaSortAmountDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: MUTED }} aria-hidden />
                        ) : (
                            <FaSortAmountUp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: MUTED }} aria-hidden />
                        )}
                        <select
                            aria-label="Sort field"
                            value={toolbar.sort.field}
                            onChange={(e) =>
                                onSearchChange({ sort: { ...toolbar.sort, field: e.target.value as ReviewSortField } })
                            }
                            className="text-xs font-medium bg-transparent border-0 outline-none cursor-pointer pr-6"
                            style={{ color: TEXT, fontFamily: MONO }}
                        >
                            <option value="createdAt">Created Date</option>
                            <option value="rating">Rating</option>
                            <option value="helpfulCount">Helpful Count</option>
                            <option value="updatedAt">Updated Date</option>
                            <option value="isApproved">Approval Status</option>
                        </select>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() =>
                            onSearchChange({ sort: { ...toolbar.sort, dir: toolbar.sort.dir === "asc" ? "desc" : "asc" } })
                        }
                        className="p-2 rounded-xl transition-all focus:outline-none focus-visible:ring-2"
                        style={{ background: S, boxShadow: SHADOW_OUT, border: "none" }}
                        aria-label="Toggle sort direction"
                    >
                        {toolbar.sort.dir === "desc" ? (
                            <FaSortAmountDown className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                        ) : (
                            <FaSortAmountUp className="w-3.5 h-3.5" style={{ color: PRIMARY }} />
                        )}
                    </motion.button>

                    {/* Include Deleted toggle */}
                    <label
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer transition-all select-none"
                        style={{
                            background: S,
                            boxShadow: toolbar.filters.includeDeleted ? SHADOW_IN : SHADOW_OUT,
                            color: toolbar.filters.includeDeleted ? "#b91c1c" : TEXT,
                            fontFamily: MONO,
                            fontSize: "0.75rem",
                            fontWeight: 500,
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={toolbar.filters.includeDeleted ?? false}
                            onChange={(e) => setFilter("includeDeleted", e.target.checked)}
                            className="sr-only"
                            aria-label="Include deleted"
                        />
                        <span
                            className="h-3.5 w-3.5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all"
                            style={{
                                borderColor: toolbar.filters.includeDeleted ? "#b91c1c" : MUTED,
                                background: toolbar.filters.includeDeleted ? "#fee2e2" : "transparent",
                            }}
                        >
                            {toolbar.filters.includeDeleted && (
                                <svg className="w-2 h-2" viewBox="0 0 8 8" fill="none">
                                    <path d="M1 4l2 2 4-4" stroke="#b91c1c" strokeWidth={1.5} strokeLinecap="round" />
                                </svg>
                            )}
                        </span>
                        Include Deleted
                    </label>

                    {/* Advanced toggle */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 ml-auto"
                        style={{
                            background: S,
                            boxShadow: openAdvanced ? SHADOW_IN : SHADOW_OUT,
                            color: openAdvanced ? PRIMARY : TEXT,
                            fontFamily: MONO,
                            border: "none",
                        }}
                        aria-expanded={openAdvanced}
                        aria-controls="advanced-filters"
                        onClick={() => setOpenAdvanced((v) => !v)}
                    >
                        <FaFilter className="w-3 h-3" aria-hidden />
                        Advanced
                        {activeFiltersCount > 0 && (
                            <span
                                className="px-1.5 py-0.5 text-xs font-bold rounded-full"
                                style={{ background: PRIMARY, color: "#fff" }}
                            >
                                {activeFiltersCount}
                            </span>
                        )}
                        {openAdvanced ? (
                            <FaChevronUp className="w-3 h-3 ml-1" />
                        ) : (
                            <FaChevronDown className="w-3 h-3 ml-1" />
                        )}
                    </motion.button>
                </div>
            </div>

            {/* ── Advanced Filters ── */}
            <AnimatePresence>
                {openAdvanced && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                        style={{ borderTop: "1px solid #d1cfce" }}
                    >
                        <div id="advanced-filters" className="p-5" style={{ background: "#e0dedd" }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Date From */}
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="dateFrom"
                                        className="flex items-center gap-2 text-xs font-medium"
                                        style={{ color: TEXT, fontFamily: MONO }}
                                    >
                                        <FaCalendar className="w-3 h-3" style={{ color: MUTED }} />
                                        Date From
                                    </label>
                                    <NeuInput
                                        id="dateFrom"
                                        type="date"
                                        value={toolbar.filters.dateFrom ?? ""}
                                        onChange={(v) => setFilter("dateFrom", v || null)}
                                        max={toolbar.filters.dateTo ?? undefined}
                                        aria-label="Date from"
                                    />
                                    <span
                                        className="block text-xs"
                                        style={{ color: MUTED, fontFamily: MONO }}
                                    >
                                        {toolbar.filters.dateFrom ? formatFullDate(toolbar.filters.dateFrom) : "No date selected"}
                                    </span>
                                </div>

                                {/* Date To */}
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="dateTo"
                                        className="flex items-center gap-2 text-xs font-medium"
                                        style={{ color: TEXT, fontFamily: MONO }}
                                    >
                                        <FaCalendar className="w-3 h-3" style={{ color: MUTED }} />
                                        Date To
                                    </label>
                                    <NeuInput
                                        id="dateTo"
                                        type="date"
                                        value={toolbar.filters.dateTo ?? ""}
                                        onChange={(v) => setFilter("dateTo", v || null)}
                                        min={toolbar.filters.dateFrom ?? undefined}
                                        aria-label="Date to"
                                    />
                                    <span className="block text-xs" style={{ color: MUTED, fontFamily: MONO }}>
                                        {toolbar.filters.dateTo ? formatFullDate(toolbar.filters.dateTo) : "No date selected"}
                                    </span>
                                </div>

                                {/* Trip Type */}
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="tripType"
                                        className="flex items-center gap-2 text-xs font-medium"
                                        style={{ color: TEXT, fontFamily: MONO }}
                                    >
                                        <FaMapMarkerAlt className="w-3 h-3" style={{ color: MUTED }} />
                                        Trip Type
                                    </label>
                                    <div className="relative">
                                        <NeuSelect
                                            id="tripType"
                                            value={toolbar.filters.tripType ?? ""}
                                            onChange={(v) =>
                                                setFilter("tripType", v === "" ? null : (v as TRAVEL_TYPE))
                                            }
                                            aria-label="Trip type"
                                        >
                                            <option value="">All Types</option>
                                            {Object.values(TRAVEL_TYPE).map((t) => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </NeuSelect>
                                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center" style={{ color: MUTED }}>
                                            <FaChevronDown className="w-3 h-3" />
                                        </span>
                                    </div>
                                </div>

                                {/* Tour Title */}
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="tourTitle"
                                        className="flex items-center gap-2 text-xs font-medium"
                                        style={{ color: TEXT, fontFamily: MONO }}
                                    >
                                        <FaMapMarkerAlt className="w-3 h-3" style={{ color: MUTED }} />
                                        Tour Title
                                    </label>
                                    <NeuInput
                                        id="tourTitle"
                                        value={toolbar.filters.tourTitle ?? ""}
                                        onChange={(v) => setFilter("tourTitle", v || undefined)}
                                        placeholder="Type tour title…"
                                        aria-label="Tour title filter"
                                    />
                                </div>

                                {/* Page Size */}
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="limit"
                                        className="text-xs font-medium"
                                        style={{ color: TEXT, fontFamily: MONO }}
                                    >
                                        Results Per Page
                                    </label>
                                    <div className="relative">
                                        <NeuSelect
                                            id="limit"
                                            value={toolbar.limit}
                                            onChange={(v) => setField("limit", Number(v))}
                                            aria-label="Results per page"
                                        >
                                            {limitOptions.map((n) => (
                                                <option key={n} value={n}>{n} reviews</option>
                                            ))}
                                        </NeuSelect>
                                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center" style={{ color: MUTED }}>
                                            <FaChevronDown className="w-3 h-3" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}