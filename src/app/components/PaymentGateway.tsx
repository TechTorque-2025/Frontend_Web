'use client'

import React, { useState } from 'react';
import payHereService from '../../services/payhereService';
import paymentService, { PaymentInitiationRequest } from '../../services/paymentService';

interface PaymentGatewayProps {
  amount: number;
  itemDescription: string;
  customerEmail: string;
  customerPhone: string;
  customerFirstName: string;
  customerLastName: string;
  customerAddress?: string;
  customerCity?: string;
  onSuccess?: (result: { paymentId: string; orderId: string; amount: number; status: string }) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

const CreditCardIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

export default function PaymentGateway({
  amount,
  itemDescription,
  customerEmail,
  customerPhone,
  customerFirstName,
  customerLastName,
  customerAddress = 'Colombo',
  customerCity = 'Colombo',
  onSuccess,
  onError,
  onCancel
}: PaymentGatewayProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePayment = async () => {
    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      // Generate unique order ID
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

      // Step 1: Initiate payment with backend to get hash and payment details
      const paymentRequest: PaymentInitiationRequest = {
        orderId,
        amount,
        currency: 'LKR',
        itemDescription,
        customerFirstName,
        customerLastName,
        customerEmail,
        customerPhone,
        customerAddress,
        customerCity
      };

      console.log('Initiating payment with backend...');
      const paymentData = await paymentService.initiatePayment(paymentRequest);
      console.log('Payment initiated, received hash from backend');

      // Step 2: Start PayHere payment with the received data
      await payHereService.startPayment(
        paymentData,
        (result) => {
          console.log('Payment successful:', result);
          setSuccess(true);
          setLoading(false);
          if (onSuccess) {
            onSuccess(result);
          }
        },
        (errorMsg) => {
          console.error('Payment error:', errorMsg);
          setError(errorMsg);
          setLoading(false);
          if (onError) {
            onError(errorMsg);
          }
        },
        () => {
          console.log('Payment cancelled');
          setError('Payment was cancelled');
          setLoading(false);
          if (onCancel) {
            onCancel();
          }
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment initiation failed';
      console.error('Payment initiation error:', err);
      setError(errorMessage);
      setLoading(false);
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  return (
    <div className="w-full">
      {/* Payment Summary Card */}
      <div className="automotive-card p-6 mb-6">
        <h3 className="text-lg font-bold theme-text-primary mb-4">Payment Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="theme-text-muted">Item</span>
            <span className="theme-text-primary font-semibold">{itemDescription}</span>
          </div>
          <div className="flex justify-between">
            <span className="theme-text-muted">Amount</span>
            <span className="theme-text-primary font-bold text-xl">LKR {amount.toFixed(2)}</span>
          </div>
          <div className="pt-3 border-t theme-border">
            <div className="flex justify-between">
              <span className="theme-text-muted">Customer</span>
              <span className="theme-text-primary">{customerFirstName} {customerLastName}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="theme-text-muted">Email</span>
              <span className="theme-text-primary text-sm">{customerEmail}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400 font-semibold">Payment completed successfully!</p>
        </div>
      )}

      {/* Pay Button */}
      <button
        type="button"
        onClick={handlePayment}
        disabled={loading || success}
        className="theme-button-primary w-full flex items-center justify-center"
      >
        <CreditCardIcon />
        {loading ? 'Processing...' : success ? 'Payment Completed' : 'Pay with PayHere'}
      </button>

      {/* Payment Info */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs theme-text-muted text-center">
          Secure payment powered by PayHere. Your payment information is encrypted and secure.
        </p>
      </div>
    </div>
  );
}
