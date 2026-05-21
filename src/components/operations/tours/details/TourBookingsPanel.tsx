"use client";

import { useEffect, useCallback, useState } from "react";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    CalendarDays,
    Banknote,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    AlertCircle,
    Ticket,
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import {
    useTourDetailStore,
    tourBookingListLoadingKey,
    tourBookingListErrorKey,
} from "@/store/tour-detail.store";
import { BookingListItemDTO } from "@/types/tour/tour-detail-booking.types";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";

// ─── Neumorphism Design Tokens ─────────────────────────────────────────────────
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM =
    "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_SURFACE_RAISED =
    "bg-[#E7E5E4] shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]";
const NEU_SURFACE_INSET_SM =
    "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

const NEU_BTN_GHOST =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
    "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none";

const NEU_BTN_ICON =
    "rounded-xl w-9 h-9 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
    "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
    "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_BTN_ICON_ACTIVE =
    "rounded-xl w-9 h-9 flex items-center justify-center bg-[#006666] text-white " +
    "shadow-[inset_2px_2px_5px_#004d4d,inset_-2px_-2px_5px_#008080]";

const NEU_INPUT =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";

const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";

const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL = "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_ICON_WELL_PRIMARY = "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_DIVIDER = "border-[#1E2938]/10";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface TourBookingsPanelProps {
    tourId: string;
}

type SortField = "bookingTime" | "totalParticipants" | "totalPaid";
type SortOrder = "asc" | "desc";

// ─── Layout Grid ───────────────────────────────────────────────────────────────
/** avatar | traveler | pax (sm+) | amount (md+) | booked */
const BOOKINGS_TABLE_GRID =
    "grid grid-cols-[36px_minmax(0,1fr)_7rem] sm:grid-cols-[36px_minmax(0,1fr)_4.5rem_7rem] md:grid-cols-[36px_minmax(0,1fr)_4.5rem_6rem_7.5rem] gap-x-3 items-center";

const TABLE_ROW_CLASS = cn(BOOKINGS_TABLE_GRID, "px-5");

const AVATAR_GRADIENTS = [
    "from-violet-400 to-indigo-500",
    "from-emerald-400 to-teal-500",
    "from-amber-400 to-orange-500",
    "from-pink-400 to-rose-500",
    "from-sky-400 to-blue-500",
    "from-fuchsia-400 to-purple-500",
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function SkeletonRow({ index }: { index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.04 }}
            className={cn(TABLE_ROW_CLASS, "py-4 border-b last:border-0", NEU_DIVIDER)}
        >
            <div className={cn("w-9 h-9 rounded-xl", NEU_SKELETON)} />
            <div className="min-w-0 space-y-2">
                <div className={cn("h-3.5 rounded-full w-32", NEU_SKELETON)} />
                <div className={cn("h-2.5 rounded-full w-48 opacity-60", NEU_SKELETON)} />
            </div>
            <div className={cn("hidden sm:block h-6 w-full max-w-[4.5rem] justify-self-center rounded-full", NEU_SKELETON)} />
            <div className={cn("hidden md:block h-3.5 w-full max-w-[6rem] justify-self-end rounded-full", NEU_SKELETON)} />
            <div className={cn("h-3 w-full max-w-[7.5rem] justify-self-end rounded-full opacity-60", NEU_SKELETON)} />
        </motion.div>
    );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
        >
            <div className={cn("w-16 h-16 flex items-center justify-center", NEU_SURFACE_RAISED, "rounded-2xl")}>
                <Ticket size={26} className="text-[#1E2938]/30" />
            </div>
            <div className="text-center space-y-1">
                <p className={cn("text-sm", NEU_HEADING)}>
                    {hasSearch ? "No matching bookings" : "No bookings yet"}
                </p>
                <p className={NEU_MUTED}>
                    {hasSearch
                        ? "Try a different traveler name or email"
                        : "Bookings for this tour will appear here"}
                </p>
            </div>
        </motion.div>
    );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 gap-4"
        >
            <div className={cn("w-14 h-14 flex items-center justify-center rounded-2xl bg-[#FF2157]/10", NEU_SURFACE_RAISED)}>
                <AlertCircle size={24} className="text-[#FF2157]/70" />
            </div>
            <div className="text-center space-y-1">
                <p className={cn("text-sm", NEU_HEADING)}>Failed to load bookings</p>
                <p className={cn(NEU_MUTED, "max-w-xs")}>{message}</p>
            </div>
            <button
                type="button"
                onClick={onRetry}
                className={cn(NEU_BTN_GHOST, "flex items-center gap-2 px-4 py-2 text-sm mt-1")}
            >
                <RefreshCw size={12} />
                Try again
            </button>
        </motion.div>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    accentClass,
    index = 0,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    accentClass: string;
    index?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl flex-1 min-w-[120px]",
                NEU_CARD_SM
            )}
        >
            <div className={cn(NEU_ICON_WELL_PRIMARY, accentClass, "shrink-0")}>
                <Icon size={14} />
            </div>
            <div className="min-w-0">
                <p className={cn(NEU_LABEL, "mb-0.5 leading-none")}>
                    {label}
                </p>
                <p className={cn(NEU_HEADING, "text-sm leading-none")}>{value}</p>
            </div>
        </motion.div>
    );
}

