# Forkioo: Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         User Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Web App (Next.js)  │  Mobile (Future)  │  Public API (v1) │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                       │
├─────────────────────────────────────────────────────────────┤
│  API Routes (tRPC)  │  Edge Functions  │  Background Jobs   │
│                     │                   │                    │
│  • Authentication   │  • Image Resize   │  • Bank Sync      │
│  • Business Logic   │  • PDF Gen        │  • Email Send     │
│  • Validation       │  • Webhooks       │  • Reports Gen    │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Accounting   │  Invoicing  │  Banking  │  Reporting       │
│  Engine       │  Service    │  Service  │  Service         │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                            │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL      │  Redis         │  S3/R2         │  Plaid │
│  (Supabase)      │  (Cache/Queue) │  (Files)       │  (Bank)│
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Core Accounting Schema (PostgreSQL)

```sql
-- ============================================
-- TENANT & USERS
-- ============================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_type TEXT, -- 'sole_proprietor', 'llc', 'corporation'
  currency TEXT NOT NULL DEFAULT 'USD',
  fiscal_year_end TEXT NOT NULL DEFAULT '12-31', -- MM-DD format
  country_code TEXT NOT NULL DEFAULT 'US',
  tax_id TEXT, -- EIN, VAT number, etc.

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete

  -- Settings (JSONB for flexibility)
  settings JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_companies_deleted_at ON companies(deleted_at) WHERE deleted_at IS NULL;

-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,

  -- Auth (managed by Supabase Auth, but we store reference)
  auth_provider TEXT NOT NULL DEFAULT 'email', -- 'email', 'google'
  auth_provider_id TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,

  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================

CREATE TABLE company_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  role TEXT NOT NULL DEFAULT 'member',
  -- 'owner', 'admin', 'accountant', 'member', 'viewer'

  -- Permissions (granular control)
  permissions JSONB NOT NULL DEFAULT '{
    "invoices": {"create": true, "read": true, "update": true, "delete": false},
    "expenses": {"create": true, "read": true, "update": true, "delete": false},
    "reports": {"read": true},
    "settings": {"read": false, "update": false}
  }'::jsonb,

  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(company_id, user_id)
);

CREATE INDEX idx_company_users_company ON company_users(company_id);
CREATE INDEX idx_company_users_user ON company_users(user_id);

-- ============================================
-- CHART OF ACCOUNTS
-- ============================================

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Account identification
  code TEXT NOT NULL, -- e.g., '1000', '4000'
  name TEXT NOT NULL, -- e.g., 'Cash', 'Revenue'

  -- Account classification
  type TEXT NOT NULL,
  -- 'asset', 'liability', 'equity', 'revenue', 'expense'

  sub_type TEXT,
  -- Assets: 'current', 'fixed', 'other'
  -- Liabilities: 'current', 'long_term'
  -- Revenue: 'operating', 'other'
  -- Expenses: 'cost_of_goods_sold', 'operating', 'other'

  -- Behavior flags
  is_bank_account BOOLEAN DEFAULT FALSE,
  is_control_account BOOLEAN DEFAULT FALSE, -- AR, AP
  is_system BOOLEAN DEFAULT FALSE, -- Cannot be deleted
  is_active BOOLEAN DEFAULT TRUE,

  -- Hierarchy (for sub-accounts)
  parent_account_id UUID REFERENCES accounts(id),

  -- Balance tracking (denormalized for performance)
  current_balance DECIMAL(19, 4) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Tax settings
  tax_category TEXT, -- 'exempt', 'standard_rate', 'reduced_rate'

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(company_id, code),
  CONSTRAINT valid_type CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense'))
);

CREATE INDEX idx_accounts_company ON accounts(company_id);
CREATE INDEX idx_accounts_type ON accounts(company_id, type);
CREATE INDEX idx_accounts_parent ON accounts(parent_account_id);

-- ============================================
-- TRANSACTIONS (Double-Entry Bookkeeping)
-- ============================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Transaction metadata
  transaction_date DATE NOT NULL,
  transaction_number TEXT, -- Auto-generated: JE-2024-001

  description TEXT NOT NULL,
  reference TEXT, -- Invoice #, Receipt #, etc.

  -- Source tracking
  source_type TEXT NOT NULL,
  -- 'manual', 'invoice', 'expense', 'bank_import', 'system'
  source_id UUID, -- References source entity

  -- Status
  status TEXT NOT NULL DEFAULT 'posted',
  -- 'draft', 'posted', 'void'

  -- Audit trail (immutable once posted)
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  posted_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,
  voided_by UUID REFERENCES users(id),
  void_reason TEXT,

  -- Metadata
  attachments JSONB DEFAULT '[]'::jsonb, -- Array of file URLs
  tags JSONB DEFAULT '[]'::jsonb,

  CONSTRAINT valid_status CHECK (status IN ('draft', 'posted', 'void'))
);

CREATE INDEX idx_transactions_company ON transactions(company_id);
CREATE INDEX idx_transactions_date ON transactions(company_id, transaction_date);
CREATE INDEX idx_transactions_source ON transactions(source_type, source_id);
CREATE INDEX idx_transactions_status ON transactions(company_id, status);

-- ============================================

CREATE TABLE transaction_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  account_id UUID NOT NULL REFERENCES accounts(id),

  -- Double-entry (one is positive, one is negative)
  amount DECIMAL(19, 4) NOT NULL,
  -- Positive = Debit (for assets, expenses)
  -- Negative = Credit (for liabilities, equity, revenue)

  currency TEXT NOT NULL DEFAULT 'USD',
  exchange_rate DECIMAL(12, 6) DEFAULT 1.0, -- For multi-currency

  description TEXT,

  -- Contact reference (for AR/AP)
  contact_id UUID REFERENCES contacts(id),

  -- Reconciliation
  is_reconciled BOOLEAN DEFAULT FALSE,
  reconciled_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT non_zero_amount CHECK (amount != 0)
);

CREATE INDEX idx_transaction_lines_transaction ON transaction_lines(transaction_id);
CREATE INDEX idx_transaction_lines_account ON transaction_lines(company_id, account_id);
CREATE INDEX idx_transaction_lines_contact ON transaction_lines(contact_id);

-- Constraint: Transaction must balance (sum of lines = 0)
CREATE OR REPLACE FUNCTION check_transaction_balance()
RETURNS TRIGGER AS $$
DECLARE
  total DECIMAL(19, 4);
BEGIN
  SELECT SUM(amount) INTO total
  FROM transaction_lines
  WHERE transaction_id = NEW.transaction_id;

  IF ABS(total) > 0.01 THEN -- Allow 1 cent rounding
    RAISE EXCEPTION 'Transaction % does not balance. Sum: %', NEW.transaction_id, total;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER ensure_balanced_transaction
  AFTER INSERT OR UPDATE ON transaction_lines
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION check_transaction_balance();

-- ============================================
-- CONTACTS (Customers & Suppliers)
-- ============================================

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Type
  type TEXT NOT NULL, -- 'customer', 'supplier', 'both'

  -- Identity
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,

  -- Tax
  tax_id TEXT, -- VAT number, SSN, etc.
  tax_exempt BOOLEAN DEFAULT FALSE,

  -- Address
  address JSONB DEFAULT '{}'::jsonb,
  -- { street, city, state, postal_code, country }

  -- Financial
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_terms_days INTEGER DEFAULT 30, -- Net 30

  -- Metadata
  notes TEXT,
  tags JSONB DEFAULT '[]'::jsonb,

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_type CHECK (type IN ('customer', 'supplier', 'both'))
);

CREATE INDEX idx_contacts_company ON contacts(company_id);
CREATE INDEX idx_contacts_type ON contacts(company_id, type);
CREATE INDEX idx_contacts_email ON contacts(email);

-- ============================================
-- INVOICES
-- ============================================

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Numbering
  invoice_number TEXT NOT NULL,

  -- Customer
  contact_id UUID NOT NULL REFERENCES contacts(id),

  -- Dates
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,

  -- Amounts (denormalized for performance)
  subtotal DECIMAL(19, 4) NOT NULL,
  tax_total DECIMAL(19, 4) NOT NULL DEFAULT 0,
  total DECIMAL(19, 4) NOT NULL,
  amount_paid DECIMAL(19, 4) NOT NULL DEFAULT 0,
  amount_due DECIMAL(19, 4) NOT NULL,

  currency TEXT NOT NULL DEFAULT 'USD',

  -- Status
  status TEXT NOT NULL DEFAULT 'draft',
  -- 'draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'void'

  -- Content
  notes TEXT, -- Customer-visible notes
  terms TEXT, -- Payment terms text
  footer TEXT, -- Footer text

  -- Tracking
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,

  -- Accounting link
  transaction_id UUID REFERENCES transactions(id), -- Links to posted transaction

  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(company_id, invoice_number),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'void'))
);

CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_contact ON invoices(contact_id);
CREATE INDEX idx_invoices_status ON invoices(company_id, status);
CREATE INDEX idx_invoices_due_date ON invoices(company_id, due_date);

-- ============================================

CREATE TABLE invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  line_number INTEGER NOT NULL, -- Order of lines

  -- Item
  description TEXT NOT NULL,
  quantity DECIMAL(12, 4) NOT NULL DEFAULT 1,
  unit_price DECIMAL(19, 4) NOT NULL,

  -- Tax
  tax_rate DECIMAL(5, 4) DEFAULT 0, -- 0.20 = 20% VAT
  tax_amount DECIMAL(19, 4) DEFAULT 0,

  -- Total
  amount DECIMAL(19, 4) NOT NULL, -- quantity * unit_price + tax_amount

  -- Accounting
  revenue_account_id UUID REFERENCES accounts(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT positive_quantity CHECK (quantity > 0),
  CONSTRAINT positive_amount CHECK (amount >= 0)
);

CREATE INDEX idx_invoice_lines_invoice ON invoice_lines(invoice_id);

-- ============================================
-- PAYMENTS
-- ============================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Payment details
  payment_date DATE NOT NULL,
  amount DECIMAL(19, 4) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',

  payment_method TEXT NOT NULL,
  -- 'bank_transfer', 'credit_card', 'cash', 'check', 'other'

  reference TEXT, -- Check number, transaction ID

  -- Links
  contact_id UUID NOT NULL REFERENCES contacts(id),
  transaction_id UUID REFERENCES transactions(id), -- Accounting entry

  -- Metadata
  notes TEXT,

  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT positive_amount CHECK (amount > 0)
);

CREATE INDEX idx_payments_company ON payments(company_id);
CREATE INDEX idx_payments_contact ON payments(contact_id);
CREATE INDEX idx_payments_date ON payments(company_id, payment_date);

-- ============================================

CREATE TABLE payment_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  amount DECIMAL(19, 4) NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT positive_amount CHECK (amount > 0)
);

CREATE INDEX idx_payment_allocations_payment ON payment_allocations(payment_id);
CREATE INDEX idx_payment_allocations_invoice ON payment_allocations(invoice_id);

-- ============================================
-- BANK ACCOUNTS & TRANSACTIONS
-- ============================================

CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Account details
  account_id UUID NOT NULL REFERENCES accounts(id), -- Links to chart of accounts

  -- Bank details
  bank_name TEXT NOT NULL,
  account_number_last4 TEXT NOT NULL, -- Last 4 digits only
  account_type TEXT, -- 'checking', 'savings', 'credit_card'

  -- Plaid integration
  plaid_access_token TEXT, -- Encrypted in production
  plaid_item_id TEXT,
  plaid_account_id TEXT,

  -- Sync status
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'active',
  -- 'active', 'error', 'disconnected'

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bank_accounts_company ON bank_accounts(company_id);
CREATE INDEX idx_bank_accounts_account ON bank_accounts(account_id);

-- ============================================

CREATE TABLE bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,

  -- Transaction details
  transaction_date DATE NOT NULL,
  posted_date DATE, -- When it cleared

  description TEXT NOT NULL,
  amount DECIMAL(19, 4) NOT NULL, -- Positive = credit, Negative = debit

  -- Bank data
  plaid_transaction_id TEXT UNIQUE,
  merchant_name TEXT,
  category JSONB, -- Plaid's category hierarchy

  -- Matching status
  match_status TEXT NOT NULL DEFAULT 'unmatched',
  -- 'unmatched', 'suggested', 'matched', 'ignored'

  matched_transaction_id UUID REFERENCES transactions(id),
  matched_at TIMESTAMPTZ,
  matched_by UUID REFERENCES users(id),

  -- AI categorization
  suggested_account_id UUID REFERENCES accounts(id),
  confidence_score DECIMAL(3, 2), -- 0.00 to 1.00

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bank_transactions_bank_account ON bank_transactions(bank_account_id);
CREATE INDEX idx_bank_transactions_date ON bank_transactions(company_id, transaction_date);
CREATE INDEX idx_bank_transactions_status ON bank_transactions(company_id, match_status);
CREATE INDEX idx_bank_transactions_plaid ON bank_transactions(plaid_transaction_id);

-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

  -- Who
  user_id UUID REFERENCES users(id),
  user_email TEXT NOT NULL,

  -- What
  action TEXT NOT NULL,
  -- 'create', 'update', 'delete', 'void', 'send', 'view'

  entity_type TEXT NOT NULL,
  -- 'invoice', 'transaction', 'contact', etc.

  entity_id UUID NOT NULL,

  -- Changes
  old_values JSONB,
  new_values JSONB,

  -- Context
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_company ON audit_log(company_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_date ON audit_log(created_at);

-- ============================================
-- ROW LEVEL SECURITY (Multi-tenant isolation)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Policy example (repeat for each table):
CREATE POLICY company_isolation ON companies
  USING (
    id IN (
      SELECT company_id
      FROM company_users
      WHERE user_id = auth.uid()
    )
  );

-- Note: Full RLS policies would be defined for each table
-- following the pattern above, ensuring users can only access
-- data from companies they belong to.

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... (repeat for other tables)

-- ============================================

-- Calculate invoice totals automatically
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
  inv_subtotal DECIMAL(19, 4);
  inv_tax_total DECIMAL(19, 4);
  inv_total DECIMAL(19, 4);
BEGIN
  SELECT
    COALESCE(SUM(quantity * unit_price), 0),
    COALESCE(SUM(tax_amount), 0),
    COALESCE(SUM(amount), 0)
  INTO inv_subtotal, inv_tax_total, inv_total
  FROM invoice_lines
  WHERE invoice_id = NEW.invoice_id;

  UPDATE invoices
  SET
    subtotal = inv_subtotal,
    tax_total = inv_tax_total,
    total = inv_total,
    amount_due = inv_total - amount_paid
  WHERE id = NEW.invoice_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_invoice AFTER INSERT OR UPDATE OR DELETE ON invoice_lines
  FOR EACH ROW EXECUTE FUNCTION calculate_invoice_totals();

-- ============================================

-- Update invoice status based on payments
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
DECLARE
  inv_total DECIMAL(19, 4);
  inv_paid DECIMAL(19, 4);
  inv_status TEXT;
BEGIN
  SELECT total, amount_paid
  INTO inv_total, inv_paid
  FROM invoices
  WHERE id = NEW.invoice_id;

  IF inv_paid = 0 THEN
    inv_status := 'sent';
  ELSIF inv_paid >= inv_total THEN
    inv_status := 'paid';
  ELSE
    inv_status := 'partial';
  END IF;

  UPDATE invoices
  SET status = inv_status
  WHERE id = NEW.invoice_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_payment_status
  AFTER INSERT OR UPDATE OR DELETE ON payment_allocations
  FOR EACH ROW EXECUTE FUNCTION update_invoice_status();

-- ============================================
-- VIEWS (Pre-computed aggregations)
-- ============================================

-- Account balances (current state)
CREATE OR REPLACE VIEW account_balances AS
SELECT
  tl.company_id,
  tl.account_id,
  a.code,
  a.name,
  a.type,
  SUM(tl.amount) as balance,
  COUNT(tl.id) as transaction_count
FROM transaction_lines tl
JOIN transactions t ON tl.transaction_id = t.id
JOIN accounts a ON tl.account_id = a.id
WHERE t.status = 'posted'
GROUP BY tl.company_id, tl.account_id, a.code, a.name, a.type;

-- ============================================

-- Profit & Loss (Income Statement)
CREATE OR REPLACE VIEW profit_loss AS
SELECT
  company_id,
  DATE_TRUNC('month', t.transaction_date) as period,
  SUM(CASE WHEN a.type = 'revenue' THEN -tl.amount ELSE 0 END) as revenue,
  SUM(CASE WHEN a.type = 'expense' THEN tl.amount ELSE 0 END) as expenses,
  SUM(CASE WHEN a.type = 'revenue' THEN -tl.amount ELSE 0 END) -
  SUM(CASE WHEN a.type = 'expense' THEN tl.amount ELSE 0 END) as net_income
FROM transaction_lines tl
JOIN transactions t ON tl.transaction_id = t.id
JOIN accounts a ON tl.account_id = a.id
WHERE t.status = 'posted'
GROUP BY company_id, DATE_TRUNC('month', t.transaction_date);

-- ============================================

-- Accounts Receivable aging
CREATE OR REPLACE VIEW ar_aging AS
SELECT
  i.company_id,
  i.contact_id,
  c.name as customer_name,
  COUNT(i.id) as invoice_count,
  SUM(i.amount_due) as total_due,
  SUM(CASE WHEN CURRENT_DATE <= i.due_date THEN i.amount_due ELSE 0 END) as current,
  SUM(CASE WHEN CURRENT_DATE - i.due_date BETWEEN 1 AND 30 THEN i.amount_due ELSE 0 END) as days_1_30,
  SUM(CASE WHEN CURRENT_DATE - i.due_date BETWEEN 31 AND 60 THEN i.amount_due ELSE 0 END) as days_31_60,
  SUM(CASE WHEN CURRENT_DATE - i.due_date > 60 THEN i.amount_due ELSE 0 END) as days_over_60
FROM invoices i
JOIN contacts c ON i.contact_id = c.id
WHERE i.status IN ('sent', 'partial', 'overdue')
  AND i.amount_due > 0
GROUP BY i.company_id, i.contact_id, c.name;
```

