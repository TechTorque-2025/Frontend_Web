'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { appointmentService } from '@/services/appointmentService'
import type { AppointmentResponseDto, AppointmentStatus } from '@/types/appointment'

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

  const [appointment, setAppointment] = useState<AppointmentResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusUpdating, setStatusUpdating] = useState(false)

  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<AppointmentStatus>('PENDING')

  useEffect(() => {
    const loadAppointment = async () => {
      try {
        setLoading(true)
        const data = await appointmentService.getAppointmentDetails(appointmentId)
        setAppointment(data)
        setError(null)

        const requested = new Date(data.requestedDateTime)
        setRescheduleDate(requested.toISOString().slice(0, 10))
        setRescheduleTime(requested.toISOString().slice(11, 16))
        setNotes(data.specialInstructions ?? '')
        setStatus(data.status)
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

  const handleReschedule = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!appointment) return

    try {
      setSaving(true)
      const requestedDateTime = new Date(`${rescheduleDate}T${rescheduleTime}`)
      const updated = await appointmentService.updateAppointment(appointment.id, {
        requestedDateTime: requestedDateTime.toISOString(),
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

        <section className="automotive-card p-6 border border-red-200 dark:border-red-800">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">Danger zone</h2>
          <p className="theme-text-muted mb-4">Cancel the appointment if the customer no longer needs this service.</p>
          <button
            type="button"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel appointment
          </button>
        </section>
      </div>

      {loading && (
        <div className="mt-6 automotive-card p-4 text-sm theme-text-muted">Refreshing appointment data...</div>
      )}
    </div>
  )
 }
