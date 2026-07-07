"use client";

import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle } from "lucide-react";

import { FuturixLogo } from "@/components/futurix-logo";
import { formatMontant, getPaiementStatusClasses, type PaiementStatus } from "@/lib/payment-status";
import { cn } from "@/lib/utils";

type VerifyResult =
  | { valid: false }
  | {
      valid: true;
      stagiaireNom: string;
      stagiairePrenom: string;
      sessionNom: string;
      due: number;
      paid: number;
      remaining: number;
      status: PaiementStatus;
      lastPaymentDate: string | null;
    };

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export function VerifyReceiptContent({ result }: { result: VerifyResult }) {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <FuturixLogo />
        </div>

        <div className="rounded-2xl border bg-card p-8 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_24px_60px_-24px_rgba(0,0,0,0.25)] sm:p-10 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_24px_60px_-24px_rgba(0,0,0,0.7)]">
          {!result.valid ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                <XCircle className="h-7 w-7" />
              </span>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{t("verify.invalid_title")}</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">{t("verify.invalid_description")}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-7 w-7" />
                </span>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">{t("verify.valid_title")}</h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">{t("verify.valid_description")}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t pt-6">
                <InfoRow
                  label={t("verify.stagiaire_label")}
                  value={`${result.stagiairePrenom} ${result.stagiaireNom}`}
                />
                <InfoRow label={t("verify.session_label")} value={result.sessionNom} />
                <InfoRow label={t("verify.due_label")} value={formatMontant(result.due)} />
                <InfoRow label={t("verify.paid_label")} value={formatMontant(result.paid)} />
                <InfoRow label={t("verify.remaining_label")} value={formatMontant(result.remaining)} />
                {result.lastPaymentDate && (
                  <InfoRow
                    label={t("verify.last_payment_label")}
                    value={new Date(result.lastPaymentDate).toLocaleDateString("fr-FR")}
                  />
                )}
              </div>

              <div className="mt-6 flex items-center justify-center">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    getPaiementStatusClasses(result.status),
                  )}
                >
                  {t(`sessions.paiement_status_${result.status}`)}
                </span>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {t("verify.footer_note")}
        </p>
      </div>
    </main>
  );
}
