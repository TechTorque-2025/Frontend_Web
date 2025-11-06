/**
 * Payment & Invoice API
 * All endpoints for payment processing and invoice management
 * Port 8086 - Routes: /api/v1/payments & /api/v1/invoices
 */

import apiClient from './axios-config';
import {
  PaymentRequestDto,
  InvoiceRequestDto,
  PaymentDto,
  InvoiceDto,
  ApiResponse,
} from '@/types/payment.types';

// ============================================
// Payment Endpoints
// ============================================

export const paymentService = {
  /**
   * POST /api/v1/payments
   * Process a new payment for an invoice
   */
  processPayment: async (paymentData: PaymentRequestDto): Promise<PaymentDto> => {
    const response = await apiClient.post<ApiResponse<PaymentDto>>('/api/v1/payments', paymentData);
    if (!response.data.data) {
      throw new Error('Failed to process payment');
    }
    return response.data.data;
  },

  /**
   * GET /api/v1/payments
   * Get the payment history for the current customer
   */
  getPaymentHistory: async (): Promise<PaymentDto[]> => {
    const response = await apiClient.get<ApiResponse<PaymentDto[]>>('/api/v1/payments');
    return response.data.data || [];
  },

  /**
   * GET /api/v1/payments/{paymentId}
   * Get details for a specific payment
   */
  getPaymentDetails: async (paymentId: string): Promise<PaymentDto> => {
    const response = await apiClient.get<ApiResponse<PaymentDto>>(`/api/v1/payments/${paymentId}`);
    if (!response.data.data) {
      throw new Error('Payment not found');
    }
    return response.data.data;
  },

  /**
   * POST /api/v1/payments/notify
   * Callback endpoint for PayHere to send payment notifications (webhook)
   * Note: This is typically called by the payment gateway, not the frontend
   */
  handlePayhereNotification: async (formData: Record<string, string[]>): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(
      '/api/v1/payments/notify',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data;
  },
};

// ============================================
// Invoice Endpoints
// ============================================

export const invoiceService = {
  /**
   * GET /api/v1/invoices
   * List invoices for the current customer
   */
  listInvoices: async (): Promise<InvoiceDto[]> => {
    const response = await apiClient.get<ApiResponse<InvoiceDto[]>>('/api/v1/invoices');
    return response.data.data || [];
  },

  /**
   * GET /api/v1/invoices/{invoiceId}
   * Get invoice details
   */
  getInvoice: async (invoiceId: string): Promise<InvoiceDto> => {
    const response = await apiClient.get<ApiResponse<InvoiceDto>>(`/api/v1/invoices/${invoiceId}`);
    if (!response.data.data) {
      throw new Error('Invoice not found');
    }
    return response.data.data;
  },

  /**
   * POST /api/v1/invoices
   * Create a new invoice (employee/admin only)
   */
  createInvoice: async (invoiceData: InvoiceRequestDto): Promise<InvoiceDto> => {
    const response = await apiClient.post<ApiResponse<InvoiceDto>>('/api/v1/invoices', invoiceData);
    if (!response.data.data) {
      throw new Error('Failed to create invoice');
    }
    return response.data.data;
  },

  /**
   * PUT /api/v1/invoices/{invoiceId}/pay
   * Mark invoice as paid (employee/admin only)
   */
  markAsPaid: async (invoiceId: string): Promise<InvoiceDto> => {
    const response = await apiClient.put<ApiResponse<InvoiceDto>>(
      `/api/v1/invoices/${invoiceId}/pay`
    );
    if (!response.data.data) {
      throw new Error('Failed to mark invoice as paid');
    }
    return response.data.data;
  },

  /**
   * POST /api/v1/invoices/{invoiceId}/send
   * Send an invoice to a customer via email (employee/admin only)
   */
  sendInvoiceByEmail: async (invoiceId: string, email: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(
      `/api/v1/invoices/${invoiceId}/send`,
      null,
      {
        params: { email },
      }
    );
    return response.data;
  },
};
