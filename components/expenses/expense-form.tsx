"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Calendar,
  DollarSign,
  FileText,
  Store,
  CreditCard,
  Tag,
  Receipt,
  AlertCircle,
} from "lucide-react";
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
import { trpc } from "@/lib/trpc/client";

const expenseSchema = z.object({
  expenseDate: z.string().min(1, "Expense date is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  merchant: z.string().optional(),
  category: z.string().optional(),
  paymentMethod: z.enum(["cash", "credit_card", "bank_transfer", "other"]).optional(),
  contactId: z.string().optional(),
  taxAmount: z.number().min(0).optional(),
  isTaxDeductible: z.boolean().default(true),
  receiptUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ExpenseFormData) => void;
  expense?: ExpenseFormData & { id?: string };
  isSubmitting?: boolean;
}

const CATEGORIES = [
  "travel",
  "meals",
  "office_supplies",
  "software",
  "advertising",
  "utilities",
  "rent",
  "insurance",
  "professional_services",
  "equipment",
  "maintenance",
  "other",
];

export function ExpenseForm({
  open,
  onOpenChange,
  onSubmit,
  expense,
  isSubmitting = false,
}: ExpenseFormProps) {
  const isEditing = !!expense?.id;

  // Fetch vendors/suppliers for dropdown
  const { data: contactsData } = trpc.customers.list.useQuery(
    { limit: 100 },
    { enabled: open }
  );
  const vendors = contactsData?.customers.filter((c) => c.type === "supplier" || c.type === "both") || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense || {
      expenseDate: new Date().toISOString().split("T")[0],
      amount: 0,
      description: "",
      merchant: "",
      category: "",
      paymentMethod: undefined,
      contactId: "",
      taxAmount: 0,
      isTaxDeductible: true,
      receiptUrl: "",
      notes: "",
    },
  });

  const isTaxDeductible = watch("isTaxDeductible");

  const handleFormSubmit = (data: ExpenseFormData) => {
    onSubmit(data);
    if (!isEditing) {
      reset();
    }
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Expense" : "New Expense"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update expense information"
              : "Record a new business expense"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Date and Amount */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="expenseDate">
                Expense Date <span className="text-danger-600">*</span>
              </Label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="expenseDate"
                  type="date"
                  {...register("expenseDate")}
                  className="pl-9"
                />
              </div>
              {errors.expenseDate && (
                <p className="mt-1 text-xs text-danger-600">{errors.expenseDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="amount">
                Amount <span className="text-danger-600">*</span>
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
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">
              Description <span className="text-danger-600">*</span>
            </Label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FileText className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="description"
                {...register("description")}
                className="pl-9"
                placeholder="Business lunch with client"
              />
            </div>
            {errors.description && (
              <p className="mt-1 text-xs text-danger-600">{errors.description.message}</p>
            )}
          </div>

          {/* Merchant and Category */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="merchant">Merchant/Vendor</Label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Store className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="merchant"
                  {...register("merchant")}
                  className="pl-9"
                  placeholder="Restaurant Name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Tag className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  id="category"
                  {...register("category")}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-9 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">-- Select category --</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Payment Method and Contact */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  id="paymentMethod"
                  {...register("paymentMethod")}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-9 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">-- Select method --</option>
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="contactId">Supplier/Vendor</Label>
              <select
                id="contactId"
                {...register("contactId")}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">-- None --</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tax */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  {...register("isTaxDeductible")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Tax Deductible
              </label>
            </div>

            {isTaxDeductible && (
              <div>
                <Label htmlFor="taxAmount">Tax Amount</Label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="taxAmount"
                    type="number"
                    step="0.01"
                    {...register("taxAmount", { valueAsNumber: true })}
                    className="pl-9"
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Receipt URL */}
          <div>
            <Label htmlFor="receiptUrl">Receipt URL</Label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Receipt className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="receiptUrl"
                type="url"
                {...register("receiptUrl")}
                className="pl-9"
                placeholder="https://example.com/receipt.pdf"
              />
            </div>
            {errors.receiptUrl && (
              <p className="mt-1 text-xs text-danger-600">{errors.receiptUrl.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Upload your receipt to a file hosting service and paste the URL here
            </p>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Any additional information about this expense..."
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
              {isSubmitting
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update Expense"
                : "Create Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
