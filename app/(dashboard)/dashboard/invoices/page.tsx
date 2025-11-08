"use client";

import { useState } from "react";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { type InvoiceFormData } from "@/lib/validations/invoice";

export default function InvoicesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">
            Create, send, and track your invoices
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Empty State */}
      <div className="rounded-xl border bg-white shadow-sm">
        <EmptyState
          icon={FileText}
          title="No invoices yet"
          description="Get started by creating your first invoice. It only takes a minute."
          action={{
            label: "Create Invoice",
            onClick: () => setIsFormOpen(true),
          }}
        />
      </div>

      {/* Invoice Form Modal */}
      <InvoiceForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateInvoice}
      />
    </div>
  );
}
