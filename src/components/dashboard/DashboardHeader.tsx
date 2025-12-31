// components/dashboard/DashboardHeader.tsx
"use client";

import React, { useCallback, useMemo, useState } from "react";
import { FiSearch, FiBell, FiRefreshCw, FiCalendar, FiTrendingUp } from "react-icons/fi";
import { motion } from "framer-motion";
import { DashboardTimeRange } from "@/types/dashboard.types";
import useDashboardStore from "@/store/dashboard.store";

const TIME_RANGES: { label: string; value: DashboardTimeRange; icon: React.ReactNode }[] = [
  { label: "Last 24 hours", value: DashboardTimeRange.LAST_24_HOURS, icon: <FiTrendingUp className="w-4 h-4" /> },
  { label: "Last 7 days", value: DashboardTimeRange.LAST_7_DAYS, icon: <FiCalendar className="w-4 h-4" /> },
  { label: "Last 30 days", value: DashboardTimeRange.LAST_30_DAYS, icon: <FiCalendar className="w-4 h-4" /> },
  { label: "Year to date", value: DashboardTimeRange.YEAR_TO_DATE, icon: <FiCalendar className="w-4 h-4" /> },
];

export default function DashboardHeader() {
  const {selectedTimeRange, fetchDashboard, getUnreadNotificationCount: unreadCount} = useDashboardStore();
 
  const [query, setQuery] = useState("");

  // Note: searchQuery exists in store but is not manipulated here beyond local demo.
  // If wanted, call store setter (not included in store currently). We'll set selectedTimeRange via fetchDashboard opts.

  const onTimeRangeChange = useCallback(
    (val: DashboardTimeRange) => {
      fetchDashboard({ timeRange: val, force: false }).catch(() => {});
    },
    [fetchDashboard]
  );

  const onRefresh = useCallback(() => {
    fetchDashboard({ force: true }).catch(() => {});
  }, [fetchDashboard]);

  const ariaControls = useMemo(() => "notifications-drawer", []);

  const currentTimeRange = TIME_RANGES.find(r => r.value === selectedTimeRange);

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Header Background */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg shadow-black/5" />
      
      <div className="relative z-10 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Title Section */}
          <div className="space-y-2">
            <motion.h1 
              className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              Dashboard
            </motion.h1>
            <motion.p 
              className="text-slate-600 font-medium"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Real-time insights and analytics
            </motion.p>
          </div>

          {/* Controls Section */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Search */}
            <div className="relative group">
              <label className="relative block">
                <span className="sr-only">Search dashboard</span>
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search activities, notifications..."
                  className="w-full sm:w-80 pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  aria-label="Search dashboard"
                />
              </label>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <label htmlFor="timeRange" className="sr-only">Time range</label>
                <div className="flex items-center gap-2 px-4 py-3 bg-white/50 border border-slate-200 rounded-xl">
                  {currentTimeRange?.icon}
                  <select
                    id="timeRange"
                    value={selectedTimeRange}
                    onChange={(e) => onTimeRangeChange(e.target.value as DashboardTimeRange)}
                    className="bg-transparent border-none outline-none text-slate-700 font-medium cursor-pointer"
                    aria-label="Select time range"
                  >
                    {TIME_RANGES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Refresh Button */}
              <motion.button
                type="button"
                onClick={onRefresh}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200"
                aria-label="Refresh dashboard"
                title="Refresh"
              >
                <FiRefreshCw className="w-5 h-5" aria-hidden />
                <span className="sr-only">Refresh</span>
              </motion.button>

              {/* Notifications Button */}
              <motion.button
                type="button"
                aria-controls={ariaControls}
                aria-expanded={false}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative inline-flex items-center justify-center w-12 h-12 bg-white/50 border border-slate-200 text-slate-700 rounded-xl hover:bg-white/80 transition-all duration-200"
                title="Notifications"
              >
                <FiBell className="w-5 h-5" aria-hidden />
                {unreadCount() > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold w-6 h-6 shadow-lg"
                  >
                    {unreadCount()}
                  </motion.span>
                )}
                <span className="sr-only">Open notifications</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
