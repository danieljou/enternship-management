"use client";

import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
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

import { deleteEtape, moveEtape, reorderEtapes } from "../actions";
import { EtapeFormDialog } from "./etape-form-dialog";
import { EtapeRow } from "./etape-row";

export function SessionEtapesManager({
  sessionId,
  etapes,
}: {
  sessionId: string;
  etapes: SessionEtape[];
}) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [localEtapes, setLocalEtapes] = useState(etapes);
  const [syncedEtapes, setSyncedEtapes] = useState(etapes);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SessionEtape | null>(null);
  const [deleting, setDeleting] = useState<SessionEtape | null>(null);

  if (etapes !== syncedEtapes) {
    setSyncedEtapes(etapes);
    setLocalEtapes(etapes);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleMove(etapeId: string, direction: "up" | "down") {
    startTransition(async () => {
      const result = await moveEtape(sessionId, etapeId, direction);
      if ("error" in result) toast.error(t(result.error));
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localEtapes.findIndex((etape) => etape.id === active.id);
    const newIndex = localEtapes.findIndex((etape) => etape.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(localEtapes, oldIndex, newIndex);
    setLocalEtapes(reordered);

    startTransition(async () => {
      const result = await reorderEtapes(
        sessionId,
        reordered.map((etape) => etape.id)
      );
      if ("error" in result) {
        toast.error(t(result.error));
        setLocalEtapes(etapes);
      }
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

      {localEtapes.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          {t("sessions.etapes_empty")}
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localEtapes.map((etape) => etape.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="flex flex-col gap-2">
              {localEtapes.map((etape, index) => (
                <EtapeRow
                  key={etape.id}
                  etape={etape}
                  icon={getSessionEtapeIcon(etape.icone)}
                  colors={getSessionEtapeColorClasses(etape.couleur)}
                  index={index}
                  count={localEtapes.length}
                  isPending={isPending}
                  onMove={handleMove}
                  onEdit={(target) => {
                    setEditing(target);
                    setFormOpen(true);
                  }}
                  onDelete={setDeleting}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
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
