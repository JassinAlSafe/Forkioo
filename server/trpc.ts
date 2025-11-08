/**
 * This is the primary router for your tRPC server
 */
import { initTRPC, TRPCError } from "@trpc/server";
import { type NextRequest } from "next/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

/**
 * Create context for incoming requests
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const authResult = await auth();

  return {
    db,
    userId: authResult.userId,
    headers: opts.headers,
  };
};

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 * Basic auth check without company context
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      // Infers the `userId` as non-nullable
      userId: ctx.userId,
    },
  });
});

/**
 * Company procedure - requires authentication + company membership
 * Automatically injects companyId, companyUser, and role into context
 *
 * Use this for all procedures that access company data (recommended)
 */
export const companyProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Get company membership
  const companyUser = await db.companyUser.findFirst({
    where: { userId: ctx.userId },
    include: { company: true },
  });

  if (!companyUser) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "No company access. Please contact your administrator.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      companyId: companyUser.companyId,
      companyUser,
      company: companyUser.company,
      role: companyUser.role,
    },
  });
});
