import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc";
import { db } from "@/lib/db";

// Account type enum
const AccountType = z.enum(["asset", "liability", "equity", "revenue", "expense"]);

// Input schemas
const createAccountInput = z.object({
  code: z.string().min(1, "Account code is required"),
  name: z.string().min(1, "Account name is required"),
  type: AccountType,
  subType: z.string().optional(),
  isBankAccount: z.boolean().default(false),
  isControlAccount: z.boolean().default(false),
  parentAccountId: z.string().uuid().optional(),
  taxCategory: z.string().optional(),
});

const updateAccountInput = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  type: AccountType.optional(),
  subType: z.string().optional(),
  isBankAccount: z.boolean().optional(),
  isControlAccount: z.boolean().optional(),
  parentAccountId: z.string().uuid().optional(),
  taxCategory: z.string().optional(),
  isActive: z.boolean().optional(),
});

const listAccountsInput = z.object({
  type: AccountType.optional(),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  isBankAccount: z.boolean().optional(),
  limit: z.number().min(1).max(500).default(100),
  offset: z.number().min(0).default(0),
});

const getAccountInput = z.object({
  id: z.string().uuid(),
});

const deleteAccountInput = z.object({
  id: z.string().uuid(),
});

const getBalanceInput = z.object({
  id: z.string().uuid(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const accountsRouter = router({
  /**
   * List all accounts for the company
   */
  list: protectedProcedure
    .input(listAccountsInput)
    .query(async ({ ctx, input }) => {
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

      // Build where clause
      const where: any = {
        companyId,
        ...(input.type && { type: input.type }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.isBankAccount !== undefined && { isBankAccount: input.isBankAccount }),
        ...(input.search && {
          OR: [
            { code: { contains: input.search, mode: "insensitive" as const } },
            { name: { contains: input.search, mode: "insensitive" as const } },
          ],
        }),
      };

      // Fetch accounts
      const [accounts, total] = await Promise.all([
        db.account.findMany({
          where,
          orderBy: [
            { type: "asc" },
            { code: "asc" },
          ],
          take: input.limit,
          skip: input.offset,
        }),
        db.account.count({ where }),
      ]);

      return {
        accounts,
        total,
        hasMore: input.offset + accounts.length < total,
      };
    }),

  /**
   * Get account by ID with transaction summary
   */
  getById: protectedProcedure
    .input(getAccountInput)
    .query(async ({ ctx, input }) => {
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

      // Fetch account
      const account = await db.account.findFirst({
        where: {
          id: input.id,
          companyId: companyUser.companyId,
        },
      });

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found.",
        });
      }

      // Get recent transactions
      const recentTransactions = await db.transactionLine.findMany({
        where: {
          accountId: input.id,
          companyId: companyUser.companyId,
        },
        include: {
          transaction: {
            select: {
              id: true,
              transactionDate: true,
              description: true,
              reference: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      });

      return {
        ...account,
        recentTransactions,
      };
    }),

  /**
   * Create a new account
   */
  create: protectedProcedure
    .input(createAccountInput)
    .mutation(async ({ ctx, input }) => {
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

      // Check permission
      if (companyUser.role !== "owner" && companyUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to create accounts.",
        });
      }

      const companyId = companyUser.companyId;

      // Check if code already exists
      const existingAccount = await db.account.findFirst({
        where: {
          companyId,
          code: input.code,
        },
      });

      if (existingAccount) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this code already exists.",
        });
      }

      // Validate parent account if specified
      if (input.parentAccountId) {
        const parentAccount = await db.account.findFirst({
          where: {
            id: input.parentAccountId,
            companyId,
          },
        });

        if (!parentAccount) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent account not found.",
          });
        }

        // Parent must be same type
        if (parentAccount.type !== input.type) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Parent account must be of the same type.",
          });
        }
      }

      // Get company currency
      const company = await db.company.findUnique({
        where: { id: companyId },
        select: { currency: true },
      });

      // Create account
      const account = await db.account.create({
        data: {
          companyId,
          code: input.code,
          name: input.name,
          type: input.type,
          subType: input.subType,
          isBankAccount: input.isBankAccount,
          isControlAccount: input.isControlAccount,
          parentAccountId: input.parentAccountId,
          taxCategory: input.taxCategory,
          currency: company?.currency || "USD",
          isSystem: false,
        },
      });

      return account;
    }),

  /**
   * Update an existing account
   */
  update: protectedProcedure
    .input(updateAccountInput)
    .mutation(async ({ ctx, input }) => {
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

      // Check permission
      if (companyUser.role !== "owner" && companyUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update accounts.",
        });
      }

      const companyId = companyUser.companyId;

      // Check if account exists
      const existingAccount = await db.account.findFirst({
        where: {
          id: input.id,
          companyId,
        },
      });

      if (!existingAccount) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found.",
        });
      }

      // Can't modify system accounts
      if (existingAccount.isSystem) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot modify system accounts.",
        });
      }

      // Check for code conflicts
      if (input.code && input.code !== existingAccount.code) {
        const codeConflict = await db.account.findFirst({
          where: {
            companyId,
            code: input.code,
            id: { not: input.id },
          },
        });

        if (codeConflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An account with this code already exists.",
          });
        }
      }

      // Validate parent account if specified
      if (input.parentAccountId) {
        const parentAccount = await db.account.findFirst({
          where: {
            id: input.parentAccountId,
            companyId,
          },
        });

        if (!parentAccount) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent account not found.",
          });
        }

        // Parent must be same type
        const accountType = input.type || existingAccount.type;
        if (parentAccount.type !== accountType) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Parent account must be of the same type.",
          });
        }

        // Can't set self as parent
        if (input.parentAccountId === input.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "An account cannot be its own parent.",
          });
        }
      }

      // Update account
      const account = await db.account.update({
        where: { id: input.id },
        data: {
          code: input.code,
          name: input.name,
          type: input.type,
          subType: input.subType,
          isBankAccount: input.isBankAccount,
          isControlAccount: input.isControlAccount,
          parentAccountId: input.parentAccountId,
          taxCategory: input.taxCategory,
          isActive: input.isActive,
        },
      });

      return account;
    }),

  /**
   * Delete or deactivate an account
   */
  delete: protectedProcedure
    .input(deleteAccountInput)
    .mutation(async ({ ctx, input }) => {
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

      // Check permission
      if (companyUser.role !== "owner" && companyUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete accounts.",
        });
      }

      const companyId = companyUser.companyId;

      // Check if account exists
      const account = await db.account.findFirst({
        where: {
          id: input.id,
          companyId,
        },
      });

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found.",
        });
      }

      // Can't delete system accounts
      if (account.isSystem) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete system accounts.",
        });
      }

      // Check if account has transactions
      const transactionCount = await db.transactionLine.count({
        where: {
          accountId: input.id,
        },
      });

      if (transactionCount > 0) {
        // Deactivate instead of delete
        await db.account.update({
          where: { id: input.id },
          data: { isActive: false },
        });

        return {
          success: true,
          deactivated: true,
          message: "Account has transactions and was deactivated instead of deleted.",
        };
      }

      // Safe to delete
      await db.account.delete({
        where: { id: input.id },
      });

      return {
        success: true,
        deactivated: false,
      };
    }),

  /**
   * Get account hierarchy (tree structure)
   */
  getHierarchy: protectedProcedure.query(async ({ ctx }) => {
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

    // Get all accounts
    const accounts = await db.account.findMany({
      where: { companyId, isActive: true },
      orderBy: [{ type: "asc" }, { code: "asc" }],
    });

    // Build hierarchy grouped by type
    const hierarchy: Record<string, any[]> = {
      asset: [],
      liability: [],
      equity: [],
      revenue: [],
      expense: [],
    };

    // Helper to build tree
    const buildTree = (parentId: string | null, type: string): any[] => {
      return accounts
        .filter((a) => a.parentAccountId === parentId && a.type === type)
        .map((account) => ({
          ...account,
          children: buildTree(account.id, type),
        }));
    };

    // Build tree for each type
    for (const type of Object.keys(hierarchy)) {
      hierarchy[type] = buildTree(null, type);
    }

    return hierarchy;
  }),

  /**
   * Get account balance and activity
   */
  getBalance: protectedProcedure
    .input(getBalanceInput)
    .query(async ({ ctx, input }) => {
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

      // Get account
      const account = await db.account.findFirst({
        where: {
          id: input.id,
          companyId,
        },
      });

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found.",
        });
      }

      // Build date filter
      const dateFilter: any = {};
      if (input.startDate || input.endDate) {
        dateFilter.transaction = {
          transactionDate: {
            ...(input.startDate && { gte: input.startDate }),
            ...(input.endDate && { lte: input.endDate }),
          },
        };
      }

      // Get transaction lines
      const transactionLines = await db.transactionLine.findMany({
        where: {
          accountId: input.id,
          companyId,
          ...dateFilter,
        },
        include: {
          transaction: {
            select: {
              transactionDate: true,
            },
          },
        },
      });

      // Calculate balance
      const balance = transactionLines.reduce((sum, line) => {
        return sum + Number(line.amount);
      }, 0);

      // Get period activity
      const debits = transactionLines
        .filter((l) => Number(l.amount) > 0)
        .reduce((sum, l) => sum + Number(l.amount), 0);

      const credits = transactionLines
        .filter((l) => Number(l.amount) < 0)
        .reduce((sum, l) => sum + Math.abs(Number(l.amount)), 0);

      return {
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        accountType: account.type,
        currentBalance: Number(account.currentBalance),
        periodBalance: balance,
        debits,
        credits,
        transactionCount: transactionLines.length,
      };
    }),

  /**
   * Get account types summary
   */
  getTypesSummary: protectedProcedure.query(async ({ ctx }) => {
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

    // Get account counts and balances by type
    const summary = await db.account.groupBy({
      by: ["type"],
      where: {
        companyId,
        isActive: true,
      },
      _count: {
        type: true,
      },
      _sum: {
        currentBalance: true,
      },
    });

    return summary.map((item) => ({
      type: item.type,
      count: item._count.type,
      totalBalance: Number(item._sum.currentBalance || 0),
    }));
  }),
});
