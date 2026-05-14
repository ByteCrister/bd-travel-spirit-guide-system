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
import { Card } from '@/components/ui/card';
import type { DashboardStats } from '@/types/dashboard/dashboard.type';
import { AnimatedNumber } from '@/components/dashboard/shell/AnimatedNumber';
import { cn } from '@/lib/utils';
import { TbCurrencyTaka } from 'react-icons/tb';

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.07 },
    },
};

const item: Variants = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

type StatDef = {
    key: keyof DashboardStats;
    label: string;
    icon: ElementType;
    format: 'int' | 'money' | 'rating';
    hint?: string;
    iconBg: string;
    iconColor: string;
    accent: string;
};

const STATS: StatDef[] = [
    {
        key: 'totalTours',
        label: 'Total Tours',
        icon: Briefcase,
        format: 'int',
        iconBg: 'bg-slate-800/8 dark:bg-slate-200/10',
        iconColor: 'text-slate-700 dark:text-slate-200',
        accent: 'from-slate-400 via-slate-300 to-slate-200',
    },
    {
        key: 'totalBookings',
        label: 'Bookings',
        icon: CalendarCheck2,
        format: 'int',
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-600 dark:text-blue-400',
        accent: 'from-blue-500 via-blue-400 to-sky-300',
    },
    {
        key: 'totalRevenue',
        label: 'Revenue (paid)',
        icon: TbCurrencyTaka,
        format: 'money',
        hint: 'Confirmed payments',
        iconBg: 'bg-emerald-500/10',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        accent: 'from-emerald-500 via-teal-400 to-cyan-300',
    },
    {
        key: 'pendingReports',
        label: 'Reports in Review',
        icon: AlertTriangle,
        format: 'int',
        iconBg: 'bg-amber-500/10',
        iconColor: 'text-amber-600 dark:text-amber-400',
        accent: 'from-amber-500 via-amber-400 to-yellow-300',
    },
    {
        key: 'averageRating',
        label: 'Avg. Rating',
        icon: Star,
        format: 'rating',
        iconBg: 'bg-violet-500/10',
        iconColor: 'text-violet-600 dark:text-violet-400',
        accent: 'from-violet-500 via-purple-400 to-fuchsia-300',
    },
    {
        key: 'activeEmployees',
        label: 'Active Staff',
        icon: Users2,
        format: 'int',
        iconBg: 'bg-rose-500/10',
        iconColor: 'text-rose-600 dark:text-rose-400',
        accent: 'from-rose-500 via-pink-400 to-rose-300',
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
                        <Card
                            className={cn(
                                'group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/80 to-slate-100/60 p-6 shadow-md shadow-slate-200/50 transition-all duration-200',
                                'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/60',
                                'dark:border-slate-700/60 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-900/80 dark:shadow-slate-900/50 dark:hover:shadow-slate-900/70',
                            )}
                        >
                            {/* Glossy top sheen */}
                            <div
                                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/10"
                                aria-hidden
                            />
                            {/* Colored top accent line */}
                            <div
                                className={cn(
                                    'pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r opacity-70',
                                    def.accent,
                                )}
                                aria-hidden
                            />

                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        {def.label}
                                    </p>
                                    {def.hint ? (
                                        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{def.hint}</p>
                                    ) : null}
                                </div>
                                <div
                                    className={cn(
                                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/5 dark:ring-white/10',
                                        def.iconBg,
                                    )}
                                >
                                    <Icon className={cn('h-5 w-5', def.iconColor)} aria-hidden />
                                </div>
                            </div>

                            <div className="mt-5 text-3xl font-black tabular-nums tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
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
                        </Card>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}