import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";

import { DashboardFiliereChart, type FiliereBreakdownRow } from "./dashboard-filiere-chart";
import { DashboardQuickActions } from "./dashboard-quick-actions";
import { DashboardSectionBreakdown } from "./dashboard-section-breakdown";
import { DashboardStats } from "./dashboard-stats";
import { DashboardWelcome } from "./dashboard-welcome";

export const metadata: Metadata = {
  title: "Tableau de bord — FUTURIX-iTech",
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
    { data: sectionRows },
    { data: filieres },
    { data: stagiaireFilieres },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("stagiaires").select("*", { count: "exact", head: true }),
    supabase.from("etablissements").select("*", { count: "exact", head: true }),
    supabase.from("filieres").select("*", { count: "exact", head: true }),
    supabase.from("stagiaires").select("section"),
    supabase.from("filieres").select("id, nom"),
    supabase.from("stagiaires").select("filiere_id"),
  ]);

  const francophone =
    sectionRows?.filter((row) => row.section === "francophone").length ?? 0;
  const anglophone =
    sectionRows?.filter((row) => row.section === "anglophone").length ?? 0;

  const filiereCounts = new Map<string, number>();
  for (const row of stagiaireFilieres ?? []) {
    if (!row.filiere_id) continue;
    filiereCounts.set(row.filiere_id, (filiereCounts.get(row.filiere_id) ?? 0) + 1);
  }

  const filiereBreakdown: FiliereBreakdownRow[] = (filieres ?? [])
    .map((filiere) => ({ nom: filiere.nom, count: filiereCounts.get(filiere.id) ?? 0 }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_FILIERE_BARS);

  return (
    <div className="flex flex-col gap-6">
      <DashboardWelcome email={user?.email ?? null} />

      <DashboardStats
        stagiaires={stagiairesCount ?? 0}
        etablissements={etablissementsCount ?? 0}
        filieres={filieresCount ?? 0}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardFiliereChart data={filiereBreakdown} />
        <DashboardSectionBreakdown francophone={francophone} anglophone={anglophone} />
      </div>

      <DashboardQuickActions />
    </div>
  );
}
