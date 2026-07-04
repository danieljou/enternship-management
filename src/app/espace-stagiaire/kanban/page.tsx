import type { Metadata } from "next";

import { EmptyStateMessage } from "@/components/empty-state-message";
import { createClient } from "@/lib/supabase/server";
import type { SessionEtape, SessionTache, StageSession } from "@/lib/types";

import { StagiaireSessionBoard } from "../stagiaire-kanban";

export const metadata: Metadata = {
  title: "Mon suivi de stage - FUTURIX-iTech",
};

export default async function StagiaireKanbanPage() {
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
    return <EmptyStateMessage messageKey="stagiaireKanban.no_session" />;
  }

  const { data: enrollment } = await supabase
    .from("session_stagiaires")
    .select("session:stage_sessions(*)")
    .eq("stagiaire_id", stagiaire.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const session = enrollment?.session as StageSession | null | undefined;

  if (!session) {
    return <EmptyStateMessage messageKey="stagiaireKanban.no_session" />;
  }

  const [{ data: etapes }, { data: taches }] = await Promise.all([
    supabase
      .from("session_etapes")
      .select("*")
      .eq("session_id", session.id)
      .order("ordre", { ascending: true }),
    supabase
      .from("session_taches")
      .select("*")
      .eq("session_id", session.id)
      .eq("stagiaire_id", stagiaire.id),
  ]);

  return (
    <StagiaireSessionBoard
      session={session}
      etapes={(etapes as SessionEtape[] | null) ?? []}
      taches={(taches as SessionTache[] | null) ?? []}
      stagiaireId={stagiaire.id}
      canEdit
    />
  );
}
