import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import { db } from "@/lib/db";

// Input schemas for customer operations
const createCustomerInput = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email("Valid email required").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

const updateCustomerInput = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email("Valid email required").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

const listCustomersInput = z.object({
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

const deleteCustomerInput = z.object({
  id: z.string().uuid(),
});

const getByIdInput = z.object({
  id: z.string().uuid(),
});

export const customersRouter = createTRPCRouter({
  /**
   * List all customers for the user's company
   */
  list: protectedProcedure
    .input(listCustomersInput)
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

      // Build where clause for search
      const where = {
        companyId,
        type: "customer" as const,
        ...(input.search
          ? {
              OR: [
                { name: { contains: input.search, mode: "insensitive" as const } },
                { email: { contains: input.search, mode: "insensitive" as const } },
                { phone: { contains: input.search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      };

      // Fetch customers with invoice count
      const [customers, total] = await Promise.all([
        db.contact.findMany({
          where,
          orderBy: { name: "asc" },
          take: input.limit,
          skip: input.offset,
          include: {
            _count: {
              select: { invoices: true },
            },
          },
        }),
        db.contact.count({ where }),
      ]);

      return {
        customers,
        total,
        hasMore: input.offset + customers.length < total,
      };
    }),

  /**
   * Get a single customer by ID
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

      // Fetch customer with invoice stats
      const customer = await db.contact.findFirst({
        where: {
          id: input.id,
          companyId: companyUser.companyId,
          type: "customer",
        },
        include: {
          invoices: {
            select: {
              id: true,
              invoiceNumber: true,
              status: true,
              total: true,
              amountDue: true,
              invoiceDate: true,
              dueDate: true,
            },
            orderBy: { invoiceDate: "desc" },
            take: 10,
          },
          _count: {
            select: { invoices: true },
          },
        },
      });

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found.",
        });
      }

      return customer;
    }),

  /**
   * Create a new customer
   */
  create: protectedProcedure
    .input(createCustomerInput)
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

      // Check if customer with same email already exists
      if (input.email) {
        const existingCustomer = await db.contact.findFirst({
          where: {
            companyId,
            type: "customer",
            email: input.email,
          },
        });

        if (existingCustomer) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A customer with this email already exists.",
          });
        }
      }

      // Create customer
      const customer = await db.contact.create({
        data: {
          companyId,
          type: "customer",
          name: input.name,
          email: input.email || null,
          phone: input.phone || null,
          address: input.address || null,
          taxId: input.taxId || null,
          notes: input.notes || null,
          currency: companyUser.company.currency,
        },
      });

      return customer;
    }),

  /**
   * Update an existing customer
   */
  update: protectedProcedure
    .input(updateCustomerInput)
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

      // Check if customer exists and belongs to user's company
      const existingCustomer = await db.contact.findFirst({
        where: {
          id: input.id,
          companyId,
          type: "customer",
        },
      });

      if (!existingCustomer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found.",
        });
      }

      // Check if email is being changed and if it conflicts with another customer
      if (input.email && input.email !== existingCustomer.email) {
        const emailConflict = await db.contact.findFirst({
          where: {
            companyId,
            type: "customer",
            email: input.email,
            id: { not: input.id },
          },
        });

        if (emailConflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A customer with this email already exists.",
          });
        }
      }

      // Update customer
      const customer = await db.contact.update({
        where: { id: input.id },
        data: {
          name: input.name,
          email: input.email || null,
          phone: input.phone || null,
          address: input.address || null,
          taxId: input.taxId || null,
          notes: input.notes || null,
        },
      });

      return customer;
    }),

  /**
   * Delete a customer
   */
  delete: protectedProcedure
    .input(deleteCustomerInput)
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

      // Check if customer exists and belongs to user's company
      const customer = await db.contact.findFirst({
        where: {
          id: input.id,
          companyId,
          type: "customer",
        },
        include: {
          _count: {
            select: { invoices: true },
          },
        },
      });

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found.",
        });
      }

      // Check if customer has invoices
      if (customer._count.invoices > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete customer with existing invoices. Please delete or reassign invoices first.",
        });
      }

      // Delete customer
      await db.contact.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Get customer statistics
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

    // Get customer stats
    const [total, withInvoices] = await Promise.all([
      db.contact.count({
        where: {
          companyId,
          type: "customer",
        },
      }),
      db.contact.count({
        where: {
          companyId,
          type: "customer",
          invoices: {
            some: {},
          },
        },
      }),
    ]);

    return {
      total,
      withInvoices,
      withoutInvoices: total - withInvoices,
    };
  }),
});
