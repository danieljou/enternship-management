"use client";

import { useTranslation } from "react-i18next";

interface DashboardSectionBreakdownProps {
  francophone: number;
  anglophone: number;
}

export function DashboardSectionBreakdown({
  francophone,
  anglophone,
}: DashboardSectionBreakdownProps) {
  const { t } = useTranslation();
  const total = francophone + anglophone;
  const rows = [
    { key: "francophone", value: francophone },
    { key: "anglophone", value: anglophone },
  ] as const;

  return (
    <div className="rounded-2xl bg-card p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.7)]">
      <h2 className="text-sm font-semibold text-foreground">
        {t("dashboard.section_breakdown_title")}
      </h2>

      {total === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {t("dashboard.section_breakdown_empty")}
        </p>
      ) : (
        <div className="mt-5 flex flex-col gap-4">
          {rows.map(({ key, value }) => {
            const pct = total > 0 ? Math.round((value / total) * 100) : 0;
            return (
              <div key={key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{t(`stagiaires.section_${key}`)}</span>
                  <span className="text-muted-foreground">{value}</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-cyan-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
