import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type InvoiceStatus = "draft" | "sent" | "viewed" | "partial" | "paid" | "overdue" | "void";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

const statusConfig = {
  draft: {
    label: "Draft",
    variant: "outline" as const,
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  sent: {
    label: "Sent",
    variant: "default" as const,
    className: "bg-primary-100 text-primary-700 border-primary-200",
  },
  viewed: {
    label: "Viewed",
    variant: "default" as const,
    className: "bg-primary-100 text-primary-700 border-primary-200",
  },
  partial: {
    label: "Partial",
    variant: "warning" as const,
    className: "bg-warning-100 text-warning-700 border-warning-200",
  },
  paid: {
    label: "Paid",
    variant: "success" as const,
    className: "bg-success-100 text-success-700 border-success-200",
  },
  overdue: {
    label: "Overdue",
    variant: "danger" as const,
    className: "bg-danger-100 text-danger-700 border-danger-200",
  },
  void: {
    label: "Void",
    variant: "outline" as const,
    className: "bg-gray-100 text-gray-500 border-gray-200 line-through",
  },
};

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
