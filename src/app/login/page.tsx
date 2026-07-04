import type { Metadata } from "next";

import { FuturixLogo } from "@/components/futurix-logo";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";

import { LoginForm } from "./login-form";
import { LoginCopy } from "./login-copy";
import { LoginHeading } from "./login-heading";

export const metadata: Metadata = {
  title: "Connexion - FUTURIX-iTech",
  description: "Accédez à la plateforme de suivi des stagiaires FUTURIX-iTech.",
};

export default function LoginPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-background md:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-muted p-12 md:flex lg:p-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.15] dark:opacity-[0.2]"
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            color: "var(--foreground)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 bottom-0 h-112 w-md rounded-full bg-cyan-500/10 blur-3xl"
        />

        <FuturixLogo className="relative" />

        <LoginCopy className="relative max-w-sm" />

        <p className="relative text-xs text-muted-foreground">
          © {new Date().getFullYear()} FUTURIX-iTech
        </p>
      </section>

      <section className="flex flex-col px-6 py-8 sm:px-12">
        <div className="flex justify-end gap-1">
          <LanguageToggle />
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm py-8">
            <div className="mb-10 flex justify-center md:hidden">
              <FuturixLogo />
            </div>

            <LoginHeading />
            <LoginForm />

            <p className="mt-10 text-center text-xs text-muted-foreground md:hidden">
              © {new Date().getFullYear()} FUTURIX-iTech
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
