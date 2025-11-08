import { z } from "zod";

/**
 * Invoice line item schema
 */
export const invoiceLineSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be at least 0.01"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  taxRate: z.number().min(0).max(1).default(0), // 0.20 = 20%
  amount: z.number().optional(), // Calculated field
});

export type InvoiceLine = z.infer<typeof invoiceLineSchema>;

/**
 * Invoice form schema
 */
export const invoiceFormSchema = z.object({
  // Customer
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email address").optional().or(z.literal("")),

  // Dates
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().min(1, "Due date is required"),

  // Line items
  lines: z.array(invoiceLineSchema).min(1, "At least one line item is required"),

  // Optional fields
  notes: z.string().optional(),
  terms: z.string().optional(),

  // Currency
  currency: z.string().default("USD"),
});

export type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

/**
 * Calculate line item amount (quantity * unitPrice + tax)
 */
export function calculateLineAmount(line: InvoiceLine): number {
  const subtotal = line.quantity * line.unitPrice;
  const taxAmount = subtotal * line.taxRate;
  return subtotal + taxAmount;
}

/**
 * Calculate invoice totals
 */
export function calculateInvoiceTotals(lines: InvoiceLine[]) {
  const subtotal = lines.reduce((sum, line) => {
    return sum + line.quantity * line.unitPrice;
  }, 0);

  const taxTotal = lines.reduce((sum, line) => {
    const lineSubtotal = line.quantity * line.unitPrice;
    return sum + lineSubtotal * line.taxRate;
  }, 0);

  const total = subtotal + taxTotal;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    taxTotal: Number(taxTotal.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

/**
 * Generate next invoice number
 * Format: INV-2024-001
 */
export function generateInvoiceNumber(lastNumber?: string): string {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  if (!lastNumber || !lastNumber.startsWith(prefix)) {
    return `${prefix}001`;
  }

  const currentNum = parseInt(lastNumber.split("-")[2] || "0", 10);
  const nextNum = (currentNum + 1).toString().padStart(3, "0");

  return `${prefix}${nextNum}`;
}
