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
  MessageCircle,
  Milestone,
  NotebookText,
  Settings,
  UserCog,
  UserRound,
  Wallet,
} from "lucide-react";

import { SidebarCollapseButton } from "@/components/sidebar-collapse-button";
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
    items: [
      { href: "/dashboard", labelKey: "sidebar.dashboard", icon: LayoutDashboard },
      { href: "/dashboard/messages", labelKey: "sidebar.messages", icon: MessageCircle },
    ],
  },
  {
    labelKey: "sidebar.group_management",
    items: [
      { href: "/dashboard/stagiaires", labelKey: "sidebar.stagiaires", icon: GraduationCap },
      { href: "/dashboard/encadrants", labelKey: "sidebar.encadrants", icon: UserCog },
      { href: "/dashboard/sessions", labelKey: "sidebar.sessions", icon: KanbanSquare },
      { href: "/dashboard/roadmaps", labelKey: "sidebar.roadmaps", icon: Milestone },
      { href: "/dashboard/paiements", labelKey: "sidebar.paiements", icon: Wallet },
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
      <SidebarHeader className="relative">
        <div className="flex items-center gap-2 px-2 py-2">
          <Link href="/dashboard" className="flex min-w-0 flex-1 items-center gap-3">
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
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.labelKey}>
            <SidebarGroupLabel className="text-[10px] font-semibold tracking-wider text-sidebar-foreground/50 uppercase">
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
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {isItemActive(pathname, "/dashboard/profil") && (
              <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-sidebar-primary" />
            )}
            <SidebarMenuButton
              asChild
              isActive={isItemActive(pathname, "/dashboard/profil")}
              tooltip={t("sidebar.profil")}
            >
              <Link href="/dashboard/profil">
                <UserRound />
                <span>{t("sidebar.profil")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            {isItemActive(pathname, "/dashboard/parametres") && (
              <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-sidebar-primary" />
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
