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
} from "@/types/reviews.types";
import { TRAVEL_TYPE } from "@/constants/tour.const";

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

    const setField = <K extends keyof ReviewToolbarState>(
        key: K,
        value: ReviewToolbarState[K]
    ): void => {
        onSearchChange({ [key]: value } as Partial<ReviewToolbarState>);
    };

    const setFilter = <K extends keyof ReviewToolbarState["filters"]>(
        key: K,
        value: ReviewToolbarState["filters"][K]
    ): void => {
        onSearchChange({
            filters: { ...toolbar.filters, [key]: value },
        });
    };

    const onEnterApply = (e: React.KeyboardEvent): void => {
        if (e.key === "Enter") onApplyFilters();
    };

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (toolbar.search) count++;
        if (toolbar.selectedRatings.length > 0) count++;
        if (toolbar.filters.dateFrom) count++;
        if (toolbar.filters.dateTo) count++;
        if (toolbar.filters.tourId) count++;
        if (toolbar.filters.tripType) count++;
        if (toolbar.filters.includeDeleted) count++;
        return count;
    }, [toolbar]);

    return (
        <div
            className="relative"
            data-testid="toolbar"
            role="region"
            aria-label="Reviews filters"
            onKeyDown={onEnterApply}
        >
            {/* Main Toolbar */}
            <div className="p-4 space-y-4">
                {/* Top Row: Search & Primary Actions */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    {/* Search Section */}
                    <div className="flex-1 min-w-0">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                                <FaSearch className="w-4 h-4 text-slate-400" aria-hidden />
                            </div>
                            <input
                                data-testid="toolbar-search"
                                type="text"
                                value={toolbar.search}
                                onChange={(e) => setField("search", e.target.value)}
                                placeholder="Search reviews, users, tours..."
                                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                aria-label="Search"
                            />
                            {toolbar.search && (
                                <button
                                    onClick={() => setField("search", "")}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                                    aria-label="Clear search"
                                >
                                    <FaTimes className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Search Field Selector */}
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-slate-500 font-medium">Search in:</span>
                            <div className="flex gap-1.5">
                                {["comment", "title", "userName", "tourTitle", "userEmail"].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setField("searchField", f as ReviewSearchField)}
                                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${toolbar.searchField === f
                                            ? "bg-blue-100 text-blue-700 ring-1 ring-blue-200"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                    >
                                        {f === "userName" ? "User" : f === "tourTitle" ? "Tour" : f === "userEmail" ? "Email" : f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            data-testid="toolbar-apply"
                            type="button"
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm transition-all"
                            onClick={() => {
                                // ensure the toolbar filters reflect the visible search inputs
                                onSearchChange({
                                    filters: {
                                        ...toolbar.filters,
                                        query: toolbar.search || undefined,
                                        queryField: toolbar.searchField || undefined,
                                    },
                                    page: 1, // reset to first page when applying new query
                                });
                                // then trigger list fetch / apply action the parent expects
                                onApplyFilters();
                            }}
                        >
                            <FaCheck className="w-3.5 h-3.5" aria-hidden />
                            Apply Filters
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            data-testid="toolbar-reset"
                            type="button"
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300/50 transition-all"
                            onClick={onResetFilters}
                        >
                            <FaRedo className="w-3.5 h-3.5" aria-hidden />
                            Reset
                        </motion.button>
                    </div>
                </div>

                {/* Second Row: Sort, Filters & Bulk Actions */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Sort Controls */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                            {toolbar.sort.dir === "desc" ? (
                                <FaSortAmountDown className="w-3.5 h-3.5 text-slate-500" aria-hidden />
                            ) : (
                                <FaSortAmountUp className="w-3.5 h-3.5 text-slate-500" aria-hidden />
                            )}
                            <select
                                aria-label="Sort field"
                                value={toolbar.sort.field}
                                onChange={(e) =>
                                    onSearchChange({
                                        sort: {
                                            ...toolbar.sort,
                                            field: e.target.value as ReviewSortField,
                                        },
                                    })
                                }
                                className="text-sm font-medium text-slate-700 bg-transparent border-0 focus:outline-none focus:ring-0 pr-8"
                            >
                                <option value="createdAt">Created Date</option>
                                <option value="rating">Rating</option>
                                <option value="helpfulCount">Helpful Count</option>
                                <option value="updatedAt">Updated Date</option>
                                <option value="isApproved">Approval Status</option>
                            </select>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                                onSearchChange({
                                    sort: {
                                        ...toolbar.sort,
                                        dir: toolbar.sort.dir === "asc" ? "desc" : "asc",
                                    },
                                })
                            }
                            className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                            aria-label="Toggle sort direction"
                        >
                            {toolbar.sort.dir === "desc" ? (
                                <FaSortAmountDown className="w-4 h-4 text-slate-600" />
                            ) : (
                                <FaSortAmountUp className="w-4 h-4 text-slate-600" />
                            )}
                        </motion.button>
                    </div>

                    {/* Quick Filter Toggles */}
                    <div className="flex items-center gap-2">

                        <motion.label
                            whileHover={{ scale: 1.02 }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${toolbar.filters.includeDeleted
                                ? "bg-red-50 border-red-200 text-red-700"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={toolbar.filters.includeDeleted ?? false}
                                onChange={(e) => setFilter("includeDeleted", e.target.checked)}
                                className="w-4 h-4 text-red-600 bg-white border-slate-300 rounded focus:ring-2 focus:ring-red-500/20"
                                aria-label="Include deleted"
                            />
                            <span className="text-sm font-medium">Include Deleted</span>
                        </motion.label>
                    </div>

                    {/* Advanced Filters Toggle */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${openAdvanced
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                        aria-expanded={openAdvanced}
                        aria-controls="advanced-filters"
                        onClick={() => setOpenAdvanced((v) => !v)}
                    >
                        <FaFilter className="w-3.5 h-3.5" aria-hidden />
                        Advanced
                        {activeFiltersCount > 0 && (
                            <span className="px-1.5 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full">
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

            {/* Advanced Filters Panel */}
            <AnimatePresence>
                {openAdvanced && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-slate-200"
                    >
                        <div id="advanced-filters" className="p-4 bg-slate-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Date From */}
                                <div className="space-y-2">
                                    <label htmlFor="dateFrom" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                        <FaCalendar className="w-3.5 h-3.5 text-slate-400" />
                                        Date From
                                    </label>
                                    <input
                                        id="dateFrom"
                                        type="date"
                                        value={toolbar.filters.dateFrom ?? ""}
                                        onChange={(e) => setFilter("dateFrom", e.target.value || null)}
                                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        aria-describedby="dateFromHelp"
                                    />
                                    <span id="dateFromHelp" className="block text-xs text-slate-500">
                                        {toolbar.filters.dateFrom ? formatFullDate(toolbar.filters.dateFrom) : "No date selected"}
                                    </span>
                                </div>

                                {/* Date To */}
                                <div className="space-y-2">
                                    <label htmlFor="dateTo" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                        <FaCalendar className="w-3.5 h-3.5 text-slate-400" />
                                        Date To
                                    </label>
                                    <input
                                        id="dateTo"
                                        type="date"
                                        value={toolbar.filters.dateTo ?? ""}
                                        onChange={(e) => setFilter("dateTo", e.target.value || null)}
                                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        aria-describedby="dateToHelp"
                                    />
                                    <span id="dateToHelp" className="block text-xs text-slate-500">
                                        {toolbar.filters.dateTo ? formatFullDate(toolbar.filters.dateTo) : "No date selected"}
                                    </span>
                                </div>

                                {/* Trip Type */}
                                <div className="space-y-2">
                                    <label htmlFor="tripType" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                        <FaMapMarkerAlt className="w-3.5 h-3.5 text-slate-400" />
                                        Trip Type
                                    </label>
                                    <select
                                        id="tripType"
                                        value={toolbar.filters.tripType ?? ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFilter("tripType", value === "" ? null : (value as TRAVEL_TYPE));
                                        }}
                                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    >
                                        <option value="">All Types</option>
                                        {Object.values(TRAVEL_TYPE).map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tour ID */}
                                <div className="space-y-2">
                                    <label htmlFor="tourId" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                        <FaMapMarkerAlt className="w-3.5 h-3.5 text-slate-400" />
                                        Tour ID
                                    </label>
                                    <input
                                        id="tourId"
                                        type="text"
                                        value={toolbar.filters.tourId ?? ""}
                                        onChange={(e) => setFilter("tourId", e.target.value || undefined)}
                                        placeholder="Enter tour ID"
                                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                    />
                                </div>

                                {/* Page Size */}
                                <div className="space-y-2">
                                    <label htmlFor="limit" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                        Results Per Page
                                    </label>
                                    <select
                                        id="limit"
                                        value={toolbar.limit}
                                        onChange={(e) => setField("limit", Number(e.target.value))}
                                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    >
                                        {limitOptions.map((n) => (
                                            <option key={n} value={n}>
                                                {n} reviews
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}