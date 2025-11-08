"use client";

import { useState } from "react";
import { Calendar, TrendingUp, TrendingDown, DollarSign, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type ReportType = "profit-loss" | "balance-sheet" | "cash-flow" | "trends";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("profit-loss");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  // Profit & Loss
  const { data: profitLoss, isLoading: isPLLoading } = trpc.reports.profitAndLoss.useQuery(
    {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
    { enabled: reportType === "profit-loss" }
  );

  // Balance Sheet
  const { data: balanceSheet, isLoading: isBSLoading } = trpc.reports.balanceSheet.useQuery(
    { asOfDate: new Date(endDate) },
    { enabled: reportType === "balance-sheet" }
  );

  // Cash Flow
  const { data: cashFlow, isLoading: isCFLoading } = trpc.reports.cashFlow.useQuery(
    {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
    { enabled: reportType === "cash-flow" }
  );

  // Trends
  const { data: revenueTrends } = trpc.reports.revenueTrends.useQuery(
    {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      interval: "month",
    },
    { enabled: reportType === "trends" }
  );

  const { data: expenseTrends } = trpc.reports.expenseTrends.useQuery(
    {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      interval: "month",
    },
    { enabled: reportType === "trends" }
  );

  const isLoading = isPLLoading || isBSLoading || isCFLoading;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
        <p className="mt-1 text-sm text-gray-600">
          View comprehensive financial statements and analysis
        </p>
      </div>

      {/* Report Type Selector */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={reportType === "profit-loss" ? "default" : "outline"}
          onClick={() => setReportType("profit-loss")}
        >
          <FileText className="mr-2 h-4 w-4" />
          Profit & Loss
        </Button>
        <Button
          variant={reportType === "balance-sheet" ? "default" : "outline"}
          onClick={() => setReportType("balance-sheet")}
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Balance Sheet
        </Button>
        <Button
          variant={reportType === "cash-flow" ? "default" : "outline"}
          onClick={() => setReportType("cash-flow")}
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Cash Flow
        </Button>
        <Button
          variant={reportType === "trends" ? "default" : "outline"}
          onClick={() => setReportType("trends")}
        >
          <TrendingDown className="mr-2 h-4 w-4" />
          Trends
        </Button>
      </div>

      {/* Date Range Selector */}
      {reportType !== "balance-sheet" && (
        <div className="flex items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex-1">
            <Label htmlFor="startDate">Start Date</Label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex-1">
            <Label htmlFor="endDate">End Date</Label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      )}

      {reportType === "balance-sheet" && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <Label htmlFor="asOfDate">As of Date</Label>
          <div className="relative mt-1 max-w-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="asOfDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      )}

      {/* Report Content */}
      {isLoading ? (
        <div className="flex h-96 items-center justify-center rounded-lg border border-gray-200 bg-white">
          <div className="text-gray-500">Loading report...</div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          {/* Profit & Loss */}
          {reportType === "profit-loss" && profitLoss && (
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-900">Profit & Loss Statement</h2>
                <p className="text-sm text-gray-600">
                  {formatDate(profitLoss.startDate)} - {formatDate(profitLoss.endDate)}
                </p>
              </div>

              {/* Revenue */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">Revenue</h3>
                <div className="space-y-2">
                  {profitLoss.revenue.accounts.map((account) => (
                    <div key={account.accountId} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {account.accountCode} - {account.accountName}
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(account.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
                    <span>Total Revenue</span>
                    <span className="text-green-700">
                      {formatCurrency(profitLoss.revenue.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expenses */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">Expenses</h3>
                <div className="space-y-2">
                  {profitLoss.expenses.accounts.map((account) => (
                    <div key={account.accountId} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {account.accountCode} - {account.accountName}
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(account.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
                    <span>Total Expenses</span>
                    <span className="text-red-700">
                      {formatCurrency(profitLoss.expenses.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Income */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Net Income</span>
                  <span
                    className={
                      profitLoss.netIncome >= 0 ? "text-green-700" : "text-red-700"
                    }
                  >
                    {formatCurrency(profitLoss.netIncome)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Balance Sheet */}
          {reportType === "balance-sheet" && balanceSheet && (
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-900">Balance Sheet</h2>
                <p className="text-sm text-gray-600">
                  As of {formatDate(balanceSheet.asOfDate)}
                </p>
              </div>

              {/* Assets */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">Assets</h3>
                <div className="space-y-2">
                  {balanceSheet.assets.accounts.map((account) => (
                    <div key={account.accountId} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {account.accountCode} - {account.accountName}
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(account.balance)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
                    <span>Total Assets</span>
                    <span className="text-blue-700">
                      {formatCurrency(balanceSheet.assets.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Liabilities */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">Liabilities</h3>
                <div className="space-y-2">
                  {balanceSheet.liabilities.accounts.map((account) => (
                    <div key={account.accountId} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {account.accountCode} - {account.accountName}
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(account.balance)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
                    <span>Total Liabilities</span>
                    <span className="text-red-700">
                      {formatCurrency(balanceSheet.liabilities.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Equity */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">Equity</h3>
                <div className="space-y-2">
                  {balanceSheet.equity.accounts.map((account) => (
                    <div key={account.accountId} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {account.accountCode} - {account.accountName}
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(account.balance)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
                    <span>Total Equity</span>
                    <span className="text-purple-700">
                      {formatCurrency(balanceSheet.equity.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total Liabilities & Equity</span>
                  <span className="text-gray-900">
                    {formatCurrency(balanceSheet.totalLiabilitiesAndEquity)}
                  </span>
                </div>
                {balanceSheet.balanced ? (
                  <p className="mt-2 text-sm text-green-700">✓ Balanced</p>
                ) : (
                  <p className="mt-2 text-sm text-red-700">
                    ⚠ Not balanced (difference: {formatCurrency(
                      balanceSheet.assets.total - balanceSheet.totalLiabilitiesAndEquity
                    )})
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Cash Flow */}
          {reportType === "cash-flow" && cashFlow && (
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-900">Cash Flow Statement</h2>
                <p className="text-sm text-gray-600">
                  {formatDate(cashFlow.startDate)} - {formatDate(cashFlow.endDate)}
                </p>
              </div>

              {/* Beginning Balance */}
              <div className="flex justify-between text-sm font-medium">
                <span>Beginning Cash Balance</span>
                <span>{formatCurrency(cashFlow.beginningBalance)}</span>
              </div>

              {/* Operating */}
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                  Operating Activities
                </h3>
                <div className="space-y-1">
                  {cashFlow.operatingActivities.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.description}</span>
                      <span className={item.amount >= 0 ? "text-green-700" : "text-red-700"}>
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-gray-200 pt-2 font-medium">
                    <span>Net Operating Cash Flow</span>
                    <span>{formatCurrency(cashFlow.operatingActivities.total)}</span>
                  </div>
                </div>
              </div>

              {/* Investing */}
              {cashFlow.investingActivities.items.length > 0 && (
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">
                    Investing Activities
                  </h3>
                  <div className="space-y-1">
                    {cashFlow.investingActivities.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.description}</span>
                        <span className={item.amount >= 0 ? "text-green-700" : "text-red-700"}>
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-gray-200 pt-2 font-medium">
                      <span>Net Investing Cash Flow</span>
                      <span>{formatCurrency(cashFlow.investingActivities.total)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Financing */}
              {cashFlow.financingActivities.items.length > 0 && (
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">
                    Financing Activities
                  </h3>
                  <div className="space-y-1">
                    {cashFlow.financingActivities.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.description}</span>
                        <span className={item.amount >= 0 ? "text-green-700" : "text-red-700"}>
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-gray-200 pt-2 font-medium">
                      <span>Net Financing Cash Flow</span>
                      <span>{formatCurrency(cashFlow.financingActivities.total)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="rounded-lg bg-gray-50 p-4 space-y-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Net Change in Cash</span>
                  <span
                    className={cashFlow.netCashFlow >= 0 ? "text-green-700" : "text-red-700"}
                  >
                    {formatCurrency(cashFlow.netCashFlow)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Ending Cash Balance</span>
                  <span>{formatCurrency(cashFlow.endingBalance)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Trends */}
          {reportType === "trends" && revenueTrends && expenseTrends && (
            <div className="space-y-8">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-900">Financial Trends</h2>
                <p className="text-sm text-gray-600">
                  {formatDate(new Date(startDate))} - {formatDate(new Date(endDate))}
                </p>
              </div>

              {/* Revenue Trend */}
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueTrends.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Expense Trend */}
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Expense Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={expenseTrends.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="amount" fill="#ef4444" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Combined Comparison */}
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Revenue vs Expenses
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={revenueTrends.trends.map((r) => {
                      const expense = expenseTrends.trends.find((e) => e.period === r.period);
                      return {
                        period: r.period,
                        revenue: r.amount,
                        expense: expense?.amount || 0,
                        profit: r.amount - (expense?.amount || 0),
                      };
                    })}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Expenses"
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Net Profit"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
