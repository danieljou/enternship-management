"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { FuturixLogo } from "@/components/futurix-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "setPassword.password_required")
      .min(6, "setPassword.password_min"),
    confirmPassword: z.string().min(1, "setPassword.password_required"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "setPassword.mismatch",
    path: ["confirmPassword"],
  });

type SetPasswordValues = z.infer<typeof setPasswordSchema>;

export default function SetPasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  function onSubmit(values: SetPasswordValues) {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: values.password });

      if (error) {
        toast.error(t("setPassword.invalid_link"));
        return;
      }

      await supabase.auth.signOut();
      toast.success(t("setPassword.success"));
      router.push("/login");
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center">
          <FuturixLogo />
        </div>

        <div className="rounded-2xl bg-card p-8 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_24px_60px_-24px_rgba(0,0,0,0.25)] sm:p-10 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_24px_60px_-24px_rgba(0,0,0,0.7)]">
          <div className="mb-8 text-center">
            <h1 className="text-xl font-semibold text-foreground">{t("setPassword.title")}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {t("setPassword.description")}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">{t("setPassword.password_label")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {t(errors.password.message ?? "")}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">
                {t("setPassword.confirm_password_label")}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {t(errors.confirmPassword.message ?? "")}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isPending} className="mt-2 w-full">
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("setPassword.submitting")}
                </>
              ) : (
                t("setPassword.submit")
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
