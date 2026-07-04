import type { Metadata } from "next";

import { EmptyStateMessage } from "@/components/empty-state-message";
import { createClient } from "@/lib/supabase/server";
import type { Evaluation, StageSession, StagiaireWithRelations } from "@/lib/types";

import { StagiaireHome } from "./stagiaire-home";

export const metadata: Metadata = {
  title: "Espace stagiaire — FUTURIX-iTech",
};

export default async function EspaceStagiairePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: stagiaire } = await supabase
    .from("stagiaires")
    .select("*, etablissement:etablissements(id, nom), filiere:filieres(id, nom)")
    .eq("user_id", user!.id)
    .single();

  if (!stagiaire) {
    return <EmptyStateMessage messageKey="stagiaireHome.no_profile" />;
  }

  const { data: enrollment } = await supabase
    .from("session_stagiaires")
    .select("session:stage_sessions(*)")
    .eq("stagiaire_id", stagiaire.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const currentSession = enrollment?.session as StageSession | null | undefined;

  let etapesCount = 0;
  let tachesCount = 0;
  let latestEvaluation: Evaluation | null = null;

  if (currentSession) {
    const [{ count: etapesTotal }, { count: tachesTotal }, { data: evaluation }] =
      await Promise.all([
        supabase
          .from("session_etapes")
          .select("id", { count: "exact", head: true })
          .eq("session_id", currentSession.id),
        supabase
          .from("session_taches")
          .select("id", { count: "exact", head: true })
          .eq("session_id", currentSession.id)
          .eq("stagiaire_id", stagiaire.id),
        supabase
          .from("evaluations")
          .select("*")
          .eq("session_id", currentSession.id)
          .eq("stagiaire_id", stagiaire.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

    etapesCount = etapesTotal ?? 0;
    tachesCount = tachesTotal ?? 0;
    latestEvaluation = (evaluation as Evaluation | null) ?? null;
  }

  return (
    <StagiaireHome
      stagiaire={stagiaire as StagiaireWithRelations}
      currentSession={currentSession ?? null}
      etapesCount={etapesCount}
      tachesCount={tachesCount}
      latestEvaluation={latestEvaluation}
    />
  );
}
