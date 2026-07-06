"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
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
import type { RoadmapSemaineWithEtapes } from "@/lib/types";

import { createSemaine, updateSemaine } from "../actions";
import { semaineSchema, type SemaineValues } from "../schema";

export function SemaineFormDialog({
  open,
  onOpenChange,
  roadmapId,
  semaine,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roadmapId: string;
  semaine: RoadmapSemaineWithEtapes | null;
}) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!semaine;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SemaineValues>({
    resolver: zodResolver(semaineSchema),
    defaultValues: { titre: semaine?.titre ?? "" },
  });

  useEffect(() => {
    if (open) reset({ titre: semaine?.titre ?? "" });
  }, [open, semaine, reset]);

  function onSubmit(values: SemaineValues) {
    startTransition(async () => {
      const result = isEditing
        ? await updateSemaine(semaine.id, roadmapId, values)
        : await createSemaine(roadmapId, values);

      if ("error" in result) {
        toast.error(t(result.error));
        return;
      }

      toast.success(t(isEditing ? "roadmaps.semaine_update_success" : "roadmaps.semaine_create_success"));
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t(isEditing ? "roadmaps.semaine_edit_title" : "roadmaps.semaine_add_title")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="semaine-titre">{t("roadmaps.semaine_titre_label")}</Label>
            <Input
              id="semaine-titre"
              placeholder={t("roadmaps.semaine_titre_placeholder")}
              aria-invalid={!!errors.titre}
              {...register("titre")}
            />
            {errors.titre && (
              <p className="text-xs text-red-600 dark:text-red-400">{t(errors.titre.message ?? "")}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
