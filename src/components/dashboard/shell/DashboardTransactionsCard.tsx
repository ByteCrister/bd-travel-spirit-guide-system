'use client';

import { format } from 'date-fns';
import { CreditCard, Loader2, RefreshCw } from 'lucide-react';
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

export function DashboardTransactionsCard({
    transactions,
    hasMore,
    isLoadingMore,
    isInitialDashboardLoad,
    onLoadMore,
}: DashboardTransactionsCardProps) {
    return (
        <Card className="overflow-hidden rounded-2xl border bg-card/80 shadow-sm backdrop-blur-sm">
            <CardHeader className="flex flex-col gap-1 border-b bg-muted/20 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Transactions</CardTitle>
                        <CardDescription>Payments and refunds (cursor pagination)</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
                {isInitialDashboardLoad ? (
                    <TransactionsBootSkeleton />
                ) : transactions.length === 0 && !isLoadingMore ? (
                    <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed bg-muted/15 p-6 text-center text-sm text-muted-foreground">
                        No transactions for this range yet.
                    </div>
                ) : (
                    <ScrollArea className="h-[min(360px,45vh)] rounded-xl border border-border/60">
                        <table className="w-full min-w-[640px] text-sm">
                            <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
                                <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                                    <th className="p-3 text-left font-semibold">Booking</th>
                                    <th className="p-3 text-left font-semibold">Amount</th>
                                    <th className="p-3 text-left font-semibold">Method</th>
                                    <th className="p-3 text-left font-semibold">Status</th>
                                    <th className="p-3 text-left font-semibold">Recorded</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr
                                        key={tx._id}
                                        className="border-b border-border/60 transition-colors hover:bg-muted/30"
                                    >
                                        <td className="p-3 font-mono text-xs">{tx.bookingReference}</td>
                                        <td className="p-3 font-medium">
                                            {tx.amount} {tx.currency}
                                        </td>
                                        <td className={cn('p-3 capitalize text-muted-foreground')}>
                                            {tx.method.replace(/_/g, ' ')}
                                        </td>
                                        <td className="p-3">
                                            <Badge
                                                variant={
                                                    tx.status === BOOKING_PAYMENT_STATUS.PAID
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                                className="capitalize"
                                            >
                                                {tx.status}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-muted-foreground">
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
                            className="rounded-full px-8"
                            onClick={onLoadMore}
                            disabled={isLoadingMore || isInitialDashboardLoad}
                        >
                            {isLoadingMore ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            Load more
                        </Button>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
