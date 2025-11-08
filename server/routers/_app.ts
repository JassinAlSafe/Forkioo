/**
 * Main tRPC router
 * All routers should be imported and added here
 */
import { createTRPCRouter } from "../trpc";
import { healthRouter } from "./health";

export const appRouter = createTRPCRouter({
  health: healthRouter,
  // Add more routers here as we build features:
  // invoices: invoicesRouter,
  // transactions: transactionsRouter,
  // contacts: contactsRouter,
  // dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
