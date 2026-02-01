// components/dashboard/ActivitiesPanel.tsx
"use client";

import React, { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { FiActivity, FiClock, FiRefreshCw } from "react-icons/fi";
import ActivityItem from "./ActivityItem";
import LoadingSkeleton from "./LoadingSkeleton";
import useDashboardStore from "@/store/dashboard.store";

export default function ActivitiesPanel() {
  const { activitiesById, activityIds, fetchActivitiesPage, fetchActivitiesState: fetchState } = useDashboardStore();

  const items = useMemo(() => activityIds.map((id) => activitiesById[id]).filter(Boolean), [activityIds, activitiesById]);

  const onLoadMore = useCallback(() => {
    fetchActivitiesPage({ page: undefined, force: false }).catch(() => { });
  }, [fetchActivitiesPage]);

  if (fetchState.loading && items.length === 0) return <LoadingSkeleton />;

  return (
    <motion.section 
      aria-labelledby="activities-heading" 
      className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-amber-50/30 to-yellow-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-xl shadow-lg">
              <FiActivity className="w-5 h-5" />
            </div>
            <div>
              <h2 id="activities-heading" className="text-lg font-bold text-slate-900 group-hover:text-orange-900 transition-colors">
                Recent Activity
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <FiClock className="w-4 h-4" />
                <span>Live updates</span>
              </div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLoadMore}
            disabled={fetchState.loading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-lg transition-all disabled:opacity-50"
            title="Refresh activities"
          >
            <FiRefreshCw className={`w-4 h-4 ${fetchState.loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>

        {/* Activities List */}
        <div role="list" aria-live="polite" className="space-y-3">
          {items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiActivity className="w-8 h-8 text-orange-500" />
              </div>
              <p className="text-slate-500 font-medium">No recent activity</p>
              <p className="text-sm text-slate-400 mt-1">Activity will appear here as it happens</p>
            </motion.div>
          ) : (
            items.map((it, index) => (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ActivityItem item={it} />
              </motion.div>
            ))
          )}
        </div>

        {/* Load More Button */}
        {items.length > 0 && (
          <div className="mt-6 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onLoadMore}
              disabled={fetchState.loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Load more activities"
            >
              {fetchState.loading ? (
                <>
                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                  Loading…
                </>
              ) : (
                <>
                  <FiActivity className="w-4 h-4" />
                  Load more
                </>
              )}
            </motion.button>
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-6 right-6 w-20 h-20 bg-gradient-to-br from-orange-100/50 to-amber-100/50 rounded-full opacity-20 group-hover:opacity-30 transition-opacity" />
      <div className="absolute bottom-6 left-6 w-12 h-12 bg-gradient-to-br from-yellow-100/50 to-orange-100/50 rounded-full opacity-20 group-hover:opacity-30 transition-opacity" />
    </motion.section>
  );
}
