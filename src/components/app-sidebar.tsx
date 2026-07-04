"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  FileText,
  GraduationCap,
  KanbanSquare,
  LayoutDashboard,
  ListChecks,
  NotebookText,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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

const NAV_GROUPS: { labelKey: string; items: NavItem[] }[] = [
  {
    labelKey: "sidebar.group_overview",
    items: [{ href: "/dashboard", labelKey: "sidebar.dashboard", icon: LayoutDashboard }],
  },
  {
    labelKey: "sidebar.group_management",
    items: [
      { href: "/dashboard/stagiaires", labelKey: "sidebar.stagiaires", icon: GraduationCap },
      { href: "/dashboard/sessions", labelKey: "sidebar.sessions", icon: KanbanSquare },
      { href: "/dashboard/etablissements", labelKey: "sidebar.etablissements", icon: Building2 },
      { href: "/dashboard/filieres", labelKey: "sidebar.filieres", icon: NotebookText },
    ],
  },
  {
    labelKey: "sidebar.group_monitoring",
    items: [
      { href: "/dashboard/taches", labelKey: "sidebar.taches", icon: ListChecks },
      { href: "/dashboard/rapports", labelKey: "sidebar.rapports", icon: FileText },
      { href: "/dashboard/analytics", labelKey: "sidebar.analytics", icon: BarChart3 },
    ],
  },
];

function isItemActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

export function AppSidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-3 px-2 py-2">
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
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.labelKey}>
            <SidebarGroupLabel className="text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
              {t(group.labelKey)}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(({ href, labelKey, icon: Icon }) => {
                  const isActive = isItemActive(pathname, href);
                  const label = t(labelKey);

                  return (
                    <SidebarMenuItem key={href}>
                      {isActive && (
                        <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-cyan-500" />
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
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {isItemActive(pathname, "/dashboard/parametres") && (
              <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-cyan-500" />
            )}
            <SidebarMenuButton
              asChild
              isActive={isItemActive(pathname, "/dashboard/parametres")}
              tooltip={t("sidebar.parametres")}
            >
              <Link href="/dashboard/parametres">
                <Settings />
                <span>{t("sidebar.parametres")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
