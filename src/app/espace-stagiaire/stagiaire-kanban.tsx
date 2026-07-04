"use client";

import { useTranslation } from "react-i18next";

import { KanbanBoard } from "@/components/kanban/kanban-board";
import type { SessionEtape, SessionTache, StageSession } from "@/lib/types";

function formatPeriode(session: StageSession) {
  if (!session.date_debut && !session.date_fin) return null;
  const debut = session.date_debut ? new Date(session.date_debut).toLocaleDateString() : "?";
  const fin = session.date_fin ? new Date(session.date_fin).toLocaleDateString() : "?";
  return `${debut} → ${fin}`;
}

export function StagiaireSessionBoard({
  session,
  etapes,
  taches,
  stagiaireId,
  canEdit,
}: {
  session: StageSession;
  etapes: SessionEtape[];
  taches: SessionTache[];
  stagiaireId: string;
  canEdit: boolean;
}) {
  const { t } = useTranslation();
  const periode = formatPeriode(session);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{session.nom}</h1>
        {periode && <p className="mt-1 text-sm text-muted-foreground">{periode}</p>}
        {!canEdit && (
          <p className="mt-1 text-xs text-muted-foreground">{t("stagiaireKanban.read_only")}</p>
        )}
      </div>
      <KanbanBoard
        etapes={etapes}
        taches={taches}
        sessionId={session.id}
        stagiaireId={stagiaireId}
        canEdit={canEdit}
      />
    </div>
  );
}
