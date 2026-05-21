'use client';

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ChevronLeft, ChevronRight, AlertCircle, Flag, Calendar, FileText,
    MessageSquare, Clock, AlertTriangle, Paperclip, ChevronsLeft,
    ChevronsRight, TrendingUp, CheckCircle2, XCircle, Eye,
} from "lucide-react";
import { REPORT_PRIORITY, REPORT_REASON, REPORT_STATUS, ReportStatus } from "@/constants/tour/report.const";
import { format } from "date-fns";
import { useTourDetailStore } from "@/store/tour-detail.store";

// ─── Neumorphism Design Tokens ──────────────────────────────────────────────
const NEU_SURFACE        = "bg-[#E7E5E4]";
const NEU_CARD_SM        = "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_SURFACE_INSET  = "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_SURFACE_INSET_SM = "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_BTN_ICON       =
    "rounded-xl w-8 h-8 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
    "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
    "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_BTN_ICON_ACTIVE =
    "rounded-xl flex items-center justify-center bg-[#006666] text-white " +
    "shadow-[inset_2px_2px_5px_#004d4d,inset_-2px_-2px_5px_#008080]";
const NEU_INPUT          =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";
const NEU_BADGE          =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#E7E5E4] text-[#1E2938] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_PRIMARY  =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_SUCCESS  =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_WARNING  =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_DANGER   =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#FF2157]/10 text-[#FF2157] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_HEADING        = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL          = "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MONO           = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_MUTED          = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_ICON_WELL_PRIMARY = "p-2 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_DIVIDER        = "border-[#1E2938]/10";
const NEU_SKELETON       = "rounded-lg bg-[#d0cecd] animate-pulse";

// ─── Types ──────────────────────────────────────────────────────────────────
type Props = {
    tourId: string;
    tourTitle?: string;
};

function getInitials(name?: string) {
    if (!name) return "?";
    return name.split(" ").map((n) => n?.[0] ?? "").join("").toUpperCase().slice(0, 2);
}

// ─── Status/Priority helpers ────────────────────────────────────────────────
function getStatusBadgeClass(status: ReportStatus): string {
    switch (status) {
        case REPORT_STATUS.OPEN:      return NEU_BADGE_PRIMARY;
        case REPORT_STATUS.IN_REVIEW: return NEU_BADGE_WARNING;
        case REPORT_STATUS.RESOLVED:  return NEU_BADGE_SUCCESS;
        case REPORT_STATUS.REJECTED:  return NEU_BADGE_DANGER;
        default:                      return NEU_BADGE;
    }
}

function getStatusIcon(status: ReportStatus): React.ReactNode {
    switch (status) {
        case REPORT_STATUS.OPEN:      return <AlertCircle className="h-3.5 w-3.5" />;
        case REPORT_STATUS.IN_REVIEW: return <Eye className="h-3.5 w-3.5" />;
        case REPORT_STATUS.RESOLVED:  return <CheckCircle2 className="h-3.5 w-3.5" />;
        case REPORT_STATUS.REJECTED:  return <XCircle className="h-3.5 w-3.5" />;
        default:                      return null;
    }
}

function getPriorityBadgeClass(priority: REPORT_PRIORITY): string {
    switch (priority) {
        case REPORT_PRIORITY.HIGH:   return NEU_BADGE_DANGER;
        case REPORT_PRIORITY.URGENT: return NEU_BADGE_WARNING;
        default:                     return NEU_BADGE;
    }
}

function getPriorityAccentColor(priority: REPORT_PRIORITY): string {
    switch (priority) {
        case REPORT_PRIORITY.HIGH:   return "#FF2157";
        case REPORT_PRIORITY.URGENT: return "#FE9900";
        default:                     return "#1E2938";
    }
}

function formatReportReason(reason: REPORT_REASON | string) {
    if (!reason) return "";
    return String(reason).replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
}

// ─── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }: { label: string; value: React.ReactNode; accent: string }) {
    return (
        <div className={`${NEU_CARD_SM} p-3 flex flex-col gap-0.5`} style={{ borderTop: `3px solid ${accent}` }}>
            <span className={NEU_LABEL}>{label}</span>
            <span className={`${NEU_HEADING} text-xl`}>{value}</span>
        </div>
    );
}

