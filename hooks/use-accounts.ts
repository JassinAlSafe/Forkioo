/**
 * Custom hook for chart of accounts operations
 * Provides a clean API for account-related tRPC calls
 */

import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";

export function useAccounts() {
  const utils = trpc.useUtils();

  // Queries
  const list = trpc.accounts.list.useQuery;
  const getById = trpc.accounts.getById.useQuery;
  const getHierarchy = trpc.accounts.getHierarchy.useQuery;
  const getBalance = trpc.accounts.getBalance.useQuery;
  const getTypesSummary = trpc.accounts.getTypesSummary.useQuery;

  // Mutations
  const createAccount = trpc.accounts.create.useMutation({
    onSuccess: () => {
      utils.accounts.list.invalidate();
      utils.accounts.getHierarchy.invalidate();
      utils.accounts.getTypesSummary.invalidate();
      toast.success("Account created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateAccount = trpc.accounts.update.useMutation({
    onSuccess: () => {
      utils.accounts.list.invalidate();
      utils.accounts.getById.invalidate();
      utils.accounts.getHierarchy.invalidate();
      utils.accounts.getTypesSummary.invalidate();
      toast.success("Account updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteAccount = trpc.accounts.delete.useMutation({
    onSuccess: (data) => {
      utils.accounts.list.invalidate();
      utils.accounts.getHierarchy.invalidate();
      utils.accounts.getTypesSummary.invalidate();

      if (data.deactivated) {
        toast.info(data.message);
      } else {
        toast.success("Account deleted successfully");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    // Queries
    list,
    getById,
    getHierarchy,
    getBalance,
    getTypesSummary,

    // Mutations
    create: createAccount,
    update: updateAccount,
    delete: deleteAccount,
  };
}
