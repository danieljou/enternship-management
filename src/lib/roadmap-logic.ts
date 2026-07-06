import type {
  RoadmapEtape,
  RoadmapEtapeState,
  RoadmapLivrableStatut,
  RoadmapProgress,
  RoadmapQuiz,
  RoadmapQuizQuestion,
  RoadmapQuizSanitized,
} from "@/lib/types";

export interface EtapeProgressLike {
  quiz_tentatives: number;
  quiz_meilleur_score: number | null;
  quiz_reussi: boolean;
  livrable_statut: RoadmapLivrableStatut;
}

export const EMPTY_ETAPE_PROGRESS: EtapeProgressLike = {
  quiz_tentatives: 0,
  quiz_meilleur_score: null,
  quiz_reussi: false,
  livrable_statut: "non_soumis",
};

/** Mirrors the reference prototype's getEtapeState(): derives a display status from quiz + livrable progress. */
export function getEtapeState(
  etape: Pick<RoadmapEtape, "quiz">,
  progress: EtapeProgressLike,
): RoadmapEtapeState {
  const quiz = etape.quiz;
  const quizOk = !quiz || progress.quiz_reussi;
  const livrableOk = progress.livrable_statut === "valide";

  if (quiz && progress.quiz_tentatives >= quiz.tentatives_max && !progress.quiz_reussi) {
    return "bloquee";
  }
  if (livrableOk && quizOk) {
    return "validee";
  }
  if (progress.quiz_tentatives > 0 || progress.livrable_statut !== "non_soumis") {
    return "en_cours";
  }
  return "a_venir";
}

function etapeDoneSelf(etape: Pick<RoadmapEtape, "quiz">, progress: EtapeProgressLike): boolean {
  const quizOk = etape.quiz === null || progress.quiz_reussi;
  const livrableSubmitted =
    progress.livrable_statut === "soumis" || progress.livrable_statut === "valide";
  return quizOk && livrableSubmitted;
}

/**
 * Linear step-locking: etape N+1 unlocks once etape N's quiz (if any) is
 * passed and its livrable has at least been submitted. `etapes` must
 * already be in week/day order.
 */
export function buildLockMap(
  etapes: Pick<RoadmapEtape, "id" | "quiz">[],
  progressByEtapeId: Map<string, EtapeProgressLike>,
): Map<string, { locked: boolean; done: boolean }> {
  const lockMap = new Map<string, { locked: boolean; done: boolean }>();
  let prevDone = true;

  for (const etape of etapes) {
    const progress = progressByEtapeId.get(etape.id) ?? EMPTY_ETAPE_PROGRESS;
    const done = etapeDoneSelf(etape, progress);
    lockMap.set(etape.id, { locked: !prevDone, done });
    prevDone = done;
  }

  return lockMap;
}

export function computeInstanceProgressPct(
  etapes: Pick<RoadmapEtape, "id" | "quiz">[],
  progressByEtapeId: Map<string, EtapeProgressLike>,
): number {
  if (etapes.length === 0) return 0;
  const validated = etapes.filter(
    (etape) => getEtapeState(etape, progressByEtapeId.get(etape.id) ?? EMPTY_ETAPE_PROGRESS) === "validee",
  ).length;
  return Math.round((validated / etapes.length) * 100);
}

function formatReponseAttendue(question: RoadmapQuizQuestion): string {
  if (question.type === "vrai_faux") {
    return question.reponse_correcte ? "Vrai" : "Faux";
  }
  if (question.type === "qcm_multiple") {
    return question.reponses_correctes.join(", ");
  }
  return question.reponse_correcte;
}

function isQuestionCorrect(question: RoadmapQuizQuestion, answer: unknown): boolean {
  switch (question.type) {
    case "qcm_unique":
      return answer === question.reponse_correcte;
    case "vrai_faux":
      return answer === question.reponse_correcte;
    case "qcm_multiple": {
      const selected = Array.isArray(answer) ? (answer as string[]) : [];
      const expected = question.reponses_correctes;
      return (
        selected.length === expected.length && expected.every((choice) => selected.includes(choice))
      );
    }
  }
}

export interface QuizGradeResult {
  score: number;
  reussi: boolean;
  corrections: { correct: boolean; reponseAttendue: string }[];
}

/** Grades a quiz attempt server-side. `answers[i]` must line up with `quiz.questions[i]`. */
export function gradeQuiz(quiz: RoadmapQuiz, answers: unknown[]): QuizGradeResult {
  let correctCount = 0;
  const corrections = quiz.questions.map((question, index) => {
    const correct = isQuestionCorrect(question, answers[index]);
    if (correct) correctCount += 1;
    return { correct, reponseAttendue: formatReponseAttendue(question) };
  });

  const score = Math.round((correctCount / quiz.questions.length) * 100);
  return { score, reussi: score >= quiz.score_minimum, corrections };
}

/** Strips correct-answer fields before sending quiz content to a stagiaire who hasn't submitted an attempt yet. */
export function sanitizeQuizForStagiaire(quiz: RoadmapQuiz): RoadmapQuizSanitized {
  return {
    titre: quiz.titre,
    score_minimum: quiz.score_minimum,
    tentatives_max: quiz.tentatives_max,
    afficher_corrige: quiz.afficher_corrige,
    questions: quiz.questions.map((question) => ({
      type: question.type,
      question: question.question,
      choix: question.type === "vrai_faux" ? undefined : question.choix,
    })),
  };
}

export function toEtapeProgressLike(progress: RoadmapProgress | undefined): EtapeProgressLike {
  if (!progress) return EMPTY_ETAPE_PROGRESS;
  return {
    quiz_tentatives: progress.quiz_tentatives,
    quiz_meilleur_score: progress.quiz_meilleur_score,
    quiz_reussi: progress.quiz_reussi,
    livrable_statut: progress.livrable_statut,
  };
}
