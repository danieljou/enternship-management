"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { login } from "./actions";
import { loginSchema, type LoginValues } from "./schema";

export function LoginForm() {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginValues) {
    setServerError(null);
    startTransition(async () => {
      const result = await login(values);
      if (result?.error) setServerError(result.error);
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">{t("login.email_label")}</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder={t("login.email_placeholder")}
            autoComplete="email"
            className="pl-11"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {t(errors.email.message ?? "")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t("login.password_label")}</Label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-cyan-600 transition-colors hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            {t("login.forgot_password")}
          </Link>
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            className="px-11"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label={
              showPassword ? t("login.hide_password") : t("login.show_password")
            }
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {t(errors.password.message ?? "")}
          </p>
        )}
      </div>

      <div
        role="alert"
        className={cn(
          "-mt-1 rounded-lg bg-red-500/10 px-3.5 py-2.5 text-sm text-red-600 transition-all dark:text-red-400",
          serverError ? "opacity-100" : "hidden opacity-0"
        )}
      >
        {serverError ? t(serverError) : null}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="mt-2 w-full bg-cyan-500 text-white hover:bg-cyan-400 dark:bg-cyan-400 dark:text-neutral-950 dark:hover:bg-cyan-300"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("login.submitting")}
          </>
        ) : (
          t("login.submit")
        )}
      </Button>
    </form>
  );
}
