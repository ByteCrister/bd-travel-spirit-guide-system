// components/employees/primitives/Badge.tsx
"use client";

import React from "react";

export function Badge({
    children,
    intent = "default",
}: {
    children: React.ReactNode;
    intent?: "default" | "success" | "warning" | "danger" | "muted";
}) {
    const map: Record<string, string> = {
        default: [
            "bg-[#E7E5E4]",
            "text-[#1E2938]",
            "border border-[#d0cecc]",
        ].join(" "),
        success: [
            "bg-[#E7E5E4]",
            "text-[#00A63D]",
            "border border-[#d0cecc]",
        ].join(" "),
        warning: [
            "bg-[#E7E5E4]",
            "text-[#FE9900]",
            "border border-[#d0cecc]",
        ].join(" "),
        danger: [
            "bg-[#E7E5E4]",
            "text-[#FF2157]",
            "border border-[#d0cecc]",
        ].join(" "),
        muted: [
            "bg-[#E7E5E4]",
            "text-[#1E2938]/50",
            "border border-[#d0cecc]",
        ].join(" "),
    };

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md font-[family-name:var(--font-space-mono,_'Space_Mono',_monospace)] tracking-wide ${map[intent]}`}
        >
            {children}
        </span>
    );
}