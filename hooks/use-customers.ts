/**
 * Custom hook for customer/contact operations
 * Provides a clean API for managing customers with automatic cache invalidation
 */

import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import type { Contact } from "@/types/models";
import type { ContactType } from "@/types/enums";

interface CreateCustomerInput {
  name: string;
  email?: string;
  phone?: string;
  type: ContactType;
  companyName?: string;
  taxId?: string;
  website?: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  notes?: string;
  tags?: string[];
}

interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
  id: string;
}

interface ListCustomersInput {
  limit?: number;
  offset?: number;
  search?: string;
  type?: ContactType;
  sortBy?: "name" | "createdAt" | "totalRevenue";
  sortOrder?: "asc" | "desc";
}

export function useCustomers() {
  const utils = trpc.useUtils();

  // Queries
  const list = (input?: ListCustomersInput) =>
    trpc.customers.list.useQuery(input ?? {});

  const getById = (id: string) =>
    trpc.customers.getById.useQuery({ id }, { enabled: !!id });

  const getStats = () => trpc.customers.getStats.useQuery();

  // Mutations
  const createCustomer = trpc.customers.create.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      utils.customers.getStats.invalidate();
      toast.success("Customer created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create customer: ${error.message}`);
    },
  });

  const updateCustomer = trpc.customers.update.useMutation({
    onSuccess: (data) => {
      utils.customers.list.invalidate();
      utils.customers.getById.invalidate({ id: data.id });
      utils.customers.getStats.invalidate();
      toast.success("Customer updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update customer: ${error.message}`);
    },
  });

  const deleteCustomer = trpc.customers.delete.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      utils.customers.getStats.invalidate();
      toast.success("Customer deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete customer: ${error.message}`);
    },
  });

  return {
    // Queries
    list,
    getById,
    getStats,

    // Mutations
    create: createCustomer,
    update: updateCustomer,
    delete: deleteCustomer,
  };
}
