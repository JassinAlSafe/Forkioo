-- Phase 4 Database Migration
-- Adds Expense table and related schema changes

-- Create expenses table
CREATE TABLE IF NOT EXISTS "expenses" (
  "id" TEXT NOT NULL,
  "company_id" TEXT NOT NULL,
  "expense_date" DATE NOT NULL,
  "amount" DECIMAL(19,4) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "description" TEXT NOT NULL,
  "merchant" TEXT,
  "category" TEXT,
  "payment_method" TEXT,
  "contact_id" TEXT,
  "expense_account_id" TEXT,
  "transaction_id" TEXT,
  "tax_amount" DECIMAL(19,4) NOT NULL DEFAULT 0,
  "is_tax_deductible" BOOLEAN NOT NULL DEFAULT true,
  "receipt_url" TEXT,
  "attachments" JSONB NOT NULL DEFAULT '[]',
  "status" TEXT NOT NULL DEFAULT 'draft',
  "submitted_at" TIMESTAMP(3),
  "submitted_by" TEXT,
  "approved_at" TIMESTAMP(3),
  "approved_by" TEXT,
  "rejected_at" TIMESTAMP(3),
  "rejected_by" TEXT,
  "reject_reason" TEXT,
  "notes" TEXT,
  "tags" JSONB NOT NULL DEFAULT '[]',
  "created_by" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- Create indexes for expenses
CREATE INDEX IF NOT EXISTS "expenses_company_id_idx" ON "expenses"("company_id");
CREATE INDEX IF NOT EXISTS "expenses_contact_id_idx" ON "expenses"("contact_id");
CREATE INDEX IF NOT EXISTS "expenses_company_id_expense_date_idx" ON "expenses"("company_id", "expense_date");
CREATE INDEX IF NOT EXISTS "expenses_company_id_status_idx" ON "expenses"("company_id", "status");

-- Add foreign key constraints
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_company_id_fkey"
  FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "expenses" ADD CONSTRAINT "expenses_contact_id_fkey"
  FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "expenses" ADD CONSTRAINT "expenses_expense_account_id_fkey"
  FOREIGN KEY ("expense_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "expenses" ADD CONSTRAINT "expenses_transaction_id_fkey"
  FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add relation from accounts to expenses (if not exists)
-- The accounts table should already have been created in initial migration

-- Add relation from contacts to expenses
-- The contacts table should already exist

-- Add relation from transactions to expenses
-- The transactions table should already exist

COMMENT ON TABLE "expenses" IS 'Business expense records with approval workflow';
