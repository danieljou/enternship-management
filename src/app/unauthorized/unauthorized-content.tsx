"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { logout } from "@/app/dashboard/actions";

export function UnauthorizedContent() {
  const { t } = useTranslation();

  return (
    <div className="mt-4 flex flex-col items-center gap-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {t("unauthorized.title")}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t("unauthorized.description")}
        </p>
      </div>

      <form action={logout}>
        <Button type="submit" variant="outline">
          {t("unauthorized.logout")}
        </Button>
      </form>
    </div>
  );
}
