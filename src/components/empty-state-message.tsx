"use client";

import { useTranslation } from "react-i18next";

export function EmptyStateMessage({ messageKey }: { messageKey: string }) {
  const { t } = useTranslation();

  return (
    <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
      {t(messageKey)}
    </p>
  );
}
