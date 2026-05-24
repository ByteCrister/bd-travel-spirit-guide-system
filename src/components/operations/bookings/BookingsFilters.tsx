"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookingsFilterState } from "@/types/tour/booking.types";
import {
  BOOKING_STATUS,
  BOOKING_PAYMENT_STATUS,
  BookingStatus,
  BookingPaymentStatus,
} from "@/constants/tour/tour-booking.const";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { spaceMono, jetbrainsMono } from "@/styles/fonts";

interface BookingsFiltersProps {
  filters: BookingsFilterState;
  onFilterChange: (filters: Partial<BookingsFilterState>) => void;
  onReset: () => void;
  isLoading?: boolean;
}

const DATE_PRESETS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 days" },
  { value: "last30days", label: "Last 30 days" },
  { value: "thismonth", label: "This month" },
  { value: "lastmonth", label: "Last month" },
  { value: "custom", label: "Custom range" },
];

// Shared neumorphic input class — outset surface that presses on focus
const neuInput = [
  "bg-[#E7E5E4] border-0 text-[#1E2938] placeholder:text-[#1E2938]/35",
  "shadow-[inset_3px_3px_6px_#c8c6c4,inset_-2px_-2px_5px_#ffffff]",
  "focus-visible:ring-0 focus-visible:ring-offset-0",
  "focus-visible:shadow-[inset_4px_4px_8px_#c0bebb,inset_-2px_-2px_4px_#ffffff,0_0_0_2px_#006666]",
  "rounded-xl h-10 transition-shadow duration-200",
].join(" ");

const neuSelect = [
  "bg-[#E7E5E4] border-0 text-[#1E2938]",
  "shadow-[inset_3px_3px_6px_#c8c6c4,inset_-2px_-2px_5px_#ffffff]",
  "focus:ring-0 focus:ring-offset-0",
  "rounded-xl h-10 transition-shadow duration-200",
].join(" ");

