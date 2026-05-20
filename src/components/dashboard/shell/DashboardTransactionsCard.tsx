'use client';

import { format } from 'date-fns';
import { CreditCard, Hash, Loader2, RefreshCw, Wallet, Zap, Clock, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Transaction } from '@/types/dashboard/dashboard.type';
import { BOOKING_PAYMENT_STATUS } from '@/constants/tour/tour-booking.const';
import { cn } from '@/lib/utils';
import { TransactionsBootSkeleton } from '@/components/dashboard/shell/loadings/TransactionsBootSkeleton';

const brand = {
    primary: '#006666',
    success: '#00A63D',
    surface: '#E7E5E4',
    text: '#1E2938',
    muted: '#6B7A8D',
    shadowOut: '6px 6px 12px #c8c6c4, -6px -6px 12px #ffffff',
    shadowIn: 'inset 3px 3px 6px #c8c6c4, inset -3px -3px 6px #ffffff',
    border: 'rgba(0,102,102,0.10)',
};

type DashboardTransactionsCardProps = {
    transactions: Transaction[];
    hasMore: boolean;
    isLoadingMore: boolean;
    isInitialDashboardLoad?: boolean;
    onLoadMore: () => void;
};

function Th({ icon: Icon, children }: { icon?: React.ElementType; children: React.ReactNode }) {
    return (
        <th className="p-3 text-left">
            <span
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
                style={{ color: brand.muted, fontFamily: 'var(--font-space-mono)' }}
            >
                {Icon && <Icon className="h-3 w-3 opacity-70" aria-hidden />}
                {children}
            </span>
        </th>
    );
}

export function DashboardTransactionsCard({
    transactions,
    hasMore,
    isLoadingMore,
    isInitialDashboardLoad,
    onLoadMore,
}: DashboardTransactionsCardProps) {
    return (
        <div
            className="relative overflow-hidden rounded-2xl"
            style={{
                background: brand.surface,
                boxShadow: brand.shadowOut,
                border: `1px solid ${brand.border}`,
            }}
        >
            {/* Teal top accent */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
                style={{ background: `linear-gradient(90deg, ${brand.primary}, #00a8a8, #00d4aa)` }}
                aria-hidden
            />

            {/* Card header */}
            <div
                className="flex flex-col gap-1 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                style={{
                    borderColor: 'rgba(0,102,102,0.1)',
                    background: 'rgba(0,102,102,0.03)',
                }}
            >
                <div className="flex items-start gap-3">
                    <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl"
                        style={{ background: 'rgba(0,102,102,0.1)', boxShadow: brand.shadowIn }}
                    >
                        <CreditCard className="h-4 w-4" style={{ color: brand.primary }} />
                    </div>
                    <div>
                        <p
                            className="text-sm font-bold"
                            style={{ color: brand.text, fontFamily: 'var(--font-space-mono)' }}
                        >
                            Transactions
                        </p>
                        <p
                            className="text-[10px]"
                            style={{ color: brand.muted, fontFamily: 'var(--font-jetbrains-mono)' }}
                        >
                            Payments and refunds (cursor pagination)
                        </p>
                    </div>
                </div>
            </div>

            {/* Card body */}
            <div className="space-y-4 p-4 sm:p-5">
                {isInitialDashboardLoad ? (
                    <TransactionsBootSkeleton />
                ) : transactions.length === 0 && !isLoadingMore ? (
                    <div
                        className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed px-6 py-8 text-center"
                        style={{
                            borderColor: 'rgba(0,102,102,0.2)',
                            background: 'rgba(0,102,102,0.03)',
                        }}
                    >
                        <p className="text-xs" style={{ color: brand.muted, fontFamily: 'var(--font-jetbrains-mono)' }}>
                            No transactions for this range yet.
                        </p>
                    </div>
                ) : (
                    <ScrollArea
                        className="h-[min(360px,45vh)] rounded-xl"
                        style={{
                            border: `1px solid rgba(0,102,102,0.12)`,
                            boxShadow: brand.shadowIn,
                        }}
                    >
                        <table className="w-full min-w-[640px] text-sm">
                            <thead
                                className="sticky top-0 z-10"
                                style={{
                                    background: '#E7E5E4',
                                    borderBottom: '1px solid rgba(0,102,102,0.1)',
                                }}
                            >
                                <tr>
                                    <Th icon={Hash}>Booking</Th>
                                    <Th icon={Wallet}>Amount</Th>
                                    <Th icon={Zap}>Method</Th>
                                    <Th icon={Activity}>Status</Th>
                                    <Th icon={Clock}>Recorded</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr
                                        key={tx._id}
                                        className="transition-colors"
                                        style={{ borderBottom: '1px solid rgba(0,102,102,0.06)' }}
                                    >
                                        <td
                                            className="p-3 text-xs"
                                            style={{ color: brand.muted, fontFamily: 'var(--font-jetbrains-mono)' }}
                                        >
                                            {tx.bookingReference}
                                        </td>
                                        <td
                                            className="p-3 text-sm font-semibold"
                                            style={{ color: brand.text, fontFamily: 'var(--font-space-mono)' }}
                                        >
                                            {tx.amount} {tx.currency}
                                        </td>
                                        <td
                                            className="p-3 text-xs capitalize"
                                            style={{ color: brand.muted, fontFamily: 'var(--font-jetbrains-mono)' }}
                                        >
                                            {tx.method.replace(/_/g, ' ')}
                                        </td>
                                        <td className="p-3">
                                            <span
                                                className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                                                style={
                                                    tx.status === BOOKING_PAYMENT_STATUS.PAID
                                                        ? {
                                                            background: 'rgba(0,166,61,0.12)',
                                                            color: brand.success,
                                                            fontFamily: 'var(--font-space-mono)',
                                                            boxShadow: 'inset 1px 1px 3px rgba(0,166,61,0.15)',
                                                        }
                                                        : {
                                                            background: 'rgba(107,122,141,0.12)',
                                                            color: brand.muted,
                                                            fontFamily: 'var(--font-space-mono)',
                                                            boxShadow: brand.shadowIn,
                                                        }
                                                }
                                            >
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td
                                            className="p-3 text-xs"
                                            style={{ color: brand.muted, fontFamily: 'var(--font-jetbrains-mono)' }}
                                        >
                                            {format(new Date(tx.createdAt), 'MMM d, yyyy p')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </ScrollArea>
                )}

                {hasMore && (
                    <div className="flex justify-center">
                        <button
                            onClick={onLoadMore}
                            disabled={isLoadingMore || isInitialDashboardLoad}
                            className="flex h-10 items-center gap-2 rounded-full px-8 text-xs font-bold transition-all disabled:opacity-50"
                            style={{
                                background: brand.surface,
                                boxShadow: brand.shadowOut,
                                border: `1px solid ${brand.border}`,
                                color: brand.primary,
                                fontFamily: 'var(--font-space-mono)',
                                letterSpacing: '0.05em',
                            }}
                        >
                            {isLoadingMore ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: brand.muted }} />
                            ) : (
                                <RefreshCw className="h-3.5 w-3.5" style={{ color: brand.primary }} />
                            )}
                            Load more
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}