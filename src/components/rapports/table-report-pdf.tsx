import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const BRAND = "#166534";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    paddingBottom: 14,
    borderBottom: `2 solid ${BRAND}`,
  },
  orgName: {
    fontSize: 13,
    fontWeight: "bold",
    color: BRAND,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  meta: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },
  table: {
    display: "flex",
    flexDirection: "column",
    borderRadius: 4,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: BRAND,
  },
  headerCell: {
    flex: 1,
    padding: 6,
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#ffffff",
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    borderBottom: "1 solid #e5e7eb",
  },
  rowAlt: {
    backgroundColor: "#f8fafc",
  },
  cell: {
    flex: 1,
    padding: 6,
    fontSize: 9,
    color: "#1f2937",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "center",
  },
});

export function TableReportPdf({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: string[][];
}) {
  const generatedAt = new Date().toLocaleString("fr-FR");

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.orgName}>FUTURIX-iTech</Text>
            <Text style={styles.meta}>Généré le {generatedAt}</Text>
          </View>
          <Text style={styles.reportTitle}>{title}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.headerRow} fixed>
            {headers.map((header, index) => (
              <Text key={index} style={styles.headerCell}>
                {header}
              </Text>
            ))}
          </View>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={[styles.row, ...(rowIndex % 2 === 1 ? [styles.rowAlt] : [])]}>
              {row.map((cell, cellIndex) => (
                <Text key={cellIndex} style={styles.cell}>
                  {cell}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <Text style={styles.footer} fixed>
          FUTURIX-iTech — {rows.length} ligne(s) — Document généré automatiquement
        </Text>
      </Page>
    </Document>
  );
}