export function BookingsFilters({
  filters,
  onFilterChange,
  onReset,
//   isLoading,
}: BookingsFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search ?? "");

  useEffect(() => {
    setSearchValue(filters.search ?? "");
  }, [filters.search]);

  const debouncedSearchUpdate = useDebouncedCallback((value: string) => {
    onFilterChange({ search: value || undefined });
  }, 400);

  useEffect(() => {
    return () => {
      debouncedSearchUpdate.cancel?.();
    };
  }, [debouncedSearchUpdate]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    debouncedSearchUpdate(newValue);
  };

  const handleSearchSubmit = () => {
    debouncedSearchUpdate.cancel?.();
    onFilterChange({ search: searchValue || undefined });
  };

  const handleClearSearch = () => {
    debouncedSearchUpdate.cancel?.();
    setSearchValue("");
    onFilterChange({ search: undefined });
  };

  const activeFilterCount = [
    filters.status,
    filters.paymentStatus,
    filters.fromDate,
    filters.toDate,
    filters.search,
  ].filter(Boolean).length;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-3" style={spaceMono.style}>
      {/* ── Primary filter row ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search — inset pressed look */}
        <div className="relative flex-1 min-w-[260px]">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1E2938]/35 pointer-events-none"
          />
          <Input
            placeholder="Search bookings, traveler, tour…"
            value={searchValue}
            onChange={handleSearchChange}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
            className={cn(neuInput, "pl-9")}
            style={jetbrainsMono.style}
          />
          {searchValue && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1E2938]/40 hover:text-[#FF2157] transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Status */}
        <Select
          value={typeof filters.status === "string" ? filters.status : "all"}
          onValueChange={(val) =>
            onFilterChange({
              status: val === "all" ? undefined : (val as BookingStatus),
            })
          }
        >
          <SelectTrigger className={cn(neuSelect, "w-[160px]")}>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className="bg-[#E7E5E4] border-0 shadow-[6px_6px_16px_#c8c6c4,-4px_-4px_12px_#ffffff] rounded-xl text-[#1E2938]">
            <SelectItem value="all">All statuses</SelectItem>
            {Object.values(BOOKING_STATUS).map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s.replace("-", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Payment status */}
        <Select
          value={
            typeof filters.paymentStatus === "string"
              ? filters.paymentStatus
              : "all"
          }
          onValueChange={(val) =>
            onFilterChange({
              paymentStatus:
                val === "all" ? undefined : (val as BookingPaymentStatus),
            })
          }
        >
          <SelectTrigger className={cn(neuSelect, "w-[170px]")}>
            <SelectValue placeholder="Payment status" />
          </SelectTrigger>
          <SelectContent className="bg-[#E7E5E4] border-0 shadow-[6px_6px_16px_#c8c6c4,-4px_-4px_12px_#ffffff] rounded-xl text-[#1E2938]">
            <SelectItem value="all">All payments</SelectItem>
            {Object.values(BOOKING_PAYMENT_STATUS).map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={`${filters.sortBy ?? "bookedAt"}-${filters.sortOrder ?? "desc"}`}
          onValueChange={(val) => {
            const [sortBy, sortOrder] = val.split("-") as [
              BookingsFilterState["sortBy"],
              "asc" | "desc",
            ];
            onFilterChange({ sortBy, sortOrder });
          }}
        >
          <SelectTrigger className={cn(neuSelect, "w-[185px]")}>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-[#E7E5E4] border-0 shadow-[6px_6px_16px_#c8c6c4,-4px_-4px_12px_#ffffff] rounded-xl text-[#1E2938]">
            <SelectItem value="bookedAt-desc">Newest first</SelectItem>
            <SelectItem value="bookedAt-asc">Oldest first</SelectItem>
            <SelectItem value="totalPaid-desc">Highest paid</SelectItem>
            <SelectItem value="totalPaid-asc">Lowest paid</SelectItem>
            <SelectItem value="bookingReference-asc">Reference A–Z</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          {/* Advanced filters toggle — outset raised button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className={cn(
              "h-10 px-4 rounded-xl inline-flex items-center gap-2 text-xs font-medium transition-all duration-200",
              expanded
                ? "bg-[#E7E5E4] text-[#006666] shadow-[inset_3px_3px_6px_#c8c6c4,inset_-2px_-2px_5px_#ffffff]"
                : "bg-[#E7E5E4] text-[#1E2938]/60 shadow-[4px_4px_8px_#c8c6c4,-3px_-3px_6px_#ffffff] hover:shadow-[6px_6px_10px_#c8c6c4,-4px_-4px_8px_#ffffff]",
            )}
          >
            <SlidersHorizontal size={13} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span
                className="bg-[#006666] text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold"
                style={jetbrainsMono.style}
              >
                {activeFilterCount}
              </span>
            )}
            <ChevronDown
              size={12}
              className={cn(
                "transition-transform duration-200",
                expanded && "rotate-180",
              )}
            />
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={onReset}
              className={cn(
                "h-10 px-4 rounded-xl inline-flex items-center gap-1.5 text-xs font-medium transition-all duration-200",
                "text-[#FF2157] bg-[#E7E5E4]",
                "shadow-[4px_4px_8px_#c8c6c4,-3px_-3px_6px_#ffffff]",
                "hover:shadow-[inset_3px_3px_6px_#c8c6c4,inset_-2px_-2px_5px_#ffffff]",
              )}
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Advanced filter panel ──────────────────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "rounded-2xl p-4 flex flex-wrap gap-4",
                "bg-[#E7E5E4]",
                "shadow-[inset_4px_4px_10px_#c8c6c4,inset_-3px_-3px_8px_#ffffff]",
              )}
            >
              {/* Date preset */}
              <div className="flex flex-col gap-1.5 min-w-[180px]">
                <label className="text-[10px] uppercase tracking-widest text-[#1E2938]/40 font-medium">
                  Date range
                </label>
                <Select
                  value={filters.dateRangePreset ?? ""}
                  onValueChange={(val) =>
                    onFilterChange({ dateRangePreset: val })
                  }
                >
                  <SelectTrigger className={cn(neuSelect, "h-9 text-sm")}>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#E7E5E4] border-0 shadow-[6px_6px_16px_#c8c6c4,-4px_-4px_12px_#ffffff] rounded-xl text-[#1E2938]">
                    {DATE_PRESETS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* From date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#1E2938]/40 font-medium">
                  From
                </label>
                <Input
                  type="date"
                  value={filters.fromDate ?? ""}
                  onChange={(e) =>
                    onFilterChange({
                      fromDate: e.target.value || undefined,
                      dateRangePreset: "custom",
                    })
                  }
                  className={cn(neuInput, "h-9 text-sm w-[160px]")}
                  style={jetbrainsMono.style}
                  max={today}
                />
              </div>

              {/* To date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#1E2938]/40 font-medium">
                  To
                </label>
                <Input
                  type="date"
                  value={filters.toDate ?? ""}
                  onChange={(e) =>
                    onFilterChange({
                      toDate: e.target.value || undefined,
                      dateRangePreset: "custom",
                    })
                  }
                  className={cn(neuInput, "h-9 text-sm w-[160px]")}
                  style={jetbrainsMono.style}
                  max={today}
                />
              </div>

              {/* Per page */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#1E2938]/40 font-medium">
                  Per page
                </label>
                <Select
                  value={String(filters.limit ?? 20)}
                  onValueChange={(val) =>
                    onFilterChange({ limit: Number(val) })
                  }
                >
                  <SelectTrigger
                    className={cn(neuSelect, "h-9 text-sm w-[110px]")}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#E7E5E4] border-0 shadow-[6px_6px_16px_#c8c6c4,-4px_-4px_12px_#ffffff] rounded-xl text-[#1E2938]">
                    {[10, 20, 50, 100].map((n) => (
                      <SelectItem
                        key={n}
                        value={String(n)}
                        style={jetbrainsMono.style}
                      >
                        {n} rows
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
