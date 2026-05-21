"use client";

import { motion } from "framer-motion";
import { NEU_CARD, NEU_SKELETON, NEU_ICON_WELL } from "@/styles/neu.styles";

export const KpisSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.4 }}
          className={`${NEU_CARD} p-5 flex flex-col gap-4`}
        >
          {/* Top row */}
          <div className="flex items-start justify-between">
            <div className={`${NEU_ICON_WELL}`}>
              <div className={`h-5 w-5 rounded ${NEU_SKELETON}`} />
            </div>
            <div className={`h-3 w-10 rounded ${NEU_SKELETON}`} />
          </div>

          {/* Value block */}
          <div className="flex flex-col gap-2">
            <div className={`h-10 w-20 rounded-lg ${NEU_SKELETON}`} />
            <div className={`h-3 w-24 rounded ${NEU_SKELETON}`} />
          </div>

          {/* Subtitle */}
          <div className={`h-3 w-32 rounded ${NEU_SKELETON}`} />

          {/* Accent bar */}
          <div className={`h-1 w-12 rounded-full ${NEU_SKELETON}`} />
        </motion.div>
      ))}
    </div>
  );
};