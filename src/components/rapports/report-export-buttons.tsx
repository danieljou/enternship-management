"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";

import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/csv-export";

import { TableReportPdf } from "./table-report-pdf";

export function ReportExportButtons({
  title,
  headers,
  rows,
  filenameBase,
}: {
  title: string;
  headers: string[];
  rows: string[][];
  filenameBase: string;
}) {
  const { t } = useTranslation();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  async function exportPdf() {
    setIsGeneratingPdf(true);
    try {
      const blob = await pdf(<TableReportPdf title={title} headers={headers} rows={rows} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filenameBase}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  function exportCsv() {
    downloadCsv(`${filenameBase}.csv`, headers, rows);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" onClick={exportCsv} disabled={rows.length === 0}>
        <FileSpreadsheet className="h-4 w-4" />
        {t("rapports.export_csv")}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={exportPdf}
        disabled={rows.length === 0 || isGeneratingPdf}
      >
        {isGeneratingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
        {t("rapports.export_pdf")}
      </Button>
    </div>
  );
}
