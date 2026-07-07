import type { Metadata } from "next";

import { ActivityLogWidget, type ActivityLogItem } from "@/components/activity-log-widget";
import type { ActivityActionType } from "@/lib/activity-log";
import { createClient } from "@/lib/supabase/server";

import {
  DashboardFiliereChart,
  type FiliereBreakdownRow,
} from "./dashboard-filiere-chart";
import { DashboardPaiementsChart } from "./dashboard-paiements-chart";
import { DashboardQuickActions } from "./dashboard-quick-actions";
import { DashboardSectionBreakdown } from "./dashboard-section-breakdown";
import { DashboardStats } from "./dashboard-stats";
import { DashboardWelcome } from "./dashboard-welcome";

export const metadata: Metadata = {
  title: "Tableau de bord - FUTURIX-iTech",
};

const MAX_FILIERE_BARS = 8;

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    {
      data: { user },
    },
    { count: stagiairesCount },
    { count: etablissementsCount },
    { count: filieresCount },
    { count: sessionsCount },
    { count: evaluationsCount },
    { count: documentsCount },
    { data: sectionRows },
    { data: filieres },
    { data: stagiaireFilieres },
    { data: feeSessions },
    { data: totalPaiements },
    { data: activityRows },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("stagiaires").select("*", { count: "exact", head: true }),
    supabase.from("etablissements").select("*", { count: "exact", head: true }),
    supabase.from("filieres").select("*", { count: "exact", head: true }),
    supabase.from("stage_sessions").select("*", { count: "exact", head: true }),
    supabase.from("evaluations").select("*", { count: "exact", head: true }),
    supabase
      .from("session_documents")
      .select("*", { count: "exact", head: true }),
    supabase.from("stagiaires").select("section"),
    supabase.from("filieres").select("id, nom"),
    supabase.from("stagiaires").select("filiere_id"),
    supabase.from("stage_sessions").select("id, frais_montant").not("frais_montant", "is", null),
    supabase.from("paiements").select("montant"),
    supabase
      .from("activity_log")
      .select("id, actor_nom, actor_prenom, action_type, description, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const activityItems: ActivityLogItem[] = (activityRows ?? []).map((row) => ({
    id: row.id,
    actorNom: row.actor_nom,
    actorPrenom: row.actor_prenom,
    actionType: row.action_type as ActivityActionType,
    description: row.description,
    createdAt: row.created_at,
  }));

  const francophone =
    sectionRows?.filter((row) => row.section === "francophone").length ?? 0;
  const anglophone =
    sectionRows?.filter((row) => row.section === "anglophone").length ?? 0;

  const filiereCounts = new Map<string, number>();
  for (const row of stagiaireFilieres ?? []) {
    if (!row.filiere_id) continue;
    filiereCounts.set(
      row.filiere_id,
      (filiereCounts.get(row.filiere_id) ?? 0) + 1,
    );
  }

  const filiereBreakdown: FiliereBreakdownRow[] = (filieres ?? [])
    .map((filiere) => ({
      nom: filiere.nom,
      count: filiereCounts.get(filiere.id) ?? 0,
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_FILIERE_BARS);

  const feeSessionIds = (feeSessions ?? []).map((session) => session.id);
  const { data: feeEnrollments } =
    feeSessionIds.length > 0
      ? await supabase.from("session_stagiaires").select("session_id").in("session_id", feeSessionIds)
      : { data: [] };

  const enrolledCountBySession = new Map<string, number>();
  for (const row of feeEnrollments ?? []) {
    enrolledCountBySession.set(row.session_id, (enrolledCountBySession.get(row.session_id) ?? 0) + 1);
  }

  const totalAttendu = (feeSessions ?? []).reduce(
    (sum, session) => sum + (session.frais_montant ?? 0) * (enrolledCountBySession.get(session.id) ?? 0),
    0
  );
  const totalCollecte = (totalPaiements ?? []).reduce((sum, row) => sum + row.montant, 0);
  const totalReste = Math.max(totalAttendu - totalCollecte, 0);

  return (
    <div className="flex flex-col gap-6">
      <DashboardWelcome email={user?.email ?? null} />

      <DashboardQuickActions />

      <DashboardStats
        stagiaires={stagiairesCount ?? 0}
        etablissements={etablissementsCount ?? 0}
        filieres={filieresCount ?? 0}
        sessions={sessionsCount ?? 0}
        evaluations={evaluationsCount ?? 0}
        documents={documentsCount ?? 0}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DashboardFiliereChart data={filiereBreakdown} />
        <DashboardSectionBreakdown
          francophone={francophone}
          anglophone={anglophone}
        />
        <DashboardPaiementsChart collecte={totalCollecte} reste={totalReste} />
      </div>

      <ActivityLogWidget items={activityItems} />
    </div>
  );
}
