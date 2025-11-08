/**
 * Main tRPC router
 * All routers should be imported and added here
 */
import { createTRPCRouter } from "../trpc";
import { healthRouter } from "./health";
import { invoicesRouter } from "./invoices";
import { customersRouter } from "./customers";

export const appRouter = createTRPCRouter({
  health: healthRouter,
  invoices: invoicesRouter,
  customers: customersRouter,
  // Add more routers here as we build features:
  // transactions: transactionsRouter,
  // dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
