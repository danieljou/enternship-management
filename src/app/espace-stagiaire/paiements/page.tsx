import type { Metadata } from "next";

import { EmptyStateMessage } from "@/components/empty-state-message";
import { createClient } from "@/lib/supabase/server";
import type { Paiement, StageSession } from "@/lib/types";

import { StagiairePaiementsList, type SessionPaiementGroup } from "./paiements-list";

export const metadata: Metadata = {
  title: "Frais de stage — FUTURIX-iTech",
};

export default async function StagiairePaiementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: stagiaire } = await supabase
    .from("stagiaires")
    .select("id, nom, prenom")
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!stagiaire) {
    return <EmptyStateMessage messageKey="stagiaireHome.no_profile" />;
  }

  const { data: enrollments } = await supabase
    .from("session_stagiaires")
    .select("session:stage_sessions(id, nom, frais_montant)")
    .eq("stagiaire_id", stagiaire.id)
    .order("created_at", { ascending: false });

  const sessions = (enrollments ?? [])
    .map((row) => row.session as unknown as StageSession | null)
    .filter((session): session is StageSession => !!session && session.frais_montant != null);

  if (sessions.length === 0) {
    return <EmptyStateMessage messageKey="stagiairePaiements.empty" />;
  }

  const { data: paiements } = await supabase
    .from("paiements")
    .select("*")
    .eq("stagiaire_id", stagiaire.id)
    .in(
      "session_id",
      sessions.map((session) => session.id)
    )
    .order("date_paiement", { ascending: false });

  const rows = (paiements as Paiement[] | null) ?? [];

  const groups: SessionPaiementGroup[] = sessions.map((session) => ({
    session,
    paiements: rows.filter((paiement) => paiement.session_id === session.id),
  }));

  return (
    <StagiairePaiementsList
      groups={groups}
      stagiaireNom={stagiaire.nom}
      stagiairePrenom={stagiaire.prenom}
    />
  );
}
