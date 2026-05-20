"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  MessageCircle,
  AlertCircle,
  Flag,
  Settings,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "message" | "update" | "system" | "flag";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "message",
    title: "New Support Ticket",
    message: "User John Doe has submitted a new support request",
    timestamp: "2 min ago",
    isRead: false,
  },
  {
    id: "2",
    type: "update",
    title: "System Update",
    message: "Dashboard has been updated with new features",
    timestamp: "1 hour ago",
    isRead: false,
  },
  {
    id: "3",
    type: "flag",
    title: "Content Flagged",
    message: "A tour listing has been flagged for review",
    timestamp: "3 hours ago",
    isRead: true,
  },
  {
    id: "4",
    type: "system",
    title: "Backup Complete",
    message: "Daily backup has been completed successfully",
    timestamp: "1 day ago",
    isRead: true,
  },
];

const notificationIcons = {
  message: MessageCircle,
  update: Settings,
  system: AlertCircle,
  flag: Flag,
};

const notificationAccents: Record<string, string> = {
  message: "text-[#006666] bg-[#006666]/10",
  update:  "text-[#00A63D] bg-[#00A63D]/10",
  system:  "text-[#FE9900] bg-[#FE9900]/10",
  flag:    "text-[#FF2157] bg-[#FF2157]/10",
};

export function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-xl",
          "bg-[#E7E5E4] text-[#1E2938]",
          "shadow-[3px_3px_8px_rgba(0,0,0,0.13),-3px_-3px_8px_rgba(255,255,255,0.9)]",
          "hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.8)]",
          "transition-all duration-200 focus:outline-none"
        )}
        whileTap={{ scale: 0.95 }}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={isOpen}
      >
        <motion.div animate={{ rotate: isOpen ? 15 : 0 }} transition={{ duration: 0.2 }}>
          <Bell className="h-5 w-5" />
        </motion.div>

        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              "absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full",
              "bg-[#FF2157] text-white text-[10px] font-bold",
              "font-[family-name:var(--font-space-mono)]",
              "shadow-[0_2px_6px_rgba(255,33,87,0.4)]"
            )}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={cn(
                "absolute right-0 top-12 z-50 w-80 rounded-2xl overflow-hidden",
                "bg-[#E7E5E4]",
                "shadow-[6px_6px_20px_rgba(0,0,0,0.14),-6px_-6px_20px_rgba(255,255,255,0.9)]",
                "border border-[#d0cecc]"
              )}
              role="dialog"
              aria-label="Notifications panel"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#d0cecc]">
                <h3 className="font-[family-name:var(--font-space-mono)] text-sm font-bold tracking-tight text-[#1E2938]">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className={cn(
                      "text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-lg",
                      "font-[family-name:var(--font-space-mono)] text-[#006666]",
                      "shadow-[1px_1px_4px_rgba(0,0,0,0.1),-1px_-1px_4px_rgba(255,255,255,0.8)]",
                      "hover:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1),inset_-1px_-1px_3px_rgba(255,255,255,0.7)]",
                      "transition-all duration-150"
                    )}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <ScrollArea className="max-h-96">
                <div className="p-2 space-y-1">
                  {notifications.map((notification, index) => {
                    const Icon = notificationIcons[notification.type];
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        onClick={() => markAsRead(notification.id)}
                        className={cn(
                          "flex items-start gap-3 rounded-xl p-3 cursor-pointer transition-all duration-150",
                          "font-[family-name:var(--font-jetbrains-mono)]",
                          notification.isRead
                            ? [
                                "shadow-[1px_1px_4px_rgba(0,0,0,0.08),-1px_-1px_4px_rgba(255,255,255,0.7)]",
                                "hover:shadow-[inset_1px_1px_4px_rgba(0,0,0,0.08),inset_-1px_-1px_4px_rgba(255,255,255,0.6)]",
                              ]
                            : [
                                "shadow-[inset_1px_1px_4px_rgba(0,0,0,0.08),inset_-1px_-1px_4px_rgba(255,255,255,0.6)]",
                                "border border-[#006666]/20",
                              ]
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
                            notificationAccents[notification.type]
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-[#1E2938] truncate">
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#006666]" />
                            )}
                          </div>
                          <p className="text-[11px] text-[#1E2938]/50 line-clamp-2 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-[#1E2938]/35 mt-1 tracking-wide">
                            {notification.timestamp}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}