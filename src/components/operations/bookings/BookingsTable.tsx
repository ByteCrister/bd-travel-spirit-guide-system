'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Users, Calendar, ArrowUpDown,
    ChevronDown, CreditCard, CheckCircle2, AlertTriangle,
    Hash, Tag, ChevronRight, Clock, Ban, RefreshCw,
    BadgeCheck, Hourglass, X
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { IBookingPopulated } from '@/types/tour/booking.types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface BookingsTableProps {
    bookings: IBookingPopulated[];
    isLoading?: boolean;
    onViewDetail?: (booking: IBookingPopulated) => void;
}

// ─── Status config map ────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; dot: string; Icon: React.ElementType }> = {
    confirmed:  { color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', dot: 'bg-emerald-500', Icon: BadgeCheck },
    pending:    { color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200',   dot: 'bg-amber-400',   Icon: Hourglass },
    cancelled:  { color: 'text-rose-700',    bg: 'bg-rose-50',     border: 'border-rose-200',    dot: 'bg-rose-500',    Icon: Ban },
    refunded:   { color: 'text-sky-700',     bg: 'bg-sky-50',      border: 'border-sky-200',     dot: 'bg-sky-500',     Icon: RefreshCw },
    completed:  { color: 'text-violet-700',  bg: 'bg-violet-50',   border: 'border-violet-200',  dot: 'bg-violet-500',  Icon: CheckCircle2 },
};

// ─── Inline status pill ───────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
    return (
        <span className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border',
            cfg.color, cfg.bg, cfg.border
        )}>
            <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
            <span className="capitalize">{status}</span>
        </span>
    );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <tr className="border-b border-slate-100/80">
            <td className="px-4 py-4 w-10">
                <div className="h-5 w-5 bg-slate-100 rounded-md animate-pulse mx-auto" />
            </td>
            {[90, 160, 180, 60, 100, 90, 80].map((w, i) => (
                <td key={i} className="px-4 py-4">
                    <div className="space-y-1.5">
                        <div className="h-3.5 bg-slate-100 rounded-full animate-pulse" style={{ width: `${w}px` }} />
                        {i < 3 && <div className="h-2.5 bg-slate-50 rounded-full animate-pulse" style={{ width: `${w * 0.6}px` }} />}
                    </div>
                </td>
            ))}
            <td className="px-4 py-4 w-10" />
        </tr>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
    return (
        <tr>
            <td colSpan={9} className="py-20 text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center shadow-inner">
                            <Calendar size={22} className="text-slate-300" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-600">No bookings found</p>
                        <p className="text-xs text-slate-400">Adjust your filters to see results</p>
                    </div>
                </div>
            </td>
        </tr>
    );
}

