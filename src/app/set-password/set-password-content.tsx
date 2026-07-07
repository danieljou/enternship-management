"use client";

import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";

import { NewPasswordForm } from "@/components/auth/new-password-form";

export function SetPasswordContent({ hasError }: { hasError: boolean }) {
  const { t } = useTranslation();

  if (hasError) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-foreground">{t("setPassword.error")}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{t("setPassword.invalid_link")}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-xl font-semibold text-foreground">{t("setPassword.title")}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{t("setPassword.description")}</p>
      </div>

      <NewPasswordForm namespace="setPassword" />
    </>
  );
}
