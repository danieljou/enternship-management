"use client";

import { useEffect, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { cn } from "@/lib/utils";
import { getSessionEtapeColorClasses, SESSION_ETAPE_COLORS } from "@/lib/session-colors";
import { SESSION_ETAPE_ICONS } from "@/lib/session-icons";
import type { SessionEtape } from "@/lib/types";

import { createEtape, updateEtape } from "../actions";
import { etapeSchema, type EtapeValues } from "../schema";

interface EtapeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  etape: SessionEtape | null;
}

export function EtapeFormDialog({ open, onOpenChange, sessionId, etape }: EtapeFormDialogProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!etape;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<EtapeValues>({
    resolver: zodResolver(etapeSchema),
    defaultValues: {
      nom: etape?.nom ?? "",
      description: etape?.description ?? "",
      couleur: etape?.couleur ?? SESSION_ETAPE_COLORS[0].value,
      icone: etape?.icone ?? SESSION_ETAPE_ICONS[0].value,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        nom: etape?.nom ?? "",
        description: etape?.description ?? "",
        couleur: etape?.couleur ?? SESSION_ETAPE_COLORS[0].value,
        icone: etape?.icone ?? SESSION_ETAPE_ICONS[0].value,
      });
    }
  }, [open, etape, reset]);

  function onSubmit(values: EtapeValues) {
    startTransition(async () => {
      const result = isEditing
        ? await updateEtape(etape.id, sessionId, values)
        : await createEtape(sessionId, values);

      if ("error" in result) {
        toast.error(t(result.error));
        return;
      }

      toast.success(t(isEditing ? "sessions.etape_update_success" : "sessions.etape_create_success"));
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t(isEditing ? "sessions.etape_edit_title" : "sessions.etape_add_title")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="etape-nom">{t("sessions.etape_nom_label")}</Label>
            <Input
              id="etape-nom"
              placeholder={t("sessions.etape_nom_placeholder")}
              aria-invalid={!!errors.nom}
              {...register("nom")}
            />
            {errors.nom && (
              <p className="text-xs text-red-600 dark:text-red-400">{t(errors.nom.message ?? "")}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="etape-description">{t("sessions.etape_description_label")}</Label>
            <Textarea id="etape-description" {...register("description")} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("sessions.etape_couleur_label")}</Label>
            <Controller
              control={control}
              name="couleur"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {SESSION_ETAPE_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => field.onChange(color.value)}
                      aria-label={color.value}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition-all",
                        getSessionEtapeColorClasses(color.value).accent,
                        field.value === color.value ? "ring-2 ring-foreground" : ""
                      )}
                    />
                  ))}
                </div>
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("sessions.etape_icone_label")}</Label>
            <Controller
              control={control}
              name="icone"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {SESSION_ETAPE_ICONS.map(({ value, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      aria-label={value}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground transition-colors",
                        field.value === value
                          ? "border-foreground text-foreground"
                          : "border-input hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              )}
            />
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
