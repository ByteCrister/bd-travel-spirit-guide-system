"use client";

import { useEffect, useRef } from "react";
import { getSocket } from "@/socket/initiateSocket";
import { useNotificationStore } from "@/store/notification.store";
import { LISTEN_SOCKET_NOTIFICATION_EVENT, SOCKET_NAMESPACES } from "@/constants/socket/socket.const";
import { IGuideSystemNotificationData } from "@/models/notifications/guide-system-notification.model";
import { useCurrentUserStore } from "@/store/current-user.store";

interface GuideSystemNotificationWrapperProps {
  children: React.ReactNode;
}

export function GuideSystemNotificationWrapper({ children }: GuideSystemNotificationWrapperProps) {
  const { fetchNotifications, addNotification, notifications } = useNotificationStore();
  const { baseUser } = useCurrentUserStore();
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch if logged in
    if (!baseUser?._id) return;
    
    if (!fetchedRef.current && notifications.length === 0) {
      fetchNotifications();
      fetchedRef.current = true;
    }
  }, [fetchNotifications, notifications.length, baseUser?._id]);

  useEffect(() => {
    if (!baseUser?._id) return;
    
    const socket = getSocket(SOCKET_NAMESPACES.USER_ONLINE);
    if (!socket) return;
    
    const onEmpForgotPassword = (payload: { data: IGuideSystemNotificationData }) => {
      console.log("[Socket] Employee forgot password notification:", payload);
      addNotification(payload.data);
    };
    
    socket.on(LISTEN_SOCKET_NOTIFICATION_EVENT.GUIDE_EMP_FORGOT_PASSWORD, onEmpForgotPassword);
    
    return () => {
      socket.off(LISTEN_SOCKET_NOTIFICATION_EVENT.GUIDE_EMP_FORGOT_PASSWORD, onEmpForgotPassword);
    };
  }, [addNotification, baseUser?._id]);

  return <>{children}</>;
}
