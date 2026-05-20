"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { RefreshCw, Shield, AlertCircle } from "lucide-react";
import { useResetRequestsStore } from "@/store/reset-requests.store";
import RequestList from "./RequestList";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

/* ------------------------------------------------------------------ */
/*  Neumorphic design tokens (light / dark)                           */
/* ------------------------------------------------------------------ */
const surfaceLight = "#E7E5E4";
const surfaceDark = "#2a2a2a";
const textLight = "#1E2938";
const textDark = "#ffffff";
const primary = "#006666";

/* ------------------------------------------------------------------ */
/*  Reusable neumorphic shadow strings                                */
/* ------------------------------------------------------------------ */
const softRaised =
  "shadow-[4px_4px_8px_#c5c3c2,-4px_-4px_8px_#ffffff]";
const softRaisedDark =
  "dark:shadow-[4px_4px_8px_#1f1f1f,-4px_-4px_8px_#3a3a3a]";
const pressed =
  "shadow-[inset_2px_2px_4px_#c5c3c2,inset_-2px_-2px_4px_#ffffff]";
const pressedDark =
  "dark:shadow-[inset_2px_2px_4px_#1f1f1f,inset_-2px_-2px_4px_#3a3a3a]";
const elevatedCard =
  "shadow-[8px_8px_16px_#c5c3c2,-8px_-8px_16px_#ffffff]";
const elevatedCardDark =
  "dark:shadow-[8px_8px_16px_#1f1f1f,-8px_-8px_16px_#3a3a3a]";

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
      className={`min-h-screen p-4 md:p-6 font-['Space_Mono'] bg-[${surfaceLight}] dark:bg-[${surfaceDark}]`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="mx-auto max-w-7xl">
        {/* ---------- Header ---------- */}
        <motion.header className="mb-8" variants={itemVariants}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {/* Neumorphic icon container (concave) */}
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full bg-[${surfaceLight}] p-2.5 ${pressed} ${pressedDark} dark:bg-[${surfaceDark}]`}
                >
                  <Shield className="h-6 w-6 text-[#006666] dark:text-[#4db8b8]" />
                </div>
                <h1
                  className={`text-3xl font-bold text-[${textLight}] dark:text-[${textDark}]`}
                >
                  Password Reset Requests
                </h1>
              </div>
              <p className="ml-14 text-sm text-[#64748b] dark:text-[#94a3b8]">
                Manage employee password reset requests
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                size="lg"
                onClick={handleRefresh}
                disabled={loading || isRefreshing}
                className={`
                  border-0 bg-[${surfaceLight}] text-[${textLight}] rounded-xl px-5 py-2.5 font-medium
                  ${softRaised} ${softRaisedDark}
                  hover:${pressed} hover:${pressedDark}
                  active:${pressed} active:${pressedDark}
                  focus-visible:ring-2 focus-visible:ring-[${primary}]
                  disabled:opacity-50 disabled:hover:shadow-none
                  dark:bg-[${surfaceDark}] dark:text-[${textDark}]
                  transition-shadow duration-200
                `}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 text-[${primary}] dark:text-[#4db8b8] ${isRefreshing ? "animate-spin" : ""
                    }`}
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
              className="mt-4"
            >
              <Card
                className={`border-l-4 border-[#FF2157] bg-[${surfaceLight}] ${softRaised} ${softRaisedDark} dark:bg-[${surfaceDark}]`}
              >
                <div className="flex items-center gap-3 p-4">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-[#FF2157]" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1E2938] dark:text-white">
                      Error loading requests
                    </p>
                    <p className="mt-0.5 text-xs text-[#475569] dark:text-[#94a3b8]">
                      {error.message}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.header>

        {/* ---------- Separator ---------- */}
        <motion.div variants={itemVariants}>
          <Separator className="mb-8 border-t border-[#d1cfce] dark:border-[#3a3a3a]" />
        </motion.div>

        {/* ---------- Main content ---------- */}
        <motion.main variants={itemVariants}>
          <Card
            className={`overflow-hidden rounded-2xl border-0 bg-[${surfaceLight}] ${elevatedCard} ${elevatedCardDark} dark:bg-[${surfaceDark}]`}
          >
            <RequestList />
          </Card>
        </motion.main>
      </div>
    </motion.div>
  );
}