// ─── Skeleton Row ────────────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <div className={`${NEU_CARD_SM} p-4 space-y-3`}>
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Skeleton className={`h-12 w-12 rounded-full ${NEU_SKELETON}`} />
                    <div className="space-y-2">
                        <Skeleton className={`h-4 w-32 ${NEU_SKELETON}`} />
                        <Skeleton className={`h-3 w-24 ${NEU_SKELETON}`} />
                    </div>
                </div>
                <Skeleton className={`h-6 w-20 rounded-lg ${NEU_SKELETON}`} />
            </div>
            <Skeleton className={`h-16 w-full rounded-xl ${NEU_SKELETON}`} />
            <div className="flex gap-2">
                <Skeleton className={`h-6 w-20 rounded-lg ${NEU_SKELETON}`} />
                <Skeleton className={`h-6 w-24 rounded-lg ${NEU_SKELETON}`} />
            </div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ReportsPanel({ tourId, tourTitle }: Props) {
    const { fetchReports, listCache, loading, error, params } = useTourDetailStore();

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const loadingKey   = `reportsList:${tourId}`;
    const errorKey     = `reportsListError:${tourId}`;
    const isLoading    = Boolean(loading?.[loadingKey]);
    const errorMessage = error?.[errorKey];

    const currentParams  = params?.tourReports?.[tourId];
    const activeCacheKey = `${currentPage}-${pageSize}-${currentParams?.sort || ""}-${currentParams?.order || ""}`;
    const cachedData     = listCache?.tourReports?.[tourId]?.[activeCacheKey];

    useEffect(() => {
        if (!tourId) return;
        const key = `${currentPage}-${pageSize}`;
        if (!listCache?.tourReports?.[tourId]?.[key]) {
            void fetchReports(tourId, { page: currentPage, limit: pageSize });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tourId, currentPage, pageSize]);

    useEffect(() => {
        if (cachedData && currentPage > cachedData.pages) {
            setCurrentPage(cachedData.pages || 1);
        }
    }, [cachedData, currentPage]);

    const handlePageChange = (newPage: number) => {
        if (cachedData?.pages) {
            setCurrentPage(Math.max(1, Math.min(newPage, cachedData.pages)));
            return;
        }
        setCurrentPage(Math.max(1, newPage));
    };

    const handlePageSizeChange = (newSize: string) => {
        setPageSize(Number(newSize) || 10);
        setCurrentPage(1);
    };

    const startItem = cachedData ? (cachedData.page - 1) * pageSize + 1 : 0;
    const endItem   = cachedData ? Math.min(cachedData.page * pageSize, cachedData.total) : 0;

    return (
        <div className={`${NEU_SURFACE} rounded-2xl overflow-hidden flex flex-col`}>

            {/* ── Header ── */}
            <div className={`${NEU_SURFACE_INSET} px-6 py-5 rounded-t-2xl`}>
                <div className="flex items-center gap-3">
                    <div className={NEU_ICON_WELL_PRIMARY}>
                        <Flag className="h-5 w-5 text-[#006666]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className={`${NEU_HEADING} text-base truncate`}>
                            Reports for {tourTitle || "Tour"}
                        </h3>
                        <p className={`${NEU_MUTED} mt-0.5`}>
                            View and manage all reports submitted for this tour
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col px-6 pb-4 space-y-4">

                {/* ── Error Banner ── */}
                {errorMessage && (
                    <div className={`${NEU_SURFACE_INSET_SM} rounded-xl flex items-center gap-2.5 px-4 py-3 mt-4`}>
                        <AlertCircle className="h-4 w-4 text-[#FF2157] shrink-0" />
                        <span className={`${NEU_MONO} text-sm text-[#FF2157]`}>{errorMessage}</span>
                    </div>
                )}

                {/* ── Stat Row ── */}
                {cachedData && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                        <StatCard label="Total"   value={cachedData.total ?? 0}          accent="#006666" />
                        <StatCard label="Showing" value={`${startItem}–${endItem}`}      accent="#00A63D" />
                        <StatCard label="Page"    value={cachedData.page ?? 1}            accent="#FE9900" />
                        <StatCard label="Pages"   value={cachedData.pages ?? 1}           accent="#FF2157" />
                    </div>
                )}

                {/* ── List ── */}
                <div className="flex-1 min-h-0">
                    <ScrollArea className="h-full">
                        <div className="space-y-3 pr-1 pb-2">
                            {isLoading ? (
                                Array.from({ length: pageSize }).map((_, idx) => (
                                    <SkeletonRow key={idx} />
                                ))
                            ) : cachedData && cachedData.items && cachedData.items.length > 0 ? (
                                cachedData.items.map((report) => (
                                    <div
                                        key={report.id}
                                        className={`${NEU_CARD_SM} overflow-hidden`}
                                        style={{ borderLeft: `4px solid ${getPriorityAccentColor(report.priority)}` }}
                                    >
                                        <div className="p-4 space-y-3">
                                            {/* Reporter row */}
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <Avatar className="h-11 w-11 shrink-0 shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] rounded-full">
                                                        {report?.reporterAvatarUrl ? (
                                                            <AvatarImage src={report.reporterAvatarUrl} />
                                                        ) : (
                                                            <AvatarFallback className="bg-[#006666]/10 text-[#006666] font-[family-name:var(--font-space-mono)] font-bold text-sm">
                                                                {getInitials(report.reporterName)}
                                                            </AvatarFallback>
                                                        )}
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`${NEU_HEADING} text-sm truncate`}>
                                                            {report.reporterName || "Anonymous User"}
                                                        </p>
                                                        <div className={`${NEU_MUTED} flex items-center gap-1.5 mt-0.5`}>
                                                            <Calendar className="h-3 w-3 shrink-0" />
                                                            <span className="truncate">
                                                                {report.createdAt
                                                                    ? format(new Date(report.createdAt), "MMM dd, yyyy 'at' HH:mm")
                                                                    : "—"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`${getStatusBadgeClass(report.status)} shrink-0`}>
                                                    {getStatusIcon(report.status)}
                                                    {report.status}
                                                </span>
                                            </div>

                                            {/* Divider */}
                                            <div className={`border-t ${NEU_DIVIDER}`} />

                                            {/* Reason */}
                                            <div className={`${NEU_SURFACE_INSET_SM} flex items-center gap-2 px-3 py-2 rounded-xl`}>
                                                <AlertTriangle className="h-4 w-4 text-[#FE9900] shrink-0" />
                                                <span className={`${NEU_HEADING} text-sm text-[#FE9900]`}>
                                                    {formatReportReason(report.reason)}
                                                </span>
                                            </div>

                                            {/* Message excerpt */}
                                            {report.messageExcerpt && (
                                                <div className={`${NEU_SURFACE_INSET_SM} rounded-xl px-3 py-2.5`}>
                                                    <div className="flex gap-2">
                                                        <MessageSquare className="h-4 w-4 text-[#006666] mt-0.5 shrink-0" />
                                                        <p className={`${NEU_MONO} text-sm leading-relaxed break-words`}>
                                                            {report.messageExcerpt}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Meta row */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={getPriorityBadgeClass(report.priority)}>
                                                    <Flag className="h-3 w-3" />
                                                    {report.priority}
                                                </span>

                                                {report.evidenceCount && report.evidenceCount > 0 && (
                                                    <span className={NEU_BADGE_PRIMARY}>
                                                        <Paperclip className="h-3 w-3" />
                                                        {report.evidenceCount} file{report.evidenceCount > 1 ? "s" : ""}
                                                    </span>
                                                )}

                                                {report.reopenedCount > 0 && (
                                                    <span className={NEU_BADGE}>
                                                        <TrendingUp className="h-3 w-3" />
                                                        Reopened {report.reopenedCount}x
                                                    </span>
                                                )}
                                            </div>

                                            {/* Flags */}
                                            {report.flags && report.flags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {report.flags.map((flag: string) => (
                                                        <span key={flag} className={NEU_BADGE}>{flag}</span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Last activity */}
                                            {report.lastActivityAt && (
                                                <div className={`${NEU_MUTED} flex items-center gap-1.5 pt-2 border-t ${NEU_DIVIDER}`}>
                                                    <Clock className="h-3 w-3 shrink-0" />
                                                    <span>Updated: {format(new Date(report.lastActivityAt), "MMM dd, HH:mm")}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={`${NEU_CARD_SM} py-14`}>
                                    <div className="flex flex-col items-center gap-3">
                                        <div className={NEU_ICON_WELL_PRIMARY}>
                                            <FileText className="h-6 w-6 text-[#006666]" />
                                        </div>
                                        <p className={`${NEU_HEADING} text-sm`}>No reports found</p>
                                        <p className={NEU_MUTED}>This tour has no reports</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* ── Footer Pagination ── */}
            {cachedData && cachedData.items && cachedData.items.length > 0 && (
                <div className={`${NEU_SURFACE_INSET} px-6 py-3 rounded-b-2xl`}>
                    <div className="flex items-center justify-between gap-3 flex-wrap">

                        {/* Left: page size + count */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className={`${NEU_LABEL} whitespace-nowrap`}>Show:</span>
                                <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                                    <SelectTrigger className={`${NEU_INPUT} w-[70px] h-8 px-2 py-0`}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["5", "10", "20", "50"].map((v) => (
                                            <SelectItem key={v} value={v}>{v}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className={`h-4 w-px bg-[#1E2938]/10`} />

                            <span className={`${NEU_MONO} text-sm`}>
                                <span className="text-[#006666] font-bold">{startItem}–{endItem}</span>
                                {" of "}
                                <span className="text-[#006666] font-bold">{cachedData.total}</span>
                            </span>
                        </div>

                        {/* Right: nav buttons */}
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => handlePageChange(1)}
                                disabled={cachedData.page === 1 || isLoading}
                                className={NEU_BTN_ICON}
                                aria-label="First page"
                            >
                                <ChevronsLeft className="h-3.5 w-3.5" />
                            </button>

                            <button
                                type="button"
                                onClick={() => handlePageChange((cachedData.page || 1) - 1)}
                                disabled={cachedData.page === 1 || isLoading}
                                className={NEU_BTN_ICON}
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>

                            <div className={`${NEU_BTN_ICON_ACTIVE} px-3 py-1 h-8 text-xs font-[family-name:var(--font-space-mono)] font-bold min-w-[64px] text-center`}>
                                {cachedData.page}/{cachedData.pages}
                            </div>

                            <button
                                type="button"
                                onClick={() => handlePageChange((cachedData.page || 1) + 1)}
                                disabled={cachedData.page === cachedData.pages || isLoading}
                                className={NEU_BTN_ICON}
                                aria-label="Next page"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>

                            <button
                                type="button"
                                onClick={() => handlePageChange(cachedData.pages)}
                                disabled={cachedData.page === cachedData.pages || isLoading}
                                className={NEU_BTN_ICON}
                                aria-label="Last page"
                            >
                                <ChevronsRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}