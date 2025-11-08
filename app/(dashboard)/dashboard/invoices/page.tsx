"use client";

import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">Create, send, and track your invoices</p>
        </div>
        <Button>
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
            onClick: () => console.log("Create invoice"),
          }}
        />
      </div>
    </div>
  );
}
