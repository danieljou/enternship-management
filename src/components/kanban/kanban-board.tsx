"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
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
import { deleteTache, moveTache } from "@/lib/actions/kanban-actions";
import { getSessionEtapeColorClasses } from "@/lib/session-colors";
import { getSessionEtapeIcon } from "@/lib/session-icons";
import type { SessionEtape, SessionTache } from "@/lib/types";

import { KanbanCard } from "./kanban-card";
import { KanbanCardDialog } from "./kanban-card-dialog";
import { KanbanColumn } from "./kanban-column";

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
  const [localTaches, setLocalTaches] = useState(taches);
  const [syncedTaches, setSyncedTaches] = useState(taches);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dialogEtapeId, setDialogEtapeId] = useState<string | null>(null);
  const [editing, setEditing] = useState<SessionTache | null>(null);
  const [deleting, setDeleting] = useState<SessionTache | null>(null);

  if (taches !== syncedTaches) {
    setSyncedTaches(taches);
    setLocalTaches(taches);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const tachesByEtape = useMemo(() => {
    const map = new Map<string, SessionTache[]>();
    for (const etape of etapes) map.set(etape.id, []);
    for (const tache of localTaches) {
      map.get(tache.etape_id)?.push(tache);
    }
    return map;
  }, [etapes, localTaches]);

  const activeTache = activeId
    ? localTaches.find((tache) => tache.id === activeId)
    : null;
  const dialogOpen = dialogEtapeId !== null || editing !== null;

  function closeDialog() {
    setDialogEtapeId(null);
    setEditing(null);
  }

  function persistMove(tacheId: string, etapeId: string) {
    startTransition(async () => {
      const result = await moveTache(tacheId, etapeId, sessionId);
      if ("error" in result) {
        toast.error(t(result.error));
        setLocalTaches(taches);
      }
    });
  }

  function handleMoveViaMenu(tache: SessionTache, etapeId: string) {
    setLocalTaches((prev) =>
      prev.map((t) => (t.id === tache.id ? { ...t, etape_id: etapeId } : t)),
    );
    persistMove(tache.id, etapeId);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || !canEdit) return;

    const overData = over.data.current as
      | { type?: string; etapeId?: string }
      | undefined;
    const targetEtapeId = overData?.etapeId;
    if (!targetEtapeId) return;

    setLocalTaches((prev) =>
      prev.map((t) =>
        t.id === active.id && t.etape_id !== targetEtapeId
          ? { ...t, etape_id: targetEtapeId }
          : t,
      ),
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active } = event;
    setActiveId(null);
    if (!canEdit) return;

    const original = taches.find((t) => t.id === active.id);
    const current = localTaches.find((t) => t.id === active.id);
    if (original && current && original.etape_id !== current.etape_id) {
      persistMove(current.id, current.etape_id);
    }
  }

  if (etapes.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        {t("kanban.no_etapes")}
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-2">
        {etapes.map((etape) => (
          <KanbanColumn
            key={etape.id}
            etape={etape}
            etapes={etapes}
            taches={tachesByEtape.get(etape.id) ?? []}
            icon={getSessionEtapeIcon(etape.icone)}
            colors={getSessionEtapeColorClasses(etape.couleur)}
            canEdit={canEdit}
            isMovePending={isPending}
            onAddCard={setDialogEtapeId}
            onEditCard={setEditing}
            onDeleteCard={setDeleting}
            onMoveCard={handleMoveViaMenu}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTache && (
          <KanbanCard
            tache={activeTache}
            etapes={etapes}
            currentEtapeId={activeTache.etape_id}
            colors={getSessionEtapeColorClasses(
              etapes.find((e) => e.id === activeTache.etape_id)?.couleur ??
                "cyan",
            )}
            canEdit={canEdit}
            isMovePending={false}
            onEdit={() => {}}
            onDelete={() => {}}
            onMove={() => {}}
          />
        )}
      </DragOverlay>

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
            <AlertDialogAction
              onClick={() => {
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
              }}
              disabled={isPending}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DndContext>
  );
}
