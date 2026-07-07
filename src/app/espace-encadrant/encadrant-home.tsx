"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";

import {
  RoadmapValidationQueue,
  type BlockedQueueItem,
  type LivrableQueueItem,
} from "@/app/dashboard/roadmaps/validation/roadmap-validation-queue";
import type { Etablissement, Filiere, Stagiaire } from "@/lib/types";

type StagiaireRow = Stagiaire & {
  etablissement: Pick<Etablissement, "id" | "nom"> | null;
  filiere: Pick<Filiere, "id" | "nom"> | null;
};

export function EncadrantHome({
  stagiaires,
  livrableItems,
  blockedItems,
}: {
  stagiaires: StagiaireRow[];
  livrableItems: LivrableQueueItem[];
  blockedItems: BlockedQueueItem[];
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("encadrantSpace.home_title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("encadrantSpace.home_subtitle")}</p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          {t("encadrantSpace.stagiaires_title", { count: stagiaires.length })}
        </h2>
        {stagiaires.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            {t("encadrantSpace.stagiaires_empty")}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stagiaires.map((stagiaire) => (
              <Link
                key={stagiaire.id}
                href={`/espace-encadrant/stagiaires/${stagiaire.id}`}
                className="group flex items-center justify-between gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {stagiaire.prenom} {stagiaire.nom}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {stagiaire.filiere?.nom ?? t("profile.no_field")}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          {t("encadrantSpace.validation_title")}
        </h2>
        <RoadmapValidationQueue livrableItems={livrableItems} blockedItems={blockedItems} />
      </div>
    </div>
  );
}
