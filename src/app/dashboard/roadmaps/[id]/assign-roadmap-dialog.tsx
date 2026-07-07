"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Stagiaire } from "@/lib/types";

import { bulkAssignRoadmap } from "../actions";
import { bulkAssignRoadmapSchema, type BulkAssignRoadmapValues } from "../schema";

export function AssignRoadmapDialog({
  open,
  onOpenChange,
  templateId,
  stagiaires,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  stagiaires: Pick<Stagiaire, "id" | "nom" | "prenom" | "email">[];
}) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [syncedOpen, setSyncedOpen] = useState(open);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BulkAssignRoadmapValues>({
    resolver: zodResolver(bulkAssignRoadmapSchema),
    defaultValues: { dateDebut: "", dateFin: "" },
  });

  if (open !== syncedOpen) {
    setSyncedOpen(open);
    setSelectedIds([]);
    setSubmitError(null);
  }

  useEffect(() => {
    if (open) {
      reset({ dateDebut: "", dateFin: "" });
    }
  }, [open, reset]);

  function toggle(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function onSubmit(values: BulkAssignRoadmapValues) {
    if (selectedIds.length === 0) {
      setSubmitError(t("roadmaps.assign_stagiaire_required"));
      return;
    }
    setSubmitError(null);

    startTransition(async () => {
      const result = await bulkAssignRoadmap(templateId, selectedIds, values);
      if ("error" in result) {
        toast.error(t(result.error));
        return;
      }
      toast.success(t("roadmaps.assign_success"));
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("roadmaps.assign_title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>{t("roadmaps.assign_stagiaire_label")}</Label>
            {stagiaires.length === 0 ? (
              <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
                {t("roadmaps.assign_no_stagiaires")}
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto rounded-md border p-1.5">
                {stagiaires.map((stagiaire) => (
                  <label
                    key={stagiaire.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-accent"
                  >
                    <Checkbox
                      checked={selectedIds.includes(stagiaire.id)}
                      onCheckedChange={() => toggle(stagiaire.id)}
                    />
                    {stagiaire.prenom} {stagiaire.nom}
                  </label>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {t("roadmaps.assign_selected_count", { count: selectedIds.length })}
            </p>
            {submitError && <p className="text-xs text-red-600 dark:text-red-400">{submitError}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="assign-date-debut">{t("roadmaps.assign_date_debut_label")}</Label>
              <Input
                id="assign-date-debut"
                type="date"
                aria-invalid={!!errors.dateDebut}
                {...register("dateDebut")}
              />
              {errors.dateDebut && (
                <p className="text-xs text-red-600 dark:text-red-400">{t(errors.dateDebut.message ?? "")}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="assign-date-fin">{t("roadmaps.assign_date_fin_label")}</Label>
              <Input
                id="assign-date-fin"
                type="date"
                aria-invalid={!!errors.dateFin}
                {...register("dateFin")}
              />
              {errors.dateFin && (
                <p className="text-xs text-red-600 dark:text-red-400">{t(errors.dateFin.message ?? "")}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t("common.saving") : t("roadmaps.assign_submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
