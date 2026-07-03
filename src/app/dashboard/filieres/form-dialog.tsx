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
import type { Filiere } from "@/lib/types";

import { createFiliere, updateFiliere } from "./actions";
import { filiereSchema, type FiliereValues } from "./schema";

interface FiliereFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filiere: Filiere | null;
}

export function FiliereFormDialog({ open, onOpenChange, filiere }: FiliereFormDialogProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!filiere;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FiliereValues>({
    resolver: zodResolver(filiereSchema),
    defaultValues: { nom: filiere?.nom ?? "" },
  });

  useEffect(() => {
    if (open) {
      reset({ nom: filiere?.nom ?? "" });
    }
  }, [open, filiere, reset]);

  function onSubmit(values: FiliereValues) {
    startTransition(async () => {
      const result = isEditing
        ? await updateFiliere(filiere.id, values)
        : await createFiliere(values);

      if ("error" in result) {
        toast.error(t(result.error));
        return;
      }

      toast.success(t(isEditing ? "filieres.update_success" : "filieres.create_success"));
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(isEditing ? "filieres.edit_title" : "filieres.add_title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="filiere-nom">{t("filieres.nom_label")}</Label>
            <Input
              id="filiere-nom"
              placeholder={t("filieres.nom_placeholder")}
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
