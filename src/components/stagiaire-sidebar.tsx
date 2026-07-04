"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import {
  ClipboardCheck,
  FileText,
  History,
  Home,
  KanbanSquare,
  MessageCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/espace-stagiaire", labelKey: "stagiaireNav.home", icon: Home },
  { href: "/espace-stagiaire/kanban", labelKey: "stagiaireNav.kanban", icon: KanbanSquare },
  { href: "/espace-stagiaire/sessions", labelKey: "stagiaireNav.sessions", icon: History },
  {
    href: "/espace-stagiaire/evaluations",
    labelKey: "stagiaireNav.evaluations",
    icon: ClipboardCheck,
  },
  { href: "/espace-stagiaire/documents", labelKey: "stagiaireNav.documents", icon: FileText },
  { href: "/espace-stagiaire/messagerie", labelKey: "stagiaireNav.messagerie", icon: MessageCircle },
];

function isItemActive(pathname: string, href: string) {
  return href === "/espace-stagiaire" ? pathname === href : pathname.startsWith(href);
}

export function StagiaireSidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <Link href="/espace-stagiaire" className="flex items-center gap-3 px-2 py-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400 text-sm font-bold text-neutral-950">
            F
          </span>
          <span className="flex items-baseline gap-1 text-sm font-semibold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
            FUTURIX
            <span className="text-cyan-600 dark:text-cyan-400">iTech</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="gap-1 py-1">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
            {t("stagiaireNav.group_label")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ href, labelKey, icon: Icon, disabled }) => {
                const isActive = isItemActive(pathname, href);
                const label = t(labelKey);

                return (
                  <SidebarMenuItem key={href}>
                    {isActive && (
                      <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-cyan-500" />
                    )}
                    {disabled ? (
                      <SidebarMenuButton disabled tooltip={label}>
                        <Icon />
                        <span>{label}</span>
                        <Badge
                          variant="secondary"
                          className="ml-auto group-data-[collapsible=icon]:hidden"
                        >
                          {t("stagiaireNav.coming_soon")}
                        </Badge>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
                        <Link href={href}>
                          <Icon />
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
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
