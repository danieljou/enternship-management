"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Etablissement, Filiere } from "@/lib/types";

import { createStagiaire, createStagiaireFromExisting, type UnlinkedAccount } from "../actions";
import { stagiaireSchema, type StagiaireValues } from "../schema";
import { StagiaireFields } from "../stagiaire-fields";

interface StagiaireCreateFormProps {
  etablissements: Etablissement[];
  filieres: Filiere[];
  unlinkedAccounts: UnlinkedAccount[];
}

export function StagiaireCreateForm({
  etablissements,
  filieres,
  unlinkedAccounts,
}: StagiaireCreateFormProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"invite" | "existing">("invite");
  const [selectedUserId, setSelectedUserId] = useState("");

  const {
    register,
    control,
    handleSubmit,
    setValue,
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

  function handleSelectAccount(userId: string) {
    setSelectedUserId(userId);
    const account = unlinkedAccounts.find((item) => item.userId === userId);
    setValue("email", account?.email ?? "", { shouldValidate: true });
  }

  function onSubmit(values: StagiaireValues) {
    if (mode === "existing" && !selectedUserId) {
      toast.error(t("stagiaires.existing_account_required"));
      return;
    }

    startTransition(async () => {
      const result =
        mode === "existing"
          ? await createStagiaireFromExisting(selectedUserId, values)
          : await createStagiaire(values);

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
        <Tabs value={mode} onValueChange={(value) => setMode(value as "invite" | "existing")}>
          <TabsList>
            <TabsTrigger value="invite">{t("stagiaires.mode_invite")}</TabsTrigger>
            <TabsTrigger value="existing">{t("stagiaires.mode_existing")}</TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="mt-3 text-xs text-muted-foreground">
          {mode === "invite"
            ? t("stagiaires.mode_invite_description")
            : t("stagiaires.mode_existing_description")}
        </p>

        <div className="mt-5">
          <StagiaireFields
            register={register}
            control={control}
            errors={errors}
            etablissements={etablissements}
            filieres={filieres}
            emailSlot={
              mode === "invite" ? undefined : unlinkedAccounts.length === 0 ? (
                <p className="rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">
                  {t("stagiaires.no_unlinked_accounts")}
                </p>
              ) : (
                <Select value={selectedUserId} onValueChange={handleSelectAccount}>
                  <SelectTrigger className="w-full" aria-invalid={!selectedUserId}>
                    <SelectValue placeholder={t("stagiaires.existing_account_placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {unlinkedAccounts.map((account) => (
                      <SelectItem key={account.userId} value={account.userId}>
                        {account.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            }
          />
        </div>

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
