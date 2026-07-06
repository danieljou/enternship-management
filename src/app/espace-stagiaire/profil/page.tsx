import type { Metadata } from "next";

import { EmptyStateMessage } from "@/components/empty-state-message";
import { createClient } from "@/lib/supabase/server";
import type { StagiaireWithRelations } from "@/lib/types";
import { StagiaireProfileView } from "@/components/profile/stagiaire-profile-view";

export const metadata: Metadata = {
  title: "Mon profil - FUTURIX-iTech",
};

export default async function StagiaireProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: stagiaire } = await supabase
    .from("stagiaires")
    .select("*, etablissement:etablissements(id, nom), filiere:filieres(id, nom)")
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!stagiaire) {
    return <EmptyStateMessage messageKey="stagiaireHome.no_profile" />;
  }

  return <StagiaireProfileView stagiaire={stagiaire as StagiaireWithRelations} />;
}
