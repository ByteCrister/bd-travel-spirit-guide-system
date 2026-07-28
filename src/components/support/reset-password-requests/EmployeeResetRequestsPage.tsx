"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { RefreshCw, Shield, AlertCircle } from "lucide-react";
import { useResetRequestsStore } from "@/store/reset-requests.store";
import RequestList from "./RequestList";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";

/* ─── Animation variants ─────────────────────────────────────────────────── */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

/* ─── Neumorphic style tokens ────────────────────────────────────────────── */
const N = {
  surface: "bg-[#E7E5E4] dark:bg-[#2A2A2A]",
  text: "text-[#1E2938] dark:text-white",
  textMuted: "text-[#1E2938]/60 dark:text-white/50",
  raisedLg:
    "[box-shadow:8px_8px_16px_#cac8c7,-8px_-8px_16px_#ffffff] dark:[box-shadow:8px_8px_16px_#1a1a1a,-8px_-8px_16px_#3a3a3a]",
  raisedMd:
    "[box-shadow:6px_6px_12px_#cac8c7,-6px_-6px_12px_#ffffff] dark:[box-shadow:6px_6px_12px_#1a1a1a,-6px_-6px_12px_#3a3a3a]",
  raisedSm:
    "[box-shadow:4px_4px_8px_#cac8c7,-4px_-4px_8px_#ffffff] dark:[box-shadow:4px_4px_8px_#1a1a1a,-4px_-4px_8px_#3a3a3a]",
  raisedXs:
    "[box-shadow:2px_2px_4px_#cac8c7,-2px_-2px_4px_#ffffff] dark:[box-shadow:2px_2px_4px_#1a1a1a,-2px_-2px_4px_#3a3a3a]",
  pressedSm:
    "[box-shadow:inset_2px_2px_5px_#cac8c7,inset_-2px_-2px_5px_#ffffff] dark:[box-shadow:inset_2px_2px_5px_#1a1a1a,inset_-2px_-2px_5px_#3a3a3a]",
  font: "font-['Space_Mono']",
} as const;

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function EmployeeResetRequestsPage() {
  const { fetchList, currentQuery, loading, error } = useResetRequestsStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchList(currentQuery).catch(() => { });
    return () => {
      hasFetched.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchList(currentQuery);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <motion.div
      className={`min-h-screen p-1 sm:p-2 lg:p-3 ${N.surface} ${N.font} transition-colors`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ── Breadcrumbs ── */}
        <motion.div variants={itemVariants}>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Reset Password", href: "/reset-password-requests" },
            ]}
          />
        </motion.div>

        {/* ── Header ── */}
        <motion.header variants={itemVariants}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            {/* Title group */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {/* Icon — concave pressed */}
                <div
                  className={`
                    flex h-12 w-12 items-center justify-center rounded-full
                    ${N.surface}
                  `}
                >
                  <Shield className="h-6 w-6 text-[#006666]" aria-hidden />
                </div>

                <h1 className={`text-2xl sm:text-3xl font-bold ${N.text}`}>
                  Password Reset Requests
                </h1>
              </div>

              <p className={`ml-[3.75rem] text-sm ${N.textMuted}`}>
                Manage employee password reset requests
              </p>
            </div>

            {/* Refresh button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="lg"
                onClick={handleRefresh}
                disabled={loading || isRefreshing}
                className={`
                  border-0 rounded-xl px-5 font-medium gap-2
                  ${N.surface} ${N.text}
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666] focus-visible:ring-offset-2
                  disabled:opacity-50 disabled:pointer-events-none
                  transition-all duration-200
                `}
              >
                <RefreshCw
                  className={`h-4 w-4 text-[#006666] ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </motion.div>
          </div>

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <Card
                className={`
                  border-l-4 border-[#FF2157] border-t-0 border-r-0 border-b-0
                  ${N.surface} ${N.raisedSm}
                `}
              >
                <div className="flex items-start gap-3 p-4">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-[#FF2157]" />
                  <div className="flex-1 space-y-0.5">
                    <p className={`text-sm font-semibold ${N.text}`}>Error loading requests</p>
                    <p className={`text-xs ${N.textMuted}`}>{error.message}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.header>

        {/* ── Divider ── */}
        <motion.div variants={itemVariants}>
          <Separator className="border-0 h-px bg-transparent  dark:" />
        </motion.div>

        {/* ── Main content ── */}
        <motion.main variants={itemVariants}>
          <Card
            className={`
              overflow-hidden rounded-2xl border-0
              ${N.surface} ${N.raisedMd}
            `}
          >
            <RequestList />
          </Card>
        </motion.main>

      </div>
    </motion.div>
  );
}