import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc";
import { db } from "@/lib/db";

// Input schemas for company operations
const updateCompanyProfileInput = z.object({
  name: z.string().min(1, "Company name is required"),
  businessType: z.enum(["sole_proprietor", "llc", "corporation", "partnership", "other"]).optional(),
  taxId: z.string().optional(),
  countryCode: z.string().length(2).optional(),
  fiscalYearEnd: z.string().regex(/^\d{2}-\d{2}$/).optional(), // MM-DD format
});

const updateCompanySettingsInput = z.object({
  // Invoice settings
  invoicePrefix: z.string().optional(),
  invoiceNumberStart: z.number().int().positive().optional(),
  defaultPaymentTermsDays: z.number().int().positive().optional(),
  defaultDueDate: z.number().int().positive().optional(),

  // Branding
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),

  // Invoice template
  invoiceFooter: z.string().optional(),
  invoiceNotes: z.string().optional(),
  invoiceTerms: z.string().optional(),

  // Email settings
  emailFromName: z.string().optional(),
  emailReplyTo: z.string().email().optional(),

  // Tax settings
  defaultTaxRate: z.number().min(0).max(100).optional(),
  taxLabel: z.string().optional(),
  taxNumber: z.string().optional(),

  // Currency
  currency: z.string().length(3).optional(),

  // Address
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

export const companyRouter = router({
  /**
   * Get company profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    // Get user's company
    const companyUser = await db.companyUser.findFirst({
      where: { userId },
      include: { company: true },
    });

    if (!companyUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "You don't belong to any company.",
      });
    }

    return companyUser.company;
  }),

  /**
   * Update company profile
   */
  updateProfile: protectedProcedure
    .input(updateCompanyProfileInput)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      // Get user's company and check permissions
      const companyUser = await db.companyUser.findFirst({
        where: { userId },
        include: { company: true },
      });

      if (!companyUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "You don't belong to any company.",
        });
      }

      // Check if user has permission to update settings
      if (companyUser.role !== "owner" && companyUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update company profile.",
        });
      }

      // Update company
      const company = await db.company.update({
        where: { id: companyUser.companyId },
        data: {
          name: input.name,
          businessType: input.businessType,
          taxId: input.taxId,
          countryCode: input.countryCode,
          fiscalYearEnd: input.fiscalYearEnd,
        },
      });

      return company;
    }),

  /**
   * Get company settings
   */
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    // Get user's company
    const companyUser = await db.companyUser.findFirst({
      where: { userId },
      include: { company: true },
    });

    if (!companyUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "You don't belong to any company.",
      });
    }

    return {
      id: companyUser.company.id,
      name: companyUser.company.name,
      currency: companyUser.company.currency,
      settings: companyUser.company.settings as Record<string, any>,
    };
  }),

  /**
   * Update company settings
   */
  updateSettings: protectedProcedure
    .input(updateCompanySettingsInput)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      // Get user's company and check permissions
      const companyUser = await db.companyUser.findFirst({
        where: { userId },
        include: { company: true },
      });

      if (!companyUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "You don't belong to any company.",
        });
      }

      // Check if user has permission to update settings
      if (companyUser.role !== "owner" && companyUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update company settings.",
        });
      }

      // Get current settings
      const currentSettings = (companyUser.company.settings as Record<string, any>) || {};

      // Merge new settings with current settings
      const updatedSettings = {
        ...currentSettings,
        ...input,
      };

      // Update currency if provided
      const updateData: any = {
        settings: updatedSettings,
      };

      if (input.currency) {
        updateData.currency = input.currency;
      }

      // Update company
      const company = await db.company.update({
        where: { id: companyUser.companyId },
        data: updateData,
      });

      return {
        id: company.id,
        name: company.name,
        currency: company.currency,
        settings: company.settings as Record<string, any>,
      };
    }),

  /**
   * Get company statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    // Get user's company
    const companyUser = await db.companyUser.findFirst({
      where: { userId },
    });

    if (!companyUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "You don't belong to any company.",
      });
    }

    const companyId = companyUser.companyId;

    // Get various counts
    const [
      invoiceCount,
      customerCount,
      expenseCount,
      userCount,
      accountCount,
    ] = await Promise.all([
      db.invoice.count({ where: { companyId } }),
      db.contact.count({ where: { companyId, type: "customer" } }),
      db.expense.count({ where: { companyId } }),
      db.companyUser.count({ where: { companyId } }),
      db.account.count({ where: { companyId } }),
    ]);

    return {
      invoices: invoiceCount,
      customers: customerCount,
      expenses: expenseCount,
      users: userCount,
      accounts: accountCount,
    };
  }),
});
