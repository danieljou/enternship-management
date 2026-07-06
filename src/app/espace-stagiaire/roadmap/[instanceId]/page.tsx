import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  EMPTY_ETAPE_PROGRESS,
  buildLockMap,
  computeInstanceProgressPct,
  getEtapeState,
  toEtapeProgressLike,
} from "@/lib/roadmap-logic";
import { createClient } from "@/lib/supabase/server";
import type { RoadmapEtape, RoadmapProgress, RoadmapSemaine, RoadmapTemplate } from "@/lib/types";

import { RoadmapInstanceView, type SemaineView } from "./roadmap-instance-view";

export const metadata: Metadata = {
  title: "Ma roadmap — FUTURIX-iTech",
};

export default async function StagiaireRoadmapInstancePage({
  params,
}: {
  params: Promise<{ instanceId: string }>;
}) {
  const { instanceId } = await params;
  const supabase = await createClient();

  const { data: instance } = await supabase
    .from("roadmap_instances")
    .select("*, template:roadmap_templates(id, titre, branche, duree_semaines)")
    .eq("id", instanceId)
    .maybeSingle();

  const template = (instance?.template as Pick<RoadmapTemplate, "id" | "titre" | "branche" | "duree_semaines"> | null) ?? null;

  if (!instance || !template) {
    notFound();
  }

  const { data: semaines } = await supabase
    .from("roadmap_semaines")
    .select("*")
    .eq("roadmap_id", instance.template_id)
    .order("numero", { ascending: true });

  const semaineIds = ((semaines as RoadmapSemaine[] | null) ?? []).map((semaine) => semaine.id);
  const { data: etapes } =
    semaineIds.length > 0
      ? await supabase.from("roadmap_etapes").select("*").in("semaine_id", semaineIds)
      : { data: [] as RoadmapEtape[] };

  const { data: progressRows } = await supabase
    .from("roadmap_progress")
    .select("*")
    .eq("instance_id", instanceId);

  const progressByEtapeId = new Map(
    ((progressRows as RoadmapProgress[] | null) ?? []).map((progress) => [
      progress.etape_id,
      toEtapeProgressLike(progress),
    ]),
  );

  const semaineNumeroById = new Map(((semaines as RoadmapSemaine[] | null) ?? []).map((s) => [s.id, s.numero]));
  const orderedEtapes = [...(((etapes as RoadmapEtape[] | null) ?? []))].sort((a, b) => {
    const na = semaineNumeroById.get(a.semaine_id) ?? 0;
    const nb = semaineNumeroById.get(b.semaine_id) ?? 0;
    return na !== nb ? na - nb : a.jour - b.jour;
  });

  const lockMap = buildLockMap(orderedEtapes, progressByEtapeId);

  const etapesBySemaine = new Map<string, RoadmapEtape[]>();
  for (const etape of orderedEtapes) {
    const list = etapesBySemaine.get(etape.semaine_id) ?? [];
    list.push(etape);
    etapesBySemaine.set(etape.semaine_id, list);
  }

  const semainesView: SemaineView[] = ((semaines as RoadmapSemaine[] | null) ?? []).map((semaine) => ({
    id: semaine.id,
    numero: semaine.numero,
    titre: semaine.titre,
    etapes: (etapesBySemaine.get(semaine.id) ?? []).map((etape) => {
      const progress = progressByEtapeId.get(etape.id) ?? EMPTY_ETAPE_PROGRESS;
      const lock = lockMap.get(etape.id) ?? { locked: false, done: false };
      return {
        id: etape.id,
        jour: etape.jour,
        titre: etape.titre,
        hasQuiz: !!etape.quiz,
        state: getEtapeState(etape, progress),
        locked: lock.locked,
      };
    }),
  }));

  const progressPct = computeInstanceProgressPct(orderedEtapes, progressByEtapeId);

  return (
    <RoadmapInstanceView
      instanceId={instanceId}
      templateTitre={template.titre}
      branche={template.branche}
      progressPct={progressPct}
      semaines={semainesView}
    />
  );
}
