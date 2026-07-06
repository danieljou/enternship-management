"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ClipboardCheck, Plus } from "lucide-react";
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

import { deleteRoadmapTemplate } from "./actions";
import { getRoadmapColumns, type RoadmapRow } from "./columns";
import { RoadmapFormDialog } from "./roadmap-form-dialog";

export function RoadmapsManager({ data }: { data: RoadmapRow[] }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RoadmapRow | null>(null);
  const [deleting, setDeleting] = useState<RoadmapRow | null>(null);

  const columns = useMemo(
    () =>
      getRoadmapColumns({
        t,
        onOpen: (row) => router.push(`/dashboard/roadmaps/${row.id}`),
        onEdit: (row) => {
          setEditing(row);
          setFormOpen(true);
        },
        onDelete: (row) => setDeleting(row),
      }),
    [t, router],
  );

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        columnId: "statut",
        title: t("roadmaps.column_statut"),
        options: (["brouillon", "publie", "archive"] as const).map((statut) => ({
          label: t(`roadmaps.statut_${statut}`),
          value: statut,
        })),
      },
    ],
    [t],
  );

  function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    startTransition(async () => {
      const result = await deleteRoadmapTemplate(target.id);
      if ("error" in result) {
        toast.error(t(result.error));
      } else {
        toast.success(t("roadmaps.delete_success"));
      }
      setDeleting(null);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("roadmaps.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("roadmaps.description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/roadmaps/validation">
              <ClipboardCheck className="h-4 w-4" />
              {t("roadmaps.validation_link")}
            </Link>
          </Button>
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            {t("roadmaps.add_button")}
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchKey="titre"
        searchPlaceholder={t("roadmaps.search_placeholder")}
        showViewOptions
        filterFields={filterFields}
      />

      <RoadmapFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        roadmap={editing}
        onCreated={(id) => router.push(`/dashboard/roadmaps/${id}`)}
      />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("roadmaps.delete_confirm_description")}</AlertDialogDescription>
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
