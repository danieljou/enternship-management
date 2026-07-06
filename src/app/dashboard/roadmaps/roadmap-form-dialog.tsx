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
import { Textarea } from "@/components/ui/textarea";
import type { RoadmapTemplate } from "@/lib/types";

import { createRoadmapTemplate, updateRoadmapTemplate } from "./actions";
import { roadmapTemplateSchema, type RoadmapTemplateValues } from "./schema";

interface RoadmapFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roadmap: RoadmapTemplate | null;
  onCreated?: (id: string) => void;
}

function defaultValues(roadmap: RoadmapTemplate | null): RoadmapTemplateValues {
  return {
    titre: roadmap?.titre ?? "",
    branche: roadmap?.branche ?? "",
    niveau: roadmap?.niveau ?? "",
    dureeSemaines: roadmap?.duree_semaines != null ? String(roadmap.duree_semaines) : "4",
    version: roadmap?.version ?? "1.0",
    note: roadmap?.note ?? "",
  };
}

export function RoadmapFormDialog({ open, onOpenChange, roadmap, onCreated }: RoadmapFormDialogProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!roadmap;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoadmapTemplateValues>({
    resolver: zodResolver(roadmapTemplateSchema),
    defaultValues: defaultValues(roadmap),
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues(roadmap));
    }
  }, [open, roadmap, reset]);

  function onSubmit(values: RoadmapTemplateValues) {
    startTransition(async () => {
      if (isEditing) {
        const result = await updateRoadmapTemplate(roadmap.id, values);
        if ("error" in result) {
          toast.error(t(result.error));
          return;
        }
        toast.success(t("roadmaps.update_success"));
        onOpenChange(false);
        return;
      }

      const result = await createRoadmapTemplate(values);
      if ("error" in result) {
        toast.error(t(result.error));
        return;
      }
      toast.success(t("roadmaps.create_success"));
      onOpenChange(false);
      if (result.id) {
        onCreated?.(result.id);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(isEditing ? "roadmaps.edit_title" : "roadmaps.add_title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="roadmap-titre">{t("roadmaps.titre_label")}</Label>
            <Input
              id="roadmap-titre"
              placeholder={t("roadmaps.titre_placeholder")}
              aria-invalid={!!errors.titre}
              {...register("titre")}
            />
            {errors.titre && (
              <p className="text-xs text-red-600 dark:text-red-400">{t(errors.titre.message ?? "")}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="roadmap-branche">{t("roadmaps.branche_label")}</Label>
              <Input
                id="roadmap-branche"
                placeholder={t("roadmaps.branche_placeholder")}
                aria-invalid={!!errors.branche}
                {...register("branche")}
              />
              {errors.branche && (
                <p className="text-xs text-red-600 dark:text-red-400">{t(errors.branche.message ?? "")}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="roadmap-niveau">{t("roadmaps.niveau_label")}</Label>
              <Input
                id="roadmap-niveau"
                placeholder={t("roadmaps.niveau_placeholder")}
                {...register("niveau")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="roadmap-duree">{t("roadmaps.duree_label")}</Label>
              <Input
                id="roadmap-duree"
                type="number"
                min={1}
                aria-invalid={!!errors.dureeSemaines}
                {...register("dureeSemaines")}
              />
              {errors.dureeSemaines && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {t(errors.dureeSemaines.message ?? "")}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="roadmap-version">{t("roadmaps.version_label")}</Label>
              <Input
                id="roadmap-version"
                aria-invalid={!!errors.version}
                {...register("version")}
              />
              {errors.version && (
                <p className="text-xs text-red-600 dark:text-red-400">{t(errors.version.message ?? "")}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="roadmap-note">{t("roadmaps.note_label")}</Label>
            <Textarea id="roadmap-note" placeholder={t("roadmaps.note_placeholder")} {...register("note")} />
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
