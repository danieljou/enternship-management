"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { KeyRound, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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
  onSendReset: (row: StagiaireWithRelations) => void;
}

export function getStagiaireColumns({
  t,
  onEdit,
  onDelete,
  onSendReset,
}: ColumnsOptions): ColumnDef<StagiaireWithRelations>[] {
  return [
    {
      accessorKey: "nom",
      meta: { title: t("stagiaires.nom_column") },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("stagiaires.nom_column")}
        />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.nom}</span>
      ),
    },
    {
      accessorKey: "prenom",
      meta: { title: t("stagiaires.prenom_column") },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("stagiaires.prenom_column")}
        />
      ),
    },
    {
      accessorKey: "email",
      meta: { title: t("stagiaires.email_column") },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("stagiaires.email_column")}
        />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      id: "niveau",
      accessorFn: (row) => String(row.niveau),
      meta: { title: t("stagiaires.niveau_column") },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("stagiaires.niveau_column")}
        />
      ),
    },
    {
      id: "etablissement",
      accessorFn: (row) => row.etablissement?.nom ?? "-",
      meta: { title: t("stagiaires.etablissement_column") },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("stagiaires.etablissement_column")}
        />
      ),
    },
    {
      id: "filiere",
      accessorFn: (row) => row.filiere?.nom ?? "-",
      meta: { title: t("stagiaires.filiere_column") },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("stagiaires.filiere_column")}
        />
      ),
    },
    {
      accessorKey: "section",
      meta: { title: t("stagiaires.section_column") },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("stagiaires.section_column")}
        />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {t(`stagiaires.section_${row.original.section}`)}
        </span>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <span className="sr-only">{t("common.actions")}</span>,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t("common.actions")}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(row.original)}>
              <Pencil className="h-4 w-4" />
              {t("common.edit")}
            </DropdownMenuItem>
            {row.original.user_id && (
              <DropdownMenuItem onSelect={() => onSendReset(row.original)}>
                <KeyRound className="h-4 w-4" />
                {t("stagiaires.send_reset_action")}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onDelete(row.original)}
            >
              <Trash2 className="h-4 w-4" />
              {t("common.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
