"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Evaluation, SessionStagiaireWithRelations } from "@/lib/types";

import { deleteEvaluation } from "../actions";
import { EvaluationFormDialog } from "./evaluation-form-dialog";

export function SessionEvaluationsTab({
  sessionId,
  enrolled,
  evaluations,
}: {
  sessionId: string;
  enrolled: SessionStagiaireWithRelations[];
  evaluations: Evaluation[];
}) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string | undefined>(enrolled[0]?.stagiaire_id);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Evaluation | null>(null);
  const [deleting, setDeleting] = useState<Evaluation | null>(null);

  const stagiaireEvaluations = useMemo(
    () =>
      evaluations
        .filter((evaluation) => evaluation.stagiaire_id === selected)
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [evaluations, selected]
  );

  function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    startTransition(async () => {
      const result = await deleteEvaluation(target.id, sessionId);
      if ("error" in result) {
        toast.error(t(result.error));
      } else {
        toast.success(t("sessions.evaluation_delete_success"));
      }
      setDeleting(null);
    });
  }

  if (enrolled.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        {t("sessions.kanban_no_stagiaires")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue placeholder={t("sessions.kanban_select_placeholder")} />
          </SelectTrigger>
          <SelectContent>
            {enrolled.map(({ stagiaire_id, stagiaire }) => (
              <SelectItem key={stagiaire_id} value={stagiaire_id}>
                {stagiaire ? `${stagiaire.prenom} ${stagiaire.nom}` : stagiaire_id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selected && (
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            {t("sessions.evaluation_add_button")}
          </Button>
        )}
      </div>

      {stagiaireEvaluations.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          {t("sessions.evaluations_empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {stagiaireEvaluations.map((evaluation) => (
            <li key={evaluation.id} className="flex flex-col gap-2 rounded-lg border bg-card p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge className="text-sm">{evaluation.note}/20</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(evaluation.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      setEditing(evaluation);
                      setFormOpen(true);
                    }}
                    aria-label={t("common.edit")}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeleting(evaluation)}
                    aria-label={t("common.delete")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {evaluation.commentaire && (
                <p className="text-sm text-muted-foreground">{evaluation.commentaire}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <EvaluationFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          sessionId={sessionId}
          stagiaireId={selected}
          evaluation={editing}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("sessions.evaluation_delete_confirm_description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isPending}>
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
