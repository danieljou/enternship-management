"use client";

import { useTranslation } from "react-i18next";
import { Construction } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function ComingSoon({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground">{t(titleKey)}</h1>
      <Empty className="min-h-[50vh] rounded-2xl bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Construction />
          </EmptyMedia>
          <EmptyTitle>{t("comingSoon.title")}</EmptyTitle>
          <EmptyDescription>{t("comingSoon.description")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
