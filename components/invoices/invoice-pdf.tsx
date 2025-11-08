import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  column: {
    flexDirection: "column",
  },
  label: {
    fontSize: 9,
    color: "#666",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  value: {
    fontSize: 11,
    color: "#000",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  statusDraft: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
  },
  statusSent: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
  },
  statusPaid: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  statusOverdue: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #f3f4f6",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableCol: {
    flexDirection: "column",
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
    textTransform: "uppercase",
  },
  tableText: {
    fontSize: 10,
    color: "#1f2937",
  },
  totalsSection: {
    marginTop: 20,
    alignSelf: "flex-end",
    width: "40%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 10,
    color: "#6b7280",
  },
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1f2937",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "2px solid #e5e7eb",
    paddingTop: 8,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  notes: {
    marginTop: 30,
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#6b7280",
    marginBottom: 6,
  },
  notesText: {
    fontSize: 9,
    color: "#4b5563",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
  },
});

interface InvoicePDFProps {
  invoice: {
    invoiceNumber: string;
    customerName: string;
    customerEmail?: string;
    invoiceDate: string;
    dueDate: string;
    status: string;
    subtotal: number;
    taxTotal: number;
    total: number;
    amountPaid: number;
    amountDue: number;
    currency: string;
    notes?: string;
    terms?: string;
    lines: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      taxRate: number;
      amount: number;
    }>;
  };
  companyInfo?: {
    name: string;
    address?: string;
    email?: string;
    phone?: string;
  };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return styles.statusPaid;
    case "sent":
    case "viewed":
      return styles.statusSent;
    case "overdue":
      return styles.statusOverdue;
    default:
      return styles.statusDraft;
  }
};

export const InvoicePDF = ({ invoice, companyInfo }: InvoicePDFProps) => {
  const defaultCompany = {
    name: "Forkioo",
    email: "hello@forkioo.app",
  };

  const company = companyInfo || defaultCompany;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.title}>{company.name}</Text>
              {company.email && (
                <Text style={styles.subtitle}>{company.email}</Text>
              )}
              {company.phone && (
                <Text style={styles.subtitle}>{company.phone}</Text>
              )}
            </View>
            <View style={[styles.column, { alignItems: "flex-end" }]}>
              <Text style={styles.title}>INVOICE</Text>
              <Text style={styles.value}>{invoice.invoiceNumber}</Text>
            </View>
          </View>
        </View>

        {/* Invoice Info */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Bill To</Text>
              <Text style={styles.value}>{invoice.customerName}</Text>
              {invoice.customerEmail && (
                <Text style={[styles.value, { fontSize: 9, color: "#6b7280" }]}>
                  {invoice.customerEmail}
                </Text>
              )}
            </View>
            <View style={[styles.column, { alignItems: "flex-end" }]}>
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.label}>Invoice Date</Text>
                <Text style={styles.value}>{formatDate(invoice.invoiceDate)}</Text>
              </View>
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.label}>Due Date</Text>
                <Text style={styles.value}>{formatDate(invoice.dueDate)}</Text>
              </View>
              <View>
                <Text style={styles.label}>Status</Text>
                <View style={[styles.statusBadge, getStatusStyle(invoice.status)]}>
                  <Text>{invoice.status.toUpperCase()}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={{ width: "45%" }}>
              <Text style={styles.tableHeaderText}>Description</Text>
            </View>
            <View style={{ width: "15%", alignItems: "flex-end" }}>
              <Text style={styles.tableHeaderText}>Qty</Text>
            </View>
            <View style={{ width: "20%", alignItems: "flex-end" }}>
              <Text style={styles.tableHeaderText}>Unit Price</Text>
            </View>
            <View style={{ width: "20%", alignItems: "flex-end" }}>
              <Text style={styles.tableHeaderText}>Amount</Text>
            </View>
          </View>

          {/* Table Rows */}
          {invoice.lines.map((line, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={{ width: "45%" }}>
                <Text style={styles.tableText}>{line.description}</Text>
                {line.taxRate > 0 && (
                  <Text style={[styles.tableText, { fontSize: 8, color: "#6b7280" }]}>
                    Tax: {(line.taxRate * 100).toFixed(1)}%
                  </Text>
                )}
              </View>
              <View style={{ width: "15%", alignItems: "flex-end" }}>
                <Text style={styles.tableText}>{line.quantity}</Text>
              </View>
              <View style={{ width: "20%", alignItems: "flex-end" }}>
                <Text style={styles.tableText}>{formatCurrency(line.unitPrice)}</Text>
              </View>
              <View style={{ width: "20%", alignItems: "flex-end" }}>
                <Text style={styles.tableText}>{formatCurrency(line.amount)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          {invoice.taxTotal > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax:</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.taxTotal)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(invoice.total)}</Text>
          </View>
          {invoice.amountPaid > 0 && (
            <>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Amount Paid:</Text>
                <Text style={[styles.totalValue, { color: "#059669" }]}>
                  {formatCurrency(invoice.amountPaid)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.grandTotalLabel}>Amount Due:</Text>
                <Text style={styles.grandTotalValue}>
                  {formatCurrency(invoice.amountDue)}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Terms */}
        {invoice.terms && (
          <View style={[styles.notes, { marginTop: 12 }]}>
            <Text style={styles.notesTitle}>Payment Terms</Text>
            <Text style={styles.notesText}>{invoice.terms}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by {company.name} • {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
};
