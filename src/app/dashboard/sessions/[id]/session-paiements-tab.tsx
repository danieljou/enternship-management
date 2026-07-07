"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  computePaiementStatus,
  formatMontant,
  getPaiementStatusClasses,
} from "@/lib/payment-status";
import { cn } from "@/lib/utils";
import type { Paiement, SessionStagiaireWithRelations, StageSession } from "@/lib/types";

import { deletePaiement } from "../actions";
import { PaiementFormDialog } from "./paiement-form-dialog";
import { PaiementReceiptButton } from "@/components/paiements/paiement-receipt-button";

export function SessionPaiementsTab({
  session,
  enrolled,
  paiements,
}: {
  session: StageSession;
  enrolled: SessionStagiaireWithRelations[];
  paiements: Paiement[];
}) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string | undefined>(enrolled[0]?.stagiaire_id);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Paiement | null>(null);

  const due = session.frais_montant;

  const totalsByStagiaire = useMemo(() => {
    const map = new Map<string, number>();
    for (const paiement of paiements) {
      map.set(paiement.stagiaire_id, (map.get(paiement.stagiaire_id) ?? 0) + paiement.montant);
    }
    return map;
  }, [paiements]);

  const totalCollecte = paiements.reduce((sum, p) => sum + p.montant, 0);
  const totalAttendu = due ? due * enrolled.length : 0;
  const aJourCount = enrolled.filter(
    (row) => computePaiementStatus(due, totalsByStagiaire.get(row.stagiaire_id) ?? 0) === "paye"
  ).length;

  const selectedPaid = selected ? (totalsByStagiaire.get(selected) ?? 0) : 0;
  const selectedStatus = computePaiementStatus(due, selectedPaid);
  const selectedPaiements = useMemo(
    () =>
      paiements
        .filter((p) => p.stagiaire_id === selected)
        .sort((a, b) => b.date_paiement.localeCompare(a.date_paiement)),
    [paiements, selected]
  );

  const selectedStagiaire = enrolled.find((row) => row.stagiaire_id === selected);
  const selectedStagiaireNom = selectedStagiaire?.stagiaire?.nom ?? "";
  const selectedStagiairePrenom = selectedStagiaire?.stagiaire?.prenom ?? "";

  function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    startTransition(async () => {
      const result = await deletePaiement(target.id, session.id);
      if ("error" in result) {
        toast.error(t(result.error));
      } else {
        toast.success(t("sessions.paiement_delete_success"));
      }
      setDeleting(null);
    });
  }

  if (enrolled.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        {t("sessions.kanban_no_stagiaires")}
      </p>
    );
  }

  if (!due) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        {t("sessions.paiement_no_frais")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border bg-card p-3">
          <p className="text-xs text-muted-foreground">{t("sessions.paiement_kpi_attendu")}</p>
          <p className="text-lg font-semibold text-foreground">{formatMontant(totalAttendu)}</p>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <p className="text-xs text-muted-foreground">{t("sessions.paiement_kpi_collecte")}</p>
          <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
            {formatMontant(totalCollecte)}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <p className="text-xs text-muted-foreground">{t("sessions.paiement_kpi_reste")}</p>
          <p className="text-lg font-semibold text-foreground">
            {formatMontant(Math.max(totalAttendu - totalCollecte, 0))}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <p className="text-xs text-muted-foreground">{t("sessions.paiement_kpi_a_jour")}</p>
          <p className="text-lg font-semibold text-foreground">
            {aJourCount}/{enrolled.length}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue placeholder={t("sessions.kanban_select_placeholder")} />
          </SelectTrigger>
          <SelectContent>
            {enrolled.map(({ stagiaire_id, stagiaire }) => (
              <SelectItem key={stagiaire_id} value={stagiaire_id}>
                {stagiaire ? `${stagiaire.prenom} ${stagiaire.nom}` : stagiaire_id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selected && (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("sessions.paiement_add_button")}
            </Button>
            {selectedStatus === "paye" && (
              <PaiementReceiptButton
                sessionId={session.id}
                stagiaireId={selected}
                stagiaireNom={selectedStagiaireNom}
                stagiairePrenom={selectedStagiairePrenom}
                sessionNom={session.nom}
                montant={selectedPaid}
                date_paiement={selectedPaiements[0]?.date_paiement ?? new Date().toISOString()}
                moyen={selectedPaiements[0]?.moyen ?? null}
                due={due}
                paid={selectedPaid}
                remaining={0}
                status={selectedStatus}
              />
            )}
          </div>
        )}
      </div>

      {selected && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-3 text-sm">
          <span className="text-muted-foreground">
            {t("sessions.paiement_due_label")}: <strong className="text-foreground">{formatMontant(due)}</strong>
          </span>
          <span className="text-muted-foreground">
            {t("sessions.paiement_paid_label")}:{" "}
            <strong className="text-foreground">{formatMontant(selectedPaid)}</strong>
          </span>
          <Badge className={cn("border-0", getPaiementStatusClasses(selectedStatus))}>
            {t(`sessions.paiement_status_${selectedStatus}`)}
          </Badge>
        </div>
      )}

      {selectedPaiements.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          {t("sessions.paiement_empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {selectedPaiements.map((paiement) => (
            <li
              key={paiement.id}
              className="flex items-center gap-3 rounded-lg border bg-card p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {formatMontant(paiement.montant)}
                  {paiement.moyen && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      · {paiement.moyen}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(paiement.date_paiement).toLocaleDateString()}
                  {paiement.note && ` · ${paiement.note}`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setDeleting(paiement)}
                aria-label={t("common.delete")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <PaiementFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          sessionId={session.id}
          stagiaireId={selected}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("sessions.paiement_delete_confirm_description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isPending}>
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
