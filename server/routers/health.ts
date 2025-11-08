/**
 * Health check router
 * Simple endpoint to verify tRPC is working
 */
import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const healthRouter = createTRPCRouter({
  // Public health check
  ping: publicProcedure.query(() => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }),

  // Protected health check (requires auth)
  protectedPing: protectedProcedure.query(({ ctx }) => {
    return {
      status: "ok",
      userId: ctx.userId,
      timestamp: new Date().toISOString(),
    };
  }),
});
