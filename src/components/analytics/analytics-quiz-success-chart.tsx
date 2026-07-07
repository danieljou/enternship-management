"use client";

import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface QuizSuccessRow {
  titre: string;
  tauxReussite: number;
}

const chartConfig = {
  tauxReussite: {
    label: "Taux de réussite",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function AnalyticsQuizSuccessChart({ data }: { data: QuizSuccessRow[] }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl bg-card p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.7)]">
      <h2 className="text-sm font-semibold text-foreground">{t("analytics.quiz_chart_title")}</h2>

      {data.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{t("analytics.quiz_chart_empty")}</p>
      ) : (
        <ChartContainer config={chartConfig} className="mt-4 aspect-auto h-64 w-full">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
            <CartesianGrid horizontal={false} stroke="var(--border)" />
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis
              type="category"
              dataKey="titre"
              tickLine={false}
              axisLine={false}
              width={130}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="tauxReussite" fill="var(--color-tauxReussite)" radius={[0, 4, 4, 0]} barSize={16}>
              <LabelList
                dataKey="tauxReussite"
                position="right"
                className="fill-foreground"
                fontSize={12}
                formatter={(value) => `${value}%`}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}
