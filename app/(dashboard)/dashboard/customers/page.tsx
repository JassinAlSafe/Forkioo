"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerForm, type CustomerFormData } from "@/components/customers/customer-form";
import { useCustomers } from "@/hooks/use-customers";
import { SkeletonTable } from "@/components/ui/skeleton";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  const customerHooks = useCustomers();

  // Fetch customers from database
  const { data: customersData, isLoading: customersLoading } = customerHooks.list({
    search: search || undefined,
  });

  // Fetch stats
  const { data: stats } = customerHooks.getStats();

  const customers = customersData?.customers || [];

  const handleCreateCustomer = async (data: CustomerFormData) => {
    await customerHooks.create.mutateAsync({
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
      taxId: data.taxId || undefined,
      notes: data.notes || undefined,
    });
    setIsFormOpen(false);
  };

  const handleUpdateCustomer = async (data: CustomerFormData) => {
    if (!editingCustomer) return;

    await customerHooks.update.mutateAsync({
      id: editingCustomer.id,
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
      taxId: data.taxId || undefined,
      notes: data.notes || undefined,
    });
    setIsFormOpen(false);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    await customerHooks.delete.mutateAsync({ id });
  };

  return (
    <div className="page-transition space-y-6">
      {/* Header */}
      <div className="fade-in flex items-center justify-between">
        <div>
          <h1 className="font-display text-display-md text-gray-900">Customers</h1>
          <p className="mt-2 text-gray-600">
            Manage your customer relationships
          </p>
        </div>
        <Button onClick={() => {
          setEditingCustomer(null);
          setIsFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          New Customer
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-elevated rounded-xl border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Total Customers</div>
          <div className="financial-value mt-2 text-financial-lg text-gray-900">
            {stats?.total ?? 0}
          </div>
        </div>
        <div className="card-elevated rounded-xl border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">With Invoices</div>
          <div className="financial-value mt-2 text-financial-lg text-success-600">
            {stats?.withInvoices ?? 0}
          </div>
        </div>
        <div className="card-elevated rounded-xl border bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Without Invoices</div>
          <div className="financial-value mt-2 text-financial-lg text-gray-600">
            {stats?.withoutInvoices ?? 0}
          </div>
        </div>
      </div>

      {/* Customer List */}
      {customersLoading ? (
        <SkeletonTable />
      ) : customers.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <p className="text-gray-600">
            {search
              ? "No customers match your search."
              : "No customers yet. Create your first customer to get started!"}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Invoices
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {customers.map((customer, index) => (
                  <tr
                    key={customer.id}
                    className="stagger-item transition-colors hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {customer.name}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {customer.email || "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {customer.phone || "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                        {customer._count.invoices} {customer._count.invoices === 1 ? "invoice" : "invoices"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCustomer(customer);
                            setIsFormOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                          className="text-danger-600 hover:text-danger-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Form Modal */}
      <CustomerForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingCustomer(null);
        }}
        onSubmit={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
        customer={editingCustomer}
        isSubmitting={customerHooks.create.isPending || customerHooks.update.isPending}
      />
    </div>
  );
}
