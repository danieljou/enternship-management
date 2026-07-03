"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Building2,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";

import { FuturixLogo } from "@/components/futurix-logo";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    key: "stagiaires",
    icon: GraduationCap,
  },
  {
    key: "academic",
    icon: Building2,
  },
  {
    key: "dashboard",
    icon: LayoutDashboard,
  },
  {
    key: "security",
    icon: ShieldCheck,
  },
] as const;

export function LandingContent({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { t } = useTranslation();
  const ctaHref = isAuthenticated ? "/dashboard" : "/login";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <FuturixLogo />
        <div className="flex items-center gap-1.5">
          <LanguageToggle />
          <ThemeToggle />
          <Button asChild className="ml-1.5 bg-cyan-500 text-white hover:bg-cyan-400 dark:bg-cyan-400 dark:text-neutral-950 dark:hover:bg-cyan-300">
            <Link href={ctaHref}>
              {isAuthenticated ? t("landing.nav_dashboard") : t("landing.nav_login")}
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden px-6 py-20 sm:px-10 sm:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.15] dark:opacity-[0.2]"
            style={{
              backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              color: "var(--foreground)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-112 w-md -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl"
          />

          <div className="relative mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              {t("landing.hero_tagline_prefix")}{" "}
              <span className="text-cyan-600 dark:text-cyan-400">
                {t("landing.hero_tagline_highlight")}
              </span>
              .
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              {t("landing.hero_subtitle")}
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-cyan-500 text-white hover:bg-cyan-400 dark:bg-cyan-400 dark:text-neutral-950 dark:hover:bg-cyan-300"
            >
              <Link href={ctaHref}>{t("landing.hero_cta")}</Link>
            </Button>
          </div>
        </section>

        <section className="px-6 pb-20 sm:px-10">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              {t("landing.features_title")}
            </h2>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ key, icon: Icon }) => (
                <div
                  key={key}
                  className="rounded-2xl bg-card p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.25)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.7)]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-foreground">
                    {t(`landing.feature_${key}_title`)}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {t(`landing.feature_${key}_description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 py-8 text-center text-xs text-muted-foreground sm:px-10">
        © {new Date().getFullYear()} FUTURIX-iTech. {t("landing.footer")}
      </footer>
    </div>
  );
}
