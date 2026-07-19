'use client';

import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { DataTableSkeleton } from '@/components/dashboard/shell/loadings/DataTableSkeleton';
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

const brand = {
    primary: '#006666',
    success: '#00A63D',
    warning: '#FE9900',
    danger: '#FF2157',
    surface: '#E7E5E4',
    secondary: '#F1F2F5',
    text: '#1E2938',
    muted: '#6B7A8D',
    shadowOut: '5px 5px 10px #c8c6c4, -5px -5px 10px #ffffff',
    shadowIn: 'inset 3px 3px 6px #c8c6c4, inset -3px -3px 6px #ffffff',
    border: 'rgba(0,102,102,0.10)',
};

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
        <div
            className="mb-4 flex flex-col gap-2 rounded-xl px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
            style={{
                background: 'rgba(0,102,102,0.04)',
                boxShadow: brand.shadowIn,
                border: `1px solid ${brand.border}`,
            }}
        >
            <p
                className="text-[10px] font-medium"
                style={{ color: brand.muted, fontFamily: 'var(--font-jetbrains-mono)' }}
            >
                Date range for this tab&apos;s API
            </p>
            <Popover>
                <PopoverTrigger asChild>
                    <button
                        className="flex h-9 items-center justify-between gap-2 rounded-xl px-3 text-xs transition-all disabled:opacity-50"
                        disabled={disabled}
                        style={{
                            background: brand.surface,
                            boxShadow: brand.shadowOut,
                            border: `1px solid ${brand.border}`,
                            color: brand.text,
                            fontFamily: 'var(--font-jetbrains-mono)',
                        }}
                    >
                        <CalendarIcon className="h-3 w-3" style={{ color: brand.primary }} />
                        <span className="font-medium">
                            {range.from && range.to ? (
                                <>
                                    {format(range.from, 'MMM d, y')} — {format(range.to, 'MMM d, y')}
                                </>
                            ) : (
                                'Range'
                            )}
                        </span>
                        <ChevronDown className="h-3 w-3" style={{ color: brand.muted }} />
                    </button>
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

// Shared table cell helpers
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

const tdBase: React.CSSProperties = {
    padding: '10px 12px',
    verticalAlign: 'middle',
    fontSize: '12px',
    color: brand.text,
    fontFamily: 'var(--font-jetbrains-mono)',
};

const tdMuted: React.CSSProperties = { ...tdBase, color: brand.muted };

