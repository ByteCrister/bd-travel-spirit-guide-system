"use client";

import type { ApiError } from "@/types/tour/reviews.types";
import { JSX, useState } from "react";
import { HiExclamationCircle, HiOutlineX, HiRefresh, HiChevronDown } from "react-icons/hi";
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
        <div
            role="alert"
            className={cn(
                // Neumorphic raised surface
                "relative overflow-hidden rounded-2xl border-l-4 border-danger bg-surface p-4 text-text",
                "shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]",
                className,
            )}
        >
            {/* Subtle danger gradient top bar */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-danger/60 via-danger/40 to-danger/60" />

            <div className="flex items-start gap-3">
                {/* Error icon with neumorphic pressed circle */}
                <div className="mt-0.5 flex-shrink-0 rounded-full bg-surface p-1.5 shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]">
                    <HiExclamationCircle aria-hidden="true" className="h-5 w-5 text-danger" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold tracking-[-0.01em]">
                        Something went wrong
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed opacity-90">{message}</p>

                    {/* Actions */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        {onRetry && (
                            <button
                                type="button"
                                onClick={onRetry}
                                className={cn(
                                    "inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-medium",
                                    "bg-surface text-primary shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff]",
                                    "transition-all duration-150 ease-out",
                                    "hover:shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
                                    "active:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff]",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
                                )}
                            >
                                <HiRefresh className="h-4 w-4" aria-hidden="true" />
                                Retry
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setShowDetails((s) => !s)}
                            aria-expanded={showDetails}
                            aria-controls="error-details"
                            className={cn(
                                "inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-medium",
                                "bg-surface text-danger shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff]",
                                "transition-all duration-150 ease-out",
                                "hover:shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
                                "active:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff]",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/50 focus-visible:ring-offset-2",
                            )}
                        >
                            <HiChevronDown
                                className={cn("h-4 w-4 transition-transform", showDetails && "rotate-180")}
                                aria-hidden="true"
                            />
                            Details
                        </button>
                    </div>

                    {/* Collapsible technical details */}
                    <div
                        id="error-details"
                        className={cn(
                            "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                            showDetails ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                    >
                        <div className="overflow-hidden">
                            <hr className="my-3 border-t border-danger/20" />
                            <div
                                className={cn(
                                    "rounded-lg p-3 text-xs text-text/80",
                                    "bg-surface shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
                                )}
                            >
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

                {/* Dismiss button */}
                {dismissible && (
                    <button
                        type="button"
                        aria-label="Dismiss error"
                        onClick={() => setOpen(false)}
                        className={cn(
                            "mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full",
                            "bg-surface shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]",
                            "text-text/60 transition-all duration-150 ease-out",
                            "hover:text-danger hover:shadow-[1px_1px_3px_#c8c6c5,-1px_-1px_3px_#ffffff]",
                            "active:shadow-[inset_1px_1px_3px_#c8c6c5,inset_-1px_-1px_3px_#ffffff]",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/50",
                        )}
                    >
                        <HiOutlineX aria-hidden="true" className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}