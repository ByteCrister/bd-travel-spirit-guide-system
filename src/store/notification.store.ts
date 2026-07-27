// src/store/notification.store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { IGuideSystemNotificationData } from "@/models/notifications/guide-system-notification.model";
import api from "@/utils/axios/axios";

/* ======================================================
   TYPES
====================================================== */

export interface NotificationStoreState {
    /** Ordered list of notifications - newest first */
    notifications: IGuideSystemNotificationData[];
    /** Number of unread notifications */
    unreadCount: number;

    /** Fetch notifications from the backend */
    fetchNotifications: (limit?: number) => Promise<void>;

    /**
     * Push a new notification to the top of the list.
     * Typically called by the SocketProvider on incoming socket events.
     */
    addNotification: (notification: IGuideSystemNotificationData) => void;

    /** Mark a single notification as read by its id */
    markAsRead: (id: string) => Promise<void>;

    /** Mark all notifications as read */
    markAllAsRead: () => Promise<void>;

    /** Remove all notifications from the store (e.g. on logout) */
    clearAll: () => Promise<void>;
}

/* ======================================================
   STORE
====================================================== */

export const useNotificationStore = create<NotificationStoreState>()(
    devtools(
        (set, get) => ({
            notifications: [],
            unreadCount: 0,

            fetchNotifications: async (limit = 50) => {
                try {
                    const response = await api.get(`/notifications/guide/v1?limit=${limit}`);
                    // withErrorHandler wraps the response payload in { data: ... }
                    const notifications: IGuideSystemNotificationData[] = response.data?.data || [];
                    const unreadCount = notifications.filter((n) => !n.isRead).length;

                    set(
                        { notifications, unreadCount },
                        false,
                        "notification/fetch"
                    );
                } catch (error) {
                    console.error("Failed to fetch notifications:", error);
                }
            },

            addNotification: (notification) =>
                set(
                    (state) => ({
                        notifications: [notification, ...state.notifications],
                        unreadCount: notification.isRead
                            ? state.unreadCount
                            : state.unreadCount + 1,
                    }),
                    false,
                    "notification/add"
                ),

            markAsRead: async (id) => {
                const target = get().notifications.find((n) => n._id === id);
                if (!target || target.isRead) return;

                // Optimistic update
                set(
                    (state) => ({
                        notifications: state.notifications.map((n) =>
                            n._id === id ? { ...n, isRead: true } : n
                        ),
                        unreadCount: Math.max(0, state.unreadCount - 1),
                    }),
                    false,
                    "notification/markAsRead_optimistic"
                );

                try {
                    await api.patch(`/notifications/guide/v1/${id}/read`);
                } catch (error) {
                    console.error("Failed to mark notification as read:", error);
                    // Could revert optimistic update here if needed
                }
            },

            markAllAsRead: async () => {
                // Optimistic update
                set(
                    (state) => ({
                        notifications: state.notifications.map((n) => ({
                            ...n,
                            isRead: true,
                        })),
                        unreadCount: 0,
                    }),
                    false,
                    "notification/markAllAsRead_optimistic"
                );

                try {
                    await api.patch("/notifications/guide/v1");
                } catch (error) {
                    console.error("Failed to mark all notifications as read:", error);
                }
            },

            clearAll: async () => {
                set(
                    { notifications: [], unreadCount: 0 },
                    false,
                    "notification/clearAll_optimistic"
                );

                try {
                    await api.delete("/notifications/guide/v1");
                } catch (error) {
                    console.error("Failed to clear notifications:", error);
                }
            },
        }),
        { name: "NotificationStore" }
    )
);
