// components/dashboard/NotificationItem.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiBell, FiBellOff, FiClock, FiExternalLink, FiCheck, FiX } from "react-icons/fi";
import type { DashboardNotification } from "@/types/dashboard.types";

export default function NotificationItem({ item, onToggleRead }: { item: DashboardNotification; onToggleRead: () => void }) {
  const getTypeIcon = () => {
    switch (item.type) {
      case "success":
        return <FiCheck className="w-4 h-4 text-green-500" />;
      case "error":
        return <FiX className="w-4 h-4 text-red-500" />;
      case "warning":
        return <FiBell className="w-4 h-4 text-yellow-500" />;
      default:
        return <FiBell className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeBg = () => {
    switch (item.type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getPriorityColor = () => {
    switch (item.priority) {
      case "critical":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-yellow-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <motion.li 
      className={`group relative overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-md ${getTypeBg()} ${!item.isRead ? 'ring-2 ring-red-200' : ''}`}
      role="listitem"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getTypeIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-slate-800 transition-colors">
                    {item.title}
                  </p>
                  {!item.isRead && (
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </div>
                
                {item.message && (
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {item.message}
                  </p>
                )}
                
                {item.priority && (
                  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-2 ${getPriorityColor()}`}>
                    {item.priority.toUpperCase()}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <FiClock className="w-3 h-3" />
                <time dateTime={item.createdAt}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </time>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleRead}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 ${
                item.isRead 
                  ? "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200" 
                  : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
              }`}
              aria-pressed={item.isRead}
              aria-label={item.isRead ? "Mark as unread" : "Mark as read"}
            >
              {item.isRead ? (
                <>
                  <FiBellOff className="w-3 h-3" />
                  Read
                </>
              ) : (
                <>
                  <FiBell className="w-3 h-3" />
                  Mark
                </>
              )}
            </motion.button>
            
            {item.link && (
              <motion.a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-lg transition-all"
                title="Open link"
              >
                <FiExternalLink className="w-3 h-3" />
              </motion.a>
            )}
          </div>
        </div>
      </div>
      
      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.li>
  );
}
