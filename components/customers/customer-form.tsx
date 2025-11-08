"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Phone, MapPin, Hash, FileText } from "lucide-react";
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

const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CustomerFormData) => void;
  customer?: CustomerFormData & { id?: string };
  isSubmitting?: boolean;
}

export function CustomerForm({
  open,
  onOpenChange,
  onSubmit,
  customer,
  isSubmitting = false,
}: CustomerFormProps) {
  const isEditing = !!customer?.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer || {
      name: "",
      email: "",
      phone: "",
      address: "",
      taxId: "",
      notes: "",
    },
  });

  const handleFormSubmit = (data: CustomerFormData) => {
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Customer" : "New Customer"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update customer information"
              : "Add a new customer to your account"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">
              Customer Name <span className="text-danger-600">*</span>
            </Label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="name"
                {...register("name")}
                className="pl-9"
                placeholder="Acme Corporation"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-danger-600">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="pl-9"
                placeholder="customer@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-danger-600">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone</Label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                className="pl-9"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address">Address</Label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-start pl-3 pt-3">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <Textarea
                id="address"
                {...register("address")}
                className="pl-9"
                placeholder="123 Main Street, City, State ZIP"
                rows={2}
              />
            </div>
          </div>

          {/* Tax ID */}
          <div>
            <Label htmlFor="taxId">Tax ID / VAT Number</Label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Hash className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="taxId"
                {...register("taxId")}
                className="pl-9"
                placeholder="12-3456789"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-start pl-3 pt-3">
                <FileText className="h-4 w-4 text-gray-400" />
              </div>
              <Textarea
                id="notes"
                {...register("notes")}
                className="pl-9"
                placeholder="Any additional notes about this customer..."
                rows={3}
              />
            </div>
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
                ? "Update Customer"
                : "Create Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
