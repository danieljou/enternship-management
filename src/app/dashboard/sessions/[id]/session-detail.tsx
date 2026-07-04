"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Evaluation,
  SessionDocument,
  SessionEtape,
  SessionStagiaireWithRelations,
  SessionTache,
  Stagiaire,
  StageSession,
} from "@/lib/types";

import { SessionFormDialog } from "../session-form-dialog";
import { SessionDocumentsTab } from "./session-documents-tab";
import { SessionEtapesManager } from "./session-etapes-manager";
import { SessionEvaluationsTab } from "./session-evaluations-tab";
import { SessionKanbanTab } from "./session-kanban-tab";
import { SessionStagiairesManager } from "./session-stagiaires-manager";

function formatPeriode(session: StageSession) {
  if (!session.date_debut && !session.date_fin) return null;
  const debut = session.date_debut ? new Date(session.date_debut).toLocaleDateString() : "?";
  const fin = session.date_fin ? new Date(session.date_fin).toLocaleDateString() : "?";
  return `${debut} → ${fin}`;
}

export function SessionDetail({
  session,
  etapes,
  enrolled,
  available,
  taches,
  evaluations,
  documents,
}: {
  session: StageSession;
  etapes: SessionEtape[];
  enrolled: SessionStagiaireWithRelations[];
  available: Pick<Stagiaire, "id" | "nom" | "prenom" | "email">[];
  taches: SessionTache[];
  evaluations: Evaluation[];
  documents: SessionDocument[];
}) {
  const { t } = useTranslation();
  const [editOpen, setEditOpen] = useState(false);
  const periode = formatPeriode(session);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/sessions"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("sessions.back_to_list")}
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{session.nom}</h1>
            {session.description && (
              <p className="mt-1 text-sm text-muted-foreground">{session.description}</p>
            )}
            {periode && <p className="mt-1 text-xs text-muted-foreground">{periode}</p>}
          </div>
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            {t("common.edit")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="etapes">
        <TabsList>
          <TabsTrigger value="etapes">{t("sessions.tab_etapes")}</TabsTrigger>
          <TabsTrigger value="stagiaires">{t("sessions.tab_stagiaires")}</TabsTrigger>
          <TabsTrigger value="kanban">{t("sessions.tab_kanban")}</TabsTrigger>
          <TabsTrigger value="evaluations">{t("sessions.tab_evaluations")}</TabsTrigger>
          <TabsTrigger value="documents">{t("sessions.tab_documents")}</TabsTrigger>
        </TabsList>

        <TabsContent value="etapes" className="mt-4">
          <SessionEtapesManager sessionId={session.id} etapes={etapes} />
        </TabsContent>

        <TabsContent value="stagiaires" className="mt-4">
          <SessionStagiairesManager sessionId={session.id} enrolled={enrolled} available={available} />
        </TabsContent>

        <TabsContent value="kanban" className="mt-4">
          <SessionKanbanTab sessionId={session.id} etapes={etapes} enrolled={enrolled} taches={taches} />
        </TabsContent>

        <TabsContent value="evaluations" className="mt-4">
          <SessionEvaluationsTab sessionId={session.id} enrolled={enrolled} evaluations={evaluations} />
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <SessionDocumentsTab sessionId={session.id} documents={documents} />
        </TabsContent>
      </Tabs>

      <SessionFormDialog open={editOpen} onOpenChange={setEditOpen} session={session} />
    </div>
  );
}
