'use client';

import { format } from 'date-fns';
import { CalendarIcon, ChevronDown, Download, Loader2, RotateCcw } from 'lucide-react';
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
        <div className="relative overflow-hidden rounded-3xl border bg-card/80 p-6 shadow-sm backdrop-blur-md sm:p-8">
            <div
                className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl"
                aria-hidden
            />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-xl space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600/90 dark:text-orange-400/90">
                        Operations
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Dashboard</h1>
                    <p className="text-muted-foreground text-pretty leading-relaxed">
                        KPIs, charts, tables, and transactions load from separate endpoints. Each block can use its own
                        date range; CSV export uses the export window below.
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:items-end">
                    <p className="text-xs font-medium text-muted-foreground">Export window (CSV)</p>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-11 justify-between gap-2 rounded-2xl border-dashed px-4 sm:min-w-[220px]"
                            >
                                <CalendarIcon className="h-4 w-4 shrink-0 opacity-70" />
                                <span className="truncate text-left text-sm font-medium">
                                    {exportWindow.from && exportWindow.to ? (
                                        <>
                                            {format(exportWindow.from, 'MMM d, y')} —{' '}
                                            {format(exportWindow.to, 'MMM d, y')}
                                        </>
                                    ) : (
                                        'Pick range'
                                    )}
                                </span>
                                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
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

            <Separator className="my-6" />

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">Export dataset and download. Reset restores all ranges and filters.</p>
                <div className="flex flex-wrap items-center gap-2">
                    <Select value={exportType} onValueChange={(v) => onExportTypeChange(v as ExportDataset)}>
                        <SelectTrigger className="h-11 w-full rounded-2xl sm:w-[200px]">
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
                    <Button variant="outline" className="h-11 rounded-2xl" onClick={onResetFilters}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset all
                    </Button>
                    <Button
                        className="h-11 rounded-2xl bg-orange-600 hover:bg-orange-600/90 dark:bg-orange-600 dark:hover:bg-orange-600/90"
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
