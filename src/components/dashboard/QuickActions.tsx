// components/dashboard/QuickActions.tsx
"use client";

import useDashboardStore from "@/store/dashboard.store";
import React from "react";
import { motion } from "framer-motion";
import { FiZap, FiSettings } from "react-icons/fi";
import QuickActionButton from "./QuickActionButton";

export default function QuickActions() {
  const { quickActions } = useDashboardStore();

  if (!quickActions || quickActions.length === 0) return null;

  return (
    <motion.div 
      className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-rose-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl shadow-lg">
            <FiZap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-900 transition-colors">
              Quick Actions
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <FiSettings className="w-4 h-4" />
              <span>Common tasks</span>
            </div>
          </div>
        </div>

        {/* Actions List */}
        <div className="space-y-3">
          {quickActions.map((qa, index) => (
            <motion.div
              key={qa.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
            >
              <QuickActionButton action={qa} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-6 right-6 w-20 h-20 bg-gradient-to-br from-purple-100/50 to-pink-100/50 rounded-full opacity-20 group-hover:opacity-30 transition-opacity" />
      <div className="absolute bottom-6 left-6 w-12 h-12 bg-gradient-to-br from-pink-100/50 to-rose-100/50 rounded-full opacity-20 group-hover:opacity-30 transition-opacity" />
    </motion.div>
  );
}
