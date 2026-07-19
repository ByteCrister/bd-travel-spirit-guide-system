'use client';

import { useState } from 'react';
import {
    X, MapPin, Calendar, Users, CreditCard, Clock,
    Hash, Phone, Mail, Globe, CheckCircle2, AlertTriangle,
    RotateCcw, XCircle
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { IBookingPopulated } from '@/types/tour/booking.types';
import { spaceMono, jetbrainsMono } from '@/styles/fonts';
import { format } from 'date-fns';
import BookingStatusBadge from './BookingStatusBadge';
import {
    useIsCancelling,
    useIsRefunding,
    useBookingActions,
} from '@/store/booking.store';
import { cn } from '@/lib/utils';

interface BookingDetailSheetProps {
    booking: IBookingPopulated | null;
    open: boolean;
    onClose: () => void;
}

const TERMINAL_STATUSES = ['cancelled', 'refunded', 'completed', 'no-show'] as const;
function canCancelBooking(status: string) {
    return !TERMINAL_STATUSES.includes(status as (typeof TERMINAL_STATUSES)[number]);
}
function canRefundBooking(status: string, totalPaid: number) {
    return !['refunded', 'cancelled'].includes(status) && totalPaid > 0;
}

// Shared neumorphic input style
const neuInput = [
    'bg-[#E7E5E4] border-0 text-[#1E2938] placeholder:text-[#1E2938]/35',
    '',
    'focus-visible:ring-0 focus-visible:ring-offset-0',
    'focus-visible:',
    'rounded-xl transition-shadow duration-200',
].join(' ');

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 text-[#1E2938]/30 shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-[0.15em] text-[#1E2938]/35 font-medium mb-0.5" style={spaceMono.style}>
                    {label}
                </p>
                <div className="text-sm text-[#1E2938]/75" style={jetbrainsMono.style}>{value}</div>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-4">
            <h4
                className="text-[9px] uppercase tracking-[0.18em] text-[#1E2938]/35 font-semibold pb-2 border-b border-[#1E2938]/5"
                style={spaceMono.style}
            >
                {title}
            </h4>
            {children}
        </div>
    );
}

// Neumorphic action button
function NeuActionBtn({
    onClick, disabled, variant, children,
}: {
    onClick?: () => void; disabled?: boolean; variant: 'danger' | 'neutral'; children: React.ReactNode;
}) {
    const colors = variant === 'danger'
        ? 'text-[#FF2157] hover:text-[#FF2157]'
        : 'text-[#1E2938]/55 hover:text-[#1E2938]/80';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'flex-1 h-10 px-4 rounded-xl inline-flex items-center justify-center gap-2 text-xs font-medium transition-all duration-150',
                'bg-[#E7E5E4]',
                disabled
                    ? 'opacity-30 cursor-not-allowed '
                    : [
                        '',
                        'hover:',
                        'active:',
                    ].join(' '),
                colors,
            )}
            style={spaceMono.style}
        >
            {children}
        </button>
    );
}

