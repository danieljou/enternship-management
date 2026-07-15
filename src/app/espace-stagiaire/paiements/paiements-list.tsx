"use client";

import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import {
  computePaiementStatus,
  formatMontant,
  getPaiementStatusClasses,
} from "@/lib/payment-status";
import { cn } from "@/lib/utils";
import type { Paiement, StageSession } from "@/lib/types";
import { PaiementReceiptButton } from "@/components/paiements/paiement-receipt-button";

export interface SessionPaiementGroup {
  session: StageSession;
  paiements: Paiement[];
}

export function StagiairePaiementsList({
  groups,
  stagiaireId,
  stagiaireNom,
  stagiairePrenom,
}: {
  groups: SessionPaiementGroup[];
  stagiaireId: string;
  stagiaireNom: string;
  stagiairePrenom: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("stagiairePaiements.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("stagiairePaiements.subtitle")}</p>
      </div>

      {groups.map(({ session, paiements }) => {
        const due = session.frais_montant ?? 0;
        const paid = paiements.reduce((sum, p) => sum + p.montant, 0);
        const status = computePaiementStatus(due, paid);

        return (
          <div key={session.id} className="rounded-2xl border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-foreground">{session.nom}</h2>
              <div className="flex items-center gap-2">
                <Badge className={cn("border-0", getPaiementStatusClasses(status))}>
                  {t(`sessions.paiement_status_${status}`)}
                </Badge>
                {(status === "paye" || status === "partiel") && (
                  <PaiementReceiptButton
                    sessionId={session.id}
                    stagiaireId={stagiaireId}
                    stagiaireNom={stagiaireNom}
                    stagiairePrenom={stagiairePrenom}
                    sessionNom={session.nom}
                    montant={paid}
                    date_paiement={paiements[paiements.length - 1]?.date_paiement ?? new Date().toISOString()}
                    moyen={paiements[paiements.length - 1]?.moyen ?? null}
                    due={due}
                    paid={paid}
                    remaining={Math.max(due - paid, 0)}
                    status={status}
                  />
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <span className="text-muted-foreground">
                {t("sessions.paiement_due_label")}:{" "}
                <strong className="text-foreground">{formatMontant(due)}</strong>
              </span>
              <span className="text-muted-foreground">
                {t("sessions.paiement_paid_label")}:{" "}
                <strong className="text-foreground">{formatMontant(paid)}</strong>
              </span>
              <span className="text-muted-foreground">
                {t("paiements.column_remaining")}:{" "}
                <strong className="text-foreground">{formatMontant(Math.max(due - paid, 0))}</strong>
              </span>
            </div>

            {paiements.length > 0 && (
              <ul className="mt-4 flex flex-col gap-1.5 border-t pt-3">
                {paiements.map((paiement) => (
                  <li key={paiement.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">
                      {formatMontant(paiement.montant)}
                      {paiement.moyen && (
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          · {paiement.moyen}
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(paiement.date_paiement).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
