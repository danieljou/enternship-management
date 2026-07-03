"use client";

import { useTranslation } from "react-i18next";
import { Building2, GraduationCap, NotebookText } from "lucide-react";

interface DashboardStatsProps {
  stagiaires: number;
  etablissements: number;
  filieres: number;
}

const TILES = [
  { key: "stagiaires", icon: GraduationCap },
  { key: "etablissements", icon: Building2 },
  { key: "filieres", icon: NotebookText },
] as const;

export function DashboardStats({
  stagiaires,
  etablissements,
  filieres,
}: DashboardStatsProps) {
  const { t } = useTranslation();
  const values: Record<(typeof TILES)[number]["key"], number> = {
    stagiaires,
    etablissements,
    filieres,
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {TILES.map(({ key, icon: Icon }) => (
        <div
          key={key}
          className="flex items-center gap-4 rounded-2xl bg-card p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.7)]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">
              {t(`dashboard.stats.${key}`)}
            </p>
            <p className="text-2xl font-semibold text-foreground">
              {values[key].toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
