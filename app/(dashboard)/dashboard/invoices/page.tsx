"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { InvoiceList, type Invoice } from "@/components/invoices/invoice-list";
import { InvoiceFilters } from "@/components/invoices/invoice-filters";
import { type InvoiceFormData } from "@/lib/validations/invoice";
import { type InvoiceStatus } from "@/components/invoices/invoice-status-badge";
import { mockInvoices } from "@/lib/mock-data/invoices";

export default function InvoicesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");

  // Filter invoices based on search and status
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      // Search filter
      const searchLower = search.toLowerCase();
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
        invoice.customerName.toLowerCase().includes(searchLower) ||
        invoice.customerEmail?.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus =
        statusFilter === "all" || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const handleCreateInvoice = (
    data: InvoiceFormData,
    action: "draft" | "send"
  ) => {
    console.log("Creating invoice:", { data, action });

    // TODO: Connect to tRPC mutation to save invoice
    // For now, just show success and close modal
    setIsFormOpen(false);

    // Show success toast (we'll add toast component later)
    alert(
      action === "draft"
        ? "Invoice saved as draft!"
        : "Invoice sent successfully!"
    );
  };

  const handleViewInvoice = (invoice: Invoice) => {
    console.log("View invoice:", invoice);
    // TODO: Navigate to invoice detail page or open modal
  };

  const handleSendInvoice = (invoice: Invoice) => {
    console.log("Send invoice:", invoice);
    // TODO: Implement send invoice logic
    alert(`Sending invoice ${invoice.invoiceNumber}...`);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    console.log("Download invoice:", invoice);
    // TODO: Generate and download PDF
    alert(`Downloading ${invoice.invoiceNumber}.pdf...`);
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    console.log("Delete invoice:", invoice);
    // TODO: Connect to tRPC mutation
    setInvoices(invoices.filter((inv) => inv.id !== invoice.id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">
            Manage your invoices and track payments
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Filters */}
      <InvoiceFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-600">Total Invoices</div>
          <div className="mt-1 text-2xl font-bold tabular-nums">
            {invoices.length}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-600">Paid</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-success-600">
            {invoices.filter((inv) => inv.status === "paid").length}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-warning-600">
            {
              invoices.filter((inv) =>
                ["sent", "viewed", "partial"].includes(inv.status)
              ).length
            }
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-600">Overdue</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-danger-600">
            {invoices.filter((inv) => inv.status === "overdue").length}
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <InvoiceList
        invoices={filteredInvoices}
        onView={handleViewInvoice}
        onSend={handleSendInvoice}
        onDownload={handleDownloadInvoice}
        onDelete={handleDeleteInvoice}
      />

      {/* Invoice Form Modal */}
      <InvoiceForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateInvoice}
      />
    </div>
  );
}
