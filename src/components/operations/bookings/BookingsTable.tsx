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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { IBookingPopulated } from '@/types/tour/booking.types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { spaceMono, jetbrainsMono } from '@/styles/fonts';

interface BookingsTableProps {
    bookings: IBookingPopulated[];
    isLoading?: boolean;
    onViewDetail?: (booking: IBookingPopulated) => void;
}

// Brand colors from skill
const STATUS_CONFIG: Record<string, {
    textColor: string; bg: string; dotColor: string; Icon: React.ElementType
}> = {
    confirmed:  { textColor: 'text-[#00A63D]', bg: 'bg-[#00A63D]/10', dotColor: 'bg-[#00A63D]', Icon: BadgeCheck },
    pending:    { textColor: 'text-[#FE9900]', bg: 'bg-[#FE9900]/10', dotColor: 'bg-[#FE9900]', Icon: Hourglass },
    cancelled:  { textColor: 'text-[#FF2157]', bg: 'bg-[#FF2157]/10', dotColor: 'bg-[#FF2157]', Icon: Ban },
    refunded:   { textColor: 'text-[#1E2938]/55', bg: 'bg-[#1E2938]/6', dotColor: 'bg-[#1E2938]/50', Icon: RefreshCw },
    completed:  { textColor: 'text-[#006666]', bg: 'bg-[#006666]/10', dotColor: 'bg-[#006666]', Icon: CheckCircle2 },
};

// Inset pill (neumorphic badge)
function StatusPill({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium',
                '',
                cfg.bg, cfg.textColor,
            )}
            style={jetbrainsMono.style}
        >
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dotColor)} />
            <span className="capitalize tracking-wide">{status}</span>
        </span>
    );
}

function SkeletonRow() {
    return (
        <tr>
            <td className="px-4 py-4 w-10">
                <div className={cn(
                    'h-6 w-6 rounded-lg mx-auto',
                    'bg-[#E7E5E4]  animate-pulse',
                )} />
            </td>
            {[90, 160, 180, 60, 100, 90, 80].map((w, i) => (
                <td key={i} className="px-4 py-4">
                    <div className="space-y-2">
                        <div
                            className={cn(
                                'h-3 rounded-full animate-pulse',
                                'bg-[#E7E5E4] ',
                            )}
                            style={{ width: `${w}px` }}
                        />
                        {i < 3 && (
                            <div
                                className={cn(
                                    'h-2.5 rounded-full animate-pulse',
                                    'bg-[#E7E5E4] ',
                                )}
                                style={{ width: `${w * 0.6}px` }}
                            />
                        )}
                    </div>
                </td>
            ))}
            <td className="px-4 py-4 w-10" />
        </tr>
    );
}

function EmptyState() {
    return (
        <tr>
            <td colSpan={9} className="py-20 text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className={cn(
                        'w-14 h-14 rounded-2xl flex items-center justify-center',
                        'bg-[#E7E5E4]',
                        '',
                    )}>
                        <Calendar size={20} className="text-[#1E2938]/25" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-[#1E2938]/60" style={spaceMono.style}>No bookings found</p>
                        <p className="text-xs text-[#1E2938]/35" style={jetbrainsMono.style}>Adjust your filters to see results</p>
                    </div>
                </div>
            </td>
        </tr>
    );
}

