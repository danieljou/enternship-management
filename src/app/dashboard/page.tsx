import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";

import { DashboardQuickActions } from "./dashboard-quick-actions";
import { DashboardSectionBreakdown } from "./dashboard-section-breakdown";
import { DashboardStats } from "./dashboard-stats";
import { DashboardWelcome } from "./dashboard-welcome";

export const metadata: Metadata = {
  title: "Tableau de bord — FUTURIX-iTech",
};

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
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("stagiaires").select("*", { count: "exact", head: true }),
    supabase.from("etablissements").select("*", { count: "exact", head: true }),
    supabase.from("filieres").select("*", { count: "exact", head: true }),
    supabase.from("stagiaires").select("section"),
  ]);

  const francophone =
    sectionRows?.filter((row) => row.section === "francophone").length ?? 0;
  const anglophone =
    sectionRows?.filter((row) => row.section === "anglophone").length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <DashboardWelcome email={user?.email ?? null} />

      <DashboardStats
        stagiaires={stagiairesCount ?? 0}
        etablissements={etablissementsCount ?? 0}
        filieres={filieresCount ?? 0}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardQuickActions />
        <DashboardSectionBreakdown francophone={francophone} anglophone={anglophone} />
      </div>
    </div>
  );
}
