import type { Metadata } from "next";

import { computeInstanceProgressPct, toEtapeProgressLike } from "@/lib/roadmap-logic";
import { computePaiementStatus, formatMontant } from "@/lib/payment-status";
import { createClient } from "@/lib/supabase/server";
import type { RoadmapEtape, RoadmapInstance, RoadmapProgress, RoadmapTemplate } from "@/lib/types";

import { RapportsView } from "./rapports-view";

export const metadata: Metadata = {
  title: "Rapports - FUTURIX-iTech",
};

export default async function RapportsPage() {
  const supabase = await createClient();

  const [{ data: stagiaires }, { data: sessions }, { data: instances }] = await Promise.all([
    supabase
      .from("stagiaires")
      .select(
        "nom, prenom, email, niveau, section, etablissement:etablissements(nom), filiere:filieres(nom), encadrant:profiles(nom, prenom)",
      )
      .order("nom", { ascending: true }),
    supabase.from("stage_sessions").select("id, nom, frais_montant").not("frais_montant", "is", null),
    supabase
      .from("roadmap_instances")
      .select("*, stagiaire:stagiaires(nom, prenom), template:roadmap_templates(id, titre, branche)")
      .order("created_at", { ascending: false }),
  ]);

  // Report 1: stagiaires ---------------------------------------------------
  const stagiaireRows = (stagiaires ?? []).map((row) => {
    const etablissement = row.etablissement as unknown as { nom: string } | null;
    const filiere = row.filiere as unknown as { nom: string } | null;
    const encadrant = row.encadrant as unknown as { nom: string | null; prenom: string | null } | null;
    return [
      row.nom,
      row.prenom,
      row.email,
      String(row.niveau),
      etablissement?.nom ?? "",
      filiere?.nom ?? "",
      row.section === "anglophone" ? "Anglophone" : "Francophone",
      encadrant ? `${encadrant.prenom ?? ""} ${encadrant.nom ?? ""}`.trim() : "",
    ];
  });

  // Report 2: paiements par session ----------------------------------------
  const sessionIds = (sessions ?? []).map((session) => session.id);
  const { data: enrolled } =
    sessionIds.length > 0
      ? await supabase.from("session_stagiaires").select("session_id").in("session_id", sessionIds)
      : { data: [] as { session_id: string }[] };
  const { data: paiements } =
    sessionIds.length > 0
      ? await supabase.from("paiements").select("session_id, montant").in("session_id", sessionIds)
      : { data: [] as { session_id: string; montant: number }[] };

  const enrolledCountBySession = new Map<string, number>();
  for (const row of enrolled ?? []) {
    enrolledCountBySession.set(row.session_id, (enrolledCountBySession.get(row.session_id) ?? 0) + 1);
  }
  const paidBySession = new Map<string, number>();
  for (const row of paiements ?? []) {
    paidBySession.set(row.session_id, (paidBySession.get(row.session_id) ?? 0) + row.montant);
  }

  const paiementRows = (sessions ?? []).map((session) => {
    const enrolledCount = enrolledCountBySession.get(session.id) ?? 0;
    const attendu = (session.frais_montant ?? 0) * enrolledCount;
    const collecte = paidBySession.get(session.id) ?? 0;
    const reste = Math.max(attendu - collecte, 0);
    const status = computePaiementStatus(attendu, collecte);
    const taux = attendu > 0 ? Math.round((collecte / attendu) * 100) : 0;
    return [
      session.nom,
      formatMontant(session.frais_montant ?? 0),
      String(enrolledCount),
      formatMontant(attendu),
      formatMontant(collecte),
      formatMontant(reste),
      `${taux}%`,
      status === "paye" ? "Payé" : status === "partiel" ? "Partiel" : "Impayé",
    ];
  });

  // Report 3: progression des roadmaps -------------------------------------
  const instanceRows =
    (instances as (RoadmapInstance & {
      stagiaire: { nom: string; prenom: string } | null;
      template: Pick<RoadmapTemplate, "id" | "titre" | "branche"> | null;
    })[] | null) ?? [];

  let roadmapRows: string[][] = [];
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

    roadmapRows = instanceRows
      .filter((instance) => instance.template && instance.stagiaire)
      .map((instance) => {
        const etapesList = etapesByTemplate.get(instance.template_id) ?? [];
        const progressMap = progressByInstance.get(instance.id) ?? new Map<string, RoadmapProgress>();
        const progressLikeMap = new Map(
          etapesList.map((etape) => [etape.id, toEtapeProgressLike(progressMap.get(etape.id))]),
        );
        const pct = computeInstanceProgressPct(etapesList, progressLikeMap);
        return [
          `${instance.stagiaire!.prenom} ${instance.stagiaire!.nom}`,
          instance.template!.titre,
          instance.template!.branche,
          `${pct}%`,
        ];
      });
  }

  return (
    <RapportsView
      stagiaireRows={stagiaireRows}
      paiementRows={paiementRows}
      roadmapRows={roadmapRows}
    />
  );
}
