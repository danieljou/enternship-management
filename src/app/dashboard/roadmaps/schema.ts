import { z } from "zod";

export const roadmapTemplateSchema = z.object({
  titre: z.string().min(1, "roadmaps.titre_required"),
  branche: z.string().min(1, "roadmaps.branche_required"),
  niveau: z.string().optional(),
  dureeSemaines: z
    .string()
    .min(1, "roadmaps.duree_required")
    .refine((value) => Number.isInteger(Number(value)) && Number(value) > 0, {
      message: "roadmaps.duree_invalid",
    }),
  version: z.string().min(1, "roadmaps.version_required"),
  note: z.string().optional(),
});

export type RoadmapTemplateValues = z.infer<typeof roadmapTemplateSchema>;

export const semaineSchema = z.object({
  titre: z.string().min(1, "roadmaps.semaine_titre_required"),
});

export type SemaineValues = z.infer<typeof semaineSchema>;

const ressourceSchema = z.object({
  type: z.enum(["documentation", "video", "api", "outil"]),
  titre: z.string().min(1),
  url: z.string().min(1),
});

const quizQuestionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("qcm_unique"),
    question: z.string().min(1),
    choix: z.array(z.string().min(1)).min(2),
    reponse_correcte: z.string().min(1),
  }),
  z.object({
    type: z.literal("vrai_faux"),
    question: z.string().min(1),
    reponse_correcte: z.boolean(),
  }),
  z.object({
    type: z.literal("qcm_multiple"),
    question: z.string().min(1),
    choix: z.array(z.string().min(1)).min(2),
    reponses_correctes: z.array(z.string().min(1)).min(1),
  }),
]);

const quizSchema = z.object({
  titre: z.string().min(1),
  score_minimum: z.number().min(0).max(100),
  tentatives_max: z.number().int().min(1),
  afficher_corrige: z.boolean(),
  questions: z.array(quizQuestionSchema).min(1),
});

export const etapeSchema = z.object({
  titre: z.string().min(1, "roadmaps.etape_titre_required"),
  objectifs: z.array(z.string().min(1)),
  cours: z.object({
    resume: z.string(),
    points_cles: z.array(z.string().min(1)),
    ressources: z.array(ressourceSchema),
  }),
  exercice: z.object({
    consigne: z.string(),
    criteres_reussite: z.array(z.string().min(1)),
  }),
  livrable_attendu: z.string(),
  quiz: quizSchema.nullable(),
});

export type EtapeValues = z.infer<typeof etapeSchema>;

export const bulkAssignRoadmapSchema = z
  .object({
    dateDebut: z.string().min(1, "roadmaps.assign_date_debut_required"),
    dateFin: z.string().min(1, "roadmaps.assign_date_fin_required"),
  })
  .refine((data) => data.dateFin >= data.dateDebut, {
    message: "roadmaps.assign_date_range_invalid",
    path: ["dateFin"],
  });

export type BulkAssignRoadmapValues = z.infer<typeof bulkAssignRoadmapSchema>;

export const livrableReviewSchema = z.object({
  decision: z.enum(["valide", "a_corriger"]),
  commentaire: z.string().optional(),
});

export type LivrableReviewValues = z.infer<typeof livrableReviewSchema>;
