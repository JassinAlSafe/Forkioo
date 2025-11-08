import { LayoutDashboard, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
            <span className="flex items-center gap-1 text-xs font-medium text-success-600">
              <TrendingUp className="h-3 w-3" />
              +12%
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold tabular-nums text-gray-900">
            $48,352
          </p>
          <p className="mt-1 text-sm text-gray-500">vs $43,157 last month</p>
        </div>

        {/* Total Expenses */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Total Expenses</h3>
            <span className="flex items-center gap-1 text-xs font-medium text-danger-600">
              <TrendingDown className="h-3 w-3" />
              -3%
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold tabular-nums text-gray-900">
            $28,420
          </p>
          <p className="mt-1 text-sm text-gray-500">vs $29,310 last month</p>
        </div>

        {/* Net Profit */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Net Profit</h3>
            <span className="flex items-center gap-1 text-xs font-medium text-success-600">
              <TrendingUp className="h-3 w-3" />
              +28%
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold tabular-nums text-gray-900">
            $19,932
          </p>
          <p className="mt-1 text-sm text-gray-500">41% profit margin</p>
        </div>

        {/* Outstanding Invoices */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Outstanding</h3>
            <DollarSign className="h-5 w-5 text-warning-600" />
          </div>
          <p className="mt-2 text-3xl font-bold tabular-nums text-gray-900">
            $12,450
          </p>
          <p className="mt-1 text-sm text-gray-500">5 unpaid invoices</p>
        </div>
      </div>

      {/* Smart To-Do List */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Your To-Do List
        </h2>

        <div className="space-y-3">
          {/* High Priority */}
          <div className="flex items-start gap-3 rounded-lg border-l-4 border-danger-500 bg-danger-50 p-4">
            <div className="mt-0.5 h-5 w-5 rounded-full bg-danger-500" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">VAT return due in 3 days</h4>
                <span className="text-xs text-gray-500">2 min</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Auto-generate your Q4 VAT return and submit to HMRC
              </p>
              <button className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700">
                Generate return →
              </button>
            </div>
          </div>

          {/* Medium Priority */}
          <div className="flex items-start gap-3 rounded-lg border-l-4 border-warning-500 bg-warning-50 p-4">
            <div className="mt-0.5 h-5 w-5 rounded-full bg-warning-500" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">2 overdue invoices</h4>
                <span className="text-xs text-gray-500">1 min</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Send payment reminders to Acme Corp ($2,500) and TechStart ($1,200)
              </p>
              <button className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700">
                Send reminders →
              </button>
            </div>
          </div>

          {/* Low Priority */}
          <div className="flex items-start gap-3 rounded-lg border-l-4 border-success-500 bg-success-50 p-4">
            <div className="mt-0.5 h-5 w-5 rounded-full bg-success-500" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Reconcile 8 bank transactions</h4>
                <span className="text-xs text-gray-500">5 min</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Review AI suggestions and categorize recent transactions
              </p>
              <button className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700">
                Review transactions →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Recent Activity
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-100">
                <TrendingUp className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Payment received from Acme Corp</p>
                <p className="text-sm text-gray-500">Invoice #INV-001 • 2 hours ago</p>
              </div>
            </div>
            <span className="font-semibold tabular-nums text-success-600">+$5,250</span>
          </div>

          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                <LayoutDashboard className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Invoice sent to TechStart Inc</p>
                <p className="text-sm text-gray-500">Invoice #INV-003 • 5 hours ago</p>
              </div>
            </div>
            <span className="font-medium tabular-nums text-gray-600">$3,200</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-100">
                <DollarSign className="h-5 w-5 text-warning-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Expense recorded: AWS Services</p>
                <p className="text-sm text-gray-500">Category: Software • Yesterday</p>
              </div>
            </div>
            <span className="font-semibold tabular-nums text-danger-600">-$89.50</span>
          </div>
        </div>
      </div>
    </div>
  );
}
