"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Evaluation } from "@/lib/types";

import { createEvaluation, updateEvaluation } from "../actions";
import { evaluationSchema, type EvaluationValues } from "../schema";

interface EvaluationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  stagiaireId: string;
  evaluation: Evaluation | null;
}

export function EvaluationFormDialog({
  open,
  onOpenChange,
  sessionId,
  stagiaireId,
  evaluation,
}: EvaluationFormDialogProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!evaluation;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EvaluationValues>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      note: evaluation ? String(evaluation.note) : "",
      commentaire: evaluation?.commentaire ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        note: evaluation ? String(evaluation.note) : "",
        commentaire: evaluation?.commentaire ?? "",
      });
    }
  }, [open, evaluation, reset]);

  function onSubmit(values: EvaluationValues) {
    startTransition(async () => {
      const result = isEditing
        ? await updateEvaluation(evaluation.id, sessionId, values)
        : await createEvaluation(sessionId, stagiaireId, values);

      if ("error" in result) {
        toast.error(t(result.error));
        return;
      }

      toast.success(
        t(isEditing ? "sessions.evaluation_update_success" : "sessions.evaluation_create_success")
      );
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t(isEditing ? "sessions.evaluation_edit_title" : "sessions.evaluation_add_title")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="evaluation-note">{t("sessions.evaluation_note_label")}</Label>
            <Input
              id="evaluation-note"
              type="number"
              min={0}
              max={20}
              step={0.5}
              placeholder="15"
              aria-invalid={!!errors.note}
              {...register("note")}
            />
            {errors.note && (
              <p className="text-xs text-red-600 dark:text-red-400">{t(errors.note.message ?? "")}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="evaluation-commentaire">
              {t("sessions.evaluation_commentaire_label")}
            </Label>
            <Textarea id="evaluation-commentaire" {...register("commentaire")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
