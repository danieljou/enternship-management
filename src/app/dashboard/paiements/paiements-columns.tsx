"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";

import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table";
import { formatMontant, getPaiementStatusClasses, type PaiementStatus } from "@/lib/payment-status";
import { cn } from "@/lib/utils";

export interface PaiementRow {
  sessionId: string;
  sessionNom: string;
  stagiaireId: string;
  stagiaireNom: string;
  due: number;
  paid: number;
  remaining: number;
  status: PaiementStatus;
}

export function getPaiementColumns({ t }: { t: TFunction }): ColumnDef<PaiementRow>[] {
  return [
    {
      accessorKey: "stagiaireNom",
      meta: { title: t("paiements.column_stagiaire") },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("paiements.column_stagiaire")} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.stagiaireNom}</span>
      ),
    },
    {
      accessorKey: "sessionNom",
      meta: { title: t("paiements.column_session") },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("paiements.column_session")} />
      ),
    },
    {
      accessorKey: "due",
      meta: { title: t("paiements.column_due") },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("paiements.column_due")} />
      ),
      cell: ({ row }) => formatMontant(row.original.due),
    },
    {
      accessorKey: "paid",
      meta: { title: t("paiements.column_paid") },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("paiements.column_paid")} />
      ),
      cell: ({ row }) => formatMontant(row.original.paid),
    },
    {
      accessorKey: "remaining",
      meta: { title: t("paiements.column_remaining") },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("paiements.column_remaining")} />
      ),
      cell: ({ row }) => formatMontant(row.original.remaining),
    },
    {
      accessorKey: "status",
      meta: { title: t("paiements.column_status") },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("paiements.column_status")} />
      ),
      cell: ({ row }) => (
        <Badge className={cn("border-0", getPaiementStatusClasses(row.original.status))}>
          {t(`sessions.paiement_status_${row.original.status}`)}
        </Badge>
      ),
    },
  ];
}
