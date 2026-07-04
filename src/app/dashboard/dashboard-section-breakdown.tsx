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

interface DashboardSectionBreakdownProps {
  francophone: number;
  anglophone: number;
}

const chartConfig = {
  francophone: {
    label: "Francophone",
    color: "var(--chart-1)",
  },
  anglophone: {
    label: "Anglophone",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function DashboardSectionBreakdown({
  francophone,
  anglophone,
}: DashboardSectionBreakdownProps) {
  const { t } = useTranslation();
  const total = francophone + anglophone;
  const data = [
    { key: "francophone", label: t("stagiaires.section_francophone"), value: francophone },
    { key: "anglophone", label: t("stagiaires.section_anglophone"), value: anglophone },
  ];

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
        <ChartContainer config={chartConfig} className="mx-auto mt-2 aspect-square h-64">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="key"
              innerRadius={55}
              outerRadius={85}
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
      )}
    </div>
  );
}
