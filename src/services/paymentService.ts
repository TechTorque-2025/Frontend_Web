"use client";
import api from '../lib/apiClient';

export interface PaymentInitiationRequest {
  orderId: string;
  amount: number;
  currency: string;
  itemDescription: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
}

export interface PaymentInitiationResponse {
  merchantId: string;
  orderId: string;
  amount: number;
  currency: string;
  hash: string;
  itemDescription: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  sandbox: boolean;
}

export const paymentService = {
  async initiatePayment(payload: PaymentInitiationRequest): Promise<PaymentInitiationResponse> {
    const res = await api.post('/payments/initiate', payload);
    return res.data;
  },

  async getPaymentHistory() {
    const res = await api.get('/payments');
    return res.data;
  },

  async getPaymentDetails(paymentId: string) {
    const res = await api.get(`/payments/${paymentId}`);
    return res.data;
  }
};

export default paymentService;
