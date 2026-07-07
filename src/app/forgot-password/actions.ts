"use server";

import { createClient } from "@/lib/supabase/server";

import { forgotPasswordSchema, type ForgotPasswordValues } from "./schema";

export type ActionResult = { error: string } | { success: true };

export async function requestPasswordReset(values: ForgotPasswordValues): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "validation.email_invalid" };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Always report success regardless of the outcome so we don't leak which
  // email addresses have an account.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/reset-password`,
  });

  return { success: true };
}
