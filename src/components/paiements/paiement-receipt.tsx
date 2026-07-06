import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { useMemo } from "react";

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
    alignItems: "flex-start",
    marginBottom: 30,
    borderBottom: "2 solid #166534",
    paddingBottom: 16,
  },
  orgBlock: {
    flexDirection: "column",
  },
  orgName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#166534",
  },
  orgDoc: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
  },
  titleBlock: {
    alignItems: "flex-end",
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "#166534",
  },
  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 6,
    border: "1 solid #e5e7eb",
  },
  metaItem: {
    flexDirection: "column",
    gap: 2,
  },
  metaLabel: {
    fontSize: 9,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#166534",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
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
    marginTop: 20,
    padding: 16,
    backgroundColor: "#f0fdf4",
    border: "2 solid #166534",
    borderRadius: 8,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  amountLabel: {
    fontSize: 11,
    color: "#374151",
  },
  amountValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#166534",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTop: "1 solid #bbf7d0",
  },
  statusLabel: {
    fontSize: 11,
    color: "#374151",
  },
  statusValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#166534",
    textTransform: "uppercase",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTop: "1 solid #e5e7eb",
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
          <View style={styles.orgBlock}>
            <Text style={styles.orgName}>FUTURIX-iTech</Text>
            <Text style={styles.orgDoc}>Reçu officiel de paiement</Text>
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
                color: remaining > 0 ? "#b45309" : "#166534",
              }}
            >
              {remaining.toLocaleString("fr-FR")} FCFA
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Statut</Text>
            <Text style={styles.statusValue}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            FUTURIX-iTech — Reçu généré automatiquement
          </Text>
          <Text style={styles.footerText}>{receiptNumber}</Text>
        </View>
      </Page>
    </Document>
  );
}
