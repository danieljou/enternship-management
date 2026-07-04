"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { LayoutDashboard, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table";
import type { SessionWithCounts } from "@/lib/types";

interface ColumnsOptions {
  t: TFunction;
  onEdit: (row: SessionWithCounts) => void;
  onDelete: (row: SessionWithCounts) => void;
}

function formatPeriode(row: SessionWithCounts) {
  if (!row.date_debut && !row.date_fin) return "-";
  const debut = row.date_debut
    ? new Date(row.date_debut).toLocaleDateString()
    : "?";
  const fin = row.date_fin ? new Date(row.date_fin).toLocaleDateString() : "?";
  return `${debut} → ${fin}`;
}

export function getSessionColumns({
  t,
  onEdit,
  onDelete,
}: ColumnsOptions): ColumnDef<SessionWithCounts>[] {
  return [
    {
      accessorKey: "nom",
      meta: { title: t("sessions.nom_column") },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("sessions.nom_column")}
        />
      ),
      cell: ({ row }) => (
        <Link
          href={`/dashboard/sessions/${row.original.id}`}
          className="font-medium text-foreground hover:underline"
        >
          {row.original.nom}
        </Link>
      ),
    },
    {
      id: "periode",
      meta: { title: t("sessions.periode_column") },
      header: () => <span>{t("sessions.periode_column")}</span>,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatPeriode(row.original)}
        </span>
      ),
    },
    {
      accessorKey: "etapes_count",
      meta: { title: t("sessions.etapes_count_column") },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("sessions.etapes_count_column")}
        />
      ),
      cell: ({ row }) => <span>{row.original.etapes_count}</span>,
    },
    {
      accessorKey: "stagiaires_count",
      meta: { title: t("sessions.stagiaires_count_column") },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("sessions.stagiaires_count_column")}
        />
      ),
      cell: ({ row }) => <span>{row.original.stagiaires_count}</span>,
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
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/sessions/${row.original.id}`}>
                <LayoutDashboard className="h-4 w-4" />
                {t("sessions.manage_button")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onEdit(row.original)}>
              <Pencil className="h-4 w-4" />
              {t("common.edit")}
            </DropdownMenuItem>
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
