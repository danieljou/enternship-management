"use client";

import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import {
  FileCheck2,
  HelpCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RoadmapEtape, RoadmapSemaineWithEtapes } from "@/lib/types";

import { deleteEtape, deleteSemaine } from "../actions";
import { EtapeFormDialog } from "./etape-form-dialog";
import { SemaineFormDialog } from "./semaine-form-dialog";

export function RoadmapContentTab({
  roadmapId,
  semaines,
}: {
  roadmapId: string;
  semaines: RoadmapSemaineWithEtapes[];
}) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const [semaineFormOpen, setSemaineFormOpen] = useState(false);
  const [editingSemaine, setEditingSemaine] =
    useState<RoadmapSemaineWithEtapes | null>(null);
  const [deletingSemaine, setDeletingSemaine] =
    useState<RoadmapSemaineWithEtapes | null>(null);

  const [etapeFormOpen, setEtapeFormOpen] = useState(false);
  const [etapeSemaineId, setEtapeSemaineId] = useState<string | null>(null);
  const [editingEtape, setEditingEtape] = useState<RoadmapEtape | null>(null);
  const [deletingEtape, setDeletingEtape] = useState<RoadmapEtape | null>(null);

  function confirmDeleteSemaine() {
    if (!deletingSemaine) return;
    const target = deletingSemaine;
    startTransition(async () => {
      const result = await deleteSemaine(target.id, roadmapId);
      if ("error" in result) toast.error(t(result.error));
      else toast.success(t("roadmaps.semaine_delete_success"));
      setDeletingSemaine(null);
    });
  }

  function confirmDeleteEtape() {
    if (!deletingEtape) return;
    const target = deletingEtape;
    startTransition(async () => {
      const result = await deleteEtape(target.id, roadmapId);
      if ("error" in result) toast.error(t(result.error));
      else toast.success(t("roadmaps.etape_delete_success"));
      setDeletingEtape(null);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditingSemaine(null);
            setSemaineFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          {t("roadmaps.add_semaine_button")}
        </Button>
      </div>

      {semaines.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          {t("roadmaps.semaines_empty")}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {semaines.map((semaine) => (
            <div
              key={semaine.id}
              className="overflow-hidden rounded-2xl border bg-card shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.7)]"
            >
              <Accordion type="single" collapsible defaultValue={semaine.id}>
                <AccordionItem value={semaine.id} className="border-b-0">
                  <div className="flex items-center gap-2 pr-3 pl-5">
                    <AccordionTrigger className="flex-1 py-4 hover:no-underline">
                      <div className="flex min-w-0 flex-wrap items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {semaine.numero}
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {semaine.titre}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t("roadmaps.etapes_count", {
                            count: semaine.etapes.length,
                          })}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t("common.edit")}
                        onClick={() => {
                          setEditingSemaine(semaine);
                          setSemaineFormOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t("common.delete")}
                        onClick={() => setDeletingSemaine(semaine)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <AccordionContent className="px-5">
                    <div className="flex flex-col gap-2 pb-2">
                      {semaine.etapes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          {t("roadmaps.etapes_empty")}
                        </p>
                      ) : (
                        semaine.etapes.map((etape) => (
                          <div
                            key={etape.id}
                            className="flex items-center gap-3 rounded-xl border bg-background/50 px-3.5 py-3 transition-colors hover:border-primary/30 hover:bg-accent/40"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                              J{etape.jour}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">
                                {etape.titre}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {etape.quiz && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-600 dark:text-violet-400">
                                    <HelpCircle className="h-3 w-3" />
                                    {t("roadmaps.badge_quiz")} ·{" "}
                                    {etape.quiz.questions.length}
                                  </span>
                                )}
                                {etape.livrable_attendu && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-600 dark:text-sky-400">
                                    <FileCheck2 className="h-3 w-3" />
                                    {t("roadmaps.badge_livrable")}
                                  </span>
                                )}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label={t("common.actions")}
                                  className="shrink-0"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onSelect={() => {
                                    setEtapeSemaineId(semaine.id);
                                    setEditingEtape(etape);
                                    setEtapeFormOpen(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                  {t("common.edit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onSelect={() => setDeletingEtape(etape)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  {t("common.delete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-1 self-start"
                        onClick={() => {
                          setEtapeSemaineId(semaine.id);
                          setEditingEtape(null);
                          setEtapeFormOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        {t("roadmaps.add_etape_button")}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ))}
        </div>
      )}

      <SemaineFormDialog
        open={semaineFormOpen}
        onOpenChange={setSemaineFormOpen}
        roadmapId={roadmapId}
        semaine={editingSemaine}
      />

      {etapeSemaineId && (
        <EtapeFormDialog
          open={etapeFormOpen}
          onOpenChange={setEtapeFormOpen}
          roadmapId={roadmapId}
          semaineId={etapeSemaineId}
          etape={editingEtape}
        />
      )}

      <AlertDialog
        open={!!deletingSemaine}
        onOpenChange={(open) => !open && setDeletingSemaine(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("common.delete_confirm_title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("roadmaps.semaine_delete_confirm_description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSemaine}
              disabled={isPending}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deletingEtape}
        onOpenChange={(open) => !open && setDeletingEtape(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("common.delete_confirm_title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("roadmaps.etape_delete_confirm_description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEtape}
              disabled={isPending}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
