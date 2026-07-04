"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Building2,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { FuturixLogo } from "@/components/futurix-logo";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FEATURES = [
  { key: "stagiaires", icon: GraduationCap, span: true },
  { key: "academic", icon: Building2, span: false },
  { key: "dashboard", icon: LayoutDashboard, span: false },
  { key: "security", icon: ShieldCheck, span: false },
] as const;

const PREVIEW_COLUMNS = [
  { key: "preview_column_todo", count: 2 },
  { key: "preview_column_progress", count: 3 },
  { key: "preview_column_done", count: 1 },
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
          <Button asChild className="ml-1.5">
            <Link href={ctaHref}>
              {isAuthenticated ? t("landing.nav_dashboard") : t("landing.nav_login")}
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden px-6 pt-16 pb-24 sm:px-10 sm:pt-20 sm:pb-32">
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
            className="pointer-events-none absolute -top-32 left-1/2 h-125 w-175 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-40 -right-24 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl"
          />

          <div className="relative mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-xs backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {t("landing.hero_badge")}
            </div>

            <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-6xl">
              {t("landing.hero_tagline_prefix")}{" "}
              <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                {t("landing.hero_tagline_highlight")}
              </span>
              .
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("landing.hero_subtitle")}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href={ctaHref}>
                  {t("landing.hero_cta")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="#features">{t("landing.hero_secondary_cta")}</Link>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto mt-16 max-w-4xl">
            <div className="rounded-2xl border border-border/70 bg-card/90 p-3 shadow-2xl shadow-primary/10 backdrop-blur sm:p-4">
              <div className="flex items-center gap-1.5 px-2 pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
              </div>
              <div className="grid grid-cols-1 gap-3 rounded-xl bg-muted/40 p-3 sm:grid-cols-3 sm:p-4">
                {PREVIEW_COLUMNS.map(({ key, count }) => (
                  <div key={key} className="flex flex-col gap-2 rounded-lg bg-card/80 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">{t(`landing.${key}`)}</span>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                        {count}
                      </span>
                    </div>
                    {Array.from({ length: count }).map((_, index) => (
                      <div
                        key={index}
                        className="h-10 rounded-md border-l-2 border-primary/50 bg-background/80 shadow-xs"
                        style={{ opacity: 1 - index * 0.15 }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="px-6 pb-24 sm:px-10">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              {t("landing.features_title")}
            </h2>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ key, icon: Icon, span }) => (
                <div
                  key={key}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.25)] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_20px_48px_-20px_var(--color-primary)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_16px_40px_-24px_rgba(0,0,0,0.7)]",
                    span && "lg:col-span-2"
                  )}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-primary/0 blur-2xl transition-colors group-hover:bg-primary/10"
                  />
                  <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="relative mt-4 text-sm font-semibold text-foreground">
                    {t(`landing.feature_${key}_title`)}
                  </h3>
                  <p className="relative mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {t(`landing.feature_${key}_description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-24 sm:px-10">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-violet-500/10 px-8 py-14 text-center shadow-xl sm:px-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
                backgroundSize: "24px 24px",
                color: "var(--foreground)",
              }}
            />
            <h2 className="relative text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {t("landing.cta_title")}
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
              {t("landing.cta_subtitle")}
            </p>
            <Button asChild size="lg" className="relative mt-7">
              <Link href={ctaHref}>
                {t("landing.cta_button")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 px-6 py-8 text-center text-xs text-muted-foreground sm:px-10">
        © {new Date().getFullYear()} FUTURIX-iTech. {t("landing.footer")}
      </footer>
    </div>
  );
}
