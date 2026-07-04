"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function SidebarCollapseButton({ className }: { className?: string }) {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label={isCollapsed ? "Développer la barre latérale" : "Réduire la barre latérale"}
      className={cn(
        "hidden h-7 w-7 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:flex",
        "group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:top-2 group-data-[collapsible=icon]:right-0 group-data-[collapsible=icon]:translate-x-1/2 group-data-[collapsible=icon]:bg-sidebar group-data-[collapsible=icon]:ring-1 group-data-[collapsible=icon]:ring-sidebar-border",
        className
      )}
    >
      {isCollapsed ? (
        <PanelLeftOpen className="h-4 w-4" />
      ) : (
        <PanelLeftClose className="h-4 w-4" />
      )}
    </button>
  );
}
