'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { paymentService } from '@/services/paymentService'
import { userService } from '@/services/userService'
import PaymentGateway from '@/app/components/PaymentGateway'
import type { InvoiceResponseDto } from '@/types/payment'

const formatCurrency = (value: number) => `LKR ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`

const formatDate = (value?: string) => {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-200',
  SENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  PAID: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  CANCELLED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
}

export default function InvoiceDetailPage() {
  const params = useParams<{ invoiceId: string }>()
  const router = useRouter()
  const invoiceId = params.invoiceId

  const [invoice, setInvoice] = useState<InvoiceResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [email, setEmail] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [userProfile, setUserProfile] = useState<{
    firstName?: string,
    lastName?: string,
    email?: string,
    phone?: string,
    customerId?: string
  } | null>(null)

  const loadInvoice = async () => {
    try {
      setLoading(true)
      const data = await paymentService.getInvoice(invoiceId)
      setInvoice(data)
      setEmail(data.customerEmail ?? '')
      setError(null)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to load invoice'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadInvoice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId])

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await userService.getCurrentProfile()
        setUserProfile(profile.data)
      } catch (err) {
        console.error('Failed to load user profile:', err)
      }
    }
    void loadUserProfile()
  }, [])

  const totals = useMemo(() => {
    if (!invoice) {
      return null
    }
    return {
      subtotal: invoice.subtotal,
      tax: invoice.taxAmount,
      discount: invoice.discountAmount,
      total: invoice.totalAmount,
      paid: invoice.paidAmount,
      balance: invoice.balanceAmount,
    }
  }, [invoice])

  const handleSendInvoice = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!invoice) return

    try {
      setSending(true)
      await paymentService.sendInvoiceByEmail(invoice.invoiceId, {
        recipientEmail: email,
        message: emailMessage || undefined,
      })
      setSuccess('Invoice email sent successfully.')
      setError(null)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to send invoice email'
      setError(message)
      setSuccess(null)
    } finally {
      setSending(false)
    }
  }

  const handleProcessPayment = async () => {
    if (!invoice || invoice.balanceAmount <= 0) return

    if (!window.confirm(`Record payment of ${formatCurrency(invoice.balanceAmount)} for invoice ${invoice.invoiceNumber}?`)) {
      return
    }

    try {
      setProcessingPayment(true)
      await paymentService.processPayment({
        invoiceId: invoice.invoiceId,
        amount: invoice.balanceAmount,
        paymentMethod: 'ONLINE',
        notes: paymentNotes || undefined,
      })
      setSuccess('Payment recorded successfully.')
      setError(null)
      setPaymentNotes('')
      await loadInvoice()
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to record payment'
      setError(message)
      setSuccess(null)
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleDownload = async () => {
    if (!invoice) return

    try {
      setDownloading(true)
      const blob = await paymentService.downloadInvoice(invoice.invoiceId)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${invoice.invoiceNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setSuccess('Invoice download started.')
      setError(null)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to download invoice'
      setError(message)
      setSuccess(null)
    } finally {
      setDownloading(false)
    }
  }

  const handlePaymentSuccess = async () => {
    setSuccess('Payment completed successfully! Refreshing invoice...')
    setError(null)
    // Reload invoice to get updated payment status
    await loadInvoice()
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(`Payment failed: ${errorMessage}`)
    setSuccess(null)
  }

  const handlePaymentCancel = () => {
    setError('Payment was cancelled. You can try again anytime.')
    setSuccess(null)
  }

  if (loading) {
    return (
      <div className="automotive-card p-8 text-center">
        <p className="theme-text-muted">Loading invoice details...</p>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="automotive-card p-8 text-center">
        <p className="theme-text-muted">Invoice not found.</p>
        <button
          type="button"
          className="theme-button-secondary mt-4"
          onClick={() => router.push('/dashboard/invoices')}
        >
          Back to invoices
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <button
            type="button"
            className="theme-button-secondary text-sm mb-4"
            onClick={() => router.push('/dashboard/invoices')}
          >
            ← Back to invoices
          </button>
          <h1 className="text-3xl font-bold theme-text-primary">Invoice #{invoice.invoiceNumber}</h1>
          <p className="theme-text-muted">Issued {formatDate(invoice.issuedAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[invoice.status] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'}`}>
            {invoice.status}
          </span>
          <button
            type="button"
            className="theme-button-secondary"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? 'Downloading…' : 'Download PDF'}
          </button>
        </div>
      </div>

      {(error || success) && (
        <div className="space-y-3">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="automotive-card p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide theme-text-muted">Customer</p>
              <p className="text-lg font-semibold theme-text-primary">{invoice.customerName ?? 'Unknown customer'}</p>
              <p className="theme-text-muted text-sm">{invoice.customerEmail ?? 'No email on record'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide theme-text-muted">Due date</p>
              <p className="text-lg font-semibold theme-text-primary">{formatDate(invoice.dueDate)}</p>
              <p className="theme-text-muted text-sm">Created {formatDate(invoice.createdAt)}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="theme-text-muted text-xs uppercase">
                <tr>
                  <th className="text-left pb-2">Description</th>
                  <th className="text-right pb-2">Qty</th>
                  <th className="text-right pb-2">Unit price</th>
                  <th className="text-right pb-2">Total</th>
                </tr>
              </thead>
              <tbody className="theme-text-primary divide-y divide-gray-200 dark:divide-gray-800">
                {invoice.items.map((item, index) => (
                  <tr key={`${item.description}-${index}`}>
                    <td className="py-3 pr-4">
                      <p className="font-medium">{item.description}</p>
                    </td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 text-right font-semibold">{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {totals && (
          <aside className="automotive-card p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide theme-text-muted">Amount due</p>
              <p className="text-3xl font-bold theme-text-primary">{formatCurrency(totals.balance)}</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="theme-text-muted">Subtotal</span>
                <span className="theme-text-primary">{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="theme-text-muted">Tax</span>
                <span className="theme-text-primary">{formatCurrency(totals.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="theme-text-muted">Discount</span>
                <span className="theme-text-primary">{formatCurrency(totals.discount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="theme-text-muted">Total</span>
                <span className="theme-text-primary font-semibold">{formatCurrency(totals.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="theme-text-muted">Paid</span>
                <span className="theme-text-primary">{formatCurrency(totals.paid)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wide theme-text-muted" htmlFor="payment-notes">
                Payment notes
              </label>
              <textarea
                id="payment-notes"
                value={paymentNotes}
                onChange={(event) => setPaymentNotes(event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 theme-bg-primary theme-text-primary px-3 py-2"
                placeholder="Internal reference or receipt number"
              />
              <button
                type="button"
                className="theme-button-primary w-full"
                onClick={handleProcessPayment}
                disabled={processingPayment || invoice.balanceAmount <= 0}
              >
                {invoice.balanceAmount <= 0 ? 'Invoice settled' : processingPayment ? 'Recording...' : `Record payment (${formatCurrency(invoice.balanceAmount)})`}
              </button>
            </div>
          </aside>
        )}
      </div>

      {invoice.balanceAmount > 0 && invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && userProfile && (
        <section className="automotive-card p-6">
          <h2 className="text-xl font-semibold theme-text-primary mb-4">Pay Online with PayHere</h2>
          <p className="theme-text-muted mb-6 text-sm">
            Complete your payment securely using PayHere payment gateway. You can pay using Credit/Debit cards or digital wallets.
          </p>
          <PaymentGateway
            invoiceId={invoice.invoiceId}
            amount={invoice.balanceAmount}
            itemDescription={`Invoice #${invoice.invoiceNumber} - ${invoice.items[0]?.description || 'Service Payment'}`}
            customerEmail={userProfile.email || invoice.customerEmail || email}
            customerPhone={userProfile.phone || '+94000000000'}
            customerFirstName={userProfile.firstName || 'Customer'}
            customerLastName={userProfile.lastName || ''}
            customerAddress="Colombo"
            customerCity="Colombo"
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={handlePaymentCancel}
          />
        </section>
      )}

      <section className="automotive-card p-6">
        <h2 className="text-xl font-semibold theme-text-primary mb-4">Send invoice</h2>
        <form onSubmit={handleSendInvoice} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="block text-xs uppercase tracking-wide theme-text-muted mb-2">Recipient email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 theme-bg-primary theme-text-primary px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wide theme-text-muted mb-2">Message (optional)</span>
              <input
                type="text"
                value={emailMessage}
                onChange={(event) => setEmailMessage(event.target.value)}
                placeholder="Include a note to the customer"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 theme-bg-primary theme-text-primary px-3 py-2"
              />
            </label>
          </div>
          <button
            type="submit"
            className="theme-button-secondary"
            disabled={sending}
          >
            {sending ? 'Sending…' : 'Email invoice to customer'}
          </button>
        </form>
      </section>
    </div>
  )
}
