"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  Building2,
  FileText,
  GraduationCap,
  KanbanSquare,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Milestone,
  NotebookText,
  Search,
  Settings,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LanguageToggle } from "@/components/language-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { globalSearch, type GlobalSearchResults } from "@/lib/actions/global-search";
import type { AppNotification } from "@/lib/types";

import { logout } from "@/app/dashboard/actions";

const EMPTY_SEARCH_RESULTS: GlobalSearchResults = { stagiaires: [], sessions: [], roadmaps: [] };

const SEARCH_ITEMS = [
  { href: "/dashboard", labelKey: "sidebar.dashboard", icon: LayoutDashboard },
  { href: "/dashboard/stagiaires", labelKey: "sidebar.stagiaires", icon: GraduationCap },
  { href: "/dashboard/etablissements", labelKey: "sidebar.etablissements", icon: Building2 },
  { href: "/dashboard/filieres", labelKey: "sidebar.filieres", icon: NotebookText },
  { href: "/dashboard/taches", labelKey: "sidebar.taches", icon: ListChecks },
  { href: "/dashboard/rapports", labelKey: "sidebar.rapports", icon: FileText },
  { href: "/dashboard/analytics", labelKey: "sidebar.analytics", icon: BarChart3 },
  { href: "/dashboard/parametres", labelKey: "sidebar.parametres", icon: Settings },
] as const;

export function AppTopbar({
  email,
  userId,
  initialNotifications,
}: {
  email: string | null;
  userId: string;
  initialNotifications: AppNotification[];
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dataResults, setDataResults] = useState<GlobalSearchResults>(EMPTY_SEARCH_RESULTS);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (query.trim().length < 2) {
        if (!cancelled) setDataResults(EMPTY_SEARCH_RESULTS);
        return;
      }
      globalSearch(query).then((results) => {
        if (!cancelled) setDataResults(results);
      });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  function goTo(href: string) {
    setSearchOpen(false);
    setQuery("");
    router.push(href);
  }

  const initials = email ? email.slice(0, 2).toUpperCase() : "?";

  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 rounded-t-xl border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-6">
      <SidebarTrigger />

      <Button
        type="button"
        variant="outline"
        onClick={() => setSearchOpen(true)}
        className="ml-1 h-9 max-w-xs flex-1 justify-start gap-2 text-muted-foreground sm:max-w-sm"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">{t("topbar.search_placeholder")}</span>
        <kbd className="ml-auto hidden rounded border border-border px-1.5 text-[10px] text-muted-foreground sm:inline">
          ⌘K
        </kbd>
      </Button>

      <div className="ml-auto flex items-center gap-1">
        <NotificationBell userId={userId} initialNotifications={initialNotifications} />

        <LanguageToggle />
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="ml-1 rounded-full">
              <Avatar size="sm">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {email && (
              <>
                <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
                  {email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem asChild>
              <Link href="/dashboard/parametres">
                <Settings />
                {t("topbar.settings")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                void logout();
              }}
            >
              <LogOut />
              {t("topbar.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title={t("topbar.search_dialog_title")}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t("topbar.search_placeholder")}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>{t("topbar.no_results")}</CommandEmpty>

            {dataResults.stagiaires.length > 0 && (
              <CommandGroup heading={t("topbar.search_group_stagiaires")}>
                {dataResults.stagiaires.map((stagiaire) => (
                  <CommandItem
                    key={stagiaire.id}
                    value={`stagiaire-${stagiaire.id}`}
                    onSelect={() => goTo("/dashboard/stagiaires")}
                  >
                    <GraduationCap />
                    {stagiaire.prenom} {stagiaire.nom}
                    <span className="ml-auto text-xs text-muted-foreground">{stagiaire.email}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {dataResults.sessions.length > 0 && (
              <CommandGroup heading={t("topbar.search_group_sessions")}>
                {dataResults.sessions.map((session) => (
                  <CommandItem
                    key={session.id}
                    value={`session-${session.id}`}
                    onSelect={() => goTo(`/dashboard/sessions/${session.id}`)}
                  >
                    <KanbanSquare />
                    {session.nom}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {dataResults.roadmaps.length > 0 && (
              <CommandGroup heading={t("topbar.search_group_roadmaps")}>
                {dataResults.roadmaps.map((roadmap) => (
                  <CommandItem
                    key={roadmap.id}
                    value={`roadmap-${roadmap.id}`}
                    onSelect={() => goTo(`/dashboard/roadmaps/${roadmap.id}`)}
                  >
                    <Milestone />
                    {roadmap.titre}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandGroup heading={t("topbar.search_group_pages")}>
              {SEARCH_ITEMS.filter(({ labelKey }) =>
                t(labelKey).toLowerCase().includes(query.toLowerCase()),
              ).map(({ href, labelKey, icon: Icon }) => (
                <CommandItem key={href} value={href} onSelect={() => goTo(href)}>
                  <Icon />
                  {t(labelKey)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </header>
  );
}
