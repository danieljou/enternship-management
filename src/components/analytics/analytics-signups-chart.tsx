"use client";

import { useTranslation } from "react-i18next";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface SignupsMonthRow {
  month: string;
  count: number;
}

const chartConfig = {
  count: {
    label: "Nouveaux stagiaires",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function AnalyticsSignupsChart({ data }: { data: SignupsMonthRow[] }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl bg-card p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.7)]">
      <h2 className="text-sm font-semibold text-foreground">{t("analytics.signups_chart_title")}</h2>

      {data.every((row) => row.count === 0) ? (
        <p className="mt-4 text-sm text-muted-foreground">{t("analytics.signups_chart_empty")}</p>
      ) : (
        <ChartContainer config={chartConfig} className="mt-4 aspect-auto h-64 w-full">
          <AreaChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="fillSignups" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} width={28} tick={{ fontSize: 11 }} allowDecimals={false} />
            <ChartTooltip cursor={{ stroke: "var(--border)" }} content={<ChartTooltipContent hideLabel />} />
            <Area
              dataKey="count"
              type="monotone"
              stroke="var(--color-count)"
              fill="url(#fillSignups)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  );
}
