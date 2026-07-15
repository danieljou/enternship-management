"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";

import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table";
import {
  formatMontant,
  getPaiementStatusClasses,
  type PaiementStatus,
} from "@/lib/payment-status";
import { cn } from "@/lib/utils";
import { PaiementReceiptButton } from "@/components/paiements/paiement-receipt-button";

export interface PaiementRow {
  sessionId: string;
  sessionNom: string;
  stagiaireId: string;
  stagiaireNom: string;
  stagiairePrenom: string;
  due: number;
  paid: number;
  remaining: number;
  status: PaiementStatus;
  lastPaymentDate: string | null;
  lastPaymentMoyen: string | null;
}

export function getPaiementColumns({
  t,
}: {
  t: TFunction;
}): ColumnDef<PaiementRow>[] {
  return [
    {
      accessorKey: "stagiaireNom",
      meta: { title: t("paiements.column_stagiaire") },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("paiements.column_stagiaire")}
        />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.stagiaireNom}
        </span>
      ),
    },
    {
      accessorKey: "sessionNom",
      meta: { title: t("paiements.column_session") },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("paiements.column_session")}
        />
      ),
    },
    {
      accessorKey: "due",
      meta: { title: t("paiements.column_due") },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("paiements.column_due")}
        />
      ),
      cell: ({ row }) => formatMontant(row.original.due),
    },
    {
      accessorKey: "paid",
      meta: { title: t("paiements.column_paid") },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("paiements.column_paid")}
        />
      ),
      cell: ({ row }) => formatMontant(row.original.paid),
    },
    {
      accessorKey: "remaining",
      meta: { title: t("paiements.column_remaining") },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("paiements.column_remaining")}
        />
      ),
      cell: ({ row }) => formatMontant(row.original.remaining),
    },
    {
      accessorKey: "status",
      meta: { title: t("paiements.column_status") },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("paiements.column_status")}
        />
      ),
      cell: ({ row }) => (
        <Badge
          className={cn(
            "border-0",
            getPaiementStatusClasses(row.original.status),
          )}
        >
          {t(`sessions.paiement_status_${row.original.status}`)}
        </Badge>
      ),
    },
    {
      id: "actions",
      meta: { title: t("paiements.column_actions") },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t("paiements.column_actions")}
        />
      ),
      cell: ({ row }) => {
        if (row.original.status !== "paye" && row.original.status !== "partiel") {
          return null;
        }
        return (
          <PaiementReceiptButton
            sessionId={row.original.sessionId}
            stagiaireId={row.original.stagiaireId}
            stagiaireNom={row.original.stagiaireNom}
            stagiairePrenom={row.original.stagiairePrenom}
            sessionNom={row.original.sessionNom}
            montant={row.original.paid}
            date_paiement={
              row.original.lastPaymentDate ?? new Date().toISOString()
            }
            moyen={row.original.lastPaymentMoyen}
            due={row.original.due}
            paid={row.original.paid}
            remaining={row.original.remaining}
            status={row.original.status}
          />
        );
      },
    },
  ];
}
