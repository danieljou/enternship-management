"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

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
import { createTache, updateTache, type TacheValues } from "@/lib/actions/kanban-actions";
import type { SessionTache } from "@/lib/types";

const formSchema = z.object({
  titre: z.string().min(1, "kanban.titre_required"),
  description: z.string().optional(),
});

interface KanbanCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  stagiaireId: string;
  etapeId: string;
  tache: SessionTache | null;
}

export function KanbanCardDialog({
  open,
  onOpenChange,
  sessionId,
  stagiaireId,
  etapeId,
  tache,
}: KanbanCardDialogProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!tache;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TacheValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { titre: tache?.titre ?? "", description: tache?.description ?? "" },
  });

  useEffect(() => {
    if (open) {
      reset({ titre: tache?.titre ?? "", description: tache?.description ?? "" });
    }
  }, [open, tache, reset]);

  function onSubmit(values: TacheValues) {
    startTransition(async () => {
      const result = isEditing
        ? await updateTache(tache.id, sessionId, values)
        : await createTache(sessionId, stagiaireId, etapeId, values);

      if ("error" in result) {
        toast.error(t(result.error));
        return;
      }

      toast.success(t(isEditing ? "kanban.update_success" : "kanban.create_success"));
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(isEditing ? "kanban.edit_title" : "kanban.add_title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="tache-titre">{t("kanban.titre_label")}</Label>
            <Input
              id="tache-titre"
              placeholder={t("kanban.titre_placeholder")}
              aria-invalid={!!errors.titre}
              {...register("titre")}
            />
            {errors.titre && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {t(errors.titre.message ?? "")}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tache-description">{t("kanban.description_label")}</Label>
            <Textarea
              id="tache-description"
              placeholder={t("kanban.description_placeholder")}
              {...register("description")}
            />
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
