import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc";
import { db } from "@/lib/db";

// Input schemas
const reportPeriodInput = z.object({
  startDate: z.date(),
  endDate: z.date(),
});

const comparePeriodsInput = z.object({
  currentStartDate: z.date(),
  currentEndDate: z.date(),
  previousStartDate: z.date(),
  previousEndDate: z.date(),
});

export const reportsRouter = router({
  /**
   * Profit & Loss Statement (Income Statement)
   */
  profitAndLoss: protectedProcedure
    .input(reportPeriodInput)
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

      // Get revenue accounts
      const revenueAccounts = await db.account.findMany({
        where: {
          companyId,
          type: "revenue",
          isActive: true,
        },
        orderBy: { code: "asc" },
      });

      // Get expense accounts
      const expenseAccounts = await db.account.findMany({
        where: {
          companyId,
          type: "expense",
          isActive: true,
        },
        orderBy: { code: "asc" },
      });

      // Get transaction lines for the period
      const getAccountActivity = async (accountIds: string[]) => {
        const lines = await db.transactionLine.findMany({
          where: {
            companyId,
            accountId: { in: accountIds },
            transaction: {
              transactionDate: {
                gte: input.startDate,
                lte: input.endDate,
              },
              status: "posted",
            },
          },
          include: {
            account: true,
          },
        });

        return lines;
      };

      const revenueLines = await getAccountActivity(revenueAccounts.map((a) => a.id));
      const expenseLines = await getAccountActivity(expenseAccounts.map((a) => a.id));

      // Calculate revenue by account
      const revenueByAccount = revenueAccounts.map((account) => {
        const lines = revenueLines.filter((l) => l.accountId === account.id);
        // Revenue accounts: credits are positive, debits are negative
        const amount = lines.reduce((sum, line) => sum - Number(line.amount), 0);
        return {
          accountId: account.id,
          accountCode: account.code,
          accountName: account.name,
          amount,
        };
      });

      // Calculate expenses by account
      const expensesByAccount = expenseAccounts.map((account) => {
        const lines = expenseLines.filter((l) => l.accountId === account.id);
        // Expense accounts: debits are positive, credits are negative
        const amount = lines.reduce((sum, line) => sum + Number(line.amount), 0);
        return {
          accountId: account.id,
          accountCode: account.code,
          accountName: account.name,
          amount,
        };
      });

      const totalRevenue = revenueByAccount.reduce((sum, item) => sum + item.amount, 0);
      const totalExpenses = expensesByAccount.reduce((sum, item) => sum + item.amount, 0);
      const netIncome = totalRevenue - totalExpenses;

      return {
        startDate: input.startDate,
        endDate: input.endDate,
        currency: companyUser.company.currency,
        revenue: {
          accounts: revenueByAccount.filter((a) => a.amount !== 0),
          total: totalRevenue,
        },
        expenses: {
          accounts: expensesByAccount.filter((a) => a.amount !== 0),
          total: totalExpenses,
        },
        netIncome,
      };
    }),

  /**
   * Balance Sheet
   */
  balanceSheet: protectedProcedure
    .input(z.object({ asOfDate: z.date() }))
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

      // Get all balance sheet accounts
      const [assetAccounts, liabilityAccounts, equityAccounts] = await Promise.all([
        db.account.findMany({
          where: { companyId, type: "asset", isActive: true },
          orderBy: { code: "asc" },
        }),
        db.account.findMany({
          where: { companyId, type: "liability", isActive: true },
          orderBy: { code: "asc" },
        }),
        db.account.findMany({
          where: { companyId, type: "equity", isActive: true },
          orderBy: { code: "asc" },
        }),
      ]);

      // Get balances as of date
      const getAccountBalances = async (accountIds: string[]) => {
        const lines = await db.transactionLine.findMany({
          where: {
            companyId,
            accountId: { in: accountIds },
            transaction: {
              transactionDate: { lte: input.asOfDate },
              status: "posted",
            },
          },
          include: {
            account: true,
          },
        });

        return lines;
      };

      const [assetLines, liabilityLines, equityLines] = await Promise.all([
        getAccountBalances(assetAccounts.map((a) => a.id)),
        getAccountBalances(liabilityAccounts.map((a) => a.id)),
        getAccountBalances(equityAccounts.map((a) => a.id)),
      ]);

      // Calculate asset balances
      const assetsByAccount = assetAccounts.map((account) => {
        const lines = assetLines.filter((l) => l.accountId === account.id);
        // Asset accounts: debits increase, credits decrease
        const balance = lines.reduce((sum, line) => sum + Number(line.amount), 0);
        return {
          accountId: account.id,
          accountCode: account.code,
          accountName: account.name,
          subType: account.subType,
          balance,
        };
      });

      // Calculate liability balances
      const liabilitiesByAccount = liabilityAccounts.map((account) => {
        const lines = liabilityLines.filter((l) => l.accountId === account.id);
        // Liability accounts: credits increase, debits decrease
        const balance = lines.reduce((sum, line) => sum - Number(line.amount), 0);
        return {
          accountId: account.id,
          accountCode: account.code,
          accountName: account.name,
          subType: account.subType,
          balance,
        };
      });

      // Calculate equity balances
      const equityByAccount = equityAccounts.map((account) => {
        const lines = equityLines.filter((l) => l.accountId === account.id);
        // Equity accounts: credits increase, debits decrease
        const balance = lines.reduce((sum, line) => sum - Number(line.amount), 0);
        return {
          accountId: account.id,
          accountCode: account.code,
          accountName: account.name,
          subType: account.subType,
          balance,
        };
      });

      const totalAssets = assetsByAccount.reduce((sum, item) => sum + item.balance, 0);
      const totalLiabilities = liabilitiesByAccount.reduce((sum, item) => sum + item.balance, 0);
      const totalEquity = equityByAccount.reduce((sum, item) => sum + item.balance, 0);

      return {
        asOfDate: input.asOfDate,
        currency: companyUser.company.currency,
        assets: {
          accounts: assetsByAccount.filter((a) => a.balance !== 0),
          total: totalAssets,
        },
        liabilities: {
          accounts: liabilitiesByAccount.filter((a) => a.balance !== 0),
          total: totalLiabilities,
        },
        equity: {
          accounts: equityByAccount.filter((a) => a.balance !== 0),
          total: totalEquity,
        },
        totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
        balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
      };
    }),

  /**
   * Cash Flow Statement
   */
  cashFlow: protectedProcedure
    .input(reportPeriodInput)
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

      // Get cash accounts
      const cashAccounts = await db.account.findMany({
        where: {
          companyId,
          OR: [
            { isBankAccount: true },
            { subType: "cash" },
          ],
          isActive: true,
        },
      });

      const cashAccountIds = cashAccounts.map((a) => a.id);

      // Get all cash movements in the period
      const cashMovements = await db.transactionLine.findMany({
        where: {
          companyId,
          accountId: { in: cashAccountIds },
          transaction: {
            transactionDate: {
              gte: input.startDate,
              lte: input.endDate,
            },
            status: "posted",
          },
        },
        include: {
          transaction: {
            include: {
              lines: {
                include: {
                  account: true,
                },
              },
            },
          },
        },
      });

      // Categorize cash flows
      const operating: any[] = [];
      const investing: any[] = [];
      const financing: any[] = [];

      cashMovements.forEach((movement) => {
        const { transaction } = movement;
        const otherLines = transaction.lines.filter(
          (l) => !cashAccountIds.includes(l.accountId)
        );

        // Determine category based on the other account(s) in the transaction
        let category = "operating"; // default

        otherLines.forEach((line) => {
          if (line.account.type === "revenue" || line.account.type === "expense") {
            category = "operating";
          } else if (line.account.type === "asset" && line.account.subType === "fixed_asset") {
            category = "investing";
          } else if (line.account.type === "liability" || line.account.type === "equity") {
            category = "financing";
          }
        });

        const item = {
          date: transaction.transactionDate,
          description: transaction.description,
          amount: Number(movement.amount),
          reference: transaction.reference,
        };

        if (category === "operating") {
          operating.push(item);
        } else if (category === "investing") {
          investing.push(item);
        } else {
          financing.push(item);
        }
      });

      const operatingCashFlow = operating.reduce((sum, item) => sum + item.amount, 0);
      const investingCashFlow = investing.reduce((sum, item) => sum + item.amount, 0);
      const financingCashFlow = financing.reduce((sum, item) => sum + item.amount, 0);
      const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;

      // Get beginning and ending cash balances
      const beginningBalanceLines = await db.transactionLine.findMany({
        where: {
          companyId,
          accountId: { in: cashAccountIds },
          transaction: {
            transactionDate: { lt: input.startDate },
            status: "posted",
          },
        },
      });

      const beginningBalance = beginningBalanceLines.reduce(
        (sum, line) => sum + Number(line.amount),
        0
      );
      const endingBalance = beginningBalance + netCashFlow;

      return {
        startDate: input.startDate,
        endDate: input.endDate,
        currency: companyUser.company.currency,
        operatingActivities: {
          items: operating,
          total: operatingCashFlow,
        },
        investingActivities: {
          items: investing,
          total: investingCashFlow,
        },
        financingActivities: {
          items: financing,
          total: financingCashFlow,
        },
        netCashFlow,
        beginningBalance,
        endingBalance,
      };
    }),

  /**
   * Revenue trends (for charts)
   */
  revenueTrends: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        interval: z.enum(["day", "week", "month", "quarter", "year"]).default("month"),
      })
    )
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

      // Get revenue accounts
      const revenueAccounts = await db.account.findMany({
        where: {
          companyId,
          type: "revenue",
          isActive: true,
        },
      });

      const revenueAccountIds = revenueAccounts.map((a) => a.id);

      // Get all revenue transactions in period
      const lines = await db.transactionLine.findMany({
        where: {
          companyId,
          accountId: { in: revenueAccountIds },
          transaction: {
            transactionDate: {
              gte: input.startDate,
              lte: input.endDate,
            },
            status: "posted",
          },
        },
        include: {
          transaction: {
            select: {
              transactionDate: true,
            },
          },
        },
      });

      // Group by interval
      const revenueByPeriod: Record<string, number> = {};

      lines.forEach((line) => {
        const date = new Date(line.transaction.transactionDate);
        let key: string;

        switch (input.interval) {
          case "day":
            key = date.toISOString().split("T")[0];
            break;
          case "week":
            // Get start of week
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split("T")[0];
            break;
          case "month":
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            break;
          case "quarter":
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            key = `${date.getFullYear()}-Q${quarter}`;
            break;
          case "year":
            key = String(date.getFullYear());
            break;
        }

        // Revenue: credits are positive
        const amount = -Number(line.amount);
        revenueByPeriod[key] = (revenueByPeriod[key] || 0) + amount;
      });

      // Convert to array and sort
      const trends = Object.entries(revenueByPeriod)
        .map(([period, amount]) => ({ period, amount }))
        .sort((a, b) => a.period.localeCompare(b.period));

      return {
        interval: input.interval,
        trends,
      };
    }),

  /**
   * Expense trends (for charts)
   */
  expenseTrends: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        interval: z.enum(["day", "week", "month", "quarter", "year"]).default("month"),
      })
    )
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

      // Get expense accounts
      const expenseAccounts = await db.account.findMany({
        where: {
          companyId,
          type: "expense",
          isActive: true,
        },
      });

      const expenseAccountIds = expenseAccounts.map((a) => a.id);

      // Get all expense transactions in period
      const lines = await db.transactionLine.findMany({
        where: {
          companyId,
          accountId: { in: expenseAccountIds },
          transaction: {
            transactionDate: {
              gte: input.startDate,
              lte: input.endDate,
            },
            status: "posted",
          },
        },
        include: {
          transaction: {
            select: {
              transactionDate: true,
            },
          },
        },
      });

      // Group by interval
      const expensesByPeriod: Record<string, number> = {};

      lines.forEach((line) => {
        const date = new Date(line.transaction.transactionDate);
        let key: string;

        switch (input.interval) {
          case "day":
            key = date.toISOString().split("T")[0];
            break;
          case "week":
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split("T")[0];
            break;
          case "month":
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            break;
          case "quarter":
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            key = `${date.getFullYear()}-Q${quarter}`;
            break;
          case "year":
            key = String(date.getFullYear());
            break;
        }

        // Expense: debits are positive
        const amount = Number(line.amount);
        expensesByPeriod[key] = (expensesByPeriod[key] || 0) + amount;
      });

      // Convert to array and sort
      const trends = Object.entries(expensesByPeriod)
        .map(([period, amount]) => ({ period, amount }))
        .sort((a, b) => a.period.localeCompare(b.period));

      return {
        interval: input.interval,
        trends,
      };
    }),
});
