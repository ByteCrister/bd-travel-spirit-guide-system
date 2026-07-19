"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PayrollStatus } from "@/constants/employee/employee.const";

interface PaymentStatusBadgeProps {
    status: PayrollStatus;
    amount: number;
    currency: string;
    isRetryable?: boolean;
    onRetry?: (e: React.MouseEvent) => void;
    isLoading?: boolean;
    className?: string;
}

export function PaymentStatusBadge({
    status,
    amount,
    currency,
    isRetryable = false,
    onRetry,
    isLoading = false,
    className,
}: PaymentStatusBadgeProps) {
    const config = {
        pending: {
            icon: <Clock className="h-3 w-3" />,
            label: "Pending",
            color: "text-[#FE9900]",
        },
        paid: {
            icon: <CheckCircle2 className="h-3 w-3" />,
            label: "Paid",
            color: "text-[#00A63D]",
        },
        failed: {
            icon: <AlertCircle className="h-3 w-3" />,
            label: "Failed",
            color: "text-[#FF2157]",
        },
    };

    const currentConfig = config[status];

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {/* Neumorphic badge pill */}
            <span
                className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1",
                    "bg-[#E7E5E4] border border-[#d0cecc]",
                    "text-[11px] font-semibold tracking-wide",
                    "font-[family-name:var(--font-space-mono,'Space_Mono',monospace)]",
                    currentConfig.color
                )}
            >
                {currentConfig.icon}
                <span>{currentConfig.label}</span>
            </span>

            <span className="text-[11px] text-[#1E2938]/50 whitespace-nowrap font-[family-name:var(--font-jetbrains-mono,'JetBrains_Mono',monospace)]">
                {currency} {amount.toLocaleString()}
            </span>

            {status === "failed" && isRetryable && onRetry && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRetry(e);
                    }}
                    disabled={isLoading}
                    className={cn(
                        "h-7 w-7 p-0 rounded-lg",
                        "bg-[#E7E5E4] border border-[#d0cecc] hover:bg-[#dbd9d8]",
                        "transition-all duration-150",
                        "text-[#FF2157]",
                        "disabled:opacity-40"
                    )}
                    title="Retry payment"
                >
                    <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
                </Button>
            )}
        </div>
    );
}