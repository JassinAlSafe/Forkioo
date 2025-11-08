/**
 * Dropdown options and select lists
 * Used for form inputs throughout the application
 */

import {
  InvoiceStatus,
  ExpenseStatus,
  ExpenseCategory,
  PaymentMethod,
  AccountType,
  AssetSubType,
  LiabilitySubType,
  EquitySubType,
  RevenueSubType,
  ExpenseSubType,
  ContactType,
  BusinessType,
  FiscalYearEnd,
  UserRole,
  ReportInterval,
  Currency,
} from "@/types/enums";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface SelectOption<T = string> {
  value: T;
  label: string;
  description?: string;
  color?: string;
  icon?: string;
}

// ============================================
// INVOICE OPTIONS
// ============================================

export const INVOICE_STATUS_OPTIONS: SelectOption<InvoiceStatus>[] = [
  { value: InvoiceStatus.DRAFT, label: "Draft", color: "gray" },
  { value: InvoiceStatus.SENT, label: "Sent", color: "blue" },
  { value: InvoiceStatus.VIEWED, label: "Viewed", color: "purple" },
  { value: InvoiceStatus.PARTIAL, label: "Partially Paid", color: "yellow" },
  { value: InvoiceStatus.PAID, label: "Paid", color: "green" },
  { value: InvoiceStatus.OVERDUE, label: "Overdue", color: "red" },
  { value: InvoiceStatus.VOID, label: "Void", color: "gray" },
];

// ============================================
// EXPENSE OPTIONS
// ============================================

export const EXPENSE_STATUS_OPTIONS: SelectOption<ExpenseStatus>[] = [
  { value: ExpenseStatus.DRAFT, label: "Draft", color: "gray" },
  { value: ExpenseStatus.SUBMITTED, label: "Submitted", color: "blue" },
  { value: ExpenseStatus.APPROVED, label: "Approved", color: "green" },
  { value: ExpenseStatus.REJECTED, label: "Rejected", color: "red" },
  { value: ExpenseStatus.PAID, label: "Paid", color: "green" },
];

export const EXPENSE_CATEGORY_OPTIONS: SelectOption<ExpenseCategory>[] = [
  { value: ExpenseCategory.TRAVEL, label: "Travel", icon: "✈️" },
  { value: ExpenseCategory.MEALS, label: "Meals & Entertainment", icon: "🍽️" },
  { value: ExpenseCategory.OFFICE_SUPPLIES, label: "Office Supplies", icon: "📎" },
  { value: ExpenseCategory.SOFTWARE, label: "Software & Subscriptions", icon: "💻" },
  { value: ExpenseCategory.ADVERTISING, label: "Advertising & Marketing", icon: "📢" },
  { value: ExpenseCategory.UTILITIES, label: "Utilities", icon: "⚡" },
  { value: ExpenseCategory.RENT, label: "Rent & Lease", icon: "🏢" },
  { value: ExpenseCategory.INSURANCE, label: "Insurance", icon: "🛡️" },
  { value: ExpenseCategory.PROFESSIONAL_SERVICES, label: "Professional Services", icon: "👔" },
  { value: ExpenseCategory.EQUIPMENT, label: "Equipment", icon: "🔧" },
  { value: ExpenseCategory.MAINTENANCE, label: "Maintenance & Repairs", icon: "🔨" },
  { value: ExpenseCategory.OTHER, label: "Other", icon: "📦" },
];

export const PAYMENT_METHOD_OPTIONS: SelectOption<PaymentMethod>[] = [
  { value: PaymentMethod.CASH, label: "Cash", icon: "💵" },
  { value: PaymentMethod.CREDIT_CARD, label: "Credit Card", icon: "💳" },
  { value: PaymentMethod.BANK_TRANSFER, label: "Bank Transfer", icon: "🏦" },
  { value: PaymentMethod.OTHER, label: "Other", icon: "📝" },
];

// ============================================
// ACCOUNT OPTIONS
// ============================================

