/**
 * Default values and initial states for forms and settings
 * Centralized defaults for consistency across the application
 */

import {
  Currency,
  InvoiceStatus,
  ExpenseStatus,
  ContactType,
  PaymentMethod,
  AccountType,
  BusinessType,
  ReportInterval,
} from "@/types/enums";

// ============================================================
// Company Defaults
// ============================================================

export const DEFAULT_COMPANY = {
  name: "",
  email: "",
  phone: "",
  website: "",
  taxId: "",
  businessType: BusinessType.SOLE_PROPRIETORSHIP,
  address: {
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  },
  logo: "",
} as const;

export const DEFAULT_COMPANY_SETTINGS = {
  defaultCurrency: Currency.USD,
  fiscalYearEnd: "12-31", // December 31
  defaultPaymentTerms: 30, // Net 30
  invoicePrefix: "INV-",
  invoiceNumberFormat: "{PREFIX}{YEAR}{MONTH}{NUMBER:4}",
  expensePrefix: "EXP-",
  expenseNumberFormat: "{PREFIX}{YEAR}{MONTH}{NUMBER:4}",
  locale: "en-US",
  timezone: "America/New_York",
  dateFormat: "MM/dd/yyyy",
  timeFormat: "12h",
} as const;

// ============================================================
// Invoice Defaults
// ============================================================

export const DEFAULT_INVOICE = {
  invoiceNumber: "",
  invoiceDate: new Date(),
  dueDate: (() => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // Default: Net 30
    return date;
  })(),
  status: InvoiceStatus.DRAFT,
  currency: Currency.USD,
  subtotal: 0,
  taxAmount: 0,
  discountAmount: 0,
  total: 0,
  notes: "",
  terms: "Payment is due within 30 days of invoice date. Late payments may incur additional fees.",
  items: [],
} as const;

export const DEFAULT_INVOICE_LINE = {
  description: "",
  quantity: 1,
  unitPrice: 0,
  taxRate: 0,
  discountPercent: 0,
  amount: 0,
} as const;

export const DEFAULT_INVOICE_SETTINGS = {
  defaultPaymentTerms: 30,
  invoicePrefix: "INV-",
  nextInvoiceNumber: 1001,
  invoiceNumberFormat: "{PREFIX}{YEAR}{MONTH}{NUMBER:4}",
  showTaxColumn: true,
  showDiscountColumn: false,
  defaultTaxRate: 0,
  defaultNotes: "",
  defaultTerms:
    "Payment is due within 30 days of invoice date. Late payments may incur additional fees.",
  emailSubject: "Invoice {INVOICE_NUMBER} from {COMPANY_NAME}",
  emailBody: `Dear {CUSTOMER_NAME},

Please find attached invoice {INVOICE_NUMBER} for ${Currency.USD}{TOTAL}.

Due date: {DUE_DATE}
Payment terms: Net {PAYMENT_TERMS} days

If you have any questions, please don't hesitate to contact us.

Thank you for your business!

Best regards,
{COMPANY_NAME}`,
} as const;

// ============================================================
// Expense Defaults
// ============================================================

export const DEFAULT_EXPENSE = {
  expenseDate: new Date(),
  amount: 0,
  currency: Currency.USD,
  description: "",
  merchant: "",
  category: undefined,
  paymentMethod: PaymentMethod.CREDIT_CARD,
  status: ExpenseStatus.DRAFT,
  taxAmount: 0,
  isTaxDeductible: true,
  receiptUrl: "",
  attachments: [],
  notes: "",
  tags: [],
} as const;

export const DEFAULT_EXPENSE_SETTINGS = {
  expensePrefix: "EXP-",
  nextExpenseNumber: 1001,
  expenseNumberFormat: "{PREFIX}{YEAR}{MONTH}{NUMBER:4}",
  requireReceipt: true,
  requireApproval: true,
  autoApproveUnder: 100, // Auto-approve expenses under $100
  defaultExpenseAccount: undefined,
} as const;

// ============================================================
// Customer/Contact Defaults
// ============================================================

