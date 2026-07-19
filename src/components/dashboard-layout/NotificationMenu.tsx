"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  MessageCircle,
  AlertCircle,
  Flag,
  Settings,
  KeyRound,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/store/notification.store";
import { IGuideSystemNotificationData } from "@/models/notifications/guide-system-notification.model";
import { LISTEN_SOCKET_NOTIFICATION_EVENT } from "@/constants/socket/socket.const";
import { formatDistanceToNow } from "date-fns";

/* ------------------------------------------------------------------
   Type mapping: guide notification type → display category
------------------------------------------------------------------ */

type DisplayCategory = "message" | "update" | "system" | "flag" | "password";

function getDisplayCategory(type: string): DisplayCategory {
  switch (type) {
    case LISTEN_SOCKET_NOTIFICATION_EVENT.GUIDE_EMP_FORGOT_PASSWORD:
    case LISTEN_SOCKET_NOTIFICATION_EVENT.GUIDE_FORGOT_PASSWORD:
      return "password";
    case "new_booking":
    case "booking_cancelled":
      return "message";
    case "content_flagged":
    case "refund_requested":
      return "flag";
    case "system_error":
    case "high_traffic_alert":
    case "low_inventory":
      return "system";
    default:
      return "update";
  }
}

const notificationIcons: Record<DisplayCategory, React.ElementType> = {
  message: MessageCircle,
  update: Settings,
  system: AlertCircle,
  flag: Flag,
  password: KeyRound,
};

const notificationAccents: Record<DisplayCategory, string> = {
  message:  "text-[#006666] bg-[#006666]/10",
  update:   "text-[#00A63D] bg-[#00A63D]/10",
  system:   "text-[#FE9900] bg-[#FE9900]/10",
  flag:     "text-[#FF2157] bg-[#FF2157]/10",
  password: "text-[#7C3AED] bg-[#7C3AED]/10",
};

/* ------------------------------------------------------------------
   Helpers
------------------------------------------------------------------ */

function formatTimestamp(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

/* ------------------------------------------------------------------
   Component
------------------------------------------------------------------ */

export function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotificationStore();

  const handleNotificationClick = (notification: IGuideSystemNotificationData) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-xl",
          "bg-[#E7E5E4] text-[#1E2938]",
          "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]",
          "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
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
              "shadow-[2px_2px_4px_#FF2157,-1px_-1px_2px_rgba(255,255,255,0.8)]"
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
                "shadow-[6px_6px_16px_#c8c6c5,-6px_-6px_16px_#ffffff]",
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
                      "shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]",
                      "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
                      "transition-all duration-150"
                    )}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <ScrollArea className="max-h-96">
                <div className="p-2 space-y-1">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-[#1E2938]/40">
                      <Bell className="h-8 w-8 opacity-30" />
                      <p className="text-xs font-[family-name:var(--font-jetbrains-mono)]">
                        No notifications yet
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification, index) => {
                      const category = getDisplayCategory(notification.type);
                      const Icon = notificationIcons[category];
                      return (
                        <motion.div
                          key={notification._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04 }}
                          onClick={() => handleNotificationClick(notification)}
                          className={cn(
                            "flex items-start gap-3 rounded-xl p-3 cursor-pointer transition-all duration-150",
                            "font-[family-name:var(--font-jetbrains-mono)]",
                            notification.isRead
                              ? [
                                  "shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]",
                                  "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
                                ]
                              : [
                                  "shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
                                  "border border-[#006666]/20",
                                ]
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
                              notificationAccents[category]
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
                              {formatTimestamp(notification.createdAt)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}