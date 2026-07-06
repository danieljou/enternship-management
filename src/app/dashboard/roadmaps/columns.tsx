"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table";
import { cn } from "@/lib/utils";
import type { RoadmapStatut, RoadmapTemplate } from "@/lib/types";

export type RoadmapRow = RoadmapTemplate & { instances_count: number };

const STATUT_CLASSES: Record<RoadmapStatut, string> = {
  brouillon: "bg-muted text-muted-foreground",
  publie: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  archive: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

interface ColumnsOptions {
  t: TFunction;
  onOpen: (row: RoadmapRow) => void;
  onEdit: (row: RoadmapRow) => void;
  onDelete: (row: RoadmapRow) => void;
}

export function getRoadmapColumns({ t, onOpen, onEdit, onDelete }: ColumnsOptions): ColumnDef<RoadmapRow>[] {
  return [
    {
      accessorKey: "titre",
      meta: { title: t("roadmaps.column_titre") },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("roadmaps.column_titre")} />,
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => onOpen(row.original)}
          className="text-left font-medium text-foreground hover:underline"
        >
          {row.original.titre}
        </button>
      ),
    },
    {
      accessorKey: "branche",
      meta: { title: t("roadmaps.column_branche") },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("roadmaps.column_branche")} />,
    },
    {
      accessorKey: "duree_semaines",
      meta: { title: t("roadmaps.column_duree") },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("roadmaps.column_duree")} />,
      cell: ({ row }) => t("roadmaps.duree_value", { count: row.original.duree_semaines }),
    },
    {
      accessorKey: "instances_count",
      meta: { title: t("roadmaps.column_instances") },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("roadmaps.column_instances")} />,
    },
    {
      accessorKey: "statut",
      meta: { title: t("roadmaps.column_statut") },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("roadmaps.column_statut")} />,
      cell: ({ row }) => (
        <Badge className={cn("border-0", STATUT_CLASSES[row.original.statut])}>
          {t(`roadmaps.statut_${row.original.statut}`)}
        </Badge>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <span className="sr-only">{t("common.actions")}</span>,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={t("common.actions")}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onOpen(row.original)}>
              {t("roadmaps.action_open")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onEdit(row.original)}>
              <Pencil className="h-4 w-4" />
              {t("common.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => onDelete(row.original)}>
              <Trash2 className="h-4 w-4" />
              {t("common.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