export const DEFAULT_CUSTOMER = {
  name: "",
  email: "",
  phone: "",
  type: ContactType.CUSTOMER,
  companyName: "",
  taxId: "",
  website: "",
  billingAddress: {
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  },
  shippingAddress: {
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  },
  notes: "",
  tags: [],
} as const;

// ============================================================
// Account Defaults
// ============================================================

export const DEFAULT_ACCOUNT = {
  code: "",
  name: "",
  type: AccountType.ASSET,
  subType: "",
  description: "",
  taxRelevant: false,
  isActive: true,
  parentAccountId: undefined,
  currentBalance: 0,
} as const;

// ============================================================
// Payment Defaults
// ============================================================

export const DEFAULT_PAYMENT_TERMS_OPTIONS = [
  { value: 0, label: "Due on receipt" },
  { value: 7, label: "Net 7 days" },
  { value: 15, label: "Net 15 days" },
  { value: 30, label: "Net 30 days" },
  { value: 60, label: "Net 60 days" },
  { value: 90, label: "Net 90 days" },
] as const;

export const DEFAULT_PAYMENT_METHOD = PaymentMethod.BANK_TRANSFER;

// ============================================================
// Tax Defaults
// ============================================================

export const DEFAULT_TAX_RATES = {
  US_SALES_TAX: {
    name: "Sales Tax",
    rate: 0, // Varies by state
    description: "US Sales Tax",
  },
  VAT_STANDARD: {
    name: "VAT (Standard)",
    rate: 20, // UK standard rate
    description: "Value Added Tax - Standard Rate",
  },
  VAT_REDUCED: {
    name: "VAT (Reduced)",
    rate: 5, // UK reduced rate
    description: "Value Added Tax - Reduced Rate",
  },
  GST_CANADA: {
    name: "GST",
    rate: 5, // Canadian GST
    description: "Goods and Services Tax",
  },
} as const;

// ============================================================
// Report Defaults
// ============================================================

export const DEFAULT_REPORT_PERIOD = {
  interval: ReportInterval.MONTH,
  startDate: (() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 12); // Last 12 months
    return date;
  })(),
  endDate: new Date(),
} as const;

export const DEFAULT_FISCAL_YEAR = {
  startMonth: 1, // January
  startDay: 1,
  endMonth: 12, // December
  endDay: 31,
} as const;

// ============================================================
// Chart of Accounts Defaults
// ============================================================

export const DEFAULT_ACCOUNT_CODES = {
  // Assets (1000-1999)
  CASH: "1000",
  BANK_ACCOUNT: "1010",
  ACCOUNTS_RECEIVABLE: "1200",
  INVENTORY: "1300",
  PREPAID_EXPENSES: "1400",
  FIXED_ASSETS: "1500",
  ACCUMULATED_DEPRECIATION: "1600",

  // Liabilities (2000-2999)
  ACCOUNTS_PAYABLE: "2000",
  CREDIT_CARDS: "2100",
  LOANS_PAYABLE: "2200",
  ACCRUED_EXPENSES: "2300",
  DEFERRED_REVENUE: "2400",

  // Equity (3000-3999)
  OWNERS_EQUITY: "3000",
  RETAINED_EARNINGS: "3100",
  CAPITAL_CONTRIBUTIONS: "3200",
  DRAWINGS: "3300",

  // Revenue (4000-4999)
  SALES_REVENUE: "4000",
  SERVICE_REVENUE: "4100",
  INTEREST_INCOME: "4200",
  OTHER_INCOME: "4900",

  // Expenses (5000-9999)
  COST_OF_GOODS_SOLD: "5000",
  SALARIES_WAGES: "6000",
  RENT_EXPENSE: "6100",
  UTILITIES: "6200",
  INSURANCE: "6300",
  OFFICE_SUPPLIES: "6400",
  ADVERTISING: "6500",
  PROFESSIONAL_FEES: "6600",
  TRAVEL_EXPENSE: "6700",
  DEPRECIATION: "6800",
  INTEREST_EXPENSE: "6900",
  TAXES: "7000",
  MISC_EXPENSE: "9000",
} as const;

// ============================================================
// Format Defaults
// ============================================================

