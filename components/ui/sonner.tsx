"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-600",
          actionButton:
            "group-[.toast]:bg-primary-600 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-600",
          error:
            "group-[.toaster]:bg-danger-50 group-[.toaster]:text-danger-900 group-[.toaster]:border-danger-200",
          success:
            "group-[.toaster]:bg-success-50 group-[.toaster]:text-success-900 group-[.toaster]:border-success-200",
          warning:
            "group-[.toaster]:bg-warning-50 group-[.toaster]:text-warning-900 group-[.toaster]:border-warning-200",
          info:
            "group-[.toaster]:bg-primary-50 group-[.toaster]:text-primary-900 group-[.toaster]:border-primary-200",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
