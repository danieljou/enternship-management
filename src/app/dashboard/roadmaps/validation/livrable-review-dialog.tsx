"use client";

import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { RoadmapLivrableSoumission } from "@/lib/types";

import { reviewLivrable } from "../actions";

export function LivrableReviewDialog({
  open,
  onOpenChange,
  progressId,
  instanceId,
  soumission,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progressId: string;
  instanceId: string;
  soumission: RoadmapLivrableSoumission | null;
}) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [commentaire, setCommentaire] = useState("");

  function submitDecision(decision: "valide" | "a_corriger") {
    startTransition(async () => {
      const result = await reviewLivrable(progressId, instanceId, { decision, commentaire });
      if ("error" in result) {
        toast.error(t(result.error));
        return;
      }
      toast.success(
        t(decision === "valide" ? "roadmaps.livrable_validated_success" : "roadmaps.livrable_rejected_success"),
      );
      setCommentaire("");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("roadmaps.livrable_review_title")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {soumission && (
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              <p className="text-xs font-medium text-muted-foreground">
                {t(soumission.mode === "lien" ? "roadmaps.livrable_mode_lien" : "roadmaps.livrable_mode_texte")}
              </p>
              <p className="mt-1 break-words text-foreground">{soumission.contenu}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="livrable-commentaire">{t("roadmaps.livrable_commentaire_label")}</Label>
            <Textarea
              id="livrable-commentaire"
              value={commentaire}
              onChange={(event) => setCommentaire(event.target.value)}
              placeholder={t("roadmaps.livrable_commentaire_placeholder")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => submitDecision("a_corriger")}
          >
            {t("roadmaps.livrable_action_a_corriger")}
          </Button>
          <Button type="button" disabled={isPending} onClick={() => submitDecision("valide")}>
            {t("roadmaps.livrable_action_valide")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
