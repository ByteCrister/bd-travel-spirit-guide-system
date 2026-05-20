"use client";

import type { FC } from "react";
import { cn } from "@/lib/utils";

export const PulseLoader: FC<{ size?: number; className?: string }> = ({
    size = 8,
    className,
}) => {
    const dotStyle: React.CSSProperties = {
        width: size,
        height: size,
    };

    return (
        <span
            className={cn("inline-flex items-center gap-1.5", className)}
            aria-label="Loading"
        >
            {[0, 100, 200].map((delay) => (
                <span
                    key={delay}
                    className="animate-pulse rounded-full"
                    style={{
                        ...dotStyle,
                        animationDelay: `${delay}ms`,
                        background: "#006666",
                        boxShadow:
                            "2px 2px 4px rgba(0,0,0,0.18), -1px -1px 3px rgba(255,255,255,0.55)",
                    }}
                />
            ))}
        </span>
    );
};