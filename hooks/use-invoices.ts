/**
 * Custom hook for invoice operations
 * Provides a clean API for invoice-related tRPC calls
 */

import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";

export function useInvoices() {
  const utils = trpc.useUtils();

  // Queries
  const list = trpc.invoices.list.useQuery;
  const getById = trpc.invoices.getById.useQuery;
  const getStats = trpc.invoices.getStats.useQuery;

  // Mutations
  const createInvoice = trpc.invoices.create.useMutation({
    onSuccess: () => {
      utils.invoices.list.invalidate();
      utils.invoices.getStats.invalidate();
      toast.success("Invoice created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateInvoice = trpc.invoices.update.useMutation({
    onSuccess: () => {
      utils.invoices.list.invalidate();
      utils.invoices.getById.invalidate();
      utils.invoices.getStats.invalidate();
      toast.success("Invoice updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteInvoice = trpc.invoices.delete.useMutation({
    onSuccess: () => {
      utils.invoices.list.invalidate();
      utils.invoices.getStats.invalidate();
      toast.success("Invoice deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const sendInvoice = trpc.invoices.send.useMutation({
    onSuccess: () => {
      utils.invoices.list.invalidate();
      utils.invoices.getById.invalidate();
      utils.invoices.getStats.invalidate();
      toast.success("Invoice sent successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const generatePDF = trpc.invoices.generatePDF.useMutation({
    onSuccess: () => {
      toast.success("PDF generated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const recordPayment = trpc.invoices.recordPayment.useMutation({
    onSuccess: () => {
      utils.invoices.list.invalidate();
      utils.invoices.getById.invalidate();
      utils.invoices.getStats.invalidate();
      toast.success("Payment recorded successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    // Queries
    list,
    getById,
    getStats,

    // Mutations
    create: createInvoice,
    update: updateInvoice,
    delete: deleteInvoice,
    send: sendInvoice,
    generatePDF,
    recordPayment,
  };
}
