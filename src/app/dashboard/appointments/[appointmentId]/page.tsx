'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { appointmentService } from '@/services/appointmentService'
import { adminService } from '@/services/adminService'
import { paymentService } from '@/services/paymentService'
import type { AppointmentResponseDto, AppointmentStatus } from '@/types/appointment'
import type { UserResponse } from '@/types/admin'
import type { CreateInvoiceDto, InvoiceItemDto } from '@/types/payment'
import { useDashboard } from '@/app/contexts/DashboardContext'
import TimeTracker from '@/components/TimeTracker'

interface StatusOption {
  value: AppointmentStatus
  label: string
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No Show' },
]

export default function AppointmentDetailPage() {
  const router = useRouter()
  const params = useParams<{ appointmentId: string }>()
  const appointmentId = params.appointmentId
  const { roles, profile } = useDashboard()

  const [appointment, setAppointment] = useState<AppointmentResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusUpdating, setStatusUpdating] = useState(false)

  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<AppointmentStatus>('PENDING')

  // Employee assignment state
  const [employees, setEmployees] = useState<UserResponse[]>([])
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([])
  const [assigning, setAssigning] = useState(false)

  // Invoice generation state
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemDto[]>([
    { description: '', quantity: 1, unitPrice: 0, totalPrice: 0, itemType: 'SERVICE_FEE' }
  ])
  const [invoiceNotes, setInvoiceNotes] = useState('')
  const [generatingInvoice, setGeneratingInvoice] = useState(false)

  useEffect(() => {
    const loadAppointment = async () => {
      try {
        setLoading(true)
        const data = await appointmentService.getAppointmentDetails(appointmentId)
        setAppointment(data)
        setStatus(data.status) // Initialize status dropdown with current appointment status
        setError(null)

        const requested = new Date(data.requestedDateTime)
        setRescheduleDate(requested.toISOString().slice(0, 10))
        setRescheduleTime(requested.toISOString().slice(11, 16))
        setNotes(data.specialInstructions ?? '')
        setStatus(data.status)
        setSelectedEmployeeIds(data.assignedEmployeeIds || [])
      } catch (err: unknown) {
        const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to load appointment details'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadAppointment()
  }, [appointmentId])

  // Load employees for admin
  useEffect(() => {
    const loadEmployees = async () => {
      if (!roles?.includes('ADMIN') && !roles?.includes('SUPER_ADMIN')) return

      try {
        const data = await adminService.getAllUsers({ role: 'EMPLOYEE' })
        setEmployees(data)
      } catch (err: unknown) {
        console.error('Failed to load employees:', err)
      }
    }

    loadEmployees()
  }, [roles])

  const handleReschedule = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!appointment) return

    try {
      setSaving(true)
      // Format as local datetime without timezone conversion (backend expects LocalDateTime)
      const requestedDateTime = `${rescheduleDate}T${rescheduleTime}:00`
      const updated = await appointmentService.updateAppointment(appointment.id, {
        requestedDateTime: requestedDateTime,
        specialInstructions: notes || undefined,
      })
      setAppointment(updated)
      setNotes(updated.specialInstructions ?? '')
      setError(null)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update appointment'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async () => {
    if (!appointment) return
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    try {
      setSaving(true)
      await appointmentService.cancelAppointment(appointment.id)
      router.push('/dashboard/appointments')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to cancel appointment'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!appointment) return

    try {
      setStatusUpdating(true)
      const updated = await appointmentService.updateStatus(appointment.id, { newStatus: status })
      setAppointment(updated)
      setStatus(updated.status)
      setError(null)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update appointment status'
      setError(message)
    } finally {
      setStatusUpdating(false)
    }
  }

  const handleAssignEmployees = async () => {
    if (!appointment) return
    if (selectedEmployeeIds.length === 0) {
      setError('Please select at least one employee')
      return
    }

    try {
      setAssigning(true)
      const updated = await appointmentService.assignEmployees(appointment.id, {
        employeeIds: selectedEmployeeIds,
      })
      setAppointment(updated)
      setSelectedEmployeeIds(updated.assignedEmployeeIds || [])
      setError(null)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to assign employees'
      setError(message)
    } finally {
      setAssigning(false)
    }
  }

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  // Invoice generation handlers
  const handleOpenInvoiceForm = () => {
    if (!appointment) return

    // Pre-fill with service type as first line item
    setInvoiceItems([
      {
        description: `${appointment.serviceType} Service`,
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        itemType: 'SERVICE_FEE'
      }
    ])
    setShowInvoiceForm(true)
  }

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { description: '', quantity: 1, unitPrice: 0, totalPrice: 0, itemType: 'PARTS' }])
  }

  const removeInvoiceItem = (index: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index))
    }
  }

  const updateInvoiceItem = (index: number, field: keyof InvoiceItemDto, value: string | number) => {
    const updated = [...invoiceItems]
    updated[index] = { ...updated[index], [field]: value }

    // Auto-calculate totalPrice when quantity or unitPrice changes
    if (field === 'quantity' || field === 'unitPrice') {
      const qty = field === 'quantity' ? Number(value) : updated[index].quantity
      const price = field === 'unitPrice' ? Number(value) : updated[index].unitPrice
      updated[index].totalPrice = qty * price
    }

    setInvoiceItems(updated)
  }

  const calculateInvoiceTotal = () => {
    return invoiceItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
  }

  const handleGenerateInvoice = async () => {
    if (!appointment) return

    // Validation
    const hasEmptyItems = invoiceItems.some(item => !item.description.trim() || item.unitPrice <= 0)
    if (hasEmptyItems) {
      setError('Please fill in all invoice items with valid descriptions and prices')
      return
    }

    if (!window.confirm(`Generate invoice for ${appointment.confirmationNumber}? Total: LKR ${calculateInvoiceTotal().toFixed(2)}`)) {
      return
    }

    try {
      setGeneratingInvoice(true)

      const invoiceData: CreateInvoiceDto = {
        customerId: appointment.customerId,
        serviceOrProjectId: appointment.id,
        items: invoiceItems,
        notes: invoiceNotes || `Invoice for ${appointment.serviceType} service - ${appointment.confirmationNumber}`,
      }

      const createdInvoice = await paymentService.createInvoice(invoiceData)

      alert('Invoice generated successfully!')
      setShowInvoiceForm(false)
      setError(null)

      // Optionally navigate to the invoice
      router.push(`/dashboard/invoices/${createdInvoice.invoiceId}`)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to generate invoice'
      setError(message)
    } finally {
      setGeneratingInvoice(false)
    }
  }

  if (loading) {
    return (
      <div className="automotive-card p-8 text-center">
        <p className="theme-text-muted">Loading appointment details...</p>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="automotive-card p-8 text-center">
        <p className="theme-text-muted">Appointment not found.</p>
        <button
          className="theme-button-secondary mt-4"
          onClick={() => router.push('/dashboard/appointments')}
        >
          Back to appointments
        </button>
      </div>
    )
  }

  const statusLabel = STATUS_OPTIONS.find((option) => option.value === appointment.status)?.label ?? appointment.status

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <button
          className="theme-button-secondary text-sm mb-4"
          onClick={() => router.push('/dashboard/appointments')}
        >
          ← Back to appointments
        </button>
        <h1 className="text-3xl font-bold theme-text-primary mb-2">Appointment Details</h1>
        <p className="theme-text-muted">Confirmation #{appointment.confirmationNumber}</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <section className="automotive-card p-6">
          <h2 className="text-xl font-semibold theme-text-primary mb-4">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="theme-text-muted">Service</p>
              <p className="theme-text-primary font-medium">{appointment.serviceType}</p>
            </div>
            <div>
              <p className="theme-text-muted">Status</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {statusLabel}
              </span>
            </div>
            <div>
              <p className="theme-text-muted">Scheduled for</p>
              <p className="theme-text-primary font-medium">
                {new Date(appointment.requestedDateTime).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="theme-text-muted">Vehicle</p>
              <p className="theme-text-primary font-medium">{appointment.vehicleId}</p>
            </div>
            <div>
              <p className="theme-text-muted">Assigned Employees</p>
              {appointment.assignedEmployeeIds && appointment.assignedEmployeeIds.length > 0 ? (
                <div className="theme-text-primary font-medium">
                  {employees.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {appointment.assignedEmployeeIds.map((empId) => {
                        const emp = employees.find((e) => e.username === empId)
                        return (
                          <li key={empId}>
                            {emp ? (emp.fullName || emp.email) : `@${empId}`}
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p>{appointment.assignedEmployeeIds.length} employee(s)</p>
                  )}
                </div>
              ) : (
                <p className="theme-text-primary font-medium">Not assigned</p>
              )}
            </div>
            <div>
              <p className="theme-text-muted">Created</p>
              <p className="theme-text-primary">{new Date(appointment.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="theme-text-muted">Last updated</p>
              <p className="theme-text-primary">{new Date(appointment.updatedAt).toLocaleString()}</p>
            </div>
            {appointment.specialInstructions && (
              <div className="md:col-span-2">
                <p className="theme-text-muted">Special instructions</p>
                <p className="theme-text-primary">{appointment.specialInstructions}</p>
              </div>
            )}
          </div>
        </section>

        {roles?.includes('CUSTOMER') && (
          <section className="automotive-card p-6">
            <h2 className="text-xl font-semibold theme-text-primary mb-4">Reschedule appointment</h2>
            <form onSubmit={handleReschedule} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="block">
                  <span className="block text-sm font-medium theme-text-primary mb-1">Date</span>
                  <input
                    type="date"
                    value={rescheduleDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(event) => setRescheduleDate(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 theme-bg-primary theme-text-primary px-3 py-2"
                    required
                  />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium theme-text-primary mb-1">Time</span>
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(event) => setRescheduleTime(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 theme-bg-primary theme-text-primary px-3 py-2"
                    required
                  />
                </label>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="theme-button-primary w-full"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </div>
              <label className="block">
                <span className="block text-sm font-medium theme-text-primary mb-1">Notes</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 theme-bg-primary theme-text-primary px-3 py-2"
                  rows={4}
                  placeholder="Add any extra information for the team"
                />
              </label>
            </form>
          </section>
        )}

        {(roles?.includes('ADMIN') || roles?.includes('SUPER_ADMIN')) && (
          <section className="automotive-card p-6">
            <h2 className="text-xl font-semibold theme-text-primary mb-4">Assign Employees</h2>
            <p className="theme-text-muted text-sm mb-4">
              Select one or more employees to assign to this appointment. Employees will receive notifications.
            </p>
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              {employees.length === 0 ? (
                <p className="theme-text-muted text-sm">No employees available</p>
              ) : (
                employees.map((employee) => (
                  <label
                    key={employee.userId}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmployeeIds.includes(employee.username)}
                      onChange={() => toggleEmployeeSelection(employee.username)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="theme-text-primary font-medium">{employee.fullName || employee.email}</p>
                      <p className="theme-text-muted text-xs">@{employee.username}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="theme-text-muted text-sm">
                {selectedEmployeeIds.length} employee(s) selected
              </p>
              <button
                type="button"
                className="theme-button-primary"
                onClick={handleAssignEmployees}
                disabled={assigning || selectedEmployeeIds.length === 0}
              >
                {assigning ? 'Assigning...' : 'Assign Employees'}
              </button>
            </div>
          </section>
        )}

        {/* Employee Actions - Time Tracking */}
        {roles?.includes('EMPLOYEE') && appointment && profile?.username && appointment.assignedEmployeeIds?.includes(profile.username) && (
          <section className="automotive-card p-6 border-2 border-blue-200 dark:border-blue-800">
            <h2 className="text-xl font-semibold theme-text-primary mb-4">⏱️ Time Tracking</h2>

            {appointment.vehicleArrivedAt && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm theme-text-muted">
                  📍 Vehicle arrived: {new Date(appointment.vehicleArrivedAt).toLocaleString()}
                </p>
              </div>
            )}

            {appointment.status === 'CONFIRMED' ? (
              <div>
                <p className="theme-text-muted mb-4 text-sm">
                  Ready to start work? Click &quot;Clock In&quot; to begin time tracking automatically.
                </p>
                <TimeTracker
                  appointmentId={appointmentId}
                  onClockIn={async () => {
                    // Reload appointment to get updated status
                    const updated = await appointmentService.getAppointmentDetails(appointmentId)
                    setAppointment(updated)
                    setStatus(updated.status)
                  }}
                  onClockOut={async () => {
                    // Reload appointment to get updated status
                    const updated = await appointmentService.getAppointmentDetails(appointmentId)
                    setAppointment(updated)
                    setStatus(updated.status)
                  }}
                />
              </div>
            ) : appointment.status === 'IN_PROGRESS' ? (
              <div>
                <p className="theme-text-muted mb-4 text-sm">
                  🔧 Work in progress. Your time is being tracked automatically.
                </p>
                <TimeTracker
                  appointmentId={appointmentId}
                  onClockIn={async () => {
                    const updated = await appointmentService.getAppointmentDetails(appointmentId)
                    setAppointment(updated)
                    setStatus(updated.status)
                  }}
                  onClockOut={async () => {
                    const updated = await appointmentService.getAppointmentDetails(appointmentId)
                    setAppointment(updated)
                    setStatus(updated.status)
                  }}
                />
              </div>
            ) : appointment.status === 'COMPLETED' ? (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-700 dark:text-green-300 font-medium">
                  ✓ Work completed successfully
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  Time has been logged automatically
                </p>
              </div>
            ) : (
              <p className="theme-text-muted text-sm">
                No time tracking available for current status: {appointment.status}
              </p>
            )}
          </section>
        )}

        {/* Invoice Generation - Admin Only */}
        {(roles?.includes('ADMIN') || roles?.includes('SUPER_ADMIN')) && appointment && (
          <section className="automotive-card p-6 border-2 border-green-200 dark:border-green-800">
            <h2 className="text-xl font-semibold theme-text-primary mb-4">Invoice / Quotation</h2>

            {!showInvoiceForm ? (
              <div>
                <p className="theme-text-muted mb-4">
                  Generate an invoice or quotation for this appointment
                </p>
                <button
                  type="button"
                  onClick={handleOpenInvoiceForm}
                  className="automotive-button"
                  disabled={appointment.status === 'CANCELLED'}
                >
                  📄 Generate Invoice
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold theme-text-primary">Create Invoice</h3>
                  <button
                    type="button"
                    onClick={() => setShowInvoiceForm(false)}
                    className="text-red-600 dark:text-red-400 hover:underline"
                  >
                    Cancel
                  </button>
                </div>

                {/* Invoice Items */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium theme-text-primary">Line Items</label>
                    <button
                      type="button"
                      onClick={addInvoiceItem}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      + Add Item
                    </button>
                  </div>

                  {invoiceItems.map((item, index) => (
                    <div key={index} className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium theme-text-primary">Item {index + 1}</span>
                        {invoiceItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInvoiceItem(index)}
                            className="text-red-600 dark:text-red-400 text-sm hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium theme-text-primary mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                            placeholder="e.g., Labor - Oil Change, Oil Filter, Engine Oil 5W-30"
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 theme-bg-primary theme-text-primary px-3 py-2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium theme-text-primary mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateInvoiceItem(index, 'quantity', Number(e.target.value))}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 theme-bg-primary theme-text-primary px-3 py-2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium theme-text-primary mb-1">
                            Unit Price (LKR)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateInvoiceItem(index, 'unitPrice', Number(e.target.value))}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 theme-bg-primary theme-text-primary px-3 py-2"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <div className="text-right">
                            <span className="text-sm font-medium theme-text-muted">Total: </span>
                            <span className="text-lg font-bold theme-text-primary">
                              LKR {item.totalPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={invoiceNotes}
                    onChange={(e) => setInvoiceNotes(e.target.value)}
                    placeholder="Additional notes for the invoice..."
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 theme-bg-primary theme-text-primary px-3 py-2"
                  />
                </div>

                {/* Total Summary */}
                <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold theme-text-primary">Grand Total:</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      LKR {calculateInvoiceTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleGenerateInvoice}
                    disabled={generatingInvoice}
                    className="automotive-button flex-1"
                  >
                    {generatingInvoice ? 'Generating...' : '✓ Generate Invoice'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInvoiceForm(false)}
                    className="automotive-button-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {(roles?.includes('ADMIN') || roles?.includes('SUPER_ADMIN') || roles?.includes('EMPLOYEE')) && (
          <section className="automotive-card p-6">
            <h2 className="text-xl font-semibold theme-text-primary mb-4">Update status</h2>
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <label className="block w-full md:w-auto md:flex-1">
                <span className="block text-sm font-medium theme-text-primary mb-1">Status</span>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as AppointmentStatus)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 theme-bg-primary theme-text-primary px-3 py-2"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="theme-button-secondary md:w-auto"
                onClick={handleStatusUpdate}
                disabled={statusUpdating}
              >
                {statusUpdating ? 'Updating...' : 'Update status'}
              </button>
            </div>
          </section>
        )}

        {roles?.includes('CUSTOMER') && (
          <section className="automotive-card p-6 border border-red-200 dark:border-red-800">
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">Danger zone</h2>
            <p className="theme-text-muted mb-4">Cancel the appointment if you no longer need this service.</p>
            <button
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel appointment
            </button>
          </section>
        )}
      </div>

      {loading && (
        <div className="mt-6 automotive-card p-4 text-sm theme-text-muted">Refreshing appointment data...</div>
      )}
    </div>
  )
 }
