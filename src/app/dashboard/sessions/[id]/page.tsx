import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type {
  Evaluation,
  Paiement,
  SessionDocument,
  SessionEtape,
  SessionStagiaireWithRelations,
  SessionTache,
  Stagiaire,
  StageSession,
} from "@/lib/types";

import { SessionDetail } from "./session-detail";

export const metadata: Metadata = {
  title: "Session de stage - FUTURIX-iTech",
};

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("stage_sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (!session) {
    notFound();
  }

  const [
    { data: etapes },
    { data: enrolled },
    { data: stagiaires },
    { data: taches },
    { data: evaluations },
    { data: documents },
    { data: paiements },
  ] = await Promise.all([
    supabase
      .from("session_etapes")
      .select("*")
      .eq("session_id", id)
      .order("ordre", { ascending: true }),
    supabase
      .from("session_stagiaires")
      .select("*, stagiaire:stagiaires(id, nom, prenom, email)")
      .eq("session_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("stagiaires")
      .select("id, nom, prenom, email")
      .order("nom", { ascending: true }),
    supabase.from("session_taches").select("*").eq("session_id", id),
    supabase.from("evaluations").select("*").eq("session_id", id),
    supabase
      .from("session_documents")
      .select("*")
      .eq("session_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("paiements").select("*").eq("session_id", id),
  ]);

  const enrolledRows =
    (enrolled as SessionStagiaireWithRelations[] | null) ?? [];
  const enrolledIds = new Set(enrolledRows.map((row) => row.stagiaire_id));
  const available = (
    (stagiaires as
      | Pick<Stagiaire, "id" | "nom" | "prenom" | "email">[]
      | null) ?? []
  ).filter((stagiaire) => !enrolledIds.has(stagiaire.id));

  return (
    <SessionDetail
      session={session as StageSession}
      etapes={(etapes as SessionEtape[] | null) ?? []}
      enrolled={enrolledRows}
      available={available}
      taches={(taches as SessionTache[] | null) ?? []}
      evaluations={(evaluations as Evaluation[] | null) ?? []}
      documents={(documents as SessionDocument[] | null) ?? []}
      paiements={(paiements as Paiement[] | null) ?? []}
    />
  );
}
