"use client";

import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface NiveauBreakdownRow {
  niveau: string;
  count: number;
}

const chartConfig = {
  count: {
    label: "Stagiaires",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function AnalyticsNiveauChart({ data }: { data: NiveauBreakdownRow[] }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl bg-card p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.7)]">
      <h2 className="text-sm font-semibold text-foreground">{t("analytics.niveau_chart_title")}</h2>

      {data.every((row) => row.count === 0) ? (
        <p className="mt-4 text-sm text-muted-foreground">{t("analytics.niveau_chart_empty")}</p>
      ) : (
        <ChartContainer config={chartConfig} className="mt-4 aspect-auto h-64 w-full">
          <BarChart data={data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="niveau" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} width={28} tick={{ fontSize: 11 }} allowDecimals={false} />
            <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} barSize={32}>
              <LabelList dataKey="count" position="top" className="fill-foreground" fontSize={12} />
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}