export const ACCOUNT_TYPE_OPTIONS: SelectOption<AccountType>[] = [
  {
    value: AccountType.ASSET,
    label: "Asset",
    description: "Resources owned by the business",
    color: "blue"
  },
  {
    value: AccountType.LIABILITY,
    label: "Liability",
    description: "Debts and obligations",
    color: "red"
  },
  {
    value: AccountType.EQUITY,
    label: "Equity",
    description: "Owner's stake in the business",
    color: "purple"
  },
  {
    value: AccountType.REVENUE,
    label: "Revenue",
    description: "Income from business activities",
    color: "green"
  },
  {
    value: AccountType.EXPENSE,
    label: "Expense",
    description: "Costs of running the business",
    color: "orange"
  },
];

export const ASSET_SUBTYPE_OPTIONS: SelectOption<AssetSubType>[] = [
  { value: AssetSubType.CURRENT_ASSET, label: "Current Asset" },
  { value: AssetSubType.FIXED_ASSET, label: "Fixed Asset" },
  { value: AssetSubType.CASH, label: "Cash & Cash Equivalents" },
  { value: AssetSubType.ACCOUNTS_RECEIVABLE, label: "Accounts Receivable" },
  { value: AssetSubType.INVENTORY, label: "Inventory" },
  { value: AssetSubType.OTHER_ASSET, label: "Other Asset" },
];

export const LIABILITY_SUBTYPE_OPTIONS: SelectOption<LiabilitySubType>[] = [
  { value: LiabilitySubType.CURRENT_LIABILITY, label: "Current Liability" },
  { value: LiabilitySubType.LONG_TERM_LIABILITY, label: "Long-term Liability" },
  { value: LiabilitySubType.ACCOUNTS_PAYABLE, label: "Accounts Payable" },
  { value: LiabilitySubType.CREDIT_CARD, label: "Credit Card" },
  { value: LiabilitySubType.OTHER_LIABILITY, label: "Other Liability" },
];

export const EQUITY_SUBTYPE_OPTIONS: SelectOption<EquitySubType>[] = [
  { value: EquitySubType.OWNER_EQUITY, label: "Owner's Equity" },
  { value: EquitySubType.RETAINED_EARNINGS, label: "Retained Earnings" },
  { value: EquitySubType.COMMON_STOCK, label: "Common Stock" },
  { value: EquitySubType.OTHER_EQUITY, label: "Other Equity" },
];

export const REVENUE_SUBTYPE_OPTIONS: SelectOption<RevenueSubType>[] = [
  { value: RevenueSubType.SALES_REVENUE, label: "Sales Revenue" },
  { value: RevenueSubType.SERVICE_REVENUE, label: "Service Revenue" },
  { value: RevenueSubType.OTHER_REVENUE, label: "Other Revenue" },
];

export const EXPENSE_SUBTYPE_OPTIONS: SelectOption<ExpenseSubType>[] = [
  { value: ExpenseSubType.OPERATING_EXPENSE, label: "Operating Expense" },
  { value: ExpenseSubType.COST_OF_GOODS_SOLD, label: "Cost of Goods Sold" },
  { value: ExpenseSubType.PAYROLL_EXPENSE, label: "Payroll Expense" },
  { value: ExpenseSubType.TAX_EXPENSE, label: "Tax Expense" },
  { value: ExpenseSubType.OTHER_EXPENSE, label: "Other Expense" },
];

// Get subtype options based on account type
export function getSubtypeOptions(accountType: AccountType): SelectOption[] {
  switch (accountType) {
    case AccountType.ASSET:
      return ASSET_SUBTYPE_OPTIONS;
    case AccountType.LIABILITY:
      return LIABILITY_SUBTYPE_OPTIONS;
    case AccountType.EQUITY:
      return EQUITY_SUBTYPE_OPTIONS;
    case AccountType.REVENUE:
      return REVENUE_SUBTYPE_OPTIONS;
    case AccountType.EXPENSE:
      return EXPENSE_SUBTYPE_OPTIONS;
    default:
      return [];
  }
}

// ============================================
// CONTACT OPTIONS
// ============================================

