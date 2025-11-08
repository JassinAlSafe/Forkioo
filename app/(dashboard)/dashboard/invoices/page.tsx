"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { InvoiceList, type Invoice } from "@/components/invoices/invoice-list";
import { InvoiceFilters } from "@/components/invoices/invoice-filters";
import { type InvoiceFormData, generateInvoiceNumber } from "@/lib/validations/invoice";
import { type InvoiceStatus } from "@/components/invoices/invoice-status-badge";
import { trpc } from "@/lib/trpc/client";

export default function InvoicesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");

  const utils = trpc.useUtils();

  // Fetch invoices from database
  const { data: invoicesData, isLoading: invoicesLoading } = trpc.invoices.list.useQuery({
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  // Fetch stats
  const { data: stats } = trpc.invoices.getStats.useQuery();

  // Mutations
  const createInvoice = trpc.invoices.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch invoices list and stats
      utils.invoices.list.invalidate();
      utils.invoices.getStats.invalidate();
      setIsFormOpen(false);
    },
    onError: (error) => {
      alert(`Error creating invoice: ${error.message}`);
    },
  });

  const deleteInvoice = trpc.invoices.delete.useMutation({
    onSuccess: () => {
      utils.invoices.list.invalidate();
      utils.invoices.getStats.invalidate();
    },
    onError: (error) => {
      alert(`Error deleting invoice: ${error.message}`);
    },
  });

  const updateInvoiceStatus = trpc.invoices.updateStatus.useMutation({
    onSuccess: () => {
      utils.invoices.list.invalidate();
      utils.invoices.getStats.invalidate();
    },
    onError: (error) => {
      alert(`Error updating invoice: ${error.message}`);
    },
  });

  // Transform database invoices to match component interface
  const invoices: Invoice[] =
    invoicesData?.invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.contact.name,
      customerEmail: inv.contact.email || undefined,
      invoiceDate: inv.invoiceDate.toISOString().split("T")[0],
      dueDate: inv.dueDate.toISOString().split("T")[0],
      status: inv.status as InvoiceStatus,
      total: Number(inv.total),
      amountPaid: Number(inv.amountPaid),
      amountDue: Number(inv.amountDue),
      currency: inv.currency,
    })) || [];

  const handleCreateInvoice = async (
    data: InvoiceFormData,
    action: "draft" | "send"
  ) => {
    try {
      await createInvoice.mutateAsync({
        invoiceNumber: generateInvoiceNumber(),
        customerName: data.customerName,
        customerEmail: data.customerEmail || undefined,
        invoiceDate: new Date(data.invoiceDate),
        dueDate: new Date(data.dueDate),
        lines: data.lines,
        notes: data.notes || undefined,
        terms: data.terms || undefined,
        status: action === "draft" ? "draft" : "sent",
      });

      alert(
        action === "draft"
          ? "Invoice saved as draft!"
          : "Invoice sent successfully!"
      );
    } catch (error) {
      // Error is handled by onError callback
      console.error("Failed to create invoice:", error);
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    console.log("View invoice:", invoice);
    // TODO: Navigate to invoice detail page or open modal
    alert(`Viewing invoice ${invoice.invoiceNumber} - detail view coming soon!`);
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      await updateInvoiceStatus.mutateAsync({
        id: invoice.id,
        status: "sent",
      });
      alert(`Invoice ${invoice.invoiceNumber} sent successfully!`);
    } catch (error) {
      console.error("Failed to send invoice:", error);
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    console.log("Download invoice:", invoice);
    // TODO: Generate and download PDF
    alert(`PDF generation coming soon! ${invoice.invoiceNumber}.pdf`);
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (!confirm(`Are you sure you want to delete ${invoice.invoiceNumber}?`)) {
      return;
    }

    try {
      await deleteInvoice.mutateAsync({ id: invoice.id });
      alert(`Invoice ${invoice.invoiceNumber} deleted successfully.`);
    } catch (error) {
      console.error("Failed to delete invoice:", error);
    }
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
            {stats?.total ?? 0}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-600">Paid</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-success-600">
            {stats?.paid ?? 0}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-warning-600">
            {stats?.pending ?? 0}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-600">Overdue</div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-danger-600">
            {stats?.overdue ?? 0}
          </div>
        </div>
      </div>

      {/* Invoice List */}
      {invoicesLoading ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <p className="text-gray-600">Loading invoices...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <p className="text-gray-600">
            {search || statusFilter !== "all"
              ? "No invoices match your filters."
              : "No invoices yet. Create your first invoice to get started!"}
          </p>
        </div>
      ) : (
        <InvoiceList
          invoices={invoices}
          onView={handleViewInvoice}
          onSend={handleSendInvoice}
          onDownload={handleDownloadInvoice}
          onDelete={handleDeleteInvoice}
        />
      )}

      {/* Invoice Form Modal */}
      <InvoiceForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateInvoice}
      />
    </div>
  );
}