---

## API Architecture (tRPC)

### Router Structure

```typescript
// src/server/api/root.ts
export const appRouter = router({
  auth: authRouter,
  companies: companiesRouter,
  invoices: invoicesRouter,
  transactions: transactionsRouter,
  contacts: contactsRouter,
  banking: bankingRouter,
  reports: reportsRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
```

### Example Router (Invoices)

```typescript
// src/server/api/routers/invoices.ts
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const invoicesRouter = router({
  // List invoices
  list: protectedProcedure
    .input(z.object({
      companyId: z.string().uuid(),
      status: z.enum(['draft', 'sent', 'paid', 'overdue', 'all']).optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ input, ctx }) => {
      // Verify user has access to company
      await ctx.services.companies.verifyAccess(ctx.user.id, input.companyId);

      // Fetch invoices with pagination
      return ctx.services.invoices.list(input);
    }),

  // Get single invoice
  get: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(async ({ input, ctx }) => {
      const invoice = await ctx.services.invoices.getById(input.id);

      // Verify access
      await ctx.services.companies.verifyAccess(ctx.user.id, invoice.companyId);

      return invoice;
    }),

  // Create invoice
  create: protectedProcedure
    .input(z.object({
      companyId: z.string().uuid(),
      contactId: z.string().uuid(),
      invoiceDate: z.string().date(),
      dueDate: z.string().date(),
      lines: z.array(z.object({
        description: z.string().min(1),
        quantity: z.number().positive(),
        unitPrice: z.number(),
        taxRate: z.number().min(0).max(1),
      })),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify access
      await ctx.services.companies.verifyAccess(ctx.user.id, input.companyId);

      // Create invoice
      const invoice = await ctx.services.invoices.create({
        ...input,
        createdBy: ctx.user.id,
      });

      // Audit log
      await ctx.services.audit.log({
        companyId: input.companyId,
        userId: ctx.user.id,
        action: 'create',
        entityType: 'invoice',
        entityId: invoice.id,
        newValues: invoice,
      });

      return invoice;
    }),

  // Send invoice
  send: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      to: z.string().email().optional(), // Override contact email
    }))
    .mutation(async ({ input, ctx }) => {
      const invoice = await ctx.services.invoices.getById(input.id);

      // Verify access
      await ctx.services.companies.verifyAccess(ctx.user.id, invoice.companyId);

      // Validate invoice is ready to send
      if (invoice.status !== 'draft' && invoice.status !== 'sent') {
        throw new Error('Invoice cannot be sent in current status');
      }

      // Generate PDF
      const pdfUrl = await ctx.services.invoices.generatePDF(invoice);

      // Send email
      await ctx.services.email.sendInvoice({
        to: input.to || invoice.contact.email,
        invoice,
        pdfUrl,
      });

      // Update status
      await ctx.services.invoices.update(invoice.id, {
        status: 'sent',
        sentAt: new Date(),
      });

      return { success: true };
    }),

  // Delete invoice
  delete: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      const invoice = await ctx.services.invoices.getById(input.id);

      // Verify access
      await ctx.services.companies.verifyAccess(ctx.user.id, invoice.companyId);

      // Can only delete draft invoices
      if (invoice.status !== 'draft') {
        throw new Error('Only draft invoices can be deleted');
      }

      await ctx.services.invoices.delete(input.id);

      return { success: true };
    }),
});
```

