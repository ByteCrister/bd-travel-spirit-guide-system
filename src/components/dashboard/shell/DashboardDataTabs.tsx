'use client';

import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { DataTableSkeleton } from '@/components/dashboard/shell/loadings/DataTableSkeleton';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { DashboardTablesData, DashboardTabId, DateRange } from '@/types/dashboard/dashboard.type';
import { BOOKING_PAYMENT_STATUS } from '@/constants/tour/tour-booking.const';
import { cn } from '@/lib/utils';

import { CalendarIcon, ChevronDown } from 'lucide-react';

type DashboardDataTabsProps = {
    data: DashboardTablesData;
    activeTab: DashboardTabId;
    onTabChange: (tab: DashboardTabId) => void;
    tabDateRange: DateRange;
    onTabDateRangeChange: (range: DateRange) => void;
    isTabLoading: (tab: DashboardTabId) => boolean;
};

function TabDateStrip({
    range,
    onChange,
    disabled,
}: {
    range: DateRange;
    onChange: (r: DateRange) => void;
    disabled?: boolean;
}) {
    return (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border bg-muted/15 px-3 py-3 sm:px-4">
            <p className="text-xs font-medium text-muted-foreground">Date range for this tab&apos;s API</p>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 justify-between gap-2 rounded-xl border-dashed"
                        disabled={disabled}
                    >
                        <CalendarIcon className="h-3.5 w-3.5 opacity-70" />
                        <span className="text-xs font-medium">
                            {range.from && range.to ? (
                                <>
                                    {format(range.from, 'MMM d, y')} — {format(range.to, 'MMM d, y')}
                                </>
                            ) : (
                                'Range'
                            )}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        mode="range"
                        selected={{ from: range.from, to: range.to }}
                        onSelect={(next) => {
                            if (next?.from && next?.to) onChange(next as DateRange);
                        }}
                        numberOfMonths={2}
                        disabled={(date) => date > new Date()}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

const th = 'text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground';
const td = 'p-3 align-middle text-sm';
const row = 'border-b border-border/60 transition-colors hover:bg-muted/30';

export function DashboardDataTabs({
    data,
    activeTab,
    onTabChange,
    tabDateRange,
    onTabDateRangeChange,
    isTabLoading,
}: DashboardDataTabsProps) {
    return (
        <Card className="overflow-hidden rounded-2xl border bg-card/80 shadow-sm backdrop-blur-sm">
            <CardHeader className="border-b bg-muted/20">
                <CardTitle className="text-lg">Datasets</CardTitle>
                <CardDescription>
                    Each tab loads its own slice from the API using the range below (independent from stats).
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-4 sm:p-4 sm:pt-6">
                <Tabs
                    value={activeTab}
                    onValueChange={(v) => onTabChange(v as DashboardTabId)}
                    className="w-full"
                >
                    <ScrollArea className="w-full whitespace-nowrap pb-2 sm:pb-0">
                        <TabsList className="mb-4 inline-flex h-auto w-max flex-wrap justify-start gap-1 rounded-2xl bg-muted/40 p-1">
                            {[
                                ['tours', 'Tours'],
                                ['bookings', 'Bookings'],
                                ['reviews', 'Reviews'],
                                ['reports', 'Reports'],
                                ['employees', 'Team'],
                                ['running', 'Running'],
                                ['faqs', 'FAQs'],
                                ['refunds', 'Refunds'],
                            ].map(([v, label]) => (
                                <TabsTrigger
                                    key={v}
                                    value={v}
                                    className="rounded-xl px-3 py-2 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm sm:text-sm"
                                >
                                    {label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </ScrollArea>

                    <TabDateStrip
                        range={tabDateRange}
                        onChange={onTabDateRangeChange}
                        disabled={isTabLoading(activeTab)}
                    />

                    <TabsContent value="tours" className="mt-0 focus-visible:outline-none">
                        {isTabLoading('tours') ? (
                            <DataTableSkeleton columns={5} rows={10} />
                        ) : (
                        <TableShell empty={!data.tours.length} emptyLabel="No tours for this range.">
                            <table className="w-full min-w-[720px] text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/30">
                                        <th className={cn(th, 'p-3')}>Title</th>
                                        <th className={cn(th, 'p-3')}>Code</th>
                                        <th className={cn(th, 'p-3')}>Status</th>
                                        <th className={cn(th, 'p-3')}>Price</th>
                                        <th className={cn(th, 'p-3')}>Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.tours.map((tour) => (
                                        <tr key={tour._id} className={row}>
                                            <td className={cn(td, 'max-w-[220px] truncate font-medium')}>
                                                {tour.title}
                                            </td>
                                            <td className={cn(td, 'font-mono text-xs text-muted-foreground')}>
                                                {tour.uniqueTourCode}
                                            </td>
                                            <td className={td}>
                                                <Badge variant="secondary" className="capitalize">
                                                    {tour.status}
                                                </Badge>
                                            </td>
                                            <td className={td}>
                                                {tour.basePrice.amount} {tour.basePrice.currency}
                                            </td>
                                            <td className={cn(td, 'text-muted-foreground')}>
                                                {format(new Date(tour.createdAt), 'MMM d, yyyy')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TableShell>
                        )}
                    </TabsContent>

                    <TabsContent value="bookings" className="mt-0 focus-visible:outline-none">
                        {isTabLoading('bookings') ? (
                            <DataTableSkeleton columns={7} rows={10} />
                        ) : (
                        <TableShell empty={!data.bookings.length} emptyLabel="No bookings for this range.">
                            <table className="w-full min-w-[860px] text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/30">
                                        <th className={cn(th, 'p-3')}>Reference</th>
                                        <th className={cn(th, 'p-3')}>Tour</th>
                                        <th className={cn(th, 'p-3')}>Traveler</th>
                                        <th className={cn(th, 'p-3')}>Guests</th>
                                        <th className={cn(th, 'p-3')}>Paid</th>
                                        <th className={cn(th, 'p-3')}>Booking</th>
                                        <th className={cn(th, 'p-3')}>Payment</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.bookings.map((b) => (
                                        <tr key={b._id} className={row}>
                                            <td className={cn(td, 'font-mono text-xs')}>{b.bookingReference}</td>
                                            <td className={cn(td, 'max-w-[180px] truncate')}>{b.tour.title}</td>
                                            <td className={cn(td, 'max-w-[160px] truncate')}>{b.traveler.name}</td>
                                            <td className={td}>{b.totalParticipants}</td>
                                            <td className={td}>
                                                {b.totalPaid} {b.currency}
                                            </td>
                                            <td className={td}>
                                                <Badge variant="outline" className="capitalize">
                                                    {b.status}
                                                </Badge>
                                            </td>
                                            <td className={td}>
                                                <Badge
                                                    variant={
                                                        b.paymentStatus === BOOKING_PAYMENT_STATUS.PAID
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                    className="capitalize"
                                                >
                                                    {b.paymentStatus}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TableShell>
                        )}
                    </TabsContent>

                    <TabsContent value="reviews" className="mt-0 focus-visible:outline-none">
                        {isTabLoading('reviews') ? (
                            <DataTableSkeleton columns={6} rows={10} />
                        ) : (
                        <TableShell empty={!data.reviews.length} emptyLabel="No reviews for this range.">
                            <table className="w-full min-w-[800px] text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/30">
                                        <th className={cn(th, 'p-3')}>Tour</th>
                                        <th className={cn(th, 'p-3')}>Guest</th>
                                        <th className={cn(th, 'p-3')}>Rating</th>
                                        <th className={cn(th, 'p-3')}>Approved</th>
                                        <th className={cn(th, 'p-3')}>Comment</th>
                                        <th className={cn(th, 'p-3')}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.reviews.map((r) => (
                                        <tr key={r._id} className={row}>
                                            <td className={cn(td, 'max-w-[160px] truncate')}>{r.tour.title}</td>
                                            <td className={cn(td, 'max-w-[140px] truncate')}>{r.user.name}</td>
                                            <td className={td}>{r.rating.toFixed(1)}</td>
                                            <td className={td}>
                                                <Badge variant={r.isApproved ? 'default' : 'secondary'}>
                                                    {r.isApproved ? 'Yes' : 'No'}
                                                </Badge>
                                            </td>
                                            <td className={cn(td, 'max-w-[280px] truncate text-muted-foreground')}>
                                                {r.comment}
                                            </td>
                                            <td className={cn(td, 'text-muted-foreground')}>
                                                {format(new Date(r.createdAt), 'MMM d, yyyy')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TableShell>
                        )}
                    </TabsContent>

                    <TabsContent value="reports" className="mt-0 focus-visible:outline-none">
                        {isTabLoading('reports') ? (
                            <DataTableSkeleton columns={6} rows={10} />
                        ) : (
                        <TableShell empty={!data.reports.length} emptyLabel="No reports for this range.">
                            <table className="w-full min-w-[820px] text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/30">
                                        <th className={cn(th, 'p-3')}>Reporter</th>
                                        <th className={cn(th, 'p-3')}>Tour</th>
                                        <th className={cn(th, 'p-3')}>Reason</th>
                                        <th className={cn(th, 'p-3')}>Priority</th>
                                        <th className={cn(th, 'p-3')}>Status</th>
                                        <th className={cn(th, 'p-3')}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.reports.map((r) => (
                                        <tr key={r._id} className={row}>
                                            <td className={cn(td, 'max-w-[140px] truncate')}>{r.reporter.name}</td>
                                            <td className={cn(td, 'max-w-[160px] truncate')}>{r.tour.title}</td>
                                            <td className={cn(td, 'max-w-[120px] truncate')}>{r.reason}</td>
                                            <td className={td}>
                                                <Badge variant="outline">{r.priority}</Badge>
                                            </td>
                                            <td className={td}>
                                                <Badge variant="secondary" className="capitalize">
                                                    {r.status.replace(/_/g, ' ')}
                                                </Badge>
                                            </td>
                                            <td className={cn(td, 'text-muted-foreground')}>
                                                {format(new Date(r.createdAt), 'MMM d, yyyy')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TableShell>
                        )}
                    </TabsContent>

                    <TabsContent value="employees" className="mt-0 focus-visible:outline-none">
                        {isTabLoading('employees') ? (
                            <DataTableSkeleton columns={5} rows={10} />
                        ) : (
                        <TableShell empty={!data.employees.length} emptyLabel="No employees for this range.">
                            <table className="w-full min-w-[720px] text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/30">
                                        <th className={cn(th, 'p-3')}>Name</th>
                                        <th className={cn(th, 'p-3')}>Email</th>
                                        <th className={cn(th, 'p-3')}>Status</th>
                                        <th className={cn(th, 'p-3')}>Salary</th>
                                        <th className={cn(th, 'p-3')}>Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.employees.map((e) => (
                                        <tr key={e._id} className={row}>
                                            <td className={cn(td, 'font-medium')}>{e.user.name}</td>
                                            <td className={cn(td, 'max-w-[200px] truncate text-muted-foreground')}>
                                                {e.user.email}
                                            </td>
                                            <td className={td}>
                                                <Badge variant="secondary" className="capitalize">
                                                    {e.status}
                                                </Badge>
                                            </td>
                                            <td className={td}>
                                                {e.salary} {e.currency}
                                            </td>
                                            <td className={cn(td, 'text-muted-foreground')}>
                                                {format(new Date(e.dateOfJoining), 'MMM d, yyyy')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TableShell>
                        )}
                    </TabsContent>

                    <TabsContent value="running" className="mt-0 focus-visible:outline-none">
                        {isTabLoading('running') ? (
                            <DataTableSkeleton columns={5} rows={8} />
                        ) : (
                        <TableShell empty={!data.runningTours.length} emptyLabel="No active departures right now.">
                            <table className="w-full min-w-[760px] text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/30">
                                        <th className={cn(th, 'p-3')}>Tour</th>
                                        <th className={cn(th, 'p-3')}>Slug</th>
                                        <th className={cn(th, 'p-3')}>Seats</th>
                                        <th className={cn(th, 'p-3')}>Booked</th>
                                        <th className={cn(th, 'p-3')}>Window</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.runningTours.map((t) => (
                                        <tr key={t.tourId} className={row}>
                                            <td className={cn(td, 'max-w-[220px] truncate font-medium')}>
                                                {t.title}
                                            </td>
                                            <td className={cn(td, 'font-mono text-xs text-muted-foreground')}>
                                                {t.slug}
                                            </td>
                                            <td className={td}>{t.totalSeats}</td>
                                            <td className={td}>{t.currentBookings}</td>
                                            <td className={cn(td, 'text-muted-foreground')}>
                                                {format(new Date(t.windowStart), 'MMM d')} —{' '}
                                                {format(new Date(t.windowEnd), 'MMM d, yyyy')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TableShell>
                        )}
                    </TabsContent>

                    <TabsContent value="faqs" className="mt-0 focus-visible:outline-none">
                        {isTabLoading('faqs') ? (
                            <DataTableSkeleton columns={5} rows={10} />
                        ) : (
                        <TableShell empty={!data.faqs.length} emptyLabel="No FAQs in this sample.">
                            <table className="w-full min-w-[780px] text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/30">
                                        <th className={cn(th, 'p-3')}>Tour</th>
                                        <th className={cn(th, 'p-3')}>Question</th>
                                        <th className={cn(th, 'p-3')}>Status</th>
                                        <th className={cn(th, 'p-3')}>Votes</th>
                                        <th className={cn(th, 'p-3')}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.faqs.map((f) => (
                                        <tr key={f._id} className={row}>
                                            <td className={cn(td, 'max-w-[160px] truncate')}>{f.tour.title}</td>
                                            <td className={cn(td, 'max-w-[320px] truncate')}>{f.question}</td>
                                            <td className={td}>
                                                <Badge variant="outline" className="capitalize">
                                                    {f.status}
                                                </Badge>
                                            </td>
                                            <td className={cn(td, 'text-muted-foreground')}>
                                                +{f.likeCount} / −{f.dislikeCount}
                                            </td>
                                            <td className={cn(td, 'text-muted-foreground')}>
                                                {format(new Date(f.createdAt), 'MMM d, yyyy')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TableShell>
                        )}
                    </TabsContent>

                    <TabsContent value="refunds" className="mt-0 focus-visible:outline-none">
                        {isTabLoading('refunds') ? (
                            <DataTableSkeleton columns={5} rows={10} />
                        ) : (
                        <TableShell empty={!data.refunds.length} emptyLabel="No refunds in this sample.">
                            <table className="w-full min-w-[680px] text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/30">
                                        <th className={cn(th, 'p-3')}>Booking</th>
                                        <th className={cn(th, 'p-3')}>Amount</th>
                                        <th className={cn(th, 'p-3')}>Status</th>
                                        <th className={cn(th, 'p-3')}>Requested</th>
                                        <th className={cn(th, 'p-3')}>Processed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.refunds.map((r) => (
                                        <tr key={r._id} className={row}>
                                            <td className={cn(td, 'font-mono text-xs')}>{r.booking}</td>
                                            <td className={td}>
                                                {r.amount} {r.currency}
                                            </td>
                                            <td className={td}>
                                                <Badge variant="secondary" className="capitalize">
                                                    {r.status}
                                                </Badge>
                                            </td>
                                            <td className={cn(td, 'text-muted-foreground')}>
                                                {format(new Date(r.requestedAt), 'MMM d, yyyy')}
                                            </td>
                                            <td className={cn(td, 'text-muted-foreground')}>
                                                {r.processedAt
                                                    ? format(new Date(r.processedAt), 'MMM d, yyyy')
                                                    : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TableShell>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

function TableShell({
    children,
    empty,
    emptyLabel,
}: {
    children: React.ReactNode;
    empty: boolean;
    emptyLabel: string;
}) {
    if (empty) {
        return (
            <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed bg-muted/15 p-8 text-center text-sm text-muted-foreground">
                {emptyLabel}
            </div>
        );
    }
    return (
        <ScrollArea className="h-[min(440px,55vh)] rounded-xl border border-border/60">
            <div className="min-w-0 p-1">{children}</div>
        </ScrollArea>
    );
}
