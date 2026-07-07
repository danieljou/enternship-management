"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";

import { NewPasswordForm } from "@/components/auth/new-password-form";
import { Button } from "@/components/ui/button";

export function ResetPasswordContent({ hasError }: { hasError: boolean }) {
  const { t } = useTranslation();

  if (hasError) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-foreground">{t("resetPassword.error")}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t("resetPassword.invalid_link")}
          </p>
        </div>
        <Button asChild>
          <Link href="/forgot-password">{t("resetPassword.request_new")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-xl font-semibold text-foreground">{t("resetPassword.title")}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{t("resetPassword.description")}</p>
      </div>

      <NewPasswordForm namespace="resetPassword" />
    </>
  );
}
