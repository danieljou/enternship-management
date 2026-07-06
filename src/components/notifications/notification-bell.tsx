"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Bell, BellRing } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications } from "@/hooks/use-notifications";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions/notification-actions";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/lib/types";

function formatTimestamp(iso: string) {
  const date = new Date(iso);
  const isToday = date.toDateString() === new Date().toDateString();
  return isToday
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString();
}

export function NotificationBell({
  userId,
  initialNotifications,
}: {
  userId: string;
  initialNotifications: AppNotification[];
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    "unsupported"
  );
  const { notifications, unreadCount, markReadLocally, markAllReadLocally } = useNotifications(
    userId,
    initialNotifications
  );

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      // Read once on mount: browser-only global, unknown during SSR, so it
      // can't be derived during render without a hydration mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPermission(Notification.permission);
    }
  }, []);

  async function handleEnablePush() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      toast.success(t("topbar.notifications_push_granted"));
    } else if (result === "denied") {
      toast.error(t("topbar.notifications_push_denied"));
    }
  }

  function handleSelect(notification: AppNotification) {
    if (!notification.is_read) {
      markReadLocally(notification.id);
      startTransition(() => {
        void markNotificationRead(notification.id);
      });
    }
    if (notification.link) {
      router.push(notification.link);
    }
  }

  function handleMarkAllRead() {
    markAllReadLocally();
    startTransition(() => {
      void markAllNotificationsRead();
    });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={t("topbar.notifications")}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2.5">
          <span className="text-sm font-semibold text-foreground">{t("topbar.notifications")}</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs font-medium text-primary hover:underline"
            >
              {t("topbar.notifications_mark_all_read")}
            </button>
          )}
        </div>

        {permission === "default" && (
          <button
            type="button"
            onClick={handleEnablePush}
            className="flex w-full items-center gap-2.5 border-b px-3 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted"
          >
            <BellRing className="h-3.5 w-3.5 shrink-0 text-primary" />
            {t("topbar.notifications_enable_push")}
          </button>
        )}

        {notifications.length === 0 ? (
          <Empty className="p-2">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Bell />
              </EmptyMedia>
              <EmptyTitle>{t("topbar.notifications_empty_title")}</EmptyTitle>
              <EmptyDescription>{t("topbar.notifications_empty_description")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(notification)}
                  className={cn(
                    "flex w-full flex-col gap-0.5 border-b px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-muted",
                    !notification.is_read && "bg-primary/5"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {!notification.is_read && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                    <span className="flex-1 truncate text-xs font-medium text-foreground">
                      {notification.title}
                    </span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {formatTimestamp(notification.created_at)}
                    </span>
                  </div>
                  {notification.body && (
                    <p className="line-clamp-2 pl-3.5 text-xs text-muted-foreground">
                      {notification.body}
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
