"use client";

import { useTranslation } from "react-i18next";

export function DashboardWelcome({ email }: { email: string | null }) {
  const { t } = useTranslation();
  const firstName = email ? email.split("@")[0] : "";

  return (
    <>
      <h1 className="text-2xl font-semibold text-foreground">
        {t("dashboard.welcome")}
        {firstName ? `, ${firstName}` : ""}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("dashboard.subtitle")}
      </p>
    </>
  );
}
