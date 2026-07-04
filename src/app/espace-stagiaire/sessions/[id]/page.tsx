import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { SessionEtape, SessionTache, StageSession } from "@/lib/types";

import { StagiaireSessionBoard } from "../../stagiaire-kanban";

export const metadata: Metadata = {
  title: "Session de stage — FUTURIX-iTech",
};

export default async function StagiaireSessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
    notFound();
  }

  const { data: enrollment } = await supabase
    .from("session_stagiaires")
    .select("session:stage_sessions(*)")
    .eq("stagiaire_id", stagiaire.id)
    .eq("session_id", id)
    .maybeSingle();

  const session = enrollment?.session as StageSession | null | undefined;

  if (!session) {
    notFound();
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
      canEdit={false}
    />
  );
}
