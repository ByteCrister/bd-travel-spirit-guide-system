'use client';

import { format } from 'date-fns';
import { CreditCard, Hash, Loader2, RefreshCw, Wallet, Zap, Clock, Activity } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Transaction } from '@/types/dashboard/dashboard.type';
import { BOOKING_PAYMENT_STATUS } from '@/constants/tour/tour-booking.const';
import { cn } from '@/lib/utils';
import { TransactionsBootSkeleton } from '@/components/dashboard/shell/loadings/TransactionsBootSkeleton';

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
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {Icon && <Icon className="h-3.5 w-3.5 opacity-70" aria-hidden />}
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
        <Card className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/60 to-slate-100/40 shadow-md shadow-slate-200/50 dark:border-slate-700/60 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900/60 dark:shadow-slate-900/40">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/10" aria-hidden />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-300 opacity-70" aria-hidden />

            <CardHeader className="flex flex-col gap-1 border-b border-slate-100 bg-slate-50/60 dark:border-slate-700/50 dark:bg-slate-800/40 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
                        <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-50">Transactions</CardTitle>
                        <CardDescription className="text-xs text-slate-400 dark:text-slate-500">
                            Payments and refunds (cursor pagination)
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 p-4 sm:p-6">
                {isInitialDashboardLoad ? (
                    <TransactionsBootSkeleton />
                ) : transactions.length === 0 && !isLoadingMore ? (
                    <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800/30 dark:text-slate-500">
                        No transactions for this range yet.
                    </div>
                ) : (
                    <ScrollArea className="h-[min(360px,45vh)] rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                        <table className="w-full min-w-[640px] text-sm">
                            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-slate-800/95">
                                <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-700/50 dark:bg-slate-800/80">
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
                                        className="border-b border-slate-100/80 transition-colors hover:bg-slate-50/70 dark:border-slate-700/50 dark:hover:bg-slate-800/50"
                                    >
                                        <td className="p-3 font-mono text-xs text-slate-500">{tx.bookingReference}</td>
                                        <td className="p-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            {tx.amount} {tx.currency}
                                        </td>
                                        <td className="p-3 text-sm capitalize text-slate-500 dark:text-slate-400">
                                            {tx.method.replace(/_/g, ' ')}
                                        </td>
                                        <td className="p-3">
                                            <Badge
                                                className={cn(
                                                    'capitalize',
                                                    tx.status === BOOKING_PAYMENT_STATUS.PAID
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
                                                )}
                                            >
                                                {tx.status}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-sm text-slate-400 dark:text-slate-500">
                                            {format(new Date(tx.createdAt), 'MMM d, yyyy p')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </ScrollArea>
                )}

                {hasMore ? (
                    <div className="flex justify-center">
                        <Button
                            variant="outline"
                            className="rounded-full border-slate-200 bg-white/80 px-8 shadow-sm hover:bg-white hover:shadow-md dark:border-slate-600 dark:bg-slate-700/80 dark:hover:bg-slate-700"
                            onClick={onLoadMore}
                            disabled={isLoadingMore || isInitialDashboardLoad}
                        >
                            {isLoadingMore ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin text-slate-500" />
                            ) : (
                                <RefreshCw className="mr-2 h-4 w-4 text-slate-500" />
                            )}
                            <span className="text-slate-700 dark:text-slate-200">Load more</span>
                        </Button>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}