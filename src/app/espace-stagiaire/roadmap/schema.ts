import { z } from "zod";

export const livrableSubmitSchema = z.object({
  mode: z.enum(["lien", "texte"]),
  contenu: z.string().min(1, "roadmaps.livrable_contenu_required"),
});

export type LivrableSubmitValues = z.infer<typeof livrableSubmitSchema>;