// ─── Detail field ─────────────────────────────────────────────────────────────
function Field({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
    return (
        <div className="grid grid-cols-[120px_1fr] gap-2 py-1.5 border-b border-slate-100/80 last:border-0">
            <span className="text-[10.5px] text-slate-400 uppercase tracking-wider font-medium pt-0.5 truncate">{label}</span>
            <span className={cn('text-xs text-slate-700 text-right break-all', mono && 'font-mono text-slate-500')}>{value}</span>
        </div>
    );
}

// ─── Section header inside accordion ─────────────────────────────────────────
function SectionHeader({ icon: Icon, label, iconColor }: { icon: React.ElementType; label: string; iconColor: string }) {
    return (
        <span className="flex items-center gap-2">
            <span className={cn('w-5 h-5 rounded-md flex items-center justify-center', iconColor.replace('text-', 'bg-').replace('-500', '-100'))}>
                <Icon size={11} className={iconColor} />
            </span>
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest">{label}</span>
        </span>
    );
}

// ─── Expanded accordion detail ────────────────────────────────────────────────
function BookingAccordionDetail({ booking }: { booking: IBookingPopulated }) {
    const paymentMethodLabel: Record<string, string> = {
        bkash: 'bKash', nagad: 'Nagad', card: 'Card',
        stripe: 'Stripe', cash: 'Cash', bank_transfer: 'Bank Transfer',
    };

    const accordionTriggerClass =
        'px-5 py-2.5 hover:no-underline hover:bg-slate-50/80 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-slate-300 transition-colors';
    const accordionItemClass = 'border-slate-100/80';

    return (
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <Accordion type="multiple" defaultValue={['booking', 'tour']} className="w-full divide-y divide-slate-100">

                {/* ── Booking Info ─────────────────────────────────────────── */}
                <AccordionItem value="booking" className={accordionItemClass}>
                    <AccordionTrigger className={accordionTriggerClass}>
                        <SectionHeader icon={Hash} label="Booking Info" iconColor="text-indigo-500" />
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-4 pt-1 bg-slate-50/40">
                        <Field label="Reference" value={<span className="font-mono font-semibold text-indigo-600">#{booking.bookingReference}</span>} />
                        <Field label="Tour Code" value={booking.uniqueTourCode} mono />
                        <Field label="Status" value={<StatusPill status={booking.status} />} />
                        <Field label="Participants" value={`${booking.totalParticipants} traveler${booking.totalParticipants > 1 ? 's' : ''}`} />
                        <Field label="Total Paid" value={
                            <span className="font-bold text-slate-800">{booking.tour.basePrice.currency} {booking.totalPaid.toLocaleString()}</span>
                        } />
                        <Field label="Booked At" value={format(new Date(booking.bookedAt), "MMM dd, yyyy 'at' h:mm a")} />
                        {booking.expiresAt && (
                            <Field label="Expires At" value={
                                <span className="flex items-center gap-1 justify-end text-amber-600">
                                    <Clock size={10} />
                                    {format(new Date(booking.expiresAt), "MMM dd, yyyy 'at' h:mm a")}
                                </span>
                            } />
                        )}
                        {booking.createdAt && <Field label="Created" value={format(new Date(booking.createdAt), 'MMM dd, yyyy')} />}
                        {booking.updatedAt && <Field label="Last Updated" value={format(new Date(booking.updatedAt), 'MMM dd, yyyy')} />}
                    </AccordionContent>
                </AccordionItem>

                {/* ── Tour Details ─────────────────────────────────────────── */}
                <AccordionItem value="tour" className={accordionItemClass}>
                    <AccordionTrigger className={accordionTriggerClass}>
                        <SectionHeader icon={MapPin} label="Tour Details" iconColor="text-emerald-500" />
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-4 pt-1 bg-slate-50/40">
                        <Field label="Title" value={<span className="font-medium text-slate-800 text-right">{booking.tour.title}</span>} />
                        {booking.tour.summary && (
                            <Field label="Summary" value={<span className="line-clamp-2 text-slate-500">{booking.tour.summary}</span>} />
                        )}
                        <Field label="Tour Code" value={booking.tour.uniqueTourCode} mono />
                        <Field label="Location" value={`${booking.tour.district}, ${booking.tour.division}`} />
                        <Field label="Duration" value={`${booking.tour.duration.days} Days / ${booking.tour.duration.nights ?? 0} Nights`} />
                        <Field label="Base Price" value={`${booking.tour.basePrice.currency} ${booking.tour.basePrice.amount.toLocaleString()}`} />
                        <Field label="Tour Status" value={<StatusPill status={booking.tour.status} />} />
                    </AccordionContent>
                </AccordionItem>

                {/* ── Traveler ─────────────────────────────────────────────── */}
                <AccordionItem value="traveler" className={accordionItemClass}>
                    <AccordionTrigger className={accordionTriggerClass}>
                        <SectionHeader icon={Users} label="Traveler" iconColor="text-violet-500" />
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-4 pt-2 bg-slate-50/40">
                        {/* Traveler card */}
                        <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                            <Avatar className="w-9 h-9 rounded-xl border border-slate-100 shrink-0">
                                <AvatarFallback className="bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 text-xs font-bold rounded-xl">
                                    {booking.traveler.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 truncate">
                                    {booking.traveler.name}
                                    {booking.traveler.isVerified && (
                                        <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                                    )}
                                </p>
                                <p className="text-[10.5px] text-slate-400 truncate">{booking.traveler.email}</p>
                            </div>
                            <span className={cn(
                                'ml-auto shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full capitalize',
                                booking.traveler.accountStatus === 'active'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    : 'bg-slate-50 text-slate-500 border border-slate-100'
                            )}>
                                {booking.traveler.accountStatus}
                            </span>
                        </div>

                        <Field label="ID" value={booking.traveler._id} mono />
                        {booking.traveler.phone && <Field label="Phone" value={booking.traveler.phone} />}
                        <Field label="Verified" value={
                            booking.traveler.isVerified
                                ? <span className="text-emerald-600 font-medium flex items-center gap-1 justify-end"><CheckCircle2 size={11} /> Verified</span>
                                : <span className="text-slate-400 flex items-center gap-1 justify-end"><X size={11} /> Not verified</span>
                        } />
                        {booking.traveler.address && (
                            <>
                                {booking.traveler.address.house && <Field label="House" value={booking.traveler.address.house} />}
                                {booking.traveler.address.road && <Field label="Road" value={booking.traveler.address.road} />}
                                {booking.traveler.address.area && <Field label="Area" value={booking.traveler.address.area} />}
                                {booking.traveler.address.upazila && <Field label="Upazila" value={booking.traveler.address.upazila} />}
                                {booking.traveler.address.district && <Field label="District" value={booking.traveler.address.district} />}
                                {booking.traveler.address.division && <Field label="Division" value={booking.traveler.address.division} />}
                                {booking.traveler.address.postalCode && <Field label="Postal Code" value={booking.traveler.address.postalCode} mono />}
                            </>
                        )}
                    </AccordionContent>
                </AccordionItem>

                {/* ── Payment ──────────────────────────────────────────────── */}
                <AccordionItem value="payment" className={accordionItemClass}>
                    <AccordionTrigger className={accordionTriggerClass}>
                        <SectionHeader icon={CreditCard} label="Payment" iconColor="text-amber-500" />
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-4 pt-1 bg-slate-50/40">
                        <Field label="Method" value={<span className="capitalize">{paymentMethodLabel[booking.payment.method] ?? booking.payment.method}</span>} />
                        <Field label="Status" value={<StatusPill status={booking.payment.status} />} />
                        {booking.payment.transactionId && (
                            <Field label="Transaction ID" value={booking.payment.transactionId} mono />
                        )}
                        {booking.payment.paidAt && (
                            <Field label="Paid At" value={format(new Date(booking.payment.paidAt), "MMM dd, yyyy 'at' h:mm a")} />
                        )}
                        <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between">
                            <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Total Paid</span>
                            <span className="text-base font-bold text-slate-800 font-mono tracking-tight">
                                {booking.tour.basePrice.currency} {booking.totalPaid.toLocaleString()}
                            </span>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* ── Discounts ─────────────────────────────────────────────── */}
                {booking.discounts.length > 0 && (
                    <AccordionItem value="discounts" className={accordionItemClass}>
                        <AccordionTrigger className={accordionTriggerClass}>
                            <SectionHeader icon={Tag} label={`Discounts (${booking.discounts.length})`} iconColor="text-sky-500" />
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-4 pt-2 bg-slate-50/40">
                            <div className="space-y-2">
                                {booking.discounts.map((d, idx) => (
                                    <div key={idx} className="flex items-center justify-between rounded-xl bg-white border border-slate-200/80 px-3.5 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-700 capitalize">{d.discount}</p>
                                            <p className="text-[10px] text-slate-400 capitalize mt-0.5">{d.type}</p>
                                        </div>
                                        <span className="text-sm font-bold text-emerald-600">
                                            {d.type === 'percentage' ? `-${d.value}%` : `-৳${d.value.toLocaleString()}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {/* ── Cancellation ──────────────────────────────────────────── */}
                {booking.cancellation && (
                    <AccordionItem value="cancellation" className={accordionItemClass}>
                        <AccordionTrigger className={cn(accordionTriggerClass, 'hover:bg-rose-50/60')}>
                            <SectionHeader icon={AlertTriangle} label="Cancellation" iconColor="text-rose-500" />
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-4 pt-2 bg-rose-50/30">
                            <div className="rounded-xl border border-rose-100 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                                <div className="h-1 w-full bg-gradient-to-r from-rose-400 to-rose-300" />
                                <div className="p-3">
                                    <Field label="Cancelled At" value={format(new Date(booking.cancellation.cancelledAt), "MMM dd, yyyy 'at' h:mm a")} />
                                    <Field label="Cancelled By" value={booking.cancellation.cancelledBy} mono />
                                    <Field label="Reason" value={booking.cancellation.reason} />
                                    {booking.cancellation.refundAmount && (
                                        <Field label="Refund Amount" value={<span className="font-bold text-rose-600">৳{booking.cancellation.refundAmount.toLocaleString()}</span>} />
                                    )}
                                    {booking.cancellation.refundStatus && (
                                        <Field label="Refund Status" value={<StatusPill status={booking.cancellation.refundStatus} />} />
                                    )}
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}

            </Accordion>
        </div>
    );
}

// ─── Column header cell ───────────────────────────────────────────────────────
function ColHeader({ label, sortable = false, align = 'left' }: { label: string; sortable?: boolean; align?: 'left' | 'center' | 'right' }) {
    return (
        <th className={cn(
            'px-4 py-3.5 text-[10.5px] uppercase tracking-widest font-semibold text-slate-400 whitespace-nowrap select-none',
            align === 'center' && 'text-center',
            align === 'right' && 'text-right',
        )}>
            {sortable ? (
                <button className="inline-flex items-center gap-1 hover:text-slate-600 transition-colors group">
                    {label}
                    <ArrowUpDown size={9} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                </button>
            ) : label}
        </th>
    );
}

// ─── Main table ───────────────────────────────────────────────────────────────
export function BookingsTable({ bookings, isLoading, onViewDetail }: BookingsTableProps) {
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

    const toggleExpand = (id: string) => setExpandedRowId((prev) => (prev === id ? null : id));

    return (
        <div className="relative rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">

            {/* Top accent bar */}
            <div className="h-[3px] w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

            <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-0">

                    {/* ── Header ──────────────────────────────────────────────── */}
                    <thead>
                        <tr className="bg-slate-50/80">
                            <th className="px-4 py-3.5 w-10 border-b border-slate-100" />
                            <ColHeader label="Reference" sortable />
                            <ColHeader label="Traveler" />
                            <ColHeader label="Tour" />
                            <ColHeader label="Pax" align="center" />
                            <ColHeader label="Payment" sortable />
                            <ColHeader label="Status" />
                            <ColHeader label="Booked" sortable />
                            <th className="px-4 py-3.5 w-12 border-b border-slate-100" />
                        </tr>
                        {/* Header bottom border - handled via border-b on each th */}
                    </thead>

                    {/* ── Body ────────────────────────────────────────────────── */}
                    <tbody>
                        {isLoading
                            ? [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
                            : bookings.length === 0
                                ? <EmptyState />
                                : bookings.map((booking, idx) => (
                                    <>
                                        {/* ── Data row ────────────────────────── */}
                                        <motion.tr
                                            key={booking._id}
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.25, delay: idx * 0.025, ease: 'easeOut' }}
                                            onMouseEnter={() => setHoveredRow(booking._id)}
                                            onMouseLeave={() => setHoveredRow(null)}
                                            className={cn(
                                                'border-b border-slate-100/80 transition-colors duration-100 cursor-default group',
                                                expandedRowId === booking._id
                                                    ? 'bg-indigo-50/30'
                                                    : hoveredRow === booking._id
                                                        ? 'bg-slate-50/80'
                                                        : 'bg-white'
                                            )}
                                        >
                                            {/* Expand toggle */}
                                            <td className="px-4 py-3.5 w-10 text-center">
                                                <button
                                                    onClick={() => toggleExpand(booking._id)}
                                                    className={cn(
                                                        'h-6 w-6 rounded-lg flex items-center justify-center mx-auto transition-all duration-200',
                                                        expandedRowId === booking._id
                                                            ? 'bg-indigo-100 text-indigo-600'
                                                            : 'text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 group-hover:text-slate-400'
                                                    )}
                                                    aria-label={expandedRowId === booking._id ? 'Collapse' : 'Expand'}
                                                >
                                                    <ChevronDown
                                                        size={13}
                                                        className={cn('transition-transform duration-200', expandedRowId === booking._id && 'rotate-180')}
                                                    />
                                                </button>
                                            </td>

                                            {/* Reference */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[11.5px] font-mono font-semibold text-indigo-600 tracking-wide">
                                                        #{booking.bookingReference}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-mono">{booking.uniqueTourCode}</span>
                                                </div>
                                            </td>

                                            {/* Traveler */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <Avatar className="w-7 h-7 rounded-lg shrink-0 ring-1 ring-slate-200/80">
                                                        <AvatarFallback className="bg-gradient-to-br from-violet-100 to-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg">
                                                            {booking.traveler.name?.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col gap-0.5 min-w-0">
                                                        <span className="text-xs text-slate-800 font-medium leading-none flex items-center gap-1">
                                                            <span className="truncate max-w-[120px]">{booking.traveler.name}</span>
                                                            {booking.traveler.isVerified && (
                                                                <CheckCircle2 size={10} className="text-emerald-500 shrink-0" />
                                                            )}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                                                            {booking.traveler.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Tour */}
                                            <td className="px-4 py-3.5 max-w-[200px]">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs text-slate-800 font-medium line-clamp-1">
                                                        {booking.tour.title}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                        <MapPin size={9} className="shrink-0" />
                                                        <span className="truncate">{booking.tour.district ?? booking.tour.division}</span>
                                                        <span className="text-slate-300">·</span>
                                                        <span className="shrink-0">{booking.tour.duration.days}D/{booking.tour.duration.nights ?? 0}N</span>
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Participants */}
                                            <td className="px-4 py-3.5 text-center">
                                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                                                    <Users size={9} />
                                                    {booking.totalParticipants}
                                                </div>
                                            </td>

                                            {/* Payment */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-slate-800 font-semibold font-mono">
                                                        {booking.tour.basePrice.currency} {booking.totalPaid.toLocaleString()}
                                                    </span>
                                                    <StatusPill status={booking.payment.status} />
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3.5">
                                                <StatusPill status={booking.status} />
                                            </td>

                                            {/* Booked at */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs text-slate-600">
                                                        {format(new Date(booking.bookedAt), 'MMM dd, yyyy')}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {format(new Date(booking.bookedAt), 'h:mm a')}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* View action */}
                                            <td className="px-3 py-3.5 text-right w-12">
                                                <AnimatePresence>
                                                    {hoveredRow === booking._id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                            transition={{ duration: 0.12 }}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => onViewDetail?.(booking)}
                                                                className="h-7 w-7 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                                title="View full details"
                                                            >
                                                                <ChevronRight size={14} />
                                                            </Button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </td>
                                        </motion.tr>

                                        {/* ── Expanded detail row ──────────────── */}
                                        <AnimatePresence>
                                            {expandedRowId === booking._id && (
                                                <motion.tr
                                                    key={`${booking._id}-detail`}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="bg-slate-50/60"
                                                >
                                                    <td colSpan={9} className="p-0">
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: 'auto' }}
                                                            exit={{ height: 0 }}
                                                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                                                            className="overflow-hidden border-b border-slate-200/80"
                                                        >
                                                            <div className="max-w-4xl mx-auto p-4 py-5">
                                                                <BookingAccordionDetail booking={booking} />
                                                            </div>
                                                        </motion.div>
                                                    </td>
                                                </motion.tr>
                                            )}
                                        </AnimatePresence>
                                    </>
                                ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}