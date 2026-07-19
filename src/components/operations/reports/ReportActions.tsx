"use client";

import { FC, FormEvent, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    MdCheckCircle,
    MdRestore,
    MdDeleteForever,
    MdMoreHoriz,
    MdCancel,
} from "react-icons/md";
import { useReportsStore } from "@/store/report.store";
import { PulseLoader } from "./PulseLoader";
import { REPORT_STATUS, ReportListItem } from "@/types/tour/reports.types";

/* ─── Shared neumorphism tokens ─────────────────────────────────────── */
const surface = "#E7E5E4";

const nmBase: React.CSSProperties = {
    background: surface,
    boxShadow:
        "4px 4px 8px rgba(0,0,0,0.14), -3px -3px 7px rgba(255,255,255,0.70)",
    border: "none",
    borderRadius: "10px",
};

const nmInset: React.CSSProperties = {
    background: surface,
    boxShadow:
        "inset 3px 3px 6px rgba(0,0,0,0.12), inset -2px -2px 5px rgba(255,255,255,0.65)",
    border: "none",
    borderRadius: "8px",
};

/* ─── Reusable nm-styled Input ───────────────────────────────────────── */
const NmInput: FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input
        {...props}
        style={nmInset}
        className={[
            "w-full px-3 py-2 text-sm text-[#1E2938]",
            "placeholder:text-[#1E2938]/40",
            "focus:outline-none focus:ring-2 focus:ring-[#006666]/40",
            "font-mono",
            props.className ?? "",
        ].join(" ")}
    />
);

/* ─── Ghost action button ────────────────────────────────────────────── */
const ActionBtn: FC<{
    disabled?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
}> = ({ disabled, onClick, children }) => (
    <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        style={{
            ...nmBase,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.45 : 1,
            fontFamily: "var(--font-space-mono, 'Space Mono', monospace)",
        }}
        className={[
            "flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-[#1E2938]",
            "tracking-wide uppercase transition-all duration-150",
            "hover:",
            "active:",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50",
        ].join(" ")}
    >
        {children}
    </button>
);

/* ─── Confirm / submit button ────────────────────────────────────────── */
const SubmitBtn: FC<{
    accent: string;
    disabled?: boolean;
    children: React.ReactNode;
    type?: "button" | "submit";
    onClick?: () => void;
}> = ({ accent, disabled, children, type = "submit", onClick }) => (
    <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        style={{
            background: accent,
            boxShadow: `3px 3px 6px rgba(0,0,0,0.18), -2px -2px 5px rgba(255,255,255,0.50)`,
            borderRadius: "8px",
            fontFamily: "var(--font-space-mono, 'Space Mono', monospace)",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
        }}
        className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
    >
        {children}
    </button>
);

/* ─── Cancel button ──────────────────────────────────────────────────── */
const CancelBtn: FC<{ onClick?: () => void; children?: React.ReactNode }> = ({
    onClick,
    children = "Cancel",
}) => (
    <button
        type="button"
        onClick={onClick}
        style={{ ...nmBase, fontFamily: "var(--font-space-mono, 'Space Mono', monospace)" }}
        className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#1E2938]/70 transition-all duration-150 hover:text-[#1E2938] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40"
    >
        {children}
    </button>
);

/* ─── Dialog shell ───────────────────────────────────────────────────── */
const NmDialogContent: FC<{ children: React.ReactNode }> = ({ children }) => (
    <div
        style={{
            background: surface,
            boxShadow:
                "10px 10px 24px rgba(0,0,0,0.15), -6px -6px 16px rgba(255,255,255,0.70)",
            borderRadius: "14px",
            fontFamily: "var(--font-jetbrains-mono, 'JetBrains Mono', monospace)",
        }}
        className="p-6 space-y-4"
    >
        {children}
    </div>
);

