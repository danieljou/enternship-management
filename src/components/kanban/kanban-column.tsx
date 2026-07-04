"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SessionColorClasses } from "@/lib/session-colors";
import type { SessionEtape, SessionTache } from "@/lib/types";

import { KanbanCard } from "./kanban-card";

export function KanbanColumn({
  etape,
  etapes,
  taches,
  icon: Icon,
  colors,
  canEdit,
  isMovePending,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onMoveCard,
}: {
  etape: SessionEtape;
  etapes: SessionEtape[];
  taches: SessionTache[];
  icon: LucideIcon;
  colors: SessionColorClasses;
  canEdit: boolean;
  isMovePending: boolean;
  onAddCard: (etapeId: string) => void;
  onEditCard: (tache: SessionTache) => void;
  onDeleteCard: (tache: SessionTache) => void;
  onMoveCard: (tache: SessionTache, etapeId: string) => void;
}) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({
    id: etape.id,
    data: { type: "column", etapeId: etape.id },
  });

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3 rounded-xl border bg-muted/30 p-3">
      <div className="flex items-center gap-2">
        <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", colors.soft)}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="flex-1 truncate text-sm font-semibold text-foreground">{etape.nom}</span>
        <Badge variant="secondary" className="rounded-full">
          {taches.length}
        </Badge>
      </div>
      {etape.description && <p className="text-xs text-muted-foreground">{etape.description}</p>}

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-12 flex-col gap-2 rounded-lg transition-colors",
          isOver && "bg-primary/5 outline-2 outline-dashed outline-primary/30 outline-offset-2"
        )}
      >
        <SortableContext items={taches.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {taches.map((tache) => (
            <KanbanCard
              key={tache.id}
              tache={tache}
              etapes={etapes}
              currentEtapeId={etape.id}
              colors={colors}
              canEdit={canEdit}
              isMovePending={isMovePending}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
              onMove={onMoveCard}
            />
          ))}
        </SortableContext>
      </div>

      {canEdit && (
        <Button
          variant="ghost"
          size="sm"
          className="justify-start text-muted-foreground"
          onClick={() => onAddCard(etape.id)}
        >
          <Plus className="h-3.5 w-3.5" />
          {t("kanban.add_card")}
        </Button>
      )}
    </div>
  );
}
