// components/reviews/Skeletons.tsx
"use client";

import { motion } from "framer-motion";
import { JSX } from "react";

export function TableSkeleton({ rows = 10 }: { rows?: number }): JSX.Element {
    return (
        <div className="rounded-md border bg-white shadow-sm" aria-busy="true">
            {[...Array(rows)].map((_, i) => (
                <motion.div
                    key={i}
                    className="h-12 animate-pulse border-b bg-gray-100"
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                />
            ))}
        </div>
    );
}

export function DetailSkeleton(): JSX.Element {
    return <div className="h-32 animate-pulse rounded-md border bg-gray-100" aria-busy="true" />;
}

export function ToolbarSkeleton(): JSX.Element {
    return <div className="h-16 animate-pulse rounded-md border bg-gray-100" aria-busy="true" />;
}
