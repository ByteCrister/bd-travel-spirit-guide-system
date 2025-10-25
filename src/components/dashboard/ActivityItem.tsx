// components/dashboard/ActivityItem.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiUser, FiClock, FiAlertTriangle, FiInfo, FiXCircle } from "react-icons/fi";
import type { DashboardActivity } from "@/types/dashboard.types";
import { formatRelativeDate } from "@/utils/helpers/format.dashboard";

export default React.memo(function ActivityItem({ item }: { item: DashboardActivity }) {
  const getSeverityIcon = () => {
    switch (item.severity) {
      case "critical":
        return <FiXCircle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <FiAlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <FiInfo className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityBg = () => {
    switch (item.severity) {
      case "critical":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <motion.div 
      role="listitem" 
      tabIndex={0} 
      className={`group relative overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500/50 ${getSeverityBg()}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getSeverityIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 group-hover:text-slate-800 transition-colors">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <FiClock className="w-3 h-3" />
                <time dateTime={item.createdAt}>
                  {formatRelativeDate(item.createdAt)}
                </time>
              </div>
            </div>
            
            {item.actor?.name && (
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                <FiUser className="w-3 h-3" />
                <span>By {item.actor.name}</span>
                {item.actor.role && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                    {item.actor.role}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
});
