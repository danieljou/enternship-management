import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { computeInstanceProgressPct, toEtapeProgressLike } from "@/lib/roadmap-logic";
import { createClient } from "@/lib/supabase/server";
import type {
  Etablissement,
  Evaluation,
  Filiere,
  RoadmapEtape,
  RoadmapInstance,
  RoadmapProgress,
  RoadmapTemplate,
  Stagiaire,
} from "@/lib/types";

import { EncadrantStagiaireDetail, type RoadmapProgressItem } from "./encadrant-stagiaire-detail";

export const metadata: Metadata = {
  title: "Stagiaire - FUTURIX-iTech",
};

export default async function EncadrantStagiairePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: stagiaire } = await supabase
    .from("stagiaires")
    .select("*, etablissement:etablissements(id, nom), filiere:filieres(id, nom)")
    .eq("id", id)
    .maybeSingle();

  if (!stagiaire) {
    notFound();
  }

  const typedStagiaire = stagiaire as Stagiaire & {
    etablissement: Pick<Etablissement, "id" | "nom"> | null;
    filiere: Pick<Filiere, "id" | "nom"> | null;
  };

  const [{ data: enrollments }, { data: evaluations }, { data: instances }] = await Promise.all([
    supabase
      .from("session_stagiaires")
      .select("session:stage_sessions(id, nom)")
      .eq("stagiaire_id", id),
    supabase
      .from("evaluations")
      .select("*")
      .eq("stagiaire_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("roadmap_instances")
      .select("*, template:roadmap_templates(id, titre, branche)")
      .eq("stagiaire_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const sessions = (enrollments ?? [])
    .map((row) => row.session as unknown as { id: string; nom: string } | null)
    .filter((session): session is { id: string; nom: string } => !!session);

  const instanceRows =
    (instances as (RoadmapInstance & {
      template: Pick<RoadmapTemplate, "id" | "titre" | "branche"> | null;
    })[] | null) ?? [];

  let roadmapItems: RoadmapProgressItem[] = [];
  if (instanceRows.length > 0) {
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
    const { data: progressRows } = await supabase
      .from("roadmap_progress")
      .select("*")
      .in("instance_id", instanceIds);

    const progressByInstance = new Map<string, Map<string, RoadmapProgress>>();
    for (const progress of (progressRows as RoadmapProgress[] | null) ?? []) {
      const map = progressByInstance.get(progress.instance_id) ?? new Map<string, RoadmapProgress>();
      map.set(progress.etape_id, progress);
      progressByInstance.set(progress.instance_id, map);
    }

    roadmapItems = instanceRows
      .filter((instance) => instance.template)
      .map((instance) => {
        const etapesList = etapesByTemplate.get(instance.template_id) ?? [];
        const progressMap = progressByInstance.get(instance.id) ?? new Map<string, RoadmapProgress>();
        const progressLikeMap = new Map(
          etapesList.map((etape) => [etape.id, toEtapeProgressLike(progressMap.get(etape.id))]),
        );
        return {
          titre: instance.template!.titre,
          branche: instance.template!.branche,
          progressPct: computeInstanceProgressPct(etapesList, progressLikeMap),
        };
      });
  }

  return (
    <EncadrantStagiaireDetail
      stagiaire={typedStagiaire}
      sessions={sessions}
      evaluations={(evaluations as Evaluation[] | null) ?? []}
      roadmapItems={roadmapItems}
    />
  );
}
