"use client";

import { useTranslation } from "react-i18next";

export function LoginHeading() {
  const { t } = useTranslation();

  return (
    <div className="mb-9">
      <h1 className="text-2xl font-semibold text-foreground">
        {t("login.heading")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("login.subheading")}
      </p>
    </div>
  );
}
