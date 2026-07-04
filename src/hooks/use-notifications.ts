"use client";

import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { AppNotification } from "@/lib/types";

export function useNotifications(userId: string, initial: AppNotification[]) {
  const [notifications, setNotifications] = useState(initial);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const notification = payload.new as AppNotification;
          setNotifications((prev) => [notification, ...prev]);

          if (
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            const browserNotification = new Notification(notification.title, {
              body: notification.body ?? undefined,
              tag: notification.id,
            });
            if (notification.link) {
              browserNotification.onclick = () => {
                window.focus();
                window.location.href = notification.link!;
              };
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  function markReadLocally(id: string) {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, is_read: true } : notification
      )
    );
  }

  function markAllReadLocally() {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));
  }

  return { notifications, unreadCount, markReadLocally, markAllReadLocally };
}
