"use client";

import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Etablissement, Filiere } from "@/lib/types";

import type { StagiaireValues } from "./schema";

interface StagiaireFieldsProps {
  register: UseFormRegister<StagiaireValues>;
  control: Control<StagiaireValues>;
  errors: FieldErrors<StagiaireValues>;
  etablissements: Etablissement[];
  filieres: Filiere[];
  /** Replaces the default email input - used when linking an existing account instead of typing a new email. */
  emailSlot?: React.ReactNode;
}

export function StagiaireFields({
  register,
  control,
  errors,
  etablissements,
  filieres,
  emailSlot,
}: StagiaireFieldsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="stagiaire-nom">{t("stagiaires.nom_label")}</Label>
        <Input
          id="stagiaire-nom"
          placeholder={t("stagiaires.nom_placeholder")}
          aria-invalid={!!errors.nom}
          {...register("nom")}
        />
        {errors.nom && (
          <p className="text-xs text-red-600 dark:text-red-400">{t(errors.nom.message ?? "")}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="stagiaire-prenom">{t("stagiaires.prenom_label")}</Label>
        <Input
          id="stagiaire-prenom"
          placeholder={t("stagiaires.prenom_placeholder")}
          aria-invalid={!!errors.prenom}
          {...register("prenom")}
        />
        {errors.prenom && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {t(errors.prenom.message ?? "")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="stagiaire-email">{t("stagiaires.email_label")}</Label>
        {emailSlot ?? (
          <Input
            id="stagiaire-email"
            type="email"
            placeholder={t("stagiaires.email_placeholder")}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        )}
        {errors.email && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {t(errors.email.message ?? "")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("stagiaires.niveau_label")}</Label>
        <Controller
          control={control}
          name="niveau"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-invalid={!!errors.niveau} className="w-full">
                <SelectValue placeholder={t("stagiaires.niveau_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {["1", "2", "3", "4", "5"].map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.niveau && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {t(errors.niveau.message ?? "")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("stagiaires.section_label")}</Label>
        <Controller
          control={control}
          name="section"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="flex flex-row gap-4 pt-1.5"
            >
              <label className="flex items-center gap-2 text-sm text-foreground">
                <RadioGroupItem value="francophone" />
                {t("stagiaires.section_francophone")}
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <RadioGroupItem value="anglophone" />
                {t("stagiaires.section_anglophone")}
              </label>
            </RadioGroup>
          )}
        />
        {errors.section && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {t(errors.section.message ?? "")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("stagiaires.etablissement_label")}</Label>
        <Controller
          control={control}
          name="etablissementId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-invalid={!!errors.etablissementId} className="w-full">
                <SelectValue placeholder={t("stagiaires.etablissement_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {etablissements.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.etablissementId && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {t(errors.etablissementId.message ?? "")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("stagiaires.filiere_label")}</Label>
        <Controller
          control={control}
          name="filiereId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-invalid={!!errors.filiereId} className="w-full">
                <SelectValue placeholder={t("stagiaires.filiere_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {filieres.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.filiereId && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {t(errors.filiereId.message ?? "")}
          </p>
        )}
      </div>
    </div>
  );
}
