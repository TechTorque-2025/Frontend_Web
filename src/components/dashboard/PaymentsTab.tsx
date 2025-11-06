'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { paymentService, invoiceService } from '@/lib/api/payment.service';
import {
  PaymentDto,
  InvoiceDto,
  PaymentFormData,
  InvoiceFormData,
  PaymentMethod,
  INVOICE_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  PAYMENT_METHOD_CONFIG,
  InvoiceStatus,
} from '@/types/payment.types';
import {
  validatePaymentForm,
  validateInvoiceForm,
  formatCurrency,
  isInvoiceOverdue,
  getTodayDate,
  getDefaultDueDate,
} from '@/lib/utils/payment-validation';

export default function PaymentsTab() {
  const { user, hasAnyRole } = useAuth();
  const isEmployee = hasAnyRole(['EMPLOYEE', 'ADMIN', 'SUPER_ADMIN']);

  const [activeView, setActiveView] = useState<'invoices' | 'payments'>('invoices');
  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentDto | null>(null);

  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showInvoiceDetailsModal, setShowInvoiceDetailsModal] = useState(false);
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);

  // Form states
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    invoiceId: '',
    amount: '',
    method: '',
    paymentGatewayTransactionId: '',
  });
  const [invoiceForm, setInvoiceForm] = useState<InvoiceFormData>({
    customerId: '',
    serviceOrProjectId: '',
    amount: '',
    issueDate: getTodayDate(),
    dueDate: getDefaultDueDate(),
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data
  useEffect(() => {
    loadData();
  }, [activeView]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (activeView === 'invoices') {
        const invoicesData = await invoiceService.listInvoices();
        setInvoices(invoicesData);
      } else {
        const paymentsData = await paymentService.getPaymentHistory();
        setPayments(paymentsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Process payment
  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validatePaymentForm(paymentForm);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      setIsSubmitting(true);
      await paymentService.processPayment({
        invoiceId: paymentForm.invoiceId,
        amount: parseFloat(paymentForm.amount),
        method: paymentForm.method as PaymentMethod,
        paymentGatewayTransactionId: paymentForm.paymentGatewayTransactionId || undefined,
      });

      setShowPaymentModal(false);
      setPaymentForm({
        invoiceId: '',
        amount: '',
        method: '',
        paymentGatewayTransactionId: '',
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create invoice (employee only)
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateInvoiceForm(invoiceForm);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      setIsSubmitting(true);
      await invoiceService.createInvoice({
        customerId: invoiceForm.customerId,
        serviceOrProjectId: invoiceForm.serviceOrProjectId,
        amount: parseFloat(invoiceForm.amount),
        issueDate: invoiceForm.issueDate,
        dueDate: invoiceForm.dueDate,
      });

      setShowInvoiceModal(false);
      setInvoiceForm({
        customerId: '',
        serviceOrProjectId: '',
        amount: '',
        issueDate: getTodayDate(),
        dueDate: getDefaultDueDate(),
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mark invoice as paid (employee only)
  const handleMarkAsPaid = async (invoiceId: string) => {
    if (!confirm('Mark this invoice as paid?')) return;

    try {
      setIsSubmitting(true);
      await invoiceService.markAsPaid(invoiceId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark invoice as paid');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send invoice by email (employee only)
  const handleSendInvoice = async (invoiceId: string) => {
    const email = prompt('Enter customer email address:');
    if (!email) return;

    try {
      setIsSubmitting(true);
      await invoiceService.sendInvoiceByEmail(invoiceId, email);
      alert('Invoice sent successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open modals
  const openPaymentModal = (invoice: InvoiceDto) => {
    setPaymentForm({
      invoiceId: invoice.invoiceId,
      amount: invoice.amount.toString(),
      method: '',
      paymentGatewayTransactionId: '',
    });
    setShowPaymentModal(true);
  };

  const openInvoiceDetailsModal = (invoice: InvoiceDto) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetailsModal(true);
  };

  const openPaymentDetailsModal = (payment: PaymentDto) => {
    setSelectedPayment(payment);
    setShowPaymentDetailsModal(true);
  };

  // Get invoice status with overdue check
  const getInvoiceStatus = (invoice: InvoiceDto): InvoiceStatus => {
    if (invoice.status === InvoiceStatus.PENDING && isInvoiceOverdue(invoice.dueDate, invoice.paidDate)) {
      return InvoiceStatus.OVERDUE;
    }
    return invoice.status;
  };

  // Calculate totals
  const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaidAmount = invoices
    .filter(inv => inv.status === InvoiceStatus.PAID)
    .reduce((sum, inv) => sum + inv.amount, 0);
  const totalPendingAmount = invoices
    .filter(inv => inv.status === InvoiceStatus.PENDING)
    .reduce((sum, inv) => sum + inv.amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payments & Invoices</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {activeView === 'invoices' ? 'Manage invoices and payments' : 'View payment history'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEmployee && activeView === 'invoices' && (
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              + Create Invoice
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Invoiced</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(totalInvoiceAmount)}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Paid</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {formatCurrency(totalPaidAmount)}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
            {formatCurrency(totalPendingAmount)}
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveView('invoices')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeView === 'invoices'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
        >
          Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveView('payments')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeView === 'payments'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
        >
          Payments ({payments.length})
        </button>
      </div>

      {/* Invoices View */}
      {activeView === 'invoices' && (
        <>
          {invoices.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">No invoices found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {invoices.map((invoice) => {
                const status = getInvoiceStatus(invoice);
                return (
                  <div
                    key={invoice.invoiceId}
                    className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Invoice #{invoice.invoiceId.slice(-8)}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              INVOICE_STATUS_CONFIG[status].bgClass
                            } ${INVOICE_STATUS_CONFIG[status].textClass}`}
                          >
                            {INVOICE_STATUS_CONFIG[status].label}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                          {formatCurrency(invoice.amount)}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                          <span>Issued: {new Date(invoice.issueDate).toLocaleDateString()}</span>
                          <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                          {invoice.paidDate && (
                            <span>Paid: {new Date(invoice.paidDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => openInvoiceDetailsModal(invoice)}
                          className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        >
                          Details
                        </button>
                        {!isEmployee && invoice.status === InvoiceStatus.PENDING && (
                          <button
                            onClick={() => openPaymentModal(invoice)}
                            className="px-3 py-1 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                          >
                            Pay Now
                          </button>
                        )}
                        {isEmployee && invoice.status === InvoiceStatus.PENDING && (
                          <>
                            <button
                              onClick={() => handleMarkAsPaid(invoice.invoiceId)}
                              disabled={isSubmitting}
                              className="px-3 py-1 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors disabled:opacity-50"
                            >
                              Mark Paid
                            </button>
                            <button
                              onClick={() => handleSendInvoice(invoice.invoiceId)}
                              disabled={isSubmitting}
                              className="px-3 py-1 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors disabled:opacity-50"
                            >
                              Send Email
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Payments View */}
      {activeView === 'payments' && (
        <>
          {payments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">No payments found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {payments.map((payment) => (
                <div
                  key={payment.paymentId}
                  className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Payment #{payment.paymentId.slice(-8)}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            PAYMENT_STATUS_CONFIG[payment.status].bgClass
                          } ${PAYMENT_STATUS_CONFIG[payment.status].textClass}`}
                        >
                          {PAYMENT_STATUS_CONFIG[payment.status].label}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {PAYMENT_METHOD_CONFIG[payment.method].icon} {PAYMENT_METHOD_CONFIG[payment.method].label}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                        {formatCurrency(payment.amount)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        <span>Created: {new Date(payment.createdAt).toLocaleString()}</span>
                        {payment.completedAt && (
                          <span>Completed: {new Date(payment.completedAt).toLocaleString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => openPaymentDetailsModal(payment)}
                        className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Process Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Process Payment</h3>
            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
                {formErrors.amount && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value as PaymentMethod })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select method</option>
                  {Object.entries(PAYMENT_METHOD_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
                {formErrors.method && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.method}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Transaction ID (optional)
                </label>
                <input
                  type="text"
                  value={paymentForm.paymentGatewayTransactionId}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, paymentGatewayTransactionId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Gateway transaction ID"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentForm({
                      invoiceId: '',
                      amount: '',
                      method: '',
                      paymentGatewayTransactionId: '',
                    });
                    setFormErrors({});
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Process Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Invoice Modal (Employee Only) */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create Invoice</h3>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Customer ID *
                </label>
                <input
                  type="text"
                  value={invoiceForm.customerId}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, customerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {formErrors.customerId && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.customerId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Service/Project ID *
                </label>
                <input
                  type="text"
                  value={invoiceForm.serviceOrProjectId}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, serviceOrProjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {formErrors.serviceOrProjectId && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.serviceOrProjectId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount * ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
                {formErrors.amount && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.amount}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    value={invoiceForm.issueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, issueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {formErrors.issueDate && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.issueDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {formErrors.dueDate && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.dueDate}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowInvoiceModal(false);
                    setInvoiceForm({
                      customerId: '',
                      serviceOrProjectId: '',
                      amount: '',
                      issueDate: getTodayDate(),
                      dueDate: getDefaultDueDate(),
                    });
                    setFormErrors({});
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {showInvoiceDetailsModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Invoice Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Invoice ID</label>
                <p className="text-gray-900 dark:text-white">{selectedInvoice.invoiceId}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <p>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      INVOICE_STATUS_CONFIG[getInvoiceStatus(selectedInvoice)].bgClass
                    } ${INVOICE_STATUS_CONFIG[getInvoiceStatus(selectedInvoice)].textClass}`}
                  >
                    {INVOICE_STATUS_CONFIG[getInvoiceStatus(selectedInvoice)].label}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(selectedInvoice.amount)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Issue Date</label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedInvoice.issueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedInvoice.paidDate && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Paid Date</label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedInvoice.paidDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(selectedInvoice.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Updated</label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(selectedInvoice.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setShowInvoiceDetailsModal(false);
                  setSelectedInvoice(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {showPaymentDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Payment Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment ID</label>
                <p className="text-gray-900 dark:text-white">{selectedPayment.paymentId}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <p>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      PAYMENT_STATUS_CONFIG[selectedPayment.status].bgClass
                    } ${PAYMENT_STATUS_CONFIG[selectedPayment.status].textClass}`}
                  >
                    {PAYMENT_STATUS_CONFIG[selectedPayment.status].label}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(selectedPayment.amount)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
                <p className="text-gray-900 dark:text-white">
                  {PAYMENT_METHOD_CONFIG[selectedPayment.method].icon}{' '}
                  {PAYMENT_METHOD_CONFIG[selectedPayment.method].label}
                </p>
              </div>

              {selectedPayment.paymentGatewayTransactionId && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Transaction ID</label>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">
                    {selectedPayment.paymentGatewayTransactionId}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(selectedPayment.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedPayment.completedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed</label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(selectedPayment.completedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setShowPaymentDetailsModal(false);
                  setSelectedPayment(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
