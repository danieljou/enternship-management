import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import type {
  RoadmapEtape,
  RoadmapInstanceWithRelations,
  RoadmapSemaine,
  RoadmapSemaineWithEtapes,
  RoadmapTemplate,
} from "@/lib/types";

import { RoadmapDetail } from "./roadmap-detail";

export const metadata: Metadata = {
  title: "Roadmap - FUTURIX-iTech",
};

export default async function RoadmapDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: template }, { data: semaines }, { data: instances }, { data: stagiaires }] =
    await Promise.all([
      supabase.from("roadmap_templates").select("*").eq("id", id).single(),
      supabase
        .from("roadmap_semaines")
        .select("*")
        .eq("roadmap_id", id)
        .order("numero", { ascending: true }),
      supabase
        .from("roadmap_instances")
        .select(
          "*, stagiaire:stagiaires(id, nom, prenom, email), template:roadmap_templates(id, titre, branche, duree_semaines, statut)",
        )
        .eq("template_id", id)
        .order("created_at", { ascending: false }),
      supabase.from("stagiaires").select("id, nom, prenom, email").order("nom", { ascending: true }),
    ]);

  if (!template) {
    notFound();
  }

  const semaineIds = ((semaines as RoadmapSemaine[] | null) ?? []).map((semaine) => semaine.id);
  const { data: etapes } =
    semaineIds.length > 0
      ? await supabase
          .from("roadmap_etapes")
          .select("*")
          .in("semaine_id", semaineIds)
          .order("jour", { ascending: true })
      : { data: [] as RoadmapEtape[] };

  const etapesBySemaine = new Map<string, RoadmapEtape[]>();
  for (const etape of (etapes as RoadmapEtape[] | null) ?? []) {
    const list = etapesBySemaine.get(etape.semaine_id) ?? [];
    list.push(etape);
    etapesBySemaine.set(etape.semaine_id, list);
  }

  const semainesWithEtapes: RoadmapSemaineWithEtapes[] = ((semaines as RoadmapSemaine[] | null) ?? []).map(
    (semaine) => ({
      ...semaine,
      etapes: etapesBySemaine.get(semaine.id) ?? [],
    }),
  );

  return (
    <RoadmapDetail
      template={template as RoadmapTemplate}
      semaines={semainesWithEtapes}
      instances={(instances as RoadmapInstanceWithRelations[] | null) ?? []}
      stagiaires={stagiaires ?? []}
    />
  );
}