function SortBtn({
    label,
    active,
    order,
    onClick,
    align = "start",
}: {
    label: string;
    active: boolean;
    order: SortOrder;
    onClick: () => void;
    align?: "start" | "center" | "end";
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "inline-flex items-center gap-1 w-full transition-colors select-none",
                NEU_LABEL,
                align === "center" && "justify-center",
                align === "end" && "justify-end",
                active
                    ? "text-[#006666]"
                    : "text-[#1E2938]/40 hover:text-[#1E2938]/60"
            )}
        >
            {label}
            {active ? (
                order === "asc" ? <ArrowUp size={10} /> : <ArrowDown size={10} />
            ) : (
                <ArrowUpDown size={9} className="opacity-40" />
            )}
        </button>
    );
}

function BookingsTableHeader({
    sortField,
    sortOrder,
    onSort,
}: {
    sortField: SortField | null;
    sortOrder: SortOrder;
    onSort: (field: SortField) => void;
}) {
    return (
        <div className={cn(TABLE_ROW_CLASS, "py-3", NEU_SURFACE_INSET_SM)}>
            <div aria-hidden className="w-9" />
            <span className={NEU_LABEL}>Traveler</span>
            <div className="hidden sm:block">
                <SortBtn
                    label="Pax"
                    active={sortField === "totalParticipants"}
                    order={sortOrder}
                    align="center"
                    onClick={() => onSort("totalParticipants")}
                />
            </div>
            <div className="hidden md:block">
                <SortBtn
                    label="Amount"
                    active={sortField === "totalPaid"}
                    order={sortOrder}
                    align="end"
                    onClick={() => onSort("totalPaid")}
                />
            </div>
            <div>
                <SortBtn
                    label="Booked"
                    active={sortField === "bookingTime"}
                    order={sortOrder}
                    align="end"
                    onClick={() => onSort("bookingTime")}
                />
            </div>
        </div>
    );
}

