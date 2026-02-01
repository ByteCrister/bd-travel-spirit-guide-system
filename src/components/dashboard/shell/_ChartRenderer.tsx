"use client";

import React, { useMemo, useCallback } from "react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useReducedMotion } from "framer-motion";
import type { DashboardChart, TimeSeriesPoint } from "@/types/dashboard.types";
import { formatNumber } from "@/utils/helpers/format.dashboard";

export type ChartRendererProps = {
    chart: DashboardChart;
    height?: number;
    onPointClick?: (point: TimeSeriesPoint | { category: string; value: number }) => void;
};

const DEFAULT_HEIGHT = 220;
const COLORS = ["#0ea5e9", "#34d399", "#f97316", "#fb7185", "#a78bfa", "#60a5fa"];

function isTimeSeries(
    series: TimeSeriesPoint[] | { category: string; value: number }[]
): series is TimeSeriesPoint[] {
    return Array.isArray(series) && series.length > 0 && "timestamp" in series[0];
}

export default function ChartRenderer({
    chart,
    height = DEFAULT_HEIGHT,
    onPointClick,
}: ChartRendererProps) {
    const reduced = useReducedMotion();

    const ariaLabel = `${chart.title ?? "Chart"} visualization`;
    const ariaDescId = `chart-desc-${chart.id}`;

    const series = useMemo(() => chart.series ?? [], [chart.series]);
    const isTS = isTimeSeries(series);

    const formattedData = useMemo(() => {
        if (isTS) {
            return (series as TimeSeriesPoint[]).map((p) => ({ x: p.timestamp, value: p.value, raw: p }));
        }
        return (series as { category: string; value: number }[]).map((p) => ({
            name: p.category,
            value: p.value,
            raw: p,
        }));
    }, [series, isTS]);

    const handlePointActivate = useCallback(
        (raw: TimeSeriesPoint | { category: string; value: number }) => {
            if (!onPointClick) return;
            onPointClick(raw);
        },
        [onPointClick]
    );

    const valueFormatter = useCallback(
        (v: number) => {
            if (chart.format?.currency) return formatNumber(v, chart.format.currency, chart.format.precision ?? 0);
            return formatNumber(v, undefined, chart.format?.precision ?? 0);
        },
        [chart.format]
    );

    if (chart.type === "pie" || chart.type === "donut") {
        const pieData = formattedData as { name: string; value: number; raw: unknown }[];

        return (
            <div
                role="img"
                aria-label={ariaLabel}
                aria-describedby={ariaDescId}
                className="w-full h-[220px] flex items-center justify-center"
            >
                <ResponsiveContainer width="100%" height={height}>
                    <PieChart>
                        <Tooltip formatter={(val: number) => valueFormatter(val)} />
                        <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={chart.type === "donut" ? 48 : 0}
                            outerRadius={Math.max(64, Math.min(96, Math.floor(height / 2.5)))}
                            paddingAngle={4}
                            isAnimationActive={!reduced}
                        >
                            {pieData.map((entry, idx) => (
                                <Cell
                                    key={`cell-${idx}`}
                                    fill={COLORS[idx % COLORS.length]}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`${entry.name}: ${valueFormatter(entry.value)}`}
                                    onKeyDown={(e: React.KeyboardEvent<SVGElement>) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            handlePointActivate(entry.raw as TimeSeriesPoint | { category: string; value: number });
                                        }
                                    }}
                                    onClick={() =>
                                        handlePointActivate(entry.raw as TimeSeriesPoint | { category: string; value: number })
                                    }
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                <p id={ariaDescId} className="sr-only">
                    {chart.title ?? "Chart"} showing {pieData.length} slices.
                </p>
            </div>
        );
    }

    // Time series charts
    const normalisedData = (formattedData as { x?: number; name?: string; value: number; raw: unknown }[]).map(
        (d) => {
            const x = d.x ?? d.name;
            const label =
                typeof x === "number"
                    ? new Date(x).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                    : String(x);
            return { ...d, label };
        }
    );

    const commonProps = {
        data: normalisedData,
        syncId: chart.id,
        margin: { top: 6, right: 12, left: 6, bottom: 20 },
    } as const;

    return (
        <div role="img" aria-label={ariaLabel} aria-describedby={ariaDescId} className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height={height}>
                {chart.type === "area" ? (
                    <AreaChart {...commonProps}>
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(val: number) => valueFormatter(val)} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={COLORS[0]}
                            fill={`${COLORS[0]}33`}
                            isAnimationActive={!reduced}
                            activeDot={{ r: 6 }}
                        />
                    </AreaChart>
                ) : chart.type === "bar" ? (
                    <BarChart {...commonProps}>
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(val: number) => valueFormatter(val)} />
                        <Bar dataKey="value" fill={COLORS[1]} isAnimationActive={!reduced}>
                            {normalisedData.map((entry, idx) => (
                                <Cell
                                    key={`cell-${idx}`}
                                    fill={COLORS[idx % COLORS.length]}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`${entry.label}: ${valueFormatter(entry.value)}`}
                                    onKeyDown={(e: React.KeyboardEvent<SVGElement>) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            handlePointActivate(entry.raw as TimeSeriesPoint | { category: string; value: number });
                                        }
                                    }}
                                    onClick={() =>
                                        handlePointActivate(entry.raw as TimeSeriesPoint | { category: string; value: number })
                                    }
                                />

                            ))}
                        </Bar>
                    </BarChart>
                ) : (
                    <LineChart {...commonProps}>
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(val: number) => valueFormatter(val)} />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={COLORS[0]}
                            strokeWidth={2}
                            dot={{ r: 3, strokeWidth: 0 }}
                            activeDot={{ r: 6 }}
                            isAnimationActive={!reduced}
                        />
                    </LineChart>
                )}
            </ResponsiveContainer>

            <p id={ariaDescId} className="sr-only">
                {chart.title ?? "Chart"} with {normalisedData.length} points.
            </p>
        </div>
    );
}
