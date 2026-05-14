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
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 shadow-xl shadow-slate-200/60 dark:border-slate-700/60 dark:from-slate-900 dark:via-slate-800/90 dark:to-slate-900 dark:shadow-slate-900/60 sm:p-8">
            {/* Glossy top sheen */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/10"
                aria-hidden
            />
            {/* Subtle background orb */}
            <div
                className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-slate-300/20 blur-3xl dark:bg-slate-600/20"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-slate-200/30 blur-2xl dark:bg-slate-700/20"
                aria-hidden
            />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-xl space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 shadow-inner dark:bg-slate-200">
                            <LayoutDashboard className="h-4 w-4 text-white dark:text-slate-900" aria-hidden />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                            Operations
                        </p>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
                        Dashboard
                    </h1>
                    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 text-pretty">
                        KPIs, charts, tables, and transactions load from separate endpoints. Each block can use its own
                        date range; CSV export uses the export window below.
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:items-end">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        Export window (CSV)
                    </p>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-11 justify-between gap-2 rounded-2xl border-slate-200 bg-white/80 px-4 shadow-sm backdrop-blur-sm hover:bg-white hover:shadow-md dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800 sm:min-w-[240px]"
                            >
                                <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
                                <span className="truncate text-left text-sm font-medium text-slate-700 dark:text-slate-200">
                                    {exportWindow.from && exportWindow.to ? (
                                        <>
                                            {format(exportWindow.from, 'MMM d, y')} —{' '}
                                            {format(exportWindow.to, 'MMM d, y')}
                                        </>
                                    ) : (
                                        'Pick range'
                                    )}
                                </span>
                                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                            </Button>
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

            <Separator className="my-6 bg-slate-200/70 dark:bg-slate-700/70" />

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400 dark:text-slate-500">
                    Export dataset and download. Reset restores all ranges and filters.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    <Select value={exportType} onValueChange={(v) => onExportTypeChange(v as ExportDataset)}>
                        <SelectTrigger className="h-11 w-full rounded-2xl border-slate-200 bg-white/80 shadow-sm dark:border-slate-700 dark:bg-slate-800/80 sm:w-[200px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="tours">Tours</SelectItem>
                            <SelectItem value="bookings">Bookings</SelectItem>
                            <SelectItem value="reviews">Reviews</SelectItem>
                            <SelectItem value="reports">Reports</SelectItem>
                            <SelectItem value="employees">Employees</SelectItem>
                            <SelectItem value="transactions">Transactions</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        className="h-11 rounded-2xl border-slate-200 bg-white/80 shadow-sm hover:bg-white hover:shadow-md dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800"
                        onClick={onResetFilters}
                    >
                        <RotateCcw className="mr-2 h-4 w-4 text-slate-500" />
                        <span className="text-slate-700 dark:text-slate-200">Reset all</span>
                    </Button>
                    <Button
                        className="h-11 rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/25 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/30 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                        onClick={onExport}
                        disabled={isExporting}
                    >
                        {isExporting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        Export CSV
                    </Button>
                </div>
            </div>
        </div>
    );
}