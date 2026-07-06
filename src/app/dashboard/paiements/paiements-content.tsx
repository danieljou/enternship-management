"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, PiggyBank, Wallet, TrendingDown } from "lucide-react";

import { DataTable, type FilterField } from "@/components/data-table";
import { formatMontant } from "@/lib/payment-status";

import { getPaiementColumns, type PaiementRow } from "./paiements-columns";
import { PaiementsChart, type SessionPaiementSummary } from "./paiements-chart";

export function PaiementsContent({
  rows,
  sessionSummaries,
}: {
  rows: PaiementRow[];
  sessionSummaries: SessionPaiementSummary[];
}) {
  const { t } = useTranslation();
  const columns = useMemo(() => getPaiementColumns({ t }), [t]);

  const filterFields: FilterField[] = useMemo(() => {
    const sessions = Array.from(new Set(rows.map((row) => row.sessionNom))).sort();
    return [
      {
        columnId: "status",
        title: t("paiements.column_status"),
        options: (["impaye", "partiel", "paye"] as const).map((status) => ({
          label: t(`sessions.paiement_status_${status}`),
          value: status,
        })),
      },
      {
        columnId: "sessionNom",
        title: t("paiements.column_session"),
        options: sessions.map((session) => ({ label: session, value: session })),
      },
    ];
  }, [rows, t]);

  const totalAttendu = rows.reduce((sum, row) => sum + row.due, 0);
  const totalCollecte = rows.reduce((sum, row) => sum + row.paid, 0);
  const totalReste = Math.max(totalAttendu - totalCollecte, 0);
  const taux = totalAttendu > 0 ? Math.round((totalCollecte / totalAttendu) * 100) : 0;

  const tiles = [
    { key: "attendu", label: t("paiements.kpi_attendu"), value: formatMontant(totalAttendu), icon: Wallet },
    {
      key: "collecte",
      label: t("paiements.kpi_collecte"),
      value: formatMontant(totalCollecte),
      icon: PiggyBank,
    },
    {
      key: "reste",
      label: t("paiements.kpi_reste"),
      value: formatMontant(totalReste),
      icon: TrendingDown,
    },
    { key: "taux", label: t("paiements.kpi_taux"), value: `${taux}%`, icon: CheckCircle2 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("paiements.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("paiements.description")}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map(({ key, label, value, icon: Icon }) => (
          <div
            key={key}
            className="rounded-2xl border border-border/60 bg-card p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.7)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-xs text-muted-foreground sm:text-sm">{label}</p>
            <p className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {value}
            </p>
          </div>
        ))}
      </div>

      <PaiementsChart data={sessionSummaries} />

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          {t("paiements.table_empty")}
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          searchKey="stagiaireNom"
          searchPlaceholder={t("paiements.search_placeholder")}
          filterFields={filterFields}
          showViewOptions
        />
      )}
    </div>
  );
}
