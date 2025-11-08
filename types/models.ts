/**
 * Type definitions for database models
 * These should match the Prisma schema but provide additional type safety
 */

import type { Decimal } from "@prisma/client/runtime/library";
import {
  InvoiceStatus,
  ExpenseStatus,
  ExpenseCategory,
  PaymentMethod,
  AccountType,
  ContactType,
  BusinessType,
  TransactionStatus,
  TransactionSourceType,
  UserRole,
} from "./enums";

// ============================================
// BASE TYPES
// ============================================

export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

// ============================================
// COMPANY
// ============================================

export interface Company extends BaseModel {
  name: string;
  businessType?: BusinessType;
  taxId?: string;
  fiscalYearEnd?: string;
  address?: Address;
  currency: string;
  settings?: CompanySettings;
}

export interface CompanySettings {
  invoicePrefix?: string;
  invoiceNumberStart?: number;
  invoiceTermsDays?: number;
  invoiceFooter?: string;
  brandColor?: string;
  logo?: string;
  emailFromName?: string;
  emailFromAddress?: string;
  emailReplyTo?: string;
  [key: string]: any; // Allow additional settings
}

// ============================================
// USER
// ============================================

export interface User extends BaseModel {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

export interface CompanyUser {
  id: string;
  companyId: string;
  userId: string;
  role: UserRole;
  createdAt: Date;
}

// ============================================
// CONTACT (Customer/Supplier)
// ============================================

export interface Contact extends BaseModel {
  companyId: string;
  type: ContactType;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  taxId?: string;
  taxExempt: boolean;
  address?: Address;
  currency: string;
  paymentTermsDays: number;
  notes?: string;
  tags: string[];
  isActive: boolean;
}

// ============================================
// INVOICE
// ============================================

export interface Invoice extends BaseModel {
  companyId: string;
  invoiceNumber: string;
  contactId: string;
  invoiceDate: Date;
  dueDate: Date;
  subtotal: Decimal;
  taxTotal: Decimal;
  total: Decimal;
  amountPaid: Decimal;
  amountDue: Decimal;
  currency: string;
  status: InvoiceStatus;
  notes?: string;
  terms?: string;
  footer?: string;
  sentAt?: Date;
  viewedAt?: Date;
  paidAt?: Date;
  transactionId?: string;
  createdBy: string;

  // Relations
  lines?: InvoiceLine[];
  contact?: Contact;
}

export interface InvoiceLine {
  id: string;
  invoiceId: string;
  lineNumber: number;
  description: string;
  quantity: Decimal;
  unitPrice: Decimal;
  taxRate: Decimal;
  taxAmount: Decimal;
  amount: Decimal;
  revenueAccountId?: string;
  createdAt: Date;
}

// ============================================
// EXPENSE
// ============================================

export interface Expense extends BaseModel {
  companyId: string;
  expenseDate: Date;
  amount: Decimal;
  currency: string;
  description: string;
  merchant?: string;
  category?: ExpenseCategory;
  paymentMethod?: PaymentMethod;
  contactId?: string;
  expenseAccountId?: string;
  transactionId?: string;
  taxAmount: Decimal;
  isTaxDeductible: boolean;
  receiptUrl?: string;
  attachments: Array<{
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  status: ExpenseStatus;
  submittedAt?: Date;
  submittedBy?: string;
  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectReason?: string;
  notes?: string;
  tags: string[];
  createdBy: string;

  // Relations
  contact?: Contact;
}

// ============================================
// ACCOUNT (Chart of Accounts)
// ============================================

export interface Account extends BaseModel {
  companyId: string;
  code: string;
  name: string;
  type: AccountType;
  subType?: string;
  isBankAccount: boolean;
  isControlAccount: boolean;
  isSystem: boolean;
  isActive: boolean;
  parentAccountId?: string;
  currentBalance: Decimal;
  currency: string;
  taxCategory?: string;

  // Relations for hierarchy
  children?: Account[];
}

// ============================================
// TRANSACTION (Double-Entry)
// ============================================

export interface Transaction extends BaseModel {
  companyId: string;
  transactionDate: Date;
  transactionNumber?: string;
  description: string;
  reference?: string;
  sourceType: TransactionSourceType;
  sourceId?: string;
  status: TransactionStatus;
  createdBy: string;
  postedAt?: Date;
  voidedAt?: Date;
  voidedBy?: string;
  voidReason?: string;
  attachments: Array<{
    name: string;
    url: string;
  }>;
  tags: string[];

  // Relations
  lines?: TransactionLine[];
}

export interface TransactionLine {
  id: string;
  transactionId: string;
  companyId: string;
  accountId: string;
  amount: Decimal; // positive = debit, negative = credit
  currency: string;
  exchangeRate: Decimal;
  description?: string;
  contactId?: string;
  isReconciled: boolean;
  reconciledAt?: Date;
  createdAt: Date;

  // Relations
  account?: Account;
}

// ============================================
// PAYMENT ALLOCATION
// ============================================

export interface PaymentAllocation {
  id: string;
  companyId: string;
  invoiceId: string;
  paymentDate: Date;
  amount: Decimal;
  paymentMethod?: PaymentMethod;
  reference?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

// ============================================
// BANK ACCOUNT
// ============================================

export interface BankAccount extends BaseModel {
  companyId: string;
  accountId: string;
  bankName: string;
  accountNumber: string;
  routingNumber?: string;
  accountType: "checking" | "savings" | "credit_card" | "other";
  currency: string;
  isActive: boolean;
}

export interface BankTransaction extends BaseModel {
  companyId: string;
  bankAccountId: string;
  transactionDate: Date;
  postedDate: Date;
  description: string;
  amount: Decimal;
  balance?: Decimal;
  reference?: string;
  category?: string;
  isReconciled: boolean;
  reconciledAt?: Date;
  transactionId?: string;
  suggestedAccountId?: string;
  suggestedContactId?: string;
}
