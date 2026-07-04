"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Building2, ChevronRight, GraduationCap, NotebookText } from "lucide-react";

import { Button } from "@/components/ui/button";

const ACTIONS = [
  {
    href: "/dashboard/stagiaires/nouveau",
    labelKey: "dashboard.quick_add_stagiaire",
    icon: GraduationCap,
  },
  {
    href: "/dashboard/etablissements",
    labelKey: "dashboard.quick_manage_etablissements",
    icon: Building2,
  },
  {
    href: "/dashboard/filieres",
    labelKey: "dashboard.quick_manage_filieres",
    icon: NotebookText,
  },
] as const;

export function DashboardQuickActions() {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl bg-card p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.7)]">
      <h2 className="text-sm font-semibold text-foreground">
        {t("dashboard.quick_actions_title")}
      </h2>
      <div className="mt-4 flex flex-col gap-1.5">
        {ACTIONS.map(({ href, labelKey, icon: Icon }) => (
          <Button key={href} asChild variant="ghost" className="justify-start px-3">
            <Link href={href}>
              <Icon className="h-4 w-4 text-primary" />
              {t(labelKey)}
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