---

## Service Layer

### Accounting Engine (Core Business Logic)

```typescript
// src/server/services/accounting-engine.ts

/**
 * Core double-entry accounting engine
 * All financial transactions MUST go through this service
 */
export class AccountingEngine {
  /**
   * Post a journal entry (transaction)
   * Validates that debits = credits before posting
   */
  async postTransaction(data: {
    companyId: string;
    date: Date;
    description: string;
    lines: Array<{
      accountId: string;
      amount: number; // Positive = debit, Negative = credit
      contactId?: string;
    }>;
    sourceType: string;
    sourceId?: string;
    createdBy: string;
  }): Promise<Transaction> {
    // Validate balances
    const sum = data.lines.reduce((acc, line) => acc + line.amount, 0);
    if (Math.abs(sum) > 0.01) {
      throw new AccountingError(`Transaction does not balance. Difference: ${sum}`);
    }

    // Create transaction
    const transaction = await db.transaction(async (tx) => {
      const txn = await tx.insert(transactions).values({
        ...data,
        status: 'posted',
        postedAt: new Date(),
      }).returning();

      // Insert lines
      await tx.insert(transactionLines).values(
        data.lines.map(line => ({
          transactionId: txn.id,
          companyId: data.companyId,
          ...line,
        }))
      );

      // Update account balances (denormalized)
      for (const line of data.lines) {
        await tx.update(accounts)
          .set({
            currentBalance: sql`current_balance + ${line.amount}`
          })
          .where(eq(accounts.id, line.accountId));
      }

      return txn;
    });

    // Emit event for real-time updates
    await this.events.emit('transaction.posted', transaction);

    return transaction;
  }

  /**
   * Record invoice as accounts receivable
   */
  async recordInvoice(invoice: Invoice): Promise<void> {
    // Get accounts
    const arAccount = await this.getAccountByType(invoice.companyId, 'accounts_receivable');
    const revenueAccounts = await this.getRevenueAccountsForInvoice(invoice);

    // Create transaction
    await this.postTransaction({
      companyId: invoice.companyId,
      date: invoice.invoiceDate,
      description: `Invoice ${invoice.invoiceNumber}`,
      lines: [
        // Debit AR (increase asset)
        {
          accountId: arAccount.id,
          amount: invoice.total,
          contactId: invoice.contactId,
        },
        // Credit Revenue (increase revenue) - split by line items
        ...revenueAccounts.map(line => ({
          accountId: line.accountId,
          amount: -line.amount, // Negative = credit
        })),
      ],
      sourceType: 'invoice',
      sourceId: invoice.id,
      createdBy: invoice.createdBy,
    });
  }

  /**
   * Record payment against invoice
   */
  async recordPayment(payment: Payment, allocations: PaymentAllocation[]): Promise<void> {
    // Get accounts
    const bankAccount = await this.getAccount(payment.bankAccountId);
    const arAccount = await this.getAccountByType(payment.companyId, 'accounts_receivable');

    // Create transaction
    await this.postTransaction({
      companyId: payment.companyId,
      date: payment.paymentDate,
      description: `Payment ${payment.reference || ''}`,
      lines: [
        // Debit Bank (increase asset)
        {
          accountId: bankAccount.id,
          amount: payment.amount,
        },
        // Credit AR (decrease asset)
        {
          accountId: arAccount.id,
          amount: -payment.amount,
          contactId: payment.contactId,
        },
      ],
      sourceType: 'payment',
      sourceId: payment.id,
      createdBy: payment.createdBy,
    });

    // Update invoices
    for (const allocation of allocations) {
      await this.updateInvoicePaidAmount(allocation.invoiceId, allocation.amount);
    }
  }
}
```

