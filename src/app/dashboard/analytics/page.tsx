import type { Metadata } from "next";

import { AnalyticsHeader } from "@/components/analytics/analytics-header";
import { AnalyticsNiveauChart, type NiveauBreakdownRow } from "@/components/analytics/analytics-niveau-chart";
import { AnalyticsQuizSuccessChart, type QuizSuccessRow } from "@/components/analytics/analytics-quiz-success-chart";
import { AnalyticsSignupsChart, type SignupsMonthRow } from "@/components/analytics/analytics-signups-chart";
import { createClient } from "@/lib/supabase/server";
import type { RoadmapEtape, RoadmapInstance, RoadmapTemplate } from "@/lib/types";

export const metadata: Metadata = {
  title: "Analytics - FUTURIX-iTech",
};

const MONTHS_WINDOW = 6;
const MONTH_LABELS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
];

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const [{ data: stagiaires }, { data: instances }] = await Promise.all([
    supabase.from("stagiaires").select("niveau, created_at"),
    supabase
      .from("roadmap_instances")
      .select("id, template_id, template:roadmap_templates(id, titre)"),
  ]);

  // Signups over time (last 6 months) ---------------------------------
  const now = new Date();
  const monthBuckets: SignupsMonthRow[] = [];
  for (let i = MONTHS_WINDOW - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthBuckets.push({ month: `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`, count: 0 });
  }
  const bucketIndexByKey = new Map<string, number>();
  for (let i = MONTHS_WINDOW - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    bucketIndexByKey.set(`${date.getFullYear()}-${date.getMonth()}`, MONTHS_WINDOW - 1 - i);
  }
  for (const row of stagiaires ?? []) {
    const created = new Date(row.created_at);
    const key = `${created.getFullYear()}-${created.getMonth()}`;
    const index = bucketIndexByKey.get(key);
    if (index !== undefined) monthBuckets[index].count += 1;
  }

  // Breakdown by niveau -------------------------------------------------
  const niveauCounts = new Map<number, number>();
  for (const row of stagiaires ?? []) {
    niveauCounts.set(row.niveau, (niveauCounts.get(row.niveau) ?? 0) + 1);
  }
  const niveauRows: NiveauBreakdownRow[] = Array.from({ length: 5 }, (_, index) => index + 1)
    .map((niveau) => ({ niveau: String(niveau), count: niveauCounts.get(niveau) ?? 0 }));

  // Quiz success rate per roadmap template -------------------------------
  const instanceRows =
    (instances as (Pick<RoadmapInstance, "id" | "template_id"> & {
      template: Pick<RoadmapTemplate, "id" | "titre"> | null;
    })[] | null) ?? [];

  let quizRows: QuizSuccessRow[] = [];
  if (instanceRows.length > 0) {
    const instanceIds = instanceRows.map((instance) => instance.id);
    const { data: progressRows } = await supabase
      .from("roadmap_progress")
      .select("instance_id, etape_id, quiz_reussi, etape:roadmap_etapes(quiz)")
      .in("instance_id", instanceIds);

    const templateByInstance = new Map(instanceRows.map((instance) => [instance.id, instance.template]));
    const statsByTemplate = new Map<string, { titre: string; attempted: number; reussi: number }>();

    for (const row of (progressRows as unknown as {
      instance_id: string;
      quiz_reussi: boolean;
      etape: Pick<RoadmapEtape, "quiz"> | null;
    }[] | null) ?? []) {
      if (!row.etape?.quiz) continue;
      const template = templateByInstance.get(row.instance_id);
      if (!template) continue;
      const stats = statsByTemplate.get(template.id) ?? { titre: template.titre, attempted: 0, reussi: 0 };
      stats.attempted += 1;
      if (row.quiz_reussi) stats.reussi += 1;
      statsByTemplate.set(template.id, stats);
    }

    quizRows = Array.from(statsByTemplate.values())
      .filter((stats) => stats.attempted > 0)
      .map((stats) => ({
        titre: stats.titre,
        tauxReussite: Math.round((stats.reussi / stats.attempted) * 100),
      }))
      .sort((a, b) => b.tauxReussite - a.tauxReussite)
      .slice(0, 8);
  }

  return (
    <div className="flex flex-col gap-6">
      <AnalyticsHeader />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnalyticsSignupsChart data={monthBuckets} />
        <AnalyticsNiveauChart data={niveauRows} />
      </div>

      <AnalyticsQuizSuccessChart data={quizRows} />
    </div>
  );
}
