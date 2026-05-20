'use client';

import { cn } from '@/lib/utils';
import { BookingStatus } from '@/constants/tour/tour-booking.const';
import { BookingPaymentStatus } from '@/constants/tour/tour-booking.const';
import { jetbrainsMono } from '@/styles/fonts';

// Neumorphism-compatible badge config
// Uses the brand palette: primary=#006666, success=#00A63D, warning=#FE9900, danger=#FF2157
const statusConfig: Record<string, { label: string; textColor: string; dotColor: string; bg: string }> = {
  pending: {
    label: 'Pending',
    textColor: 'text-[#FE9900]',
    dotColor: 'bg-[#FE9900]',
    bg: 'bg-[#FE9900]/10',
  },
  confirmed: {
    label: 'Confirmed',
    textColor: 'text-[#00A63D]',
    dotColor: 'bg-[#00A63D]',
    bg: 'bg-[#00A63D]/10',
  },
  cancelled: {
    label: 'Cancelled',
    textColor: 'text-[#FF2157]',
    dotColor: 'bg-[#FF2157]',
    bg: 'bg-[#FF2157]/10',
  },
  completed: {
    label: 'Completed',
    textColor: 'text-[#006666]',
    dotColor: 'bg-[#006666]',
    bg: 'bg-[#006666]/10',
  },
  'no-show': {
    label: 'No Show',
    textColor: 'text-[#1E2938]/50',
    dotColor: 'bg-[#1E2938]/40',
    bg: 'bg-[#1E2938]/6',
  },
  refunded: {
    label: 'Refunded',
    textColor: 'text-[#1E2938]/60',
    dotColor: 'bg-[#1E2938]/50',
    bg: 'bg-[#1E2938]/8',
  },
  // payment statuses
  paid: {
    label: 'Paid',
    textColor: 'text-[#00A63D]',
    dotColor: 'bg-[#00A63D]',
    bg: 'bg-[#00A63D]/10',
  },
  unpaid: {
    label: 'Unpaid',
    textColor: 'text-[#FE9900]',
    dotColor: 'bg-[#FE9900]',
    bg: 'bg-[#FE9900]/10',
  },
  failed: {
    label: 'Failed',
    textColor: 'text-[#FF2157]',
    dotColor: 'bg-[#FF2157]',
    bg: 'bg-[#FF2157]/10',
  },
};

interface BookingStatusBadgeProps {
  status: BookingStatus | BookingPaymentStatus | string;
  size?: 'sm' | 'md';
  animate?: boolean;
}

export default function BookingStatusBadge({ status, size = 'md', animate = false }: BookingStatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    textColor: 'text-[#1E2938]/50',
    dotColor: 'bg-[#1E2938]/40',
    bg: 'bg-[#1E2938]/8',
  };

  return (
    <span
      style={jetbrainsMono.style}
      className={cn(
        // Neumorphic inset pill — pressed into the surface
        'inline-flex items-center gap-1.5 rounded-full font-medium tracking-widest uppercase',
        'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.08),inset_-1px_-1px_3px_rgba(255,255,255,0.8)]',
        config.bg,
        config.textColor,
        size === 'sm' ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]',
      )}
    >
      <span
        className={cn(
          'rounded-full shrink-0',
          size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
          config.dotColor,
          animate && status === 'pending' && 'animate-pulse',
        )}
      />
      {config.label}
    </span>
  );
}