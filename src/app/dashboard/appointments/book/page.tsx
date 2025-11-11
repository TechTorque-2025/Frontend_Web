'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { appointmentService } from '@/services/appointmentService'
import { vehicleService } from '@/services/vehicleService'
import type {
  AvailabilityResponseDto,
  ServiceTypeResponseDto,
} from '@/types/appointment'
import type { VehicleListItem } from '@/types/vehicle'

interface BookingFormState {
  serviceTypeId: string
  vehicleId: string
  date: string
  time: string
  notes: string
}

export default function BookAppointmentPage() {
  const router = useRouter()
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeResponseDto[]>([])
  const [vehicles, setVehicles] = useState<VehicleListItem[]>([])
  const [availability, setAvailability] = useState<AvailabilityResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [form, setForm] = useState<BookingFormState>({
    serviceTypeId: '',
    vehicleId: '',
    date: '',
    time: '',
    notes: '',
  })

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        const [services, vehicleData] = await Promise.all([
          appointmentService.getAllServiceTypes(false), // Get only active service types
          vehicleService.getMyVehicles(),
        ])

        setServiceTypes(services)
        setVehicles(vehicleData)
        setError(null)
      } catch (err: unknown) {
        const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to load booking data'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  const selectedServiceType = useMemo(() => (
    serviceTypes.find((service) => service.id === form.serviceTypeId) ?? null
  ), [form.serviceTypeId, serviceTypes])

  // Filter out past time slots for today
  const filteredAvailableSlots = useMemo(() => {
    if (!availability) return []

    const today = new Date().toISOString().slice(0, 10)
    const isToday = form.date === today

    if (!isToday) {
      return availability.availableSlots
    }

    const now = new Date()
    return availability.availableSlots.filter((slot) => {
      const slotStartTime = new Date(slot.startTime)
      return slotStartTime > now
    })
  }, [availability, form.date])

  const handleChange = (field: keyof BookingFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field === 'serviceTypeId') {
      setAvailability(null)
      setForm((prev) => ({ ...prev, time: '' }))
    }
    if (field === 'date') {
      setAvailability(null)
      setForm((prev) => ({ ...prev, time: '' }))
    }
  }

  // Auto-check availability when date or service changes
  useEffect(() => {
    const autoCheckAvailability = async () => {
      if (!form.serviceTypeId || !form.date) {
        setAvailability(null)
        return
      }

      const duration = selectedServiceType?.estimatedDurationMinutes ?? 60

      try {
        setCheckingAvailability(true)
        const result = await appointmentService.checkAvailability({
          date: form.date,
          serviceType: selectedServiceType?.name || '',
          duration,
        })
        setAvailability(result)
        setError(null)
      } catch (err: unknown) {
        const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to check availability'
        setError(message)
        setAvailability(null)
      } finally {
        setCheckingAvailability(false)
      }
    }

    const timer = setTimeout(autoCheckAvailability, 300) // Debounce by 300ms
    return () => clearTimeout(timer)
  }, [form.serviceTypeId, form.date, selectedServiceType])

  const handleSlotSelect = (time: string) => {
    setForm((prev) => ({ ...prev, time }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.vehicleId || !form.serviceTypeId || !form.date || !form.time) {
      setError('Please complete all required fields and select an available time slot.')
      return
    }

    // Format as local datetime without timezone conversion (backend expects LocalDateTime)
    const requestedDateTime = `${form.date}T${form.time}:00`

    try {
      setSubmitting(true)
      await appointmentService.bookAppointment({
        vehicleId: form.vehicleId,
        serviceType: selectedServiceType?.name || '',
        requestedDateTime: requestedDateTime,
        specialInstructions: form.notes || undefined,
      })
      setSuccessMessage('Appointment booked successfully. Redirecting...')
      setError(null)
      setTimeout(() => {
        router.push('/dashboard/appointments')
      }, 1500)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to book appointment'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="automotive-card p-8 text-center">
        <p className="theme-text-muted">Loading booking form...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold theme-text-primary mb-2">Book Appointment</h1>
        <p className="theme-text-muted">
          Choose your vehicle, select a service and date to see available time slots.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 automotive-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="block">
            <span className="block text-sm font-medium theme-text-primary mb-2">Vehicle</span>
            <select
              value={form.vehicleId}
              onChange={(event) => handleChange('vehicleId', event.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 theme-bg-primary theme-text-primary px-3 py-2"
              required
            >
              <option value="">Select vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                  {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-sm font-medium theme-text-primary mb-2">Service</span>
            <select
              value={form.serviceTypeId}
              onChange={(event) => handleChange('serviceTypeId', event.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 theme-bg-primary theme-text-primary px-3 py-2"
              required
            >
              <option value="">Select service</option>
              {serviceTypes.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} • {service.estimatedDurationMinutes} mins
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="block text-sm font-medium theme-text-primary mb-2">Date</span>
          <input
            type="date"
            value={form.date}
            onChange={(event) => handleChange('date', event.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 theme-bg-primary theme-text-primary px-3 py-2"
            min={new Date().toISOString().slice(0, 10)}
            required
          />
        </label>

        {selectedServiceType && (
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm theme-text-secondary">
            <p className="font-medium theme-text-primary">Service details</p>
            <p>Duration: {selectedServiceType.estimatedDurationMinutes} minutes</p>
            {selectedServiceType.description && <p>{selectedServiceType.description}</p>}
          </div>
        )}

        {checkingAvailability && (
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="theme-text-secondary text-sm">
              <span className="inline-block animate-spin mr-2">⏳</span>
              Checking availability for {form.date}...
            </p>
          </div>
        )}

        {availability && !checkingAvailability && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold theme-text-primary">Available time slots</h3>
              <span className="text-sm theme-text-muted">{filteredAvailableSlots.length} slots available</span>
            </div>
            {filteredAvailableSlots.length === 0 ? (
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="theme-text-secondary text-sm">
                  {form.date === new Date().toISOString().slice(0, 10)
                    ? '⏰ All available slots for today have passed. Please select a future date.'
                    : 'No slots available for the selected date. Try another date.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredAvailableSlots.map((slot) => (
                  <button
                    key={`${slot.startTime}-${slot.endTime}`}
                    type="button"
                    onClick={() => handleSlotSelect(slot.startTime.slice(11, 16))}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      form.time === slot.startTime.slice(11, 16)
                        ? 'border-blue-600 theme-text-primary bg-blue-100 dark:bg-blue-900/40'
                        : 'border-gray-200 dark:border-gray-700 theme-text-primary hover:border-blue-400'
                    }`}
                  >
                    {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {' - '}
                    {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {form.date && form.serviceTypeId && !availability && !checkingAvailability && (
          <p className="text-sm theme-text-muted italic">
            No availability data loaded. Please check your date and service selections.
          </p>
        )}

        <label className="block">
          <span className="block text-sm font-medium theme-text-primary mb-2">Special instructions</span>
          <textarea
            value={form.notes}
            onChange={(event) => handleChange('notes', event.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 theme-bg-primary theme-text-primary px-3 py-2"
            rows={4}
            placeholder="Share anything the technicians should know before the appointment"
          />
        </label>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            className="theme-button-secondary"
            onClick={() => router.push('/dashboard/appointments')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="theme-button-primary"
            disabled={submitting || !form.time || checkingAvailability}
          >
            {submitting ? 'Booking...' : 'Confirm Appointment'}
          </button>
        </div>
      </form>
    </div>
  )
}
