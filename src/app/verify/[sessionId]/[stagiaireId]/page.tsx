import type { Metadata } from "next";

import { computePaiementStatus } from "@/lib/payment-status";
import { createAdminClient } from "@/lib/supabase/admin";

import { VerifyReceiptContent } from "./verify-content";

export const metadata: Metadata = {
  title: "Vérification de reçu - FUTURIX-iTech",
};

export default async function VerifyReceiptPage({
  params,
}: {
  params: Promise<{ sessionId: string; stagiaireId: string }>;
}) {
  const { sessionId, stagiaireId } = await params;
  const admin = createAdminClient();

  const [{ data: stagiaire }, { data: session }, { data: paiements }, { data: enrollment }] =
    await Promise.all([
      admin.from("stagiaires").select("nom, prenom").eq("id", stagiaireId).maybeSingle(),
      admin.from("stage_sessions").select("nom, frais_montant").eq("id", sessionId).maybeSingle(),
      admin
        .from("paiements")
        .select("montant, date_paiement")
        .eq("stagiaire_id", stagiaireId)
        .eq("session_id", sessionId)
        .order("date_paiement", { ascending: false }),
      admin
        .from("session_stagiaires")
        .select("id")
        .eq("stagiaire_id", stagiaireId)
        .eq("session_id", sessionId)
        .maybeSingle(),
    ]);

  if (!stagiaire || !session || !enrollment) {
    return <VerifyReceiptContent result={{ valid: false }} />;
  }

  const due = session.frais_montant ?? 0;
  const paid = (paiements ?? []).reduce((sum, row) => sum + row.montant, 0);
  const remaining = Math.max(due - paid, 0);
  const status = computePaiementStatus(due, paid);
  const lastPaymentDate = paiements?.[0]?.date_paiement ?? null;

  return (
    <VerifyReceiptContent
      result={{
        valid: true,
        stagiaireNom: stagiaire.nom,
        stagiairePrenom: stagiaire.prenom,
        sessionNom: session.nom,
        due,
        paid,
        remaining,
        status,
        lastPaymentDate,
      }}
    />
  );
}
