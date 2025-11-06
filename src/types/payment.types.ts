/**
 * Payment & Invoice Types
 * Generated from OpenAPI spec - Payment Service API (Port 8086)
 * Handles payment processing and invoice management
 * NO 'any' types used - full TypeScript strictness
 */

// ============================================
// Enums
// ============================================

export enum PaymentMethod {
  CARD = 'CARD',
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER'
}

export enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

// ============================================
// Request DTOs - Payments
// ============================================

export interface PaymentRequestDto {
  invoiceId: string;                        // min 1 char, required
  amount: number;                           // min 0, required
  method: PaymentMethod;                    // required
  paymentGatewayTransactionId?: string;     // optional
}

// ============================================
// Request DTOs - Invoices
// ============================================

export interface InvoiceRequestDto {
  customerId: string;                       // min 1 char, required
  serviceOrProjectId: string;               // min 1 char, required
  amount: number;                           // min 0, required
  issueDate: string;                        // ISO 8601 date, required
  dueDate: string;                          // ISO 8601 date, required
}

// ============================================
// Response DTOs - Payments
// ============================================

export interface PaymentDto {
  paymentId: string;
  customerId: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paymentGatewayTransactionId: string | null;
  createdAt: string;                        // ISO 8601 date-time
  completedAt: string | null;               // ISO 8601 date-time
}

// ============================================
// Response DTOs - Invoices
// ============================================

export interface InvoiceDto {
  invoiceId: string;
  customerId: string;
  serviceOrProjectId: string;
  amount: number;
  status: InvoiceStatus;
  issueDate: string;                        // ISO 8601 date
  dueDate: string;                          // ISO 8601 date
  paidDate: string | null;                  // ISO 8601 date
  createdAt: string;                        // ISO 8601 date-time
  updatedAt: string;                        // ISO 8601 date-time
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// ============================================
// Form State Types
// ============================================

export interface PaymentFormData {
  invoiceId: string;
  amount: string;                           // string for input, converted to number
  method: PaymentMethod | '';
  paymentGatewayTransactionId: string;
}

export interface InvoiceFormData {
  customerId: string;
  serviceOrProjectId: string;
  amount: string;                           // string for input, converted to number
  issueDate: string;                        // YYYY-MM-DD format
  dueDate: string;                          // YYYY-MM-DD format
}

export interface PaymentFormErrors {
  [key: string]: string;
}

// ============================================
// UI State Types
// ============================================

export interface PaymentListState {
  payments: PaymentDto[];
  isLoading: boolean;
  error: string | null;
}

export interface InvoiceListState {
  invoices: InvoiceDto[];
  isLoading: boolean;
  error: string | null;
}

// ============================================
// Status Display Config
// ============================================

export const INVOICE_STATUS_CONFIG = {
  [InvoiceStatus.PENDING]: {
    label: 'Pending',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900',
    textClass: 'text-yellow-800 dark:text-yellow-200',
  },
  [InvoiceStatus.PAID]: {
    label: 'Paid',
    bgClass: 'bg-green-100 dark:bg-green-900',
    textClass: 'text-green-800 dark:text-green-200',
  },
  [InvoiceStatus.OVERDUE]: {
    label: 'Overdue',
    bgClass: 'bg-red-100 dark:bg-red-900',
    textClass: 'text-red-800 dark:text-red-200',
  },
  [InvoiceStatus.CANCELLED]: {
    label: 'Cancelled',
    bgClass: 'bg-gray-100 dark:bg-gray-800',
    textClass: 'text-gray-800 dark:text-gray-200',
  },
} as const;

export const PAYMENT_STATUS_CONFIG = {
  [PaymentStatus.PENDING]: {
    label: 'Pending',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900',
    textClass: 'text-yellow-800 dark:text-yellow-200',
  },
  [PaymentStatus.COMPLETED]: {
    label: 'Completed',
    bgClass: 'bg-green-100 dark:bg-green-900',
    textClass: 'text-green-800 dark:text-green-200',
  },
  [PaymentStatus.FAILED]: {
    label: 'Failed',
    bgClass: 'bg-red-100 dark:bg-red-900',
    textClass: 'text-red-800 dark:text-red-200',
  },
  [PaymentStatus.REFUNDED]: {
    label: 'Refunded',
    bgClass: 'bg-purple-100 dark:bg-purple-900',
    textClass: 'text-purple-800 dark:text-purple-200',
  },
} as const;

export const PAYMENT_METHOD_CONFIG = {
  [PaymentMethod.CARD]: {
    label: 'Card',
    icon: '💳',
  },
  [PaymentMethod.CASH]: {
    label: 'Cash',
    icon: '💵',
  },
  [PaymentMethod.BANK_TRANSFER]: {
    label: 'Bank Transfer',
    icon: '🏦',
  },
} as const;

// ============================================
// Validation Constants
// ============================================

export const PAYMENT_VALIDATION = {
  INVOICE_ID: {
    MIN_LENGTH: 1,
  },
  AMOUNT: {
    MIN: 0,
  },
  CUSTOMER_ID: {
    MIN_LENGTH: 1,
  },
  SERVICE_OR_PROJECT_ID: {
    MIN_LENGTH: 1,
  },
} as const;
