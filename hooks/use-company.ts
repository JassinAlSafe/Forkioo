/**
 * Custom hook for company settings and operations
 * Provides a clean API for managing company profile, settings, and preferences
 */

import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import type { BusinessType, Currency } from "@/types/enums";

interface UpdateCompanyProfileInput {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  taxId?: string;
  businessType?: BusinessType;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  logo?: string;
}

interface UpdateCompanySettingsInput {
  defaultCurrency?: Currency;
  fiscalYearEnd?: string; // MM-DD format
  defaultPaymentTerms?: number;
  invoicePrefix?: string;
  invoiceNumberFormat?: string;
  expensePrefix?: string;
  expenseNumberFormat?: string;
  locale?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
}

interface UpdateInvoiceSettingsInput {
  defaultPaymentTerms?: number;
  invoicePrefix?: string;
  nextInvoiceNumber?: number;
  invoiceNumberFormat?: string;
  showTaxColumn?: boolean;
  showDiscountColumn?: boolean;
  defaultTaxRate?: number;
  defaultNotes?: string;
  defaultTerms?: string;
  emailSubject?: string;
  emailBody?: string;
}

interface UpdateExpenseSettingsInput {
  expensePrefix?: string;
  nextExpenseNumber?: number;
  expenseNumberFormat?: string;
  requireReceipt?: boolean;
  requireApproval?: boolean;
  autoApproveUnder?: number;
  defaultExpenseAccount?: string;
}

export function useCompany() {
  const utils = trpc.useUtils();

  // Queries
  const getProfile = () => trpc.company.getProfile.useQuery();

  const getSettings = () => trpc.company.getSettings.useQuery();

  const getStats = () => trpc.company.getStats.useQuery();

  // Profile Mutations
  const updateProfile = trpc.company.updateProfile.useMutation({
    onSuccess: () => {
      utils.company.getProfile.invalidate();
      utils.company.getStats.invalidate();
      toast.success("Company profile updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });

  const uploadLogo = trpc.company.uploadLogo.useMutation({
    onSuccess: () => {
      utils.company.getProfile.invalidate();
      toast.success("Logo uploaded successfully");
    },
    onError: (error) => {
      toast.error(`Failed to upload logo: ${error.message}`);
    },
  });

  // Settings Mutations
  const updateSettings = trpc.company.updateSettings.useMutation({
    onSuccess: () => {
      utils.company.getSettings.invalidate();
      toast.success("Company settings updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });

  const updateInvoiceSettings = trpc.company.updateInvoiceSettings.useMutation({
    onSuccess: () => {
      utils.company.getSettings.invalidate();
      toast.success("Invoice settings updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update invoice settings: ${error.message}`);
    },
  });

  const updateExpenseSettings = trpc.company.updateExpenseSettings.useMutation({
    onSuccess: () => {
      utils.company.getSettings.invalidate();
      toast.success("Expense settings updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update expense settings: ${error.message}`);
    },
  });

  return {
    // Queries
    getProfile,
    getSettings,
    getStats,

    // Mutations
    updateProfile,
    uploadLogo,
    updateSettings,
    updateInvoiceSettings,
    updateExpenseSettings,
  };
}
