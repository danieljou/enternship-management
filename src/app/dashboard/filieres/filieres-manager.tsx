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
import type { Filiere } from "@/lib/types";

import { deleteFiliere } from "./actions";
import { getFiliereColumns } from "./columns";
import { FiliereFormDialog } from "./form-dialog";

export function FilieresManager({ data }: { data: Filiere[] }) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Filiere | null>(null);
  const [deleting, setDeleting] = useState<Filiere | null>(null);

  const columns = useMemo(
    () =>
      getFiliereColumns({
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
      const result = await deleteFiliere(target.id);
      if ("error" in result) {
        toast.error(t(result.error));
      } else {
        toast.success(t("filieres.delete_success"));
      }
      setDeleting(null);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("filieres.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("filieres.description")}</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          {t("filieres.add_button")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchKey="nom"
        searchPlaceholder={t("filieres.search_placeholder")}
        showViewOptions
      />

      <FiliereFormDialog open={formOpen} onOpenChange={setFormOpen} filiere={editing} />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("filieres.delete_confirm_description")}
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
