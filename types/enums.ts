/**
 * Centralized enum definitions for the application
 * This ensures type safety and consistency across the codebase
 */

// ============================================
// INVOICE ENUMS
// ============================================

export enum InvoiceStatus {
  DRAFT = "draft",
  SENT = "sent",
  VIEWED = "viewed",
  PARTIAL = "partial",
  PAID = "paid",
  OVERDUE = "overdue",
  VOID = "void",
}

// ============================================
// EXPENSE ENUMS
// ============================================

export enum ExpenseStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  APPROVED = "approved",
  REJECTED = "rejected",
  PAID = "paid",
}

export enum ExpenseCategory {
  TRAVEL = "travel",
  MEALS = "meals",
  OFFICE_SUPPLIES = "office_supplies",
  SOFTWARE = "software",
  ADVERTISING = "advertising",
  UTILITIES = "utilities",
  RENT = "rent",
  INSURANCE = "insurance",
  PROFESSIONAL_SERVICES = "professional_services",
  EQUIPMENT = "equipment",
  MAINTENANCE = "maintenance",
  OTHER = "other",
}

export enum PaymentMethod {
  CASH = "cash",
  CREDIT_CARD = "credit_card",
  BANK_TRANSFER = "bank_transfer",
  OTHER = "other",
}

// ============================================
// ACCOUNT ENUMS
// ============================================

export enum AccountType {
  ASSET = "asset",
  LIABILITY = "liability",
  EQUITY = "equity",
  REVENUE = "revenue",
  EXPENSE = "expense",
}

export enum AssetSubType {
  CURRENT_ASSET = "current_asset",
  FIXED_ASSET = "fixed_asset",
  CASH = "cash",
  ACCOUNTS_RECEIVABLE = "accounts_receivable",
  INVENTORY = "inventory",
  OTHER_ASSET = "other_asset",
}

export enum LiabilitySubType {
  CURRENT_LIABILITY = "current_liability",
  LONG_TERM_LIABILITY = "long_term_liability",
  ACCOUNTS_PAYABLE = "accounts_payable",
  CREDIT_CARD = "credit_card",
  OTHER_LIABILITY = "other_liability",
}

export enum EquitySubType {
  OWNER_EQUITY = "owner_equity",
  RETAINED_EARNINGS = "retained_earnings",
  COMMON_STOCK = "common_stock",
  OTHER_EQUITY = "other_equity",
}

export enum RevenueSubType {
  SALES_REVENUE = "sales_revenue",
  SERVICE_REVENUE = "service_revenue",
  OTHER_REVENUE = "other_revenue",
}

export enum ExpenseSubType {
  OPERATING_EXPENSE = "operating_expense",
  COST_OF_GOODS_SOLD = "cost_of_goods_sold",
  PAYROLL_EXPENSE = "payroll_expense",
  TAX_EXPENSE = "tax_expense",
  OTHER_EXPENSE = "other_expense",
}

// ============================================
// CONTACT ENUMS
// ============================================

export enum ContactType {
  CUSTOMER = "customer",
  SUPPLIER = "supplier",
  BOTH = "both",
}

// ============================================
// COMPANY ENUMS
// ============================================

export enum BusinessType {
  SOLE_PROPRIETOR = "sole_proprietor",
  LLC = "llc",
  CORPORATION = "corporation",
  PARTNERSHIP = "partnership",
  OTHER = "other",
}

export enum FiscalYearEnd {
  JANUARY = "01",
  FEBRUARY = "02",
  MARCH = "03",
  APRIL = "04",
  MAY = "05",
  JUNE = "06",
  JULY = "07",
  AUGUST = "08",
  SEPTEMBER = "09",
  OCTOBER = "10",
  NOVEMBER = "11",
  DECEMBER = "12",
}

// ============================================
// USER ROLE ENUMS
// ============================================

export enum UserRole {
  OWNER = "owner",
  ADMIN = "admin",
  ACCOUNTANT = "accountant",
  EMPLOYEE = "employee",
}

// ============================================
// TRANSACTION ENUMS
// ============================================

export enum TransactionStatus {
  DRAFT = "draft",
  POSTED = "posted",
  VOID = "void",
}

export enum TransactionSourceType {
  MANUAL = "manual",
  INVOICE = "invoice",
  EXPENSE = "expense",
  BANK_IMPORT = "bank_import",
  SYSTEM = "system",
}

// ============================================
// REPORT ENUMS
// ============================================

export enum ReportInterval {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  QUARTER = "quarter",
  YEAR = "year",
}

export enum ReportType {
  PROFIT_LOSS = "profit-loss",
  BALANCE_SHEET = "balance-sheet",
  CASH_FLOW = "cash-flow",
  TRENDS = "trends",
}

// ============================================
// CURRENCY ENUMS
// ============================================

export enum Currency {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  SEK = "SEK",
  NOK = "NOK",
  DKK = "DKK",
}
