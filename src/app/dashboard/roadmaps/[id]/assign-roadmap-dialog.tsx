"use client";

import { useEffect, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Stagiaire } from "@/lib/types";

import { assignRoadmap } from "../actions";
import { assignRoadmapSchema, type AssignRoadmapValues } from "../schema";

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

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignRoadmapValues>({
    resolver: zodResolver(assignRoadmapSchema),
    defaultValues: { stagiaireId: "", dateDebut: "", dateFin: "" },
  });

  useEffect(() => {
    if (open) reset({ stagiaireId: "", dateDebut: "", dateFin: "" });
  }, [open, reset]);

  function onSubmit(values: AssignRoadmapValues) {
    startTransition(async () => {
      const result = await assignRoadmap(templateId, values);
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
            <Label htmlFor="assign-stagiaire">{t("roadmaps.assign_stagiaire_label")}</Label>
            <Controller
              control={control}
              name="stagiaireId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="assign-stagiaire" className="w-full" aria-invalid={!!errors.stagiaireId}>
                    <SelectValue placeholder={t("roadmaps.assign_stagiaire_placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {stagiaires.map((stagiaire) => (
                      <SelectItem key={stagiaire.id} value={stagiaire.id}>
                        {stagiaire.prenom} {stagiaire.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.stagiaireId && (
              <p className="text-xs text-red-600 dark:text-red-400">{t(errors.stagiaireId.message ?? "")}</p>
            )}
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
