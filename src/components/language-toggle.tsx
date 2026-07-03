"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { LANGUAGE_STORAGE_KEY } from "@/lib/i18n";

export function LanguageToggle() {
  const { t, i18n } = useTranslation();
  const mounted = useHasMounted();

  useEffect(() => {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && stored !== i18n.language) {
      i18n.changeLanguage(stored);
    }
  }, [i18n]);

  function toggle() {
    const next = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(next);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={t("language.toggle")}
    >
      <Languages className="h-4 w-4" />
      <span className="sr-only">{mounted ? i18n.language : "fr"}</span>
    </Button>
  );
}
