import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";

import { LandingContent } from "./landing-content";

export const metadata: Metadata = {
  title: "FUTURIX-iTech - Suivi des stagiaires",
  description:
    "Plateforme de gestion des stagiaires, établissements partenaires et filières pour FUTURIX-iTech.",
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <LandingContent isAuthenticated={!!user} />;
}
