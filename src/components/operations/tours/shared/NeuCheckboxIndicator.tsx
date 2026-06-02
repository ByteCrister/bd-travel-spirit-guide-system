"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Presentational checkbox — use with a single parent onClick; not a Radix control. */
export function NeuCheckboxIndicator({
    checked,
    className,
}: {
    checked: boolean;
    className?: string;
}) {
    return (
        <div
            aria-hidden
            className={cn(
                "size-4 shrink-0 rounded-[4px] border shadow-xs flex items-center justify-center transition-colors",
                checked
                    ? "bg-[#006666] border-[#006666] text-white"
                    : "border-input bg-[#E7E5E4]",
                className
            )}
        >
            {checked ? <Check className="size-3.5" /> : null}
        </div>
    );
}

/** Normalize Radix checked state to boolean for Formik fields. */
export function toBooleanChecked(checked: boolean | "indeterminate"): boolean {
    return checked === true;
}
