"use client";

import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface FiliereBreakdownRow {
  nom: string;
  count: number;
}

const chartConfig = {
  count: {
    label: "Stagiaires",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function DashboardFiliereChart({ data }: { data: FiliereBreakdownRow[] }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl bg-card p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.7)]">
      <h2 className="text-sm font-semibold text-foreground">
        {t("dashboard.filiere_chart_title")}
      </h2>

      {data.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {t("dashboard.filiere_chart_empty")}
        </p>
      ) : (
        <ChartContainer config={chartConfig} className="mt-4 aspect-auto h-64 w-full">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid horizontal={false} stroke="var(--border)" />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="nom"
              tickLine={false}
              axisLine={false}
              width={110}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} barSize={14}>
              <LabelList
                dataKey="count"
                position="right"
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}
