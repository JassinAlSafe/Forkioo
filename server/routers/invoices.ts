import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import { db } from "@/lib/db";
import { invoiceSchema, invoiceLineSchema } from "@/lib/validations/invoice";

// Input schemas for invoice operations
const createInvoiceInput = z.object({
  invoiceNumber: z.string(),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email().optional(),
  invoiceDate: z.date(),
  dueDate: z.date(),
  lines: z.array(invoiceLineSchema),
  notes: z.string().optional(),
  terms: z.string().optional(),
  status: z.enum(["draft", "sent"]).default("draft"),
});

const listInvoicesInput = z.object({
  status: z.enum(["all", "draft", "sent", "viewed", "partial", "paid", "overdue", "void"]).optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

const updateInvoiceStatusInput = z.object({
  id: z.string().uuid(),
  status: z.enum(["draft", "sent", "viewed", "partial", "paid", "overdue", "void"]),
});

const deleteInvoiceInput = z.object({
  id: z.string().uuid(),
});

const recordPaymentInput = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().positive(),
  paymentDate: z.date(),
  paymentMethod: z.enum(["bank_transfer", "credit_card", "cash", "check", "other"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const invoicesRouter = createTRPCRouter({
  /**
   * Create a new invoice
   * Creates customer if doesn't exist, calculates totals, and saves to database
   */
  create: protectedProcedure
    .input(createInvoiceInput)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      // Get user's company (for now, we'll use the first company they belong to)
      // In a real app, this would come from the user's active company selection
      const companyUser = await db.companyUser.findFirst({
        where: { userId },
        include: { company: true },
      });

      if (!companyUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "You don't belong to any company. Please create or join a company first.",
        });
      }

      const companyId = companyUser.companyId;

      // Find or create customer (contact)
      let contact = await db.contact.findFirst({
        where: {
          companyId,
          email: input.customerEmail || undefined,
          name: input.customerName,
        },
      });

      if (!contact && input.customerEmail) {
        // Try finding by email only
        contact = await db.contact.findFirst({
          where: {
            companyId,
            email: input.customerEmail,
          },
        });
      }

      if (!contact) {
        // Create new customer
        contact = await db.contact.create({
          data: {
            companyId,
            type: "customer",
            name: input.customerName,
            email: input.customerEmail || null,
            currency: companyUser.company.currency,
          },
        });
      }

      // Calculate totals from line items
      const subtotal = input.lines.reduce((sum, line) => {
        return sum + line.quantity * line.unitPrice;
      }, 0);

      const taxTotal = input.lines.reduce((sum, line) => {
        const lineSubtotal = line.quantity * line.unitPrice;
        return sum + lineSubtotal * line.taxRate;
      }, 0);

      const total = subtotal + taxTotal;

      // Create invoice with line items
      const invoice = await db.invoice.create({
        data: {
          companyId,
          contactId: contact.id,
          invoiceNumber: input.invoiceNumber,
          invoiceDate: input.invoiceDate,
          dueDate: input.dueDate,
          subtotal,
          taxTotal,
          total,
          amountDue: total,
          amountPaid: 0,
          currency: companyUser.company.currency,
          status: input.status,
          notes: input.notes || null,
          terms: input.terms || null,
          createdBy: userId,
          sentAt: input.status === "sent" ? new Date() : null,
          lines: {
            create: input.lines.map((line, index) => ({
              lineNumber: index + 1,
              description: line.description,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              taxRate: line.taxRate,
              taxAmount: line.quantity * line.unitPrice * line.taxRate,
              amount: line.quantity * line.unitPrice * (1 + line.taxRate),
            })),
          },
        },
        include: {
          contact: true,
          lines: true,
          creator: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });

      return invoice;
    }),

  /**
   * List invoices with optional filtering
   */
  list: protectedProcedure
    .input(listInvoicesInput)
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
      };

      if (input.status && input.status !== "all") {
        where.status = input.status;
      }

      if (input.search) {
        where.OR = [
          { invoiceNumber: { contains: input.search, mode: "insensitive" } },
          { contact: { name: { contains: input.search, mode: "insensitive" } } },
          { contact: { email: { contains: input.search, mode: "insensitive" } } },
        ];
      }

      // Fetch invoices
      const [invoices, total] = await Promise.all([
        db.invoice.findMany({
          where,
          include: {
            contact: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            lines: true,
          },
          orderBy: { createdAt: "desc" },
          take: input.limit,
          skip: input.offset,
        }),
        db.invoice.count({ where }),
      ]);

      return {
        invoices,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  /**
   * Get a single invoice by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
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

      const invoice = await db.invoice.findFirst({
        where: {
          id: input.id,
          companyId: companyUser.companyId,
        },
        include: {
          contact: true,
          lines: {
            orderBy: { lineNumber: "asc" },
          },
          creator: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });

      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found.",
        });
      }

      return invoice;
    }),

  /**
   * Update invoice status (e.g., mark as sent, paid, etc.)
   */
  updateStatus: protectedProcedure
    .input(updateInvoiceStatusInput)
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

      // Check invoice exists and belongs to user's company
      const existingInvoice = await db.invoice.findFirst({
        where: {
          id: input.id,
          companyId: companyUser.companyId,
        },
      });

      if (!existingInvoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found.",
        });
      }

      // Update status with appropriate timestamp
      const updateData: any = {
        status: input.status,
      };

      if (input.status === "sent" && !existingInvoice.sentAt) {
        updateData.sentAt = new Date();
      } else if (input.status === "paid" && !existingInvoice.paidAt) {
        updateData.paidAt = new Date();
        updateData.amountPaid = existingInvoice.total;
        updateData.amountDue = 0;
      }

      const invoice = await db.invoice.update({
        where: { id: input.id },
        data: updateData,
        include: {
          contact: true,
          lines: true,
        },
      });

      return invoice;
    }),

  /**
   * Delete an invoice (only drafts can be deleted)
   */
  delete: protectedProcedure
    .input(deleteInvoiceInput)
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

      // Check invoice exists and is a draft
      const existingInvoice = await db.invoice.findFirst({
        where: {
          id: input.id,
          companyId: companyUser.companyId,
        },
      });

      if (!existingInvoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found.",
        });
      }

      if (existingInvoice.status !== "draft") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft invoices can be deleted.",
        });
      }

      // Delete invoice (cascade will delete lines)
      await db.invoice.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Get invoice statistics for dashboard
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

    // Get counts and totals by status
    const [total, paid, pending, overdue] = await Promise.all([
      db.invoice.count({
        where: { companyId },
      }),
      db.invoice.count({
        where: { companyId, status: "paid" },
      }),
      db.invoice.count({
        where: {
          companyId,
          status: { in: ["sent", "viewed", "partial"] },
        },
      }),
      db.invoice.count({
        where: { companyId, status: "overdue" },
      }),
    ]);

    return {
      total,
      paid,
      pending,
      overdue,
    };
  }),

  /**
   * Record a payment against an invoice
   */
  recordPayment: protectedProcedure
    .input(recordPaymentInput)
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

      // Fetch invoice
      const invoice = await db.invoice.findFirst({
        where: {
          id: input.invoiceId,
          companyId,
        },
      });

      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found.",
        });
      }

      // Validate payment amount
      if (input.amount > Number(invoice.amountDue)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payment amount cannot exceed amount due.",
        });
      }

      // Calculate new amounts
      const newAmountPaid = Number(invoice.amountPaid) + input.amount;
      const newAmountDue = Number(invoice.total) - newAmountPaid;

      // Determine new status
      let newStatus = invoice.status;
      if (newAmountDue === 0) {
        newStatus = "paid";
      } else if (newAmountPaid > 0 && newAmountDue > 0) {
        newStatus = "partial";
      }

      // Create payment and update invoice in a transaction
      const result = await db.$transaction(async (tx) => {
        // Create payment record
        const payment = await tx.payment.create({
          data: {
            companyId,
            contactId: invoice.contactId,
            amount: input.amount,
            paymentDate: input.paymentDate,
            paymentMethod: input.paymentMethod,
            reference: input.reference || null,
            notes: input.notes || null,
            createdBy: userId,
          },
        });

        // Create payment allocation
        await tx.paymentAllocation.create({
          data: {
            paymentId: payment.id,
            invoiceId: invoice.id,
            amount: input.amount,
          },
        });

        // Update invoice
        const updatedInvoice = await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            amountPaid: newAmountPaid,
            amountDue: newAmountDue,
            status: newStatus,
            paidAt: newStatus === "paid" ? new Date() : invoice.paidAt,
          },
          include: {
            contact: true,
            lines: true,
          },
        });

        return { payment, invoice: updatedInvoice };
      });

      return result;
    }),
});
