"use client";
import api from '../lib/apiClient';
import type {
  PaymentRequestDto,
  PaymentResponseDto,
  PaymentInitiationDto,
  PaymentInitiationResponseDto,
  SchedulePaymentDto,
  ScheduledPaymentResponseDto,
  InvoiceResponseDto,
  CreateInvoiceDto,
  SendInvoiceDto
} from '../types/payment';

export const paymentService = {
  // ===== PAYMENTS =====
  
  async processPayment(data: PaymentRequestDto): Promise<PaymentResponseDto> {
    const res = await api.post('/payments', data);
    return res.data;
  },

  async getPaymentHistory(): Promise<PaymentResponseDto[]> {
    const res = await api.get('/payments');
    return res.data;
  },

  async getPaymentDetails(paymentId: string): Promise<PaymentResponseDto> {
    const res = await api.get(`/payments/${paymentId}`);
    return res.data;
  },

  // PayHere Integration
  async initiatePayment(data: PaymentInitiationDto): Promise<PaymentInitiationResponseDto> {
    const res = await api.post('/payments/initiate', data);
    return res.data;
  },

  // Scheduled Payments
  async schedulePayment(data: SchedulePaymentDto): Promise<ScheduledPaymentResponseDto> {
    const res = await api.post('/payments/schedule', data);
    return res.data;
  },

  async getScheduledPayments(): Promise<ScheduledPaymentResponseDto[]> {
    const res = await api.get('/payments/schedule');
    return res.data;
  },

  async cancelScheduledPayment(scheduleId: string): Promise<void> {
    await api.delete(`/payments/schedule/${scheduleId}`);
  },

  // ===== INVOICES =====
  
  async listInvoices(): Promise<InvoiceResponseDto[]> {
    const res = await api.get('/invoices');
    return res.data;
  },

  async getInvoice(invoiceId: string): Promise<InvoiceResponseDto> {
    const res = await api.get(`/invoices/${invoiceId}`);
    return res.data;
  },

  async createInvoice(data: CreateInvoiceDto): Promise<InvoiceResponseDto> {
    const res = await api.post('/invoices', data);
    return res.data;
  },

  async sendInvoiceByEmail(invoiceId: string, data: SendInvoiceDto): Promise<{ message: string }> {
    const res = await api.post(`/invoices/${invoiceId}/send`, data);
    return res.data;
  },

  async downloadInvoice(invoiceId: string): Promise<Blob> {
    const res = await api.get(`/invoices/${invoiceId}/download`, {
      responseType: 'blob'
    });
    return res.data;
  },

  // Get invoices by status
  async getInvoicesByStatus(status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'): Promise<InvoiceResponseDto[]> {
    const invoices = await this.listInvoices();
    return invoices.filter(inv => inv.status === status);
  },

  // Get unpaid invoices
  async getUnpaidInvoices(): Promise<InvoiceResponseDto[]> {
    const invoices = await this.listInvoices();
    return invoices.filter(inv => inv.status === 'SENT' || inv.status === 'OVERDUE');
  },
};

export default paymentService;
