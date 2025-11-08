/**
 * Custom hook for financial report operations
 * Provides a clean API for generating financial statements and analytics
 */

import { trpc } from "@/lib/trpc/client";
import type { ReportInterval } from "@/types/enums";

interface ReportPeriodInput {
  startDate: Date;
  endDate: Date;
}

interface TrendAnalysisInput extends ReportPeriodInput {
  interval: ReportInterval;
}

export function useReports() {
  // Financial Statements
  const profitAndLoss = (input: ReportPeriodInput) =>
    trpc.reports.profitAndLoss.useQuery(input, {
      enabled: !!input.startDate && !!input.endDate,
    });

  const balanceSheet = (asOfDate: Date) =>
    trpc.reports.balanceSheet.useQuery(
      { asOfDate },
      { enabled: !!asOfDate }
    );

  const cashFlow = (input: ReportPeriodInput) =>
    trpc.reports.cashFlow.useQuery(input, {
      enabled: !!input.startDate && !!input.endDate,
    });

  // Trend Analysis
  const revenueTrends = (input: TrendAnalysisInput) =>
    trpc.reports.revenueTrends.useQuery(input, {
      enabled: !!input.startDate && !!input.endDate && !!input.interval,
    });

  const expenseTrends = (input: TrendAnalysisInput) =>
    trpc.reports.expenseTrends.useQuery(input, {
      enabled: !!input.startDate && !!input.endDate && !!input.interval,
    });

  const cashFlowTrends = (input: TrendAnalysisInput) =>
    trpc.reports.cashFlowTrends.useQuery(input, {
      enabled: !!input.startDate && !!input.endDate && !!input.interval,
    });

  // Customer Analytics
  const topCustomersByRevenue = (input: ReportPeriodInput & { limit?: number }) =>
    trpc.reports.topCustomersByRevenue.useQuery(input, {
      enabled: !!input.startDate && !!input.endDate,
    });

  // Account Activity
  const accountActivity = (
    input: ReportPeriodInput & { accountId: string }
  ) =>
    trpc.reports.accountActivity.useQuery(input, {
      enabled: !!input.startDate && !!input.endDate && !!input.accountId,
    });

  return {
    // Financial Statements
    profitAndLoss,
    balanceSheet,
    cashFlow,

    // Trend Analysis
    revenueTrends,
    expenseTrends,
    cashFlowTrends,

    // Analytics
    topCustomersByRevenue,
    accountActivity,
  };
}

/**
 * Helper hook for common report date ranges
 */
export function useDateRanges() {
  const today = new Date();

  const thisMonth = {
    startDate: new Date(today.getFullYear(), today.getMonth(), 1),
    endDate: today,
  };

  const lastMonth = {
    startDate: new Date(today.getFullYear(), today.getMonth() - 1, 1),
    endDate: new Date(today.getFullYear(), today.getMonth(), 0),
  };

  const thisQuarter = {
    startDate: new Date(
      today.getFullYear(),
      Math.floor(today.getMonth() / 3) * 3,
      1
    ),
    endDate: today,
  };

  const thisYear = {
    startDate: new Date(today.getFullYear(), 0, 1),
    endDate: today,
  };

  const lastYear = {
    startDate: new Date(today.getFullYear() - 1, 0, 1),
    endDate: new Date(today.getFullYear() - 1, 11, 31),
  };

  const last30Days = {
    startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
    endDate: today,
  };

  const last90Days = {
    startDate: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
    endDate: today,
  };

  const last6Months = {
    startDate: new Date(today.getFullYear(), today.getMonth() - 6, 1),
    endDate: today,
  };

  const last12Months = {
    startDate: new Date(today.getFullYear(), today.getMonth() - 12, 1),
    endDate: today,
  };

  return {
    today,
    thisMonth,
    lastMonth,
    thisQuarter,
    thisYear,
    lastYear,
    last30Days,
    last90Days,
    last6Months,
    last12Months,
  };
}
