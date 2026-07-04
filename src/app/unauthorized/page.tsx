import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import { FuturixLogo } from "@/components/futurix-logo";
import { createClient } from "@/lib/supabase/server";

import { UnauthorizedContent } from "./unauthorized-content";

export const metadata: Metadata = {
  title: "Accès refusé - FUTURIX-iTech",
};

export default async function UnauthorizedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <FuturixLogo />
        </div>

        <div className="flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_24px_60px_-24px_rgba(0,0,0,0.25)] sm:p-10 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_24px_60px_-24px_rgba(0,0,0,0.7)]">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
            <ShieldAlert className="h-6 w-6" />
          </span>

          <UnauthorizedContent />
        </div>
      </div>
    </main>
  );
}
