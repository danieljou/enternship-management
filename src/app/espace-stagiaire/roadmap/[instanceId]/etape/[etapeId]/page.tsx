import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { sanitizeQuizForStagiaire, toEtapeProgressLike } from "@/lib/roadmap-logic";
import { createClient } from "@/lib/supabase/server";
import type { RoadmapEtape, RoadmapLivrableSoumission, RoadmapProgress, RoadmapQuiz } from "@/lib/types";

import { EtapeScreen } from "./etape-screen";

export const metadata: Metadata = {
  title: "Étape — FUTURIX-iTech",
};

export default async function StagiaireEtapePage({
  params,
}: {
  params: Promise<{ instanceId: string; etapeId: string }>;
}) {
  const { instanceId, etapeId } = await params;
  const supabase = await createClient();

  const { data: instance } = await supabase
    .from("roadmap_instances")
    .select("id")
    .eq("id", instanceId)
    .maybeSingle();

  const { data: etape } = await supabase
    .from("roadmap_etapes")
    .select("*")
    .eq("id", etapeId)
    .maybeSingle();

  if (!instance || !etape) {
    notFound();
  }

  const etapeRow = etape as RoadmapEtape;

  const { data: progress } = await supabase
    .from("roadmap_progress")
    .select("*")
    .eq("instance_id", instanceId)
    .eq("etape_id", etapeId)
    .maybeSingle();

  const progressRow = progress as RoadmapProgress | null;

  const { data: soumissions } = progressRow
    ? await supabase
        .from("roadmap_livrable_soumissions")
        .select("*")
        .eq("progress_id", progressRow.id)
        .order("created_at", { ascending: false })
    : { data: [] as RoadmapLivrableSoumission[] };

  const quiz = etapeRow.quiz as RoadmapQuiz | null;

  return (
    <EtapeScreen
      instanceId={instanceId}
      etapeId={etapeId}
      titre={etapeRow.titre}
      objectifs={etapeRow.objectifs}
      cours={etapeRow.cours}
      exercice={etapeRow.exercice}
      livrableAttendu={etapeRow.livrable_attendu}
      quiz={quiz ? sanitizeQuizForStagiaire(quiz) : null}
      progress={toEtapeProgressLike(progressRow ?? undefined)}
      soumissions={(soumissions as RoadmapLivrableSoumission[] | null) ?? []}
    />
  );
}
