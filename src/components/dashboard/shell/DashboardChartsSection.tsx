'use client';

import {
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

type Point = { date: string; count: number };
type Slice = { rating: string; count: number };

type DashboardChartsSectionProps = {
    bookingsSeries: Point[];
    ratingSlices: Slice[];
};

const CHART_LINE_COLOR = '#64748b'; // slate-500
const CHART_COLORS = [
    '#0f172a', // slate-900
    '#334155', // slate-700
    '#64748b', // slate-500
    '#94a3b8', // slate-400
    '#cbd5e1', // slate-300
];

function pieSliceLabel(props: PieLabelRenderProps) {
    const pct = typeof props.percent === 'number' ? props.percent : 0;
    const label =
        props.name != null && props.name !== ''
            ? String(props.name)
            : typeof props.payload === 'object' &&
                props.payload !== null &&
                'rating' in props.payload
              ? String((props.payload as Slice).rating)
              : '';
    return `${label} (${(pct * 100).toFixed(0)}%)`;
}

const tooltipStyle = {
    borderRadius: 14,
    border: '1px solid hsl(215 20% 88%)',
    background: 'hsl(210 40% 98%)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    fontSize: 12,
};

const tooltipStyleDark = {
    borderRadius: 14,
    border: '1px solid hsl(215 27% 27%)',
    background: 'hsl(222 47% 11%)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    fontSize: 12,
};

export function DashboardChartsSection({ bookingsSeries, ratingSlices }: DashboardChartsSectionProps) {
    const hasBookings = bookingsSeries.some((d) => d.count > 0);
    const hasRatings = ratingSlices.some((d) => d.count > 0);

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Bookings line chart */}
            <Card className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/60 to-slate-100/40 shadow-md shadow-slate-200/50 dark:border-slate-700/60 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900/60 dark:shadow-slate-900/40">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/10" aria-hidden />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 opacity-70" aria-hidden />
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-50">
                                Bookings over time
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-400">
                                Per-day volume inside the selected range
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="h-[300px] sm:h-[320px]">
                    {hasBookings ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={bookingsSeries} margin={{ left: -16, right: 8 }}>
                                <CartesianGrid
                                    strokeDasharray="4 4"
                                    stroke="hsl(215 20% 90%)"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend
                                    wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 8 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    name="Bookings"
                                    stroke={CHART_LINE_COLOR}
                                    strokeWidth={2.5}
                                    dot={{ r: 3, fill: '#64748b', strokeWidth: 0 }}
                                    activeDot={{ r: 5, fill: '#0f172a', strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChart label="No bookings in this range yet." />
                    )}
                </CardContent>
            </Card>

            {/* Rating pie chart */}
            <Card className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/60 to-slate-100/40 shadow-md shadow-slate-200/50 dark:border-slate-700/60 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900/60 dark:shadow-slate-900/40">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/10" aria-hidden />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-violet-500 via-purple-400 to-fuchsia-300 opacity-70" aria-hidden />
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                            <PieChartIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" aria-hidden />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-50">
                                Rating mix
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-400">
                                Approved reviews grouped by star level
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="h-[300px] sm:h-[320px]">
                    {hasRatings ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={ratingSlices}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="count"
                                    nameKey="rating"
                                    label={pieSliceLabel}
                                    labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                                >
                                    {ratingSlices.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                                            stroke="transparent"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChart label="No review distribution for this range." />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function EmptyChart({ label }: { label: string }) {
    return (
        <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 text-center dark:border-slate-700 dark:bg-slate-800/30">
            <p className="text-sm text-slate-400 dark:text-slate-500">{label}</p>
        </div>
    );
}