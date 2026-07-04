"use client";

import { useTranslation } from "react-i18next";

import { FuturixLogo } from "@/components/futurix-logo";

import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center">
          <FuturixLogo />
        </div>

        <div className="rounded-2xl bg-card p-8 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_24px_60px_-24px_rgba(0,0,0,0.25)] sm:p-10 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_24px_60px_-24px_rgba(0,0,0,0.7)]">
          <div className="mb-8 text-center">
            <h1 className="text-xl font-semibold text-foreground">
              {t("forgotPassword.title")}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {t("forgotPassword.description")}
            </p>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