export const CONTACT_TYPE_OPTIONS: SelectOption<ContactType>[] = [
  { value: ContactType.CUSTOMER, label: "Customer", icon: "👤" },
  { value: ContactType.SUPPLIER, label: "Supplier", icon: "🏭" },
  { value: ContactType.BOTH, label: "Both Customer & Supplier", icon: "🔄" },
];

// ============================================
// COMPANY OPTIONS
// ============================================

export const BUSINESS_TYPE_OPTIONS: SelectOption<BusinessType>[] = [
  { value: BusinessType.SOLE_PROPRIETOR, label: "Sole Proprietor" },
  { value: BusinessType.LLC, label: "Limited Liability Company (LLC)" },
  { value: BusinessType.CORPORATION, label: "Corporation" },
  { value: BusinessType.PARTNERSHIP, label: "Partnership" },
  { value: BusinessType.OTHER, label: "Other" },
];

export const FISCAL_YEAR_END_OPTIONS: SelectOption<FiscalYearEnd>[] = [
  { value: FiscalYearEnd.JANUARY, label: "January" },
  { value: FiscalYearEnd.FEBRUARY, label: "February" },
  { value: FiscalYearEnd.MARCH, label: "March" },
  { value: FiscalYearEnd.APRIL, label: "April" },
  { value: FiscalYearEnd.MAY, label: "May" },
  { value: FiscalYearEnd.JUNE, label: "June" },
  { value: FiscalYearEnd.JULY, label: "July" },
  { value: FiscalYearEnd.AUGUST, label: "August" },
  { value: FiscalYearEnd.SEPTEMBER, label: "September" },
  { value: FiscalYearEnd.OCTOBER, label: "October" },
  { value: FiscalYearEnd.NOVEMBER, label: "November" },
  { value: FiscalYearEnd.DECEMBER, label: "December" },
];

// ============================================
// USER ROLE OPTIONS
// ============================================

export const USER_ROLE_OPTIONS: SelectOption<UserRole>[] = [
  {
    value: UserRole.OWNER,
    label: "Owner",
    description: "Full access to all features"
  },
  {
    value: UserRole.ADMIN,
    label: "Administrator",
    description: "Manage most features except company settings"
  },
  {
    value: UserRole.ACCOUNTANT,
    label: "Accountant",
    description: "View and manage financial records"
  },
  {
    value: UserRole.EMPLOYEE,
    label: "Employee",
    description: "Limited access to create expenses and view reports"
  },
];

// ============================================
// REPORT OPTIONS
// ============================================

export const REPORT_INTERVAL_OPTIONS: SelectOption<ReportInterval>[] = [
  { value: ReportInterval.DAY, label: "Daily" },
  { value: ReportInterval.WEEK, label: "Weekly" },
  { value: ReportInterval.MONTH, label: "Monthly" },
  { value: ReportInterval.QUARTER, label: "Quarterly" },
  { value: ReportInterval.YEAR, label: "Yearly" },
];

// ============================================
// CURRENCY OPTIONS
// ============================================

export const CURRENCY_OPTIONS: SelectOption<Currency>[] = [
  { value: Currency.USD, label: "US Dollar (USD)", icon: "$" },
  { value: Currency.EUR, label: "Euro (EUR)", icon: "€" },
  { value: Currency.GBP, label: "British Pound (GBP)", icon: "£" },
  { value: Currency.SEK, label: "Swedish Krona (SEK)", icon: "kr" },
  { value: Currency.NOK, label: "Norwegian Krone (NOK)", icon: "kr" },
  { value: Currency.DKK, label: "Danish Krone (DKK)", icon: "kr" },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getOptionLabel<T>(options: SelectOption<T>[], value: T): string {
  return options.find(opt => opt.value === value)?.label || String(value);
}

export function getOptionColor<T>(options: SelectOption<T>[], value: T): string | undefined {
  return options.find(opt => opt.value === value)?.color;
}

export function getOptionIcon<T>(options: SelectOption<T>[], value: T): string | undefined {
  return options.find(opt => opt.value === value)?.icon;
}
