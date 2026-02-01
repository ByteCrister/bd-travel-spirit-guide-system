"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
    const variantStyles = {
        default: {
            confirmButton: "bg-primary hover:bg-primary/90",
            text: "text-primary",
        },
        destructive: {
            confirmButton: "bg-destructive hover:bg-destructive/90",
            text: "text-destructive",
        },
        warning: {
            confirmButton: "bg-amber-500 hover:bg-amber-600",
            text: "text-amber-600",
        },
        success: {
            confirmButton: "bg-green-500 hover:bg-green-600",
            text: "text-green-600",
        },
    };

    const canConfirm = requireReason ? reason.trim().length > 0 : true;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className={variantStyles[variant].text}>
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {requireReason && (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Reason for action *
                            </label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Please provide a reason for this action..."
                                value={reason}
                                onChange={(e) => onReasonChange?.(e.target.value)}
                                rows={3}
                                required
                            />
                            {!canConfirm && (
                                <p className="text-sm text-destructive">
                                    Please provide a reason before confirming.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button variant="outline" disabled={isProcessing}>
                            {cancelText}
                        </Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button
                            className={variantStyles[variant].confirmButton}
                            onClick={onConfirm}
                            disabled={isProcessing || !canConfirm}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                confirmText
                            )}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}