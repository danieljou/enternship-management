"use client";

import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, HelpCircle, Target, Timer, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { EtapeProgressLike } from "@/lib/roadmap-logic";
import type { RoadmapQuizSanitized } from "@/lib/types";

import { submitQuizAttempt } from "../../../actions";

type Phase = "intro" | "passation" | "resultat";

interface ResultState {
  score: number;
  reussi: boolean;
  corrections: { correct: boolean; reponseAttendue: string }[] | null;
}

export function QuizTab({
  instanceId,
  etapeId,
  quiz,
  progress,
}: {
  instanceId: string;
  etapeId: string;
  quiz: RoadmapQuizSanitized;
  progress: EtapeProgressLike;
}) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<unknown[]>(() => quiz.questions.map(() => undefined));
  const [result, setResult] = useState<ResultState | null>(null);

  const attemptsLeft = quiz.tentatives_max - progress.quiz_tentatives;
  const canAttempt = progress.quiz_reussi || attemptsLeft > 0;
  const answeredCount = answers.filter((answer, index) => {
    const question = quiz.questions[index];
    if (question.type === "qcm_multiple") return Array.isArray(answer) && answer.length > 0;
    return answer !== undefined;
  }).length;
  const allAnswered = answeredCount === quiz.questions.length;

  function startAttempt() {
    setAnswers(quiz.questions.map(() => undefined));
    setResult(null);
    setPhase("passation");
  }

  function submit() {
    startTransition(async () => {
      const response = await submitQuizAttempt(instanceId, etapeId, answers);
      if ("error" in response) {
        toast.error(t(response.error));
        return;
      }
      setResult({ score: response.score, reussi: response.reussi, corrections: response.corrections });
      setPhase("resultat");
    });
  }

  if (phase === "passation") {
    return (
      <div className="flex flex-col gap-5">
        <div className="rounded-xl border bg-card px-4 py-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">
              {t("roadmaps.quiz_question_progress", {
                answered: answeredCount,
                total: quiz.questions.length,
              })}
            </span>
            <span className="text-muted-foreground">{quiz.titre}</span>
          </div>
          <Progress value={(answeredCount / quiz.questions.length) * 100} className="mt-2" />
        </div>

        {quiz.questions.map((question, index) => (
          <div key={index} className="rounded-xl border bg-card p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <p className="text-sm font-medium text-foreground">{question.question}</p>
            </div>

            <div className="mt-3 pl-9">
              {question.type === "vrai_faux" ? (
                <RadioGroup
                  value={answers[index] === true ? "true" : answers[index] === false ? "false" : undefined}
                  onValueChange={(value) =>
                    setAnswers((prev) => prev.map((a, i) => (i === index ? value === "true" : a)))
                  }
                  className="flex gap-4"
                >
                  <Label className="flex items-center gap-2 text-sm font-normal text-foreground">
                    <RadioGroupItem value="true" />
                    {t("roadmaps.true_label")}
                  </Label>
                  <Label className="flex items-center gap-2 text-sm font-normal text-foreground">
                    <RadioGroupItem value="false" />
                    {t("roadmaps.false_label")}
                  </Label>
                </RadioGroup>
              ) : question.type === "qcm_unique" ? (
                <RadioGroup
                  value={typeof answers[index] === "string" ? (answers[index] as string) : undefined}
                  onValueChange={(value) => setAnswers((prev) => prev.map((a, i) => (i === index ? value : a)))}
                  className="flex flex-col gap-2"
                >
                  {(question.choix ?? []).map((choix) => (
                    <Label
                      key={choix}
                      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-normal text-foreground transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/[0.04]"
                    >
                      <RadioGroupItem value={choix} />
                      {choix}
                    </Label>
                  ))}
                </RadioGroup>
              ) : (
                <div className="flex flex-col gap-2">
                  {(question.choix ?? []).map((choix) => {
                    const selected = Array.isArray(answers[index]) ? (answers[index] as string[]) : [];
                    return (
                      <Label
                        key={choix}
                        className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-normal text-foreground transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/[0.04]"
                      >
                        <Checkbox
                          checked={selected.includes(choix)}
                          onCheckedChange={(checked) =>
                            setAnswers((prev) =>
                              prev.map((a, i) => {
                                if (i !== index) return a;
                                const current = Array.isArray(a) ? (a as string[]) : [];
                                return checked ? [...current, choix] : current.filter((c) => c !== choix);
                              }),
                            )
                          }
                        />
                        {choix}
                      </Label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        <Button type="button" onClick={submit} disabled={!allAnswered || isPending} className="self-start">
          {isPending ? t("common.saving") : t("roadmaps.quiz_submit_button")}
        </Button>
      </div>
    );
  }

  if (phase === "resultat" && result) {
    const corrections = result.corrections;
    return (
      <div className="flex flex-col gap-5">
        <div
          className={cn(
            "flex items-center gap-4 rounded-2xl border p-5",
            result.reussi
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-red-500/30 bg-red-500/10",
          )}
        >
          {result.reussi ? (
            <CheckCircle2 className="h-9 w-9 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <XCircle className="h-9 w-9 shrink-0 text-red-600 dark:text-red-400" />
          )}
          <div>
            <p
              className={cn(
                "text-2xl font-semibold tracking-tight",
                result.reussi
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-red-700 dark:text-red-400",
              )}
            >
              {result.score}%
            </p>
            <p className="text-sm text-muted-foreground">
              {t(result.reussi ? "roadmaps.quiz_result_success" : "roadmaps.quiz_result_failure", {
                score: result.score,
                minimum: quiz.score_minimum,
              })}
            </p>
          </div>
        </div>

        {corrections && (
          <div className="flex flex-col gap-2">
            {corrections.map((correction, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 rounded-xl border bg-card p-3.5 text-sm",
                  correction.correct ? "border-emerald-500/20" : "border-red-500/20",
                )}
              >
                {correction.correct ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                )}
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {index + 1}. {quiz.questions[index].question}
                  </p>
                  {!correction.correct && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("roadmaps.correction_expected")}: {correction.reponseAttendue}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {(result.reussi || quiz.tentatives_max - progress.quiz_tentatives > 0) && (
          <Button type="button" variant="outline" onClick={startAttempt} className="self-start">
            {t("roadmaps.quiz_retry_button")}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl border bg-card p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <HelpCircle className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-foreground">{quiz.titre}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t("roadmaps.quiz_intro_description", {
              minimum: quiz.score_minimum,
              attempts: quiz.tentatives_max,
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-xl border bg-background/50 px-3.5 py-2.5">
          <Target className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold text-foreground">{quiz.score_minimum}%</p>
            <p className="text-[11px] text-muted-foreground">{t("roadmaps.score_minimum_label")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border bg-background/50 px-3.5 py-2.5">
          <Timer className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {progress.quiz_tentatives}/{quiz.tentatives_max}
            </p>
            <p className="text-[11px] text-muted-foreground">{t("roadmaps.tentatives_max_label")}</p>
          </div>
        </div>
        {progress.quiz_tentatives > 0 && (
          <div className="flex items-center gap-2 rounded-xl border bg-background/50 px-3.5 py-2.5">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">{progress.quiz_meilleur_score ?? 0}%</p>
              <p className="text-[11px] text-muted-foreground">{t("roadmaps.quiz_best_score_label")}</p>
            </div>
          </div>
        )}
      </div>

      {canAttempt ? (
        <Button type="button" onClick={startAttempt} className="self-start">
          {progress.quiz_tentatives > 0 ? t("roadmaps.quiz_retry_button") : t("roadmaps.quiz_start_button")}
        </Button>
      ) : (
        <p className="text-sm text-red-600 dark:text-red-400">{t("roadmaps.quiz_no_attempts_left")}</p>
      )}
    </div>
  );
}
