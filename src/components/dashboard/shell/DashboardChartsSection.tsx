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
import { CHART_ACCENT, CHART_COLORS } from '@/components/dashboard/shell/dashboard-shell-utils';

type Point = { date: string; count: number };
type Slice = { rating: string; count: number };

type DashboardChartsSectionProps = {
    bookingsSeries: Point[];
    ratingSlices: Slice[];
};

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

export function DashboardChartsSection({ bookingsSeries, ratingSlices }: DashboardChartsSectionProps) {
    const hasBookings = bookingsSeries.some((d) => d.count > 0);
    const hasRatings = ratingSlices.some((d) => d.count > 0);

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden rounded-2xl border bg-card/80 shadow-sm backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Bookings over time</CardTitle>
                    <CardDescription>Per-day volume inside the selected range</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] sm:h-[320px]">
                    {hasBookings ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={bookingsSeries}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: 12,
                                        border: '1px solid hsl(var(--border))',
                                        background: 'hsl(var(--card))',
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    name="Bookings"
                                    stroke={CHART_ACCENT}
                                    strokeWidth={2.5}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChart label="No bookings in this range yet." />
                    )}
                </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-2xl border bg-card/80 shadow-sm backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Rating mix</CardTitle>
                    <CardDescription>Approved reviews grouped by star level</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] sm:h-[320px]">
                    {hasRatings ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={ratingSlices}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={56}
                                    outerRadius={96}
                                    paddingAngle={3}
                                    dataKey="count"
                                    nameKey="rating"
                                    label={pieSliceLabel}
                                >
                                    {ratingSlices.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: 12,
                                        border: '1px solid hsl(var(--border))',
                                        background: 'hsl(var(--card))',
                                    }}
                                />
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
        <div className="flex h-full items-center justify-center rounded-xl border border-dashed bg-muted/20 px-4 text-center">
            <p className="text-sm text-muted-foreground">{label}</p>
        </div>
    );
}
