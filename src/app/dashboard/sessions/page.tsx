import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import type { SessionWithCounts, StageSession } from "@/lib/types";

import { SessionsManager } from "./sessions-manager";

export const metadata: Metadata = {
  title: "Sessions de stage - FUTURIX-iTech",
};

export default async function SessionsPage() {
  const supabase = await createClient();

  const [{ data: sessions }, { data: etapes }, { data: stagiaires }] =
    await Promise.all([
      supabase
        .from("stage_sessions")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("session_etapes").select("id, session_id"),
      supabase.from("session_stagiaires").select("id, session_id"),
    ]);

  const etapesCount = new Map<string, number>();
  for (const row of etapes ?? []) {
    etapesCount.set(row.session_id, (etapesCount.get(row.session_id) ?? 0) + 1);
  }

  const stagiairesCount = new Map<string, number>();
  for (const row of stagiaires ?? []) {
    stagiairesCount.set(
      row.session_id,
      (stagiairesCount.get(row.session_id) ?? 0) + 1,
    );
  }

  const data: SessionWithCounts[] = (
    (sessions as StageSession[] | null) ?? []
  ).map((session) => ({
    ...session,
    etapes_count: etapesCount.get(session.id) ?? 0,
    stagiaires_count: stagiairesCount.get(session.id) ?? 0,
  }));

  return <SessionsManager data={data} />;
}
