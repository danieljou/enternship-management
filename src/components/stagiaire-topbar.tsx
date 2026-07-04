"use client";

import { useTranslation } from "react-i18next";
import { LogOut } from "lucide-react";

import { logout } from "@/app/dashboard/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageToggle } from "@/components/language-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { AppNotification } from "@/lib/types";

export function StagiaireTopbar({
  email,
  userId,
  initialNotifications,
}: {
  email: string | null;
  userId: string;
  initialNotifications: AppNotification[];
}) {
  const { t } = useTranslation();
  const initials = email ? email.slice(0, 2).toUpperCase() : "?";

  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 rounded-t-xl border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-6">
      <SidebarTrigger />

      <div className="ml-auto flex items-center gap-1">
        <NotificationBell userId={userId} initialNotifications={initialNotifications} />
        <LanguageToggle />
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="ml-1 rounded-full">
              <Avatar size="sm">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {email && (
              <>
                <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
                  {email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                void logout();
              }}
            >
              <LogOut />
              {t("stagiaireSpace.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
