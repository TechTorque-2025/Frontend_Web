'use client'

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import PaymentGateway from '../components/PaymentGateway';
import ThemeToggle from '../components/ThemeToggle';

// Icon Components
const Icon = ({ d, size = 10 }: { d: string; size?: number }) => (
  <svg className={`w-${size} h-${size} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);
const BoltIcon = ({size = 10}) => <Icon d="M13 10V3L4 14h7v7l9-11h-7z" size={size} />;

const CheckCircleIcon = () => (
  <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = () => (
  <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

function PaymentGatewayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'cancel' | null>(
    status as 'pending' | 'success' | 'cancel' | null
  );

  // Demo payment data - in real app, this would come from props or state
  const [paymentData] = useState({
    invoiceId: 'demo-invoice',
    amount: 5000.00,
    itemDescription: 'Auto Service Package',
    customerEmail: 'customer@example.com',
    customerPhone: '+94771234567',
    customerFirstName: 'John',
    customerLastName: 'Doe',
    customerAddress: 'Colombo',
    customerCity: 'Colombo'
  });

  useEffect(() => {
    if (status) {
      setPaymentStatus(status as 'success' | 'cancel');
    }
  }, [status]);

  const handlePaymentSuccess = (result: { paymentId: string; orderId: string; amount: number; status: string }) => {
    console.log('Payment completed successfully:', result);
    setPaymentStatus('success');
    router.push('/payment-gateway?status=success');
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
    setPaymentStatus('cancel');
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled by user');
    setPaymentStatus('cancel');
  };

  return (
    <div className="min-h-screen theme-bg-primary font-sans">
      {/* Header */}
      <header className="sticky-header shadow-lg border-b theme-border">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                <BoltIcon size={6} />
              </div>
              <h1 className="text-2xl font-bold theme-text-primary hidden sm:block">
                TechTorque Auto
              </h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="theme-button-secondary">
                Dashboard
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 automotive-hero">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 dark:opacity-10"></div>
        <div className="w-full max-w-2xl relative z-10">
          <div className="automotive-card p-8 md:p-12">
            {/* Payment Status: Success */}
            {paymentStatus === 'success' && (
              <div className="text-center">
                <CheckCircleIcon />
                <h2 className="text-3xl font-black theme-text-primary mt-6 mb-4">
                  Payment Successful!
                </h2>
                <p className="text-lg theme-text-muted mb-8">
                  Your payment has been processed successfully. Thank you for your purchase.
                </p>
                <div className="space-x-4">
                  <Link href="/dashboard" className="theme-button-primary">
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => setPaymentStatus(null)}
                    className="theme-button-secondary"
                  >
                    Make Another Payment
                  </button>
                </div>
              </div>
            )}

            {/* Payment Status: Cancelled */}
            {paymentStatus === 'cancel' && (
              <div className="text-center">
                <XCircleIcon />
                <h2 className="text-3xl font-black theme-text-primary mt-6 mb-4">
                  Payment Cancelled
                </h2>
                <p className="text-lg theme-text-muted mb-8">
                  Your payment was cancelled. No charges were made to your account.
                </p>
                <div className="space-x-4">
                  <button
                    onClick={() => setPaymentStatus(null)}
                    className="theme-button-primary"
                  >
                    Try Again
                  </button>
                  <Link href="/dashboard" className="theme-button-secondary">
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            )}

            {/* Payment Gateway */}
            {!paymentStatus && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-black theme-text-primary">
                    Payment Gateway
                  </h2>
                  <p className="mt-4 text-lg theme-text-muted">
                    Complete your payment securely with PayHere
                  </p>
                </div>

                <PaymentGateway
                  invoiceId={paymentData.invoiceId}
                  amount={paymentData.amount}
                  itemDescription={paymentData.itemDescription}
                  customerEmail={paymentData.customerEmail}
                  customerPhone={paymentData.customerPhone}
                  customerFirstName={paymentData.customerFirstName}
                  customerLastName={paymentData.customerLastName}
                  customerAddress={paymentData.customerAddress}
                  customerCity={paymentData.customerCity}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onCancel={handlePaymentCancel}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PaymentGatewayPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentGatewayContent />
    </Suspense>
  );
}
