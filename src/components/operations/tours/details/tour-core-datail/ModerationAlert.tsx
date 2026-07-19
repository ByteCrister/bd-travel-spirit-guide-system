"use client";

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

// ── Neumorphism Design Tokens ─────────────────────────────────
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_LABEL = "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_DIVIDER = "border-[#1E2938]/10";

const NEU_BTN_GHOST =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] text-sm px-4 py-2 " +
    " " +
    "hover: " +
    "active: " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_INPUT =
    "w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 resize-none " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm px-4 py-3 " +
    " border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";

// ── Variant configs ───────────────────────────────────────────
const VARIANT_CONFIG = {
    default: {
        titleColor: "text-[#006666]",
        btnClass:
            "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] text-sm px-4 py-2 " +
            " " +
            "hover: hover:bg-[#007777] " +
            "active: " +
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
            "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50",
    },
    destructive: {
        titleColor: "text-[#FF2157]",
        btnClass:
            "rounded-xl bg-[#FF2157] text-white font-[family-name:var(--font-space-mono)] text-sm px-4 py-2 " +
            " " +
            "hover: hover:bg-[#e01e4e] " +
            "active: " +
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
            "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2157]/50",
    },
    warning: {
        titleColor: "text-[#FE9900]",
        btnClass:
            "rounded-xl bg-[#FE9900] text-white font-[family-name:var(--font-space-mono)] text-sm px-4 py-2 " +
            " " +
            "hover: hover:bg-[#e68900] " +
            "active: " +
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
            "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FE9900]/50",
    },
    success: {
        titleColor: "text-[#00A63D]",
        btnClass:
            "rounded-xl bg-[#00A63D] text-white font-[family-name:var(--font-space-mono)] text-sm px-4 py-2 " +
            " " +
            "hover: hover:bg-[#009636] " +
            "active: " +
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
            "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A63D]/50",
    },
} as const;

interface ModerationAlertProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive" | "warning" | "success";
    onConfirm: () => void;
    isProcessing?: boolean;
    requireReason?: boolean;
    reason?: string;
    onReasonChange?: (reason: string) => void;
}

export default function ModerationAlert({
    open,
    onOpenChange,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
    onConfirm,
    isProcessing = false,
    requireReason = false,
    reason = "",
    onReasonChange,
}: ModerationAlertProps) {
    const config = VARIANT_CONFIG[variant];
    const canConfirm = requireReason ? reason.trim().length > 0 : true;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-[#E7E5E4]  border border-white/60 rounded-2xl p-0 overflow-hidden max-w-md w-full">
                {/* Content wrapper */}
                <div className="p-6 space-y-5">
                    <AlertDialogHeader className="space-y-2">
                        <AlertDialogTitle className={`${NEU_HEADING} text-lg ${config.titleColor}`}>
                            {title}
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <p className={NEU_MUTED}>{description}</p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {/* Reason textarea */}
                    {requireReason && (
                        <div className="space-y-2 pt-1">
                            <label className={NEU_LABEL}>
                                Reason for action <span className="text-[#FF2157]">*</span>
                            </label>
                            <textarea
                                className={NEU_INPUT}
                                placeholder="Please provide a reason for this action…"
                                value={reason}
                                onChange={(e) => onReasonChange?.(e.target.value)}
                                rows={3}
                                required
                            />
                            {!canConfirm && reason !== "" && (
                                <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#FF2157]">
                                    Please provide a reason before confirming.
                                </p>
                            )}
                        </div>
                    )}

                    <div className={`border-t ${NEU_DIVIDER}`} />

                    {/* Footer */}
                    <AlertDialogFooter className="flex flex-row gap-3 justify-end pt-0">
                        <button
                            type="button"
                            className={NEU_BTN_GHOST}
                            disabled={isProcessing}
                            onClick={() => onOpenChange(false)}
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            className={config.btnClass}
                            onClick={onConfirm}
                            disabled={isProcessing || !canConfirm}
                        >
                            {isProcessing ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processing…
                                </span>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </AlertDialogFooter>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}