"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateStagiaireProfile } from "@/app/profile/actions";
import { stagiaireProfileSchema, type StagiaireProfileValues } from "@/app/profile/schema";
import type { StagiaireWithRelations } from "@/lib/types";

export interface StagiaireProfileViewData {
  stagiaire: StagiaireWithRelations;
}

export function StagiaireProfileView({ stagiaire }: { stagiaire: StagiaireWithRelations }) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StagiaireProfileValues>({
    resolver: zodResolver(stagiaireProfileSchema) as never,
    defaultValues: {
      nom: stagiaire.nom,
      prenom: stagiaire.prenom,
      email: stagiaire.email,
      niveau: stagiaire.niveau,
      telephone: stagiaire.telephone ?? "",
      adresse: stagiaire.adresse ?? "",
    },
  });

  function onSubmit(values: StagiaireProfileValues) {
    startTransition(async () => {
      const result = await updateStagiaireProfile(stagiaire.id, values);
      if ("error" in result) {
        toast.error(t(result.error));
        return;
      }
      toast.success(t("profile.success"));
      setIsEditing(false);
    });
  }

  function cancel() {
    reset();
    setIsEditing(false);
  }

  const etablissement = stagiaire.etablissement?.nom ?? t("profile.no_institution");
  const filiere = stagiaire.filiere?.nom ?? t("profile.no_field");
  const sectionLabel =
    stagiaire.section === "anglophone"
      ? t("profile.section_anglophone")
      : t("profile.section_francophone");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("profile.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("profile.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.account")}</CardTitle>
            <CardDescription>{t("profile.account_description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <InfoRow label={t("profile.name")} value={`${stagiaire.prenom} ${stagiaire.nom}`} />
            <InfoRow label={t("profile.email")} value={stagiaire.email} />
            <InfoRow label={t("profile.role")} value={t("profile.role_stagiaire")} />
            <InfoRow label={t("profile.institution")} value={etablissement} />
            <InfoRow label={t("profile.field")} value={filiere} />
            <InfoRow label={t("profile.section")} value={sectionLabel} />
            <InfoRow label={t("profile.level")} value={String(stagiaire.niveau)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("profile.personal")}</CardTitle>
            <CardDescription>{t("profile.personal_description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <div className="flex flex-col gap-4">
                <InfoRow label={t("profile.firstname")} value={stagiaire.prenom} />
                <InfoRow label={t("profile.lastname")} value={stagiaire.nom} />
                <InfoRow label={t("profile.email")} value={stagiaire.email} />
                <InfoRow label={t("profile.phone")} value={stagiaire.telephone || "—"} />
                <InfoRow label={t("profile.address")} value={stagiaire.adresse || "—"} />
                <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
                  {t("profile.edit")}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="profile-prenom">{t("profile.firstname")}</Label>
                    <Input id="profile-prenom" aria-invalid={!!errors.prenom} {...register("prenom")} />
                    {errors.prenom && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {t(errors.prenom.message ?? "")}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="profile-nom">{t("profile.lastname")}</Label>
                    <Input id="profile-nom" aria-invalid={!!errors.nom} {...register("nom")} />
                    {errors.nom && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {t(errors.nom.message ?? "")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="profile-email">{t("profile.email")}</Label>
                  <Input id="profile-email" type="email" aria-invalid={!!errors.email} {...register("email")} />
                  {errors.email && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {t(errors.email.message ?? "")}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="profile-niveau">{t("profile.level")}</Label>
                  <Input
                    id="profile-niveau"
                    type="number"
                    min={1}
                    max={6}
                    aria-invalid={!!errors.niveau}
                    {...register("niveau")}
                  />
                  {errors.niveau && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {t(errors.niveau.message ?? "")}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="profile-telephone">{t("profile.phone")}</Label>
                  <Input id="profile-telephone" {...register("telephone")} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="profile-adresse">{t("profile.address")}</Label>
                  <Input id="profile-adresse" {...register("adresse")} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? t("profile.saving") : t("common.save")}
                  </Button>
                  <Button type="button" variant="outline" onClick={cancel} disabled={isPending}>
                    {t("common.cancel")}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b pb-3 last:border-b-0 last:pb-0">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
