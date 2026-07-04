"use client";

import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import type { EvaluationWithSession } from "@/lib/types";

export function EvaluationsList({ evaluations }: { evaluations: EvaluationWithSession[] }) {
  const { t } = useTranslation();

  return (
    <ul className="flex flex-col gap-2">
      {evaluations.map((evaluation) => (
        <li key={evaluation.id} className="flex flex-col gap-2 rounded-lg border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-foreground">
                {evaluation.session?.nom ?? t("stagiaireEvaluations.unknown_session")}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(evaluation.created_at).toLocaleDateString()}
              </p>
            </div>
            <Badge className="text-sm">{evaluation.note}/20</Badge>
          </div>
          {evaluation.commentaire && (
            <p className="text-sm text-muted-foreground">{evaluation.commentaire}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
