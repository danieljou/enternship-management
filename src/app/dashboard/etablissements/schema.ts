import { z } from "zod";

export const etablissementSchema = z.object({
  nom: z.string().min(1, "etablissements.nom_required"),
});

export type EtablissementValues = z.infer<typeof etablissementSchema>;
