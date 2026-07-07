"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { Trash2, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table";
import type { EncadrantOption } from "./actions";

interface ColumnsOptions {
  t: TFunction;
  onDelete: (row: EncadrantOption) => void;
}

export function getEncadrantColumns({ t, onDelete }: ColumnsOptions): ColumnDef<EncadrantOption>[] {
  return [
    {
      accessorKey: "nom",
      meta: { title: t("encadrants.nom_column") },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("encadrants.nom_column")} />,
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.nom}</span>
      ),
    },
    {
      accessorKey: "prenom",
      meta: { title: t("encadrants.prenom_column") },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("encadrants.prenom_column")} />,
    },
    {
      accessorKey: "email",
      meta: { title: t("encadrants.email_column") },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("encadrants.email_column")} />,
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
    },
    {
      accessorKey: "stagiairesCount",
      meta: { title: t("encadrants.stagiaires_column") },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("encadrants.stagiaires_column")} />,
      cell: ({ row }) => (
        <Badge variant="secondary" className="gap-1">
          <Users className="h-3 w-3" />
          {row.original.stagiairesCount}
        </Badge>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <span className="sr-only">{t("common.actions")}</span>,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("common.delete")}
          onClick={() => onDelete(row.original)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];
}
