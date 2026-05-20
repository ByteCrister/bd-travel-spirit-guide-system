'use client';

import type { ElementType } from 'react';
import { motion, Variants } from 'framer-motion';
import {
    AlertTriangle,
    Briefcase,
    CalendarCheck2,
    Star,
    Users2,
} from 'lucide-react';
import type { DashboardStats } from '@/types/dashboard/dashboard.type';
import { AnimatedNumber } from '@/components/dashboard/shell/AnimatedNumber';
import { cn } from '@/lib/utils';
import { TbCurrencyTaka } from 'react-icons/tb';

const brand = {
    primary: '#006666',
    surface: '#E7E5E4',
    text: '#1E2938',
    muted: '#6B7A8D',
    shadowOut: '6px 6px 12px #c8c6c4, -6px -6px 12px #ffffff',
    shadowIn: 'inset 3px 3px 6px #c8c6c4, inset -3px -3px 6px #ffffff',
    border: 'rgba(0,102,102,0.10)',
};

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.07 },
    },
};

const item: Variants = {
    hidden: { opacity: 0, y: 14, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 24 } },
};

type StatDef = {
    key: keyof DashboardStats;
    label: string;
    icon: ElementType;
    format: 'int' | 'money' | 'rating';
    hint?: string;
    accentColor: string;
    accentBg: string;
};

const STATS: StatDef[] = [
    {
        key: 'totalTours',
        label: 'Total Tours',
        icon: Briefcase,
        format: 'int',
        accentColor: brand.primary,
        accentBg: 'rgba(0,102,102,0.1)',
    },
    {
        key: 'totalBookings',
        label: 'Bookings',
        icon: CalendarCheck2,
        format: 'int',
        accentColor: '#0088cc',
        accentBg: 'rgba(0,136,204,0.1)',
    },
    {
        key: 'totalRevenue',
        label: 'Revenue (paid)',
        icon: TbCurrencyTaka,
        format: 'money',
        hint: 'Confirmed payments',
        accentColor: '#00A63D',
        accentBg: 'rgba(0,166,61,0.1)',
    },
    {
        key: 'pendingReports',
        label: 'Reports in Review',
        icon: AlertTriangle,
        format: 'int',
        accentColor: '#FE9900',
        accentBg: 'rgba(254,153,0,0.1)',
    },
    {
        key: 'averageRating',
        label: 'Avg. Rating',
        icon: Star,
        format: 'rating',
        accentColor: '#9966cc',
        accentBg: 'rgba(153,102,204,0.1)',
    },
    {
        key: 'activeEmployees',
        label: 'Active Staff',
        icon: Users2,
        format: 'int',
        accentColor: '#FF2157',
        accentBg: 'rgba(255,33,87,0.1)',
    },
];

type DashboardStatsGridProps = {
    stats: DashboardStats | null | undefined;
    animateKey: string;
};

export function DashboardStatsGrid({ stats, animateKey }: DashboardStatsGridProps) {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
            {STATS.map((def) => {
                const Icon = def.icon;
                const raw = stats?.[def.key];
                const value =
                    def.format === 'rating'
                        ? Number((raw as number) ?? 0)
                        : Number(raw ?? 0);

                return (
                    <motion.div key={def.key} variants={item}>
                        <div
                            className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-200 cursor-default"
                            style={{
                                background: brand.surface,
                                boxShadow: brand.shadowOut,
                                border: `1px solid ${brand.border}`,
                            }}
                        >
                            {/* Top accent line in stat's own color */}
                            <div
                                className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
                                style={{ background: def.accentColor }}
                                aria-hidden
                            />

                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p
                                        className="text-[10px] font-bold uppercase tracking-[0.18em]"
                                        style={{ color: brand.muted, fontFamily: 'var(--font-space-mono)' }}
                                    >
                                        {def.label}
                                    </p>
                                    {def.hint && (
                                        <p
                                            className="mt-0.5 text-[10px]"
                                            style={{ color: brand.muted, fontFamily: 'var(--font-jetbrains-mono)' }}
                                        >
                                            {def.hint}
                                        </p>
                                    )}
                                </div>
                                {/* Icon badge — neumorphic circle */}
                                <div
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                    style={{
                                        background: def.accentBg,
                                        boxShadow: brand.shadowIn,
                                    }}
                                >
                                    <Icon className="h-5 w-5" style={{ color: def.accentColor }} aria-hidden />
                                </div>
                            </div>

                            <div
                                className="mt-4 text-[2.25rem] font-bold tabular-nums leading-none tracking-tight"
                                style={{ color: brand.text, fontFamily: 'var(--font-space-mono)' }}
                            >
                                {def.format === 'money' ? (
                                    <AnimatedNumber
                                        value={value}
                                        prefix="৳"
                                        decimals={0}
                                        animateKey={`${animateKey}-${def.key}`}
                                    />
                                ) : def.format === 'rating' ? (
                                    <AnimatedNumber
                                        value={value}
                                        decimals={1}
                                        animateKey={`${animateKey}-${def.key}`}
                                    />
                                ) : (
                                    <AnimatedNumber
                                        value={Math.round(value)}
                                        animateKey={`${animateKey}-${def.key}`}
                                    />
                                )}
                            </div>

                            {/* Subtle bottom bar in accent color */}
                            <div
                                className="absolute bottom-0 left-0 h-[2px] w-1/3 rounded-b-sm opacity-40 transition-all duration-300 group-hover:w-full group-hover:opacity-70"
                                style={{ background: def.accentColor }}
                                aria-hidden
                            />
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}