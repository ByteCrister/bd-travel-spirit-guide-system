// components/dashboard/KPICard.tsx
"use client";

import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FiTrendingUp, FiTrendingDown, FiMinus } from "react-icons/fi";
import CountUp from "react-countup";
import type { DashboardKPI } from "@/types/dashboard.types";
import { formatPercent } from "@/utils/helpers/format.dashboard";

/**
 * KPICard - Modern Professional Design
 * - Clean minimalist aesthetic with subtle depth
 * - Enhanced visual hierarchy and typography
 * - Smooth micro-interactions and glassmorphism
 * - Accessible with ARIA annotations
 */

type KPIExtended = DashboardKPI & {
  format?: { precision?: number };
  meta?: { series?: number[] } | Record<string, unknown> | undefined;
};

export default React.memo(function KPICard({ kpi }: { kpi: DashboardKPI }) {
  const k = kpi as KPIExtended;
  const prefersReduced = useReducedMotion();

  const percent = formatPercent(k.changePercent);

  const { endValue, displayLabel } = useMemo(() => {
    const end = typeof k.value === "number" ? k.value : 0;
    const precision = k.format?.precision ?? 0;
    const formatted = k.currency
      ? new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: k.currency,
          maximumFractionDigits: precision,
        }).format(end)
      : new Intl.NumberFormat(undefined, { maximumFractionDigits: precision }).format(end);
    return { endValue: end, displayLabel: formatted };
  }, [k.value, k.currency, k.format?.precision]);

  const change = k.changePercent ?? 0;
  const trendIsPositive = change > 0;
  const trendIsNegative = change < 0;

  const TrendIcon = trendIsPositive ? FiTrendingUp : trendIsNegative ? FiTrendingDown : FiMinus;

  // Modern color scheme with better contrast
  const trendStyles = trendIsPositive
    ? "text-emerald-600 bg-emerald-50/80 border-emerald-200/50"
    : trendIsNegative
    ? "text-rose-600 bg-rose-50/80 border-rose-200/50"
    : "text-slate-600 bg-slate-50/80 border-slate-200/50";

  const iconBgStyles = trendIsPositive
    ? "bg-emerald-500/10"
    : trendIsNegative
    ? "bg-rose-500/10"
    : "bg-slate-500/10";

  const sparklinePath = useMemo(() => {
    const series = Array.isArray(k.meta?.series) ? (k.meta?.series as number[]) : undefined;
    if (!series || series.length < 2) return null;

    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;

    const points = series.map((v, i) => {
      const t = i / (series.length - 1);
      const x = 2 + t * 44;
      const normalized = 1 - (v - min) / range;
      const y = 2 + normalized * 20;
      return `${i === 0 ? "M" : "L"}${x} ${y}`;
    });

    return points.join(" ");
  }, [k.meta]);

  return (
    <motion.article
      layout
      initial={prefersReduced ? undefined : { opacity: 0, y: 8 }}
      animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
      whileHover={prefersReduced ? undefined : { 
        y: -4, 
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      className="group relative overflow-hidden rounded-xl bg-white border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-slate-300/60 transition-all duration-300 p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2"
      role="region"
      aria-labelledby={`kpi-${k.key}-title`}
      tabIndex={0}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/0 via-slate-50/0 to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h3
              id={`kpi-${k.key}-title`}
              className="text-sm font-medium text-slate-600 mb-1"
            >
              {k.title}
            </h3>
            
            {/* Value Display */}
            <div className="mt-2">
              <span className="sr-only" aria-live="polite" aria-atomic="true">
                {k.title} value {displayLabel}
              </span>

              <div className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
                <CountUp
                  start={0}
                  end={endValue}
                  duration={prefersReduced ? 0 : 1.4}
                  separator=","
                  decimals={k.format?.precision ?? 0}
                  preserveValue
                  formattingFn={(v) =>
                    k.currency
                      ? new Intl.NumberFormat(undefined, {
                          style: "currency",
                          currency: k.currency,
                          maximumFractionDigits: k.format?.precision ?? 0,
                        }).format(Number(v))
                      : new Intl.NumberFormat(undefined, {
                          maximumFractionDigits: k.format?.precision ?? 0,
                        }).format(Number(v))
                  }
                />
              </div>

              {k.subLabel && (
                <div className="mt-1 text-xs text-slate-500 font-medium">
                  {k.subLabel}
                </div>
              )}
            </div>
          </div>

          {/* Icon Badge */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${iconBgStyles} flex items-center justify-center`}>
            <TrendIcon 
              className={`w-5 h-5 ${trendIsPositive ? 'text-emerald-600' : trendIsNegative ? 'text-rose-600' : 'text-slate-600'}`}
              aria-hidden 
            />
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {/* Trend Indicator */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${trendStyles} backdrop-blur-sm`}
            role="status"
            aria-label={percent ? `Change percent ${percent}` : "No percent change"}
          >
            <TrendIcon className="w-3.5 h-3.5" aria-hidden />
            <span className="tabular-nums">{percent ?? "—"}</span>
          </div>

          {/* Sparkline Chart */}
          {sparklinePath && (
            <div className="flex-shrink-0 w-24 h-10 flex items-center justify-end">
              <svg
                width="48"
                height="24"
                viewBox="0 0 48 24"
                fill="none"
                className="drop-shadow-sm"
                aria-hidden
                focusable="false"
              >
                {/* Gradient definition */}
                <defs>
                  <linearGradient id={`gradient-${k.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop 
                      offset="0%" 
                      stopColor={trendIsPositive ? "#10b981" : trendIsNegative ? "#ef4444" : "#64748b"} 
                      stopOpacity="0.2"
                    />
                    <stop 
                      offset="100%" 
                      stopColor={trendIsPositive ? "#10b981" : trendIsNegative ? "#ef4444" : "#64748b"} 
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
                
                {/* Area fill */}
                <path
                  d={`${sparklinePath} L46 22 L2 22 Z`}
                  fill={`url(#gradient-${k.key})`}
                />
                
                {/* Line stroke */}
                <path
                  d={sparklinePath}
                  stroke={trendIsPositive ? "#10b981" : trendIsNegative ? "#ef4444" : "#64748b"}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Fallback description when no subLabel */}
        {!k.subLabel && !sparklinePath && (
          <div className="pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              Current period performance
            </div>
          </div>
        )}
      </div>
    </motion.article>
  );
});