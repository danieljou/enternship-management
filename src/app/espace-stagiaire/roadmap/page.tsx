import type { Metadata } from "next";

import { EmptyStateMessage } from "@/components/empty-state-message";
import { computeInstanceProgressPct, toEtapeProgressLike } from "@/lib/roadmap-logic";
import { createClient } from "@/lib/supabase/server";
import type {
  RoadmapEtape,
  RoadmapInstance,
  RoadmapProgress,
  RoadmapTemplate,
} from "@/lib/types";

import { RoadmapListView, type RoadmapListItem } from "./roadmap-list-view";

export const metadata: Metadata = {
  title: "Ma roadmap — FUTURIX-iTech",
};

export default async function StagiaireRoadmapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: stagiaire } = await supabase
    .from("stagiaires")
    .select("id")
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!stagiaire) {
    return <EmptyStateMessage messageKey="stagiaireHome.no_profile" />;
  }

  const { data: instances } = await supabase
    .from("roadmap_instances")
    .select("*, template:roadmap_templates(id, titre, branche, duree_semaines)")
    .eq("stagiaire_id", stagiaire.id)
    .order("created_at", { ascending: false });

  const instanceRows =
    (instances as (RoadmapInstance & { template: Pick<RoadmapTemplate, "id" | "titre" | "branche" | "duree_semaines"> | null })[] | null) ??
    [];

  if (instanceRows.length === 0) {
    return <EmptyStateMessage messageKey="stagiaireRoadmap.empty" />;
  }

  const templateIds = Array.from(new Set(instanceRows.map((instance) => instance.template_id)));
  const { data: semaines } = await supabase
    .from("roadmap_semaines")
    .select("id, roadmap_id")
    .in("roadmap_id", templateIds);

  const semaineIds = (semaines ?? []).map((semaine) => semaine.id);
  const { data: etapes } =
    semaineIds.length > 0
      ? await supabase.from("roadmap_etapes").select("id, semaine_id, quiz").in("semaine_id", semaineIds)
      : { data: [] as Pick<RoadmapEtape, "id" | "semaine_id" | "quiz">[] };

  const semaineToTemplate = new Map<string, string>();
  for (const semaine of semaines ?? []) {
    semaineToTemplate.set(semaine.id, semaine.roadmap_id);
  }

  const etapesByTemplate = new Map<string, Pick<RoadmapEtape, "id" | "quiz">[]>();
  for (const etape of (etapes as Pick<RoadmapEtape, "id" | "semaine_id" | "quiz">[] | null) ?? []) {
    const templateId = semaineToTemplate.get(etape.semaine_id);
    if (!templateId) continue;
    const list = etapesByTemplate.get(templateId) ?? [];
    list.push({ id: etape.id, quiz: etape.quiz });
    etapesByTemplate.set(templateId, list);
  }

  const instanceIds = instanceRows.map((instance) => instance.id);
  const { data: progressRows } =
    instanceIds.length > 0
      ? await supabase.from("roadmap_progress").select("*").in("instance_id", instanceIds)
      : { data: [] as RoadmapProgress[] };

  const progressByInstance = new Map<string, Map<string, RoadmapProgress>>();
  for (const progress of (progressRows as RoadmapProgress[] | null) ?? []) {
    const map = progressByInstance.get(progress.instance_id) ?? new Map<string, RoadmapProgress>();
    map.set(progress.etape_id, progress);
    progressByInstance.set(progress.instance_id, map);
  }

  const items: RoadmapListItem[] = instanceRows
    .filter((instance) => instance.template)
    .map((instance) => {
      const etapesList = etapesByTemplate.get(instance.template_id) ?? [];
      const progressMap = progressByInstance.get(instance.id) ?? new Map<string, RoadmapProgress>();
      const progressLikeMap = new Map(
        etapesList.map((etape) => [etape.id, toEtapeProgressLike(progressMap.get(etape.id))]),
      );
      const progressPct = computeInstanceProgressPct(etapesList, progressLikeMap);

      return {
        instanceId: instance.id,
        titre: instance.template!.titre,
        branche: instance.template!.branche,
        dureeSemaines: instance.template!.duree_semaines,
        dateDebut: instance.date_debut,
        dateFin: instance.date_fin,
        progressPct,
      };
    });

  return <RoadmapListView items={items} />;
}
