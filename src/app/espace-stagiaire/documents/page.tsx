import type { Metadata } from "next";

import { EmptyStateMessage } from "@/components/empty-state-message";
import { createClient } from "@/lib/supabase/server";
import type { SessionDocumentWithSession } from "@/lib/types";

import { DocumentsList } from "./documents-list";

export const metadata: Metadata = {
  title: "Documents - FUTURIX-iTech",
};

export default async function StagiaireDocumentsPage() {
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
    .select("session_id")
    .eq("stagiaire_id", stagiaire.id);

  const sessionIds = (enrollments ?? []).map((row) => row.session_id);

  if (sessionIds.length === 0) {
    return <EmptyStateMessage messageKey="stagiaireDocuments.empty" />;
  }

  const { data: documents } = await supabase
    .from("session_documents")
    .select("*, session:stage_sessions(id, nom)")
    .in("session_id", sessionIds)
    .order("created_at", { ascending: false });

  const rows = (documents as SessionDocumentWithSession[] | null) ?? [];

  if (rows.length === 0) {
    return <EmptyStateMessage messageKey="stagiaireDocuments.empty" />;
  }

  return <DocumentsList documents={rows} />;
}
