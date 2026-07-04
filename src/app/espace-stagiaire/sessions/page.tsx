import type { Metadata } from "next";

import { EmptyStateMessage } from "@/components/empty-state-message";
import { createClient } from "@/lib/supabase/server";
import type { StageSession } from "@/lib/types";

import { SessionsHistoryList } from "./sessions-history-list";

export const metadata: Metadata = {
  title: "Historique des sessions - FUTURIX-iTech",
};

export default async function StagiaireSessionsPage() {
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

  const { data: enrollments } = await supabase
    .from("session_stagiaires")
    .select("session:stage_sessions(*)")
    .eq("stagiaire_id", stagiaire.id)
    .order("created_at", { ascending: false });

  const sessions = (
    (enrollments as { session: StageSession | null }[] | null) ?? []
  )
    .map((row) => row.session)
    .filter((session): session is StageSession => session !== null);

  if (sessions.length === 0) {
    return <EmptyStateMessage messageKey="stagiaireHistorique.empty" />;
  }

  return (
    <SessionsHistoryList
      sessions={sessions}
      currentSessionId={sessions[0]?.id ?? null}
    />
  );
}
