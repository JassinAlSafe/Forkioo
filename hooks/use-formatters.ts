/**
 * Custom hook for formatting utilities
 * Provides consistent formatting across the application
 */

import { useCallback, useMemo } from "react";
import { Currency } from "@/types/enums";

interface FormattersOptions {
  currency?: Currency;
  locale?: string;
}

export function useFormatters(options: FormattersOptions = {}) {
  const { currency = Currency.USD, locale = "en-US" } = options;

  // Currency formatter
  const formatCurrency = useCallback(
    (amount: number | string, opts?: { minimumFractionDigits?: number; maximumFractionDigits?: number }) => {
      const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: opts?.minimumFractionDigits ?? 2,
        maximumFractionDigits: opts?.maximumFractionDigits ?? 2,
      }).format(numAmount);
    },
    [currency, locale]
  );

  // Number formatter
  const formatNumber = useCallback(
    (value: number | string, opts?: { minimumFractionDigits?: number; maximumFractionDigits?: number }) => {
      const numValue = typeof value === "string" ? parseFloat(value) : value;

      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: opts?.minimumFractionDigits ?? 0,
        maximumFractionDigits: opts?.maximumFractionDigits ?? 2,
      }).format(numValue);
    },
    [locale]
  );

  // Percentage formatter
  const formatPercentage = useCallback(
    (value: number, opts?: { minimumFractionDigits?: number; maximumFractionDigits?: number }) => {
      return new Intl.NumberFormat(locale, {
        style: "percent",
        minimumFractionDigits: opts?.minimumFractionDigits ?? 0,
        maximumFractionDigits: opts?.maximumFractionDigits ?? 1,
      }).format(value / 100);
    },
    [locale]
  );

  // Date formatter
  const formatDate = useCallback(
    (date: Date | string, opts?: Intl.DateTimeFormatOptions) => {
      const dateObj = typeof date === "string" ? new Date(date) : date;

      const defaultOpts: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
      };

      return new Intl.DateTimeFormat(locale, { ...defaultOpts, ...opts }).format(dateObj);
    },
    [locale]
  );

  // Date and time formatter
  const formatDateTime = useCallback(
    (date: Date | string) => {
      const dateObj = typeof date === "string" ? new Date(date) : date;

      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(dateObj);
    },
    [locale]
  );

  // Relative time formatter (e.g., "2 hours ago")
  const formatRelativeTime = useCallback((date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    if (diffWeek < 4) return `${diffWeek}w ago`;
    if (diffMonth < 12) return `${diffMonth}mo ago`;
    return `${diffYear}y ago`;
  }, []);

  // Phone number formatter
  const formatPhoneNumber = useCallback((phone: string) => {
    const cleaned = phone.replace(/\D/g, "");

    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    return phone;
  }, []);

  // Tax ID formatter (e.g., EIN)
  const formatTaxId = useCallback((taxId: string) => {
    const cleaned = taxId.replace(/\D/g, "");

    if (cleaned.length === 9) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
    }

    return taxId;
  }, []);

  // File size formatter
  const formatFileSize = useCallback((bytes: number) => {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }, []);

  // Capitalize first letter
  const capitalize = useCallback((text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }, []);

  // Convert snake_case to Title Case
  const snakeToTitle = useCallback((text: string) => {
    return text
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, []);

  // Convert camelCase to Title Case
  const camelToTitle = useCallback((text: string) => {
    return text
      .replace(/([A-Z])/g, " $1")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, []);

  return useMemo(
    () => ({
      formatCurrency,
      formatNumber,
      formatPercentage,
      formatDate,
      formatDateTime,
      formatRelativeTime,
      formatPhoneNumber,
      formatTaxId,
      formatFileSize,
      capitalize,
      snakeToTitle,
      camelToTitle,
    }),
    [
      formatCurrency,
      formatNumber,
      formatPercentage,
      formatDate,
      formatDateTime,
      formatRelativeTime,
      formatPhoneNumber,
      formatTaxId,
      formatFileSize,
      capitalize,
      snakeToTitle,
      camelToTitle,
    ]
  );
}
