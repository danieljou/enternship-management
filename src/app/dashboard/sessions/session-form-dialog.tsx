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
import type { StageSession } from "@/lib/types";

import { createSession, updateSession } from "./actions";
import { sessionSchema, type SessionValues } from "./schema";

interface SessionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: StageSession | null;
}

export function SessionFormDialog({ open, onOpenChange, session }: SessionFormDialogProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!session;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SessionValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      nom: session?.nom ?? "",
      description: session?.description ?? "",
      dateDebut: session?.date_debut ?? "",
      dateFin: session?.date_fin ?? "",
      fraisMontant: session?.frais_montant != null ? String(session.frais_montant) : "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        nom: session?.nom ?? "",
        description: session?.description ?? "",
        dateDebut: session?.date_debut ?? "",
        dateFin: session?.date_fin ?? "",
        fraisMontant: session?.frais_montant != null ? String(session.frais_montant) : "",
      });
    }
  }, [open, session, reset]);

  function onSubmit(values: SessionValues) {
    startTransition(async () => {
      const result = isEditing
        ? await updateSession(session.id, values)
        : await createSession(values);

      if ("error" in result) {
        toast.error(t(result.error));
        return;
      }

      toast.success(t(isEditing ? "sessions.update_success" : "sessions.create_success"));
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(isEditing ? "sessions.edit_title" : "sessions.add_title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="session-nom">{t("sessions.nom_label")}</Label>
            <Input
              id="session-nom"
              placeholder={t("sessions.nom_placeholder")}
              aria-invalid={!!errors.nom}
              {...register("nom")}
            />
            {errors.nom && (
              <p className="text-xs text-red-600 dark:text-red-400">{t(errors.nom.message ?? "")}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="session-description">{t("sessions.description_label")}</Label>
            <Textarea
              id="session-description"
              placeholder={t("sessions.description_placeholder")}
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="session-date-debut">{t("sessions.date_debut_label")}</Label>
              <Input id="session-date-debut" type="date" {...register("dateDebut")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="session-date-fin">{t("sessions.date_fin_label")}</Label>
              <Input
                id="session-date-fin"
                type="date"
                aria-invalid={!!errors.dateFin}
                {...register("dateFin")}
              />
              {errors.dateFin && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {t(errors.dateFin.message ?? "")}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="session-frais">{t("sessions.frais_montant_label")}</Label>
            <Input
              id="session-frais"
              type="number"
              min={0}
              step="0.01"
              placeholder={t("sessions.frais_montant_placeholder")}
              aria-invalid={!!errors.fraisMontant}
              {...register("fraisMontant")}
            />
            {errors.fraisMontant && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {t(errors.fraisMontant.message ?? "")}
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
