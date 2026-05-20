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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { IBookingPopulated } from '@/types/tour/booking.types';
import { playfair, inter } from '@/styles/fonts';
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

// ─── Status guards ────────────────────────────────────────────────────────────
const TERMINAL_STATUSES = ['cancelled', 'refunded', 'completed', 'no-show'] as const;

function canCancelBooking(status: string) {
    return !TERMINAL_STATUSES.includes(status as (typeof TERMINAL_STATUSES)[number]);
}

function canRefundBooking(status: string, totalPaid: number) {
    return !['refunded', 'cancelled'].includes(status) && totalPaid > 0;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 text-slate-400 shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-0.5">{label}</p>
                <div className="text-sm text-slate-700">{value}</div>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold border-b border-slate-100 pb-2">
                {title}
            </h4>
            {children}
        </div>
    );
}

// ─── Cancel AlertDialog ───────────────────────────────────────────────────────
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
                <Button
                    size="sm"
                    variant="ghost"
                    disabled={disabled}
                    className={cn(
                        'flex-1 rounded-xl gap-1.5 text-xs shadow-sm border transition-all',
                        disabled
                            ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                    )}
                >
                    <XCircle size={13} />
                    Cancel booking
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="bg-white border-slate-200 rounded-2xl shadow-xl max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-slate-800 text-base font-bold flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                            <XCircle size={14} className="text-rose-600" />
                        </span>
                        Cancel this booking?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500 text-sm mt-1">
                        This action will mark the booking as <span className="font-semibold text-rose-600">cancelled</span>.
                        Please provide a reason — it will be recorded against the booking.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Reason textarea */}
                <div className="py-1">
                    <Textarea
                        placeholder="Reason for cancellation…"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        className="resize-none bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 text-sm focus-visible:ring-rose-300 focus-visible:border-rose-300 rounded-xl"
                    />
                    {reason.length === 0 && (
                        <p className="text-[11px] text-rose-500 mt-1.5">A reason is required to proceed.</p>
                    )}
                </div>

                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel
                        onClick={() => setReason('')}
                        className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 text-xs h-9"
                    >
                        Go back
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={!reason.trim() || isCancelling}
                        className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs h-9 px-4 disabled:opacity-50"
                    >
                        {isCancelling ? 'Cancelling…' : 'Yes, cancel booking'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// ─── Refund AlertDialog ───────────────────────────────────────────────────────
function RefundDialog({
    bookingId,
    totalPaid,
    currency,
    disabled,
}: {
    bookingId: string;
    totalPaid: number;
    currency: string;
    disabled: boolean;
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
        await refundBooking(bookingId, {
            refundAmount: parsed,
            reason: reason.trim() || undefined,
        });
        setRefundAmount('');
        setReason('');
        setOpen(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    size="sm"
                    variant="ghost"
                    disabled={disabled}
                    className={cn(
                        'flex-1 rounded-xl gap-1.5 text-xs shadow-sm border transition-all',
                        disabled
                            ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                            : 'bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200'
                    )}
                >
                    <RotateCcw size={13} />
                    Refund
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="bg-white border-slate-200 rounded-2xl shadow-xl max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-slate-800 text-base font-bold flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-center shrink-0">
                            <RotateCcw size={14} className="text-violet-600" />
                        </span>
                        Process a refund?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500 text-sm mt-1">
                        Leave the amount blank to refund the full paid amount of{' '}
                        <span className="font-semibold text-slate-700">
                            {currency} {totalPaid.toLocaleString()}
                        </span>
                        , or enter a partial amount below.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Form fields */}
                <div className="space-y-3 py-1">
                    {/* Amount */}
                    <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium pointer-events-none">
                            {currency}
                        </span>
                        <Input
                            type="number"
                            min={1}
                            max={totalPaid}
                            placeholder={`Full amount (${totalPaid.toLocaleString()})`}
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                            className="pl-12 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 text-sm focus-visible:ring-violet-300 focus-visible:border-violet-300 rounded-xl"
                        />
                    </div>
                    {!amountValid && (
                        <p className="text-[11px] text-rose-500">
                            Amount must be between 1 and {totalPaid.toLocaleString()}.
                        </p>
                    )}

                    {/* Reason */}
                    <Input
                        placeholder="Reason (optional)…"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 text-sm focus-visible:ring-violet-300 focus-visible:border-violet-300 rounded-xl"
                    />
                </div>

                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel
                        onClick={() => { setRefundAmount(''); setReason(''); }}
                        className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 text-xs h-9"
                    >
                        Go back
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={!canSubmit}
                        className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs h-9 px-4 disabled:opacity-50"
                    >
                        {isRefunding ? 'Processing…' : 'Confirm refund'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// ─── Main sheet ───────────────────────────────────────────────────────────────
export function BookingDetailSheet({ booking, open, onClose }: BookingDetailSheetProps) {
    if (!booking) return null;

    const paymentMethodLabel: Record<string, string> = {
        bkash: 'bKash', nagad: 'Nagad', card: 'Card',
        stripe: 'Stripe', cash: 'Cash', bank_transfer: 'Bank Transfer',
    };

    const showCancel = canCancelBooking(booking.status);
    const showRefund = canRefundBooking(booking.status, booking.totalPaid);
    const showFooter = showCancel || showRefund;

    // Reason for disabling (tooltip-style label shown under the button row)
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
                className="w-full sm:max-w-[480px] bg-white border-l border-slate-200 p-0 flex flex-col"
                style={inter.style}
            >
                {/* ── Header ───────────────────────────────────────────────── */}
                <SheetHeader className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-100 px-6 py-4 shrink-0">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Booking reference</p>
                            <SheetTitle className="text-xl font-bold text-slate-800 tracking-tight" style={playfair.style}>
                                #{booking.bookingReference}
                            </SheetTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            <BookingStatusBadge status={booking.status} animate />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            >
                                <X size={16} />
                            </Button>
                        </div>
                    </div>
                </SheetHeader>

                {/* ── Scrollable body ───────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
                    {/* Tour */}
                    <Section title="Tour">
                        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-800 leading-tight">{booking.tour.title}</p>
                                {booking.tour.summary && (
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{booking.tour.summary}</p>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><MapPin size={11} /> {booking.tour.district}</span>
                                <span className="flex items-center gap-1"><Calendar size={11} /> {booking.tour.duration.days}D / {booking.tour.duration.nights ?? 0}N</span>
                                <span className="flex items-center gap-1 uppercase text-[10px] tracking-wide">{booking.tour.status}</span>
                            </div>
                            <div className="text-xs text-slate-500">
                                Code: <span className="font-mono text-slate-600">{booking.uniqueTourCode}</span>
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
                                    {booking.traveler.isVerified && <CheckCircle2 size={12} className="text-emerald-500" />}
                                </span>
                            }
                        />
                        <DetailRow
                            icon={<Mail size={13} />}
                            label="Email"
                            value={<a href={`mailto:${booking.traveler.email}`} className="text-indigo-600 hover:underline">{booking.traveler.email}</a>}
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
                            value={<span className="capitalize text-slate-500">{booking.traveler.accountStatus}</span>}
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
                        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Method</span>
                                <span className="text-sm font-medium text-slate-700 capitalize">
                                    {paymentMethodLabel[booking.payment.method] ?? booking.payment.method}
                                </span>
                            </div>
                            {booking.payment.transactionId && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Transaction ID</span>
                                    <span className="text-xs font-mono text-slate-600">{booking.payment.transactionId}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Status</span>
                                <BookingStatusBadge status={booking.payment.status} size="sm" />
                            </div>
                            {booking.payment.paidAt && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Paid at</span>
                                    <span className="text-xs text-slate-600">{format(new Date(booking.payment.paidAt), 'MMM dd, yyyy')}</span>
                                </div>
                            )}
                            <Separator className="bg-slate-200" />
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-600">Total paid</span>
                                <span className="text-lg font-bold text-slate-800" style={playfair.style}>
                                    {booking.tour.basePrice.currency} {booking.totalPaid.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {booking.discounts.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Applied discounts</p>
                                {booking.discounts.map((d, idx) => (
                                    <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                                        <span className="text-xs text-slate-600 capitalize">{d.discount}</span>
                                        <span className="text-xs font-medium text-emerald-600">
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
                            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 space-y-3">
                                <DetailRow
                                    icon={<Calendar size={13} />}
                                    label="Cancelled at"
                                    value={format(new Date(booking.cancellation.cancelledAt), "MMM dd, yyyy 'at' h:mm a")}
                                />
                                <DetailRow
                                    icon={<Hash size={13} />}
                                    label="Reason"
                                    value={<span className="text-slate-600">{booking.cancellation.reason}</span>}
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

                {/* ── Sticky footer with action dialogs ────────────────────── */}
                {showFooter && (
                    <div className="shrink-0 border-t border-slate-100 bg-white/90 backdrop-blur-sm px-6 pt-4 pb-5 space-y-2">
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
                            <p className="text-[11px] text-slate-400 text-center">{statusNote}</p>
                        )}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}