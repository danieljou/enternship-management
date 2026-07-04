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
        "hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-accent text-sidebar-primary shadow-sm transition-all hover:scale-105 hover:bg-sidebar-primary hover:text-sidebar-primary-foreground md:flex",
        "group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:top-2 group-data-[collapsible=icon]:right-0 group-data-[collapsible=icon]:translate-x-1/2 group-data-[collapsible=icon]:bg-sidebar-primary group-data-[collapsible=icon]:text-sidebar-primary-foreground group-data-[collapsible=icon]:ring-2 group-data-[collapsible=icon]:ring-sidebar",
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
