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
import type { Etablissement } from "@/lib/types";

import { createEtablissement, updateEtablissement } from "./actions";
import { etablissementSchema, type EtablissementValues } from "./schema";

interface EtablissementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  etablissement: Etablissement | null;
}

export function EtablissementFormDialog({
  open,
  onOpenChange,
  etablissement,
}: EtablissementFormDialogProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!etablissement;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EtablissementValues>({
    resolver: zodResolver(etablissementSchema),
    defaultValues: { nom: etablissement?.nom ?? "" },
  });

  useEffect(() => {
    if (open) {
      reset({ nom: etablissement?.nom ?? "" });
    }
  }, [open, etablissement, reset]);

  function onSubmit(values: EtablissementValues) {
    startTransition(async () => {
      const result = isEditing
        ? await updateEtablissement(etablissement.id, values)
        : await createEtablissement(values);

      if ("error" in result) {
        toast.error(t(result.error));
        return;
      }

      toast.success(
        t(isEditing ? "etablissements.update_success" : "etablissements.create_success")
      );
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t(isEditing ? "etablissements.edit_title" : "etablissements.add_title")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="etablissement-nom">{t("etablissements.nom_label")}</Label>
            <Input
              id="etablissement-nom"
              placeholder={t("etablissements.nom_placeholder")}
              aria-invalid={!!errors.nom}
              {...register("nom")}
            />
            {errors.nom && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {t(errors.nom.message ?? "")}
              </p>
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
