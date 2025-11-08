/**
 * Custom hook for expense operations
 * Provides a clean API for expense-related tRPC calls
 */

import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";

export function useExpenses() {
  const utils = trpc.useUtils();

  // Queries
  const list = trpc.expenses.list.useQuery;
  const getById = trpc.expenses.getById.useQuery;
  const getStats = trpc.expenses.getStats.useQuery;
  const getCategories = trpc.expenses.getCategories.useQuery;

  // Mutations
  const createExpense = trpc.expenses.create.useMutation({
    onSuccess: () => {
      utils.expenses.list.invalidate();
      utils.expenses.getStats.invalidate();
      utils.expenses.getCategories.invalidate();
      toast.success("Expense created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateExpense = trpc.expenses.update.useMutation({
    onSuccess: () => {
      utils.expenses.list.invalidate();
      utils.expenses.getById.invalidate();
      utils.expenses.getStats.invalidate();
      utils.expenses.getCategories.invalidate();
      toast.success("Expense updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
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
      toast.error(error.message);
    },
  });

  const approveExpense = trpc.expenses.approve.useMutation({
    onSuccess: () => {
      utils.expenses.list.invalidate();
      utils.expenses.getById.invalidate();
      utils.expenses.getStats.invalidate();
      toast.success("Expense approved successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const rejectExpense = trpc.expenses.reject.useMutation({
    onSuccess: () => {
      utils.expenses.list.invalidate();
      utils.expenses.getById.invalidate();
      utils.expenses.getStats.invalidate();
      toast.success("Expense rejected");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    // Queries
    list,
    getById,
    getStats,
    getCategories,

    // Mutations
    create: createExpense,
    update: updateExpense,
    delete: deleteExpense,
    approve: approveExpense,
    reject: rejectExpense,
  };
}
