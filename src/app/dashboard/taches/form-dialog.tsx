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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TacheWithRelations } from "@/lib/types";

import { createTache, updateTache, type AssignableUser } from "./actions";
import { tacheSchema, type TacheValues } from "./schema";

const NONE = "none";

interface TacheFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tache: TacheWithRelations | null;
  stagiaires: { id: string; nom: string; prenom: string }[];
  assignableUsers: AssignableUser[];
}

export function TacheFormDialog({
  open,
  onOpenChange,
  tache,
  stagiaires,
  assignableUsers,
}: TacheFormDialogProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!tache;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TacheValues>({
    resolver: zodResolver(tacheSchema),
    defaultValues: {
      titre: "",
      description: "",
      statut: "a_faire",
      priorite: "normale",
      echeance: "",
      stagiaireId: "",
      assignedTo: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        titre: tache?.titre ?? "",
        description: tache?.description ?? "",
        statut: tache?.statut ?? "a_faire",
        priorite: tache?.priorite ?? "normale",
        echeance: tache?.echeance ?? "",
        stagiaireId: tache?.stagiaire_id ?? "",
        assignedTo: tache?.assigned_to ?? "",
      });
    }
  }, [open, tache, reset]);

  function onSubmit(values: TacheValues) {
    startTransition(async () => {
      const result = isEditing ? await updateTache(tache.id, values) : await createTache(values);

      if ("error" in result) {
        toast.error(t(result.error));
        return;
      }

      toast.success(t(isEditing ? "taches.update_success" : "taches.create_success"));
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t(isEditing ? "taches.edit_title" : "taches.add_title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="tache-titre">{t("taches.titre_label")}</Label>
            <Input id="tache-titre" aria-invalid={!!errors.titre} {...register("titre")} />
            {errors.titre && (
              <p className="text-xs text-red-600 dark:text-red-400">{t(errors.titre.message ?? "")}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tache-description">{t("taches.description_label")}</Label>
            <Textarea id="tache-description" {...register("description")} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>{t("taches.statut_label")}</Label>
              <Controller
                control={control}
                name="statut"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a_faire">{t("taches.statut_a_faire")}</SelectItem>
                      <SelectItem value="en_cours">{t("taches.statut_en_cours")}</SelectItem>
                      <SelectItem value="termine">{t("taches.statut_termine")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("taches.priorite_label")}</Label>
              <Controller
                control={control}
                name="priorite"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basse">{t("taches.priorite_basse")}</SelectItem>
                      <SelectItem value="normale">{t("taches.priorite_normale")}</SelectItem>
                      <SelectItem value="haute">{t("taches.priorite_haute")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tache-echeance">{t("taches.echeance_label")}</Label>
              <Input id="tache-echeance" type="date" {...register("echeance")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("taches.assignee_label")}</Label>
              <Controller
                control={control}
                name="assignedTo"
                render={({ field }) => (
                  <Select
                    value={field.value || NONE}
                    onValueChange={(value) => field.onChange(value === NONE ? "" : value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("taches.assignee_placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>{t("taches.assignee_none")}</SelectItem>
                      {assignableUsers.map((user) => (
                        <SelectItem key={user.userId} value={user.userId}>
                          {user.prenom} {user.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("taches.stagiaire_label")}</Label>
            <Controller
              control={control}
              name="stagiaireId"
              render={({ field }) => (
                <Select
                  value={field.value || NONE}
                  onValueChange={(value) => field.onChange(value === NONE ? "" : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("taches.stagiaire_placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{t("taches.stagiaire_none")}</SelectItem>
                    {stagiaires.map((stagiaire) => (
                      <SelectItem key={stagiaire.id} value={stagiaire.id}>
                        {stagiaire.prenom} {stagiaire.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
