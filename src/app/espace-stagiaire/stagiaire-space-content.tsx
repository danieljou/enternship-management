"use client";

import { useTranslation } from "react-i18next";
import { ClipboardCheck, FileText, ListChecks, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logout } from "@/app/dashboard/actions";

const FEATURES = [
  { key: "feature_tasks", icon: ListChecks },
  { key: "feature_evaluations", icon: ClipboardCheck },
  { key: "feature_documents", icon: FileText },
  { key: "feature_messaging", icon: MessageCircle },
] as const;

export function StagiaireSpaceContent({ firstName }: { firstName: string | null }) {
  const { t } = useTranslation();

  return (
    <div className="mt-4 flex flex-col items-center gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {t("stagiaireSpace.welcome")}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t("stagiaireSpace.title")}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("stagiaireSpace.description")}
        </p>
      </div>

      <ul className="flex w-full flex-col gap-2.5 text-left">
        {FEATURES.map(({ key, icon: Icon }) => (
          <li
            key={key}
            className="flex items-center gap-3 rounded-lg bg-muted/60 px-3.5 py-2.5 text-sm text-foreground"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Icon className="h-3.5 w-3.5" />
            </span>
            {t(`stagiaireSpace.${key}`)}
          </li>
        ))}
      </ul>

      <form action={logout}>
        <Button type="submit" variant="outline">
          {t("stagiaireSpace.logout")}
        </Button>
      </form>
    </div>
  );
}
