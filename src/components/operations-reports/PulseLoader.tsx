"use client";

import type { FC } from "react";
import { cn } from "@/lib/utils";

export const PulseLoader: FC<{ size?: number; className?: string }> = ({ size = 8, className }) => {
    const dotStyle: React.CSSProperties = {
        width: size,
        height: size,
    };

    return (
        <span
            className={cn("inline-flex items-center gap-1", className)}
            aria-label="Loading"
        >
            <span
                className="animate-pulse rounded-full bg-primary"
                style={dotStyle}
            />
            <span
                className="animate-pulse rounded-full bg-primary"
                style={{ ...dotStyle, animationDelay: "100ms" }}
            />
            <span
                className="animate-pulse rounded-full bg-primary"
                style={{ ...dotStyle, animationDelay: "200ms" }}
            />
        </span>
    );
};
