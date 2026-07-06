"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import type {
  SessionEtape,
  SessionStagiaireWithRelations,
  SessionTache,
} from "@/lib/types";

export function SessionKanbanTab({
  sessionId,
  etapes,
  enrolled,
  taches,
}: {
  sessionId: string;
  etapes: SessionEtape[];
  enrolled: SessionStagiaireWithRelations[];
  taches: SessionTache[];
}) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | undefined>(
    enrolled[0]?.stagiaire_id,
  );

  const stagiaireTaches = useMemo(
    () => taches.filter((tache) => tache.stagiaire_id === selected),
    [taches, selected],
  );

  if (enrolled.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        {t("sessions.kanban_no_stagiaires")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Select value={selected} onValueChange={setSelected}>
        <SelectTrigger className="w-full sm:w-72">
          <SelectValue placeholder={t("sessions.kanban_select_placeholder")} />
        </SelectTrigger>
        <SelectContent>
          {enrolled.map(({ stagiaire_id, stagiaire }) => (
            <SelectItem key={stagiaire_id} value={stagiaire_id}>
              {stagiaire
                ? `${stagiaire.prenom} ${stagiaire.nom}`
                : stagiaire_id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selected && (
        <KanbanBoard
          etapes={etapes}
          taches={stagiaireTaches}
          sessionId={sessionId}
          stagiaireId={selected}
          canEdit
        />
      )}
    </div>
  );
}
