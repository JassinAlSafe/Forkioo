/**
 * Main tRPC router
 * All routers should be imported and added here
 */
import { createTRPCRouter } from "../trpc";
import { healthRouter } from "./health";
import { invoicesRouter } from "./invoices";

export const appRouter = createTRPCRouter({
  health: healthRouter,
  invoices: invoicesRouter,
  // Add more routers here as we build features:
  // transactions: transactionsRouter,
  // contacts: contactsRouter,
  // dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
