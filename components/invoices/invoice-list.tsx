import { formatCurrency, formatDate, isOverdue, daysUntil } from "@/lib/utils";
import { InvoiceStatusBadge, type InvoiceStatus } from "./invoice-status-badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Eye, Send, Download, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  total: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
}

interface InvoiceListProps {
  invoices: Invoice[];
  onView?: (invoice: Invoice) => void;
  onSend?: (invoice: Invoice) => void;
  onDownload?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
}

export function InvoiceList({
  invoices,
  onView,
  onSend,
  onDownload,
  onDelete,
}: InvoiceListProps) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Header */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Invoice
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Due Date
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
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

        {/* Body */}
        <tbody className="divide-y divide-gray-200 bg-white">
          {invoices.map((invoice) => {
            const isDueSoon = daysUntil(invoice.dueDate) <= 7 && daysUntil(invoice.dueDate) > 0;
            const isLate = isOverdue(invoice.dueDate) && invoice.status !== "paid";

            return (
              <tr
                key={invoice.id}
                className="cursor-pointer transition-colors hover:bg-gray-50"
                onClick={() => onView?.(invoice)}
              >
                {/* Invoice Number */}
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </div>
                </td>

                {/* Customer */}
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {invoice.customerName}
                  </div>
                  {invoice.customerEmail && (
                    <div className="text-sm text-gray-500">
                      {invoice.customerEmail}
                    </div>
                  )}
                </td>

                {/* Invoice Date */}
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {formatDate(invoice.invoiceDate, { dateStyle: "short" })}
                </td>

                {/* Due Date */}
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {formatDate(invoice.dueDate, { dateStyle: "short" })}
                    </span>
                    {isDueSoon && invoice.status !== "paid" && (
                      <Badge variant="warning" className="text-xs">
                        Due soon
                      </Badge>
                    )}
                    {isLate && (
                      <Badge variant="danger" className="text-xs">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </td>

                {/* Amount */}
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <div className="text-sm font-semibold tabular-nums text-gray-900">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </div>
                  {invoice.amountPaid > 0 && invoice.status !== "paid" && (
                    <div className="text-xs tabular-nums text-gray-500">
                      {formatCurrency(invoice.amountDue, invoice.currency)} due
                    </div>
                  )}
                </td>

                {/* Status */}
                <td className="whitespace-nowrap px-6 py-4">
                  <InvoiceStatusBadge status={invoice.status} />
                </td>

                {/* Actions */}
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {invoice.status === "draft" && onSend && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSend(invoice);
                        }}
                      >
                        <Send className="mr-1 h-3 w-3" />
                        Send
                      </Button>
                    )}

                    {onDownload && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload(invoice);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}

                    {onDelete && invoice.status === "draft" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Delete this invoice?")) {
                            onDelete(invoice);
                          }
                        }}
                        className="text-danger-600 hover:bg-danger-50 hover:text-danger-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Empty State */}
      {invoices.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-500">
          No invoices found
        </div>
      )}
    </div>
  );
}
