import { z } from "zod";

export const sessionSchema = z
  .object({
    nom: z.string().min(1, "sessions.nom_required"),
    description: z.string().optional(),
    dateDebut: z.string().optional(),
    dateFin: z.string().optional(),
  })
  .refine((data) => !data.dateDebut || !data.dateFin || data.dateFin >= data.dateDebut, {
    message: "sessions.date_range_invalid",
    path: ["dateFin"],
  });

export type SessionValues = z.infer<typeof sessionSchema>;

export const etapeSchema = z.object({
  nom: z.string().min(1, "sessions.etape_nom_required"),
  description: z.string().optional(),
  couleur: z.string().min(1),
  icone: z.string().min(1),
});

export type EtapeValues = z.infer<typeof etapeSchema>;

export const evaluationSchema = z.object({
  note: z
    .string()
    .min(1, "sessions.evaluation_note_required")
    .refine((value) => {
      const parsed = Number(value);
      return !Number.isNaN(parsed) && parsed >= 0 && parsed <= 20;
    }, "sessions.evaluation_note_invalid"),
  commentaire: z.string().optional(),
});

export type EvaluationValues = z.infer<typeof evaluationSchema>;

export const documentSchema = z.object({
  titre: z.string().min(1, "sessions.document_titre_required"),
  description: z.string().optional(),
});

export type DocumentValues = z.infer<typeof documentSchema>;
