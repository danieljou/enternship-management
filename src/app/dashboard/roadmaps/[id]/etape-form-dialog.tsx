"use client";

import { useState, useTransition } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { RoadmapEtape, RoadmapQuizQuestion, RoadmapRessourceType } from "@/lib/types";

import { createEtape, updateEtape } from "../actions";
import type { EtapeValues } from "../schema";

type QuestionType = RoadmapQuizQuestion["type"];

interface RessourceDraft {
  type: RoadmapRessourceType;
  titre: string;
  url: string;
}

interface QuestionDraft {
  type: QuestionType;
  question: string;
  choixText: string;
  reponseCorrecte: string;
  reponseCorrecteBool: boolean;
  reponsesCorrectesText: string;
}

interface EtapeDraft {
  titre: string;
  objectifsText: string;
  coursResume: string;
  coursPointsClesText: string;
  coursRessources: RessourceDraft[];
  exerciceConsigne: string;
  exerciceCriteresText: string;
  livrableAttendu: string;
  hasQuiz: boolean;
  quizTitre: string;
  quizScoreMinimum: string;
  quizTentativesMax: string;
  quizAfficherCorrige: boolean;
  quizQuestions: QuestionDraft[];
}

function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function emptyDraft(): EtapeDraft {
  return {
    titre: "",
    objectifsText: "",
    coursResume: "",
    coursPointsClesText: "",
    coursRessources: [],
    exerciceConsigne: "",
    exerciceCriteresText: "",
    livrableAttendu: "",
    hasQuiz: false,
    quizTitre: "",
    quizScoreMinimum: "70",
    quizTentativesMax: "3",
    quizAfficherCorrige: true,
    quizQuestions: [],
  };
}

function questionToDraft(question: RoadmapQuizQuestion): QuestionDraft {
  if (question.type === "qcm_unique") {
    return {
      type: "qcm_unique",
      question: question.question,
      choixText: question.choix.join("\n"),
      reponseCorrecte: question.reponse_correcte,
      reponseCorrecteBool: false,
      reponsesCorrectesText: "",
    };
  }
  if (question.type === "vrai_faux") {
    return {
      type: "vrai_faux",
      question: question.question,
      choixText: "",
      reponseCorrecte: "",
      reponseCorrecteBool: question.reponse_correcte,
      reponsesCorrectesText: "",
    };
  }
  return {
    type: "qcm_multiple",
    question: question.question,
    choixText: question.choix.join("\n"),
    reponseCorrecte: "",
    reponseCorrecteBool: false,
    reponsesCorrectesText: question.reponses_correctes.join("\n"),
  };
}

function draftFromEtape(etape: RoadmapEtape | null): EtapeDraft {
  if (!etape) return emptyDraft();
  return {
    titre: etape.titre,
    objectifsText: etape.objectifs.join("\n"),
    coursResume: etape.cours.resume,
    coursPointsClesText: etape.cours.points_cles.join("\n"),
    coursRessources: etape.cours.ressources.map((r) => ({ ...r })),
    exerciceConsigne: etape.exercice.consigne,
    exerciceCriteresText: etape.exercice.criteres_reussite.join("\n"),
    livrableAttendu: etape.livrable_attendu,
    hasQuiz: !!etape.quiz,
    quizTitre: etape.quiz?.titre ?? "",
    quizScoreMinimum: etape.quiz ? String(etape.quiz.score_minimum) : "70",
    quizTentativesMax: etape.quiz ? String(etape.quiz.tentatives_max) : "3",
    quizAfficherCorrige: etape.quiz?.afficher_corrige ?? true,
    quizQuestions: (etape.quiz?.questions ?? []).map(questionToDraft),
  };
}

function draftToQuizQuestion(draft: QuestionDraft): RoadmapQuizQuestion {
  if (draft.type === "qcm_unique") {
    return {
      type: "qcm_unique",
      question: draft.question,
      choix: splitLines(draft.choixText),
      reponse_correcte: draft.reponseCorrecte,
    };
  }
  if (draft.type === "vrai_faux") {
    return {
      type: "vrai_faux",
      question: draft.question,
      reponse_correcte: draft.reponseCorrecteBool,
    };
  }
  return {
    type: "qcm_multiple",
    question: draft.question,
    choix: splitLines(draft.choixText),
    reponses_correctes: splitLines(draft.reponsesCorrectesText),
  };
}

