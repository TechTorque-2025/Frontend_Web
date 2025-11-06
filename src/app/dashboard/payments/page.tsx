'use client'

import { useEffect, useMemo, useState } from 'react'
import { paymentService } from '@/services/paymentService'
import type { PaymentResponseDto } from '@/types/payment'

const STATUS_FILTERS = ['ALL', 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'] as const
const METHOD_FILTERS = ['ALL', 'CASH', 'CARD', 'BANK_TRANSFER', 'ONLINE'] as const

type StatusFilter = typeof STATUS_FILTERS[number]
type MethodFilter = typeof METHOD_FILTERS[number]

const statusBadge: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  REFUNDED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
}

const formatCurrency = (value: number) => `LKR ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`

const formatDate = (value: string) => new Date(value).toLocaleString(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<PaymentResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('ALL')
  const [refreshing, setRefreshing] = useState(false)

  const loadPayments = async () => {
    try {
      setRefreshing(true)
      const data = await paymentService.getPaymentHistory()
      setPayments(data)
      setError(null)
    } catch (err: unknown) {
      const errorResponse = err as { response?: { status?: number; data?: { message?: string } } }
      
      // Check if it's a 403 Forbidden (Access Denied)
      if (errorResponse?.response?.status === 403) {
        setError('Access Denied: This page is only available for customer accounts.')
      } else {
        const message = errorResponse?.response?.data?.message || 'Failed to load payments'
        setError(message)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void loadPayments()
  }, [])

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesStatus = statusFilter === 'ALL' || payment.paymentStatus === statusFilter
      const matchesMethod = methodFilter === 'ALL' || payment.paymentMethod === methodFilter
      return matchesStatus && matchesMethod
    })
  }, [payments, statusFilter, methodFilter])

  const summary = useMemo(() => {
    const totalCollected = payments
      .filter((payment) => payment.paymentStatus === 'COMPLETED')
      .reduce((total, payment) => total + payment.amount, 0)
    const pending = payments.filter((payment) => payment.paymentStatus === 'PENDING').length
    const failed = payments.filter((payment) => payment.paymentStatus === 'FAILED').length

    return {
      total: payments.length,
      totalCollected,
      pending,
      failed,
    }
  }, [payments])

  if (loading) {
    return (
      <div className="automotive-card p-8 text-center">
        <p className="theme-text-muted">Loading payment history...</p>
      </div>
    )
  }

  // Show access denied message prominently
  if (error?.includes('Access Denied')) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold theme-text-primary">Payment History</h1>
          <p className="theme-text-muted">Review completed transactions and pending payments.</p>
        </div>
        <div className="automotive-card p-12 text-center">
          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold theme-text-primary mb-2">Access Denied</h3>
          <p className="theme-text-muted max-w-md mx-auto mb-4">
            This page is only available for customer accounts. As an employee, you can view invoices and time logs instead.
          </p>
          <div className="flex gap-3 justify-center">
            <a href="/dashboard/invoices" className="theme-button-primary">
              View Invoices
            </a>
            <a href="/dashboard/time-logs" className="theme-button-secondary">
              View Time Logs
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold theme-text-primary">Payment History</h1>
          <p className="theme-text-muted">Review completed transactions and pending payments.</p>
        </div>
        <button
          type="button"
          className="theme-button-secondary"
          onClick={() => void loadPayments()}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="automotive-card p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Payments recorded</p>
          <p className="text-2xl font-semibold theme-text-primary">{summary.total}</p>
        </div>
        <div className="automotive-card p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Collected revenue</p>
          <p className="text-2xl font-semibold theme-text-primary">{formatCurrency(summary.totalCollected)}</p>
        </div>
        <div className="automotive-card p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Pending payments</p>
          <p className="text-2xl font-semibold theme-text-primary">{summary.pending}</p>
        </div>
        <div className="automotive-card p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Failed payments</p>
          <p className="text-2xl font-semibold theme-text-primary">{summary.failed}</p>
        </div>
      </div>

      <div className="automotive-card p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'theme-bg-secondary theme-text-secondary hover:bg-blue-50 dark:hover:bg-blue-900/30'
                }`}
              >
                {status === 'ALL' ? 'All statuses' : status}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {METHOD_FILTERS.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setMethodFilter(method)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  methodFilter === method
                    ? 'bg-blue-600 text-white'
                    : 'theme-bg-secondary theme-text-secondary hover:bg-blue-50 dark:hover:bg-blue-900/30'
                }`}
              >
                {method === 'ALL' ? 'All methods' : method.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="py-12 text-center theme-text-muted">
            {payments.length === 0 ? 'No payments recorded yet.' : 'No payments match your filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-xs uppercase tracking-wide theme-text-muted">
                <tr>
                  <th className="text-left pb-2">Reference</th>
                  <th className="text-left pb-2">Invoice</th>
                  <th className="text-right pb-2">Amount</th>
                  <th className="text-left pb-2">Method</th>
                  <th className="text-left pb-2">Status</th>
                  <th className="text-left pb-2">Processed</th>
                  <th className="text-left pb-2">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 theme-text-primary">
                {filteredPayments.map((payment) => (
                  <tr key={payment.paymentId} className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10">
                    <td className="py-3 pr-4 font-medium">{payment.paymentId}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {payment.invoiceId}
                        </span>
                        <span className="text-xs theme-text-muted">Customer: {payment.customerId}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold">{formatCurrency(payment.amount)}</td>
                    <td className="py-3 pr-4 uppercase">{payment.paymentMethod.replace('_', ' ')}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusBadge[payment.paymentStatus] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'}`}>
                        {payment.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{formatDate(payment.processedAt ?? payment.createdAt)}</td>
                    <td className="py-3 pr-4 text-xs theme-text-secondary max-w-xs">{payment.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
