"use client";

import { useTranslation } from "react-i18next";

export function AnalyticsHeader() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">{t("analytics.title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("analytics.subtitle")}</p>
    </div>
  );
}
