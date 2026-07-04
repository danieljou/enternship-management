"use client";

import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { getSessionEtapeColorClasses } from "@/lib/session-colors";
import { getSessionEtapeIcon } from "@/lib/session-icons";
import type { SessionEtape } from "@/lib/types";

import { deleteEtape, moveEtape } from "../actions";
import { EtapeFormDialog } from "./etape-form-dialog";

export function SessionEtapesManager({
  sessionId,
  etapes,
}: {
  sessionId: string;
  etapes: SessionEtape[];
}) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SessionEtape | null>(null);
  const [deleting, setDeleting] = useState<SessionEtape | null>(null);

  function handleMove(etapeId: string, direction: "up" | "down") {
    startTransition(async () => {
      const result = await moveEtape(sessionId, etapeId, direction);
      if ("error" in result) toast.error(t(result.error));
    });
  }

  function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    startTransition(async () => {
      const result = await deleteEtape(target.id, sessionId);
      if ("error" in result) {
        toast.error(t(result.error));
      } else {
        toast.success(t("sessions.etape_delete_success"));
      }
      setDeleting(null);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{t("sessions.etapes_description")}</p>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          {t("sessions.etape_add_button")}
        </Button>
      </div>

      {etapes.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          {t("sessions.etapes_empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {etapes.map((etape, index) => {
            const Icon = getSessionEtapeIcon(etape.icone);
            const colors = getSessionEtapeColorClasses(etape.couleur);
            return (
              <li
                key={etape.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3"
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${colors.soft}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{etape.nom}</p>
                  {etape.description && (
                    <p className="truncate text-xs text-muted-foreground">{etape.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isPending || index === 0}
                    onClick={() => handleMove(etape.id, "up")}
                    aria-label={t("sessions.etape_move_up")}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isPending || index === etapes.length - 1}
                    onClick={() => handleMove(etape.id, "down")}
                    aria-label={t("sessions.etape_move_down")}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      setEditing(etape);
                      setFormOpen(true);
                    }}
                    aria-label={t("common.edit")}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeleting(etape)}
                    aria-label={t("common.delete")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <EtapeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        sessionId={sessionId}
        etape={editing}
      />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("sessions.etape_delete_confirm_description")}
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