function toEtapeValues(draft: EtapeDraft): EtapeValues {
  return {
    titre: draft.titre,
    objectifs: splitLines(draft.objectifsText),
    cours: {
      resume: draft.coursResume,
      points_cles: splitLines(draft.coursPointsClesText),
      ressources: draft.coursRessources.filter((r) => r.titre && r.url),
    },
    exercice: {
      consigne: draft.exerciceConsigne,
      criteres_reussite: splitLines(draft.exerciceCriteresText),
    },
    livrable_attendu: draft.livrableAttendu,
    quiz: draft.hasQuiz
      ? {
          titre: draft.quizTitre,
          score_minimum: Number(draft.quizScoreMinimum) || 0,
          tentatives_max: Number(draft.quizTentativesMax) || 1,
          afficher_corrige: draft.quizAfficherCorrige,
          questions: draft.quizQuestions.map(draftToQuizQuestion),
        }
      : null,
  };
}

function RessourceEditor({
  ressource,
  onChange,
  onRemove,
  t,
}: {
  ressource: RessourceDraft;
  onChange: (value: RessourceDraft) => void;
  onRemove: () => void;
  t: TFunction;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-background/50 p-3 sm:flex-row sm:items-center">
      <Select
        value={ressource.type}
        onValueChange={(value) => onChange({ ...ressource, type: value as RoadmapRessourceType })}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="documentation">{t("roadmaps.ressource_type_documentation")}</SelectItem>
          <SelectItem value="video">{t("roadmaps.ressource_type_video")}</SelectItem>
          <SelectItem value="api">{t("roadmaps.ressource_type_api")}</SelectItem>
          <SelectItem value="outil">{t("roadmaps.ressource_type_outil")}</SelectItem>
        </SelectContent>
      </Select>
      <Input
        placeholder={t("roadmaps.ressource_titre_placeholder")}
        value={ressource.titre}
        onChange={(event) => onChange({ ...ressource, titre: event.target.value })}
      />
      <Input
        placeholder={t("roadmaps.ressource_url_placeholder")}
        value={ressource.url}
        onChange={(event) => onChange({ ...ressource, url: event.target.value })}
      />
      <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove} aria-label={t("common.delete")}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function QuestionEditor({
  index,
  question,
  onChange,
  onRemove,
  t,
}: {
  index: number;
  question: QuestionDraft;
  onChange: (value: QuestionDraft) => void;
  onRemove: () => void;
  t: TFunction;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-background/50 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          {t("roadmaps.quiz_question_label", { index: index + 1 })}
        </span>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove} aria-label={t("common.delete")}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Select
        value={question.type}
        onValueChange={(value) => onChange({ ...question, type: value as QuestionType })}
      >
        <SelectTrigger className="w-full sm:w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="qcm_unique">{t("roadmaps.question_type_qcm_unique")}</SelectItem>
          <SelectItem value="vrai_faux">{t("roadmaps.question_type_vrai_faux")}</SelectItem>
          <SelectItem value="qcm_multiple">{t("roadmaps.question_type_qcm_multiple")}</SelectItem>
        </SelectContent>
      </Select>

      <Textarea
        placeholder={t("roadmaps.question_placeholder")}
        value={question.question}
        onChange={(event) => onChange({ ...question, question: event.target.value })}
      />

      {question.type === "vrai_faux" ? (
        <div className="flex items-center gap-2">
          <Switch
            checked={question.reponseCorrecteBool}
            onCheckedChange={(checked) => onChange({ ...question, reponseCorrecteBool: checked })}
          />
          <span className="text-sm text-foreground">
            {question.reponseCorrecteBool ? t("roadmaps.true_label") : t("roadmaps.false_label")}
          </span>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{t("roadmaps.choix_label")}</Label>
            <Textarea
              placeholder={t("roadmaps.choix_placeholder")}
              value={question.choixText}
              onChange={(event) => onChange({ ...question, choixText: event.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">
              {question.type === "qcm_unique"
                ? t("roadmaps.reponse_correcte_label")
                : t("roadmaps.reponses_correctes_label")}
            </Label>
            {question.type === "qcm_unique" ? (
              <Input
                placeholder={t("roadmaps.reponse_correcte_placeholder")}
                value={question.reponseCorrecte}
                onChange={(event) => onChange({ ...question, reponseCorrecte: event.target.value })}
              />
            ) : (
              <Textarea
                placeholder={t("roadmaps.reponses_correctes_placeholder")}
                value={question.reponsesCorrectesText}
                onChange={(event) => onChange({ ...question, reponsesCorrectesText: event.target.value })}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function EtapeFormDialog({
  open,
  onOpenChange,
  roadmapId,
  semaineId,
  etape,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roadmapId: string;
  semaineId: string;
  etape: RoadmapEtape | null;
}) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!etape;
  const [draft, setDraft] = useState<EtapeDraft>(() => draftFromEtape(etape));
  const [syncedOpen, setSyncedOpen] = useState(open);

  if (open !== syncedOpen) {
    setSyncedOpen(open);
    if (open) setDraft(draftFromEtape(etape));
  }

  function onSubmit() {
    if (!draft.titre.trim()) {
      toast.error(t("roadmaps.etape_titre_required"));
      return;
    }

    const values = toEtapeValues(draft);
    startTransition(async () => {
      const result = isEditing
        ? await updateEtape(etape.id, roadmapId, values)
        : await createEtape(semaineId, roadmapId, values);

      if ("error" in result) {
        toast.error(t(result.error));
        return;
      }

      toast.success(t(isEditing ? "roadmaps.etape_update_success" : "roadmaps.etape_create_success"));
      onOpenChange(false);
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{t(isEditing ? "roadmaps.etape_edit_title" : "roadmaps.etape_add_title")}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="etape-titre">{t("roadmaps.etape_titre_label")}</Label>
            <Input
              id="etape-titre"
              placeholder={t("roadmaps.etape_titre_placeholder")}
              value={draft.titre}
              onChange={(event) => setDraft({ ...draft, titre: event.target.value })}
            />
          </div>

          <Tabs defaultValue="infos">
            <TabsList className="w-full">
              <TabsTrigger value="infos" className="flex-1">
                {t("roadmaps.etape_tab_infos")}
              </TabsTrigger>
              <TabsTrigger value="cours" className="flex-1">
                {t("roadmaps.etape_tab_cours")}
              </TabsTrigger>
              <TabsTrigger value="exercice" className="flex-1">
                {t("roadmaps.etape_tab_exercice")}
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex-1">
                {t("roadmaps.etape_tab_quiz")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="infos" className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="etape-objectifs">{t("roadmaps.objectifs_label")}</Label>
                <Textarea
                  id="etape-objectifs"
                  placeholder={t("roadmaps.objectifs_placeholder")}
                  value={draft.objectifsText}
                  onChange={(event) => setDraft({ ...draft, objectifsText: event.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="etape-livrable">{t("roadmaps.livrable_attendu_label")}</Label>
                <Textarea
                  id="etape-livrable"
                  placeholder={t("roadmaps.livrable_attendu_placeholder")}
                  value={draft.livrableAttendu}
                  onChange={(event) => setDraft({ ...draft, livrableAttendu: event.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="cours" className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="etape-cours-resume">{t("roadmaps.cours_resume_label")}</Label>
                <Textarea
                  id="etape-cours-resume"
                  value={draft.coursResume}
                  onChange={(event) => setDraft({ ...draft, coursResume: event.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="etape-cours-points-cles">{t("roadmaps.points_cles_label")}</Label>
                <Textarea
                  id="etape-cours-points-cles"
                  placeholder={t("roadmaps.points_cles_placeholder")}
                  value={draft.coursPointsClesText}
                  onChange={(event) => setDraft({ ...draft, coursPointsClesText: event.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label>{t("roadmaps.ressources_label")}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        coursRessources: [...draft.coursRessources, { type: "documentation", titre: "", url: "" }],
                      })
                    }
                  >
                    <Plus className="h-4 w-4" />
                    {t("roadmaps.add_ressource_button")}
                  </Button>
                </div>
                {draft.coursRessources.map((ressource, index) => (
                  <RessourceEditor
                    key={index}
                    ressource={ressource}
                    t={t}
                    onChange={(value) =>
                      setDraft({
                        ...draft,
                        coursRessources: draft.coursRessources.map((r, i) => (i === index ? value : r)),
                      })
                    }
                    onRemove={() =>
                      setDraft({
                        ...draft,
                        coursRessources: draft.coursRessources.filter((_, i) => i !== index),
                      })
                    }
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="exercice" className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="etape-exercice-consigne">{t("roadmaps.consigne_label")}</Label>
                <Textarea
                  id="etape-exercice-consigne"
                  value={draft.exerciceConsigne}
                  onChange={(event) => setDraft({ ...draft, exerciceConsigne: event.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="etape-exercice-criteres">{t("roadmaps.criteres_reussite_label")}</Label>
                <Textarea
                  id="etape-exercice-criteres"
                  placeholder={t("roadmaps.criteres_reussite_placeholder")}
                  value={draft.exerciceCriteresText}
                  onChange={(event) => setDraft({ ...draft, exerciceCriteresText: event.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="quiz" className="mt-4 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={draft.hasQuiz}
                  onCheckedChange={(checked) => setDraft({ ...draft, hasQuiz: checked })}
                />
                <span className="text-sm text-foreground">{t("roadmaps.quiz_enabled_label")}</span>
              </div>

              {draft.hasQuiz && (
                <>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="quiz-titre">{t("roadmaps.quiz_titre_label")}</Label>
                    <Input
                      id="quiz-titre"
                      value={draft.quizTitre}
                      onChange={(event) => setDraft({ ...draft, quizTitre: event.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="quiz-score-min">{t("roadmaps.score_minimum_label")}</Label>
                      <Input
                        id="quiz-score-min"
                        type="number"
                        min={0}
                        max={100}
                        value={draft.quizScoreMinimum}
                        onChange={(event) => setDraft({ ...draft, quizScoreMinimum: event.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="quiz-tentatives-max">{t("roadmaps.tentatives_max_label")}</Label>
                      <Input
                        id="quiz-tentatives-max"
                        type="number"
                        min={1}
                        value={draft.quizTentativesMax}
                        onChange={(event) => setDraft({ ...draft, quizTentativesMax: event.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={draft.quizAfficherCorrige}
                      onCheckedChange={(checked) =>
                        setDraft({ ...draft, quizAfficherCorrige: checked === true })
                      }
                    />
                    <span className="text-sm text-foreground">{t("roadmaps.afficher_corrige_label")}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>{t("roadmaps.questions_label")}</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          quizQuestions: [
                            ...draft.quizQuestions,
                            {
                              type: "qcm_unique",
                              question: "",
                              choixText: "",
                              reponseCorrecte: "",
                              reponseCorrecteBool: false,
                              reponsesCorrectesText: "",
                            },
                          ],
                        })
                      }
                    >
                      <Plus className="h-4 w-4" />
                      {t("roadmaps.add_question_button")}
                    </Button>
                  </div>

                  {draft.quizQuestions.map((question, index) => (
                    <QuestionEditor
                      key={index}
                      index={index}
                      question={question}
                      t={t}
                      onChange={(value) =>
                        setDraft({
                          ...draft,
                          quizQuestions: draft.quizQuestions.map((q, i) => (i === index ? value : q)),
                        })
                      }
                      onRemove={() =>
                        setDraft({
                          ...draft,
                          quizQuestions: draft.quizQuestions.filter((_, i) => i !== index),
                        })
                      }
                    />
                  ))}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter className="flex-row justify-end border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isPending}>
            {isPending ? t("common.saving") : t("common.save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
