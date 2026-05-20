'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, RotateCcw, Trophy, LayoutGrid } from 'lucide-react';
import { BookingStatusCount } from '@/types/tour/booking.types';
import { playfair } from '@/styles/fonts';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  borderAccent: string;
  valueColor: string;
  delay: number;
}

function SummaryCard({ label, value, icon, iconBg, borderAccent, valueColor, delay }: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <div
        className={cn(
          'relative rounded-2xl border bg-white p-5 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300',
          borderAccent
        )}
      >
        {/* Top accent bar */}
        <div className={cn('absolute top-0 left-0 right-0 h-0.5', iconBg.replace('bg-', 'bg-'))} />

        <div className="flex items-start justify-between mb-4">
          <div className={cn('p-2.5 rounded-xl', iconBg)}>
            {icon}
          </div>
        </div>

        <p className={cn('text-3xl font-bold tracking-tight mb-1', valueColor)} style={playfair.style}>
          {value.toLocaleString()}
        </p>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">{label}</p>
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
      icon: <LayoutGrid size={18} className="text-indigo-600" />,
      iconBg: 'bg-indigo-50',
      borderAccent: 'border-slate-200 hover:border-indigo-200',
      valueColor: 'text-indigo-700',
      delay: 0,
    },
    {
      label: 'Pending',
      value: summary.pending,
      icon: <Clock size={18} className="text-amber-600" />,
      iconBg: 'bg-amber-50',
      borderAccent: 'border-slate-200 hover:border-amber-200',
      valueColor: 'text-amber-700',
      delay: 0.05,
    },
    {
      label: 'Confirmed',
      value: summary.confirmed,
      icon: <CheckCircle2 size={18} className="text-emerald-600" />,
      iconBg: 'bg-emerald-50',
      borderAccent: 'border-slate-200 hover:border-emerald-200',
      valueColor: 'text-emerald-700',
      delay: 0.1,
    },
    {
      label: 'Completed',
      value: summary.completed,
      icon: <Trophy size={18} className="text-sky-600" />,
      iconBg: 'bg-sky-50',
      borderAccent: 'border-slate-200 hover:border-sky-200',
      valueColor: 'text-sky-700',
      delay: 0.15,
    },
    {
      label: 'Cancelled',
      value: summary.cancelled,
      icon: <XCircle size={18} className="text-red-600" />,
      iconBg: 'bg-red-50',
      borderAccent: 'border-slate-200 hover:border-red-200',
      valueColor: 'text-red-700',
      delay: 0.2,
    },
    {
      label: 'Refunded',
      value: summary.refunded,
      icon: <RotateCcw size={18} className="text-violet-600" />,
      iconBg: 'bg-violet-50',
      borderAccent: 'border-slate-200 hover:border-violet-200',
      valueColor: 'text-violet-700',
      delay: 0.25,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card) => (
        <SummaryCard key={card.label} {...card} />
      ))}
    </div>
  );
}