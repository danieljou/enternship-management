"use client";

import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface SessionPaiementSummary {
  sessionNom: string;
  attendu: number;
  collecte: number;
}

const chartConfig = {
  attendu: {
    label: "Attendu",
    color: "var(--muted-foreground)",
  },
  collecte: {
    label: "Collecté",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function PaiementsChart({ data }: { data: SessionPaiementSummary[] }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl bg-card p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.7)]">
      <h2 className="text-sm font-semibold text-foreground">{t("paiements.chart_title")}</h2>

      {data.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{t("paiements.chart_empty")}</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-72 w-full"
            style={{ minWidth: Math.max(data.length * 110, 280) }}
          >
            <BarChart data={data} margin={{ left: 8, right: 8, bottom: 24 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="sessionNom"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={50}
              />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={40} />
              <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="attendu" fill="var(--color-attendu)" radius={[4, 4, 0, 0]} barSize={18} />
              <Bar dataKey="collecte" fill="var(--color-collecte)" radius={[4, 4, 0, 0]} barSize={18} />
            </BarChart>
          </ChartContainer>
        </div>
      )}
    </div>
  );
}
