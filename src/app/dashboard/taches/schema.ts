import { z } from "zod";

export const tacheSchema = z.object({
  titre: z.string().min(1, "taches.titre_required"),
  description: z.string().optional(),
  statut: z.enum(["a_faire", "en_cours", "termine"], "taches.statut_required"),
  priorite: z.enum(["basse", "normale", "haute"], "taches.priorite_required"),
  echeance: z.string().optional(),
  stagiaireId: z.string().optional(),
  assignedTo: z.string().optional(),
});

export type TacheValues = z.infer<typeof tacheSchema>;
