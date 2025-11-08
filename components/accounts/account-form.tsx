"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Hash, FileText, Layers, Building2, Tag } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/client";

const accountSchema = z.object({
  code: z.string().min(1, "Account code is required"),
  name: z.string().min(1, "Account name is required"),
  type: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
  subType: z.string().optional(),
  isBankAccount: z.boolean().default(false),
  isControlAccount: z.boolean().default(false),
  parentAccountId: z.string().optional(),
  taxCategory: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AccountFormData) => void;
  account?: AccountFormData & { id?: string; isSystem?: boolean };
  isSubmitting?: boolean;
}

const ACCOUNT_TYPES = [
  { value: "asset", label: "Asset" },
  { value: "liability", label: "Liability" },
  { value: "equity", label: "Equity" },
  { value: "revenue", label: "Revenue" },
  { value: "expense", label: "Expense" },
] as const;

const ASSET_SUBTYPES = [
  "current_asset",
  "fixed_asset",
  "cash",
  "accounts_receivable",
  "inventory",
  "other_asset",
];

const LIABILITY_SUBTYPES = [
  "current_liability",
  "long_term_liability",
  "accounts_payable",
  "credit_card",
  "other_liability",
];

const EQUITY_SUBTYPES = [
  "owner_equity",
  "retained_earnings",
  "common_stock",
  "other_equity",
];

const REVENUE_SUBTYPES = [
  "sales_revenue",
  "service_revenue",
  "other_revenue",
];

const EXPENSE_SUBTYPES = [
  "operating_expense",
  "cost_of_goods_sold",
  "payroll_expense",
  "tax_expense",
  "other_expense",
];

export function AccountForm({
  open,
  onOpenChange,
  onSubmit,
  account,
  isSubmitting = false,
}: AccountFormProps) {
  const isEditing = !!account?.id;

  // Fetch accounts for parent selection
  const { data: accountsData } = trpc.accounts.list.useQuery(
    { limit: 500, isActive: true },
    { enabled: open }
  );
  const accounts = accountsData?.accounts || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: account || {
      code: "",
      name: "",
      type: "asset",
      subType: "",
      isBankAccount: false,
      isControlAccount: false,
      parentAccountId: "",
      taxCategory: "",
      isActive: true,
    },
  });

  const selectedType = watch("type");

  const getSubtypesForType = (type: string) => {
    switch (type) {
      case "asset":
        return ASSET_SUBTYPES;
      case "liability":
        return LIABILITY_SUBTYPES;
      case "equity":
        return EQUITY_SUBTYPES;
      case "revenue":
        return REVENUE_SUBTYPES;
      case "expense":
        return EXPENSE_SUBTYPES;
      default:
        return [];
    }
  };

  const getParentAccountsForType = (type: string) => {
    return accounts.filter((a) => a.type === type && a.id !== account?.id);
  };

  const handleFormSubmit = (data: AccountFormData) => {
    // Clean up empty optional fields
    const cleanData = {
      ...data,
      subType: data.subType || undefined,
      parentAccountId: data.parentAccountId || undefined,
      taxCategory: data.taxCategory || undefined,
    };
    onSubmit(cleanData);
    if (!isEditing) {
      reset();
    }
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  const subtypes = getSubtypesForType(selectedType);
  const parentAccounts = getParentAccountsForType(selectedType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Account" : "New Account"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update account information"
              : "Create a new account in your chart of accounts"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Code and Name */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="code">
                Account Code <span className="text-danger-600">*</span>
              </Label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Hash className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="code"
                  {...register("code")}
                  className="pl-9"
                  placeholder="1000"
                  disabled={account?.isSystem}
                />
              </div>
              {errors.code && (
                <p className="mt-1 text-xs text-danger-600">{errors.code.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Numeric code for organizing accounts
              </p>
            </div>

            <div>
              <Label htmlFor="name">
                Account Name <span className="text-danger-600">*</span>
              </Label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="name"
                  {...register("name")}
                  className="pl-9"
                  placeholder="Cash"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-danger-600">{errors.name.message}</p>
              )}
            </div>
          </div>

          {/* Type and Subtype */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="type">
                Account Type <span className="text-danger-600">*</span>
              </Label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Layers className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  id="type"
                  {...register("type")}
                  disabled={account?.isSystem}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-9 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {ACCOUNT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.type && (
                <p className="mt-1 text-xs text-danger-600">{errors.type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="subType">Subtype</Label>
              <select
                id="subType"
                {...register("subType")}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">-- None --</option>
                {subtypes.map((subtype) => (
                  <option key={subtype} value={subtype}>
                    {subtype.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Parent Account */}
          {parentAccounts.length > 0 && (
            <div>
              <Label htmlFor="parentAccountId">Parent Account</Label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Building2 className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  id="parentAccountId"
                  {...register("parentAccountId")}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-9 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">-- None --</option>
                  {parentAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.code} - {acc.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Optional: Organize accounts hierarchically
              </p>
            </div>
          )}

          {/* Tax Category */}
          <div>
            <Label htmlFor="taxCategory">Tax Category</Label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Tag className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="taxCategory"
                {...register("taxCategory")}
                className="pl-9"
                placeholder="e.g., Tax Deductible"
              />
            </div>
          </div>

          {/* Flags */}
          <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isBankAccount"
                {...register("isBankAccount")}
                className="h-4 w-4 rounded border-gray-300"
                disabled={account?.isSystem}
              />
              <Label htmlFor="isBankAccount" className="cursor-pointer">
                Bank Account
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isControlAccount"
                {...register("isControlAccount")}
                className="h-4 w-4 rounded border-gray-300"
                disabled={account?.isSystem}
              />
              <Label htmlFor="isControlAccount" className="cursor-pointer">
                Control Account
              </Label>
            </div>

            {isEditing && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register("isActive")}
                  className="h-4 w-4 rounded border-gray-300"
                  disabled={account?.isSystem}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active
                </Label>
              </div>
            )}
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
                ? "Update Account"
                : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
