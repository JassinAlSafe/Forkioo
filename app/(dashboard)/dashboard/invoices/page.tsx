"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { InvoiceList, type Invoice } from "@/components/invoices/invoice-list";
import { InvoiceFilters } from "@/components/invoices/invoice-filters";
import { InvoiceDetail, type InvoiceDetailData } from "@/components/invoices/invoice-detail";
import { type InvoiceFormData, generateInvoiceNumber } from "@/lib/validations/invoice";
import { type InvoiceStatus } from "@/components/invoices/invoice-status-badge";
import { trpc } from "@/lib/trpc/client";

export default function InvoicesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
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

  // Fetch selected invoice details
  const { data: invoiceDetails } = trpc.invoices.getById.useQuery(
    { id: selectedInvoiceId! },
    { enabled: !!selectedInvoiceId }
  );

  // Mutations
  const createInvoice = trpc.invoices.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch invoices list and stats
      utils.invoices.list.invalidate();
      utils.invoices.getStats.invalidate();
      setIsFormOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to create invoice", {
        description: error.message,
      });
    },
  });

  const deleteInvoice = trpc.invoices.delete.useMutation({
    onSuccess: () => {
      utils.invoices.list.invalidate();
      utils.invoices.getStats.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to delete invoice", {
        description: error.message,
      });
    },
  });

  const updateInvoiceStatus = trpc.invoices.updateStatus.useMutation({
    onSuccess: () => {
      utils.invoices.list.invalidate();
      utils.invoices.getStats.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to update invoice", {
        description: error.message,
      });
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

      toast.success(
        action === "draft" ? "Invoice saved" : "Invoice sent",
        {
          description:
            action === "draft"
              ? "Your invoice has been saved as a draft."
              : "Your invoice has been sent successfully.",
        }
      );
    } catch (error) {
      // Error is handled by onError callback
      console.error("Failed to create invoice:", error);
    }
  };

  // Transform invoice details for the detail view
  const detailData: InvoiceDetailData | null = invoiceDetails
    ? {
        id: invoiceDetails.id,
        invoiceNumber: invoiceDetails.invoiceNumber,
        customerName: invoiceDetails.contact.name,
        customerEmail: invoiceDetails.contact.email || undefined,
        invoiceDate: invoiceDetails.invoiceDate.toISOString().split("T")[0],
        dueDate: invoiceDetails.dueDate.toISOString().split("T")[0],
        status: invoiceDetails.status as InvoiceStatus,
        total: Number(invoiceDetails.total),
        subtotal: Number(invoiceDetails.subtotal),
        taxTotal: Number(invoiceDetails.taxTotal),
        amountPaid: Number(invoiceDetails.amountPaid),
        amountDue: Number(invoiceDetails.amountDue),
        currency: invoiceDetails.currency,
        notes: invoiceDetails.notes || undefined,
        terms: invoiceDetails.terms || undefined,
        lines: invoiceDetails.lines.map((line) => ({
          id: line.id,
          description: line.description,
          quantity: Number(line.quantity),
          unitPrice: Number(line.unitPrice),
          taxRate: Number(line.taxRate),
          amount: Number(line.amount),
        })),
      }
    : null;

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoiceId(invoice.id);
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      // Show loading toast
      const sendToast = toast.loading(`Sending ${invoice.invoiceNumber} via email...`);

      // Call API to send invoice email
      const response = await fetch(`/api/invoices/${invoice.id}/send`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invoice");
      }

      // Invalidate queries to refresh the invoice status
      utils.invoices.list.invalidate();
      utils.invoices.getStats.invalidate();
      if (selectedInvoiceId === invoice.id) {
        utils.invoices.getById.invalidate({ id: invoice.id });
      }

      // Update toast to success
      toast.success("Invoice sent via email", {
        id: sendToast,
        description: data.message || `${invoice.invoiceNumber} has been sent successfully.`,
      });
    } catch (error: any) {
      console.error("Failed to send invoice:", error);
      toast.error("Failed to send invoice", {
        description: error.message || "An error occurred while sending the invoice.",
      });
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      // Show loading toast
      const downloadToast = toast.loading(`Generating PDF for ${invoice.invoiceNumber}...`);

      // Fetch PDF from API
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`);

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Update toast to success
      toast.success("PDF downloaded", {
        id: downloadToast,
        description: `${invoice.invoiceNumber}.pdf has been downloaded.`,
      });
    } catch (error) {
      console.error("Failed to download PDF:", error);
      toast.error("Failed to download PDF", {
        description: "An error occurred while generating the PDF. Please try again.",
      });
    }
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    // Use toast.promise for async operations with loading state
    toast.promise(
      deleteInvoice.mutateAsync({ id: invoice.id }),
      {
        loading: `Deleting ${invoice.invoiceNumber}...`,
        success: `${invoice.invoiceNumber} deleted successfully`,
        error: "Failed to delete invoice",
      }
    );
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

      {/* Invoice Detail Sheet */}
      <InvoiceDetail
        invoice={detailData}
        open={!!selectedInvoiceId}
        onOpenChange={(open) => !open && setSelectedInvoiceId(null)}
        onSend={(invoice) => {
          handleSendInvoice({
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            customerName: invoice.customerName,
            customerEmail: invoice.customerEmail,
            invoiceDate: invoice.invoiceDate,
            dueDate: invoice.dueDate,
            status: invoice.status,
            total: invoice.total,
            amountPaid: invoice.amountPaid,
            amountDue: invoice.amountDue,
            currency: invoice.currency,
          });
          setSelectedInvoiceId(null);
        }}
        onDownload={(invoice) => {
          handleDownloadInvoice({
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            customerName: invoice.customerName,
            customerEmail: invoice.customerEmail,
            invoiceDate: invoice.invoiceDate,
            dueDate: invoice.dueDate,
            status: invoice.status,
            total: invoice.total,
            amountPaid: invoice.amountPaid,
            amountDue: invoice.amountDue,
            currency: invoice.currency,
          });
        }}
        onDelete={(invoice) => {
          handleDeleteInvoice({
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            customerName: invoice.customerName,
            customerEmail: invoice.customerEmail,
            invoiceDate: invoice.invoiceDate,
            dueDate: invoice.dueDate,
            status: invoice.status,
            total: invoice.total,
            amountPaid: invoice.amountPaid,
            amountDue: invoice.amountDue,
            currency: invoice.currency,
          });
        }}
      />
    </div>
  );
}
