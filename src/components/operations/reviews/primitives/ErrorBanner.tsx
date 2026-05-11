"use client";

import type { ApiError } from "@/types/tour/reviews.types";
import { JSX, useState } from "react";
import { HiExclamationCircle, HiOutlineX, HiRefresh, HiChevronDown } from "react-icons/hi";

// shadcn/ui imports (adjust paths to your setup)
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type ErrorBannerProps = {
    error: ApiError;
    description?: string;
    onRetry?: () => void;
    className?: string;
    dismissible?: boolean;
};

export function ErrorBanner({
    error,
    description,
    onRetry,
    className,
    dismissible = true,
}: ErrorBannerProps): JSX.Element {
    const [open, setOpen] = useState(true);
    const [showDetails, setShowDetails] = useState(false);

    if (!open) return <></>;

    const message = description ?? error.message;

    return (
        <Alert
            role="alert"
            className={cn(
                // modern + professional styling
                "relative overflow-hidden rounded-xl border border-destructive/30 bg-destructive/10",
                "shadow-sm backdrop-blur-sm",
                "supports-[backdrop-filter]:bg-gradient-to-br supports-[backdrop-filter]:from-destructive/10 supports-[backdrop-filter]:to-destructive/5",
                "transition-colors",
                className
            )}
            variant="destructive"
        >
            {/* Soft gradient accent bar */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500/60 via-red-400/40 to-red-500/60" />

            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="mt-0.5 flex-shrink-0 text-destructive">
                    <HiExclamationCircle aria-hidden="true" className="h-6 w-6" />
                </div>

                {/* Content */}
                <div className="flex-1">
                    <AlertTitle className="text-base font-semibold tracking-[-0.01em]">
                        Something went wrong
                    </AlertTitle>

                    <AlertDescription className="mt-1 text-sm leading-relaxed">
                        {message}
                    </AlertDescription>

                    {/* Actions */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        {onRetry && (
                            <Button
                                type="button"
                                size="sm"
                                className="gap-1"
                                onClick={onRetry}
                                variant="destructive"
                            >
                                <HiRefresh className="h-4 w-4" aria-hidden="true" />
                                Retry
                            </Button>
                        )}

                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border-destructive/30 text-destructive hover:bg-destructive/10"
                            onClick={() => setShowDetails((s) => !s)}
                            aria-expanded={showDetails}
                            aria-controls="error-details"
                        >
                            <HiChevronDown
                                className={cn("h-4 w-4 transition-transform", showDetails && "rotate-180")}
                                aria-hidden="true"
                            />
                            Details
                        </Button>
                    </div>

                    {/* Details (collapsible) */}
                    <div
                        id="error-details"
                        className={cn(
                            "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                            showDetails ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        )}
                    >
                        <div className="overflow-hidden">
                            <Separator className="my-3 bg-destructive/20" />
                            <div className="rounded-lg bg-destructive/5 p-3 text-xs text-destructive/90">
                                <div className="font-medium">Technical details</div>
                                <ul className="mt-1 space-y-1">
                                    <li>
                                        <span className="font-semibold">Code:</span>{" "}
                                        {String(error?.code ?? "N/A")}
                                    </li>
                                    <li>
                                        <span className="font-semibold">Status:</span>{" "}
                                        {String(error?.status ?? "N/A")}
                                    </li>
                                    <li className="break-words">
                                        <span className="font-semibold">Raw message:</span>{" "}
                                        {String(error.message)}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dismiss */}
                {dismissible && (
                    <button
                        type="button"
                        aria-label="Dismiss error"
                        className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-md text-destructive/80 transition-colors hover:bg-destructive/10 hover:text-destructive focus:outline-none focus:ring-2 focus:ring-destructive/40"
                        onClick={() => setOpen(false)}
                    >
                        <HiOutlineX aria-hidden="true" className="h-4 w-4" />
                    </button>
                )}
            </div>
        </Alert>
    );
}
