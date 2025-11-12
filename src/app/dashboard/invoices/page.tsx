'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { paymentService } from '@/services/paymentService'
import type { InvoiceResponseDto } from '@/types/payment'

const STATUS_FILTERS = ['ALL', 'DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'] as const

type InvoiceStatusFilter = typeof STATUS_FILTERS[number]

const statusClasses: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-200',
  SENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  PAID: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  CANCELLED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
}

const formatCurrency = (value?: number | null) => {
  const numValue = value ?? 0
  return `LKR ${numValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
}

const formatDateTime = (value?: string) => {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getStatusBadgeClass = (status: string) => statusClasses[status] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<InvoiceStatusFilter>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  const loadInvoices = async () => {
    try {
      setRefreshing(true)
      const data = await paymentService.listInvoices()
      // Ensure data is an array
      setInvoices(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err: unknown) {
      const errorResponse = err as { response?: { status?: number; data?: { message?: string } } }
      
      // Check for specific error types
      if (errorResponse?.response?.status === 500) {
        setError('Service temporarily unavailable. The invoice service may be down. Please contact support or try again later.')
      } else if (errorResponse?.response?.status === 403) {
        setError('Access Denied: You do not have permission to view invoices.')
      } else {
        const message = errorResponse?.response?.data?.message || 'Failed to load invoices'
        setError(message)
      }
      setInvoices([]) // Set empty array on error
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void loadInvoices()
  }, [])

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter
      const term = searchTerm.trim().toLowerCase()
      if (!term) return matchesStatus

      const haystack = [
        invoice.invoiceNumber,
        invoice.customerName,
        invoice.customerEmail,
      ]
        .filter(Boolean)
        .join(' ') // string concatenation
        .toLowerCase()

      return matchesStatus && haystack.includes(term)
    })
  }, [invoices, statusFilter, searchTerm])

  const summary = useMemo(() => {
    const outstandingInvoices = invoices.filter((invoice) => ['SENT', 'OVERDUE'].includes(invoice.status))
    const outstandingTotal = outstandingInvoices.reduce((total, invoice) => total + invoice.balanceAmount, 0)
    const paidTotal = invoices
      .filter((invoice) => invoice.status === 'PAID')
      .reduce((total, invoice) => total + invoice.totalAmount, 0)

    return {
      totalCount: invoices.length,
      outstandingCount: outstandingInvoices.length,
      outstandingTotal,
      paidTotal,
    }
  }, [invoices])

  if (loading) {
    return (
      <div className="automotive-card p-8 text-center">
        <p className="theme-text-muted">Loading invoices...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold theme-text-primary">Invoices</h1>
          <p className="theme-text-muted">Track billing history and outstanding balances.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/payments" className="theme-button-secondary">View payment history</Link>
          <button
            type="button"
            className="theme-button-secondary"
            onClick={() => void loadInvoices()}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="automotive-card p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Total invoices</p>
          <p className="text-2xl font-semibold theme-text-primary">{summary.totalCount}</p>
        </div>
        <div className="automotive-card p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Outstanding invoices</p>
          <p className="text-2xl font-semibold theme-text-primary">{summary.outstandingCount}</p>
        </div>
        <div className="automotive-card p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Outstanding balance</p>
          <p className="text-2xl font-semibold theme-text-primary">{formatCurrency(summary.outstandingTotal)}</p>
        </div>
        <div className="automotive-card p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Paid totals</p>
          <p className="text-2xl font-semibold theme-text-primary">{formatCurrency(summary.paidTotal)}</p>
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
                {status === 'ALL' ? 'All' : status}
              </button>
            ))}
          </div>
          <div className="w-full lg:w-64">
            <label className="block text-xs uppercase tracking-wide theme-text-muted mb-2" htmlFor="invoice-search">
              Search
            </label>
            <input
              id="invoice-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 theme-bg-primary theme-text-primary px-3 py-2"
              placeholder="Invoice number or customer"
            />
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="py-12 text-center theme-text-muted">
            {invoices.length === 0
              ? 'No invoices available yet.'
              : 'No invoices match your current filters.'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <Link
                key={invoice.invoiceId}
                href={`/dashboard/invoices/${invoice.invoiceId}`}
                className="block rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
              >
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-lg font-semibold theme-text-primary">Invoice #{invoice.invoiceNumber}</h2>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                      <p className="theme-text-muted text-sm">Issued {formatDateTime(invoice.issuedAt)}</p>
                      {invoice.dueDate && (
                        <p className="theme-text-muted text-sm">Due {formatDateTime(invoice.dueDate)}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm theme-text-muted">Balance</p>
                      <p className="text-xl font-semibold theme-text-primary">{formatCurrency(invoice.balanceAmount)}</p>
                      <p className="text-xs theme-text-muted">Total {formatCurrency(invoice.totalAmount)}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm theme-text-secondary">
                    <div>
                      <span className="block text-xs uppercase tracking-wide theme-text-muted">Customer</span>
                      <span className="block font-medium theme-text-primary">{invoice.customerName ?? 'Unknown customer'}</span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wide theme-text-muted">Email</span>
                      <span className="block break-all">{invoice.customerEmail ?? 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wide theme-text-muted">Last updated</span>
                      <span className="block">{formatDateTime(invoice.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
