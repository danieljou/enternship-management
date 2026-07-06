"use client";

import { useTranslation } from "react-i18next";
import { Cell, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatMontant } from "@/lib/payment-status";

interface DashboardPaiementsChartProps {
  collecte: number;
  reste: number;
}

const chartConfig = {
  collecte: {
    label: "Collecté",
    color: "var(--chart-4)",
  },
  reste: {
    label: "Reste à percevoir",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig;

export function DashboardPaiementsChart({ collecte, reste }: DashboardPaiementsChartProps) {
  const { t } = useTranslation();
  const total = collecte + reste;
  const data = [
    { key: "collecte", label: t("dashboard.paiements_collecte"), value: collecte },
    { key: "reste", label: t("dashboard.paiements_reste"), value: reste },
  ];

  return (
    <div className="rounded-2xl bg-card p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.7)]">
      <h2 className="text-sm font-semibold text-foreground">{t("dashboard.paiements_chart_title")}</h2>

      {total === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{t("dashboard.paiements_chart_empty")}</p>
      ) : (
        <>
          <ChartContainer config={chartConfig} className="mx-auto mt-2 aspect-square h-56">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="key"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                strokeWidth={2}
                stroke="var(--card)"
              >
                {data.map((entry) => (
                  <Cell key={entry.key} fill={`var(--color-${entry.key})`} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="key" />} />
            </PieChart>
          </ChartContainer>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {formatMontant(collecte)} / {formatMontant(total)}
          </p>
        </>
      )}
    </div>
  );
}
