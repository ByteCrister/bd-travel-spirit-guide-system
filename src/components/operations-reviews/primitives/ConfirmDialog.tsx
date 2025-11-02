"use client";

import { JSX, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiExclamationTriangle, HiOutlineCheck } from "react-icons/hi2";
import { cn } from "@/lib/utils";

// shadcn/ui primitives (adjust import paths to your project)
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
    open: boolean;
    title: string;
    description?: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "destructive" | "default";
    className?: string;
};

export default function ConfirmDialog({
    open,
    title,
    description,
    onConfirm,
    onCancel,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "destructive",
    className,
}: ConfirmDialogProps): JSX.Element | null {
    // Keyboard handling: Escape cancels, Enter confirms
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onCancel();
            }
            if (e.key === "Enter") {
                e.preventDefault();
                onConfirm();
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onCancel, onConfirm]);

    const isDestructive = variant === "destructive";

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
            <AnimatePresence>
                {open && (
                    <DialogContent
                        className={cn(
                            "sm:max-w-[480px] overflow-hidden rounded-2xl border shadow-xl",
                            "bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70",
                            className
                        )}
                    >
                        {/* Accent bar */}
                        <motion.div
                            className={cn(
                                "absolute inset-x-0 top-0 h-1",
                                isDestructive
                                    ? "bg-gradient-to-r from-red-500 via-red-400 to-red-500"
                                    : "bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500"
                            )}
                            initial={{ opacity: 0, scaleX: 0.9 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            exit={{ opacity: 0, scaleX: 0.9 }}
                            transition={{ duration: 0.18 }}
                        />

                        {/* Animated panel content */}
                        <motion.div
                            initial={{ opacity: 0, y: 14, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 14, scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 380, damping: 28 }}
                        >
                            <DialogHeader>
                                <div className="flex items-start gap-3">
                                    <div
                                        className={cn(
                                            "mt-0.5 flex-shrink-0",
                                            isDestructive ? "text-red-600" : "text-emerald-600"
                                        )}
                                        aria-hidden="true"
                                    >
                                        {isDestructive ? (
                                            <HiExclamationTriangle className="h-6 w-6" />
                                        ) : (
                                            <HiOutlineCheck className="h-6 w-6" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <DialogTitle className="text-base font-semibold tracking-[-0.01em]">
                                            {title}
                                        </DialogTitle>
                                        {description && (
                                            <DialogDescription className="mt-1 text-sm text-neutral-700">
                                                {description}
                                            </DialogDescription>
                                        )}
                                    </div>
                                </div>
                            </DialogHeader>

                            {/* Divider */}
                            <div className="my-4 h-px bg-neutral-200/80" />

                            <DialogFooter className="sm:justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onCancel}
                                    className="border-neutral-300 text-neutral-800 hover:bg-neutral-50"
                                >
                                    {cancelLabel}
                                </Button>

                                <Button
                                    type="button"
                                    onClick={onConfirm}
                                    variant={isDestructive ? "destructive" : "default"}
                                    className={cn(
                                        "font-semibold",
                                        isDestructive
                                            ? "shadow-sm focus:ring-2 focus:ring-red-400"
                                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-2 focus:ring-emerald-400"
                                    )}
                                >
                                    {confirmLabel}
                                </Button>
                            </DialogFooter>
                        </motion.div>
                    </DialogContent>
                )}
            </AnimatePresence>
        </Dialog>
    );
}
