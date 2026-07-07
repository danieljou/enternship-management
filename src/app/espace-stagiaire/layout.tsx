import { redirect } from "next/navigation";

import { StagiaireSidebar } from "@/components/stagiaire-sidebar";
import { StagiaireTopbar } from "@/components/stagiaire-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createClient } from "@/lib/supabase/server";
import type { AppNotification } from "@/lib/types";

export default async function EspaceStagiaireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    redirect("/dashboard");
  }
  if (profile?.role === "encadrant") {
    redirect("/espace-encadrant");
  }

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <StagiaireSidebar />
        <SidebarInset className="h-svh overflow-y-auto">
          <StagiaireTopbar
            email={user.email ?? null}
            userId={user.id}
            initialNotifications={(notifications as AppNotification[] | null) ?? []}
          />
          <div className="flex-1 p-4 sm:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
