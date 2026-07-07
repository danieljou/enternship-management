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
import type { Etablissement, Filiere, StagiaireWithRelations } from "@/lib/types";

import type { EncadrantOption } from "../encadrants/actions";
import { updateStagiaire } from "./actions";
import { stagiaireSchema, type StagiaireValues } from "./schema";
import { StagiaireFields } from "./stagiaire-fields";

interface StagiaireEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stagiaire: StagiaireWithRelations | null;
  etablissements: Etablissement[];
  filieres: Filiere[];
  encadrants: EncadrantOption[];
}

export function StagiaireEditDialog({
  open,
  onOpenChange,
  stagiaire,
  etablissements,
  filieres,
  encadrants,
}: StagiaireEditDialogProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StagiaireValues>({
    resolver: zodResolver(stagiaireSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      niveau: "" as StagiaireValues["niveau"],
      etablissementId: "",
      filiereId: "",
      encadrantId: "",
      section: "" as StagiaireValues["section"],
    },
  });

  useEffect(() => {
    if (open && stagiaire) {
      reset({
        nom: stagiaire.nom,
        prenom: stagiaire.prenom,
        email: stagiaire.email,
        niveau: String(stagiaire.niveau) as StagiaireValues["niveau"],
        etablissementId: stagiaire.etablissement_id ?? "",
        filiereId: stagiaire.filiere_id ?? "",
        encadrantId: stagiaire.encadrant_id ?? "",
        section: stagiaire.section,
      });
    }
  }, [open, stagiaire, reset]);

  function onSubmit(values: StagiaireValues) {
    if (!stagiaire) return;
    startTransition(async () => {
      const result = await updateStagiaire(stagiaire.id, stagiaire.user_id, values);
      if ("error" in result) {
        toast.error(t(result.error));
        return;
      }
      toast.success(t("stagiaires.update_success"));
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("stagiaires.edit_title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <StagiaireFields
            register={register}
            control={control}
            errors={errors}
            etablissements={etablissements}
            filieres={filieres}
            encadrants={encadrants}
          />

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