---

## Background Jobs (BullMQ)

```typescript
// src/server/jobs/index.ts
import { Queue, Worker } from 'bullmq';

// Define queues
export const queues = {
  bankSync: new Queue('bank-sync', { connection: redis }),
  emailSend: new Queue('email-send', { connection: redis }),
  reportGeneration: new Queue('report-generation', { connection: redis }),
  aiCategorization: new Queue('ai-categorization', { connection: redis }),
};

// Bank sync worker
new Worker('bank-sync', async (job) => {
  const { bankAccountId } = job.data;

  try {
    // Fetch transactions from Plaid
    const plaidTransactions = await plaid.transactions.get({
      access_token: bankAccount.plaidAccessToken,
      start_date: getLastSyncDate(bankAccountId),
      end_date: today(),
    });

    // Import into database
    for (const txn of plaidTransactions) {
      await importBankTransaction(bankAccountId, txn);

      // Trigger AI categorization
      await queues.aiCategorization.add('categorize', {
        bankTransactionId: txn.id,
      });
    }

    // Update last synced timestamp
    await updateBankAccountSyncStatus(bankAccountId, 'success');

  } catch (error) {
    await updateBankAccountSyncStatus(bankAccountId, 'error');
    throw error;
  }
}, { connection: redis });

// Email worker
new Worker('email-send', async (job) => {
  const { type, to, data } = job.data;

  switch (type) {
    case 'invoice':
      await sendInvoiceEmail(to, data);
      break;
    case 'payment_reminder':
      await sendPaymentReminderEmail(to, data);
      break;
    case 'tax_deadline':
      await sendTaxDeadlineEmail(to, data);
      break;
  }
}, { connection: redis });
```

