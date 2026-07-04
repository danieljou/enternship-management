import { redirect } from "next/navigation";

import { StagiaireSidebar } from "@/components/stagiaire-sidebar";
import { StagiaireTopbar } from "@/components/stagiaire-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <TooltipProvider>
      <SidebarProvider>
        <StagiaireSidebar />
        <SidebarInset className="overflow-hidden">
          <StagiaireTopbar email={user.email ?? null} />
          <div className="flex-1 p-4 sm:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
