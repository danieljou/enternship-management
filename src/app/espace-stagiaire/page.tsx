import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";

import { FuturixLogo } from "@/components/futurix-logo";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/server";

import { StagiaireSpaceContent } from "./stagiaire-space-content";

export const metadata: Metadata = {
  title: "Espace stagiaire — FUTURIX-iTech",
};

export default async function EspaceStagiairePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: stagiaire } = await supabase
    .from("stagiaires")
    .select("prenom")
    .eq("user_id", user.id)
    .single();

  const firstName = stagiaire?.prenom ?? user.email?.split("@")[0] ?? null;

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="absolute top-6 right-6 flex gap-1">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <FuturixLogo />
        </div>

        <div className="flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_24px_60px_-24px_rgba(0,0,0,0.25)] sm:p-10 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_24px_60px_-24px_rgba(0,0,0,0.7)]">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Sparkles className="h-6 w-6" />
          </span>

          <StagiaireSpaceContent firstName={firstName} />
        </div>
      </div>
    </main>
  );
}