function Field({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
    return (
        <div className="grid grid-cols-[120px_1fr] gap-2 py-2 border-b border-[#1E2938]/5 last:border-0">
            <span
                className="text-[10px] text-[#1E2938]/40 uppercase tracking-wider font-medium pt-0.5 truncate"
                style={spaceMono.style}
            >
                {label}
            </span>
            <span
                className={cn('text-xs text-[#1E2938]/75 text-right break-all', mono && 'text-[#006666]')}
                style={mono ? jetbrainsMono.style : undefined}
            >
                {value}
            </span>
        </div>
    );
}

function SectionHeader({ icon: Icon, label, accentColor }: { icon: React.ElementType; label: string; accentColor: string }) {
    return (
        <span className="flex items-center gap-2">
            <span className={cn(
                'w-5 h-5 rounded-md flex items-center justify-center',
                'bg-[#E7E5E4] ',
            )}>
                <Icon size={11} className={accentColor} />
            </span>
            <span className="text-[10px] font-semibold text-[#1E2938]/55 uppercase tracking-widest" style={spaceMono.style}>
                {label}
            </span>
        </span>
    );
}

function BookingAccordionDetail({ booking }: { booking: IBookingPopulated }) {
    const paymentMethodLabel: Record<string, string> = {
        bkash: 'bKash', nagad: 'Nagad', card: 'Card',
        stripe: 'Stripe', cash: 'Cash', bank_transfer: 'Bank Transfer',
    };

    const triggerCls = 'px-5 py-3 hover:no-underline [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-[#1E2938]/25 hover:bg-[#E7E5E4]/60 transition-colors';
    const itemCls = 'border-[#1E2938]/5';

    return (
        <div className={cn(
            'rounded-2xl overflow-hidden',
            'bg-[#E7E5E4]',
            '',
        )}>
            <Accordion type="multiple" defaultValue={['booking', 'tour']} className="w-full divide-y divide-[#1E2938]/5">

                {/* Booking Info */}
                <AccordionItem value="booking" className={itemCls}>
                    <AccordionTrigger className={triggerCls}>
                        <SectionHeader icon={Hash} label="Booking Info" accentColor="text-[#006666]" />
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-4 pt-1">
                        <Field label="Reference" value={<span className="font-semibold text-[#006666]" style={jetbrainsMono.style}>#{booking.bookingReference}</span>} />
                        <Field label="Tour Code" value={booking.uniqueTourCode} mono />
                        <Field label="Status" value={<StatusPill status={booking.status} />} />
                        <Field label="Participants" value={`${booking.totalParticipants} traveler${booking.totalParticipants > 1 ? 's' : ''}`} />
                        <Field label="Total Paid" value={
                            <span className="font-bold text-[#1E2938]/80" style={jetbrainsMono.style}>
                                {booking.tour.basePrice.currency} {booking.totalPaid.toLocaleString()}
                            </span>
                        } />
                        <Field label="Booked At" value={format(new Date(booking.bookedAt), "MMM dd, yyyy 'at' h:mm a")} />
                        {booking.expiresAt && (
                            <Field label="Expires At" value={
                                <span className="flex items-center gap-1 justify-end text-[#FE9900]">
                                    <Clock size={10} />
                                    {format(new Date(booking.expiresAt), "MMM dd, yyyy 'at' h:mm a")}
                                </span>
                            } />
                        )}
                        {booking.createdAt && <Field label="Created" value={format(new Date(booking.createdAt), 'MMM dd, yyyy')} />}
                        {booking.updatedAt && <Field label="Last Updated" value={format(new Date(booking.updatedAt), 'MMM dd, yyyy')} />}
                    </AccordionContent>
                </AccordionItem>

                {/* Tour Details */}
                <AccordionItem value="tour" className={itemCls}>
                    <AccordionTrigger className={triggerCls}>
                        <SectionHeader icon={MapPin} label="Tour Details" accentColor="text-[#00A63D]" />
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-4 pt-1">
                        <Field label="Title" value={<span className="font-medium text-[#1E2938]/80 text-right">{booking.tour.title}</span>} />
                        {booking.tour.summary && (
                            <Field label="Summary" value={<span className="line-clamp-2 text-[#1E2938]/50">{booking.tour.summary}</span>} />
                        )}
                        <Field label="Tour Code" value={booking.tour.uniqueTourCode} mono />
                        <Field label="Location" value={`${booking.tour.district}, ${booking.tour.division}`} />
                        <Field label="Duration" value={`${booking.tour.duration.days} Days / ${booking.tour.duration.nights ?? 0} Nights`} />
                        <Field label="Base Price" value={`${booking.tour.basePrice.currency} ${booking.tour.basePrice.amount.toLocaleString()}`} />
                        <Field label="Tour Status" value={<StatusPill status={booking.tour.status} />} />
                    </AccordionContent>
                </AccordionItem>

                {/* Traveler */}
                <AccordionItem value="traveler" className={itemCls}>
                    <AccordionTrigger className={triggerCls}>
                        <SectionHeader icon={Users} label="Traveler" accentColor="text-[#006666]" />
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-4 pt-2">
                        {/* Traveler card — inset neumorphic */}
                        <div className={cn(
                            'flex items-center gap-3 mb-4 p-3 rounded-xl',
                            'bg-[#E7E5E4]',
                            '',
                        )}>
                            <Avatar className="w-9 h-9 rounded-xl shrink-0 ">
                                <AvatarFallback className="bg-[#006666]/10 text-[#006666] text-xs font-bold rounded-xl">
                                    {booking.traveler.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-[#1E2938]/80 flex items-center gap-1.5 truncate" style={spaceMono.style}>
                                    {booking.traveler.name}
                                    {booking.traveler.isVerified && <CheckCircle2 size={11} className="text-[#00A63D] shrink-0" />}
                                </p>
                                <p className="text-[10px] text-[#1E2938]/40 truncate" style={jetbrainsMono.style}>{booking.traveler.email}</p>
                            </div>
                            <span className={cn(
                                'ml-auto shrink-0 text-[9px] font-medium px-2 py-0.5 rounded-full capitalize',
                                '',
                                booking.traveler.accountStatus === 'active'
                                    ? 'bg-[#00A63D]/10 text-[#00A63D]'
                                    : 'bg-[#1E2938]/6 text-[#1E2938]/40',
                            )} style={jetbrainsMono.style}>
                                {booking.traveler.accountStatus}
                            </span>
                        </div>

                        <Field label="ID" value={booking.traveler._id} mono />
                        {booking.traveler.phone && <Field label="Phone" value={booking.traveler.phone} />}
                        <Field label="Verified" value={
                            booking.traveler.isVerified
                                ? <span className="text-[#00A63D] font-medium flex items-center gap-1 justify-end"><CheckCircle2 size={11} /> Verified</span>
                                : <span className="text-[#1E2938]/35 flex items-center gap-1 justify-end"><X size={11} /> Not verified</span>
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

                {/* Payment */}
                <AccordionItem value="payment" className={itemCls}>
                    <AccordionTrigger className={triggerCls}>
                        <SectionHeader icon={CreditCard} label="Payment" accentColor="text-[#FE9900]" />
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-4 pt-1">
                        <Field label="Method" value={<span className="capitalize">{paymentMethodLabel[booking.payment.method] ?? booking.payment.method}</span>} />
                        <Field label="Status" value={<StatusPill status={booking.payment.status} />} />
                        {booking.payment.transactionId && (
                            <Field label="Transaction ID" value={booking.payment.transactionId} mono />
                        )}
                        {booking.payment.paidAt && (
                            <Field label="Paid At" value={format(new Date(booking.payment.paidAt), "MMM dd, yyyy 'at' h:mm a")} />
                        )}
                        <div className={cn(
                            'mt-3 p-3 rounded-xl flex items-center justify-between',
                            'bg-[#E7E5E4] ',
                        )}>
                            <span className="text-xs text-[#1E2938]/45" style={spaceMono.style}>Total paid</span>
                            <span className="text-base font-bold text-[#006666]" style={spaceMono.style}>
                                {booking.tour.basePrice.currency} {booking.totalPaid.toLocaleString()}
                            </span>
                        </div>
                    </AccordionContent>
                </AccordionItem>

            </Accordion>
        </div>
    );
}

function ColHeader({ label, sortable = false, align = 'left' }: {
    label: string; sortable?: boolean; align?: 'left' | 'center' | 'right'
}) {
    return (
        <th className={cn(
            'px-4 py-3.5 text-[9.5px] uppercase tracking-[0.14em] font-semibold text-[#1E2938]/40 whitespace-nowrap select-none',
            align === 'center' && 'text-center',
            align === 'right' && 'text-right',
        )} style={spaceMono.style}>
            {sortable ? (
                <button className="inline-flex items-center gap-1 hover:text-[#006666] transition-colors group">
                    {label}
                    <ArrowUpDown size={9} className="text-[#1E2938]/25 group-hover:text-[#006666]/50 transition-colors" />
                </button>
            ) : label}
        </th>
    );
}

export function BookingsTable({ bookings, isLoading, onViewDetail }: BookingsTableProps) {
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

    const toggleExpand = (id: string) => setExpandedRowId((prev) => (prev === id ? null : id));

    return (
        <div className={cn(
            'relative rounded-2xl overflow-hidden',
            'bg-[#E7E5E4]',
            '',
        )}>
            {/* Teal top accent line */}
            <div className="h-[3px] w-full bg-[#006666]" />

            <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-0" style={spaceMono.style}>

                    {/* Header */}
                    <thead>
                        <tr className={cn(
                            'bg-[#E7E5E4]',
                            '',
                        )}>
                            <th className="px-4 py-3.5 w-10 border-b border-[#1E2938]/5" />
                            <ColHeader label="Reference" sortable />
                            <ColHeader label="Traveler" />
                            <ColHeader label="Tour" />
                            <ColHeader label="Pax" align="center" />
                            <ColHeader label="Payment" sortable />
                            <ColHeader label="Status" />
                            <ColHeader label="Booked" sortable />
                            <th className="px-4 py-3.5 w-12 border-b border-[#1E2938]/5" />
                        </tr>
                    </thead>

                    <tbody>
                        {isLoading
                            ? [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
                            : bookings.length === 0
                                ? <EmptyState />
                                : bookings.map((booking, idx) => (
                                    <>
                                        <motion.tr
                                            key={booking._id}
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.25, delay: idx * 0.025, ease: 'easeOut' }}
                                            onMouseEnter={() => setHoveredRow(booking._id)}
                                            onMouseLeave={() => setHoveredRow(null)}
                                            className={cn(
                                                'border-b border-[#1E2938]/5 transition-colors duration-100 cursor-default group',
                                                expandedRowId === booking._id
                                                    ? 'bg-[#006666]/5'
                                                    : hoveredRow === booking._id
                                                        ? 'bg-[#1E2938]/3'
                                                        : 'bg-transparent',
                                            )}
                                        >
                                            {/* Expand toggle */}
                                            <td className="px-4 py-3.5 w-10 text-center">
                                                <button
                                                    onClick={() => toggleExpand(booking._id)}
                                                    className={cn(
                                                        'h-7 w-7 rounded-lg flex items-center justify-center mx-auto transition-all duration-200',
                                                        expandedRowId === booking._id
                                                            ? 'bg-[#E7E5E4] text-[#006666] '
                                                            : 'text-[#1E2938]/25 hover:text-[#006666]  hover:',
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
                                                    <span
                                                        className="text-[11.5px] font-semibold text-[#006666] tracking-wide"
                                                        style={jetbrainsMono.style}
                                                    >
                                                        #{booking.bookingReference}
                                                    </span>
                                                    <span className="text-[10px] text-[#1E2938]/35" style={jetbrainsMono.style}>
                                                        {booking.uniqueTourCode}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Traveler */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <Avatar className={cn(
                                                        'w-7 h-7 rounded-lg shrink-0',
                                                        '',
                                                    )}>
                                                        <AvatarFallback className="bg-[#006666]/10 text-[#006666] text-[10px] font-bold rounded-lg">
                                                            {booking.traveler.name?.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col gap-0.5 min-w-0">
                                                        <span className="text-xs text-[#1E2938]/75 font-medium leading-none flex items-center gap-1" style={spaceMono.style}>
                                                            <span className="truncate max-w-[120px]">{booking.traveler.name}</span>
                                                            {booking.traveler.isVerified && (
                                                                <CheckCircle2 size={10} className="text-[#00A63D] shrink-0" />
                                                            )}
                                                        </span>
                                                        <span className="text-[10px] text-[#1E2938]/35 truncate max-w-[120px]" style={jetbrainsMono.style}>
                                                            {booking.traveler.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Tour */}
                                            <td className="px-4 py-3.5 max-w-[200px]">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs text-[#1E2938]/75 font-medium line-clamp-1" style={spaceMono.style}>
                                                        {booking.tour.title}
                                                    </span>
                                                    <span className="text-[10px] text-[#1E2938]/35 flex items-center gap-1" style={jetbrainsMono.style}>
                                                        <MapPin size={9} className="shrink-0" />
                                                        <span className="truncate">{booking.tour.district ?? booking.tour.division}</span>
                                                        <span className="text-[#1E2938]/20">·</span>
                                                        <span className="shrink-0">{booking.tour.duration.days}D/{booking.tour.duration.nights ?? 0}N</span>
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Participants */}
                                            <td className="px-4 py-3.5 text-center">
                                                <div className={cn(
                                                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium',
                                                    'bg-[#E7E5E4] text-[#1E2938]/55',
                                                    '',
                                                )} style={jetbrainsMono.style}>
                                                    <Users size={9} />
                                                    {booking.totalParticipants}
                                                </div>
                                            </td>

                                            {/* Payment */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-semibold text-[#1E2938]/75" style={jetbrainsMono.style}>
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
                                                    <span className="text-xs text-[#1E2938]/60" style={jetbrainsMono.style}>
                                                        {format(new Date(booking.bookedAt), 'MMM dd, yyyy')}
                                                    </span>
                                                    <span className="text-[10px] text-[#1E2938]/35" style={jetbrainsMono.style}>
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
                                                            <button
                                                                onClick={() => onViewDetail?.(booking)}
                                                                className={cn(
                                                                    'h-7 w-7 rounded-lg flex items-center justify-center',
                                                                    'text-[#1E2938]/35 hover:text-[#006666]',
                                                                    'bg-[#E7E5E4]',
                                                                    '',
                                                                    'hover:',
                                                                    'transition-all duration-150',
                                                                )}
                                                                title="View full details"
                                                            >
                                                                <ChevronRight size={13} />
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </td>
                                        </motion.tr>

                                        {/* Expanded detail row */}
                                        <AnimatePresence>
                                            {expandedRowId === booking._id && (
                                                <motion.tr
                                                    key={`${booking._id}-detail`}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.15 }}
                                                >
                                                    <td colSpan={9} className="p-0">
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: 'auto' }}
                                                            exit={{ height: 0 }}
                                                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                                                            className="overflow-hidden border-b border-[#1E2938]/5"
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