// Status badge helper
function StatusBadge({ label, color }: { label: string; color?: string }) {
    const c = color ?? brand.muted;
    return (
        <span
            className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{
                background: `${c}18`,
                color: c,
                fontFamily: 'var(--font-space-mono)',
                boxShadow: brand.shadowIn,
            }}
        >
            {label}
        </span>
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
        <div
            className="relative overflow-hidden rounded-2xl"
            style={{
                background: brand.surface,
                boxShadow: brand.shadowOut,
                border: `1px solid ${brand.border}`,
            }}
        >
            {/* Header */}
            <div
                className="border-b px-5 py-4"
                style={{
                    borderColor: 'rgba(0,102,102,0.1)',
                    background: 'rgba(0,102,102,0.03)',
                }}
            >
                <p
                    className="text-sm font-bold"
                    style={{ color: brand.text, fontFamily: 'var(--font-space-mono)' }}
                >
                    Datasets
                </p>
                <p
                    className="mt-0.5 text-[10px]"
                    style={{ color: brand.muted, fontFamily: 'var(--font-jetbrains-mono)' }}
                >
                    Each tab loads its own slice from the API using the range below (independent from stats).
                </p>
            </div>

            {/* Tabs */}
            <div className="p-4 sm:p-5">
                <Tabs
                    value={activeTab}
                    onValueChange={(v) => onTabChange(v as DashboardTabId)}
                    className="w-full"
                >
                    {/* Tab list */}
                    <ScrollArea className="w-full whitespace-nowrap pb-2 sm:pb-0">
                        <div
                            className="mb-4 inline-flex h-auto w-max gap-1 rounded-2xl p-1"
                            style={{
                                background: brand.surface,
                                boxShadow: brand.shadowIn,
                                border: `1px solid ${brand.border}`,
                            }}
                        >
                            {TAB_CONFIG.map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => onTabChange(value as DashboardTabId)}
                                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold transition-all"
                                    style={
                                        activeTab === value
                                            ? {
                                                background: brand.primary,
                                                color: '#ffffff',
                                                boxShadow: `3px 3px 6px rgba(0,102,102,0.4), -1px -1px 4px rgba(255,255,255,0.2)`,
                                                fontFamily: 'var(--font-space-mono)',
                                            }
                                            : {
                                                background: 'transparent',
                                                color: brand.muted,
                                                fontFamily: 'var(--font-space-mono)',
                                            }
                                    }
                                >
                                    <Icon className="h-3.5 w-3.5" aria-hidden />
                                    {label}
                                </button>
                            ))}
                        </div>
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
                                <table className="w-full min-w-[720px]">
                                    <thead style={{ borderBottom: `1px solid rgba(0,102,102,0.1)`, background: 'rgba(0,102,102,0.04)' }}>
                                        <tr>
                                            <Th icon={Briefcase}>Title</Th>
                                            <Th icon={Hash}>Code</Th>
                                            <Th icon={Activity}>Status</Th>
                                            <Th icon={DollarSign}>Price</Th>
                                            <Th icon={Clock}>Created</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.tours.map((tour) => (
                                            <tr key={tour._id} style={{ borderBottom: '1px solid rgba(0,102,102,0.06)' }}>
                                                <td style={{ ...tdBase, fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {tour.title}
                                                </td>
                                                <td style={{ ...tdMuted, fontFamily: 'var(--font-jetbrains-mono)', fontSize: '11px' }}>
                                                    {tour.uniqueTourCode}
                                                </td>
                                                <td style={tdBase}>
                                                    <StatusBadge label={tour.status} color={brand.primary} />
                                                </td>
                                                <td style={{ ...tdBase, fontFamily: 'var(--font-space-mono)' }}>
                                                    {tour.basePrice.amount} {tour.basePrice.currency}
                                                </td>
                                                <td style={tdMuted}>
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
                                <table className="w-full min-w-[860px]">
                                    <thead style={{ borderBottom: `1px solid rgba(0,102,102,0.1)`, background: 'rgba(0,102,102,0.04)' }}>
                                        <tr>
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
                                            <tr key={b._id} style={{ borderBottom: '1px solid rgba(0,102,102,0.06)' }}>
                                                <td style={{ ...tdMuted, fontFamily: 'var(--font-jetbrains-mono)', fontSize: '11px' }}>{b.bookingReference}</td>
                                                <td style={{ ...tdBase, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.tour.title}</td>
                                                <td style={{ ...tdBase, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.traveler.name}</td>
                                                <td style={tdBase}>{b.totalParticipants}</td>
                                                <td style={{ ...tdBase, fontWeight: 600, fontFamily: 'var(--font-space-mono)' }}>
                                                    {b.totalPaid} {b.currency}
                                                </td>
                                                <td style={tdBase}>
                                                    <StatusBadge label={b.status} color={brand.primary} />
                                                </td>
                                                <td style={tdBase}>
                                                    <StatusBadge
                                                        label={b.paymentStatus}
                                                        color={b.paymentStatus === BOOKING_PAYMENT_STATUS.PAID ? brand.success : brand.muted}
                                                    />
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
                                <table className="w-full min-w-[800px]">
                                    <thead style={{ borderBottom: `1px solid rgba(0,102,102,0.1)`, background: 'rgba(0,102,102,0.04)' }}>
                                        <tr>
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
                                            <tr key={r._id} style={{ borderBottom: '1px solid rgba(0,102,102,0.06)' }}>
                                                <td style={{ ...tdBase, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{r.tour.title}</td>
                                                <td style={{ ...tdBase, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.user.name}</td>
                                                <td style={tdBase}>
                                                    <span className="inline-flex items-center gap-1" style={{ fontFamily: 'var(--font-space-mono)', fontWeight: 600 }}>
                                                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                                                        {r.rating.toFixed(1)}
                                                    </span>
                                                </td>
                                                <td style={tdBase}>
                                                    <StatusBadge
                                                        label={r.isApproved ? 'Yes' : 'No'}
                                                        color={r.isApproved ? brand.success : brand.muted}
                                                    />
                                                </td>
                                                <td style={{ ...tdMuted, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.comment}</td>
                                                <td style={tdMuted}>{format(new Date(r.createdAt), 'MMM d, yyyy')}</td>
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
                                <table className="w-full min-w-[820px]">
                                    <thead style={{ borderBottom: `1px solid rgba(0,102,102,0.1)`, background: 'rgba(0,102,102,0.04)' }}>
                                        <tr>
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
                                            <tr key={r._id} style={{ borderBottom: '1px solid rgba(0,102,102,0.06)' }}>
                                                <td style={{ ...tdBase, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{r.reporter.name}</td>
                                                <td style={{ ...tdBase, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.tour.title}</td>
                                                <td style={{ ...tdMuted, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reason}</td>
                                                <td style={tdBase}>
                                                    <StatusBadge label={r.priority} color={brand.warning} />
                                                </td>
                                                <td style={tdBase}>
                                                    <StatusBadge label={r.status.replace(/_/g, ' ')} color={brand.primary} />
                                                </td>
                                                <td style={tdMuted}>{format(new Date(r.createdAt), 'MMM d, yyyy')}</td>
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
                                <table className="w-full min-w-[720px]">
                                    <thead style={{ borderBottom: `1px solid rgba(0,102,102,0.1)`, background: 'rgba(0,102,102,0.04)' }}>
                                        <tr>
                                            <Th icon={UserCheck}>Name</Th>
                                            <Th icon={Mail}>Email</Th>
                                            <Th icon={Activity}>Status</Th>
                                            <Th icon={Wallet}>Salary</Th>
                                            <Th icon={Clock}>Joined</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.employees.map((e) => (
                                            <tr key={e._id} style={{ borderBottom: '1px solid rgba(0,102,102,0.06)' }}>
                                                <td style={{ ...tdBase, fontWeight: 600 }}>{e.user.name}</td>
                                                <td style={{ ...tdMuted, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.user.email}</td>
                                                <td style={tdBase}>
                                                    <StatusBadge label={e.status} color={brand.primary} />
                                                </td>
                                                <td style={{ ...tdBase, fontWeight: 600, fontFamily: 'var(--font-space-mono)' }}>
                                                    {e.salary} {e.currency}
                                                </td>
                                                <td style={tdMuted}>{format(new Date(e.dateOfJoining), 'MMM d, yyyy')}</td>
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
                            <TableShell empty={!data.runningTours.length} emptyLabel="No active departure right now.">
                                <table className="w-full min-w-[760px]">
                                    <thead style={{ borderBottom: `1px solid rgba(0,102,102,0.1)`, background: 'rgba(0,102,102,0.04)' }}>
                                        <tr>
                                            <Th icon={Map}>Tour</Th>
                                            <Th icon={Tag}>Slug</Th>
                                            <Th icon={Layers}>Seats</Th>
                                            <Th icon={CalendarCheck2}>Booked</Th>
                                            <Th icon={ArrowUpDown}>Window</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.runningTours.map((t) => (
                                            <tr key={t.tourId} style={{ borderBottom: '1px solid rgba(0,102,102,0.06)' }}>
                                                <td style={{ ...tdBase, fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</td>
                                                <td style={{ ...tdMuted, fontSize: '11px' }}>{t.slug}</td>
                                                <td style={tdBase}>{t.totalSeats}</td>
                                                <td style={tdBase}>{t.currentBookings}</td>
                                                <td style={tdMuted}>
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
                                <table className="w-full min-w-[780px]">
                                    <thead style={{ borderBottom: `1px solid rgba(0,102,102,0.1)`, background: 'rgba(0,102,102,0.04)' }}>
                                        <tr>
                                            <Th icon={Map}>Tour</Th>
                                            <Th icon={HelpCircle}>Question</Th>
                                            <Th icon={Activity}>Status</Th>
                                            <Th icon={ThumbsUp}>Votes</Th>
                                            <Th icon={Clock}>Date</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.faqs.map((f) => (
                                            <tr key={f._id} style={{ borderBottom: '1px solid rgba(0,102,102,0.06)' }}>
                                                <td style={{ ...tdBase, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{f.tour.title}</td>
                                                <td style={{ ...tdBase, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.question}</td>
                                                <td style={tdBase}>
                                                    <StatusBadge label={f.status} color={brand.primary} />
                                                </td>
                                                <td style={tdMuted}>+{f.likeCount} / −{f.dislikeCount}</td>
                                                <td style={tdMuted}>{format(new Date(f.createdAt), 'MMM d, yyyy')}</td>
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
                                <table className="w-full min-w-[680px]">
                                    <thead style={{ borderBottom: `1px solid rgba(0,102,102,0.1)`, background: 'rgba(0,102,102,0.04)' }}>
                                        <tr>
                                            <Th icon={Hash}>Booking</Th>
                                            <Th icon={Wallet}>Amount</Th>
                                            <Th icon={Activity}>Status</Th>
                                            <Th icon={Clock}>Requested</Th>
                                            <Th icon={CalendarCheck2}>Processed</Th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.refunds.map((r) => (
                                            <tr key={r._id} style={{ borderBottom: '1px solid rgba(0,102,102,0.06)' }}>
                                                <td style={{ ...tdMuted, fontSize: '11px' }}>{r.booking}</td>
                                                <td style={{ ...tdBase, fontWeight: 600, fontFamily: 'var(--font-space-mono)' }}>
                                                    {r.amount} {r.currency}
                                                </td>
                                                <td style={tdBase}>
                                                    <StatusBadge label={r.status} color={brand.primary} />
                                                </td>
                                                <td style={tdMuted}>{format(new Date(r.requestedAt), 'MMM d, yyyy')}</td>
                                                <td style={tdMuted}>
                                                    {r.processedAt ? format(new Date(r.processedAt), 'MMM d, yyyy') : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </TableShell>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
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
            <div
                className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed p-8 text-center"
                style={{
                    borderColor: 'rgba(0,102,102,0.2)',
                    background: 'rgba(0,102,102,0.03)',
                }}
            >
                <p
                    className="text-xs"
                    style={{ color: brand.muted, fontFamily: 'var(--font-jetbrains-mono)' }}
                >
                    {emptyLabel}
                </p>
            </div>
        );
    }
    return (
        <ScrollArea
            className="h-[min(440px,55vh)] rounded-xl"
            style={{
                border: `1px solid rgba(0,102,102,0.12)`,
                boxShadow: brand.shadowIn,
            }}
        >
            <div className="min-w-0">{children}</div>
        </ScrollArea>
    );
}