// Cancel dialog
function CancelDialog({ bookingId, disabled }: { bookingId: string; disabled: boolean }) {
    const [reason, setReason] = useState('');
    const [open, setOpen] = useState(false);
    const isCancelling = useIsCancelling();
    const { cancelBooking } = useBookingActions();

    const handleConfirm = async () => {
        if (!reason.trim()) return;
        await cancelBooking(bookingId, { reason: reason.trim() });
        setReason('');
        setOpen(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <NeuActionBtn variant="danger" disabled={disabled} onClick={() => setOpen(true)}>
                    <XCircle size={13} />
                    Cancel booking
                </NeuActionBtn>
            </AlertDialogTrigger>
            <AlertDialogContent className={cn(
                'rounded-2xl border-0 max-w-md p-6',
                'bg-[#E7E5E4]',
                '',
            )}>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-[#1E2938] text-base font-bold flex items-center gap-2" style={spaceMono.style}>
                        <span className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                            'bg-[#E7E5E4] ',
                        )}>
                            <XCircle size={14} className="text-[#FF2157]" />
                        </span>
                        Cancel this booking?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-[#1E2938]/50 text-sm mt-1" style={jetbrainsMono.style}>
                        This will mark the booking as{' '}
                        <span className="font-semibold text-[#FF2157]">cancelled</span>.
                        Please provide a reason.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-2">
                    <Textarea
                        placeholder="Reason for cancellation…"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        className={cn(neuInput, 'resize-none text-sm')}
                        style={jetbrainsMono.style}
                    />
                    {reason.length === 0 && (
                        <p className="text-[10px] text-[#FF2157] mt-1.5" style={jetbrainsMono.style}>
                            A reason is required to proceed.
                        </p>
                    )}
                </div>

                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel
                        onClick={() => setReason('')}
                        className={cn(
                            'rounded-xl border-0 text-[#1E2938]/55 text-xs h-9 px-4',
                            'bg-[#E7E5E4] ',
                            'hover:',
                        )}
                        style={spaceMono.style}
                    >
                        Go back
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={!reason.trim() || isCancelling}
                        className={cn(
                            'rounded-xl border-0 text-white text-xs h-9 px-4 transition-all',
                            'bg-[#FF2157]',
                            '',
                            'hover:',
                            'active:',
                            'disabled:opacity-40 disabled:cursor-not-allowed',
                        )}
                        style={spaceMono.style}
                    >
                        {isCancelling ? 'Cancelling…' : 'Yes, cancel'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// Refund dialog
function RefundDialog({
    bookingId, totalPaid, currency, disabled,
}: {
    bookingId: string; totalPaid: number; currency: string; disabled: boolean;
}) {
    const [refundAmount, setRefundAmount] = useState('');
    const [reason, setReason] = useState('');
    const [open, setOpen] = useState(false);
    const isRefunding = useIsRefunding();
    const { refundBooking } = useBookingActions();

    const parsed = refundAmount ? parseFloat(refundAmount) : undefined;
    const amountValid = !refundAmount || (!isNaN(parsed!) && parsed! > 0 && parsed! <= totalPaid);
    const canSubmit = amountValid && !isRefunding;

    const handleConfirm = async () => {
        if (!canSubmit) return;
        await refundBooking(bookingId, { refundAmount: parsed, reason: reason.trim() || undefined });
        setRefundAmount('');
        setReason('');
        setOpen(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <NeuActionBtn variant="neutral" disabled={disabled} onClick={() => setOpen(true)}>
                    <RotateCcw size={13} />
                    Refund
                </NeuActionBtn>
            </AlertDialogTrigger>
            <AlertDialogContent className={cn(
                'rounded-2xl border-0 max-w-md p-6',
                'bg-[#E7E5E4]',
                '',
            )}>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-[#1E2938] text-base font-bold flex items-center gap-2" style={spaceMono.style}>
                        <span className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                            'bg-[#E7E5E4] ',
                        )}>
                            <RotateCcw size={14} className="text-[#006666]" />
                        </span>
                        Process a refund?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-[#1E2938]/50 text-sm mt-1" style={jetbrainsMono.style}>
                        Leave blank to refund the full{' '}
                        <span className="font-semibold text-[#1E2938]/70">
                            {currency} {totalPaid.toLocaleString()}
                        </span>
                        , or enter a partial amount.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-3 py-2">
                    <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1E2938]/40 text-xs pointer-events-none" style={jetbrainsMono.style}>
                            {currency}
                        </span>
                        <Input
                            type="number"
                            min={1}
                            max={totalPaid}
                            placeholder={`Full (${totalPaid.toLocaleString()})`}
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                            className={cn(neuInput, 'pl-12 text-sm h-10')}
                            style={jetbrainsMono.style}
                        />
                    </div>
                    {!amountValid && (
                        <p className="text-[10px] text-[#FF2157]" style={jetbrainsMono.style}>
                            Amount must be between 1 and {totalPaid.toLocaleString()}.
                        </p>
                    )}
                    <Input
                        placeholder="Reason (optional)…"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className={cn(neuInput, 'text-sm h-10')}
                        style={jetbrainsMono.style}
                    />
                </div>

                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel
                        onClick={() => { setRefundAmount(''); setReason(''); }}
                        className={cn(
                            'rounded-xl border-0 text-[#1E2938]/55 text-xs h-9 px-4',
                            'bg-[#E7E5E4] ',
                            'hover:',
                        )}
                        style={spaceMono.style}
                    >
                        Go back
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={!canSubmit}
                        className={cn(
                            'rounded-xl border-0 text-white text-xs h-9 px-4 transition-all',
                            'bg-[#006666]',
                            '',
                            'hover:',
                            'active:',
                            'disabled:opacity-40 disabled:cursor-not-allowed',
                        )}
                        style={spaceMono.style}
                    >
                        {isRefunding ? 'Processing…' : 'Confirm refund'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// Main sheet
export function BookingDetailSheet({ booking, open, onClose }: BookingDetailSheetProps) {
    if (!booking) return null;

    const paymentMethodLabel: Record<string, string> = {
        bkash: 'bKash', nagad: 'Nagad', card: 'Card',
        stripe: 'Stripe', cash: 'Cash', bank_transfer: 'Bank Transfer',
    };

    const showCancel = canCancelBooking(booking.status);
    const showRefund = canRefundBooking(booking.status, booking.totalPaid);
    const showFooter = showCancel || showRefund;

    const statusNote =
        booking.status === 'cancelled' ? 'This booking has already been cancelled.' :
        booking.status === 'refunded'  ? 'This booking has already been refunded.' :
        booking.status === 'completed' ? 'Completed bookings cannot be cancelled.' :
        booking.status === 'no-show'   ? 'No-show bookings cannot be modified.' :
        null;

    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent
                side="right"
                className={cn(
                    'w-full sm:max-w-[480px] border-0 p-0 flex flex-col',
                    'bg-[#E7E5E4]',
                    // Deep inset left shadow for sheet panel effect
                    '',
                )}
                style={jetbrainsMono.style}
            >
                {/* ── Header ─────────────────────────────────────────────── */}
                <SheetHeader className={cn(
                    'sticky top-0 z-10 px-6 py-4 shrink-0 border-b border-[#1E2938]/5',
                    'bg-[#E7E5E4]',
                    '',
                )}>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.18em] text-[#1E2938]/35 mb-1" style={spaceMono.style}>
                                Booking reference
                            </p>
                            <SheetTitle className="text-xl font-bold text-[#006666] tracking-tight" style={spaceMono.style}>
                                #{booking.bookingReference}
                            </SheetTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            <BookingStatusBadge status={booking.status} animate />
                            <button
                                onClick={onClose}
                                className={cn(
                                    'h-8 w-8 rounded-lg flex items-center justify-center',
                                    'text-[#1E2938]/35 hover:text-[#1E2938]/70',
                                    'bg-[#E7E5E4]',
                                    '',
                                    'hover:',
                                    'transition-all duration-150',
                                )}
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </div>
                </SheetHeader>

                {/* ── Scrollable body ─────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">

                    {/* Tour */}
                    <Section title="Tour">
                        <div className={cn(
                            'rounded-xl p-4 space-y-3',
                            'bg-[#E7E5E4]',
                            '',
                        )}>
                            <div>
                                <p className="text-sm font-semibold text-[#1E2938]/80 leading-tight" style={spaceMono.style}>
                                    {booking.tour.title}
                                </p>
                                {booking.tour.summary && (
                                    <p className="text-xs text-[#1E2938]/45 mt-1 line-clamp-2">{booking.tour.summary}</p>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#1E2938]/45">
                                <span className="flex items-center gap-1"><MapPin size={11} /> {booking.tour.district}</span>
                                <span className="flex items-center gap-1"><Calendar size={11} /> {booking.tour.duration.days}D / {booking.tour.duration.nights ?? 0}N</span>
                                <span className="flex items-center gap-1 uppercase text-[9px] tracking-wide" style={spaceMono.style}>{booking.tour.status}</span>
                            </div>
                            <div className="text-xs text-[#1E2938]/40" style={jetbrainsMono.style}>
                                Code: <span className="text-[#006666]">{booking.uniqueTourCode}</span>
                            </div>
                        </div>
                    </Section>

                    {/* Traveler */}
                    <Section title="Traveler">
                        <DetailRow
                            icon={<Hash size={13} />}
                            label="Name"
                            value={
                                <span className="flex items-center gap-2">
                                    {booking.traveler.name}
                                    {booking.traveler.isVerified && <CheckCircle2 size={12} className="text-[#00A63D]" />}
                                </span>
                            }
                        />
                        <DetailRow
                            icon={<Mail size={13} />}
                            label="Email"
                            value={<a href={`mailto:${booking.traveler.email}`} className="text-[#006666] hover:underline">{booking.traveler.email}</a>}
                        />
                        {booking.traveler.phone && (
                            <DetailRow icon={<Phone size={13} />} label="Phone" value={booking.traveler.phone} />
                        )}
                        {booking.traveler.address && (
                            <DetailRow
                                icon={<Globe size={13} />}
                                label="Address"
                                value={[
                                    booking.traveler.address.area,
                                    booking.traveler.address.upazila,
                                    booking.traveler.address.district,
                                    booking.traveler.address.division,
                                ].filter(Boolean).join(', ')}
                            />
                        )}
                        <DetailRow
                            icon={<AlertTriangle size={13} />}
                            label="Account status"
                            value={<span className="capitalize text-[#1E2938]/50">{booking.traveler.accountStatus}</span>}
                        />
                    </Section>

                    {/* Booking details */}
                    <Section title="Booking details">
                        <DetailRow
                            icon={<Users size={13} />}
                            label="Participants"
                            value={`${booking.totalParticipants} traveler${booking.totalParticipants > 1 ? 's' : ''}`}
                        />
                        <DetailRow
                            icon={<Calendar size={13} />}
                            label="Booked at"
                            value={format(new Date(booking.bookedAt), "MMM dd, yyyy 'at' h:mm a")}
                        />
                        {booking.expiresAt && (
                            <DetailRow
                                icon={<Clock size={13} />}
                                label="Expires at"
                                value={format(new Date(booking.expiresAt), "MMM dd, yyyy 'at' h:mm a")}
                            />
                        )}
                    </Section>

                    {/* Payment */}
                    <Section title="Payment">
                        <div className={cn(
                            'rounded-xl p-4 space-y-3',
                            'bg-[#E7E5E4]',
                            '',
                        )}>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[#1E2938]/40" style={spaceMono.style}>Method</span>
                                <span className="text-sm font-medium text-[#1E2938]/70 capitalize" style={jetbrainsMono.style}>
                                    {paymentMethodLabel[booking.payment.method] ?? booking.payment.method}
                                </span>
                            </div>
                            {booking.payment.transactionId && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-[#1E2938]/40" style={spaceMono.style}>Transaction ID</span>
                                    <span className="text-xs text-[#006666]" style={jetbrainsMono.style}>{booking.payment.transactionId}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[#1E2938]/40" style={spaceMono.style}>Status</span>
                                <BookingStatusBadge status={booking.payment.status} size="sm" />
                            </div>
                            {booking.payment.paidAt && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-[#1E2938]/40" style={spaceMono.style}>Paid at</span>
                                    <span className="text-xs text-[#1E2938]/60" style={jetbrainsMono.style}>
                                        {format(new Date(booking.payment.paidAt), 'MMM dd, yyyy')}
                                    </span>
                                </div>
                            )}
                            <div className="pt-1 border-t border-[#1E2938]/5 flex items-center justify-between">
                                <span className="text-xs font-medium text-[#1E2938]/50" style={spaceMono.style}>Total paid</span>
                                <span className="text-lg font-bold text-[#006666]" style={spaceMono.style}>
                                    {booking.tour.basePrice.currency} {booking.totalPaid.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {booking.discounts.length > 0 && (
                            <div className="space-y-2 mt-3">
                                <p className="text-[9px] uppercase tracking-[0.18em] text-[#1E2938]/35 font-medium" style={spaceMono.style}>
                                    Applied discounts
                                </p>
                                {booking.discounts.map((d, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            'flex items-center justify-between rounded-lg px-3 py-2',
                                            'bg-[#E7E5E4]',
                                            '',
                                        )}
                                    >
                                        <span className="text-xs text-[#1E2938]/60 capitalize" style={jetbrainsMono.style}>{d.discount}</span>
                                        <span className="text-xs font-medium text-[#00A63D]" style={jetbrainsMono.style}>
                                            {d.type === 'percentage' ? `-${d.value}%` : `-৳${d.value}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Section>

                    {/* Cancellation record */}
                    {booking.cancellation && (
                        <Section title="Cancellation">
                            <div className={cn(
                                'rounded-xl p-4 space-y-3',
                                'bg-[#E7E5E4]',
                                '',
                            )}>
                                <DetailRow
                                    icon={<Calendar size={13} />}
                                    label="Cancelled at"
                                    value={format(new Date(booking.cancellation.cancelledAt), "MMM dd, yyyy 'at' h:mm a")}
                                />
                                <DetailRow
                                    icon={<Hash size={13} />}
                                    label="Reason"
                                    value={<span className="text-[#1E2938]/60">{booking.cancellation.reason}</span>}
                                />
                                {booking.cancellation.refundAmount && (
                                    <DetailRow
                                        icon={<CreditCard size={13} />}
                                        label="Refund amount"
                                        value={`৳${booking.cancellation.refundAmount.toLocaleString()}`}
                                    />
                                )}
                            </div>
                        </Section>
                    )}
                </div>

                {/* ── Sticky footer ──────────────────────────────────────── */}
                {showFooter && (
                    <div className={cn(
                        'shrink-0 px-6 pt-4 pb-5 space-y-2 border-t border-[#1E2938]/5',
                        'bg-[#E7E5E4]',
                        '',
                    )}>
                        <div className="flex gap-2">
                            <RefundDialog
                                bookingId={booking._id}
                                totalPaid={booking.totalPaid}
                                currency={booking.tour.basePrice.currency}
                                disabled={!showRefund}
                            />
                            <CancelDialog
                                bookingId={booking._id}
                                disabled={!showCancel}
                            />
                        </div>
                        {statusNote && (
                            <p className="text-[10px] text-[#1E2938]/35 text-center" style={jetbrainsMono.style}>
                                {statusNote}
                            </p>
                        )}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}