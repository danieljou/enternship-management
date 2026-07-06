"use client";

import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, UserPlus } from "lucide-react";
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
import type { RoadmapInstanceWithRelations, RoadmapStatut, Stagiaire } from "@/lib/types";

import { deleteInstance } from "../actions";
import { AssignRoadmapDialog } from "./assign-roadmap-dialog";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function getInitials(prenom: string, nom: string) {
  return `${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase() || "?";
}

export function RoadmapInstancesTab({
  templateId,
  templateStatut,
  instances,
  stagiaires,
}: {
  templateId: string;
  templateStatut: RoadmapStatut;
  instances: RoadmapInstanceWithRelations[];
  stagiaires: Pick<Stagiaire, "id" | "nom" | "prenom" | "email">[];
}) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [assignOpen, setAssignOpen] = useState(false);
  const [deleting, setDeleting] = useState<RoadmapInstanceWithRelations | null>(null);

  function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    startTransition(async () => {
      const result = await deleteInstance(target.id, templateId);
      if ("error" in result) toast.error(t(result.error));
      else toast.success(t("roadmaps.instance_delete_success"));
      setDeleting(null);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{t("roadmaps.instances_description")}</p>
        <Button size="sm" onClick={() => setAssignOpen(true)} disabled={templateStatut !== "publie"}>
          <Plus className="h-4 w-4" />
          {t("roadmaps.assign_button")}
        </Button>
      </div>

      {templateStatut !== "publie" && (
        <p className="text-xs text-muted-foreground">{t("roadmaps.assign_requires_published")}</p>
      )}

      {instances.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed p-10 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <UserPlus className="h-5 w-5" />
          </span>
          <p className="text-sm text-muted-foreground">{t("roadmaps.instances_empty")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {instances.map((instance) => (
            <div
              key={instance.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 transition-colors hover:border-primary/30"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {instance.stagiaire ? getInitials(instance.stagiaire.prenom, instance.stagiaire.nom) : "?"}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {instance.stagiaire ? `${instance.stagiaire.prenom} ${instance.stagiaire.nom}` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(instance.date_debut)} → {formatDate(instance.date_fin)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  v{instance.version_snapshot}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("common.delete")}
                  onClick={() => setDeleting(instance)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AssignRoadmapDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        templateId={templateId}
        stagiaires={stagiaires}
      />

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("roadmaps.instance_delete_confirm_description")}</AlertDialogDescription>
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
