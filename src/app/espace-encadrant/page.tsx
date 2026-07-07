import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import type {
  RoadmapEtape,
  RoadmapInstance,
  RoadmapLivrableSoumission,
  RoadmapLivrableStatut,
  RoadmapQuiz,
  RoadmapSemaine,
  RoadmapTemplate,
  Stagiaire,
} from "@/lib/types";

import { EncadrantHome } from "./encadrant-home";

export const metadata: Metadata = {
  title: "Mes stagiaires - FUTURIX-iTech",
};

interface ProgressRow {
  id: string;
  instance_id: string;
  etape_id: string;
  quiz_tentatives: number;
  quiz_meilleur_score: number | null;
  quiz_reussi: boolean;
  livrable_statut: RoadmapLivrableStatut;
  instance:
    | (Pick<RoadmapInstance, "id"> & {
        stagiaire: Pick<Stagiaire, "id" | "nom" | "prenom"> | null;
        template: Pick<RoadmapTemplate, "id" | "titre"> | null;
      })
    | null;
  etape:
    | (Pick<RoadmapEtape, "id" | "titre" | "jour" | "quiz"> & {
        semaine: Pick<RoadmapSemaine, "id" | "numero" | "titre"> | null;
      })
    | null;
}

export default async function EncadrantHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: stagiaires }, { data: progressRows }] = await Promise.all([
    supabase
      .from("stagiaires")
      .select("*, etablissement:etablissements(id, nom), filiere:filieres(id, nom)")
      .eq("encadrant_id", user!.id)
      .order("nom", { ascending: true }),
    // RLS scopes this to the current encadrant's assigned stagiaires automatically.
    supabase
      .from("roadmap_progress")
      .select(
        `id, instance_id, etape_id, quiz_tentatives, quiz_meilleur_score, quiz_reussi, livrable_statut,
         instance:roadmap_instances(id, stagiaire:stagiaires(id, nom, prenom), template:roadmap_templates(id, titre)),
         etape:roadmap_etapes(id, titre, jour, quiz, semaine:roadmap_semaines(id, numero, titre))`,
      )
      .or("livrable_statut.eq.soumis,quiz_reussi.eq.false"),
  ]);

  const rows = (progressRows as unknown as ProgressRow[] | null) ?? [];

  const progressIds = rows.map((row) => row.id);
  const { data: soumissions } =
    progressIds.length > 0
      ? await supabase
          .from("roadmap_livrable_soumissions")
          .select("*")
          .in("progress_id", progressIds)
          .order("created_at", { ascending: false })
      : { data: [] as RoadmapLivrableSoumission[] };

  const latestSoumissionByProgress = new Map<string, RoadmapLivrableSoumission>();
  for (const soumission of (soumissions as RoadmapLivrableSoumission[] | null) ?? []) {
    if (!latestSoumissionByProgress.has(soumission.progress_id)) {
      latestSoumissionByProgress.set(soumission.progress_id, soumission);
    }
  }

  const livrableRows = rows.filter((row) => row.livrable_statut === "soumis");
  const blockedRows = rows.filter((row) => {
    const quiz = row.etape?.quiz as RoadmapQuiz | null;
    return quiz && row.quiz_tentatives >= quiz.tentatives_max && !row.quiz_reussi;
  });

  const livrableItems = livrableRows
    .filter((row) => row.instance && row.etape)
    .map((row) => ({
      progressId: row.id,
      instanceId: row.instance_id,
      stagiaireNom: row.instance
        ? `${row.instance.stagiaire?.prenom ?? ""} ${row.instance.stagiaire?.nom ?? ""}`.trim()
        : "",
      roadmapTitre: row.instance?.template?.titre ?? "",
      semaineNumero: row.etape?.semaine?.numero ?? 0,
      etapeJour: row.etape?.jour ?? 0,
      etapeTitre: row.etape?.titre ?? "",
      soumission: latestSoumissionByProgress.get(row.id) ?? null,
    }));

  const blockedItems = blockedRows
    .filter((row) => row.instance && row.etape)
    .map((row) => ({
      progressId: row.id,
      instanceId: row.instance_id,
      stagiaireNom: row.instance
        ? `${row.instance.stagiaire?.prenom ?? ""} ${row.instance.stagiaire?.nom ?? ""}`.trim()
        : "",
      roadmapTitre: row.instance?.template?.titre ?? "",
      semaineNumero: row.etape?.semaine?.numero ?? 0,
      etapeJour: row.etape?.jour ?? 0,
      etapeTitre: row.etape?.titre ?? "",
      quizMeilleurScore: row.quiz_meilleur_score,
      quizTentatives: row.quiz_tentatives,
    }));

  return (
    <EncadrantHome
      stagiaires={stagiaires ?? []}
      livrableItems={livrableItems}
      blockedItems={blockedItems}
    />
  );
}
