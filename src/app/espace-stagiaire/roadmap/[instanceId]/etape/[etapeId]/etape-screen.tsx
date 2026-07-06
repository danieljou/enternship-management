"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ClipboardList,
  ExternalLink,
  FileCheck2,
  HelpCircle,
  Link2,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EtapeProgressLike } from "@/lib/roadmap-logic";
import type {
  RoadmapCours,
  RoadmapExercice,
  RoadmapLivrableSoumission,
  RoadmapQuizSanitized,
} from "@/lib/types";

import { LivrableTab } from "./livrable-tab";
import { QuizTab } from "./quiz-tab";

export function EtapeScreen({
  instanceId,
  etapeId,
  titre,
  objectifs,
  cours,
  exercice,
  livrableAttendu,
  quiz,
  progress,
  soumissions,
}: {
  instanceId: string;
  etapeId: string;
  titre: string;
  objectifs: string[];
  cours: RoadmapCours;
  exercice: RoadmapExercice;
  livrableAttendu: string;
  quiz: RoadmapQuizSanitized | null;
  progress: EtapeProgressLike;
  soumissions: RoadmapLivrableSoumission[];
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/espace-stagiaire/roadmap/${instanceId}`}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("stagiaireRoadmap.back_to_roadmap")}
        </Link>

        <div className="rounded-2xl border bg-card p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.7)]">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{titre}</h1>

          {objectifs.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1.5">
              {objectifs.map((objectif, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-primary" />
                  {objectif}
                </li>
              ))}
            </ul>
          )}

          {(quiz ?? livrableAttendu) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {quiz && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-600 dark:text-violet-400">
                  <HelpCircle className="h-3.5 w-3.5" />
                  {t("roadmaps.badge_quiz")} · {quiz.questions.length}
                </span>
              )}
              {livrableAttendu && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-600 dark:text-sky-400">
                  <FileCheck2 className="h-3.5 w-3.5" />
                  {t("roadmaps.badge_livrable")}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="cours">
        <TabsList>
          <TabsTrigger value="cours">
            <BookOpen className="h-4 w-4" />
            {t("roadmaps.etape_tab_cours")}
          </TabsTrigger>
          <TabsTrigger value="exercice">
            <ClipboardList className="h-4 w-4" />
            {t("roadmaps.etape_tab_exercice")}
          </TabsTrigger>
          {quiz && (
            <TabsTrigger value="quiz">
              <HelpCircle className="h-4 w-4" />
              {t("roadmaps.etape_tab_quiz")}
            </TabsTrigger>
          )}
          <TabsTrigger value="livrable">
            <FileCheck2 className="h-4 w-4" />
            {t("roadmaps.etape_tab_livrable")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cours" className="mt-5 flex flex-col gap-6">
          {cours.resume && (
            <p className="max-w-2xl text-[15px] leading-relaxed text-foreground">{cours.resume}</p>
          )}
          {cours.points_cles.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground">{t("roadmaps.points_cles_label")}</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {cours.points_cles.map((point, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {cours.ressources.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground">{t("roadmaps.ressources_label")}</h3>
              <div className="mt-3 flex flex-col gap-2">
                {cours.ressources.map((ressource, index) => (
                  <a
                    key={index}
                    href={ressource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl border bg-background/50 px-3.5 py-3 text-sm transition-colors hover:border-primary/40 hover:bg-accent/40"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Link2 className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                      {ressource.titre}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="exercice" className="mt-5 flex flex-col gap-6">
          {exercice.consigne && (
            <div className="rounded-xl border-l-4 border-primary bg-primary/[0.04] p-4">
              <p className="max-w-2xl text-sm leading-relaxed text-foreground">{exercice.consigne}</p>
            </div>
          )}
          {exercice.criteres_reussite.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {t("roadmaps.criteres_reussite_label")}
              </h3>
              <ul className="mt-3 flex flex-col gap-2">
                {exercice.criteres_reussite.map((critere, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{critere}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        {quiz && (
          <TabsContent value="quiz" className="mt-5">
            <QuizTab instanceId={instanceId} etapeId={etapeId} quiz={quiz} progress={progress} />
          </TabsContent>
        )}

        <TabsContent value="livrable" className="mt-5">
          <LivrableTab
            instanceId={instanceId}
            etapeId={etapeId}
            livrableAttendu={livrableAttendu}
            statut={progress.livrable_statut}
            soumissions={soumissions}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
