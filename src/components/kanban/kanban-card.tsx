"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslation } from "react-i18next";
import { GripVertical, MoreHorizontal, Move, Pencil, Trash2 } from "lucide-react";

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
import { cn } from "@/lib/utils";
import type { SessionColorClasses } from "@/lib/session-colors";
import type { SessionEtape, SessionTache } from "@/lib/types";

export function KanbanCard({
  tache,
  etapes,
  currentEtapeId,
  colors,
  canEdit,
  isMovePending,
  onEdit,
  onDelete,
  onMove,
}: {
  tache: SessionTache;
  etapes: SessionEtape[];
  currentEtapeId: string;
  colors: SessionColorClasses;
  canEdit: boolean;
  isMovePending: boolean;
  onEdit: (tache: SessionTache) => void;
  onDelete: (tache: SessionTache) => void;
  onMove: (tache: SessionTache, etapeId: string) => void;
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tache.id,
    data: { type: "card", etapeId: currentEtapeId },
    disabled: !canEdit,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/card flex flex-col gap-1 rounded-lg border-l-2 bg-card p-2.5 shadow-sm ring-1 ring-transparent transition-shadow",
        colors.border,
        isDragging ? "opacity-40" : "hover:shadow-md hover:ring-border"
      )}
    >
      <div className="flex items-start gap-1.5">
        {canEdit && (
          <button
            type="button"
            aria-label={t("kanban.drag_handle")}
            className="-ml-1 mt-0.5 flex h-5 w-5 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground/40 opacity-0 transition-opacity group-hover/card:opacity-100 hover:text-muted-foreground active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        )}
        <p className="flex-1 text-sm font-medium text-foreground">{tache.titre}</p>
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
              <DropdownMenuItem onSelect={() => onEdit(tache)}>
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
                    .filter((target) => target.id !== currentEtapeId)
                    .map((target) => (
                      <DropdownMenuItem
                        key={target.id}
                        disabled={isMovePending}
                        onSelect={() => onMove(tache, target.id)}
                      >
                        {target.nom}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem variant="destructive" onSelect={() => onDelete(tache)}>
                <Trash2 className="h-4 w-4" />
                {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {tache.description && (
        <p className="line-clamp-3 pl-0.5 text-xs text-muted-foreground">{tache.description}</p>
      )}
    </div>
  );
}
