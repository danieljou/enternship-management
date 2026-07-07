"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { downloadCsv } from "@/lib/csv-export";
import { parseCsv } from "@/lib/csv-import";

import { bulkCreateStagiaires, type BulkImportResult, type BulkImportRow } from "./actions";

const EXPECTED_HEADERS = ["nom", "prenom", "email", "niveau", "etablissement", "filiere", "section"];

function normalizeHeader(header: string) {
  return header
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function StagiaireImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<BulkImportRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkImportResult | null>(null);

  function reset() {
    setRows([]);
    setParseError(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setResult(null);
    const text = await file.text();
    const table = parseCsv(text);

    if (table.length < 2) {
      setParseError(t("bulk_import.empty_file"));
      setRows([]);
      return;
    }

    const headerIndex = new Map(table[0].map((header, index) => [normalizeHeader(header), index]));
    const missing = EXPECTED_HEADERS.filter((header) => !headerIndex.has(header));
    if (missing.length > 0) {
      setParseError(t("bulk_import.missing_columns", { columns: missing.join(", ") }));
      setRows([]);
      return;
    }

    setParseError(null);
    const parsedRows: BulkImportRow[] = table.slice(1).map((cells, index) => ({
      line: index + 2,
      nom: cells[headerIndex.get("nom")!]?.trim() ?? "",
      prenom: cells[headerIndex.get("prenom")!]?.trim() ?? "",
      email: cells[headerIndex.get("email")!]?.trim() ?? "",
      niveau: cells[headerIndex.get("niveau")!]?.trim() ?? "",
      etablissementNom: cells[headerIndex.get("etablissement")!]?.trim() ?? "",
      filiereNom: cells[headerIndex.get("filiere")!]?.trim() ?? "",
      section: cells[headerIndex.get("section")!]?.trim().toLowerCase() ?? "",
    }));
    setRows(parsedRows);
  }

  function handleImport() {
    startTransition(async () => {
      const importResult = await bulkCreateStagiaires(rows);
      setResult(importResult);
      if (importResult.created > 0) {
        toast.success(t("bulk_import.success", { count: importResult.created }));
      }
    });
  }

  function downloadTemplate() {
    downloadCsv(
      "modele-import-stagiaires.csv",
      EXPECTED_HEADERS,
      [["Nkeng", "Marie", "marie.nkeng@exemple.com", "3", "Université de Yaoundé I", "Informatique", "francophone"]],
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("bulk_import.title")}</DialogTitle>
          <DialogDescription>{t("bulk_import.description")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Button type="button" variant="outline" size="sm" className="self-start" onClick={downloadTemplate}>
            <Download className="h-4 w-4" />
            {t("bulk_import.download_template")}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
          />

          {parseError && <p className="text-sm text-red-600 dark:text-red-400">{parseError}</p>}

          {rows.length > 0 && !result && (
            <p className="text-sm text-muted-foreground">
              {t("bulk_import.rows_ready", { count: rows.length })}
            </p>
          )}

          {result && (
            <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 text-sm">
              <p className="font-medium text-foreground">
                {t("bulk_import.result_summary", { created: result.created, errors: result.errors.length })}
              </p>
              {result.errors.length > 0 && (
                <ul className="flex max-h-40 flex-col gap-1 overflow-y-auto text-xs text-red-600 dark:text-red-400">
                  {result.errors.map((error, index) => (
                    <li key={index}>
                      {t("bulk_import.line_label", { line: error.line })}: {t(error.message)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button type="button" onClick={handleImport} disabled={rows.length === 0 || isPending}>
            <Upload className="h-4 w-4" />
            {isPending ? t("common.saving") : t("bulk_import.import_button")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
