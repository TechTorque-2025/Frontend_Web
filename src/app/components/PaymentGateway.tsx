'use client'

import { useState } from 'react'
import payHereService from '@/services/payhereService'
import { paymentService } from '@/services/paymentService'
import type { PaymentInitiationDto } from '@/types/payment'

interface PaymentGatewayProps {
  invoiceId: string
  amount: number
  itemDescription: string
  customerEmail: string
  customerPhone: string
  customerFirstName: string
  customerLastName: string
  customerAddress?: string
  customerCity?: string
  onSuccess?: (result: { paymentId: string; orderId: string; amount: number; status: string }) => void
  onError?: (error: string) => void
  onCancel?: () => void
}

const CreditCardIcon = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
)

export default function PaymentGateway({
  invoiceId,
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
  onCancel,
}: PaymentGatewayProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handlePayment = async () => {
    setError(null)
    setLoading(true)
    setSuccess(false)

    try {
      const paymentRequest: PaymentInitiationDto = {
        invoiceId,
        amount,
        currency: 'LKR',
        itemDescription,
        customerFirstName,
        customerLastName,
        customerEmail,
        customerPhone,
        customerAddress,
        customerCity,
      }

      const paymentData = await paymentService.initiatePayment(paymentRequest)

      await payHereService.startPayment(
        paymentData,
        (result) => {
          setSuccess(true)
          setLoading(false)
          onSuccess?.(result)
        },
        (errorMessage) => {
          setError(errorMessage)
          setLoading(false)
          onError?.(errorMessage)
        },
        () => {
          setError('Payment was cancelled')
          setLoading(false)
          onCancel?.()
        },
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment initiation failed'
      setError(message)
      setLoading(false)
      onError?.(message)
    }
  }

  return (
    <div className="w-full">
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

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400 font-semibold">Payment completed successfully!</p>
        </div>
      )}

      <button
        type="button"
        onClick={handlePayment}
        disabled={loading || success}
        className="theme-button-primary w-full flex items-center justify-center"
      >
        <CreditCardIcon />
        {loading ? 'Processing...' : success ? 'Payment Completed' : 'Pay with PayHere'}
      </button>

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs theme-text-muted text-center">
          Secure payment powered by PayHere. Your payment information is encrypted and secure.
        </p>
      </div>
    </div>
  )
}
