"use client";

import { useTransition } from "react";
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

import { createEncadrant } from "./actions";
import { encadrantSchema, type EncadrantValues } from "./schema";

interface EncadrantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EncadrantFormDialog({ open, onOpenChange }: EncadrantFormDialogProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EncadrantValues>({
    resolver: zodResolver(encadrantSchema),
    defaultValues: { nom: "", prenom: "", email: "" },
  });

  function onSubmit(values: EncadrantValues) {
    startTransition(async () => {
      const result = await createEncadrant(values);
      if ("error" in result) {
        toast.error(t(result.error));
        return;
      }
      toast.success(t("encadrants.create_success"));
      reset();
      onOpenChange(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("encadrants.add_title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="encadrant-nom">{t("encadrants.nom_label")}</Label>
              <Input id="encadrant-nom" aria-invalid={!!errors.nom} {...register("nom")} />
              {errors.nom && (
                <p className="text-xs text-red-600 dark:text-red-400">{t(errors.nom.message ?? "")}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="encadrant-prenom">{t("encadrants.prenom_label")}</Label>
              <Input id="encadrant-prenom" aria-invalid={!!errors.prenom} {...register("prenom")} />
              {errors.prenom && (
                <p className="text-xs text-red-600 dark:text-red-400">{t(errors.prenom.message ?? "")}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="encadrant-email">{t("encadrants.email_label")}</Label>
            <Input
              id="encadrant-email"
              type="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-600 dark:text-red-400">{t(errors.email.message ?? "")}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t("common.saving") : t("encadrants.create_submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
