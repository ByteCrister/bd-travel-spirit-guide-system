// components/reviews/Skeletons.tsx
"use client";

import { motion } from "framer-motion";
import { JSX } from "react";

const S       = "#E7E5E4";
const PULSE   = "#d8d6d5";

function PulseBox({ className = "" }: { className?: string }) {
    return (
        <motion.div
            className={`rounded-xl ${className}`}
            style={{ background: PULSE }}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
    );
}

export function TableSkeleton({ rows = 10 }: { rows?: number }): JSX.Element {
    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{
                background: S,
                boxShadow: "inset 3px 3px 7px #c9c7c6, inset -3px -3px 7px #ffffff",
            }}
            aria-busy="true"
        >
            {[...Array(rows)].map((_, i) => (
                <motion.div
                    key={i}
                    className="h-14 border-b"
                    style={{ background: i % 2 === 0 ? S : "#dddbd9", borderColor: "#d1cfce" }}
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.2, delay: i * 0.04, repeat: Infinity }}
                />
            ))}
        </div>
    );
}

export function DetailSkeleton(): JSX.Element {
    return (
        <div
            className="rounded-2xl p-5 space-y-3"
            style={{
                background: S,
                boxShadow: "inset 3px 3px 7px #c9c7c6, inset -3px -3px 7px #ffffff",
            }}
            aria-busy="true"
        >
            <PulseBox className="h-4 w-2/3" />
            <PulseBox className="h-3 w-full" />
            <PulseBox className="h-3 w-5/6" />
            <PulseBox className="h-3 w-3/4" />
        </div>
    );
}

export function ToolbarSkeleton(): JSX.Element {
    return (
        <div
            className="h-16 rounded-2xl"
            style={{
                background: S,
                boxShadow: "inset 3px 3px 7px #c9c7c6, inset -3px -3px 7px #ffffff",
            }}
            aria-busy="true"
        />
    );
}