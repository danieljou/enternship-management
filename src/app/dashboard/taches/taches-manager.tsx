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
import { DataTable, type FilterField } from "@/components/data-table";
import type { TacheWithRelations } from "@/lib/types";

import { deleteTache, updateTacheStatut, type AssignableUser } from "./actions";
import { getTacheColumns } from "./columns";
import { TacheFormDialog } from "./form-dialog";

interface TachesManagerProps {
  data: TacheWithRelations[];
  stagiaires: { id: string; nom: string; prenom: string }[];
  assignableUsers: AssignableUser[];
}

export function TachesManager({ data, stagiaires, assignableUsers }: TachesManagerProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TacheWithRelations | null>(null);
  const [deleting, setDeleting] = useState<TacheWithRelations | null>(null);

  const columns = useMemo(
    () =>
      getTacheColumns({
        t,
        onEdit: (row) => {
          setEditing(row);
          setFormOpen(true);
        },
        onDelete: (row) => setDeleting(row),
        onStatutChange: (row, statut) => {
          startTransition(async () => {
            const result = await updateTacheStatut(row.id, statut as "a_faire" | "en_cours" | "termine");
            if ("error" in result) toast.error(t(result.error));
          });
        },
      }),
    [t]
  );

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        columnId: "statut",
        title: t("taches.statut_label"),
        options: [
          { label: t("taches.statut_a_faire"), value: "a_faire" },
          { label: t("taches.statut_en_cours"), value: "en_cours" },
          { label: t("taches.statut_termine"), value: "termine" },
        ],
      },
      {
        columnId: "priorite",
        title: t("taches.priorite_label"),
        options: [
          { label: t("taches.priorite_basse"), value: "basse" },
          { label: t("taches.priorite_normale"), value: "normale" },
          { label: t("taches.priorite_haute"), value: "haute" },
        ],
      },
    ],
    [t]
  );

  function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    startTransition(async () => {
      const result = await deleteTache(target.id);
      if ("error" in result) {
        toast.error(t(result.error));
      } else {
        toast.success(t("taches.delete_success"));
      }
      setDeleting(null);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("taches.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("taches.description")}</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          {t("taches.add_button")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchKey="titre"
        searchPlaceholder={t("taches.search_placeholder")}
        filterFields={filterFields}
      />

      <TacheFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        tache={editing}
        stagiaires={stagiaires}
        assignableUsers={assignableUsers}
      />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("taches.delete_confirm_description")}</AlertDialogDescription>
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
