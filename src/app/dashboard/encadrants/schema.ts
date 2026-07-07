import { z } from "zod";

export const encadrantSchema = z.object({
  nom: z.string().min(1, "encadrants.nom_required"),
  prenom: z.string().min(1, "encadrants.prenom_required"),
  email: z
    .string()
    .min(1, "encadrants.email_required")
    .pipe(z.email("encadrants.email_invalid")),
});

export type EncadrantValues = z.infer<typeof encadrantSchema>;
