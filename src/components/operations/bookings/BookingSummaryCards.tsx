'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, RotateCcw, Trophy, LayoutGrid } from 'lucide-react';
import { BookingStatusCount } from '@/types/tour/booking.types';
import { spaceMono } from '@/styles/fonts';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accentColor: string;   // Tailwind text color class
  accentBg: string;      // Tailwind bg color class
  delay: number;
}

function SummaryCard({ label, value, icon, accentColor, accentBg, delay }: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={cn(
          // Neumorphic base: light surface, dual shadow (outer raised + inset highlight)
          'relative rounded-2xl p-5 overflow-hidden transition-all duration-300 cursor-default select-none',
          'bg-[#E7E5E4]',
          'shadow-[6px_6px_12px_#c8c6c4,-6px_-6px_12px_#ffffff]',
          'hover:shadow-[8px_8px_16px_#c8c6c4,-8px_-8px_16px_#ffffff]',
        )}
      >
        {/* Icon container — inset pressed look */}
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center mb-4',
          accentBg,
          'shadow-[inset_3px_3px_6px_rgba(0,0,0,0.12),inset_-2px_-2px_4px_rgba(255,255,255,0.7)]',
        )}>
          {icon}
        </div>

        {/* Value */}
        <p
          className={cn('text-3xl font-bold tracking-tight mb-1 leading-none', accentColor)}
          style={spaceMono.style}
        >
          {value.toLocaleString()}
        </p>

        {/* Label */}
        <p
          className="text-[10px] text-[#1E2938]/50 uppercase tracking-[0.15em] font-medium mt-1.5"
          style={spaceMono.style}
        >
          {label}
        </p>

        {/* Subtle corner accent glow */}
        <div
          className={cn(
            'absolute -bottom-4 -right-4 w-16 h-16 rounded-full opacity-10 blur-xl',
            accentBg,
          )}
        />
      </div>
    </motion.div>
  );
}

interface BookingSummaryCardsProps {
  summary: BookingStatusCount;
}

export function BookingSummaryCards({ summary }: BookingSummaryCardsProps) {
  const cards: SummaryCardProps[] = [
    {
      label: 'Total Bookings',
      value: summary.total,
      icon: <LayoutGrid size={18} className="text-[#006666]" />,
      accentColor: 'text-[#006666]',
      accentBg: 'bg-[#006666]/10',
      delay: 0,
    },
    {
      label: 'Pending',
      value: summary.pending,
      icon: <Clock size={18} className="text-[#FE9900]" />,
      accentColor: 'text-[#FE9900]',
      accentBg: 'bg-[#FE9900]/10',
      delay: 0.05,
    },
    {
      label: 'Confirmed',
      value: summary.confirmed,
      icon: <CheckCircle2 size={18} className="text-[#00A63D]" />,
      accentColor: 'text-[#00A63D]',
      accentBg: 'bg-[#00A63D]/10',
      delay: 0.1,
    },
    {
      label: 'Completed',
      value: summary.completed,
      icon: <Trophy size={18} className="text-[#006666]" />,
      accentColor: 'text-[#006666]',
      accentBg: 'bg-[#006666]/15',
      delay: 0.15,
    },
    {
      label: 'Cancelled',
      value: summary.cancelled,
      icon: <XCircle size={18} className="text-[#FF2157]" />,
      accentColor: 'text-[#FF2157]',
      accentBg: 'bg-[#FF2157]/10',
      delay: 0.2,
    },
    {
      label: 'Refunded',
      value: summary.refunded,
      icon: <RotateCcw size={18} className="text-[#1E2938]/60" />,
      accentColor: 'text-[#1E2938]/70',
      accentBg: 'bg-[#1E2938]/8',
      delay: 0.25,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <SummaryCard key={card.label} {...card} />
      ))}
    </div>
  );
}