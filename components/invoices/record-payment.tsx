"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DollarSign, Calendar, CreditCard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const paymentSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMethod: z.enum(["bank_transfer", "credit_card", "cash", "check", "other"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface RecordPaymentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PaymentFormData) => void;
  invoice: {
    invoiceNumber: string;
    amountDue: number;
    currency: string;
  };
  isSubmitting?: boolean;
}

export function RecordPayment({
  open,
  onOpenChange,
  onSubmit,
  invoice,
  isSubmitting = false,
}: RecordPaymentProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: invoice.amountDue,
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "bank_transfer",
      reference: "",
      notes: "",
    },
  });

  const handleFormSubmit = (data: PaymentFormData) => {
    onSubmit(data);
    reset();
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  const paymentAmount = watch("amount");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment for {invoice.invoiceNumber}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Amount Due Display */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Amount Due:</span>
              <span className="text-lg font-bold text-gray-900">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: invoice.currency,
                }).format(invoice.amountDue)}
              </span>
            </div>
          </div>

          {/* Payment Amount */}
          <div>
            <Label htmlFor="amount">
              Payment Amount <span className="text-danger-600">*</span>
            </Label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                className="pl-9"
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-xs text-danger-600">{errors.amount.message}</p>
            )}
            {paymentAmount > invoice.amountDue && (
              <p className="mt-1 text-xs text-warning-600">
                Payment amount exceeds amount due
              </p>
            )}
          </div>

          {/* Payment Date */}
          <div>
            <Label htmlFor="paymentDate">
              Payment Date <span className="text-danger-600">*</span>
            </Label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="paymentDate"
                type="date"
                {...register("paymentDate")}
                className="pl-9"
              />
            </div>
            {errors.paymentDate && (
              <p className="mt-1 text-xs text-danger-600">{errors.paymentDate.message}</p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <Label htmlFor="paymentMethod">
              Payment Method <span className="text-danger-600">*</span>
            </Label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <CreditCard className="h-4 w-4 text-gray-400" />
              </div>
              <select
                id="paymentMethod"
                {...register("paymentMethod")}
                className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="credit_card">Credit Card</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="other">Other</option>
              </select>
            </div>
            {errors.paymentMethod && (
              <p className="mt-1 text-xs text-danger-600">{errors.paymentMethod.message}</p>
            )}
          </div>

          {/* Reference */}
          <div>
            <Label htmlFor="reference">Reference (Optional)</Label>
            <Input
              id="reference"
              {...register("reference")}
              placeholder="Check number, transaction ID, etc."
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional reference like check number or transaction ID
            </p>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Add any additional notes about this payment"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
