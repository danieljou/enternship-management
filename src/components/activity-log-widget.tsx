"use client";

import { useTranslation } from "react-i18next";
import {
  Banknote,
  CheckSquare,
  History,
  Milestone,
  UserCog,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import type { ActivityActionType } from "@/lib/activity-log";

export interface ActivityLogItem {
  id: string;
  actorNom: string | null;
  actorPrenom: string | null;
  actionType: ActivityActionType;
  description: string;
  createdAt: string;
}

const ACTION_ICONS: Record<ActivityActionType, LucideIcon> = {
  stagiaire_created: UserPlus,
  encadrant_created: UserCog,
  roadmap_assigned: Milestone,
  tache_created: CheckSquare,
  paiement_recorded: Banknote,
};

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days} j`;
  return new Date(iso).toLocaleDateString();
}

export function ActivityLogWidget({ items }: { items: ActivityLogItem[] }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl bg-card p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.7)]">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <History className="h-4 w-4" />
        {t("dashboard.activity_title")}
      </h2>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{t("dashboard.activity_empty")}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {items.map((item) => {
            const Icon = ACTION_ICONS[item.actionType] ?? History;
            const actorName =
              item.actorPrenom || item.actorNom
                ? `${item.actorPrenom ?? ""} ${item.actorNom ?? ""}`.trim()
                : null;
            return (
              <li key={item.id} className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{item.description}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {actorName ? `${actorName} · ` : ""}
                    {formatRelativeTime(item.createdAt)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
