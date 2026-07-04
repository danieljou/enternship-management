"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { StageSession } from "@/lib/types";

function formatPeriode(session: StageSession) {
  if (!session.date_debut && !session.date_fin) return null;
  const debut = session.date_debut ? new Date(session.date_debut).toLocaleDateString() : "?";
  const fin = session.date_fin ? new Date(session.date_fin).toLocaleDateString() : "?";
  return `${debut} → ${fin}`;
}

export function SessionsHistoryList({
  sessions,
  currentSessionId,
}: {
  sessions: StageSession[];
  currentSessionId: string | null;
}) {
  const { t } = useTranslation();

  return (
    <ul className="flex flex-col gap-2">
      {sessions.map((session) => {
        const periode = formatPeriode(session);
        return (
          <li key={session.id}>
            <Link
              href={`/espace-stagiaire/sessions/${session.id}`}
              className="flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/60"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-foreground">{session.nom}</p>
                  {session.id === currentSessionId && (
                    <Badge className="shrink-0">{t("stagiaireHistorique.current_badge")}</Badge>
                  )}
                </div>
                {periode && <p className="text-xs text-muted-foreground">{periode}</p>}
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
