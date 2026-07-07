"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Plus } from "lucide-react";

import { EvaluationFormDialog } from "@/app/dashboard/sessions/[id]/evaluation-form-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Etablissement, Evaluation, Filiere, Stagiaire } from "@/lib/types";

export interface RoadmapProgressItem {
  titre: string;
  branche: string;
  progressPct: number;
}

export function EncadrantStagiaireDetail({
  stagiaire,
  sessions,
  evaluations,
  roadmapItems,
}: {
  stagiaire: Stagiaire & {
    etablissement: Pick<Etablissement, "id" | "nom"> | null;
    filiere: Pick<Filiere, "id" | "nom"> | null;
  };
  sessions: { id: string; nom: string }[];
  evaluations: Evaluation[];
  roadmapItems: RoadmapProgressItem[];
}) {
  const { t } = useTranslation();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(sessions[0]?.id ?? "");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/espace-encadrant"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("encadrantSpace.back_to_list")}
        </Link>

        <div className="rounded-2xl border bg-card p-6">
          <h1 className="text-2xl font-semibold text-foreground">
            {stagiaire.prenom} {stagiaire.nom}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span>{stagiaire.email}</span>
            <span className="text-border">·</span>
            <span>{stagiaire.etablissement?.nom ?? t("profile.no_institution")}</span>
            <span className="text-border">·</span>
            <span>{stagiaire.filiere?.nom ?? t("profile.no_field")}</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          {t("encadrantSpace.roadmap_progress_title")}
        </h2>
        {roadmapItems.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            {t("encadrantSpace.roadmap_progress_empty")}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {roadmapItems.map((item, index) => (
              <div key={index} className="rounded-xl border bg-card p-4">
                <p className="text-sm font-medium text-foreground">{item.titre}</p>
                <p className="text-xs text-muted-foreground">{item.branche}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Progress value={item.progressPct} className="flex-1" />
                  <span className="text-xs font-semibold text-foreground">{item.progressPct}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">{t("encadrantSpace.evaluations_title")}</h2>
          {sessions.length > 0 && (
            <div className="flex items-center gap-2">
              <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder={t("sessions.kanban_select_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={() => setFormOpen(true)} disabled={!selectedSessionId}>
                <Plus className="h-4 w-4" />
                {t("sessions.evaluation_add_button")}
              </Button>
            </div>
          )}
        </div>

        {evaluations.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            {t("sessions.evaluations_empty")}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {evaluations.map((evaluation) => (
              <li key={evaluation.id} className="flex flex-col gap-1.5 rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {evaluation.note}/20
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(evaluation.created_at).toLocaleDateString()}
                  </span>
                </div>
                {evaluation.commentaire && (
                  <p className="text-sm text-muted-foreground">{evaluation.commentaire}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedSessionId && (
        <EvaluationFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          sessionId={selectedSessionId}
          stagiaireId={stagiaire.id}
          evaluation={null}
        />
      )}
    </div>
  );
}
