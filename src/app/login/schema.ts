import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "validation.email_required")
    .pipe(z.email("validation.email_invalid")),
  password: z
    .string()
    .min(1, "validation.password_required")
    .min(6, "validation.password_min"),
});

export type LoginValues = z.infer<typeof loginSchema>;
