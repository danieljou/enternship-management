import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "validation.email_required")
    .pipe(z.email("validation.email_invalid")),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
