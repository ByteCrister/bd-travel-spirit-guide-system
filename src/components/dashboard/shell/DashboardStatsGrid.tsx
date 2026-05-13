'use client';

import type { ElementType } from 'react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    Briefcase,
    CalendarIcon,
    Star,
    Users,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { DashboardStats } from '@/types/dashboard/dashboard.type';
import { AnimatedNumber } from '@/components/dashboard/shell/AnimatedNumber';
import { cn } from '@/lib/utils';
import { TbCurrencyTaka } from 'react-icons/tb';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.06 },
    },
};

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
};

type StatDef = {
    key: keyof DashboardStats;
    label: string;
    icon: ElementType;
    format: 'int' | 'money' | 'rating';
    hint?: string;
};

const STATS: StatDef[] = [
    { key: 'totalTours', label: 'Total tours', icon: Briefcase, format: 'int' },
    { key: 'totalBookings', label: 'Bookings', icon: CalendarIcon, format: 'int' },
    { key: 'totalRevenue', label: 'Revenue (paid)', icon: TbCurrencyTaka , format: 'money', hint: 'Confirmed payments' },
    { key: 'pendingReports', label: 'Reports in review', icon: AlertTriangle, format: 'int' },
    { key: 'averageRating', label: 'Avg. rating', icon: Star, format: 'rating' },
    { key: 'activeEmployees', label: 'Active staff', icon: Users, format: 'int' },
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
                                'group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card to-card/60 p-6 shadow-sm',
                                'ring-1 ring-black/5 dark:ring-white/10',
                                'transition-shadow hover:shadow-md',
                            )}
                        >
                            <div
                                className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-lime-500 opacity-80"
                                aria-hidden
                            />
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{def.label}</p>
                                    {def.hint ? (
                                        <p className="mt-0.5 text-xs text-muted-foreground/80">{def.hint}</p>
                                    ) : null}
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                                    <Icon className="h-5 w-5" aria-hidden />
                                </div>
                            </div>
                            <div className="mt-5 text-3xl font-bold tabular-nums sm:text-4xl">
                                {def.format === 'money' ? (
                                    <AnimatedNumber
                                        value={value}
                                        prefix="৳"
                                        decimals={0}
                                        animateKey={`৳{animateKey}-৳{def.key}`}
                                    />
                                ) : def.format === 'rating' ? (
                                    <AnimatedNumber
                                        value={value}
                                        decimals={1}
                                        animateKey={`৳{animateKey}-৳{def.key}`}
                                    />
                                ) : (
                                    <AnimatedNumber
                                        value={Math.round(value)}
                                        animateKey={`৳{animateKey}-৳{def.key}`}
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
