import { z } from "zod";

export const filiereSchema = z.object({
  nom: z.string().min(1, "filieres.nom_required"),
});

export type FiliereValues = z.infer<typeof filiereSchema>;
