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
import {
    CalendarIcon,
    ChevronDown,
    Briefcase,
    CalendarCheck2,
    Star,
    AlertTriangle,
    Users2,
    Play,
    MessageSquare,
    RotateCcw,
    Hash,
    Tag,
    Activity,
    DollarSign,
    Clock,
    Mail,
    Wallet,
    ThumbsUp,
    Layers,
    UserCheck,
    ArrowUpDown,
    FileText,
    Flag,
    Map,
    HelpCircle,
} from 'lucide-react';

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
        <div className="mb-4 flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3 dark:border-slate-700/50 dark:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Date range for this tab&apos;s API</p>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 justify-between gap-2 rounded-xl border-slate-200 bg-white/90 shadow-sm hover:bg-white dark:border-slate-600 dark:bg-slate-700/80"
                        disabled={disabled}
                    >
                        <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                            {range.from && range.to ? (
                                <>
                                    {format(range.from, 'MMM d, y')} — {format(range.to, 'MMM d, y')}
                                </>
                            ) : (
                                'Range'
                            )}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
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

// Shared table styles
const th = 'text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500';
const td = 'p-3 align-middle text-sm text-slate-700 dark:text-slate-300';
const row = 'border-b border-slate-100/80 transition-colors hover:bg-slate-50/70 dark:border-slate-700/50 dark:hover:bg-slate-800/50';

function Th({ icon: Icon, children }: { icon?: React.ElementType; children: React.ReactNode }) {
    return (
        <th className={cn(th, 'p-3')}>
            <span className="inline-flex items-center gap-1.5">
                {Icon && <Icon className="h-3.5 w-3.5 opacity-70" aria-hidden />}
                {children}
            </span>
        </th>
    );
}

const TAB_CONFIG = [
    { value: 'tours', label: 'Tours', icon: Briefcase },
    { value: 'bookings', label: 'Bookings', icon: CalendarCheck2 },
    { value: 'reviews', label: 'Reviews', icon: Star },
    { value: 'reports', label: 'Reports', icon: AlertTriangle },
    { value: 'employees', label: 'Team', icon: Users2 },
    { value: 'running', label: 'Running', icon: Play },
    { value: 'faqs', label: 'FAQs', icon: HelpCircle },
    { value: 'refunds', label: 'Refunds', icon: RotateCcw },
] as const;

