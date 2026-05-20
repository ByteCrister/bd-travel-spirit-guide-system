"use client";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function PaginationControls({
    page,
    pages,
    limit,
    onPageChange,
    onLimitChange,
    loading,
}: {
    page: number;
    pages: number;
    limit: number;
    onPageChange: (p: number) => void;
    onLimitChange: (l: number) => void;
    loading: boolean;
}) {
    const limits = [10, 20, 50, 100];

    const neuBase = [
        "bg-[#E7E5E4]",
        "shadow-[4px_4px_8px_#c9c7c5,-4px_-4px_8px_#ffffff]",
        "hover:shadow-[6px_6px_10px_#c9c7c5,-6px_-6px_10px_#ffffff]",
        "active:shadow-[inset_2px_2px_5px_#c9c7c5,inset_-2px_-2px_5px_#ffffff]",
        "transition-all duration-150",
        "border-0 outline-none",
    ].join(" ");

    const neuInset = [
        "bg-[#E7E5E4]",
        "shadow-[inset_2px_2px_5px_#c9c7c5,inset_-2px_-2px_5px_#ffffff]",
    ].join(" ");

    return (
        <div
            className={[
                "flex flex-col gap-3 rounded-2xl p-4",
                "bg-[#E7E5E4]",
                "shadow-[6px_6px_12px_#c9c7c5,-6px_-6px_12px_#ffffff]",
                "md:flex-row md:items-center md:justify-between",
            ].join(" ")}
        >
            {/* Left side */}
            <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#1E2938]/50 font-[family-name:var(--font-space-mono,'Space_Mono',monospace)]">
                    Rows / page
                </span>

                <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
                    <SelectTrigger
                        className={[
                            neuBase,
                            "h-8 w-20 rounded-xl px-3",
                            "text-[12px] font-medium text-[#1E2938]",
                            "font-[family-name:var(--font-jetbrains-mono,'JetBrains_Mono',monospace)]",
                            "focus:ring-0 focus:ring-offset-0",
                        ].join(" ")}
                    >
                        <SelectValue placeholder={String(limit)} />
                    </SelectTrigger>
                    <SelectContent
                        className={[
                            "rounded-xl border-0",
                            "bg-[#E7E5E4]",
                            "shadow-[6px_6px_16px_#c9c7c5,-6px_-6px_16px_#ffffff]",
                        ].join(" ")}
                    >
                        {limits.map((l) => (
                            <SelectItem
                                key={l}
                                value={String(l)}
                                className="rounded-lg text-[12px] font-medium text-[#1E2938] font-[family-name:var(--font-jetbrains-mono,'JetBrains_Mono',monospace)] focus:bg-[#006666]/10"
                            >
                                {l}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <span className="hidden text-[#1E2938]/20 md:inline">·</span>

                <span className="text-[12px] text-[#1E2938]/50 font-[family-name:var(--font-jetbrains-mono,'JetBrains_Mono',monospace)]">
                    Showing{" "}
                    <span className="font-semibold text-[#1E2938]">
                        {Math.min(limit, (pages - 1) * limit + limit)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-[#1E2938]">{pages * limit}</span>
                </span>
            </div>

            {/* Right side */}
            <div className="flex items-center justify-end gap-2">
                <Button
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={loading || page <= 1}
                    className={[
                        neuBase,
                        "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 h-8",
                        "text-[12px] font-semibold text-[#006666]",
                        "font-[family-name:var(--font-space-mono,'Space_Mono',monospace)]",
                        "disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed",
                    ].join(" ")}
                    aria-label="Previous page"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Prev</span>
                </Button>

                {/* Page indicator — inset */}
                <div
                    className={[
                        neuInset,
                        "rounded-xl px-4 py-1.5 flex items-center gap-1.5",
                    ].join(" ")}
                >
                    <span className="text-[11px] text-[#1E2938]/40 font-[family-name:var(--font-space-mono,'Space_Mono',monospace)] uppercase tracking-wider">
                        pg
                    </span>
                    <span className="text-[13px] font-bold text-[#006666] font-[family-name:var(--font-space-mono,'Space_Mono',monospace)] tabular-nums">
                        {page}
                    </span>
                    <span className="text-[11px] text-[#1E2938]/30 font-[family-name:var(--font-space-mono,'Space_Mono',monospace)]">
                        / {pages}
                    </span>
                </div>

                <Button
                    onClick={() => onPageChange(Math.min(pages, page + 1))}
                    disabled={loading || page >= pages}
                    className={[
                        "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 h-8",
                        "bg-[#006666]",
                        "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#007f7f]",
                        "hover:shadow-[6px_6px_10px_#004d4d,-3px_-3px_8px_#007f7f]",
                        "active:shadow-[inset_2px_2px_5px_#004d4d,inset_-2px_-2px_5px_#007f7f]",
                        "text-[12px] font-semibold text-white border-0",
                        "font-[family-name:var(--font-space-mono,'Space_Mono',monospace)]",
                        "disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed",
                        "transition-all duration-150",
                    ].join(" ")}
                    aria-label="Next page"
                >
                    <span className="hidden md:inline">Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}