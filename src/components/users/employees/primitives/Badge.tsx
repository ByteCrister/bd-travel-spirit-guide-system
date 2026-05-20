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
            "shadow-[2px_2px_5px_#c9c7c5,-2px_-2px_5px_#ffffff]",
        ].join(" "),
        success: [
            "bg-[#E7E5E4]",
            "text-[#00A63D]",
            "shadow-[2px_2px_5px_#c9c7c5,-2px_-2px_5px_#ffffff]",
        ].join(" "),
        warning: [
            "bg-[#E7E5E4]",
            "text-[#FE9900]",
            "shadow-[2px_2px_5px_#c9c7c5,-2px_-2px_5px_#ffffff]",
        ].join(" "),
        danger: [
            "bg-[#E7E5E4]",
            "text-[#FF2157]",
            "shadow-[2px_2px_5px_#c9c7c5,-2px_-2px_5px_#ffffff]",
        ].join(" "),
        muted: [
            "bg-[#E7E5E4]",
            "text-[#1E2938]/50",
            "shadow-[1px_1px_3px_#c9c7c5,-1px_-1px_3px_#ffffff]",
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