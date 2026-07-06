"use client";

import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock3, FileCheck2, Link2, RotateCcw, Type } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { RoadmapLivrableMode, RoadmapLivrableSoumission, RoadmapLivrableStatut } from "@/lib/types";

import { submitLivrable } from "../../../actions";

const STATUT_BADGE_CLASSES: Record<RoadmapLivrableStatut, string> = {
  non_soumis: "bg-muted text-muted-foreground",
  soumis: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  valide: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  a_corriger: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const STATUT_DOT_CLASSES: Record<RoadmapLivrableStatut, string> = {
  non_soumis: "border-2 border-border bg-muted",
  soumis: "border-2 border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  valide: "border-2 border-emerald-500 bg-emerald-500 text-white",
  a_corriger: "border-2 border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

function StatutDotIcon({ statut }: { statut: RoadmapLivrableStatut }) {
  if (statut === "valide") return <CheckCircle2 className="h-4 w-4" />;
  if (statut === "a_corriger") return <RotateCcw className="h-3.5 w-3.5" />;
  if (statut === "soumis") return <Clock3 className="h-3.5 w-3.5" />;
  return null;
}

export function LivrableTab({
  instanceId,
  etapeId,
  livrableAttendu,
  statut,
  soumissions,
}: {
  instanceId: string;
  etapeId: string;
  livrableAttendu: string;
  statut: RoadmapLivrableStatut;
  soumissions: RoadmapLivrableSoumission[];
}) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<RoadmapLivrableMode>("lien");
  const [contenu, setContenu] = useState("");

  const canSubmit = statut === "non_soumis" || statut === "a_corriger";

  function submit() {
    if (!contenu.trim()) {
      toast.error(t("roadmaps.livrable_contenu_required"));
      return;
    }
    startTransition(async () => {
      const result = await submitLivrable(instanceId, etapeId, { mode, contenu });
      if ("error" in result) {
        toast.error(t(result.error));
        return;
      }
      toast.success(t("roadmaps.livrable_submit_success"));
      setContenu("");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {livrableAttendu && (
        <div className="rounded-xl border-l-4 border-sky-500 bg-sky-500/[0.04] p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileCheck2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            {t("roadmaps.livrable_attendu_label")}
          </h3>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-foreground">{livrableAttendu}</p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t("roadmaps.livrable_statut_label")}:</span>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
            STATUT_BADGE_CLASSES[statut],
          )}
        >
          {t(`stagiaireRoadmap.livrable_statut_${statut}`)}
        </span>
      </div>

      {canSubmit && (
        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-5">
          <div className="inline-flex w-fit rounded-lg border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setMode("lien")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                mode === "lien" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Link2 className="h-3.5 w-3.5" />
              {t("roadmaps.livrable_mode_lien")}
            </button>
            <button
              type="button"
              onClick={() => setMode("texte")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                mode === "texte" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Type className="h-3.5 w-3.5" />
              {t("roadmaps.livrable_mode_texte")}
            </button>
          </div>

          <Textarea
            placeholder={
              mode === "lien" ? t("roadmaps.livrable_lien_placeholder") : t("roadmaps.livrable_texte_placeholder")
            }
            value={contenu}
            onChange={(event) => setContenu(event.target.value)}
          />

          <Button type="button" onClick={submit} disabled={isPending} className="self-start">
            {isPending ? t("common.saving") : t("roadmaps.livrable_submit_button")}
          </Button>
        </div>
      )}

      {soumissions.length > 0 && (
        <div className="flex flex-col gap-1">
          <h3 className="mb-2 text-sm font-semibold text-foreground">{t("roadmaps.livrable_history_title")}</h3>
          {soumissions.map((soumission, index) => {
            const isLast = index === soumissions.length - 1;
            return (
              <div key={soumission.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      STATUT_DOT_CLASSES[soumission.statut],
                    )}
                  >
                    <StatutDotIcon statut={soumission.statut} />
                  </span>
                  {!isLast && <div className="my-1 w-0.5 flex-1 bg-border" />}
                </div>
                <div className={cn("min-w-0 flex-1 rounded-xl border bg-card px-4 py-3 text-sm", !isLast && "mb-4")}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                        STATUT_BADGE_CLASSES[soumission.statut],
                      )}
                    >
                      {t(`stagiaireRoadmap.livrable_statut_${soumission.statut}`)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(soumission.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 break-words text-foreground">{soumission.contenu}</p>
                  {soumission.commentaire && (
                    <p className="mt-2 rounded-lg bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground">
                      {t("roadmaps.livrable_commentaire_label")}: {soumission.commentaire}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