/* ─── Main component ─────────────────────────────────────────────────── */
export const ReportActions: FC<{ item: ReportListItem }> = ({ item }) => {
    const { resolveReport, reopenReport, softDeleteReport, rejectReport } =
        useReportsStore();

    const [resolveOpen, setResolveOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [reopenConfirmOpen, setReopenConfirmOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [resolutionNotes, setResolutionNotes] = useState("");
    const [rejectNotes, setRejectNotes] = useState("");

    const wrap =
        <T,>(fn: () => Promise<T>, close: () => void) => async () => {
            setActionLoading(true);
            try {
                await fn();
                close();
            } finally {
                setActionLoading(false);
            }
        };

    const onResolve = async (e: FormEvent) => {
        e.preventDefault();
        await wrap(
            () => resolveReport(item._id, resolutionNotes).then(() => setResolutionNotes("")),
            () => setResolveOpen(false)
        )();
    };

    const onReject = async (e: FormEvent) => {
        e.preventDefault();
        await wrap(
            () => rejectReport(item._id, rejectNotes).then(() => setRejectNotes("")),
            () => setRejectOpen(false)
        )();
    };

    const onReopen = wrap(() => reopenReport(item._id), () => setReopenConfirmOpen(false));
    const onDelete = wrap(() => softDeleteReport(item._id), () => setDeleteConfirmOpen(false));

    const isOpenOrInReview = [REPORT_STATUS.OPEN, REPORT_STATUS.IN_REVIEW].includes(item.status as REPORT_STATUS);
    const isResolvedOrRejected = [REPORT_STATUS.RESOLVED, REPORT_STATUS.REJECTED].includes(item.status as REPORT_STATUS);

    return (
        <Popover>
            {/* Trigger */}
            <PopoverTrigger asChild>
                <button
                    aria-label="Report actions"
                    style={nmBase}
                    className="flex items-center justify-center w-8 h-8 text-[#1E2938]/70 hover:text-[#006666] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50"
                >
                    <MdMoreHoriz size={18} />
                </button>
            </PopoverTrigger>

            {/* Popover panel */}
            <PopoverContent
                style={{
                    background: surface,
                    boxShadow:
                        "8px 8px 20px rgba(0,0,0,0.14), -4px -4px 12px rgba(255,255,255,0.68)",
                    border: "none",
                    borderRadius: "12px",
                    padding: "8px",
                    width: "176px",
                }}
            >
                <div className="flex flex-col gap-1">

                    {/* ── Resolve ── */}
                    <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
                        <DialogTrigger asChild>
                            <ActionBtn disabled={!isOpenOrInReview}>
                                <MdCheckCircle size={16} style={{ color: "#00A63D" }} />
                                Resolve
                            </ActionBtn>
                        </DialogTrigger>
                        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-sm">
                            <NmDialogContent>
                                <DialogHeader>
                                    <DialogTitle
                                        style={{ fontFamily: "var(--font-space-mono, 'Space Mono', monospace)" }}
                                        className="text-sm font-bold uppercase tracking-widest text-[#1E2938]"
                                    >
                                        Resolve Report
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-[#1E2938]/55">
                                        Mark as resolved. Add optional internal notes.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={onResolve} className="space-y-4">
                                    <NmInput
                                        value={resolutionNotes}
                                        onChange={(e) => setResolutionNotes(e.target.value)}
                                        placeholder="Resolution notes..."
                                        aria-label="Resolution notes"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <CancelBtn onClick={() => setResolveOpen(false)} />
                                        <SubmitBtn accent="#00A63D" disabled={actionLoading}>
                                            {actionLoading ? <PulseLoader size={6} /> : "Resolve"}
                                        </SubmitBtn>
                                    </div>
                                </form>
                            </NmDialogContent>
                        </DialogContent>
                    </Dialog>

                    {/* ── Reject ── */}
                    <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                        <DialogTrigger asChild>
                            <ActionBtn disabled={!isOpenOrInReview}>
                                <MdCancel size={16} style={{ color: "#FF2157" }} />
                                Reject
                            </ActionBtn>
                        </DialogTrigger>
                        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-sm">
                            <NmDialogContent>
                                <DialogHeader>
                                    <DialogTitle
                                        style={{ fontFamily: "var(--font-space-mono, 'Space Mono', monospace)" }}
                                        className="text-sm font-bold uppercase tracking-widest text-[#1E2938]"
                                    >
                                        Reject Report
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-[#1E2938]/55">
                                        Mark as rejected. Add the reason below.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={onReject} className="space-y-4">
                                    <NmInput
                                        value={rejectNotes}
                                        onChange={(e) => setRejectNotes(e.target.value)}
                                        placeholder="Rejection reason..."
                                        aria-label="Rejection notes"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <CancelBtn onClick={() => setRejectOpen(false)} />
                                        <SubmitBtn accent="#FF2157" disabled={actionLoading}>
                                            {actionLoading ? <PulseLoader size={6} /> : "Reject"}
                                        </SubmitBtn>
                                    </div>
                                </form>
                            </NmDialogContent>
                        </DialogContent>
                    </Dialog>

                    {/* ── Reopen ── */}
                    <AlertDialog open={reopenConfirmOpen} onOpenChange={setReopenConfirmOpen}>
                        <AlertDialogTrigger asChild>
                            <ActionBtn disabled={!isResolvedOrRejected}>
                                <MdRestore size={16} style={{ color: "#FE9900" }} />
                                Reopen
                            </ActionBtn>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="p-0 border-none bg-transparent shadow-none max-w-sm">
                            <NmDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle
                                        style={{ fontFamily: "var(--font-space-mono, 'Space Mono', monospace)" }}
                                        className="text-sm font-bold uppercase tracking-widest text-[#1E2938]"
                                    >
                                        Reopen Report?
                                    </AlertDialogTitle>
                                    <p className="text-xs text-[#1E2938]/55">
                                        Status will revert to pending review.
                                    </p>
                                </AlertDialogHeader>
                                <div className="flex justify-end gap-2 pt-2">
                                    <AlertDialogCancel asChild>
                                        <CancelBtn />
                                    </AlertDialogCancel>
                                    <AlertDialogAction asChild>
                                        <SubmitBtn
                                            accent="#FE9900"
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={onReopen}
                                        >
                                            {actionLoading ? <PulseLoader size={6} /> : "Reopen"}
                                        </SubmitBtn>
                                    </AlertDialogAction>
                                </div>
                            </NmDialogContent>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* ── Delete ── */}
                    <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                        <AlertDialogTrigger asChild>
                            <ActionBtn>
                                <MdDeleteForever size={16} style={{ color: "#FF2157" }} />
                                Delete
                            </ActionBtn>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="p-0 border-none bg-transparent shadow-none max-w-sm">
                            <NmDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle
                                        style={{ fontFamily: "var(--font-space-mono, 'Space Mono', monospace)" }}
                                        className="text-sm font-bold uppercase tracking-widest text-[#1E2938]"
                                    >
                                        Delete Report?
                                    </AlertDialogTitle>
                                    <p className="text-xs text-[#1E2938]/55">
                                        This report will be soft-deleted and archived. This cannot be undone.
                                    </p>
                                </AlertDialogHeader>
                                <div className="flex justify-end gap-2 pt-2">
                                    <AlertDialogCancel asChild>
                                        <CancelBtn />
                                    </AlertDialogCancel>
                                    <AlertDialogAction asChild>
                                        <SubmitBtn
                                            accent="#FF2157"
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={onDelete}
                                        >
                                            {actionLoading ? <PulseLoader size={6} /> : "Delete"}
                                        </SubmitBtn>
                                    </AlertDialogAction>
                                </div>
                            </NmDialogContent>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </PopoverContent>
        </Popover>
    );
};