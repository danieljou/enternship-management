"use client";

import { useRef, useState, useTransition } from "react";
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
import { updateAdminProfile } from "@/app/profile/actions";
import { adminProfileSchema, type AdminProfileValues } from "@/app/profile/schema";

export interface AdminProfileData {
  userId: string;
  prenom: string;
  nom: string;
  email: string;
  createdAt: string;
}

export function AdminProfileView({
  profile,
  roleLabelKey = "profile.role_admin",
}: {
  profile: AdminProfileData;
  roleLabelKey?: string;
}) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminProfileValues>({
    resolver: zodResolver(adminProfileSchema),
    values: {
      nom: profile.nom,
      prenom: profile.prenom,
    },
  });

  function onSubmit(values: AdminProfileValues) {
    startTransition(async () => {
      const result = await updateAdminProfile(profile.userId, values);
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {t("profile.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("profile.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.account")}</CardTitle>
            <CardDescription>
              {t("profile.account_description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <InfoRow
              label={t("profile.name")}
              value={`${profile.prenom} ${profile.nom}`}
            />
            <InfoRow label={t("profile.email")} value={profile.email} />
            <InfoRow
              label={t("profile.role")}
              value={t(roleLabelKey)}
            />
            <InfoRow
              label={t("profile.created_at")}
              value={new Date(profile.createdAt).toLocaleDateString()}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("profile.personal")}</CardTitle>
            <CardDescription>
              {t("profile.personal_description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <div className="flex flex-col gap-4">
                <InfoRow
                  label={t("profile.firstname")}
                  value={profile.prenom}
                />
                <InfoRow label={t("profile.lastname")} value={profile.nom} />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  {t("profile.edit")}
                </Button>
              </div>
            ) : (
              <form
                ref={formRef}
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="profile-prenom">
                    {t("profile.firstname")}
                  </Label>
                  <Input
                    id="profile-prenom"
                    aria-invalid={!!errors.prenom}
                    {...register("prenom")}
                  />
                  {errors.prenom && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {t(errors.prenom.message ?? "")}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="profile-nom">{t("profile.lastname")}</Label>
                  <Input
                    id="profile-nom"
                    aria-invalid={!!errors.nom}
                    {...register("nom")}
                  />
                  {errors.nom && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {t(errors.nom.message ?? "")}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? t("profile.saving") : t("common.save")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancel}
                    disabled={isPending}
                  >
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
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
