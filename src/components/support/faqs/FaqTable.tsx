// components/faqs/FaqTable.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Eye,
    ThumbsUp,
    ThumbsDown,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
} from 'lucide-react';
import { FAQ } from '@/types/tour/faqs.types';
import { useFAQStore } from '@/store/faq-store';
import { VoteModal } from './VoteModal';
import { showToast } from '@/components/global/showToast';
import api from '@/utils/axios/axios';

// ─── Design Tokens ───────────────────────────────────────────────────────────
// surface: #E7E5E4 | text: #1E2938 | primary: #006666
// success: #00A63D | warning: #FE9900 | danger: #FF2157
// outer card: 6px 6px 12px #cac8c7, -6px -6px 12px #ffffff
// inset input: inset 3px 3px 6px #cac8c7, inset -3px -3px 6px #ffffff

interface FaqTableProps {
    faqs: FAQ[];
    onRefresh: () => void;
}

const statusConfig = {
    approved: {
        label: 'Approved',
        icon: CheckCircle,
        text: 'text-[#00A63D]',
        bg: 'bg-[#00A63D]/10',
    },
    pending: {
        label: 'Pending',
        icon: Clock,
        text: 'text-[#FE9900]',
        bg: 'bg-[#FE9900]/10',
    },
    rejected: {
        label: 'Rejected',
        icon: XCircle,
        text: 'text-[#FF2157]',
        bg: 'bg-[#FF2157]/10',
    },
} as const;

const nmIconBtn =
    'inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#E7E5E4] text-[#1E2938]/60 ' +
    'shadow-[3px_3px_6px_#cac8c7,-3px_-3px_6px_#ffffff] ' +
    'hover:text-[#006666] ' +
    'active:shadow-[inset_2px_2px_5px_#cac8c7,inset_-2px_-2px_5px_#ffffff] ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006666] ' +
    'transition-shadow duration-150 select-none';

const nmInput =
    'h-9 w-[4.5rem] rounded-xl border-0 bg-[#E7E5E4] text-center ' +
    'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938] ' +
    'shadow-[inset_3px_3px_6px_#cac8c7,inset_-3px_-3px_6px_#ffffff] ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006666] ' +
    'disabled:opacity-50 transition-shadow duration-150';

