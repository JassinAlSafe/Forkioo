"use client";

import { FileText, Receipt, TrendingUp, Users, BarChart3 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useMemo } from "react";
import { SkeletonStats, SkeletonChart, SkeletonList } from "@/components/ui/skeleton";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function DashboardPage() {
  // Fetch dashboard data
  const { data: invoiceStats, isLoading: invoiceStatsLoading } = trpc.invoices.getStats.useQuery();
  const { data: expenseStats, isLoading: expenseStatsLoading } = trpc.expenses.getStats.useQuery();
  const { data: customerStats, isLoading: customerStatsLoading } = trpc.customers.getStats.useQuery();
  const { data: companyStats, isLoading: companyStatsLoading } = trpc.company.getStats.useQuery();

  // Fetch trends for charts
  const endDate = useMemo(() => new Date(), []);
  const startDate = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return date;
  }, []);

  const { data: revenueTrends, isLoading: revenueTrendsLoading } = trpc.reports.revenueTrends.useQuery({
    startDate,
    endDate,
    interval: "month",
  });

  const { data: expenseTrends, isLoading: expenseTrendsLoading } = trpc.reports.expenseTrends.useQuery({
    startDate,
    endDate,
    interval: "month",
  });

  const { data: expenseCategories, isLoading: expenseCategoriesLoading } = trpc.expenses.getCategories.useQuery();

  // Recent invoices
  const { data: recentInvoices, isLoading: recentInvoicesLoading } = trpc.invoices.list.useQuery({ limit: 5 });

  // Recent expenses
  const { data: recentExpenses, isLoading: recentExpensesLoading } = trpc.expenses.list.useQuery({ limit: 5 });

  // Determine if initial loading
  const isInitialLoading = invoiceStatsLoading && expenseStatsLoading && customerStatsLoading;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return "Just now";
  };

  // Combine revenue and expense trends
  const combinedTrends = useMemo(() => {
    if (!revenueTrends || !expenseTrends) return [];

    return revenueTrends.trends.map((r) => {
      const expense = expenseTrends.trends.find((e) => e.period === r.period);
      return {
        period: r.period,
        revenue: r.amount,
        expense: expense?.amount || 0,
        profit: r.amount - (expense?.amount || 0),
      };
    });
  }, [revenueTrends, expenseTrends]);

  // Show skeleton loaders on initial load
  if (isInitialLoading) {
    return (
      <div className="page-transition space-y-6">
        <div>
          <div className="h-10 w-48 animate-pulse rounded-md bg-gray-200" />
          <div className="mt-2 h-5 w-96 animate-pulse rounded-md bg-gray-200" />
        </div>
        <SkeletonStats />
        <div className="grid gap-6 lg:grid-cols-2">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <SkeletonList />
          <SkeletonList />
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition space-y-6">
      {/* Header */}
      <div className="fade-in">
        <h1 className="font-display text-display-md text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="card-elevated rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
            <div className="rounded-lg bg-success-50 p-2">
              <FileText className="h-5 w-5 text-success-600" />
            </div>
          </div>
          <p className="financial-value mt-3 text-financial-lg text-gray-900">
            {formatCurrency(invoiceStats?.totalAmount || 0)}
          </p>
          <p className="mt-1 text-sm text-gray-500">{invoiceStats?.total || 0} invoices</p>
        </div>

        {/* Total Expenses */}
        <div className="card-elevated rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Total Expenses</h3>
            <div className="rounded-lg bg-danger-50 p-2">
              <Receipt className="h-5 w-5 text-danger-600" />
            </div>
          </div>
          <p className="financial-value mt-3 text-financial-lg text-gray-900">
            {formatCurrency(expenseStats?.totalAmount || 0)}
          </p>
          <p className="mt-1 text-sm text-gray-500">{expenseStats?.total || 0} expenses</p>
        </div>

        {/* Net Profit */}
        <div className="card-elevated rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Net Profit</h3>
            <div className="rounded-lg bg-primary-50 p-2">
              <TrendingUp className="h-5 w-5 text-primary-600" />
            </div>
          </div>
          <p className="financial-value-positive mt-3 text-financial-lg">
            {formatCurrency((invoiceStats?.totalAmount || 0) - (expenseStats?.totalAmount || 0))}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {((invoiceStats?.totalAmount || 0) > 0
              ? (((invoiceStats?.totalAmount || 0) - (expenseStats?.totalAmount || 0)) /
                  (invoiceStats?.totalAmount || 1)) *
                100
              : 0
            ).toFixed(0)}% profit margin
          </p>
        </div>

        {/* Total Customers */}
        <div className="card-elevated rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Customers</h3>
            <div className="rounded-lg bg-accent-50 p-2">
              <Users className="h-5 w-5 text-accent-600" />
            </div>
          </div>
          <p className="financial-value mt-3 text-financial-lg text-gray-900">
            {customerStats?.total || 0}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {customerStats?.activeCustomers || 0} active
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue vs Expenses Trend */}
        <div className="card-elevated rounded-xl border bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-gray-900">
            <BarChart3 className="h-5 w-5 text-primary-600" />
            Revenue vs Expenses (Last 6 Months)
          </h2>
          {combinedTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={combinedTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
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
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Expenses by Category */}
        <div className="card-elevated rounded-xl border bg-white p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-gray-900">
            Expenses by Category
          </h2>
          {expenseCategories && expenseCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={expenseCategories}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) =>
                    entry.category
                      ? entry.category
                          .split("_")
                          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")
                      : ""
                  }
                >
                  {expenseCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-gray-500">
              No expense categories yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Invoices */}
        <div className="card-elevated rounded-xl border bg-white p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-gray-900">Recent Invoices</h2>
          {recentInvoicesLoading ? (
            <SkeletonList />
          ) : recentInvoices && recentInvoices.invoices.length > 0 ? (
            <div className="space-y-3">
              {recentInvoices.invoices.map((invoice, index) => (
                <div key={invoice.id} className="stagger-item flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">
                      {invoice.contact.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {invoice.invoiceNumber} • {formatDate(invoice.invoiceDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="financial-value text-gray-900">
                      {formatCurrency(Number(invoice.total))}
                    </p>
                    <p className="text-xs capitalize text-gray-500">{invoice.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-gray-500">
              No invoices yet
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="card-elevated rounded-xl border bg-white p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-gray-900">Recent Expenses</h2>
          {recentExpensesLoading ? (
            <SkeletonList />
          ) : recentExpenses && recentExpenses.expenses.length > 0 ? (
            <div className="space-y-3">
              {recentExpenses.expenses.map((expense, index) => (
                <div key={expense.id} className="stagger-item flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{expense.description}</p>
                    <p className="text-sm text-gray-500">
                      {expense.merchant || "No merchant"} • {formatDate(expense.expenseDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="financial-value-negative">
                      -{formatCurrency(Number(expense.amount))}
                    </p>
                    <p className="text-xs capitalize text-gray-500">{expense.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-gray-500">
              No expenses yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
