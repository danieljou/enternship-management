"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import QRCode from "qrcode";

import { Button } from "@/components/ui/button";
import { PaiementReceipt } from "./paiement-receipt";

interface PaiementReceiptButtonProps {
  sessionId: string;
  stagiaireId: string;
  stagiaireNom: string;
  stagiairePrenom: string;
  sessionNom: string;
  montant: number;
  date_paiement: string;
  moyen: string | null;
  due: number;
  paid: number;
  remaining: number;
  status: "impaye" | "partiel" | "paye";
  className?: string;
}

export function PaiementReceiptButton({
  sessionId,
  stagiaireId,
  stagiaireNom,
  stagiairePrenom,
  sessionNom,
  montant,
  date_paiement,
  moyen,
  due,
  paid,
  remaining,
  status,
  className,
}: PaiementReceiptButtonProps) {
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);

  async function handlePrint() {
    setIsGenerating(true);
    try {
      const receiptNumber = `REC-${new Date(date_paiement).getFullYear()}-${sessionId.slice(0, 4)}${stagiaireId.slice(0, 4)}`.toUpperCase();

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
      const verifyUrl = `${siteUrl}/verify/${sessionId}/${stagiaireId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
        margin: 1,
        width: 200,
        color: { dark: "#166534", light: "#ffffff" },
      });

      const blob = await pdf(
        <PaiementReceipt
          stagiaireNom={stagiaireNom}
          stagiairePrenom={stagiairePrenom}
          sessionNom={sessionNom}
          montant={montant}
          date_paiement={date_paiement}
          moyen={moyen}
          due={due}
          paid={paid}
          remaining={remaining}
          status={status}
          receiptNumber={receiptNumber}
          qrCodeDataUrl={qrCodeDataUrl}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `recu-paiement-${receiptNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate receipt PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={handlePrint}
      disabled={isGenerating}
      className={className}
      aria-label={t("recu_print")}
      title={t("recu_print")}
    >
      <FileText className="h-4 w-4" />
    </Button>
  );
}
