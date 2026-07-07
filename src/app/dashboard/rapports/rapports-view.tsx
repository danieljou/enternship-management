"use client";

import { useTranslation } from "react-i18next";
import { CalendarClock, GraduationCap, Milestone, Wallet } from "lucide-react";

import { ReportExportButtons } from "@/components/rapports/report-export-buttons";

interface ReportSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  headers: string[];
  rows: string[][];
  filenameBase: string;
}

function ReportSection({ icon, title, description, headers, rows, filenameBase }: ReportSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("rapports.rows_count", { count: rows.length })}
            </p>
          </div>
        </div>
        <ReportExportButtons title={title} headers={headers} rows={rows} filenameBase={filenameBase} />
      </div>
    </div>
  );
}

export function RapportsView({
  stagiaireRows,
  paiementRows,
  roadmapRows,
}: {
  stagiaireRows: string[][];
  paiementRows: string[][];
  roadmapRows: string[][];
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("rapports.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("rapports.subtitle")}</p>
      </div>

      <div className="flex flex-col gap-4">
        <ReportSection
          icon={<GraduationCap className="h-5 w-5" />}
          title={t("rapports.stagiaires_title")}
          description={t("rapports.stagiaires_description")}
          headers={[
            t("stagiaires.nom_column"),
            t("stagiaires.prenom_column"),
            t("stagiaires.email_column"),
            t("stagiaires.niveau_column"),
            t("stagiaires.etablissement_column"),
            t("stagiaires.filiere_column"),
            t("stagiaires.section_column"),
            t("stagiaires.encadrant_label"),
          ]}
          rows={stagiaireRows}
          filenameBase="rapport-stagiaires"
        />

        <ReportSection
          icon={<Wallet className="h-5 w-5" />}
          title={t("rapports.paiements_title")}
          description={t("rapports.paiements_description")}
          headers={[
            t("paiements.column_session"),
            t("sessions.paiement_due_label"),
            t("rapports.paiements_enrolled_column"),
            t("paiements.kpi_attendu"),
            t("paiements.kpi_collecte"),
            t("paiements.kpi_reste"),
            t("paiements.kpi_taux"),
            t("paiements.column_status"),
          ]}
          rows={paiementRows}
          filenameBase="rapport-paiements"
        />

        <ReportSection
          icon={<Milestone className="h-5 w-5" />}
          title={t("rapports.roadmaps_title")}
          description={t("rapports.roadmaps_description")}
          headers={[
            t("verify.stagiaire_label"),
            t("roadmaps.titre_label"),
            t("roadmaps.branche_label"),
            t("rapports.roadmaps_progress_column"),
          ]}
          rows={roadmapRows}
          filenameBase="rapport-roadmaps"
        />
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-dashed p-4 text-xs text-muted-foreground">
        <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{t("rapports.freshness_note")}</span>
      </div>
    </div>
  );
}
