"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Check, HelpCircle, Lock } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { RoadmapEtapeState } from "@/lib/types";

export interface EtapeView {
  id: string;
  jour: number;
  titre: string;
  hasQuiz: boolean;
  state: RoadmapEtapeState;
  locked: boolean;
}

export interface SemaineView {
  id: string;
  numero: number;
  titre: string;
  etapes: EtapeView[];
}

const STATUS_TEXT_CLASSES: Record<RoadmapEtapeState, string> = {
  a_venir: "text-muted-foreground",
  en_cours: "text-primary",
  validee: "text-emerald-600 dark:text-emerald-400",
  bloquee: "text-red-600 dark:text-red-400",
};

function NodeIcon({ etape }: { etape: EtapeView }) {
  if (etape.locked) return <Lock className="h-4 w-4" />;
  if (etape.state === "validee") return <Check className="h-5 w-5" />;
  if (etape.state === "bloquee") return <AlertTriangle className="h-4 w-4" />;
  return <span className="text-sm font-semibold">{etape.jour}</span>;
}

function nodeClasses(etape: EtapeView, isCurrent: boolean) {
  if (etape.locked) {
    return "border-2 border-border bg-muted text-muted-foreground";
  }
  if (etape.state === "validee") {
    return "border-2 border-emerald-500 bg-emerald-500 text-white";
  }
  if (etape.state === "bloquee") {
    return "border-2 border-red-500 bg-red-500/10 text-red-600 dark:text-red-400";
  }
  if (isCurrent) {
    return "border-2 border-primary bg-primary text-primary-foreground ring-4 ring-primary/20 motion-safe:animate-pulse";
  }
  return "border-2 border-border bg-background text-foreground";
}

export function RoadmapInstanceView({
  instanceId,
  templateTitre,
  branche,
  progressPct,
  semaines,
}: {
  instanceId: string;
  templateTitre: string;
  branche: string;
  progressPct: number;
  semaines: SemaineView[];
}) {
  const { t } = useTranslation();

  const allEtapes = useMemo(() => semaines.flatMap((semaine) => semaine.etapes), [semaines]);
  const totalCount = allEtapes.length;
  const validatedCount = useMemo(
    () => allEtapes.filter((etape) => etape.state === "validee").length,
    [allEtapes],
  );
  const currentStepId = useMemo(
    () => allEtapes.find((etape) => !etape.locked && etape.state !== "validee")?.id ?? null,
    [allEtapes],
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl border bg-card p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.7)]">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{templateTitre}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{branche}</p>

        <div className="mt-5 max-w-md">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("stagiaireRoadmap.progress_label")}</span>
            <span className="font-semibold text-foreground">{progressPct}%</span>
          </div>
          <Progress value={progressPct} />
          <p className="mt-1.5 text-xs text-muted-foreground">
            {t("stagiaireRoadmap.overall_progress_stat", { done: validatedCount, total: totalCount })}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-10">
        {semaines.map((semaine) => {
          const semaineValidated = semaine.etapes.filter((etape) => etape.state === "validee").length;

          return (
            <div key={semaine.id} className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {semaine.numero}
                  </span>
                  <h2 className="text-sm font-semibold text-foreground">{semaine.titre}</h2>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {t("stagiaireRoadmap.semaine_progress", {
                    done: semaineValidated,
                    total: semaine.etapes.length,
                  })}
                </span>
              </div>

              <div className="flex flex-col">
                {semaine.etapes.map((etape, index) => {
                  const isLast = index === semaine.etapes.length - 1;
                  const isCurrent = etape.id === currentStepId;

                  const row = (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                            nodeClasses(etape, isCurrent),
                          )}
                        >
                          <NodeIcon etape={etape} />
                        </span>
                        {!isLast && (
                          <div
                            className={cn(
                              "my-1 w-0.5 flex-1",
                              etape.state === "validee" ? "bg-emerald-500" : "bg-border",
                            )}
                          />
                        )}
                      </div>

                      <div
                        className={cn(
                          "min-w-0 flex-1 rounded-xl border bg-card px-4 py-3",
                          !isLast && "mb-4",
                          !etape.locked && "transition-colors group-hover:border-primary/40",
                          isCurrent && "border-primary/50 bg-primary/[0.03]",
                        )}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {t("roadmaps.jour_label", { jour: etape.jour })} — {etape.titre}
                          </p>
                          {isCurrent && (
                            <span className="inline-flex shrink-0 items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                              {t("stagiaireRoadmap.current_step_badge")}
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3">
                          <span className={cn("text-xs font-medium", STATUS_TEXT_CLASSES[etape.state])}>
                            {t(`stagiaireRoadmap.etape_state_${etape.state}`)}
                          </span>
                          {etape.hasQuiz && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <HelpCircle className="h-3 w-3" />
                              {t("roadmaps.badge_quiz")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );

                  return etape.locked ? (
                    <div key={etape.id} className="cursor-not-allowed opacity-60">
                      {row}
                    </div>
                  ) : (
                    <Link key={etape.id} href={`/espace-stagiaire/roadmap/${instanceId}/etape/${etape.id}`} className="group">
                      {row}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
