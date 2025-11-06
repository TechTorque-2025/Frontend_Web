/**
 * Payment & Invoice Form Validation Utilities
 * Matches backend validation requirements
 */

import { PaymentFormErrors, PAYMENT_VALIDATION, PaymentMethod } from '@/types/payment.types';

export const paymentValidation = {
  /**
   * Validate invoice ID
   */
  invoiceId: (value: string): string | null => {
    if (!value || !value.trim()) {
      return 'Invoice is required';
    }
    if (value.length < PAYMENT_VALIDATION.INVOICE_ID.MIN_LENGTH) {
      return 'Invalid invoice selection';
    }
    return null;
  },

  /**
   * Validate payment amount
   */
  amount: (value: string): string | null => {
    if (!value) {
      return 'Amount is required';
    }
    const amountNum = parseFloat(value);
    if (isNaN(amountNum)) {
      return 'Amount must be a valid number';
    }
    if (amountNum < PAYMENT_VALIDATION.AMOUNT.MIN) {
      return 'Amount cannot be negative';
    }
    return null;
  },

  /**
   * Validate payment method
   */
  method: (value: string): string | null => {
    if (!value) {
      return 'Payment method is required';
    }
    const validMethods = Object.values(PaymentMethod);
    if (!validMethods.includes(value as PaymentMethod)) {
      return 'Invalid payment method';
    }
    return null;
  },

  /**
   * Validate customer ID
   */
  customerId: (value: string): string | null => {
    if (!value || !value.trim()) {
      return 'Customer is required';
    }
    if (value.length < PAYMENT_VALIDATION.CUSTOMER_ID.MIN_LENGTH) {
      return 'Invalid customer selection';
    }
    return null;
  },

  /**
   * Validate service or project ID
   */
  serviceOrProjectId: (value: string): string | null => {
    if (!value || !value.trim()) {
      return 'Service or Project is required';
    }
    if (value.length < PAYMENT_VALIDATION.SERVICE_OR_PROJECT_ID.MIN_LENGTH) {
      return 'Invalid service/project selection';
    }
    return null;
  },

  /**
   * Validate issue date
   */
  issueDate: (value: string): string | null => {
    if (!value) {
      return 'Issue date is required';
    }
    const issueDate = new Date(value);
    if (isNaN(issueDate.getTime())) {
      return 'Invalid date format';
    }
    return null;
  },

  /**
   * Validate due date
   */
  dueDate: (issueDate: string, dueDate: string): string | null => {
    if (!dueDate) {
      return 'Due date is required';
    }
    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      return 'Invalid date format';
    }

    if (issueDate) {
      const issueDateObj = new Date(issueDate);
      if (dueDateObj < issueDateObj) {
        return 'Due date cannot be before issue date';
      }
    }

    return null;
  },
};

/**
 * Validate payment form
 */
export function validatePaymentForm(formData: {
  invoiceId: string;
  amount: string;
  method: string;
}): PaymentFormErrors {
  const errors: PaymentFormErrors = {};

  const invoiceIdError = paymentValidation.invoiceId(formData.invoiceId);
  if (invoiceIdError) errors.invoiceId = invoiceIdError;

  const amountError = paymentValidation.amount(formData.amount);
  if (amountError) errors.amount = amountError;

  const methodError = paymentValidation.method(formData.method);
  if (methodError) errors.method = methodError;

  return errors;
}

/**
 * Validate invoice form
 */
export function validateInvoiceForm(formData: {
  customerId: string;
  serviceOrProjectId: string;
  amount: string;
  issueDate: string;
  dueDate: string;
}): PaymentFormErrors {
  const errors: PaymentFormErrors = {};

  const customerIdError = paymentValidation.customerId(formData.customerId);
  if (customerIdError) errors.customerId = customerIdError;

  const serviceOrProjectIdError = paymentValidation.serviceOrProjectId(formData.serviceOrProjectId);
  if (serviceOrProjectIdError) errors.serviceOrProjectId = serviceOrProjectIdError;

  const amountError = paymentValidation.amount(formData.amount);
  if (amountError) errors.amount = amountError;

  const issueDateError = paymentValidation.issueDate(formData.issueDate);
  if (issueDateError) errors.issueDate = issueDateError;

  const dueDateError = paymentValidation.dueDate(formData.issueDate, formData.dueDate);
  if (dueDateError) errors.dueDate = dueDateError;

  return errors;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Check if invoice is overdue
 */
export function isInvoiceOverdue(dueDate: string, paidDate: string | null): boolean {
  if (paidDate) return false; // Already paid
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Get date 30 days from now in YYYY-MM-DD format
 */
export function getDefaultDueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
}
