"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  ClipboardCheck,
  FileText,
  History,
  KanbanSquare,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  Evaluation,
  StageSession,
  StagiaireWithRelations,
} from "@/lib/types";

import { StagiaireStats } from "./stagiaire-stats";

const QUICK_LINKS = [
  {
    href: "/espace-stagiaire/sessions",
    labelKey: "stagiaireHome.link_sessions",
    icon: History,
  },
  {
    href: "/espace-stagiaire/evaluations",
    labelKey: "stagiaireHome.link_evaluations",
    icon: ClipboardCheck,
  },
  {
    href: "/espace-stagiaire/documents",
    labelKey: "stagiaireHome.link_documents",
    icon: FileText,
  },
] as const;

function formatPeriode(session: StageSession) {
  if (!session.date_debut && !session.date_fin) return null;
  const debut = session.date_debut
    ? new Date(session.date_debut).toLocaleDateString()
    : "?";
  const fin = session.date_fin
    ? new Date(session.date_fin).toLocaleDateString()
    : "?";
  return `${debut} → ${fin}`;
}

export function StagiaireHome({
  stagiaire,
  currentSession,
  etapesCount,
  tachesCount,
  latestEvaluation,
  sessionsCount,
  documentsCount,
  overallLatestNote,
}: {
  stagiaire: StagiaireWithRelations;
  currentSession: StageSession | null;
  etapesCount: number;
  tachesCount: number;
  latestEvaluation: Evaluation | null;
  sessionsCount: number;
  documentsCount: number;
  overallLatestNote: number | null;
}) {
  const { t } = useTranslation();
  const periode = currentSession ? formatPeriode(currentSession) : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {t("stagiaireHome.welcome")}
          {stagiaire.prenom ? `, ${stagiaire.prenom}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("stagiaireHome.subtitle")}
        </p>
      </div>

      <StagiaireStats
        sessionsCount={sessionsCount}
        tachesCount={tachesCount}
        documentsCount={documentsCount}
        latestNote={overallLatestNote}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-card p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.7)]">
          <h2 className="text-sm font-semibold text-foreground">
            {t("stagiaireHome.profile_title")}
          </h2>
          <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">
                {t("stagiaires.nom_label")}
              </dt>
              <dd className="text-foreground">
                {stagiaire.prenom} {stagiaire.nom}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                {t("stagiaires.email_label")}
              </dt>
              <dd className="truncate text-foreground">{stagiaire.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                {t("stagiaires.etablissement_label")}
              </dt>
              <dd className="text-foreground">
                {stagiaire.etablissement?.nom ?? "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                {t("stagiaires.filiere_label")}
              </dt>
              <dd className="text-foreground">
                {stagiaire.filiere?.nom ?? "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                {t("stagiaires.niveau_label")}
              </dt>
              <dd className="text-foreground">{stagiaire.niveau}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                {t("stagiaires.section_label")}
              </dt>
              <dd className="text-foreground">
                {t(`stagiaires.section_${stagiaire.section}`)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.7)]">
          <h2 className="text-sm font-semibold text-foreground">
            {t("stagiaireHome.session_title")}
          </h2>
          {currentSession ? (
            <div className="mt-4 flex flex-col gap-4">
              <div>
                <p className="text-base font-medium text-foreground">
                  {currentSession.nom}
                </p>
                {periode && (
                  <p className="text-xs text-muted-foreground">{periode}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">
                  {t("stagiaireHome.etapes_count", { count: etapesCount })}
                </Badge>
                <Badge variant="secondary">
                  {t("stagiaireHome.taches_count", { count: tachesCount })}
                </Badge>
                {latestEvaluation && (
                  <Badge>
                    {t("stagiaireHome.latest_note", {
                      note: latestEvaluation.note,
                    })}
                  </Badge>
                )}
              </div>
              <Button asChild className="w-fit">
                <Link href="/espace-stagiaire/kanban">
                  <KanbanSquare className="h-4 w-4" />
                  {t("stagiaireHome.view_kanban")}
                </Link>
              </Button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              {t("stagiaireHome.no_session")}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {QUICK_LINKS.map(({ href, labelKey, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-2xl bg-card p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.25)] transition-colors hover:bg-muted/60 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.7)]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-4.5 w-4.5" />
            </span>
            <span className="flex-1 text-sm font-medium text-foreground">
              {t(labelKey)}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
