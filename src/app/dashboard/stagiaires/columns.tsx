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
import { DataTableColumnHeader } from "@/components/data-table";
import type { StagiaireWithRelations } from "@/lib/types";

interface ColumnsOptions {
  t: TFunction;
  onEdit: (row: StagiaireWithRelations) => void;
  onDelete: (row: StagiaireWithRelations) => void;
}

export function getStagiaireColumns({
  t,
  onEdit,
  onDelete,
}: ColumnsOptions): ColumnDef<StagiaireWithRelations>[] {
  return [
    {
      accessorKey: "nom",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("stagiaires.nom_column")} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.nom}</span>
      ),
    },
    {
      accessorKey: "prenom",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("stagiaires.prenom_column")} />
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("stagiaires.email_column")} />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      id: "niveau",
      accessorFn: (row) => String(row.niveau),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("stagiaires.niveau_column")} />
      ),
    },
    {
      id: "etablissement",
      accessorFn: (row) => row.etablissement?.nom ?? "—",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("stagiaires.etablissement_column")} />
      ),
    },
    {
      id: "filiere",
      accessorFn: (row) => row.filiere?.nom ?? "—",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("stagiaires.filiere_column")} />
      ),
    },
    {
      accessorKey: "section",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("stagiaires.section_column")} />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {t(`stagiaires.section_${row.original.section}`)}
        </span>
      ),
    },
    {
      id: "actions",
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
