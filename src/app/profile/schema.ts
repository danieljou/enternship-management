import { z } from "zod";

export const adminProfileSchema = z.object({
  nom: z.string().min(1, "profile.required"),
  prenom: z.string().min(1, "profile.required"),
});

export type AdminProfileValues = z.infer<typeof adminProfileSchema>;

export const stagiaireProfileSchema = z.object({
  nom: z.string().min(1, "profile.required"),
  prenom: z.string().min(1, "profile.required"),
  email: z.string().min(1, "profile.required").pipe(z.email("profile.email_invalid")),
  niveau: z.coerce.number().int().min(1).max(6),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
});

export type StagiaireProfileValues = z.infer<typeof stagiaireProfileSchema>;
