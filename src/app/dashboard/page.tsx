import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";

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
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("stagiaires").select("*", { count: "exact", head: true }),
    supabase.from("etablissements").select("*", { count: "exact", head: true }),
    supabase.from("filieres").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-card p-8 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_24px_60px_-24px_rgba(0,0,0,0.25)] sm:p-10 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_24px_60px_-24px_rgba(0,0,0,0.7)]">
        <DashboardWelcome email={user?.email ?? null} />
      </div>

      <DashboardStats
        stagiaires={stagiairesCount ?? 0}
        etablissements={etablissementsCount ?? 0}
        filieres={filieresCount ?? 0}
      />
    </div>
  );
}
