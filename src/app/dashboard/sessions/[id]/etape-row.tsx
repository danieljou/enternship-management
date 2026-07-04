"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUp, GripVertical, Pencil, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SessionColorClasses } from "@/lib/session-colors";
import type { SessionEtape } from "@/lib/types";

export function EtapeRow({
  etape,
  icon: Icon,
  colors,
  index,
  count,
  isPending,
  onMove,
  onEdit,
  onDelete,
}: {
  etape: SessionEtape;
  icon: LucideIcon;
  colors: SessionColorClasses;
  index: number;
  count: number;
  isPending: boolean;
  onMove: (etapeId: string, direction: "up" | "down") => void;
  onEdit: (etape: SessionEtape) => void;
  onDelete: (etape: SessionEtape) => void;
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: etape.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3 shadow-sm transition-shadow",
        isDragging ? "opacity-40" : "hover:shadow-md"
      )}
    >
      <button
        type="button"
        aria-label={t("sessions.etape_drag_handle")}
        className="flex h-7 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", colors.soft)}>
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
          onClick={() => onMove(etape.id, "up")}
          aria-label={t("sessions.etape_move_up")}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isPending || index === count - 1}
          onClick={() => onMove(etape.id, "down")}
          aria-label={t("sessions.etape_move_down")}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => onEdit(etape)} aria-label={t("common.edit")}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(etape)}
          aria-label={t("common.delete")}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}