function BookingRow({ booking, index }: { booking: BookingListItemDTO; index: number }) {
    const initials = booking.user.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0] ?? "")
        .join("")
        .toUpperCase();

    const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];

    return (
        <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22, delay: index * 0.028, ease: "easeOut" }}
            className={cn(
                TABLE_ROW_CLASS,
                "group py-3.5 border-b last:border-0 cursor-default",
                "hover:bg-white/40 transition-colors duration-150",
                NEU_DIVIDER
            )}
        >
            {/* Avatar */}
            <Avatar className="w-9 h-9 rounded-xl shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
                {booking.user.avatarUrl && (
                    <AvatarImage src={booking.user.avatarUrl} alt={booking.user.name} />
                )}
                <AvatarFallback
                    className={cn(
                        "rounded-xl text-white text-[11px] font-bold bg-gradient-to-br",
                        gradient
                    )}
                >
                    {initials}
                </AvatarFallback>
            </Avatar>

            {/* Name & email */}
            <div className="min-w-0">
                <p className={cn("text-sm truncate leading-tight", NEU_HEADING, "font-semibold")}>
                    {booking.user.name}
                </p>
                <p className={cn("text-[11px] truncate leading-tight mt-0.5", NEU_MUTED)}>
                    {booking.user.email}
                </p>
            </div>

            {/* Participants (sm+) */}
            <TooltipProvider delayDuration={180}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className={cn(
                            "hidden sm:flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full justify-self-center w-fit mx-auto",
                            NEU_SURFACE_INSET_SM,
                            "text-[#1E2938]/60"
                        )}>
                            <Users size={11} />
                            <span className={cn("text-xs font-semibold tabular-nums", NEU_MONO)}>
                                {booking.totalParticipants}
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                        {booking.totalParticipants} participant
                        {booking.totalParticipants !== 1 ? "s" : ""}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {/* Amount (md+) */}
            <div className="hidden md:block justify-self-end text-right">
                <span className={cn("text-sm font-bold tabular-nums", NEU_MONO)}>
                    ৳{booking.totalPaid.toLocaleString()}
                </span>
            </div>

            {/* Booking time */}
            <TooltipProvider delayDuration={180}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center justify-end gap-1.5 justify-self-end w-full min-w-0">
                            <CalendarDays size={11} className="shrink-0 text-[#1E2938]/40" />
                            <span className={cn("text-[11px] whitespace-nowrap tabular-nums", NEU_MUTED)}>
                                {formatDistanceToNow(new Date(booking.bookingTime), {
                                    addSuffix: true,
                                })}
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                        {format(new Date(booking.bookingTime), "MMM dd, yyyy 'at' h:mm a")}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </motion.div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function TourBookingsPanel({ tourId }: TourBookingsPanelProps) {
    const { fetchBookings, listCache, activeCacheKey, loading, error, params: storeParams } =
        useTourDetailStore();

    const isLoading = loading[tourBookingListLoadingKey(tourId)] ?? false;
    const errorMsg = error[tourBookingListErrorKey(tourId)];

    const cacheKey = activeCacheKey.tourBookings?.[tourId];
    const cached = cacheKey
        ? listCache.tourBookings?.[tourId]?.[cacheKey]
        : undefined;

    const bookings: BookingListItemDTO[] = cached?.items ?? [];
    const total = cached?.total ?? 0;
    const totalPages = cached?.pages ?? 1;
    const currentPage = cached?.page ?? 1;

    const tourBookingParams = storeParams.tourBookings?.[tourId];

    const [localSearch, setLocalSearch] = useState(tourBookingParams?.search ?? "");
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [limit, setLimit] = useState(tourBookingParams?.limit ?? 10);

    const appliedSearch = tourBookingParams?.search?.trim() ?? "";

    useEffect(() => {
        fetchBookings(tourId, { page: 1, limit, search: appliedSearch });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tourId, fetchBookings, limit]);

    const doFetch = useCallback(
        (
            page: number,
            field?: SortField | null,
            order?: SortOrder,
            force = false,
            search?: string
        ) => {
            fetchBookings(
                tourId,
                {
                    page,
                    limit,
                    search: search ?? appliedSearch,
                    ...(field ? { sort: field, order: order ?? "desc" } : {}),
                },
                force
            );
        },
        [tourId, fetchBookings, limit, appliedSearch]
    );

    const debouncedSearch = useDebouncedCallback(
        useCallback(
            (searchValue: string) => {
                doFetch(1, sortField, sortOrder, true, searchValue);
            },
            [doFetch, sortField, sortOrder]
        ),
        400
    );

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setLocalSearch(value);

            if (value === "") {
                doFetch(1, sortField, sortOrder, true, "");
            } else {
                debouncedSearch(value);
            }
        },
        [doFetch, sortField, sortOrder, debouncedSearch]
    );

    const handleSort = (field: SortField) => {
        const newOrder =
            sortField === field && sortOrder === "desc" ? "asc" : "desc";
        setSortField(field);
        setSortOrder(newOrder);
        doFetch(1, field, newOrder, true);
    };

    const handleRetry = () => doFetch(currentPage, sortField, sortOrder, true);

    const pageRevenue = bookings.reduce((s, b) => s + b.totalPaid, 0);
    const pagePax = bookings.reduce((s, b) => s + b.totalParticipants, 0);

    const pageWindow = (() => {
        const count = Math.min(totalPages, 5);
        let start = Math.max(1, currentPage - 2);
        if (start + count - 1 > totalPages) start = totalPages - count + 1;
        return Array.from({ length: count }, (_, i) => start + i);
    })();

    const stats = [
        {
            icon: Ticket,
            label: "Total Bookings",
            value: total.toLocaleString(),
            accentClass: "text-[#006666]",
        },
        {
            icon: Users,
            label: "Participants",
            value: pagePax.toLocaleString(),
            accentClass: "text-[#00A63D]",
        },
        {
            icon: Banknote,
            label: "Page Revenue",
            value: `৳${pageRevenue.toLocaleString()}`,
            accentClass: "text-[#FE9900]",
        },
    ];

    return (
        <div className="space-y-5">
            {/* ── Panel Header ── */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className={cn(NEU_ICON_WELL_PRIMARY, "shrink-0")}>
                        <Ticket size={16} className="text-[#006666]" />
                    </div>
                    <div>
                        <h2 className={cn(NEU_HEADING, "text-base")}>Tour Bookings</h2>
                        <p className={cn(NEU_MUTED, "text-xs mt-0.5")}>
                            {total > 0
                                ? `${total.toLocaleString()} total booking${total !== 1 ? "s" : ""}`
                                : "Manage and review traveler bookings for this tour"}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleRetry}
                    disabled={isLoading}
                    className={cn(NEU_BTN_GHOST, "flex items-center gap-1.5 px-3 py-2 text-xs shrink-0")}
                >
                    <RefreshCw size={12} className={cn(isLoading && "animate-spin")} />
                    Refresh
                </button>
            </div>

            {/* ── Stat Cards ── */}
            <AnimatePresence>
                {!isLoading && bookings.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex flex-wrap gap-3"
                    >
                        {stats.map((s, i) => (
                            <StatCard key={i} {...s} index={i} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Table Card ── */}
            <div className={cn(NEU_CARD, "overflow-hidden")}>

                {/* Table toolbar */}
                <div className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b",
                    NEU_DIVIDER, NEU_SURFACE_INSET_SM
                )}>
                    {/* Search */}
                    <div className="relative max-w-xs w-full">
                        <Search
                            size={13}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1E2938]/40 pointer-events-none"
                        />
                        <input
                            value={localSearch}
                            onChange={handleSearchChange}
                            placeholder="Search traveler name or email…"
                            className={cn(NEU_INPUT, "w-full pl-8 pr-3 py-2 text-xs")}
                        />
                    </div>

                    {/* Row count selector */}
                    <div className="flex items-center gap-2 shrink-0">
                        <span className={cn(NEU_LABEL, "hidden sm:block normal-case tracking-normal text-xs")}>
                            Show
                        </span>
                        <select
                            value={String(limit)}
                            onChange={(e) => {
                                const n = Number(e.target.value);
                                setLimit(n);
                                fetchBookings(
                                    tourId,
                                    { page: 1, limit: n, search: appliedSearch },
                                    true
                                );
                            }}
                            className={cn(NEU_INPUT, "px-3 py-2 text-xs pr-8 appearance-none cursor-pointer")}
                        >
                            {[5, 10, 20, 50].map((n) => (
                                <option key={n} value={String(n)}>
                                    {n} rows
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table header */}
                {!isLoading && !errorMsg && bookings.length > 0 && (
                    <BookingsTableHeader
                        sortField={sortField}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                    />
                )}

                {/* Table body */}
                {isLoading ? (
                    <div>
                        {[...Array(Math.min(limit, 6))].map((_, i) => (
                            <SkeletonRow key={i} index={i} />
                        ))}
                    </div>
                ) : errorMsg ? (
                    <ErrorState message={errorMsg} onRetry={handleRetry} />
                ) : bookings.length === 0 ? (
                    <EmptyState hasSearch={!!appliedSearch} />
                ) : (
                    <AnimatePresence>
                        {bookings.map((b, i) => (
                            <BookingRow key={b._id} booking={b} index={i} />
                        ))}
                    </AnimatePresence>
                )}

                {/* Pagination footer */}
                {!isLoading && !errorMsg && bookings.length > 0 && (
                    <div className={cn(
                        "flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t",
                        NEU_DIVIDER, NEU_SURFACE_INSET_SM
                    )}>
                        <p className={cn(NEU_MUTED, "text-xs")}>
                            Page{" "}
                            <span className={cn("font-semibold text-[#1E2938]", NEU_MONO)}>{currentPage}</span>{" "}
                            of{" "}
                            <span className={cn("font-semibold text-[#1E2938]", NEU_MONO)}>{totalPages}</span>
                            {total > 0 && (
                                <>
                                    {" "}·{" "}
                                    <span className={cn("font-semibold text-[#1E2938]", NEU_MONO)}>{total}</span>
                                    {" "}total
                                </>
                            )}
                        </p>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                className={cn(NEU_BTN_ICON, "w-7 h-7")}
                                disabled={currentPage <= 1}
                                onClick={() => doFetch(currentPage - 1, sortField, sortOrder)}
                                aria-label="Previous page"
                            >
                                <ChevronLeft size={13} />
                            </button>

                            {pageWindow.map((pg) => (
                                <button
                                    key={pg}
                                    type="button"
                                    className={cn(
                                        pg === currentPage ? NEU_BTN_ICON_ACTIVE : NEU_BTN_ICON,
                                        "w-7 h-7 text-xs font-semibold font-[family-name:var(--font-space-mono)]"
                                    )}
                                    onClick={() => doFetch(pg, sortField, sortOrder)}
                                    aria-current={pg === currentPage ? "page" : undefined}
                                >
                                    {pg}
                                </button>
                            ))}

                            <button
                                type="button"
                                className={cn(NEU_BTN_ICON, "w-7 h-7")}
                                disabled={currentPage >= totalPages}
                                onClick={() => doFetch(currentPage + 1, sortField, sortOrder)}
                                aria-label="Next page"
                            >
                                <ChevronRight size={13} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}