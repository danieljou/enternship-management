"use client";

import { useTranslation } from "react-i18next";

export function LoginCopy({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <h2 className="text-3xl font-semibold leading-tight text-foreground lg:text-4xl">
        {t("login.tagline_prefix")}{" "}
        <span className="text-cyan-600 dark:text-cyan-400">
          {t("login.tagline_highlight")}
        </span>
        .
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {t("login.tagline_body")}
      </p>
    </div>
  );
}
