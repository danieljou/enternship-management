"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import { Home, UserRound } from "lucide-react";

import { SidebarCollapseButton } from "@/components/sidebar-collapse-button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/espace-encadrant", labelKey: "encadrantNav.home", icon: Home },
  { href: "/espace-encadrant/profil", labelKey: "encadrantNav.profil", icon: UserRound },
];

function isItemActive(pathname: string, href: string) {
  return href === "/espace-encadrant" ? pathname === href : pathname.startsWith(href);
}

export function EncadrantSidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="relative">
        <div className="flex items-center gap-2 px-2 py-2">
          <Link href="/espace-encadrant" className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
              F
            </span>
            <span className="flex items-baseline gap-1 text-sm font-semibold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              FUTURIX
              <span className="text-sidebar-primary">iTech</span>
            </span>
          </Link>
          <SidebarCollapseButton className="group-data-[collapsible=icon]:hidden" />
        </div>
        <SidebarCollapseButton className="hidden group-data-[collapsible=icon]:flex" />
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="gap-1 py-1">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold tracking-wider text-sidebar-foreground/50 uppercase">
            {t("encadrantNav.group_label")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
                const isActive = isItemActive(pathname, href);
                const label = t(labelKey);

                return (
                  <SidebarMenuItem key={href}>
                    {isActive && (
                      <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-sidebar-primary" />
                    )}
                    <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
                      <Link href={href}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
