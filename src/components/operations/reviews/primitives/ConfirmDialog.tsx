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
                            // Responsive width & neumorphic surface
                            "w-[calc(100vw-1.5rem)] max-w-[480px] sm:max-w-[480px]",
                            "rounded-[2rem] border-0 p-0",
                            "bg-[#E7E5E4] ",
                            // Override shadcn’s default overflow
                            "[&>button]:hidden",
                            className
                        )}
                    >
                        {/* Animated panel content */}
                        <motion.div
                            initial={{ opacity: 0, y: 14, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 14, scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 380, damping: 28 }}
                            className="p-6"
                        >
                            <DialogHeader>
                                <div className="flex items-start gap-3">
                                    {/* Neumorphic icon circle */}
                                    <div
                                        className={cn(
                                            "mt-0.5 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                                            "",
                                            "bg-[#E7E5E4]",
                                            isDestructive ? "text-[#FF2157]" : "text-[#006666]"
                                        )}
                                        aria-hidden="true"
                                    >
                                        {isDestructive ? (
                                            <HiExclamationTriangle className="h-5 w-5" />
                                        ) : (
                                            <HiOutlineCheck className="h-5 w-5" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <DialogTitle className="font-mono text-lg font-bold tracking-tight text-[#1E2938] break-words">
                                            {title}
                                        </DialogTitle>
                                        {description && (
                                            <DialogDescription className="mt-1 text-sm text-[#475569] break-words">
                                                {description}
                                            </DialogDescription>
                                        )}
                                    </div>
                                </div>
                            </DialogHeader>

                            {/* Divider */}
                            <div className="my-5 h-px bg-[#cfcdcb]" />

                            <DialogFooter className="sm:justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={onCancel}
                                    className={cn(
                                        "rounded-xl font-mono font-semibold text-[#1E2938]",
                                        "bg-[#E7E5E4] border-0",
                                        "",
                                        "hover:",
                                        "hover:bg-[#dfdddb] transition-all",
                                        "focus-visible:ring-2 focus-visible:ring-[#006666] focus-visible:ring-offset-2"
                                    )}
                                >
                                    {cancelLabel}
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={onConfirm}
                                    className={cn(
                                        "rounded-xl font-mono font-semibold border-0",
                                        isDestructive
                                            ? cn(
                                                "bg-[#FF2157] text-white",
                                                "",
                                                "hover:",
                                                "hover:bg-[#e61a4e]",
                                                "focus-visible:ring-2 focus-visible:ring-[#FF2157] focus-visible:ring-offset-2"
                                            )
                                            : cn(
                                                "bg-[#006666] text-white",
                                                "",
                                                "hover:",
                                                "hover:bg-[#005555]",
                                                "focus-visible:ring-2 focus-visible:ring-[#006666] focus-visible:ring-offset-2"
                                            ),
                                        "transition-all"
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