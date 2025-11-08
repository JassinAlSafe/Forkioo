/**
 * Validation rules and constraints for forms and API inputs
 * Centralized validation logic for consistency across the application
 */

import { z } from "zod";

// ============================================================
// Regex Patterns
// ============================================================

export const REGEX_PATTERNS = {
  // Email validation (RFC 5322 simplified)
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // Phone number (international format)
  phone: /^\+?[1-9]\d{1,14}$/,

  // US Phone number (10 digits)
  phoneUS: /^(\+1)?[2-9]\d{2}[2-9]\d{6}$/,

  // Tax ID / EIN (US: 12-3456789)
  taxIdUS: /^\d{2}-?\d{7}$/,

  // Website URL
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,

  // Invoice number format (letters, numbers, hyphens)
  invoiceNumber: /^[A-Z0-9-]+$/,

  // Account code (alphanumeric with hyphens, max 20 chars)
  accountCode: /^[A-Z0-9-]{1,20}$/,

  // Postal code (flexible international format)
  postalCode: /^[A-Z0-9\s-]{3,10}$/i,

  // Currency amount (positive decimal with up to 2 decimal places)
  currencyAmount: /^\d+(\.\d{1,2})?$/,

  // Percentage (0-100 with up to 2 decimal places)
  percentage: /^(100(\.0{1,2})?|[0-9]?[0-9](\.\d{1,2})?)$/,

  // Hex color code
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,

  // UUID v4
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
} as const;

// ============================================================
// Field Constraints
// ============================================================

export const FIELD_CONSTRAINTS = {
  // String lengths
  name: { min: 1, max: 255 },
  email: { min: 5, max: 255 },
  phone: { min: 10, max: 20 },
  description: { min: 1, max: 1000 },
  notes: { min: 0, max: 5000 },
  address: { min: 0, max: 500 },
  taxId: { min: 9, max: 20 },
  website: { min: 4, max: 255 },
  accountCode: { min: 1, max: 20 },
  accountName: { min: 1, max: 255 },
  invoiceNumber: { min: 1, max: 50 },

  // Numeric ranges
  amount: { min: 0, max: 999999999999.9999 }, // 19 digits, 4 decimal places
  quantity: { min: 0, max: 999999.9999 },
  unitPrice: { min: 0, max: 999999999.9999 },
  taxRate: { min: 0, max: 100 },
  discount: { min: 0, max: 100 },
  paymentTerms: { min: 0, max: 365 },

  // File uploads
  fileSize: { max: 10 * 1024 * 1024 }, // 10MB
  fileName: { max: 255 },
  attachments: { max: 10 },
} as const;

// ============================================================
// Validation Error Messages
// ============================================================