export const DEFAULT_DATE_FORMATS = [
  { value: "MM/dd/yyyy", label: "MM/DD/YYYY (US)" },
  { value: "dd/MM/yyyy", label: "DD/MM/YYYY (UK)" },
  { value: "yyyy-MM-dd", label: "YYYY-MM-DD (ISO)" },
  { value: "dd.MM.yyyy", label: "DD.MM.YYYY (DE)" },
  { value: "dd-MM-yyyy", label: "DD-MM-YYYY" },
] as const;

export const DEFAULT_TIME_FORMATS = [
  { value: "12h", label: "12-hour (3:45 PM)" },
  { value: "24h", label: "24-hour (15:45)" },
] as const;

export const DEFAULT_NUMBER_FORMATS = {
  US: { decimalSeparator: ".", thousandsSeparator: "," },
  EU: { decimalSeparator: ",", thousandsSeparator: "." },
  SPACE: { decimalSeparator: ".", thousandsSeparator: " " },
} as const;

// ============================================================
// Locale Defaults
// ============================================================

export const DEFAULT_LOCALES = [
  { value: "en-US", label: "English (US)", currency: Currency.USD },
  { value: "en-GB", label: "English (UK)", currency: Currency.GBP },
  { value: "de-DE", label: "German", currency: Currency.EUR },
  { value: "fr-FR", label: "French", currency: Currency.EUR },
  { value: "es-ES", label: "Spanish", currency: Currency.EUR },
  { value: "it-IT", label: "Italian", currency: Currency.EUR },
  { value: "pt-BR", label: "Portuguese (Brazil)", currency: Currency.BRL },
  { value: "ja-JP", label: "Japanese", currency: Currency.JPY },
  { value: "zh-CN", label: "Chinese (Simplified)", currency: Currency.CNY },
] as const;

// ============================================================
// Pagination Defaults
// ============================================================

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 25,
  offset: 0,
} as const;

export const PAGINATION_OPTIONS = [
  { value: 10, label: "10 per page" },
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
] as const;

// ============================================================
// UI Defaults
// ============================================================

export const DEFAULT_THEME = {
  primaryColor: "#3b82f6", // blue-500
  accentColor: "#10b981", // green-500
  dangerColor: "#ef4444", // red-500
  warningColor: "#f59e0b", // amber-500
  successColor: "#10b981", // green-500
} as const;

export const DEFAULT_CHART_COLORS = [
  "#3b82f6", // blue-500
  "#10b981", // green-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#84cc16", // lime-500
] as const;

// ============================================================
// File Upload Defaults
// ============================================================

export const DEFAULT_FILE_UPLOAD = {
  maxSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10,
  acceptedTypes: {
    images: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    documents: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    receipts: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
  },
} as const;

// ============================================================
// Email Defaults
// ============================================================

export const DEFAULT_EMAIL_TEMPLATES = {
  invoiceSent: {
    subject: "Invoice {INVOICE_NUMBER} from {COMPANY_NAME}",
    body: `Dear {CUSTOMER_NAME},

Please find attached invoice {INVOICE_NUMBER} for {CURRENCY}{TOTAL}.

Due date: {DUE_DATE}
Payment terms: Net {PAYMENT_TERMS} days

If you have any questions, please don't hesitate to contact us.

Thank you for your business!

Best regards,
{COMPANY_NAME}`,
  },
  paymentReceived: {
    subject: "Payment Received - Invoice {INVOICE_NUMBER}",
    body: `Dear {CUSTOMER_NAME},

We have received your payment of {CURRENCY}{AMOUNT} for invoice {INVOICE_NUMBER}.

Thank you for your prompt payment!

Best regards,
{COMPANY_NAME}`,
  },
  paymentReminder: {
    subject: "Payment Reminder - Invoice {INVOICE_NUMBER}",
    body: `Dear {CUSTOMER_NAME},

This is a friendly reminder that invoice {INVOICE_NUMBER} for {CURRENCY}{TOTAL} is due on {DUE_DATE}.

If you have already sent the payment, please disregard this message.

If you have any questions, please contact us.

Thank you for your business!

Best regards,
{COMPANY_NAME}`,
  },
} as const;
