import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency with locale awareness
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format date with locale awareness
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    ...options,
  }).format(dateObj);
}

/**
 * Calculate days until/since a date
 */
export function daysUntil(date: Date | string): number {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  const diff = dateObj.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date is overdue
 */
export function isOverdue(date: Date | string): boolean {
  return daysUntil(date) < 0;
}
