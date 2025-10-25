// components/dashboard/DashboardShell.tsx
"use client";

import React, { Suspense, useEffect } from "react";
import { useReducedMotion, motion } from "framer-motion";
import DashboardHeader from "./DashboardHeader";
import KPIGrid from "./KPIGrid";
import ChartsGrid from "./ChartsGrid";
import NotificationsDrawer from "./NotificationsDrawer";
import QuickActions from "./QuickActions";
import LoadingSkeleton from "./LoadingSkeleton";
import ErrorBanner from "./ErrorBanner";
import useDashboardStore from "@/store/dashboard.store";
import ActivitiesPanel from "./ActivitiesPanel";

export default function DashboardShell() {
  const {fetchDashboard, fetchDashboardState: fetchState, cacheMeta, lastHydratedMs} = useDashboardStore();
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    // client mount trigger
    fetchDashboard().catch(() => {
      // fetchDashboard will set store error — UI reads it
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const container = {
    hidden: { opacity: 0, y: 8 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.1
      } 
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <main className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        
        <div className="relative z-10 p-4 md:p-6 lg:p-8">
          <DashboardHeader />
          
          {fetchState.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <ErrorBanner message={fetchState.error} onRetry={() => fetchDashboard({ force: true })} />
            </motion.div>
          )}
          
          <motion.div
            initial="hidden"
            animate="show"
            variants={prefersReduced ? undefined : container}
            className="space-y-8 mt-8"
          >
            {/* KPI Section */}
            <motion.section 
              aria-labelledby="kpis-heading"
              className="relative"
            >
              <h2 id="kpis-heading" className="sr-only">Key performance indicators</h2>
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 rounded-2xl blur-xl opacity-50" />
              <div className="relative">
                <KPIGrid />
              </div>
            </motion.section>

            {/* Charts Section */}
            <Suspense fallback={<LoadingSkeleton />}>
              <motion.section 
                aria-labelledby="charts-heading"
                className="relative"
              >
                <h2 id="charts-heading" className="sr-only">Charts</h2>
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-cyan-600/10 rounded-2xl blur-xl opacity-50" />
                <div className="relative">
                  <ChartsGrid />
                </div>
              </motion.section>
            </Suspense>

            {/* Bottom Grid */}
            <motion.div 
              className="grid gap-8 grid-cols-1 lg:grid-cols-3"
              variants={prefersReduced ? undefined : {
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { delay: 0.2 } }
              }}
            >
              <div className="lg:col-span-2">
                <ActivitiesPanel />
              </div>
              <aside className="lg:col-span-1 space-y-6">
                <QuickActions />
                <NotificationsDrawer />
              </aside>
            </motion.div>
          </motion.div>
        </div>
        
        <div className="sr-only" aria-hidden>
          {/* cache metadata for devs */}
          <code>{cacheMeta ? `cache:${cacheMeta.cacheKey} hydrated:${lastHydratedMs}` : "no-cache"}</code>
        </div>
      </main>
    </div>
  );
}
