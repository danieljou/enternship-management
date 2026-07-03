"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function StagiaireCreatedToast() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("created") === "1") {
      toast.success(t("stagiaires.create_success"));
      router.replace("/dashboard/stagiaires");
    }
  }, [searchParams, router, t]);

  return null;
}
