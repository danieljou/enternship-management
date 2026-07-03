"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { loginSchema, type LoginValues } from "./schema";

export type LoginResult = { error: string } | undefined;

export async function login(values: LoginValues): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "login.invalid_fields" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "login.invalid_credentials" };
  }

  redirect("/dashboard");
}
