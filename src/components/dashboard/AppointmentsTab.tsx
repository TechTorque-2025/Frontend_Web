'use client';

/**
 * Appointments Tab Component
 * Inline appointment management for dashboard - NO separate page
 * Available for: CUSTOMER, EMPLOYEE, ADMIN, SUPER_ADMIN
 */

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth.types';
import { appointmentService } from '@/lib/api/appointment.service';
import { vehicleService } from '@/lib/api/vehicle.service';
import {
  AppointmentDto,
  AppointmentFormData,
  AppointmentFormErrors,
  AppointmentRequestDto,
  AppointmentUpdateDto,
  AppointmentStatus,
  APPOINTMENT_STATUS_CONFIG,
  StatusUpdateDto,
} from '@/types/appointment.types';
import { VehicleDto } from '@/types/vehicle.types';
import {
  validateAppointmentForm,
  validateAppointmentUpdateForm,
  formatAppointmentDate,
  formatAppointmentTime,
  combineDateTime,
} from '@/lib/utils/appointment-validation';

type ModalMode = 'book' | 'edit' | 'view' | 'status' | null;

export default function AppointmentsTab() {
  const { hasRole } = useAuth();
  const isCustomer = hasRole(UserRole.CUSTOMER);
  const isEmployee = hasRole(UserRole.EMPLOYEE) || hasRole(UserRole.ADMIN) || hasRole(UserRole.SUPER_ADMIN);

  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDto | null>(null);

  // Form state
  const [formData, setFormData] = useState<AppointmentFormData>({
    vehicleId: '',
    serviceType: '',
    requestedDate: '',
    requestedTime: '',
    specialInstructions: '',
  });
  const [formErrors, setFormErrors] = useState<AppointmentFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // Status update state
  const [newStatus, setNewStatus] = useState<AppointmentStatus>(AppointmentStatus.PENDING);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [appointmentsData, vehiclesData] = await Promise.all([
        appointmentService.listAppointments(),
        isCustomer ? vehicleService.listCustomerVehicles() : Promise.resolve([]),
      ]);
      setAppointments(appointmentsData);
      setVehicles(vehiclesData);
    } catch (err) {
      setError('Failed to load appointments');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const openBookModal = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    setFormData({
      vehicleId: vehicles.length > 0 ? vehicles[0].vehicleId : '',
      serviceType: '',
      requestedDate: tomorrowStr,
      requestedTime: '09:00',
      specialInstructions: '',
    });
    setFormErrors({});
    setApiError('');
    setModalMode('book');
  };

  const openEditModal = (appointment: AppointmentDto) => {
    setSelectedAppointment(appointment);
    const dateTime = new Date(appointment.requestedDateTime);
    setFormData({
      vehicleId: appointment.vehicleId,
      serviceType: appointment.serviceType,
      requestedDate: dateTime.toISOString().split('T')[0],
      requestedTime: dateTime.toTimeString().slice(0, 5),
      specialInstructions: appointment.specialInstructions || '',
    });
    setFormErrors({});
    setApiError('');
    setModalMode('edit');
  };

  const openViewModal = (appointment: AppointmentDto) => {
    setSelectedAppointment(appointment);
    setModalMode('view');
  };

  const openStatusModal = (appointment: AppointmentDto) => {
    setSelectedAppointment(appointment);
    setNewStatus(appointment.status);
    setModalMode('status');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedAppointment(null);
    setFormData({ vehicleId: '', serviceType: '', requestedDate: '', requestedTime: '', specialInstructions: '' });
    setFormErrors({});
    setApiError('');
  };

  const handleBookAppointment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError('');

    const errors = validateAppointmentForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData: AppointmentRequestDto = {
        vehicleId: formData.vehicleId,
        serviceType: formData.serviceType,
        requestedDateTime: combineDateTime(formData.requestedDate, formData.requestedTime),
        specialInstructions: formData.specialInstructions || undefined,
      };

      await appointmentService.bookAppointment(requestData);
      await fetchData();
      closeModal();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to book appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAppointment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setApiError('');

    const errors = validateAppointmentUpdateForm({
      requestedDate: formData.requestedDate,
      requestedTime: formData.requestedTime,
      specialInstructions: formData.specialInstructions,
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: AppointmentUpdateDto = {
        requestedDateTime: combineDateTime(formData.requestedDate, formData.requestedTime),
        specialInstructions: formData.specialInstructions || undefined,
      };

      await appointmentService.updateAppointment(selectedAppointment.appointmentId, updateData);
      await fetchData();
      closeModal();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to update appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await appointmentService.cancelAppointment(appointmentId);
      await fetchData();
    } catch (err) {
      alert('Failed to cancel appointment');
      console.error(err);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedAppointment) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      const statusData: StatusUpdateDto = {
        newStatus,
      };

      await appointmentService.updateStatus(selectedAppointment.appointmentId, statusData);
      await fetchData();
      closeModal();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    // Show all for employees, only own for customers
    return true;
  });

  return (
    <div>
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold theme-text-primary">
          {isCustomer ? 'My Appointments' : 'All Appointments'} ({filteredAppointments.length})
        </h2>
        {isCustomer && vehicles.length > 0 && (
          <button onClick={openBookModal} className="theme-button-primary">
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Book Appointment
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-semibold theme-text-primary mb-2">No appointments yet</h3>
          <p className="theme-text-muted mb-6">
            {isCustomer ? 'Book your first service appointment' : 'No appointments scheduled'}
          </p>
          {isCustomer && vehicles.length > 0 && (
            <button onClick={openBookModal} className="theme-button-primary">Book Your First Appointment</button>
          )}
          {isCustomer && vehicles.length === 0 && (
            <p className="theme-text-muted">Please add a vehicle first to book appointments</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const statusConfig = APPOINTMENT_STATUS_CONFIG[appointment.status];
            return (
              <div key={appointment.appointmentId} className="border theme-border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold theme-text-primary">{appointment.serviceType}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgClass} ${statusConfig.textClass}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 theme-text-secondary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatAppointmentDate(appointment.requestedDateTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 theme-text-secondary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatAppointmentTime(appointment.requestedDateTime)}</span>
                      </div>
                      {appointment.specialInstructions && (
                        <p className="theme-text-muted italic mt-2">&quot;{appointment.specialInstructions}&quot;</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button onClick={() => openViewModal(appointment)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" title="View">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    {isCustomer && appointment.status === AppointmentStatus.PENDING && (
                      <>
                        <button onClick={() => openEditModal(appointment)} className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleCancelAppointment(appointment.appointmentId)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Cancel">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    )}
                    {isEmployee && (
                      <button onClick={() => openStatusModal(appointment)} className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded" title="Update Status">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book/Edit Modal */}
      {(modalMode === 'book' || modalMode === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="automotive-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 theme-bg-primary border-b theme-border p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold theme-text-primary">{modalMode === 'book' ? 'Book Appointment' : 'Edit Appointment'}</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={modalMode === 'book' ? handleBookAppointment : handleUpdateAppointment} className="p-6 space-y-4">
              {apiError && <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded">{apiError}</div>}

              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">Vehicle <span className="text-red-500">*</span></label>
                <select name="vehicleId" value={formData.vehicleId} onChange={handleInputChange} disabled={modalMode === 'edit'} className={`w-full px-3 py-2 border rounded-md theme-bg-primary theme-text-primary ${formErrors.vehicleId ? 'border-red-500' : 'theme-border'} ${modalMode === 'edit' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <option value="">Select a vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.vehicleId} value={v.vehicleId}>{v.year} {v.make} {v.model} ({v.licensePlate})</option>
                  ))}
                </select>
                {formErrors.vehicleId && <p className="mt-1 text-sm text-red-600">{formErrors.vehicleId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">Service Type <span className="text-red-500">*</span></label>
                <input type="text" name="serviceType" value={formData.serviceType} onChange={handleInputChange} disabled={modalMode === 'edit'} className={`w-full px-3 py-2 border rounded-md theme-bg-primary theme-text-primary ${formErrors.serviceType ? 'border-red-500' : 'theme-border'} ${modalMode === 'edit' ? 'opacity-50 cursor-not-allowed' : ''}`} placeholder="Oil Change, Tire Rotation, etc." />
                {formErrors.serviceType && <p className="mt-1 text-sm text-red-600">{formErrors.serviceType}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">Date <span className="text-red-500">*</span></label>
                  <input type="date" name="requestedDate" value={formData.requestedDate} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-md theme-bg-primary theme-text-primary ${formErrors.requestedDate ? 'border-red-500' : 'theme-border'}`} />
                  {formErrors.requestedDate && <p className="mt-1 text-sm text-red-600">{formErrors.requestedDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">Time <span className="text-red-500">*</span></label>
                  <input type="time" name="requestedTime" value={formData.requestedTime} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-md theme-bg-primary theme-text-primary ${formErrors.requestedTime ? 'border-red-500' : 'theme-border'}`} />
                  {formErrors.requestedTime && <p className="mt-1 text-sm text-red-600">{formErrors.requestedTime}</p>}
                </div>
              </div>

              {formErrors.requestedDateTime && <p className="text-sm text-red-600">{formErrors.requestedDateTime}</p>}

              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">Special Instructions</label>
                <textarea name="specialInstructions" value={formData.specialInstructions} onChange={handleInputChange} rows={3} className={`w-full px-3 py-2 border rounded-md theme-bg-primary theme-text-primary ${formErrors.specialInstructions ? 'border-red-500' : 'theme-border'}`} placeholder="Any special requests or information..." />
                {formErrors.specialInstructions && <p className="mt-1 text-sm text-red-600">{formErrors.specialInstructions}</p>}
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" disabled={isSubmitting} className="flex-1 theme-button-primary disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? 'Saving...' : modalMode === 'book' ? 'Book Appointment' : 'Save Changes'}</button>
                <button type="button" onClick={closeModal} className="flex-1 theme-button-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modalMode === 'view' && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="automotive-card max-w-2xl w-full">
            <div className="p-6 border-b theme-border flex justify-between items-center">
              <h3 className="text-2xl font-bold theme-text-primary">Appointment Details</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <h4 className="text-3xl font-bold theme-text-primary">{selectedAppointment.serviceType}</h4>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${APPOINTMENT_STATUS_CONFIG[selectedAppointment.status].bgClass} ${APPOINTMENT_STATUS_CONFIG[selectedAppointment.status].textClass}`}>
                  {APPOINTMENT_STATUS_CONFIG[selectedAppointment.status].label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div><p className="text-sm theme-text-muted">Date</p><p className="theme-text-primary">{formatAppointmentDate(selectedAppointment.requestedDateTime)}</p></div>
                <div><p className="text-sm theme-text-muted">Time</p><p className="theme-text-primary">{formatAppointmentTime(selectedAppointment.requestedDateTime)}</p></div>
                <div><p className="text-sm theme-text-muted">Appointment ID</p><p className="theme-text-primary font-mono text-sm">{selectedAppointment.appointmentId}</p></div>
                <div><p className="text-sm theme-text-muted">Vehicle ID</p><p className="theme-text-primary font-mono text-sm">{selectedAppointment.vehicleId}</p></div>
                {selectedAppointment.specialInstructions && (
                  <div className="col-span-2"><p className="text-sm theme-text-muted">Special Instructions</p><p className="theme-text-primary">{selectedAppointment.specialInstructions}</p></div>
                )}
                <div><p className="text-sm theme-text-muted">Created</p><p className="theme-text-primary">{new Date(selectedAppointment.createdAt).toLocaleDateString()}</p></div>
                <div><p className="text-sm theme-text-muted">Last Updated</p><p className="theme-text-primary">{new Date(selectedAppointment.updatedAt).toLocaleDateString()}</p></div>
              </div>

              <div className="pt-4"><button onClick={closeModal} className="w-full theme-button-primary">Close</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal (Employee Only) */}
      {modalMode === 'status' && selectedAppointment && isEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="automotive-card max-w-md w-full">
            <div className="p-6 border-b theme-border flex justify-between items-center">
              <h3 className="text-xl font-bold theme-text-primary">Update Status</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {apiError && <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded text-sm">{apiError}</div>}

              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">New Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as AppointmentStatus)} className="w-full px-3 py-2 border rounded-md theme-bg-primary theme-text-primary theme-border">
                  {Object.values(AppointmentStatus).map(status => (
                    <option key={status} value={status}>{APPOINTMENT_STATUS_CONFIG[status].label}</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button onClick={handleUpdateStatus} disabled={isSubmitting} className="flex-1 theme-button-primary disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? 'Updating...' : 'Update Status'}</button>
                <button onClick={closeModal} className="flex-1 theme-button-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
