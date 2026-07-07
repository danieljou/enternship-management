import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthHashFallback } from "@/components/auth/auth-hash-fallback";
import { createClient } from "@/lib/supabase/server";

import { LandingContent } from "./landing-content";

export const metadata: Metadata = {
  title: "FUTURIX-iTech - Suivi des stagiaires",
  description:
    "Plateforme de gestion des stagiaires, établissements partenaires et filières pour FUTURIX-iTech.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; type?: string }>;
}) {
  const params = await searchParams;

  // Safety net: a Supabase auth link (password recovery, invite...) whose
  // redirect_to isn't in the project's allow-list falls back to this bare
  // domain instead of the intended page - forward the PKCE code to the
  // exchange route instead of stranding the user on the landing page.
  if (params.code) {
    const next = params.type === "invite" ? "/set-password" : "/reset-password";
    const query = new URLSearchParams({ code: params.code, next });
    redirect(`/auth/confirm?${query.toString()}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <AuthHashFallback />
      <LandingContent isAuthenticated={!!user} />
    </>
  );
}
