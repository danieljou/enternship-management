"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { Progress } from "@/components/ui/progress";

export interface RoadmapListItem {
  instanceId: string;
  titre: string;
  branche: string;
  dureeSemaines: number;
  dateDebut: string;
  dateFin: string;
  progressPct: number;
}

export function RoadmapListView({ items }: { items: RoadmapListItem[] }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("stagiaireRoadmap.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("stagiaireRoadmap.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.instanceId}
            href={`/espace-stagiaire/roadmap/${item.instanceId}`}
            className="flex flex-col gap-3 rounded-2xl border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <div>
              <h2 className="text-base font-semibold text-foreground">{item.titre}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.branche} · {t("roadmaps.duree_value", { count: item.dureeSemaines })}
              </p>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{t("stagiaireRoadmap.progress_label")}</span>
                <span className="font-medium text-foreground">{item.progressPct}%</span>
              </div>
              <Progress value={item.progressPct} />
            </div>

            <p className="text-xs text-muted-foreground">
              {new Date(item.dateDebut).toLocaleDateString()} → {new Date(item.dateFin).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