---

## Real-time Architecture

```typescript
// src/server/websocket.ts
import { Server } from 'socket.io';

export function setupWebSocket(server) {
  const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    const user = await verifyToken(token);

    if (!user) {
      return next(new Error('Authentication failed'));
    }

    socket.data.user = user;
    next();
  });

  io.on('connection', async (socket) => {
    const userId = socket.data.user.id;

    // Join user-specific room
    socket.join(`user:${userId}`);

    // Join company rooms
    const companies = await getUserCompanies(userId);
    companies.forEach(company => {
      socket.join(`company:${company.id}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', userId);
    });
  });

  return io;
}

// Emit events
export async function emitToCompany(companyId: string, event: string, data: any) {
  io.to(`company:${companyId}`).emit(event, data);
}

// Usage in services
await accountingEngine.postTransaction(data);
await emitToCompany(data.companyId, 'transaction.created', transaction);
```

---

## Caching Strategy (Redis)

```typescript
// src/server/cache.ts
import { Redis } from 'ioredis';

export const cache = new Redis(process.env.REDIS_URL);

// Cache patterns
export const cacheKeys = {
  // User session
  session: (sessionId: string) => `session:${sessionId}`,

  // Dashboard data (30 second TTL)
  dashboard: (companyId: string) => `dashboard:${companyId}`,

  // Reports (5 minute TTL)
  report: (companyId: string, type: string, params: string) =>
    `report:${companyId}:${type}:${params}`,

  // Account balances (1 minute TTL)
  accountBalance: (accountId: string) => `balance:${accountId}`,
};

