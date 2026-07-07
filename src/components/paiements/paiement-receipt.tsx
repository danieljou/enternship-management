import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { useMemo } from "react";

const BRAND = "#0092b8";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    paddingBottom: 20,
    borderBottom: `2 solid ${BRAND}`,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
  },
  logoMarkText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  orgName: {
    fontSize: 15,
    fontWeight: "bold",
    color: BRAND,
  },
  orgDoc: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 1,
  },
  titleBlock: {
    alignItems: "flex-end",
  },
  documentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 3,
    color: BRAND,
  },
  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 8,
    border: "1 solid #e5e7eb",
  },
  metaItem: {
    flexDirection: "column",
    gap: 3,
  },
  metaLabel: {
    fontSize: 8.5,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: BRAND,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    borderBottom: "1 solid #f3f4f6",
  },
  rowLabel: {
    color: "#4b5563",
    flex: 1,
  },
  rowValue: {
    fontWeight: "bold",
    color: "#111827",
    textAlign: "right",
  },
  amountBox: {
    marginTop: 8,
    padding: 18,
    backgroundColor: "#f0fdf4",
    border: `2 solid ${BRAND}`,
    borderRadius: 10,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  amountLabel: {
    fontSize: 11,
    color: "#374151",
  },
  amountValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: BRAND,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTop: "1 solid #bbf7d0",
  },
  statusLabel: {
    fontSize: 11,
    color: "#374151",
  },
  statusPill: {
    backgroundColor: BRAND,
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 18,
    borderTop: "1 solid #e5e7eb",
  },
  qrBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  qrImage: {
    width: 52,
    height: 52,
  },
  qrCaption: {
    fontSize: 8,
    color: "#6b7280",
    maxWidth: 130,
  },
  footerRight: {
    alignItems: "flex-end",
  },
  footerText: {
    fontSize: 9,
    color: "#9ca3af",
  },
});

interface PaiementReceiptProps {
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
  receiptNumber?: string;
  qrCodeDataUrl?: string;
}

export function PaiementReceipt({
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
  receiptNumber,
  qrCodeDataUrl,
}: PaiementReceiptProps) {
  const formattedDate = useMemo(() => {
    const base = new Date(date_paiement);
    return base.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [date_paiement]);

  const stagiaireFullName = useMemo(
    () => `${stagiairePrenom} ${stagiaireNom}`.trim(),
    [stagiaireNom, stagiairePrenom],
  );

  const statusLabel = useMemo(
    () =>
      status === "paye"
        ? "Payé intégralement"
        : status === "partiel"
          ? "Paiement partiel"
          : "Impayé",
    [status],
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoMark}>
              <Text style={styles.logoMarkText}>F</Text>
            </View>
            <View>
              <Text style={styles.orgName}>FUTURIX-iTech</Text>
              <Text style={styles.orgDoc}>Reçu officiel de paiement</Text>
            </View>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.documentTitle}>Reçu</Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>N° de reçu</Text>
            <Text style={styles.metaValue}>{receiptNumber}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>{formattedDate}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations stagiaire</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Nom complet</Text>
            <Text style={styles.rowValue}>{stagiaireFullName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Session</Text>
            <Text style={styles.rowValue}>{sessionNom}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails du paiement</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Montant payé</Text>
            <Text style={styles.rowValue}>
              {montant.toLocaleString("fr-FR")} FCFA
            </Text>
          </View>
          {moyen && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Mode de paiement</Text>
              <Text style={styles.rowValue}>{moyen}</Text>
            </View>
          )}
        </View>

        <View style={styles.amountBox}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Montant dû</Text>
            <Text style={styles.amountValue}>
              {due.toLocaleString("fr-FR")} FCFA
            </Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Total payé</Text>
            <Text style={styles.amountValue}>
              {paid.toLocaleString("fr-FR")} FCFA
            </Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Reste à payer</Text>
            <Text
              style={{
                ...styles.amountValue,
                color: remaining > 0 ? "#b45309" : BRAND,
              }}
            >
              {remaining.toLocaleString("fr-FR")} FCFA
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Statut</Text>
            <Text style={styles.statusPill}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          {qrCodeDataUrl ? (
            <View style={styles.qrBlock}>
              {/* react-pdf's Image has no `alt` prop (PDF output, not HTML) - false positive */}
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={qrCodeDataUrl} style={styles.qrImage} />
              <Text style={styles.qrCaption}>
                Scannez ce code pour vérifier l&apos;authenticité de ce reçu,
                sans connexion requise.
              </Text>
            </View>
          ) : (
            <Text style={styles.footerText}>
              FUTURIX-iTech — Reçu généré automatiquement
            </Text>
          )}
          <View style={styles.footerRight}>
            <Text style={styles.footerText}>{receiptNumber}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
