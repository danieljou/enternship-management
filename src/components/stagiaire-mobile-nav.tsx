"use client";

import {
  ClipboardCheck,
  FileText,
  History,
  Home,
  KanbanSquare,
  MessageCircle,
  Milestone,
  UserRound,
  Wallet,
} from "lucide-react";

import { MobileBottomNav, type MobileNavItem } from "@/components/mobile-bottom-nav";

const PRIMARY_ITEMS: MobileNavItem[] = [
  { href: "/espace-stagiaire", labelKey: "stagiaireNav.home", icon: Home },
  { href: "/espace-stagiaire/roadmap", labelKey: "stagiaireNav.roadmap", icon: Milestone },
  { href: "/espace-stagiaire/kanban", labelKey: "stagiaireNav.kanban", icon: KanbanSquare },
  { href: "/espace-stagiaire/messagerie", labelKey: "stagiaireNav.messagerie", icon: MessageCircle },
];

const MORE_ITEMS: MobileNavItem[] = [
  { href: "/espace-stagiaire/sessions", labelKey: "stagiaireNav.sessions", icon: History },
  { href: "/espace-stagiaire/evaluations", labelKey: "stagiaireNav.evaluations", icon: ClipboardCheck },
  { href: "/espace-stagiaire/documents", labelKey: "stagiaireNav.documents", icon: FileText },
  { href: "/espace-stagiaire/paiements", labelKey: "stagiaireNav.paiements", icon: Wallet },
  { href: "/espace-stagiaire/profil", labelKey: "stagiaireNav.profil", icon: UserRound },
];

export function StagiaireMobileNav() {
  return (
    <MobileBottomNav primaryItems={PRIMARY_ITEMS} moreItems={MORE_ITEMS} homeHref="/espace-stagiaire" />
  );
}
