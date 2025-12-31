// components/reports/ReportsCounters.compact.tsx
"use client";

import type { FC } from "react";
import { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { REPORT_STATUS, REPORT_PRIORITY } from "@/types/reports.types";
import type { ReportListItem } from "@/types/reports.types";
import { Card } from "@/components/ui/card";
import { MdReport, MdPriorityHigh } from "react-icons/md";
import { HiCheckCircle, HiClock, HiExclamationCircle, HiXCircle } from "react-icons/hi";
import { useReportsStore } from "@/store/report.store";
import { PulseLoader } from "./PulseLoader";
import { cn } from "@/lib/utils";

const statusOrder: Array<keyof typeof REPORT_STATUS> = ["OPEN", "IN_REVIEW", "RESOLVED", "REJECTED"];
const priorityOrder: Array<keyof typeof REPORT_PRIORITY> = ["URGENT", "HIGH", "NORMAL", "LOW"];

// (statusConfig and priorityConfig kept identical to original)
const statusConfig = {
  [REPORT_STATUS.OPEN]: {
    icon: HiExclamationCircle,
    gradient: "from-amber-500 to-orange-500",
    bg: "from-amber-50 to-orange-50",
    border: "border-amber-200/50",
    text: "text-amber-700",
    iconBg: "bg-amber-100"
  },
  [REPORT_STATUS.IN_REVIEW]: {
    icon: HiClock,
    gradient: "from-blue-500 to-cyan-500",
    bg: "from-blue-50 to-cyan-50",
    border: "border-blue-200/50",
    text: "text-blue-700",
    iconBg: "bg-blue-100"
  },
  [REPORT_STATUS.RESOLVED]: {
    icon: HiCheckCircle,
    gradient: "from-emerald-500 to-green-500",
    bg: "from-emerald-50 to-green-50",
    border: "border-emerald-200/50",
    text: "text-emerald-700",
    iconBg: "bg-emerald-100"
  },
  [REPORT_STATUS.REJECTED]: {
    icon: HiXCircle,
    gradient: "from-red-500 to-rose-500",
    bg: "from-red-50 to-rose-50",
    border: "border-red-200/50",
    text: "text-red-700",
    iconBg: "bg-red-100"
  },
};

const priorityConfig = {
  [REPORT_PRIORITY.URGENT]: {
    gradient: "from-red-600 to-rose-600",
    bg: "from-red-50 to-rose-50",
    border: "border-red-300",
    text: "text-red-700",
    badgeBg: "bg-red-500"
  },
  [REPORT_PRIORITY.HIGH]: {
    gradient: "from-orange-500 to-amber-500",
    bg: "from-orange-50 to-amber-50",
    border: "border-orange-300",
    text: "text-orange-700",
    badgeBg: "bg-orange-500"
  },
  [REPORT_PRIORITY.NORMAL]: {
    gradient: "from-blue-500 to-cyan-500",
    bg: "from-blue-50 to-cyan-50",
    border: "border-blue-300",
    text: "text-blue-700",
    badgeBg: "bg-blue-500"
  },
  [REPORT_PRIORITY.LOW]: {
    gradient: "from-slate-500 to-gray-500",
    bg: "from-slate-50 to-gray-50",
    border: "border-slate-300",
    text: "text-slate-700",
    badgeBg: "bg-slate-500"
  },
};

const ReportsCounters: FC = () => {
  const { params, readCachedList, fetchListPage, cacheTtlMs } = useReportsStore();
  const [loading, setLoading] = useState(false);
  const currentEntry = readCachedList(params);

  const isStale =
    !currentEntry ||
    !currentEntry.total ||
    Date.now() - (currentEntry?.lastFetchedAt ?? 0) > cacheTtlMs ||
    (currentEntry?.docs.length ?? 0) === 0;

  useEffect(() => {
    if (isStale) {
      setLoading(true);
      void fetchListPage(params.page).finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStale]);

  const docs: ReportListItem[] = useMemo(() => currentEntry?.docs ?? [], [currentEntry]);

  const byStatus = useMemo(() => {
    const m = new Map<string, number>();
    statusOrder.forEach((k) => m.set(REPORT_STATUS[k], 0));
    for (const d of docs) m.set(d.status, (m.get(d.status) ?? 0) + 1);
    return m;
  }, [docs]);

  const byPriority = useMemo(() => {
    const m = new Map<string, number>();
    priorityOrder.forEach((k) => m.set(REPORT_PRIORITY[k], 0));
    for (const d of docs) m.set(d.priority, (m.get(d.priority) ?? 0) + 1);
    return m;
  }, [docs]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Status Card */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="overflow-hidden border-slate-200/50 bg-white/70 backdrop-blur-xl shadow-sm">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 px-4 py-3 border-b border-slate-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-gradient-to-br from-slate-600 to-slate-700 p-1.5 shadow-sm">
                  <MdReport className="text-sm text-white" aria-hidden />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Report Status</h2>
                  <p className="text-[11px] text-slate-600">Overview of all reports</p>
                </div>
              </div>

              {loading && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                  <PulseLoader size={4} />
                </motion.div>
              )}
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence initial={false}>
                {statusOrder.map((k, index) => {
                  const label = REPORT_STATUS[k];
                  const count = byStatus.get(label) ?? 0;
                  const config = statusConfig[label];
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.28, delay: index * 0.04 }}
                      whileHover={{ scale: 1.02, y: -1.5 }}
                      className={cn(
                        "relative overflow-hidden rounded-lg border p-3 transition-all",
                        "bg-gradient-to-br shadow-sm hover:shadow-md",
                        config.bg,
                        config.border
                      )}
                      role="group"
                      aria-label={`${label} count`}
                    >
                      {/* background decoration */}
                      <div className="absolute top-0 right-0 -mr-6 -mt-6 h-16 w-16 rounded-full bg-white/30 blur-2xl" />

                      <div className="relative flex items-start justify-between">
                        <div className="flex-1">
                          <div className={cn("mb-1 w-fit rounded-md p-1.5", config.iconBg)}>
                            <Icon className={cn("h-4 w-4", config.text)} aria-hidden />
                          </div>

                          <p className="text-[11px] font-medium text-slate-600 mb-1">
                            {label.replace("_", " ")}
                          </p>

                          <motion.p
                            key={count}
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className={cn("text-2xl font-bold", config.text)}
                          >
                            {count}
                          </motion.p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Priority Card */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.06 }}>
        <Card className="overflow-hidden border-slate-200/50 bg-white/70 backdrop-blur-xl shadow-sm">
          <div className="bg-gradient-to-r from-violet-50 to-purple-100/50 px-4 py-3 border-b border-violet-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-gradient-to-br from-violet-600 to-purple-600 p-1.5 shadow-sm">
                  <MdPriorityHigh className="text-sm text-white" aria-hidden />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Priority Levels</h2>
                  <p className="text-[11px] text-slate-600">Urgency breakdown</p>
                </div>
              </div>

              {loading && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                  <PulseLoader size={4} />
                </motion.div>
              )}
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence initial={false}>
                {priorityOrder.map((k, index) => {
                  const label = REPORT_PRIORITY[k];
                  const count = byPriority.get(label) ?? 0;
                  const config = priorityConfig[label];

                  return (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.28, delay: index * 0.04 }}
                      whileHover={{ scale: 1.02, y: -1.5 }}
                      className={cn(
                        "relative overflow-hidden rounded-lg border p-3 transition-all",
                        "bg-gradient-to-br shadow-sm hover:shadow-md",
                        config.bg,
                        config.border
                      )}
                      role="group"
                      aria-label={`${label} priority count`}
                    >
                      {/* background decoration */}
                      <div className="absolute -bottom-3 -right-3 h-12 w-12 rounded-full bg-white/30 blur-2xl" />

                      <div className="relative">
                        <div className="mb-2 flex items-center justify-between">
                          <span className={cn("inline-flex h-1.5 w-1.5 rounded-full", config.badgeBg)} />
                          <motion.span
                            key={count}
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className={cn("text-2xl font-bold", config.text)}
                          >
                            {count}
                          </motion.span>
                        </div>

                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                          {label}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ReportsCounters