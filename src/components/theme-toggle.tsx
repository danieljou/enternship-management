"use client";

import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useHasMounted } from "@/hooks/use-has-mounted";

export function ThemeToggle() {
  const { t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHasMounted();

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled aria-hidden>
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t("theme.toggle_light") : t("theme.toggle_dark")}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
