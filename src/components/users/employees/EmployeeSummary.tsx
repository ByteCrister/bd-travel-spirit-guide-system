"use client";

import React from "react";
import { CountUp } from "./primitives/CountUp";
import { Skeleton } from "./primitives/Skeleton";
import { Users, UserCheck, UserMinus, UserX, LucideIcon } from "lucide-react";

interface EmployeeSummaryProps {
    summary: {
        total: number;
        active: number;
        onLeave: number;
        suspended: number;
        terminated: number;
    };
    loading: boolean;
}

interface CardProps {
    icon: LucideIcon;
    label: string;
    value: number;
    loading: boolean;
    tone?: "primary" | "success" | "warning" | "danger" | "muted";
}

type Tone = "primary" | "success" | "warning" | "danger" | "muted";

const TONE_COLOR: Record<Tone, string> = {
    primary: "text-[#006666]",
    success: "text-[#00A63D]",
    warning: "text-[#FE9900]",
    danger: "text-[#FF2157]",
    muted: "text-[#1E2938]/40",
};

const StatCard: React.FC<CardProps> = ({ icon: Icon, label, value, loading, tone }) => {
    const safeTone: Tone = (tone ?? "muted") as Tone;
    const accentColor = TONE_COLOR[safeTone];

    return (
        <div
            className={[
                "relative flex flex-col gap-3 rounded-2xl p-4",
                "bg-[#E7E5E4]",
                "shadow-[6px_6px_12px_#c9c7c5,-6px_-6px_12px_#ffffff]",
                "transition-all duration-200",
                "hover:shadow-[8px_8px_16px_#c9c7c5,-8px_-8px_16px_#ffffff]",
                "focus-within:shadow-[inset_2px_2px_6px_#c9c7c5,inset_-2px_-2px_6px_#ffffff]",
                "outline-none",
            ].join(" ")}
            role="group"
            aria-label={`${label} statistic`}
            tabIndex={0}
        >
            {/* Icon chip — inset pressed look */}
            <div
                className={[
                    "flex h-9 w-9 items-center justify-center rounded-xl",
                    "bg-[#E7E5E4]",
                    "shadow-[inset_2px_2px_5px_#c9c7c5,inset_-2px_-2px_5px_#ffffff]",
                    accentColor,
                ].join(" ")}
                aria-hidden="true"
            >
                <Icon className="h-4 w-4" />
            </div>

            {/* Label */}
            <div>
                <p
                    className="text-[11px] font-semibold uppercase tracking-widest text-[#1E2938]/50 font-[family-name:var(--font-space-mono,'Space_Mono',monospace)]"
                >
                    {label}
                </p>
                <p className="text-[10px] text-[#1E2938]/30 font-[family-name:var(--font-jetbrains-mono,'JetBrains_Mono',monospace)] mt-0.5">
                    As of now
                </p>
            </div>

            {/* Value */}
            <div
                className={[
                    "text-2xl font-bold leading-none",
                    accentColor,
                    "font-[family-name:var(--font-space-mono,'Space_Mono',monospace)]",
                ].join(" ")}
            >
                {loading ? (
                    <Skeleton className="h-7 w-16 rounded-lg" />
                ) : (
                    <CountUp value={value} />
                )}
            </div>
        </div>
    );
};

export function EmployeeSummary({ summary, loading }: EmployeeSummaryProps) {
    const metrics: CardProps[] = [
        { icon: Users, label: "Total Employees", value: summary.total, loading, tone: "primary" },
        { icon: UserCheck, label: "Active", value: summary.active, loading, tone: "success" },
        { icon: UserMinus, label: "On Leave", value: summary.onLeave, loading, tone: "warning" },
        { icon: UserX, label: "Suspended", value: summary.suspended, loading, tone: "danger" },
        { icon: UserX, label: "Terminated", value: summary.terminated, loading, tone: "muted" },
    ];

    return (
        <section aria-labelledby="employee-summary-heading" className="w-full">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                    <h3
                        id="employee-summary-heading"
                        className="text-sm font-bold uppercase tracking-widest text-[#1E2938] font-[family-name:var(--font-space-mono,'Space_Mono',monospace)]"
                    >
                        Employee Summary
                    </h3>
                    <p className="mt-1 text-xs text-[#1E2938]/50 font-[family-name:var(--font-jetbrains-mono,'JetBrains_Mono',monospace)]">
                        Snapshot of company headcount and status distribution
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {metrics.map((m) => (
                    <StatCard
                        key={m.label}
                        icon={m.icon}
                        label={m.label}
                        value={m.value}
                        loading={m.loading}
                        tone={m.tone}
                    />
                ))}
            </div>
        </section>
    );
}