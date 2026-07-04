"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { MoreHorizontal, Move, Pencil, Plus, Trash2 } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteTache, moveTache } from "@/lib/actions/kanban-actions";
import { getSessionEtapeColorClasses } from "@/lib/session-colors";
import { getSessionEtapeIcon } from "@/lib/session-icons";
import type { SessionEtape, SessionTache } from "@/lib/types";

import { KanbanCardDialog } from "./kanban-card-dialog";

interface KanbanBoardProps {
  etapes: SessionEtape[];
  taches: SessionTache[];
  sessionId: string;
  stagiaireId: string;
  canEdit: boolean;
}

export function KanbanBoard({
  etapes,
  taches,
  sessionId,
  stagiaireId,
  canEdit,
}: KanbanBoardProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [dialogEtapeId, setDialogEtapeId] = useState<string | null>(null);
  const [editing, setEditing] = useState<SessionTache | null>(null);
  const [deleting, setDeleting] = useState<SessionTache | null>(null);

  const tachesByEtape = useMemo(() => {
    const map = new Map<string, SessionTache[]>();
    for (const etape of etapes) map.set(etape.id, []);
    for (const tache of taches) {
      map.get(tache.etape_id)?.push(tache);
    }
    return map;
  }, [etapes, taches]);

  const dialogOpen = dialogEtapeId !== null || editing !== null;

  function closeDialog() {
    setDialogEtapeId(null);
    setEditing(null);
  }

  function handleMove(tache: SessionTache, etapeId: string) {
    startTransition(async () => {
      const result = await moveTache(tache.id, etapeId, sessionId);
      if ("error" in result) toast.error(t(result.error));
    });
  }

  function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    startTransition(async () => {
      const result = await deleteTache(target.id, sessionId);
      if ("error" in result) {
        toast.error(t(result.error));
      } else {
        toast.success(t("kanban.delete_success"));
      }
      setDeleting(null);
    });
  }

  if (etapes.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        {t("kanban.no_etapes")}
      </p>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {etapes.map((etape) => {
        const Icon = getSessionEtapeIcon(etape.icone);
        const colors = getSessionEtapeColorClasses(etape.couleur);
        const columnTaches = tachesByEtape.get(etape.id) ?? [];

        return (
          <div
            key={etape.id}
            className="flex w-72 shrink-0 flex-col gap-3 rounded-xl border bg-muted/30 p-3"
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${colors.soft}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="flex-1 truncate text-sm font-semibold text-foreground">
                {etape.nom}
              </span>
              <Badge variant="secondary" className="rounded-full">
                {columnTaches.length}
              </Badge>
            </div>
            {etape.description && (
              <p className="text-xs text-muted-foreground">
                {etape.description}
              </p>
            )}

            <div className="flex flex-col gap-2">
              {columnTaches.map((tache) => (
                <div
                  key={tache.id}
                  className={`flex flex-col gap-1 rounded-lg border-l-2 bg-card p-2.5 shadow-sm ${colors.border}`}
                >
                  <div className="flex items-start gap-2">
                    <p className="flex-1 text-sm font-medium text-foreground">
                      {tache.titre}
                    </p>
                    {canEdit && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="-mt-0.5 -mr-1"
                            aria-label={t("common.actions")}
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setEditing(tache)}>
                            <Pencil className="h-4 w-4" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <Move className="h-4 w-4" />
                              {t("kanban.move_to")}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {etapes
                                .filter((target) => target.id !== etape.id)
                                .map((target) => (
                                  <DropdownMenuItem
                                    key={target.id}
                                    disabled={isPending}
                                    onSelect={() =>
                                      handleMove(tache, target.id)
                                    }
                                  >
                                    {target.nom}
                                  </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setDeleting(tache)}
                          >
                            <Trash2 className="h-4 w-4" />
                            {t("common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  {tache.description && (
                    <p className="line-clamp-3 text-xs text-muted-foreground">
                      {tache.description}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-muted-foreground"
                onClick={() => setDialogEtapeId(etape.id)}
              >
                <Plus className="h-3.5 w-3.5" />
                {t("kanban.add_card")}
              </Button>
            )}
          </div>
        );
      })}

      <KanbanCardDialog
        open={dialogOpen}
        onOpenChange={(open) => !open && closeDialog()}
        sessionId={sessionId}
        stagiaireId={stagiaireId}
        etapeId={dialogEtapeId ?? editing?.etape_id ?? etapes[0].id}
        tache={editing}
      />

      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("common.delete_confirm_title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("kanban.delete_confirm_description")}
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