export function DashboardDataTabs({
    data,
    activeTab,
    onTabChange,
    tabDateRange,
    onTabDateRangeChange,
    isTabLoading,
}: DashboardDataTabsProps) {
    return (
        <Card className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/60 to-slate-100/40 shadow-md shadow-slate-200/50 dark:border-slate-700/60 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900/60 dark:shadow-slate-900/40">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/10" aria-hidden />

            <CardHeader className="border-b border-slate-100 bg-slate-50/60 dark:border-slate-700/50 dark:bg-slate-800/40">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-50">Datasets</CardTitle>
                <CardDescription className="text-xs text-slate-400 dark:text-slate-500">
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
                        <TabsList className="mb-4 inline-flex h-auto w-max gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/60 p-1 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/60">
                            {TAB_CONFIG.map(({ value, label, icon: Icon }) => (
                                <TabsTrigger
                                    key={value}
                                    value={value}
                                    className={cn(
                                        'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 transition-all',
                                        'data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm',
                                        'dark:text-slate-400 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-slate-50',
                                        'sm:text-sm',
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5" aria-hidden />
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

                    {/* Tours */}
                    <TabsContent value="tours" className="mt-0 focus-visible:outline-none">
                        {isTabLoading('tours') ? (
                            <DataTableSkeleton columns={5} rows={10} />
                        ) : (
                            <TableShell empty={!data.tours.length} emptyLabel="No tours for this range.">
                                <table className="w-full min-w-[720px] text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-700/50 dark:bg-slate-800/50">
                                            <Th icon={Briefcase}>Title</Th>
                                            <Th icon={Hash}>Code</Th>
                                            <Th icon={Activity}>Status</Th>
                                            <Th icon={DollarSign}>Price</Th>
                                            <Th icon={Clock}>Created</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.tours.map((tour) => (
                                            <tr key={tour._id} className={row}>
                                                <td className={cn(td, 'max-w-[220px] truncate font-semibold text-slate-900 dark:text-slate-100')}>
                                                    {tour.title}
                                                </td>
                                                <td className={cn(td, 'font-mono text-xs text-slate-400')}>
                                                    {tour.uniqueTourCode}
                                                </td>
                                                <td className={td}>
                                                    <Badge variant="secondary" className="capitalize bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                                        {tour.status}
                                                    </Badge>
                                                </td>
                                                <td className={td}>
                                                    {tour.basePrice.amount} {tour.basePrice.currency}
                                                </td>
                                                <td className={cn(td, 'text-slate-400 dark:text-slate-500')}>
                                                    {format(new Date(tour.createdAt), 'MMM d, yyyy')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </TableShell>
                        )}
                    </TabsContent>

                    {/* Bookings */}
                    <TabsContent value="bookings" className="mt-0 focus-visible:outline-none">
                        {isTabLoading('bookings') ? (
                            <DataTableSkeleton columns={7} rows={10} />
                        ) : (
                            <TableShell empty={!data.bookings.length} emptyLabel="No bookings for this range.">
                                <table className="w-full min-w-[860px] text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-700/50 dark:bg-slate-800/50">
                                            <Th icon={Hash}>Reference</Th>
                                            <Th icon={Map}>Tour</Th>
                                            <Th icon={UserCheck}>Traveler</Th>
                                            <Th icon={Users2}>Guests</Th>
                                            <Th icon={Wallet}>Paid</Th>
                                            <Th icon={Activity}>Booking</Th>
                                            <Th icon={CalendarCheck2}>Payment</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.bookings.map((b) => (
                                            <tr key={b._id} className={row}>
                                                <td className={cn(td, 'font-mono text-xs text-slate-500')}>{b.bookingReference}</td>
                                                <td className={cn(td, 'max-w-[180px] truncate font-medium')}>{b.tour.title}</td>
                                                <td className={cn(td, 'max-w-[160px] truncate')}>{b.traveler.name}</td>
                                                <td className={td}>{b.totalParticipants}</td>
                                                <td className={cn(td, 'font-medium')}>
                                                    {b.totalPaid} {b.currency}
                                                </td>
                                                <td className={td}>
                                                    <Badge variant="outline" className="capitalize border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-300">
                                                        {b.status}
                                                    </Badge>
                                                </td>
                                                <td className={td}>
                                                    <Badge
                                                        variant={b.paymentStatus === BOOKING_PAYMENT_STATUS.PAID ? 'default' : 'secondary'}
                                                        className={cn(
                                                            'capitalize',
                                                            b.paymentStatus === BOOKING_PAYMENT_STATUS.PAID
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
                                                        )}
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

                    {/* Reviews */}
                    <TabsContent value="reviews" className="mt-0 focus-visible:outline-none">
                        {isTabLoading('reviews') ? (
                            <DataTableSkeleton columns={6} rows={10} />
                        ) : (
                            <TableShell empty={!data.reviews.length} emptyLabel="No reviews for this range.">
                                <table className="w-full min-w-[800px] text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-700/50 dark:bg-slate-800/50">
                                            <Th icon={Map}>Tour</Th>
                                            <Th icon={UserCheck}>Guest</Th>
                                            <Th icon={Star}>Rating</Th>
                                            <Th icon={ThumbsUp}>Approved</Th>
                                            <Th icon={MessageSquare}>Comment</Th>
                                            <Th icon={Clock}>Date</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.reviews.map((r) => (
                                            <tr key={r._id} className={row}>
                                                <td className={cn(td, 'max-w-[160px] truncate font-medium')}>{r.tour.title}</td>
                                                <td className={cn(td, 'max-w-[140px] truncate')}>{r.user.name}</td>
                                                <td className={td}>
                                                    <span className="inline-flex items-center gap-1">
                                                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                                                        {r.rating.toFixed(1)}
                                                    </span>
                                                </td>
                                                <td className={td}>
                                                    <Badge
                                                        variant={r.isApproved ? 'default' : 'secondary'}
                                                        className={cn(
                                                            r.isApproved
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                                                                : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
                                                        )}
                                                    >
                                                        {r.isApproved ? 'Yes' : 'No'}
                                                    </Badge>
                                                </td>
                                                <td className={cn(td, 'max-w-[280px] truncate text-slate-400 dark:text-slate-500')}>
                                                    {r.comment}
                                                </td>
                                                <td className={cn(td, 'text-slate-400 dark:text-slate-500')}>
                                                    {format(new Date(r.createdAt), 'MMM d, yyyy')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </TableShell>
                        )}
                    </TabsContent>

                    {/* Reports */}
                    <TabsContent value="reports" className="mt-0 focus-visible:outline-none">
                        {isTabLoading('reports') ? (
                            <DataTableSkeleton columns={6} rows={10} />
                        ) : (
                            <TableShell empty={!data.reports.length} emptyLabel="No reports for this range.">
                                <table className="w-full min-w-[820px] text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-700/50 dark:bg-slate-800/50">
                                            <Th icon={UserCheck}>Reporter</Th>
                                            <Th icon={Map}>Tour</Th>
                                            <Th icon={FileText}>Reason</Th>
                                            <Th icon={Flag}>Priority</Th>
                                            <Th icon={Activity}>Status</Th>
                                            <Th icon={Clock}>Date</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.reports.map((r) => (
                                            <tr key={r._id} className={row}>
                                                <td className={cn(td, 'max-w-[140px] truncate font-medium')}>{r.reporter.name}</td>
                                                <td className={cn(td, 'max-w-[160px] truncate')}>{r.tour.title}</td>
                                                <td className={cn(td, 'max-w-[120px] truncate text-slate-500')}>{r.reason}</td>
                                                <td className={td}>
                                                    <Badge variant="outline" className="border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-300">
                                                        {r.priority}
                                                    </Badge>
                                                </td>
                                                <td className={td}>
                                                    <Badge variant="secondary" className="capitalize bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                                        {r.status.replace(/_/g, ' ')}
                                                    </Badge>
                                                </td>
                                                <td className={cn(td, 'text-slate-400 dark:text-slate-500')}>
                                                    {format(new Date(r.createdAt), 'MMM d, yyyy')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </TableShell>
                        )}
                    </TabsContent>

                    {/* Employees */}
                    <TabsContent value="employees" className="mt-0 focus-visible:outline-none">
                        {isTabLoading('employees') ? (
                            <DataTableSkeleton columns={5} rows={10} />
                        ) : (
                            <TableShell empty={!data.employees.length} emptyLabel="No employees for this range.">
                                <table className="w-full min-w-[720px] text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-700/50 dark:bg-slate-800/50">
                                            <Th icon={UserCheck}>Name</Th>
                                            <Th icon={Mail}>Email</Th>
                                            <Th icon={Activity}>Status</Th>
                                            <Th icon={Wallet}>Salary</Th>
                                            <Th icon={Clock}>Joined</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.employees.map((e) => (
                                            <tr key={e._id} className={row}>
                                                <td className={cn(td, 'font-semibold text-slate-900 dark:text-slate-100')}>{e.user.name}</td>
                                                <td className={cn(td, 'max-w-[200px] truncate text-slate-400 dark:text-slate-500')}>
                                                    {e.user.email}
                                                </td>
                                                <td className={td}>
                                                    <Badge variant="secondary" className="capitalize bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                                        {e.status}
                                                    </Badge>
                                                </td>
                                                <td className={cn(td, 'font-medium')}>
                                                    {e.salary} {e.currency}
                                                </td>
                                                <td className={cn(td, 'text-slate-400 dark:text-slate-500')}>
                                                    {format(new Date(e.dateOfJoining), 'MMM d, yyyy')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </TableShell>
                        )}
                    </TabsContent>

                    {/* Running Tours */}
                    <TabsContent value="running" className="mt-0 focus-visible:outline-none">
                        {isTabLoading('running') ? (
                            <DataTableSkeleton columns={5} rows={8} />
                        ) : (
                            <TableShell empty={!data.runningTours.length} emptyLabel="No active departures right now.">
                                <table className="w-full min-w-[760px] text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-700/50 dark:bg-slate-800/50">
                                            <Th icon={Map}>Tour</Th>
                                            <Th icon={Tag}>Slug</Th>
                                            <Th icon={Layers}>Seats</Th>
                                            <Th icon={CalendarCheck2}>Booked</Th>
                                            <Th icon={ArrowUpDown}>Window</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.runningTours.map((t) => (
                                            <tr key={t.tourId} className={row}>
                                                <td className={cn(td, 'max-w-[220px] truncate font-semibold text-slate-900 dark:text-slate-100')}>
                                                    {t.title}
                                                </td>
                                                <td className={cn(td, 'font-mono text-xs text-slate-400')}>{t.slug}</td>
                                                <td className={td}>{t.totalSeats}</td>
                                                <td className={td}>{t.currentBookings}</td>
                                                <td className={cn(td, 'text-slate-400 dark:text-slate-500')}>
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

                    {/* FAQs */}
                    <TabsContent value="faqs" className="mt-0 focus-visible:outline-none">
                        {isTabLoading('faqs') ? (
                            <DataTableSkeleton columns={5} rows={10} />
                        ) : (
                            <TableShell empty={!data.faqs.length} emptyLabel="No FAQs in this sample.">
                                <table className="w-full min-w-[780px] text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-700/50 dark:bg-slate-800/50">
                                            <Th icon={Map}>Tour</Th>
                                            <Th icon={HelpCircle}>Question</Th>
                                            <Th icon={Activity}>Status</Th>
                                            <Th icon={ThumbsUp}>Votes</Th>
                                            <Th icon={Clock}>Date</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.faqs.map((f) => (
                                            <tr key={f._id} className={row}>
                                                <td className={cn(td, 'max-w-[160px] truncate font-medium')}>{f.tour.title}</td>
                                                <td className={cn(td, 'max-w-[320px] truncate')}>{f.question}</td>
                                                <td className={td}>
                                                    <Badge variant="outline" className="capitalize border-slate-200 text-slate-600 dark:border-slate-600 dark:text-slate-300">
                                                        {f.status}
                                                    </Badge>
                                                </td>
                                                <td className={cn(td, 'text-slate-400 dark:text-slate-500')}>
                                                    +{f.likeCount} / −{f.dislikeCount}
                                                </td>
                                                <td className={cn(td, 'text-slate-400 dark:text-slate-500')}>
                                                    {format(new Date(f.createdAt), 'MMM d, yyyy')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </TableShell>
                        )}
                    </TabsContent>

                    {/* Refunds */}
                    <TabsContent value="refunds" className="mt-0 focus-visible:outline-none">
                        {isTabLoading('refunds') ? (
                            <DataTableSkeleton columns={5} rows={10} />
                        ) : (
                            <TableShell empty={!data.refunds.length} emptyLabel="No refunds in this sample.">
                                <table className="w-full min-w-[680px] text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-700/50 dark:bg-slate-800/50">
                                            <Th icon={Hash}>Booking</Th>
                                            <Th icon={Wallet}>Amount</Th>
                                            <Th icon={Activity}>Status</Th>
                                            <Th icon={Clock}>Requested</Th>
                                            <Th icon={CalendarCheck2}>Processed</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.refunds.map((r) => (
                                            <tr key={r._id} className={row}>
                                                <td className={cn(td, 'font-mono text-xs text-slate-500')}>{r.booking}</td>
                                                <td className={cn(td, 'font-medium')}>
                                                    {r.amount} {r.currency}
                                                </td>
                                                <td className={td}>
                                                    <Badge variant="secondary" className="capitalize bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                                        {r.status}
                                                    </Badge>
                                                </td>
                                                <td className={cn(td, 'text-slate-400 dark:text-slate-500')}>
                                                    {format(new Date(r.requestedAt), 'MMM d, yyyy')}
                                                </td>
                                                <td className={cn(td, 'text-slate-400 dark:text-slate-500')}>
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
            <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800/30 dark:text-slate-500">
                {emptyLabel}
            </div>
        );
    }
    return (
        <ScrollArea className="h-[min(440px,55vh)] rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <div className="min-w-0 p-1">{children}</div>
        </ScrollArea>
    );
}