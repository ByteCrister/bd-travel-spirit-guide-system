// components/dashboard/QuickActionButton.tsx
"use client";

import React, { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { FiZap, FiLoader } from "react-icons/fi";
import type { DashboardQuickAction } from "@/types/dashboard.types";
import useDashboardStore from "@/store/useDashboardStore";

export default function QuickActionButton({ action }: { action: DashboardQuickAction }) {
  const {performQuickAction, fetchDashboard} = useDashboardStore();
  const [isExecuting, setIsExecuting] = useState(false);

  const onExecute = useCallback(async () => {
    if (action.requiresConfirmation && !confirm(`Confirm: ${action.label}?`)) return;
    
    setIsExecuting(true);
    try {
      const res = await performQuickAction(action.actionKey, action.payload);
      if (res.ok) {
        // if quick action invalidates dashboard, force refresh
        await fetchDashboard({ force: true }).catch(() => {});
      } else {
        alert(res.error ?? "Action failed");
      }
    } finally {
      setIsExecuting(false);
    }
  }, [action, performQuickAction, fetchDashboard]);

  return (
    <motion.button
      type="button"
      onClick={onExecute}
      disabled={isExecuting}
      className="group relative w-full text-left p-4 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={action.label}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {isExecuting ? (
            <FiLoader className="w-5 h-5 text-purple-500 animate-spin" />
          ) : (
            <FiZap className="w-5 h-5 text-purple-500 group-hover:text-purple-600 transition-colors" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-slate-900 group-hover:text-purple-900 transition-colors">
              {action.label}
            </span>
            {action.requiresConfirmation && (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                Confirmation required
              </span>
            )}
          </div>
          
          {action.description && (
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
              {action.description}
            </p>
          )}
        </div>
      </div>
      
      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
    </motion.button>
  );
}
