// components/dashboard/NotificationsDrawer.tsx
"use client";

import React, { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { FiBell, FiCheck, FiAlertCircle } from "react-icons/fi";
import NotificationItem from "./NotificationItem";
import useDashboardStore from "@/store/dashboard.store";

export default function NotificationsDrawer() {
  const {notificationsById, notificationIds, markNotificationRead, fetchNotifications} = useDashboardStore();

  const items = useMemo(() => notificationIds.map((id) => notificationsById[id]).filter(Boolean), [notificationIds, notificationsById]);

  const onMarkAllRead = useCallback(async () => {
    // bulk optimistic update
    for (const n of items) {
      if (!n.isRead) {
        // fire non-blocking updates; store will sync on failures
        markNotificationRead(n.id, true, true).catch(() => {});
      }
    }
    // explicitly refresh
    fetchNotifications({ force: true }).catch(() => {});
  }, [items, markNotificationRead, fetchNotifications]);

  const unreadCount = items.filter(n => !n.isRead).length;

  if (items.length === 0) {
    return (
      <motion.div 
        className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-rose-50/30 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative z-10 p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiBell className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-slate-500 font-medium">No notifications</p>
            <p className="text-sm text-slate-400 mt-1">You&apos;re all caught up!</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-rose-50/30 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-rose-500 text-white rounded-xl shadow-lg">
              <FiBell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-red-900 transition-colors">
                Notifications
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <FiAlertCircle className="w-4 h-4" />
                <span>{unreadCount} unread</span>
              </div>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMarkAllRead}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-200"
            >
              <FiCheck className="w-4 h-4" />
              Mark all read
            </motion.button>
          )}
        </div>

        {/* Notifications List */}
        <ul className="space-y-3" aria-live="polite">
          {items.map((n, index) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.05 }}
            >
              <NotificationItem item={n} onToggleRead={() => markNotificationRead(n.id, !n.isRead, true)} />
            </motion.div>
          ))}
        </ul>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-6 right-6 w-20 h-20 bg-gradient-to-br from-red-100/50 to-rose-100/50 rounded-full opacity-20 group-hover:opacity-30 transition-opacity" />
      <div className="absolute bottom-6 left-6 w-12 h-12 bg-gradient-to-br from-pink-100/50 to-rose-100/50 rounded-full opacity-20 group-hover:opacity-30 transition-opacity" />
    </motion.div>
  );
}
