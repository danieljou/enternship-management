"use client";

import { useMemo, useState, useTransition } from "react";
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
import { DataTable } from "@/components/data-table";
import type { Etablissement } from "@/lib/types";

import { deleteEtablissement } from "./actions";
import { getEtablissementColumns } from "./columns";
import { EtablissementFormDialog } from "./form-dialog";

export function EtablissementsManager({ data }: { data: Etablissement[] }) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Etablissement | null>(null);
  const [deleting, setDeleting] = useState<Etablissement | null>(null);

  const columns = useMemo(
    () =>
      getEtablissementColumns({
        t,
        onEdit: (row) => {
          setEditing(row);
          setFormOpen(true);
        },
        onDelete: (row) => setDeleting(row),
      }),
    [t]
  );

  function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    startTransition(async () => {
      const result = await deleteEtablissement(target.id);
      if ("error" in result) {
        toast.error(t(result.error));
      } else {
        toast.success(t("etablissements.delete_success"));
      }
      setDeleting(null);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {t("etablissements.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("etablissements.description")}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          {t("etablissements.add_button")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchKey="nom"
        searchPlaceholder={t("etablissements.search_placeholder")}
        showViewOptions
      />

      <EtablissementFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        etablissement={editing}
      />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("etablissements.delete_confirm_description")}
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
