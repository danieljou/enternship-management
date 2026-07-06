import type { Metadata } from "next";

import { EmptyStateMessage } from "@/components/empty-state-message";
import { createClient } from "@/lib/supabase/server";
import { AdminProfileView, type AdminProfileData } from "@/components/profile/admin-profile-view";

export const metadata: Metadata = {
  title: "Mon profil - FUTURIX-iTech",
};

export default async function AdminProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <EmptyStateMessage messageKey="stagiaireHome.no_profile" />;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nom, prenom, created_at")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return <EmptyStateMessage messageKey="stagiaireHome.no_profile" />;
  }

  const data: AdminProfileData = {
    userId: profile.id,
    prenom: profile.prenom ?? "",
    nom: profile.nom ?? "",
    email: user.email ?? "",
    createdAt: profile.created_at,
  };

  return <AdminProfileView profile={data} />;
}
