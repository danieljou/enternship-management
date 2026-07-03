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
import type { Filiere } from "@/lib/types";

interface ColumnsOptions {
  t: TFunction;
  onEdit: (row: Filiere) => void;
  onDelete: (row: Filiere) => void;
}

export function getFiliereColumns({ t, onEdit, onDelete }: ColumnsOptions): ColumnDef<Filiere>[] {
  return [
    {
      accessorKey: "nom",
      meta: { title: t("filieres.nom_column") },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("filieres.nom_column")} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.nom}</span>
      ),
    },
    {
      accessorKey: "created_at",
      meta: { title: t("filieres.created_column") },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("filieres.created_column")} />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.original.created_at).toLocaleDateString()}
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
