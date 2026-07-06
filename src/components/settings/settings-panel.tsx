"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import {
  Bell,
  BellRing,
  Clock,
  Info,
  Monitor,
  Moon,
  RotateCcw,
  Sparkles,
  Sun,
} from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { LANGUAGE_STORAGE_KEY } from "@/lib/i18n";

const THEME_OPTIONS = [
  { value: "light", labelKey: "settings.theme_light", Icon: Sun },
  { value: "dark", labelKey: "settings.theme_dark", Icon: Moon },
  { value: "system", labelKey: "settings.theme_system", Icon: Monitor },
] as const;

const LANGUAGE_OPTIONS = [
  { value: "fr", labelKey: "settings.language_fr" },
  { value: "en", labelKey: "settings.language_en" },
] as const;

const DENSITY_OPTIONS = [
  { value: "comfortable", labelKey: "settings.density_comfortable" },
  { value: "compact", labelKey: "settings.density_compact" },
] as const;

const SETTINGS_STORAGE_KEY = "futurix-ui-settings";

interface UiSettings {
  density: "comfortable" | "compact";
  reduceMotion: boolean;
}

const DEFAULT_SETTINGS: UiSettings = {
  density: "comfortable",
  reduceMotion: false,
};

export function SettingsPanel() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const mounted = useHasMounted();

  const [activeTheme, setActiveTheme] = useState<string>("system");
  const [activeLanguage, setActiveLanguage] = useState<string>("fr");
  const [uiSettings, setUiSettings] = useState<UiSettings>(DEFAULT_SETTINGS);
  const [pushPermission, setPushPermission] = useState<
    NotificationPermission | "unsupported" | null
  >(null);

  useEffect(() => {
    if (!mounted) return;
    if (theme) setActiveTheme(theme);
    if (i18n.language) setActiveLanguage(i18n.language);

    try {
      const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) setUiSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
    } catch {
      /* ignore malformed storage */
    }

    if (typeof window !== "undefined" && "Notification" in window) {
      setPushPermission(Notification.permission);
    } else {
      setPushPermission("unsupported");
    }
  }, [mounted, theme, i18n.language]);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.dataset.density = uiSettings.density;
    document.documentElement.dataset.reduceMotion = String(uiSettings.reduceMotion);
  }, [mounted, uiSettings]);

  function persist(next: UiSettings) {
    setUiSettings(next);
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    toast.success(t("settings.saved"));
  }

  function handleThemeChange(value: string) {
    setActiveTheme(value);
    setTheme(value);
    toast.success(t("settings.saved"));
  }

  function handleLanguageChange(value: string) {
    setActiveLanguage(value);
    i18n.changeLanguage(value);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
    toast.success(t("settings.saved"));
  }

  function toggleReduceMotion(checked: boolean) {
    persist({ ...uiSettings, reduceMotion: checked });
  }

  function setDensity(value: "comfortable" | "compact") {
    persist({ ...uiSettings, density: value });
  }

  async function handleEnablePush() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPushPermission(result);
    if (result === "granted") {
      toast.success(t("topbar.notifications_push_granted"));
    } else if (result === "denied") {
      toast.error(t("topbar.notifications_push_denied"));
    }
  }

  function handleReset() {
    try {
      window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
      window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setTheme("system");
    setUiSettings(DEFAULT_SETTINGS);
    toast.success(t("settings.saved"));
  }

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("settings.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.appearance")}</CardTitle>
          <CardDescription>{t("settings.appearance_description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-medium text-foreground">{t("settings.theme")}</Label>
            <RadioGroup
              value={activeTheme}
              onValueChange={handleThemeChange}
              className="grid-cols-1 sm:grid-cols-3"
            >
              {THEME_OPTIONS.map(({ value, labelKey, Icon }) => (
                <Label
                  key={value}
                  htmlFor={`theme-${value}`}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border bg-background p-4 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5"
                >
                  <RadioGroupItem id={`theme-${value}`} value={value} />
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{t(labelKey)}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-medium text-foreground">{t("settings.language")}</Label>
            <RadioGroup
              value={activeLanguage}
              onValueChange={handleLanguageChange}
              className="grid-cols-1 sm:grid-cols-2"
            >
              {LANGUAGE_OPTIONS.map(({ value, labelKey }) => (
                <Label
                  key={value}
                  htmlFor={`lang-${value}`}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border bg-background p-4 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5"
                >
                  <RadioGroupItem id={`lang-${value}`} value={value} />
                  <span className="text-sm text-foreground">{t(labelKey)}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.notifications")}</CardTitle>
          <CardDescription>{t("settings.notifications_description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 rounded-xl border bg-background p-4">
            <div className="flex items-start gap-3">
              <Bell className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  {t("settings.notifications_push")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("settings.notifications_push_description")}
                </span>
              </div>
            </div>
            {pushPermission === "unsupported" ? (
              <span className="text-xs text-muted-foreground">
                {t("settings.notifications_unsupported")}
              </span>
            ) : pushPermission === "granted" ? (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {t("settings.notifications_enabled")}
              </span>
            ) : pushPermission === "denied" ? (
              <span className="text-xs font-medium text-red-600 dark:text-red-400">
                {t("settings.notifications_disabled")}
              </span>
            ) : (
              <Button type="button" size="sm" variant="outline" onClick={handleEnablePush}>
                <BellRing className="h-4 w-4" />
                {t("settings.notifications_enable")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.density")}</CardTitle>
          <CardDescription>{t("settings.density_description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <RadioGroup
              value={uiSettings.density}
              onValueChange={(value) => setDensity(value as "comfortable" | "compact")}
              className="grid-cols-1 sm:grid-cols-2"
            >
              {DENSITY_OPTIONS.map(({ value, labelKey }) => (
                <Label
                  key={value}
                  htmlFor={`density-${value}`}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border bg-background p-4 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5"
                >
                  <RadioGroupItem id={`density-${value}`} value={value} />
                  <span className="text-sm text-foreground">{t(labelKey)}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border bg-background p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  {t("settings.reduce_motion")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("settings.reduce_motion_description")}
                </span>
              </div>
            </div>
            <Switch
              checked={uiSettings.reduceMotion}
              onCheckedChange={toggleReduceMotion}
              aria-label={t("settings.reduce_motion")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.about")}</CardTitle>
          <CardDescription>{t("settings.about_description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-xl border bg-background p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Info className="h-5 w-5" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                {t("settings.about_app_name")}
              </span>
              <span className="text-xs text-muted-foreground">{t("settings.about_org")}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("settings.about_version")}</span>
            <span className="font-medium text-foreground">1.0.0</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-start gap-3">
            <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">{t("settings.reset")}</span>
              <span className="text-xs text-muted-foreground">{t("settings.reset_confirm")}</span>
            </div>
          </div>
          <Button type="button" variant="outline" onClick={handleReset}>
            {t("settings.reset")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
