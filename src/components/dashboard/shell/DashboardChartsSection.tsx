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
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

type Point = { date: string; count: number };
type Slice = { rating: string; count: number };

type DashboardChartsSectionProps = {
    bookingsSeries: Point[];
    ratingSlices: Slice[];
};

const brand = {
    primary: '#006666',
    surface: '#E7E5E4',
    text: '#1E2938',
    muted: '#6B7A8D',
    shadowOut: '6px 6px 12px #c8c6c4, -6px -6px 12px #ffffff',
    border: 'rgba(0,102,102,0.10)',
};

const CHART_COLORS = [
    '#006666',
    '#00a8a8',
    '#00d4aa',
    '#009966',
    '#66ccaa',
];

const tooltipStyle: React.CSSProperties = {
    borderRadius: 12,
    border: `1px solid ${brand.border}`,
    background: '#F1F2F5',
    boxShadow: '4px 4px 10px #c8c6c4, -2px -2px 6px #ffffff',
    fontSize: 11,
    fontFamily: 'var(--font-jetbrains-mono)',
    color: brand.text,
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

function ChartCard({
    title,
    description,
    icon: Icon,
    accentColor,
    iconBg,
    children,
}: {
    title: string;
    description: string;
    icon: React.ElementType;
    accentColor: string;
    iconBg: string;
    children: React.ReactNode;
}) {
    return (
        <div
            className="relative overflow-hidden rounded-2xl p-5"
            style={{
                background: brand.surface,
                boxShadow: brand.shadowOut,
                border: `1px solid ${brand.border}`,
            }}
        >
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
                style={{ background: accentColor }}
                aria-hidden
            />
            <div className="mb-4 flex items-center gap-3">
                <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{
                        background: iconBg,
                        boxShadow: 'inset 2px 2px 5px #c8c6c4, inset -2px -2px 5px #ffffff',
                    }}
                >
                    <Icon className="h-4 w-4" style={{ color: accentColor }} aria-hidden />
                </div>
                <div>
                    <p
                        className="text-sm font-bold"
                        style={{ color: brand.text, fontFamily: 'var(--font-space-mono)' }}
                    >
                        {title}
                    </p>
                    <p
                        className="text-[10px]"
                        style={{ color: brand.muted, fontFamily: 'var(--font-jetbrains-mono)' }}
                    >
                        {description}
                    </p>
                </div>
            </div>
            <div className="h-[300px] sm:h-[320px]">{children}</div>
        </div>
    );
}

function EmptyChart({ label }: { label: string }) {
    return (
        <div
            className="flex h-full items-center justify-center rounded-xl border border-dashed px-4 text-center"
            style={{
                borderColor: 'rgba(0,102,102,0.2)',
                background: 'rgba(0,102,102,0.03)',
            }}
        >
            <p
                className="text-xs"
                style={{ color: brand.muted, fontFamily: 'var(--font-jetbrains-mono)' }}
            >
                {label}
            </p>
        </div>
    );
}

export function DashboardChartsSection({ bookingsSeries, ratingSlices }: DashboardChartsSectionProps) {
    const hasBookings = bookingsSeries.some((d) => d.count > 0);
    const hasRatings = ratingSlices.some((d) => d.count > 0);

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Bookings line chart */}
            <ChartCard
                title="Bookings over time"
                description="Per-day volume inside the selected range"
                icon={TrendingUp}
                accentColor={brand.primary}
                iconBg="rgba(0,102,102,0.1)"
            >
                {hasBookings ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={bookingsSeries} margin={{ left: -16, right: 8 }}>
                            <CartesianGrid
                                strokeDasharray="4 4"
                                stroke="rgba(0,102,102,0.1)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: brand.muted, fontFamily: 'var(--font-jetbrains-mono)' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                allowDecimals={false}
                                tick={{ fontSize: 10, fill: brand.muted, fontFamily: 'var(--font-jetbrains-mono)' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend
                                wrapperStyle={{ fontSize: 11, color: brand.muted, paddingTop: 8, fontFamily: 'var(--font-jetbrains-mono)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                name="Bookings"
                                stroke={brand.primary}
                                strokeWidth={2.5}
                                dot={{ r: 3, fill: brand.primary, strokeWidth: 0 }}
                                activeDot={{ r: 5, fill: brand.text, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <EmptyChart label="No bookings in this range yet." />
                )}
            </ChartCard>

            {/* Rating pie chart */}
            <ChartCard
                title="Rating mix"
                description="Approved reviews grouped by star level"
                icon={PieChartIcon}
                accentColor="#9966cc"
                iconBg="rgba(153,102,204,0.1)"
            >
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
                                labelLine={{ stroke: brand.muted, strokeWidth: 1 }}
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
            </ChartCard>
        </div>
    );
}