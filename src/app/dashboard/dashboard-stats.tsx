"use client";

import { useTranslation } from "react-i18next";
import {
  Building2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  KanbanSquare,
  NotebookText,
} from "lucide-react";

interface DashboardStatsProps {
  stagiaires: number;
  etablissements: number;
  filieres: number;
  sessions: number;
  evaluations: number;
  documents: number;
}

const TILES = [
  { key: "stagiaires", icon: GraduationCap, chartVar: "--chart-1" },
  { key: "etablissements", icon: Building2, chartVar: "--chart-2" },
  { key: "filieres", icon: NotebookText, chartVar: "--chart-3" },
  { key: "sessions", icon: KanbanSquare, chartVar: "--chart-4" },
  { key: "evaluations", icon: ClipboardCheck, chartVar: "--chart-5" },
  { key: "documents", icon: FileText, chartVar: "--chart-1" },
] as const;

export function DashboardStats({
  stagiaires,
  etablissements,
  filieres,
  sessions,
  evaluations,
  documents,
}: DashboardStatsProps) {
  const { t } = useTranslation();
  const values: Record<(typeof TILES)[number]["key"], number> = {
    stagiaires,
    etablissements,
    filieres,
    sessions,
    evaluations,
    documents,
  };

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-6">
      {TILES.map(({ key, icon: Icon, chartVar }) => (
        <div
          key={key}
          className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-0.5 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.7)]"
        >
          <span
            className="absolute inset-x-0 top-0 h-1"
            style={{ backgroundColor: `var(${chartVar})` }}
          />
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `color-mix(in oklch, var(${chartVar}), transparent 85%)`,
            }}
          >
            <Icon className="h-5 w-5" style={{ color: `var(${chartVar})` }} />
          </span>
          <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
            {t(`dashboard.stats.${key}`)}
          </p>
          <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums sm:text-3xl">
            {values[key].toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
