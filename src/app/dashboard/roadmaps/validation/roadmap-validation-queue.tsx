"use client";

import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RoadmapLivrableSoumission } from "@/lib/types";

import { unlockEtape } from "../actions";
import { LivrableReviewDialog } from "./livrable-review-dialog";

export interface LivrableQueueItem {
  progressId: string;
  instanceId: string;
  stagiaireNom: string;
  roadmapTitre: string;
  semaineNumero: number;
  etapeJour: number;
  etapeTitre: string;
  soumission: RoadmapLivrableSoumission | null;
}

export interface BlockedQueueItem {
  progressId: string;
  instanceId: string;
  stagiaireNom: string;
  roadmapTitre: string;
  semaineNumero: number;
  etapeJour: number;
  etapeTitre: string;
  quizMeilleurScore: number | null;
  quizTentatives: number;
}

export function RoadmapValidationQueue({
  livrableItems,
  blockedItems,
}: {
  livrableItems: LivrableQueueItem[];
  blockedItems: BlockedQueueItem[];
}) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [reviewing, setReviewing] = useState<LivrableQueueItem | null>(null);

  function handleUnlock(progressId: string) {
    startTransition(async () => {
      const result = await unlockEtape(progressId);
      if ("error" in result) toast.error(t(result.error));
      else toast.success(t("roadmaps.unlock_success"));
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("roadmaps.validation_title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("roadmaps.validation_description")}</p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">{t("roadmaps.validation_livrables_title")}</h2>
        {livrableItems.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            {t("roadmaps.validation_livrables_empty")}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {livrableItems.map((item) => (
              <div
                key={item.progressId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{item.stagiaireNom}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.roadmapTitre} · {t("roadmaps.semaine_label", { numero: item.semaineNumero })} ·{" "}
                    {t("roadmaps.jour_label", { jour: item.etapeJour })} — {item.etapeTitre}
                  </p>
                </div>
                <Button size="sm" onClick={() => setReviewing(item)}>
                  {t("roadmaps.validation_review_button")}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">{t("roadmaps.validation_blocked_title")}</h2>
        {blockedItems.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            {t("roadmaps.validation_blocked_empty")}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {blockedItems.map((item) => (
              <div
                key={item.progressId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{item.stagiaireNom}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.roadmapTitre} · {t("roadmaps.semaine_label", { numero: item.semaineNumero })} ·{" "}
                    {t("roadmaps.jour_label", { jour: item.etapeJour })} — {item.etapeTitre}
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    {t("roadmaps.validation_blocked_score", {
                      score: item.quizMeilleurScore ?? 0,
                      attempts: item.quizTentatives,
                    })}
                  </Badge>
                </div>
                <Button size="sm" variant="outline" disabled={isPending} onClick={() => handleUnlock(item.progressId)}>
                  {t("roadmaps.validation_unlock_button")}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {reviewing && (
        <LivrableReviewDialog
          open={!!reviewing}
          onOpenChange={(open) => !open && setReviewing(null)}
          progressId={reviewing.progressId}
          instanceId={reviewing.instanceId}
          soumission={reviewing.soumission}
        />
      )}
    </div>
  );
}
