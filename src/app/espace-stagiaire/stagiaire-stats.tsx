"use client";

import { useTranslation } from "react-i18next";
import { ClipboardCheck, FileText, History, ListChecks } from "lucide-react";

interface StagiaireStatsProps {
  sessionsCount: number;
  tachesCount: number;
  documentsCount: number;
  latestNote: number | null;
}

const TILES = [
  { key: "sessions", icon: History, chartVar: "--chart-1" },
  { key: "taches", icon: ListChecks, chartVar: "--chart-2" },
  { key: "documents", icon: FileText, chartVar: "--chart-3" },
  { key: "note", icon: ClipboardCheck, chartVar: "--chart-4" },
] as const;

export function StagiaireStats({
  sessionsCount,
  tachesCount,
  documentsCount,
  latestNote,
}: StagiaireStatsProps) {
  const { t } = useTranslation();
  const values: Record<(typeof TILES)[number]["key"], string> = {
    sessions: sessionsCount.toLocaleString(),
    taches: tachesCount.toLocaleString(),
    documents: documentsCount.toLocaleString(),
    note: latestNote != null ? `${latestNote}/20` : "—",
  };

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
            style={{ backgroundColor: `color-mix(in oklch, var(${chartVar}), transparent 85%)` }}
          >
            <Icon className="h-5 w-5" style={{ color: `var(${chartVar})` }} />
          </span>
          <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
            {t(`stagiaireHome.stats.${key}`)}
          </p>
          <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums sm:text-3xl">
            {values[key]}
          </p>
        </div>
      ))}
    </div>
  );
}