// Helper functions
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 60
): Promise<T> {
  // Try cache first
  const cached = await cache.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch fresh data
  const data = await fetcher();

  // Store in cache
  await cache.setex(key, ttl, JSON.stringify(data));

  return data;
}

// Invalidation
export async function invalidateCache(pattern: string) {
  const keys = await cache.keys(pattern);
  if (keys.length > 0) {
    await cache.del(...keys);
  }
}

// Usage
const dashboard = await getCached(
  cacheKeys.dashboard(companyId),
  async () => await services.dashboard.getData(companyId),
  30 // 30 second TTL
);
```

---

## Testing Strategy

```typescript
// tests/integration/invoices.test.ts
import { test, expect } from 'vitest';
import { createTestCompany, createTestUser } from './helpers';

test('invoice creation flow', async () => {
  // Setup
  const company = await createTestCompany();
  const user = await createTestUser({ companyId: company.id });
  const contact = await createTestContact({ companyId: company.id });

  // Create invoice
  const invoice = await services.invoices.create({
    companyId: company.id,
    contactId: contact.id,
    invoiceDate: new Date(),
    dueDate: addDays(new Date(), 30),
    lines: [
      {
        description: 'Web Design Services',
        quantity: 10,
        unitPrice: 100,
        taxRate: 0.20,
      },
    ],
    createdBy: user.id,
  });

  // Assertions
  expect(invoice.subtotal).toBe(1000);
  expect(invoice.taxTotal).toBe(200);
  expect(invoice.total).toBe(1200);
  expect(invoice.status).toBe('draft');

  // Send invoice
  await services.invoices.send(invoice.id, user.id);

  const updated = await services.invoices.getById(invoice.id);
  expect(updated.status).toBe('sent');
  expect(updated.sentAt).toBeTruthy();

  // Verify accounting transaction created
  const transaction = await services.transactions.findBySource('invoice', invoice.id);
  expect(transaction).toBeTruthy();
  expect(transaction.lines.length).toBe(2); // AR debit, Revenue credit

  // Verify balances
  const arBalance = await services.accounts.getBalance(company.arAccountId);
  expect(arBalance).toBe(1200);
});

