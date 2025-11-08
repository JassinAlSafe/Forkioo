import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">View financial reports and insights</p>
      </div>

      {/* Report Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Profit & Loss */}
        <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
            <BarChart3 className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Profit & Loss</h3>
          <p className="mt-2 text-sm text-gray-600">
            Income vs expenses over time
          </p>
          <p className="mt-4 text-xs text-gray-500">Last updated: Today</p>
        </div>

        {/* Balance Sheet */}
        <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-success-100">
            <BarChart3 className="h-6 w-6 text-success-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Balance Sheet</h3>
          <p className="mt-2 text-sm text-gray-600">
            Assets, liabilities, and equity
          </p>
          <p className="mt-4 text-xs text-gray-500">Last updated: Today</p>
        </div>

        {/* Cash Flow */}
        <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-warning-100">
            <BarChart3 className="h-6 w-6 text-warning-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Cash Flow</h3>
          <p className="mt-2 text-sm text-gray-600">
            Money in and money out
          </p>
          <p className="mt-4 text-xs text-gray-500">Last updated: Today</p>
        </div>
      </div>

      {/* Placeholder for future chart */}
      <div className="rounded-xl border bg-white p-12 text-center shadow-sm">
        <BarChart3 className="mx-auto h-16 w-16 text-gray-300" />
        <p className="mt-4 text-gray-500">Reports will appear here</p>
      </div>
    </div>
  );
}
