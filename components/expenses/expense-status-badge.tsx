import { Badge } from "@/components/ui/badge";

export type ExpenseStatus = "draft" | "submitted" | "approved" | "rejected" | "paid";

interface ExpenseStatusBadgeProps {
  status: ExpenseStatus;
}

export function ExpenseStatusBadge({ status }: ExpenseStatusBadgeProps) {
  const config = {
    draft: {
      label: "Draft",
      className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    },
    submitted: {
      label: "Submitted",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
    approved: {
      label: "Approved",
      className: "bg-success-100 text-success-800 hover:bg-success-100",
    },
    rejected: {
      label: "Rejected",
      className: "bg-danger-100 text-danger-800 hover:bg-danger-100",
    },
    paid: {
      label: "Paid",
      className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
  };

  const { label, className } = config[status] || config.draft;

  return <Badge className={className}>{label}</Badge>;
}