export const VALIDATION_MESSAGES = {
  // Required fields
  required: (field: string) => `${field} is required`,
  requiredSelect: (field: string) => `Please select a ${field}`,

  // String validation
  minLength: (field: string, min: number) =>
    `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) =>
    `${field} must not exceed ${max} characters`,

  // Numeric validation
  minValue: (field: string, min: number) =>
    `${field} must be at least ${min}`,
  maxValue: (field: string, max: number) =>
    `${field} must not exceed ${max}`,
  positive: (field: string) => `${field} must be a positive number`,
  nonNegative: (field: string) => `${field} cannot be negative`,

  // Format validation
  invalidEmail: "Please enter a valid email address",
  invalidPhone: "Please enter a valid phone number",
  invalidUrl: "Please enter a valid URL",
  invalidDate: "Please enter a valid date",
  invalidFormat: (field: string) => `${field} format is invalid`,

  // Business logic
  futureDate: (field: string) => `${field} cannot be in the future`,
  pastDate: (field: string) => `${field} cannot be in the past`,
  dateRange: "End date must be after start date",
  duplicate: (field: string) => `${field} already exists`,
  notFound: (field: string) => `${field} not found`,

  // File uploads
  fileTooBig: (maxSize: string) => `File size must not exceed ${maxSize}`,
  invalidFileType: (types: string) => `Only ${types} files are allowed`,
  tooManyFiles: (max: number) => `Maximum ${max} files allowed`,
} as const;

// ============================================================
// Reusable Zod Schemas
// ============================================================

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .min(FIELD_CONSTRAINTS.email.min, VALIDATION_MESSAGES.minLength("Email", FIELD_CONSTRAINTS.email.min))
  .max(FIELD_CONSTRAINTS.email.max, VALIDATION_MESSAGES.maxLength("Email", FIELD_CONSTRAINTS.email.max))
  .regex(REGEX_PATTERNS.email, VALIDATION_MESSAGES.invalidEmail);

/**
 * Optional email validation schema
 */
export const optionalEmailSchema = z
  .string()
  .regex(REGEX_PATTERNS.email, VALIDATION_MESSAGES.invalidEmail)
  .optional()
  .or(z.literal(""));

/**
 * Phone validation schema (international format)
 */
export const phoneSchema = z
  .string()
  .min(FIELD_CONSTRAINTS.phone.min, VALIDATION_MESSAGES.minLength("Phone", FIELD_CONSTRAINTS.phone.min))
  .max(FIELD_CONSTRAINTS.phone.max, VALIDATION_MESSAGES.maxLength("Phone", FIELD_CONSTRAINTS.phone.max))
  .regex(REGEX_PATTERNS.phone, VALIDATION_MESSAGES.invalidPhone);

/**
 * Optional phone validation schema
 */
export const optionalPhoneSchema = z
  .string()
  .regex(REGEX_PATTERNS.phone, VALIDATION_MESSAGES.invalidPhone)
  .optional()
  .or(z.literal(""));

/**
 * URL validation schema
 */
export const urlSchema = z
  .string()
  .regex(REGEX_PATTERNS.url, VALIDATION_MESSAGES.invalidUrl);

/**
 * Optional URL validation schema
 */
export const optionalUrlSchema = z
  .string()
  .regex(REGEX_PATTERNS.url, VALIDATION_MESSAGES.invalidUrl)
  .optional()
  .or(z.literal(""));

/**
 * Currency amount validation schema
 */
export const amountSchema = z
  .number()
  .nonnegative(VALIDATION_MESSAGES.nonNegative("Amount"))
  .max(FIELD_CONSTRAINTS.amount.max, VALIDATION_MESSAGES.maxValue("Amount", FIELD_CONSTRAINTS.amount.max));

/**
 * Optional currency amount validation schema
 */
export const optionalAmountSchema = z
  .number()
  .nonnegative(VALIDATION_MESSAGES.nonNegative("Amount"))
  .max(FIELD_CONSTRAINTS.amount.max, VALIDATION_MESSAGES.maxValue("Amount", FIELD_CONSTRAINTS.amount.max))
  .optional();

/**
 * Percentage validation schema (0-100)
 */
export const percentageSchema = z
  .number()
  .min(0, VALIDATION_MESSAGES.minValue("Percentage", 0))
  .max(100, VALIDATION_MESSAGES.maxValue("Percentage", 100));

/**
 * Tax rate validation schema (0-100)
 */
export const taxRateSchema = percentageSchema;

/**
 * Discount validation schema (0-100)
 */
export const discountSchema = percentageSchema;

/**
 * Date validation schema
 */
export const dateSchema = z.date({
  required_error: VALIDATION_MESSAGES.required("Date"),
  invalid_type_error: VALIDATION_MESSAGES.invalidDate,
});

/**
 * Future date validation schema
 */
export const futureDateSchema = dateSchema.refine(
  (date) => date >= new Date(),
  VALIDATION_MESSAGES.futureDate("Date")
);

/**
 * Past date validation schema
 */
export const pastDateSchema = dateSchema.refine(
  (date) => date <= new Date(),
  VALIDATION_MESSAGES.pastDate("Date")
);

/**
 * Address validation schema
 */
export const addressSchema = z.object({
  street: z.string().max(FIELD_CONSTRAINTS.address.max).optional(),
  city: z.string().max(FIELD_CONSTRAINTS.name.max).optional(),
  state: z.string().max(FIELD_CONSTRAINTS.name.max).optional(),
  postalCode: z
    .string()
    .regex(REGEX_PATTERNS.postalCode, VALIDATION_MESSAGES.invalidFormat("Postal code"))
    .optional(),
  country: z.string().max(FIELD_CONSTRAINTS.name.max).optional(),
});

/**
 * Invoice number validation schema
 */
export const invoiceNumberSchema = z
  .string()
  .min(FIELD_CONSTRAINTS.invoiceNumber.min)
  .max(FIELD_CONSTRAINTS.invoiceNumber.max)
  .regex(REGEX_PATTERNS.invoiceNumber, VALIDATION_MESSAGES.invalidFormat("Invoice number"));

/**
 * Account code validation schema
 */
export const accountCodeSchema = z
  .string()
  .min(FIELD_CONSTRAINTS.accountCode.min)
  .max(FIELD_CONSTRAINTS.accountCode.max)
  .regex(REGEX_PATTERNS.accountCode, VALIDATION_MESSAGES.invalidFormat("Account code"));

// ============================================================
// Validation Helper Functions
// ============================================================

/**
 * Validates an email address
 */
export function isValidEmail(email: string): boolean {
  return REGEX_PATTERNS.email.test(email);
}

/**
 * Validates a phone number
 */
export function isValidPhone(phone: string): boolean {
  return REGEX_PATTERNS.phone.test(phone);
}

/**
 * Validates a URL
 */
export function isValidUrl(url: string): boolean {
  return REGEX_PATTERNS.url.test(url);
}

/**
 * Validates a currency amount
 */
export function isValidAmount(amount: number): boolean {
  return amount >= 0 && amount <= FIELD_CONSTRAINTS.amount.max;
}

/**
 * Validates a percentage (0-100)
 */
export function isValidPercentage(value: number): boolean {
  return value >= 0 && value <= 100;
}

/**
 * Validates a date is not in the future
 */
export function isNotFutureDate(date: Date): boolean {
  return date <= new Date();
}

/**
 * Validates a date is not in the past
 */
export function isNotPastDate(date: Date): boolean {
  return date >= new Date();
}

/**
 * Validates a date range (end after start)
 */
export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return endDate >= startDate;
}