// tests/e2e/invoice-flow.spec.ts
import { test, expect } from '@playwright/test';

test('user can create and send invoice', async ({ page }) => {
  await page.goto('/dashboard');

  // Click "New Invoice" button
  await page.click('text=New Invoice');

  // Fill invoice form
  await page.selectOption('[name=contactId]', { label: 'Acme Corp' });
  await page.fill('[name="lines[0].description"]', 'Consulting Services');
  await page.fill('[name="lines[0].quantity"]', '10');
  await page.fill('[name="lines[0].unitPrice"]', '150');

  // Verify preview updates
  await expect(page.locator('text=Subtotal: $1,500.00')).toBeVisible();
  await expect(page.locator('text=Total: $1,500.00')).toBeVisible();

  // Save as draft
  await page.click('text=Save Draft');
  await expect(page.locator('text=Invoice saved')).toBeVisible();

  // Send invoice
  await page.click('text=Send Invoice');
  await expect(page.locator('text=Invoice sent')).toBeVisible();

  // Verify email was triggered (check mock or test email)
  // Verify status changed to "Sent"
  await expect(page.locator('[data-status="sent"]')).toBeVisible();
});
```

---

## Deployment Architecture

```yaml
# docker-compose.yml (local development)
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: forkioo_dev
      POSTGRES_USER: forkioo
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025" # SMTP
      - "8025:8025" # Web UI

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://forkioo:password@postgres:5432/forkioo_dev
      REDIS_URL: redis://redis:6379
      SMTP_HOST: mailhog
      SMTP_PORT: 1025
    depends_on:
      - postgres
      - redis
    volumes:
      - .:/app
      - /app/node_modules

volumes:
  postgres_data:
  redis_data:
```

---

This architecture provides:
- **Scalability**: Horizontal scaling via stateless services
- **Reliability**: ACID compliance, audit trails, idempotent APIs
- **Security**: Multi-tenant isolation, encryption, rate limiting
- **Performance**: Caching, denormalization, optimistic updates
- **Maintainability**: Type safety, testing, clear separation of concerns

Next steps: Implement Phase 1 (Foundation).
