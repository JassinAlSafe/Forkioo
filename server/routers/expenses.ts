import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import { db } from "@/lib/db";

// Input schemas for expense operations
const createExpenseInput = z.object({
  expenseDate: z.date(),
  amount: z.number().positive(),
  description: z.string().min(1, "Description is required"),
  merchant: z.string().optional(),
  category: z.string().optional(),
  paymentMethod: z.enum(["cash", "credit_card", "bank_transfer", "other"]).optional(),
  contactId: z.string().uuid().optional(),
  taxAmount: z.number().min(0).optional(),
  isTaxDeductible: z.boolean().default(true),
  receiptUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

const updateExpenseInput = z.object({
  id: z.string().uuid(),
  expenseDate: z.date().optional(),
  amount: z.number().positive().optional(),
  description: z.string().min(1).optional(),
  merchant: z.string().optional(),
  category: z.string().optional(),
  paymentMethod: z.enum(["cash", "credit_card", "bank_transfer", "other"]).optional(),
  contactId: z.string().uuid().optional(),
  taxAmount: z.number().min(0).optional(),
  isTaxDeductible: z.boolean().optional(),
  receiptUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

const listExpensesInput = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(["draft", "submitted", "approved", "rejected", "paid", "all"]).default("all"),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

const deleteExpenseInput = z.object({
  id: z.string().uuid(),
});

const getByIdInput = z.object({
  id: z.string().uuid(),
});

const approveExpenseInput = z.object({
  id: z.string().uuid(),
});

const rejectExpenseInput = z.object({
  id: z.string().uuid(),
  reason: z.string().min(1, "Rejection reason is required"),
});

export const expensesRouter = createTRPCRouter({
  /**
   * List all expenses for the user's company
   */
  list: protectedProcedure
    .input(listExpensesInput)
    .query(async ({ ctx, input }) => {
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

      const companyId = companyUser.companyId;

      // Build where clause
      const where: any = {
        companyId,
        ...(input.status !== "all" && { status: input.status }),
        ...(input.category && { category: input.category }),
        ...(input.search && {
          OR: [
            { description: { contains: input.search, mode: "insensitive" as const } },
            { merchant: { contains: input.search, mode: "insensitive" as const } },
            { notes: { contains: input.search, mode: "insensitive" as const } },
          ],
        }),
      };

      // Fetch expenses
      const [expenses, total] = await Promise.all([
        db.expense.findMany({
          where,
          orderBy: { expenseDate: "desc" },
          take: input.limit,
          skip: input.offset,
          include: {
            contact: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        db.expense.count({ where }),
      ]);

      return {
        expenses,
        total,
        hasMore: input.offset + expenses.length < total,
      };
    }),

  /**
   * Get a single expense by ID
   */
  getById: protectedProcedure
    .input(getByIdInput)
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

      // Fetch expense
      const expense = await db.expense.findFirst({
        where: {
          id: input.id,
          companyId: companyUser.companyId,
        },
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!expense) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found.",
        });
      }

      return expense;
    }),

  /**
   * Create a new expense
   */
  create: protectedProcedure
    .input(createExpenseInput)
    .mutation(async ({ ctx, input }) => {
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

      const companyId = companyUser.companyId;

      // Create expense
      const expense = await db.expense.create({
        data: {
          companyId,
          expenseDate: input.expenseDate,
          amount: input.amount,
          description: input.description,
          merchant: input.merchant,
          category: input.category,
          paymentMethod: input.paymentMethod,
          contactId: input.contactId,
          taxAmount: input.taxAmount || 0,
          isTaxDeductible: input.isTaxDeductible,
          receiptUrl: input.receiptUrl,
          notes: input.notes,
          currency: companyUser.company.currency,
          createdBy: userId,
        },
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return expense;
    }),

  /**
   * Update an existing expense
   */
  update: protectedProcedure
    .input(updateExpenseInput)
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

      const companyId = companyUser.companyId;

      // Check if expense exists and belongs to user's company
      const existingExpense = await db.expense.findFirst({
        where: {
          id: input.id,
          companyId,
        },
      });

      if (!existingExpense) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found.",
        });
      }

      // Can't edit approved or paid expenses
      if (existingExpense.status === "approved" || existingExpense.status === "paid") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot edit approved or paid expenses.",
        });
      }

      // Update expense
      const expense = await db.expense.update({
        where: { id: input.id },
        data: {
          expenseDate: input.expenseDate,
          amount: input.amount,
          description: input.description,
          merchant: input.merchant,
          category: input.category,
          paymentMethod: input.paymentMethod,
          contactId: input.contactId,
          taxAmount: input.taxAmount,
          isTaxDeductible: input.isTaxDeductible,
          receiptUrl: input.receiptUrl,
          notes: input.notes,
        },
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return expense;
    }),

  /**
   * Delete an expense
   */
  delete: protectedProcedure
    .input(deleteExpenseInput)
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

      const companyId = companyUser.companyId;

      // Check if expense exists and belongs to user's company
      const expense = await db.expense.findFirst({
        where: {
          id: input.id,
          companyId,
        },
      });

      if (!expense) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found.",
        });
      }

      // Can't delete approved or paid expenses
      if (expense.status === "approved" || expense.status === "paid") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete approved or paid expenses.",
        });
      }

      // Delete expense
      await db.expense.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Approve an expense
   */
  approve: protectedProcedure
    .input(approveExpenseInput)
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

      // Check if user has permission to approve
      if (companyUser.role !== "owner" && companyUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to approve expenses.",
        });
      }

      const companyId = companyUser.companyId;

      // Check if expense exists
      const expense = await db.expense.findFirst({
        where: {
          id: input.id,
          companyId,
        },
      });

      if (!expense) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found.",
        });
      }

      // Update expense status
      const updatedExpense = await db.expense.update({
        where: { id: input.id },
        data: {
          status: "approved",
          approvedAt: new Date(),
          approvedBy: userId,
        },
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return updatedExpense;
    }),

  /**
   * Reject an expense
   */
  reject: protectedProcedure
    .input(rejectExpenseInput)
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

      // Check if user has permission to reject
      if (companyUser.role !== "owner" && companyUser.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to reject expenses.",
        });
      }

      const companyId = companyUser.companyId;

      // Check if expense exists
      const expense = await db.expense.findFirst({
        where: {
          id: input.id,
          companyId,
        },
      });

      if (!expense) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found.",
        });
      }

      // Update expense status
      const updatedExpense = await db.expense.update({
        where: { id: input.id },
        data: {
          status: "rejected",
          rejectedAt: new Date(),
          rejectedBy: userId,
          rejectReason: input.reason,
        },
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return updatedExpense;
    }),

  /**
   * Get expense statistics
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

    // Get expense stats
    const [
      totalExpenses,
      pendingExpenses,
      approvedExpenses,
      totalAmount,
      thisMonthAmount,
    ] = await Promise.all([
      db.expense.count({ where: { companyId } }),
      db.expense.count({ where: { companyId, status: "submitted" } }),
      db.expense.count({ where: { companyId, status: "approved" } }),
      db.expense.aggregate({
        where: { companyId },
        _sum: { amount: true },
      }),
      db.expense.aggregate({
        where: {
          companyId,
          expenseDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      total: totalExpenses,
      pending: pendingExpenses,
      approved: approvedExpenses,
      totalAmount: Number(totalAmount._sum.amount || 0),
      thisMonthAmount: Number(thisMonthAmount._sum.amount || 0),
    };
  }),

  /**
   * Get expense categories with counts
   */
  getCategories: protectedProcedure.query(async ({ ctx }) => {
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

    // Get categories with counts
    const categories = await db.expense.groupBy({
      by: ["category"],
      where: {
        companyId,
        category: { not: null },
      },
      _count: {
        category: true,
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: "desc",
        },
      },
    });

    return categories.map((cat) => ({
      category: cat.category,
      count: cat._count.category,
      total: Number(cat._sum.amount || 0),
    }));
  }),
});
