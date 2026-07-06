"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  Building2,
  GraduationCap,
  NotebookText,
} from "lucide-react";

const ACTIONS = [
  {
    href: "/dashboard/stagiaires/nouveau",
    labelKey: "dashboard.quick_add_stagiaire",
    icon: GraduationCap,
    accent:
      "bg-[color-mix(in_oklch,var(--chart-1)_18%,transparent)] text-[var(--chart-1)]",
  },
  {
    href: "/dashboard/etablissements",
    labelKey: "dashboard.quick_manage_etablissements",
    icon: Building2,
    accent:
      "bg-[color-mix(in_oklch,var(--chart-2)_18%,transparent)] text-[var(--chart-2)]",
  },
  {
    href: "/dashboard/filieres",
    labelKey: "dashboard.quick_manage_filieres",
    icon: NotebookText,
    accent:
      "bg-[color-mix(in_oklch,var(--chart-4)_18%,transparent)] text-[var(--chart-4)]",
  },
] as const;

export function DashboardQuickActions() {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl bg-card p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.7)]">
      <h2 className="text-base font-semibold text-foreground">
        {t("dashboard.quick_actions_title")}
      </h2>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 lg:grid-cols-3">
        {ACTIONS.map(({ href, labelKey, icon: Icon, accent }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-3 rounded-xl border bg-background/50 p-4 transition-colors hover:border-primary/40 hover:bg-accent"
          >
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${accent}`}
            >
              <Icon className="h-5.5 w-5.5" strokeWidth={2.25} />
            </span>
            <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <span className="text-sm leading-snug font-semibold text-foreground">
                {t(labelKey)}
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
