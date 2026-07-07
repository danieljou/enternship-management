"use client";

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

import { MobileBottomNav, type MobileNavItem } from "@/components/mobile-bottom-nav";

const PRIMARY_ITEMS: MobileNavItem[] = [
  { href: "/dashboard", labelKey: "sidebar.dashboard", icon: LayoutDashboard },
  { href: "/dashboard/stagiaires", labelKey: "sidebar.stagiaires", icon: GraduationCap },
  { href: "/dashboard/sessions", labelKey: "sidebar.sessions", icon: KanbanSquare },
  { href: "/dashboard/roadmaps", labelKey: "sidebar.roadmaps", icon: Milestone },
];

const MORE_ITEMS: MobileNavItem[] = [
  { href: "/dashboard/messages", labelKey: "sidebar.messages", icon: MessageCircle },
  { href: "/dashboard/encadrants", labelKey: "sidebar.encadrants", icon: UserCog },
  { href: "/dashboard/paiements", labelKey: "sidebar.paiements", icon: Wallet },
  { href: "/dashboard/etablissements", labelKey: "sidebar.etablissements", icon: Building2 },
  { href: "/dashboard/filieres", labelKey: "sidebar.filieres", icon: NotebookText },
  { href: "/dashboard/taches", labelKey: "sidebar.taches", icon: ListChecks },
  { href: "/dashboard/rapports", labelKey: "sidebar.rapports", icon: FileText },
  { href: "/dashboard/analytics", labelKey: "sidebar.analytics", icon: BarChart3 },
  { href: "/dashboard/profil", labelKey: "sidebar.profil", icon: UserRound },
  { href: "/dashboard/parametres", labelKey: "sidebar.parametres", icon: Settings },
];

export function AppMobileNav() {
  return <MobileBottomNav primaryItems={PRIMARY_ITEMS} moreItems={MORE_ITEMS} homeHref="/dashboard" />;
}
