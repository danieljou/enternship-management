"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { Etablissement, Filiere } from "@/lib/types";

import { createStagiaire } from "../actions";
import { stagiaireSchema, type StagiaireValues } from "../schema";
import { StagiaireFields } from "../stagiaire-fields";

interface StagiaireCreateFormProps {
  etablissements: Etablissement[];
  filieres: Filiere[];
}

export function StagiaireCreateForm({
  etablissements,
  filieres,
}: StagiaireCreateFormProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
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
      section: "" as StagiaireValues["section"],
    },
  });

  function onSubmit(values: StagiaireValues) {
    startTransition(async () => {
      const result = await createStagiaire(values);
      if (result && "error" in result) {
        toast.error(t(result.error));
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-3 text-muted-foreground">
          <Link href="/dashboard/stagiaires">
            <ArrowLeft className="h-4 w-4" />
            {t("stagiaires.back_to_list")}
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">
          {t("stagiaires.create_title")}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {t("stagiaires.create_description")}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="max-w-2xl rounded-2xl bg-card p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.25)] sm:p-8 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.7)]"
      >
        <StagiaireFields
          register={register}
          control={control}
          errors={errors}
          etablissements={etablissements}
          filieres={filieres}
        />

        <Button type="submit" disabled={isPending} className="mt-6 w-full sm:w-auto">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("stagiaires.create_submitting")}
            </>
          ) : (
            t("stagiaires.create_submit")
          )}
        </Button>
      </form>
    </div>
  );
}
