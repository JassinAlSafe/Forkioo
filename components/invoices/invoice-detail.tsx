import { formatCurrency, formatDate, isOverdue, daysUntil } from "@/lib/utils";
import { InvoiceStatusBadge, type InvoiceStatus } from "./invoice-status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Calendar,
  User,
  Mail,
  FileText,
  DollarSign,
  Send,
  Download,
  Trash2,
} from "lucide-react";

export interface InvoiceDetailData {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  total: number;
  subtotal: number;
  taxTotal: number;
  amountPaid: number;
  amountDue: number;
  currency: string;
  notes?: string;
  terms?: string;
  lines: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    amount: number;
  }>;
}

interface InvoiceDetailProps {
  invoice: InvoiceDetailData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend?: (invoice: InvoiceDetailData) => void;
  onDownload?: (invoice: InvoiceDetailData) => void;
  onDelete?: (invoice: InvoiceDetailData) => void;
}

export function InvoiceDetail({
  invoice,
  open,
  onOpenChange,
  onSend,
  onDownload,
  onDelete,
}: InvoiceDetailProps) {
  if (!invoice) return null;

  const isDraft = invoice.status === "draft";
  const isPaid = invoice.status === "paid";
  const isOverdueInvoice = isOverdue(new Date(invoice.dueDate));
  const daysRemaining = daysUntil(new Date(invoice.dueDate));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-2xl">
                {invoice.invoiceNumber}
              </SheetTitle>
              <SheetDescription>
                Invoice details and line items
              </SheetDescription>
            </div>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status Alerts */}
          {isOverdueInvoice && !isPaid && (
            <div className="rounded-lg border border-danger-200 bg-danger-50 p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-danger-700" />
                <p className="text-sm font-medium text-danger-900">
                  Overdue by {Math.abs(daysRemaining)} days
                </p>
              </div>
            </div>
          )}

          {!isOverdueInvoice && !isPaid && daysRemaining <= 7 && daysRemaining > 0 && (
            <div className="rounded-lg border border-warning-200 bg-warning-50 p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-warning-700" />
                <p className="text-sm font-medium text-warning-900">
                  Due in {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
                </p>
              </div>
            </div>
          )}

          {/* Customer Information */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Customer
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900">
                  {invoice.customerName}
                </span>
              </div>
              {invoice.customerEmail && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{invoice.customerEmail}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                Invoice Date
              </p>
              <p className="text-sm text-gray-900">
                {formatDate(new Date(invoice.invoiceDate))}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                Due Date
              </p>
              <p className="text-sm text-gray-900">
                {formatDate(new Date(invoice.dueDate))}
              </p>
            </div>
          </div>

          <Separator />

          {/* Line Items */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Line Items
            </h3>
            <div className="space-y-3">
              {invoice.lines.map((line, index) => (
                <div
                  key={line.id}
                  className="rounded-lg border bg-gray-50 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {line.description}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {line.quantity} × {formatCurrency(line.unitPrice)}
                        {line.taxRate > 0 && (
                          <span className="ml-2 text-xs">
                            (Tax: {(line.taxRate * 100).toFixed(1)}%)
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="font-semibold tabular-nums text-gray-900">
                      {formatCurrency(line.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium tabular-nums text-gray-900">
                {formatCurrency(invoice.subtotal)}
              </span>
            </div>
            {invoice.taxTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium tabular-nums text-gray-900">
                  {formatCurrency(invoice.taxTotal)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="text-xl font-bold tabular-nums text-gray-900">
                {formatCurrency(invoice.total)}
              </span>
            </div>
            {invoice.amountPaid > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium tabular-nums text-success-600">
                    {formatCurrency(invoice.amountPaid)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold text-gray-900">Amount Due:</span>
                  <span className="text-lg font-bold tabular-nums text-gray-900">
                    {formatCurrency(invoice.amountDue)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Notes and Terms */}
          {(invoice.notes || invoice.terms) && (
            <>
              <Separator />
              <div className="space-y-4">
                {invoice.notes && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Notes
                    </p>
                    <p className="text-sm text-gray-700">{invoice.notes}</p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                      Payment Terms
                    </p>
                    <p className="text-sm text-gray-700">{invoice.terms}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 border-t pt-6">
            {isDraft && onSend && (
              <Button
                onClick={() => onSend(invoice)}
                className="flex-1"
              >
                <Send className="mr-2 h-4 w-4" />
                Send Invoice
              </Button>
            )}
            {onDownload && (
              <Button
                variant="outline"
                onClick={() => onDownload(invoice)}
                className={isDraft ? "flex-1" : "flex-1"}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            )}
            {isDraft && onDelete && (
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(invoice);
                  onOpenChange(false);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
