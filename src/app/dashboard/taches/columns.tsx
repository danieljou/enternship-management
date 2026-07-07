"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTableColumnHeader } from "@/components/data-table";
import { cn } from "@/lib/utils";
import type { TacheWithRelations } from "@/lib/types";

const STATUT_CLASSES: Record<string, string> = {
  a_faire: "bg-muted text-muted-foreground",
  en_cours: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  termine: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

const PRIORITE_CLASSES: Record<string, string> = {
  basse: "bg-muted text-muted-foreground",
  normale: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  haute: "bg-red-500/10 text-red-600 dark:text-red-400",
};

interface ColumnsOptions {
  t: TFunction;
  onEdit: (row: TacheWithRelations) => void;
  onDelete: (row: TacheWithRelations) => void;
  onStatutChange: (row: TacheWithRelations, statut: string) => void;
}

export function getTacheColumns({
  t,
  onEdit,
  onDelete,
  onStatutChange,
}: ColumnsOptions): ColumnDef<TacheWithRelations>[] {
  return [
    {
      accessorKey: "titre",
      meta: { title: t("taches.titre_column") },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("taches.titre_column")} />,
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.titre}</span>
      ),
    },
    {
      id: "statut",
      accessorFn: (row) => row.statut,
      meta: { title: t("taches.statut_column") },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("taches.statut_column")} />,
      cell: ({ row }) => (
        <Select value={row.original.statut} onValueChange={(value) => onStatutChange(row.original, value)}>
          <SelectTrigger
            size="sm"
            className={cn("h-7 w-auto border-0 px-2 text-xs font-medium", STATUT_CLASSES[row.original.statut])}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a_faire">{t("taches.statut_a_faire")}</SelectItem>
            <SelectItem value="en_cours">{t("taches.statut_en_cours")}</SelectItem>
            <SelectItem value="termine">{t("taches.statut_termine")}</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "priorite",
      accessorFn: (row) => row.priorite,
      meta: { title: t("taches.priorite_column") },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("taches.priorite_column")} />,
      cell: ({ row }) => (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            PRIORITE_CLASSES[row.original.priorite],
          )}
        >
          {t(`taches.priorite_${row.original.priorite}`)}
        </span>
      ),
    },
    {
      id: "echeance",
      accessorFn: (row) => row.echeance ?? "",
      meta: { title: t("taches.echeance_column") },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("taches.echeance_column")} />,
      cell: ({ row }) =>
        row.original.echeance ? (
          <span className="text-muted-foreground">
            {new Date(row.original.echeance).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: "assignee",
      accessorFn: (row) => (row.assignee ? `${row.assignee.prenom} ${row.assignee.nom}` : ""),
      meta: { title: t("taches.assignee_column") },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("taches.assignee_column")} />,
      cell: ({ row }) =>
        row.original.assignee ? (
          <span className="text-foreground">
            {row.original.assignee.prenom} {row.original.assignee.nom}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
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
