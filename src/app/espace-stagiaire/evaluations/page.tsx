import type { Metadata } from "next";

import { EmptyStateMessage } from "@/components/empty-state-message";
import { createClient } from "@/lib/supabase/server";
import type { EvaluationWithSession } from "@/lib/types";

import { EvaluationsList } from "./evaluations-list";

export const metadata: Metadata = {
  title: "Évaluations — FUTURIX-iTech",
};

export default async function StagiaireEvaluationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: stagiaire } = await supabase
    .from("stagiaires")
    .select("id")
    .eq("user_id", user!.id)
    .single();

  if (!stagiaire) {
    return <EmptyStateMessage messageKey="stagiaireHome.no_profile" />;
  }

  const { data: evaluations } = await supabase
    .from("evaluations")
    .select("*, session:stage_sessions(id, nom)")
    .eq("stagiaire_id", stagiaire.id)
    .order("created_at", { ascending: false });

  const rows = (evaluations as EvaluationWithSession[] | null) ?? [];

  if (rows.length === 0) {
    return <EmptyStateMessage messageKey="stagiaireEvaluations.empty" />;
  }

  return <EvaluationsList evaluations={rows} />;
}
