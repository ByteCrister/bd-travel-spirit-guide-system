// components/faqs/FaqStats.tsx
'use client';

import { motion } from 'framer-motion';
import {
    RefreshCw,
    HelpCircle,
    CheckCircle,
    XCircle,
    ThumbsUp,
    ThumbsDown,
    LucideIcon,
} from 'lucide-react';
import { FAQStats as FAQStatsType } from '@/types/tour/faqs.types';

// ─── Design Tokens ───────────────────────────────────────────────────────────
// surface: #E7E5E4 | text: #1E2938 | primary: #006666
// success: #00A63D | warning: #FE9900 | danger: #FF2157
// outer: 6px 6px 12px #cac8c7, -6px -6px 12px #ffffff
// icon pill inset: inset 3px 3px 6px #cac8c7, inset -3px -3px 6px #ffffff

interface FaqStatsProps {
    stats: FAQStatsType;
    onRefresh: () => void;
}

interface StatCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    iconColor: string;
    iconBg: string;
}

function StatCard({ title, value, icon: Icon, iconColor, iconBg }: StatCardProps) {
    return (
        <motion.div
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 360, damping: 22 }}
            className="flex flex-col gap-3 rounded-2xl bg-[#E7E5E4] p-4
                shadow-[6px_6px_12px_#cac8c7,-6px_-6px_12px_#ffffff]"
        >
            {/* Icon pill */}
            <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}
                    shadow-[inset_3px_3px_6px_#cac8c7,inset_-3px_-3px_6px_#ffffff]`}
                aria-hidden="true"
            >
                <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>

            {/* Value */}
            <p
                className="font-[family-name:var(--font-space-mono)] text-3xl font-bold leading-none text-[#1E2938]"
                aria-label={`${title}: ${value}`}
            >
                {value.toLocaleString()}
            </p>

            {/* Label */}
            <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/60">
                {title}
            </p>
        </motion.div>
    );
}

export function FaqStats({ stats, onRefresh }: FaqStatsProps) {
    const statsConfig: StatCardProps[] = [
        {
            title: 'Total FAQs',
            value: stats.totalFAQs,
            icon: HelpCircle,
            iconColor: 'text-[#006666]',
            iconBg: 'bg-[#006666]/10',
        },
        {
            title: 'Approved',
            value: stats.totalApproved,
            icon: CheckCircle,
            iconColor: 'text-[#00A63D]',
            iconBg: 'bg-[#00A63D]/10',
        },
        {
            title: 'Pending',
            value: stats.totalPending,
            icon: RefreshCw,
            iconColor: 'text-[#FE9900]',
            iconBg: 'bg-[#FE9900]/10',
        },
        {
            title: 'Rejected',
            value: stats.totalRejected,
            icon: XCircle,
            iconColor: 'text-[#FF2157]',
            iconBg: 'bg-[#FF2157]/10',
        },
        {
            title: 'Total Likes',
            value: stats.totalLikes,
            icon: ThumbsUp,
            iconColor: 'text-[#006666]/80',
            iconBg: 'bg-[#006666]/8',
        },
        {
            title: 'Total Dislikes',
            value: stats.totalDislikes,
            icon: ThumbsDown,
            iconColor: 'text-[#1E2938]/50',
            iconBg: 'bg-[#1E2938]/8',
        },
    ];

    return (
        <section aria-label="FAQ statistics" className="space-y-4">
            {/* Refresh button — top-right */}
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={onRefresh}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#E7E5E4] px-4 py-2
                        font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/70
                        shadow-[4px_4px_8px_#cac8c7,-4px_-4px_8px_#ffffff]
                        hover:text-[#006666]
                        active:shadow-[inset_3px_3px_6px_#cac8c7,inset_-3px_-3px_6px_#ffffff]
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]
                        transition-shadow duration-150 select-none"
                    aria-label="Refresh FAQ statistics"
                >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    Refresh stats
                </button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
                {statsConfig.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>
        </section>
    );
}