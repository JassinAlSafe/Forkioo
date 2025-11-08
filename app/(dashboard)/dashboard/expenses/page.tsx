"use client";

import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ExpenseForm, type ExpenseFormData } from "@/components/expenses/expense-form";
import { ExpenseStatusBadge, type ExpenseStatus } from "@/components/expenses/expense-status-badge";
import { trpc } from "@/lib/trpc/client";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ExpensesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  const utils = trpc.useUtils();

  // Fetch expenses from database
  const { data: expensesData, isLoading: expensesLoading } = trpc.expenses.list.useQuery({
    search: search || undefined,
    status: statusFilter,
    category: categoryFilter || undefined,
  });

  // Fetch stats
  const { data: stats } = trpc.expenses.getStats.useQuery();

  // Fetch categories
  const { data: categories } = trpc.expenses.getCategories.useQuery();

  // Mutations
  const createExpense = trpc.expenses.create.useMutation({
    onSuccess: () => {
      utils.expenses.list.invalidate();
      utils.expenses.getStats.invalidate();
      utils.expenses.getCategories.invalidate();
      setIsFormOpen(false);
      toast.success("Expense created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create expense", {
        description: error.message,
      });
    },
  });

  const updateExpense = trpc.expenses.update.useMutation({
    onSuccess: () => {
      utils.expenses.list.invalidate();
      utils.expenses.getStats.invalidate();
      utils.expenses.getCategories.invalidate();
      setIsFormOpen(false);
      setEditingExpense(null);
      toast.success("Expense updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update expense", {
        description: error.message,
      });
    },
  });

  const deleteExpense = trpc.expenses.delete.useMutation({
    onSuccess: () => {
      utils.expenses.list.invalidate();
      utils.expenses.getStats.invalidate();
      utils.expenses.getCategories.invalidate();
      toast.success("Expense deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete expense", {
        description: error.message,
      });
    },
  });

  const approveExpense = trpc.expenses.approve.useMutation({
    onSuccess: () => {
      utils.expenses.list.invalidate();
      utils.expenses.getStats.invalidate();
      toast.success("Expense approved");
    },
    onError: (error) => {
      toast.error("Failed to approve expense", {
        description: error.message,
      });
    },
  });

  const rejectExpense = trpc.expenses.reject.useMutation({
    onSuccess: () => {
      utils.expenses.list.invalidate();
      utils.expenses.getStats.invalidate();
      toast.success("Expense rejected");
    },
    onError: (error) => {
      toast.error("Failed to reject expense", {
        description: error.message,
      });
    },
  });

  const expenses = expensesData?.expenses || [];

  const handleCreateExpense = async (data: ExpenseFormData) => {
    try {
      await createExpense.mutateAsync({
        expenseDate: new Date(data.expenseDate),
        amount: data.amount,
        description: data.description,
        merchant: data.merchant || undefined,
        category: data.category || undefined,
        paymentMethod: data.paymentMethod,
        contactId: data.contactId || undefined,
        taxAmount: data.taxAmount || 0,
        isTaxDeductible: data.isTaxDeductible,
        receiptUrl: data.receiptUrl || undefined,
        notes: data.notes || undefined,
      });
    } catch (error) {
      console.error("Failed to create expense:", error);
    }
  };

  const handleUpdateExpense = async (data: ExpenseFormData) => {
    if (!editingExpense) return;

    try {
      await updateExpense.mutateAsync({
        id: editingExpense.id,
        expenseDate: new Date(data.expenseDate),
        amount: data.amount,
        description: data.description,
        merchant: data.merchant || undefined,
        category: data.category || undefined,
        paymentMethod: data.paymentMethod,
        contactId: data.contactId || undefined,
        taxAmount: data.taxAmount || 0,
        isTaxDeductible: data.isTaxDeductible,
        receiptUrl: data.receiptUrl || undefined,
        notes: data.notes || undefined,
      });
    } catch (error) {
      console.error("Failed to update expense:", error);
    }
  };

  const handleDeleteExpense = async (id: string, description: string) => {
    if (!confirm(`Are you sure you want to delete "${description}"?`)) return;

    try {
      await deleteExpense.mutateAsync({ id });
    } catch (error) {
      console.error("Failed to delete expense:", error);
    }
  };

  const handleApproveExpense = async (id: string) => {
    try {
      await approveExpense.mutateAsync({ id });
    } catch (error) {
      console.error("Failed to approve expense:", error);
    }
  };

  const handleRejectExpense = async (id: string) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;

    try {
      await rejectExpense.mutateAsync({ id, reason });
    } catch (error) {
      console.error("Failed to reject expense:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600">Track and manage business expenses</p>
        </div>
        <Button
          onClick={() => {
            setEditingExpense(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Expense
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-600">Total Expenses</div>
          <div className="mt-1 text-2xl font-bold tabular-nums">
            {stats?.total ?? 0}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-600">Pending Approval</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-blue-600">
            {stats?.pending ?? 0}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-600">Approved</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-success-600">
            {stats?.approved ?? 0}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-600">This Month</div>
          <div className="mt-1 text-2xl font-bold tabular-nums">
            {formatCurrency(stats?.thisMonthAmount ?? 0)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ExpenseStatus | "all")}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="paid">Paid</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="">All Categories</option>
          {categories?.map((cat) => (
            <option key={cat.category} value={cat.category || ""}>
              {cat.category
                ?.split("_")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")}{" "}
              ({cat.count})
            </option>
          ))}
        </select>
      </div>

      {/* Expense List */}
      {expensesLoading ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <p className="text-gray-600">Loading expenses...</p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <p className="text-gray-600">
            {search || statusFilter !== "all" || categoryFilter
              ? "No expenses match your filters."
              : "No expenses yet. Create your first expense to get started!"}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {formatDate(new Date(expense.expenseDate))}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {expense.description}
                      </div>
                      {expense.merchant && (
                        <div className="text-xs text-gray-500">{expense.merchant}</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {expense.category
                        ? expense.category
                            .split("_")
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ")
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(Number(expense.amount))}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <ExpenseStatusBadge status={expense.status as ExpenseStatus} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        {expense.status === "draft" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingExpense({
                                  ...expense,
                                  expenseDate: new Date(expense.expenseDate)
                                    .toISOString()
                                    .split("T")[0],
                                  amount: Number(expense.amount),
                                  taxAmount: Number(expense.taxAmount),
                                });
                                setIsFormOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteExpense(expense.id, expense.description)
                              }
                              className="text-danger-600 hover:text-danger-700"
                            >
                              Delete
                            </Button>
                          </>
                        )}
                        {expense.status === "submitted" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApproveExpense(expense.id)}
                              className="text-success-600 hover:text-success-700"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRejectExpense(expense.id)}
                              className="text-danger-600 hover:text-danger-700"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expense Form Modal */}
      <ExpenseForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingExpense(null);
        }}
        onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense}
        expense={editingExpense}
        isSubmitting={createExpense.isPending || updateExpense.isPending}
      />
    </div>
  );
}
