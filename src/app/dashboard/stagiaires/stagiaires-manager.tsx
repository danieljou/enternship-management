"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DataTable, type FilterField } from "@/components/data-table";
import type { Etablissement, Filiere, StagiaireWithRelations } from "@/lib/types";

import { deleteStagiaire, sendStagiairePasswordReset } from "./actions";
import { getStagiaireColumns } from "./columns";
import { StagiaireEditDialog } from "./stagiaire-edit-dialog";

interface StagiairesManagerProps {
  data: StagiaireWithRelations[];
  etablissements: Etablissement[];
  filieres: Filiere[];
}

export function StagiairesManager({
  data,
  etablissements,
  filieres,
}: StagiairesManagerProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<StagiaireWithRelations | null>(null);
  const [deleting, setDeleting] = useState<StagiaireWithRelations | null>(null);

  const columns = useMemo(
    () =>
      getStagiaireColumns({
        t,
        onEdit: (row) => setEditing(row),
        onDelete: (row) => setDeleting(row),
        onSendReset: (row) => {
          startTransition(async () => {
            const result = await sendStagiairePasswordReset(row.email);
            if ("error" in result) {
              toast.error(t(result.error));
            } else {
              toast.success(t("stagiaires.send_reset_success"));
            }
          });
        },
      }),
    [t]
  );

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        columnId: "niveau",
        title: t("stagiaires.niveau_label"),
        options: ["1", "2", "3", "4", "5"].map((level) => ({ label: level, value: level })),
      },
      {
        columnId: "section",
        title: t("stagiaires.section_label"),
        options: [
          { label: t("stagiaires.section_francophone"), value: "francophone" },
          { label: t("stagiaires.section_anglophone"), value: "anglophone" },
        ],
      },
    ],
    [t]
  );

  function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    startTransition(async () => {
      const result = await deleteStagiaire(target.id, target.user_id);
      if ("error" in result) {
        toast.error(t(result.error));
      } else {
        toast.success(t("stagiaires.delete_success"));
      }
      setDeleting(null);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("stagiaires.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("stagiaires.description")}</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/stagiaires/nouveau">
            <Plus className="h-4 w-4" />
            {t("stagiaires.add_button")}
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchKey="nom"
        searchPlaceholder={t("stagiaires.search_placeholder")}
        filterFields={filterFields}
        showViewOptions
      />

      <StagiaireEditDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        stagiaire={editing}
        etablissements={etablissements}
        filieres={filieres}
      />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("stagiaires.delete_confirm_description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isPending}>
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
