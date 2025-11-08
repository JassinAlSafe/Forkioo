"use client";

import { Receipt, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600">Track and categorize your business expenses</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Empty State */}
      <div className="rounded-xl border bg-white shadow-sm">
        <EmptyState
          icon={Receipt}
          title="No expenses recorded"
          description="Start tracking your expenses by adding your first one. You can upload receipts too!"
          action={{
            label: "Add Expense",
            onClick: () => console.log("Add expense"),
          }}
        />
      </div>
    </div>
  );
}
