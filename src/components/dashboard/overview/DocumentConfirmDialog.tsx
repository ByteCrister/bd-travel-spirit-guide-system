"use client";

import React from "react";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, X } from "lucide-react";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    context?: string;
};

export default function DocumentConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title = "Delete document",
    description =
    "This will remove the file from your draft. The removal will be persisted only after you save.",
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    context,
}: Props) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogTrigger asChild>
                <span />
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-lg w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                {/* Top accent bar */}
                <div className="h-1 rounded-t-2xl bg-gradient-to-r from-red-500 via-rose-500 to-pink-500/80" />

                <AlertDialogHeader className="px-6 pt-6">
                    <div className="flex items-start gap-4">
                        {/* icon card */}
                        <div className="flex-none">
                            <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center ring-1 ring-red-100 dark:ring-red-900/30">
                                <AlertTriangle className="text-red-600 dark:text-red-300 size-5" />
                            </div>
                        </div>

                        <div className="min-w-0">
                            <AlertDialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {title}
                            </AlertDialogTitle>

                            <AlertDialogDescription className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                {description}
                                {context && (
                                    <span className="block mt-4">
                                        <span className="inline-flex items-center gap-3 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-1 text-sm text-slate-700 dark:text-slate-200 shadow-sm">
                                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                                Item
                                            </span>
                                            <span
                                                className="font-mono text-xs truncate max-w-[16rem] text-slate-700 dark:text-slate-200"
                                                style={{ display: "inline-block" }}
                                            >
                                                {context}
                                            </span>
                                        </span>
                                    </span>
                                )}
                            </AlertDialogDescription>
                        </div>

                        {/* close affordance for keyboard users (visual hidden on wide) */}
                        <div className="ml-auto -mr-2 mt-1">
                            <AlertDialogCancel asChild>
                                <button
                                    aria-label="Close"
                                    className="inline-flex items-center justify-center p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                >
                                    <X className="size-4" />
                                </button>
                            </AlertDialogCancel>
                        </div>
                    </div>
                </AlertDialogHeader>

                <AlertDialogFooter className="px-6 pb-6 pt-4 flex flex-col-reverse sm:flex-row-reverse items-center gap-3">
                    <AlertDialogAction asChild>
                        <Button
                            variant="destructive"
                            className="w-full sm:w-auto flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg"
                            onClick={onConfirm}
                            aria-label={confirmLabel}
                        >
                            <Trash2 className="size-4" />
                            <span className="font-semibold">{confirmLabel}</span>
                        </Button>
                    </AlertDialogAction>

                    <AlertDialogCancel asChild>
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto"
                            aria-label={cancelLabel}
                        >
                            {cancelLabel}
                        </Button>
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
