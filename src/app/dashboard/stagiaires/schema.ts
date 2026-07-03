import { z } from "zod";

export const stagiaireSchema = z.object({
  nom: z.string().min(1, "stagiaires.nom_required"),
  prenom: z.string().min(1, "stagiaires.prenom_required"),
  email: z
    .string()
    .min(1, "stagiaires.email_required")
    .pipe(z.email("stagiaires.email_invalid")),
  niveau: z.enum(["1", "2", "3", "4", "5"], "stagiaires.niveau_required"),
  etablissementId: z.string().min(1, "stagiaires.etablissement_required"),
  filiereId: z.string().min(1, "stagiaires.filiere_required"),
  section: z.enum(["francophone", "anglophone"], "stagiaires.section_required"),
});

export type StagiaireValues = z.infer<typeof stagiaireSchema>;
