"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Calendar } from "lucide-react";

import {
  invoiceFormSchema,
  type InvoiceFormData,
  generateInvoiceNumber,
  calculateInvoiceTotals,
} from "@/lib/validations/invoice";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface InvoiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InvoiceFormData, action: "draft" | "send") => void;
}

export function InvoiceForm({ open, onOpenChange, onSubmit }: InvoiceFormProps) {
  const [invoiceNumber] = useState(() => generateInvoiceNumber());
  const [action, setAction] = useState<"draft" | "send">("draft");

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 30 days from now
      lines: [
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          taxRate: 0,
        },
      ],
      notes: "",
      terms: "Payment due within 30 days",
      currency: "USD",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  // Watch all line items to calculate totals
  const lines = watch("lines");

  // Calculate totals
  const totals = calculateInvoiceTotals(lines);

  const handleFormSubmit = (data: InvoiceFormData) => {
    onSubmit(data, action);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Invoice Number (Read-only) */}
          <div>
            <Label>Invoice Number</Label>
            <Input value={invoiceNumber} disabled className="font-mono" />
          </div>

          {/* Customer Information */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="customerName">
                Customer Name <span className="text-danger-500">*</span>
              </Label>
              <Input
                id="customerName"
                {...register("customerName")}
                placeholder="Acme Corp"
              />
              {errors.customerName && (
                <p className="mt-1 text-xs text-danger-600">
                  {errors.customerName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                id="customerEmail"
                type="email"
                {...register("customerEmail")}
                placeholder="billing@acme.com"
              />
              {errors.customerEmail && (
                <p className="mt-1 text-xs text-danger-600">
                  {errors.customerEmail.message}
                </p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="invoiceDate">
                Invoice Date <span className="text-danger-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="invoiceDate"
                  type="date"
                  {...register("invoiceDate")}
                />
                <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.invoiceDate && (
                <p className="mt-1 text-xs text-danger-600">
                  {errors.invoiceDate.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="dueDate">
                Due Date <span className="text-danger-500">*</span>
              </Label>
              <div className="relative">
                <Input id="dueDate" type="date" {...register("dueDate")} />
                <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.dueDate && (
                <p className="mt-1 text-xs text-danger-600">
                  {errors.dueDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <Label className="text-base font-semibold">Line Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    description: "",
                    quantity: 1,
                    unitPrice: 0,
                    taxRate: 0,
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Line
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-lg border bg-gray-50 p-4 sm:grid-cols-12"
                >
                  {/* Description */}
                  <div className="sm:col-span-5">
                    <Input
                      {...register(`lines.${index}.description`)}
                      placeholder="Service description"
                    />
                    {errors.lines?.[index]?.description && (
                      <p className="mt-1 text-xs text-danger-600">
                        {errors.lines[index]?.description?.message}
                      </p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="sm:col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`lines.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                      placeholder="Qty"
                    />
                  </div>

                  {/* Unit Price */}
                  <div className="sm:col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`lines.${index}.unitPrice`, {
                        valueAsNumber: true,
                      })}
                      placeholder="Price"
                    />
                  </div>

                  {/* Tax Rate */}
                  <div className="sm:col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      max="1"
                      {...register(`lines.${index}.taxRate`, {
                        valueAsNumber: true,
                      })}
                      placeholder="Tax %"
                    />
                  </div>

                  {/* Delete Button */}
                  <div className="flex items-start sm:col-span-1">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {errors.lines && (
              <p className="mt-2 text-xs text-danger-600">
                {errors.lines.message || "Please check line items for errors"}
              </p>
            )}
          </div>

          {/* Totals */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(totals.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(totals.taxTotal)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="text-xl font-bold tabular-nums text-gray-900">
                  {formatCurrency(totals.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Thank you for your business!"
              rows={3}
            />
          </div>

          {/* Terms */}
          <div>
            <Label htmlFor="terms">Payment Terms (Optional)</Label>
            <Textarea
              id="terms"
              {...register("terms")}
              placeholder="Payment due within 30 days"
              rows={2}
            />
          </div>

          {/* Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="outline"
              onClick={() => setAction("draft")}
              disabled={isSubmitting}
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              onClick={() => setAction("send")}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
