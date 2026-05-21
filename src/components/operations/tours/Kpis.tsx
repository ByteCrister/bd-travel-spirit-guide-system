"use client";

import React from "react";
import { useTourDetailStore } from "@/store/tour-detail.store";
import { FiFileText, FiStar, FiUsers } from "react-icons/fi";
import { KpisSkeleton } from "./skeletons/KpisSkeleton";
import { motion, Variants } from "framer-motion";
import {
  NEU_CARD,
  NEU_CARD_HOVER,
  NEU_HEADING,
  NEU_LABEL,
  NEU_MUTED,
  NEU_ICON_WELL,
} from "@/styles/neu.styles";

// ─── Animation variants ───────────────────────────────────────
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── KPI config ───────────────────────────────────────────────
const KPI_CONFIG = [
  {
    icon: FiUsers,
    title: "Total Tours",
    subtitle: "Active list (cached)",
    accentColor: "text-[#006666]",
    accentBg: "bg-[#006666]/10",
    accentShadow:
      "shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
    dot: "bg-[#006666]",
  },
  {
    icon: FiFileText,
    title: "Published Tours",
    subtitle: "From active filter",
    accentColor: "text-[#00A63D]",
    accentBg: "bg-[#00A63D]/10",
    accentShadow:
      "shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
    dot: "bg-[#00A63D]",
  },
  {
    icon: FiStar,
    title: "Avg Rating",
    subtitle: "Published tours only",
    accentColor: "text-[#FE9900]",
    accentBg: "bg-[#FE9900]/10",
    accentShadow:
      "shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
    dot: "bg-[#FE9900]",
  },
] as const;

// ─── Component ────────────────────────────────────────────────
export const Kpis: React.FC = () => {
  const { selectCompanyKpisFromActiveTours, loading } = useTourDetailStore();
  const kpis = selectCompanyKpisFromActiveTours();

  if (loading["tours"]) return <KpisSkeleton />;

  const values = [
    kpis.totalTours,
    kpis.publishedTours,
    kpis.avgTourRating.toFixed(1),
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {KPI_CONFIG.map((kpi, index) => (
        <motion.div
          key={kpi.title}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: index * 0.08 }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className={`${NEU_CARD} ${NEU_CARD_HOVER} p-5 flex flex-col gap-4`}
        >
          {/* Top row: icon well + live indicator */}
          <div className="flex items-start justify-between">
            <div
              className={`${NEU_ICON_WELL} ${kpi.accentBg} ${kpi.accentShadow}`}
            >
              <kpi.icon className={`h-5 w-5 ${kpi.accentColor}`} />
            </div>
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${kpi.dot} animate-pulse`}
              />
              <span className={`${NEU_LABEL} text-[10px]`}>live</span>
            </span>
          </div>

          {/* Value */}
          <div className="flex flex-col gap-0.5">
            <motion.span
              className={`${NEU_HEADING} text-4xl`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.08 }}
            >
              {values[index]}
            </motion.span>
            <span className={`${NEU_LABEL}`}>{kpi.title}</span>
          </div>

          {/* Subtitle */}
          <span className={`${NEU_MUTED} text-xs`}>{kpi.subtitle}</span>

          {/* Bottom accent bar */}
          <div
            className={`h-1 w-12 rounded-full ${kpi.accentBg} shadow-[inset_1px_1px_3px_#c8c6c5,inset_-1px_-1px_3px_#ffffff]`}
          />
        </motion.div>
      ))}
    </div>
  );
};