export function FaqTable({ faqs, onRefresh }: FaqTableProps) {
    const { toggleFAQActive, updateFAQOrder } = useFAQStore();
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [selectedFaqId, setSelectedFaqId] = useState<string | null>(null);
    const [showVoteModal, setShowVoteModal] = useState(false);

    const handleToggleActive = async (faqId: string) => {
        await toggleFAQActive(faqId);
    };

    const handleOrderUpdate = async (faqId: string, currentOrder: number, newOrder: number) => {
        if (newOrder === currentOrder) return;
        if (isNaN(newOrder) || newOrder < 0) {
            showToast.error('Order must be a valid non-negative number');
            return;
        }
        setUpdatingOrderId(faqId);
        await updateFAQOrder(faqId, newOrder);
        setUpdatingOrderId(null);
    };

    const handleStatusChange = async (
        faqId: string,
        newStatus: 'approved' | 'pending' | 'rejected'
    ) => {
        try {
            const { data } = await api.put(`/mock/support/tour-faq/${faqId}/status`, {
                status: newStatus,
            });
            if (data.success) {
                showToast.success(`Status updated to ${newStatus}`);
                onRefresh();
            } else {
                throw new Error(data.message || 'Failed to update status');
            }
        } catch {
            showToast.error('Failed to update status');
        }
    };

    const handleViewVotes = (faqId: string) => {
        setSelectedFaqId(faqId);
        setShowVoteModal(true);
    };

    // ── Empty state ────────────────────────────────────────────────────────────
    if (faqs.length === 0) {
        return (
            <div
                className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-[#E7E5E4] py-16
                    shadow-[6px_6px_12px_#cac8c7,-6px_-6px_12px_#ffffff]"
                role="status"
                aria-live="polite"
            >
                <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7E5E4]
                        shadow-[inset_4px_4px_8px_#cac8c7,inset_-4px_-4px_8px_#ffffff]"
                    aria-hidden="true"
                >
                    <Clock className="h-6 w-6 text-[#1E2938]/30" />
                </div>
                <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50">
                    No FAQs found. Try adjusting your filters.
                </p>
            </div>
        );
    }

    // ── Table ──────────────────────────────────────────────────────────────────
    return (
        <>
            <div
                className="overflow-hidden rounded-2xl bg-[#E7E5E4]
                    shadow-[6px_6px_12px_#cac8c7,-6px_-6px_12px_#ffffff]"
            >
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-[#1E2938]/8 bg-[#E7E5E4]/60">
                                {['Order', 'Question', 'Tour', 'Status', 'Active', 'Likes / Dislikes', 'Actions'].map(
                                    (col) => (
                                        <TableHead
                                            key={col}
                                            className="font-[family-name:var(--font-space-mono)] text-[11px] font-bold uppercase tracking-widest text-[#1E2938]/50"
                                        >
                                            {col}
                                        </TableHead>
                                    )
                                )}
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {faqs.map((faq, index) => {
                                const cfg = statusConfig[faq.status] ?? statusConfig.pending;
                                const StatusIcon = cfg.icon;

                                const nextStatus = (
                                    { approved: 'pending', pending: 'rejected', rejected: 'approved' } as const
                                )[faq.status];

                                return (
                                    <motion.tr
                                        key={faq._id}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.025, duration: 0.2 }}
                                        className="border-b border-[#1E2938]/5 transition-colors hover:bg-[#1E2938]/[0.025]"
                                    >
                                        {/* Order */}
                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    defaultValue={faq.order}
                                                    min={0}
                                                    className={nmInput}
                                                    onBlur={(e) =>
                                                        handleOrderUpdate(
                                                            faq._id,
                                                            faq.order,
                                                            parseInt(e.target.value, 10)
                                                        )
                                                    }
                                                    disabled={updatingOrderId === faq._id}
                                                    aria-label={`Display order for FAQ: ${faq.question}`}
                                                />
                                                {updatingOrderId === faq._id && (
                                                    <RefreshCw
                                                        className="h-3.5 w-3.5 animate-spin text-[#006666]"
                                                        aria-label="Updating order…"
                                                    />
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Question + answer preview */}
                                        <TableCell className="max-w-xs py-3">
                                            <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm font-medium text-[#1E2938] line-clamp-2">
                                                {faq.question}
                                            </p>
                                            {faq.answer && (
                                                <p className="mt-0.5 font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50 line-clamp-1">
                                                    {faq.answer}
                                                </p>
                                            )}
                                        </TableCell>

                                        {/* Tour */}
                                        <TableCell className="py-3">
                                            <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/70">
                                                {typeof faq.tour === 'string'
                                                    ? faq.tour
                                                    : faq.tour?.title}
                                            </span>
                                        </TableCell>

                                        {/* Status badge + cycle button */}
                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1
                                                        font-[family-name:var(--font-jetbrains-mono)] text-xs font-medium
                                                        ${cfg.bg} ${cfg.text}
                                                        shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06),inset_-1px_-1px_3px_rgba(255,255,255,0.6)]`}
                                                >
                                                    <StatusIcon className="h-3 w-3" aria-hidden="true" />
                                                    {cfg.label}
                                                </span>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                type="button"
                                                                className={nmIconBtn}
                                                                onClick={() =>
                                                                    handleStatusChange(faq._id, nextStatus)
                                                                }
                                                                aria-label={`Change status (currently ${faq.status})`}
                                                            >
                                                                <RefreshCw className="h-3 w-3" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="font-[family-name:var(--font-jetbrains-mono)] text-xs">
                                                            Cycle status
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </TableCell>

                                        {/* Active toggle */}
                                        <TableCell className="py-3">
                                            <Switch
                                                checked={faq.isActive}
                                                onCheckedChange={() => handleToggleActive(faq._id)}
                                                className="data-[state=checked]:bg-[#006666]"
                                                aria-label={`${faq.isActive ? 'Deactivate' : 'Activate'} FAQ`}
                                            />
                                        </TableCell>

                                        {/* Likes / Dislikes */}
                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleViewVotes(faq._id)}
                                                    className="flex items-center gap-1.5 rounded-lg px-2 py-1
                                                        font-[family-name:var(--font-jetbrains-mono)] text-xs font-medium
                                                        text-[#006666] transition-colors hover:bg-[#006666]/10
                                                        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]"
                                                    aria-label={`View ${faq.likeCount} likes`}
                                                >
                                                    <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
                                                    {faq.likeCount}
                                                </button>
                                                <span
                                                    className="flex items-center gap-1.5 font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40"
                                                    aria-label={`${faq.dislikeCount} dislikes`}
                                                >
                                                    <ThumbsDown className="h-3.5 w-3.5" aria-hidden="true" />
                                                    {faq.dislikeCount}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="py-3">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className={nmIconBtn}
                                                            onClick={() => handleViewVotes(faq._id)}
                                                            aria-label="View vote details"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="font-[family-name:var(--font-jetbrains-mono)] text-xs">
                                                        View votes
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                    </motion.tr>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <VoteModal
                open={showVoteModal}
                onOpenChange={setShowVoteModal}
                faqId={selectedFaqId}
                faqQuestion={faqs.find((f) => f._id === selectedFaqId)?.question}
            />
        </>
    );
}