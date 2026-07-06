import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { computePaiementStatus } from "@/lib/payment-status";

import { PaiementsContent } from "./paiements-content";
import type { PaiementRow } from "./paiements-columns";
import type { SessionPaiementSummary } from "./paiements-chart";

export const metadata: Metadata = {
  title: "Paiements — FUTURIX-iTech",
};

export default async function PaiementsPage() {
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("stage_sessions")
    .select("id, nom, frais_montant")
    .not("frais_montant", "is", null);

  const sessionIds = (sessions ?? []).map((session) => session.id);

  const [{ data: enrolled }, { data: paiements }] =
    sessionIds.length > 0
      ? await Promise.all([
          supabase
            .from("session_stagiaires")
            .select("session_id, stagiaire_id, stagiaire:stagiaires(nom, prenom)")
            .in("session_id", sessionIds),
          supabase.from("paiements").select("session_id, stagiaire_id, montant, date_paiement, moyen").in("session_id", sessionIds),
        ])
      : [{ data: [] }, { data: [] }];

  const paidByKey = new Map<string, number>();
  for (const paiement of paiements ?? []) {
    const key = `${paiement.session_id}:${paiement.stagiaire_id}`;
    paidByKey.set(key, (paidByKey.get(key) ?? 0) + paiement.montant);
  }

  const lastPaymentByKey = new Map<string, { date: string; moyen: string | null }>();
  for (const paiement of paiements ?? []) {
    const key = `${paiement.session_id}:${paiement.stagiaire_id}`;
    const current = lastPaymentByKey.get(key);
    if (!current || paiement.date_paiement > current.date) {
      lastPaymentByKey.set(key, { date: paiement.date_paiement, moyen: paiement.moyen });
    }
  }

  const sessionsById = new Map((sessions ?? []).map((session) => [session.id, session]));

  const rows: PaiementRow[] = (enrolled ?? []).map((row) => {
    const session = sessionsById.get(row.session_id);
    const due = session?.frais_montant ?? 0;
    const paid = paidByKey.get(`${row.session_id}:${row.stagiaire_id}`) ?? 0;
    const stagiaire = row.stagiaire as unknown as { nom: string; prenom: string } | null;

    const lastPayment = lastPaymentByKey.get(`${row.session_id}:${row.stagiaire_id}`);

    return {
      sessionId: row.session_id,
      sessionNom: session?.nom ?? "",
      stagiaireId: row.stagiaire_id,
      stagiaireNom: stagiaire ? `${stagiaire.prenom} ${stagiaire.nom}` : "",
      stagiairePrenom: stagiaire?.prenom ?? "",
      due,
      paid,
      remaining: Math.max(due - paid, 0),
      status: computePaiementStatus(due, paid),
      lastPaymentDate: lastPayment?.date ?? null,
      lastPaymentMoyen: lastPayment?.moyen ?? null,
    };
  });

  const sessionSummaries: SessionPaiementSummary[] = (sessions ?? []).map((session) => {
    const sessionRows = rows.filter((row) => row.sessionId === session.id);
    return {
      sessionNom: session.nom,
      attendu: sessionRows.reduce((sum, row) => sum + row.due, 0),
      collecte: sessionRows.reduce((sum, row) => sum + row.paid, 0),
    };
  });

  return <PaiementsContent rows={rows} sessionSummaries={sessionSummaries} />;
}
