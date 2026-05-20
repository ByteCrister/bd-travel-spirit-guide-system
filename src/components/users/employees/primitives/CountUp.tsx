// components/employees/primitives/CountUp.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

interface CountUpProps {
    value: number;
    duration?: number;
}

export function CountUp({ value, duration = 0.6 }: CountUpProps) {
    const motionValue = useMotionValue(0);
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        const controls = animate(motionValue, value, {
            duration,
            ease: "easeOut",
            onUpdate: (latest) => setDisplay(Math.round(latest)),
        });

        return controls.stop;
    }, [value, duration, motionValue]);

    return (
        <motion.span
            aria-live="polite"
            role="status"
            className="font-[family-name:var(--font-space-mono,'Space_Mono',monospace)] tabular-nums"
        >
            {display.toLocaleString()}
        </motion.span>
    );
}