'use client';

import { format } from 'date-fns';
import { CalendarIcon, ChevronDown, Download, Loader2, RotateCcw, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { DateRange } from '@/types/dashboard/dashboard.type';

export type ExportDataset = 'tours' | 'bookings' | 'reviews' | 'reports' | 'employees' | 'transactions';

// Brand tokens
const brand = {
    primary: '#006666',
    surface: '#E7E5E4',
    secondary: '#F1F2F5',
    text: '#1E2938',
    muted: '#6B7A8D',
    border: 'rgba(0,102,102,0.15)',
    shadowOut: '6px 6px 12px #c8c6c4, -6px -6px 12px #ffffff',
    shadowIn: 'inset 3px 3px 6px #c8c6c4, inset -3px -3px 6px #ffffff',
};

type DashboardPageHeaderProps = {
    exportWindow: DateRange;
    onExportWindowChange: (range: DateRange) => void;
    isExporting: boolean;
    exportType: ExportDataset;
    onExportTypeChange: (t: ExportDataset) => void;
    onResetFilters: () => void;
    onExport: () => void;
};

export function DashboardPageHeader({
    exportWindow,
    onExportWindowChange,
    isExporting,
    exportType,
    onExportTypeChange,
    onResetFilters,
    onExport,
}: DashboardPageHeaderProps) {
    return (
        <div
            className="relative overflow-hidden rounded-3xl p-6 sm:p-8"
            style={{
                background: '#E7E5E4',
                boxShadow: brand.shadowOut,
                border: `1px solid ${brand.border}`,
            }}
        >
            {/* Teal top accent bar */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
                style={{ background: `linear-gradient(90deg, ${brand.primary}, #00a8a8, #00d4aa)` }}
                aria-hidden
            />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                {/* Left: branding & title */}
                <div className="max-w-xl space-y-3">
                    <div className="flex items-center gap-2">
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-xl"
                            style={{
                                background: brand.primary,
                                boxShadow: '3px 3px 6px rgba(0,102,102,0.35), -1px -1px 4px rgba(255,255,255,0.4)',
                            }}
                        >
                            <LayoutDashboard className="h-4 w-4 text-white" aria-hidden />
                        </div>
                        <p
                            className="text-[10px] font-bold uppercase tracking-[0.25em]"
                            style={{ color: brand.primary, fontFamily: 'var(--font-space-mono)' }}
                        >
                            Operations
                        </p>
                    </div>
                    <h1
                        className="text-3xl font-bold tracking-tight sm:text-4xl"
                        style={{ color: brand.text, fontFamily: 'var(--font-space-mono)', letterSpacing: '-0.02em' }}
                    >
                        Dashboard
                    </h1>
                    <p
                        className="text-sm leading-relaxed text-pretty"
                        style={{ color: brand.muted, fontFamily: 'var(--font-jetbrains-mono)' }}
                    >
                        KPIs, charts, tables, and transactions load from separate endpoints. Each block can use its own
                        date range; CSV export uses the export window below.
                    </p>
                </div>

                {/* Right: export window picker */}
                <div className="flex flex-col gap-2 sm:items-end">
                    <p
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: brand.muted, fontFamily: 'var(--font-space-mono)' }}
                    >
                        Export window (CSV)
                    </p>
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                className="flex h-10 items-center justify-between gap-2 rounded-xl px-4 text-sm transition-all sm:min-w-[240px]"
                                style={{
                                    background: brand.surface,
                                    boxShadow: brand.shadowOut,
                                    border: `1px solid ${brand.border}`,
                                    color: brand.text,
                                    fontFamily: 'var(--font-jetbrains-mono)',
                                }}
                            >
                                <CalendarIcon className="h-3.5 w-3.5 shrink-0" style={{ color: brand.primary }} />
                                <span className="truncate text-left text-xs font-medium">
                                    {exportWindow.from && exportWindow.to ? (
                                        <>
                                            {format(exportWindow.from, 'MMM d, y')} —{' '}
                                            {format(exportWindow.to, 'MMM d, y')}
                                        </>
                                    ) : (
                                        'Pick range'
                                    )}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color: brand.muted }} />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="range"
                                selected={{ from: exportWindow.from, to: exportWindow.to }}
                                onSelect={(next) => {
                                    if (next?.from && next?.to) onExportWindowChange(next as DateRange);
                                }}
                                numberOfMonths={2}
                                disabled={(date) => date > new Date()}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Divider */}
            <div
                className="my-6 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(0,102,102,0.2), transparent)' }}
            />

            {/* Bottom action strip */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <p
                    className="text-[11px]"
                    style={{ color: brand.muted, fontFamily: 'var(--font-jetbrains-mono)' }}
                >
                    Export dataset and download. Reset restores all ranges and filters.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    <Select value={exportType} onValueChange={(v) => onExportTypeChange(v as ExportDataset)}>
                        <SelectTrigger
                            className="h-10 w-full rounded-xl text-xs sm:w-[180px]"
                            style={{
                                background: brand.surface,
                                boxShadow: brand.shadowIn,
                                border: `1px solid ${brand.border}`,
                                color: brand.text,
                                fontFamily: 'var(--font-jetbrains-mono)',
                            }}
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {(['tours', 'bookings', 'reviews', 'reports', 'employees', 'transactions'] as const).map((v) => (
                                <SelectItem key={v} value={v} className="text-xs capitalize" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Reset button */}
                    <button
                        onClick={onResetFilters}
                        className="flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-medium transition-all"
                        style={{
                            background: brand.surface,
                            boxShadow: brand.shadowOut,
                            border: `1px solid ${brand.border}`,
                            color: brand.muted,
                            fontFamily: 'var(--font-space-mono)',
                        }}
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset all
                    </button>

                    {/* Export button */}
                    <button
                        onClick={onExport}
                        disabled={isExporting}
                        className="flex h-10 items-center gap-2 rounded-xl px-5 text-xs font-bold transition-all disabled:opacity-60"
                        style={{
                            background: `linear-gradient(135deg, ${brand.primary}, #008888)`,
                            boxShadow: `4px 4px 8px rgba(0,102,102,0.4), -2px -2px 6px rgba(255,255,255,0.3)`,
                            color: '#fff',
                            fontFamily: 'var(--font-space-mono)',
                            letterSpacing: '0.05em',
                        }}
                    >
                        {isExporting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Download className="h-3.5 w-3.5" />
                        )}
                        Export CSV
                    </button>
                </div>
            </div>
        </div>
    );
}