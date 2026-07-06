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

import { createPaiement } from "../actions";
import { paiementSchema, type PaiementValues } from "../schema";

interface PaiementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  stagiaireId: string;
}

export function PaiementFormDialog({
  open,
  onOpenChange,
  sessionId,
  stagiaireId,
}: PaiementFormDialogProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaiementValues>({
    resolver: zodResolver(paiementSchema),
    defaultValues: {
      montant: "",
      moyen: "",
      datePaiement: new Date().toISOString().slice(0, 10),
      note: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        montant: "",
        moyen: "",
        datePaiement: new Date().toISOString().slice(0, 10),
        note: "",
      });
    }
  }, [open, reset]);

  function onSubmit(values: PaiementValues) {
    startTransition(async () => {
      const result = await createPaiement(sessionId, stagiaireId, values);

      if ("error" in result) {
        toast.error(t(result.error));
        return;
      }

      toast.success(t("sessions.paiement_create_success"));
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("sessions.paiement_add_title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="paiement-montant">{t("sessions.paiement_montant_label")}</Label>
              <Input
                id="paiement-montant"
                type="number"
                min={0}
                step="0.01"
                placeholder="25000"
                aria-invalid={!!errors.montant}
                {...register("montant")}
              />
              {errors.montant && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {t(errors.montant.message ?? "")}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="paiement-date">{t("sessions.paiement_date_label")}</Label>
              <Input
                id="paiement-date"
                type="date"
                aria-invalid={!!errors.datePaiement}
                {...register("datePaiement")}
              />
              {errors.datePaiement && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {t(errors.datePaiement.message ?? "")}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="paiement-moyen">{t("sessions.paiement_moyen_label")}</Label>
            <Input
              id="paiement-moyen"
              placeholder={t("sessions.paiement_moyen_placeholder")}
              {...register("moyen")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="paiement-note">{t("sessions.paiement_note_label")}</Label>
            <Textarea id="paiement-note" {...register("note")} />
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
