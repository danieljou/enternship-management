"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const newPasswordSchema = (namespace: string) =>
  z
    .object({
      password: z
        .string()
        .min(1, `${namespace}.password_required`)
        .min(6, `${namespace}.password_min`),
      confirmPassword: z.string().min(1, `${namespace}.password_required`),
    })
    .refine((values) => values.password === values.confirmPassword, {
      message: `${namespace}.mismatch`,
      path: ["confirmPassword"],
    });

type NewPasswordValues = z.infer<ReturnType<typeof newPasswordSchema>>;

interface NewPasswordFormProps {
  namespace: "setPassword" | "resetPassword";
}

export function NewPasswordForm({ namespace }: NewPasswordFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema(namespace)),
    defaultValues: { password: "", confirmPassword: "" },
  });

  function onSubmit(values: NewPasswordValues) {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: values.password });

      if (error) {
        toast.error(t(`${namespace}.invalid_link`));
        return;
      }

      await supabase.auth.signOut();
      toast.success(t(`${namespace}.success`));
      router.push("/login");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">{t(`${namespace}.password_label`)}</Label>
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
        <Label htmlFor="confirmPassword">{t(`${namespace}.confirm_password_label`)}</Label>
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
            {t(`${namespace}.submitting`)}
          </>
        ) : (
          t(`${namespace}.submit`)
        )}
      </Button>
    </form>
  );
}
