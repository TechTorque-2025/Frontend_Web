/**
 * Appointment Service API
 * All endpoints for appointment management
 */

import apiClient from './axios-config';
import {
  AppointmentRequestDto,
  AppointmentUpdateDto,
  StatusUpdateDto,
  AppointmentDto,
  AvailabilitySlot,
  EmployeeScheduleDto,
  AppointmentApiResponse,
} from '@/types/appointment.types';

// ============================================
// Appointment Management Endpoints
// ============================================

export const appointmentService = {
  /**
   * GET /api/v1/appointments
   * List appointments for the current user (customer or employee)
   */
  listAppointments: async (): Promise<AppointmentDto[]> => {
    const response = await apiClient.get<AppointmentApiResponse<AppointmentDto[]>>('/api/v1/appointments');
    return response.data.data || [];
  },

  /**
   * GET /api/v1/appointments/{appointmentId}
   * Get details for a specific appointment
   */
  getAppointmentDetails: async (appointmentId: string): Promise<AppointmentDto> => {
    const response = await apiClient.get<AppointmentApiResponse<AppointmentDto>>(
      `/api/v1/appointments/${appointmentId}`
    );
    if (!response.data.data) {
      throw new Error('Appointment not found');
    }
    return response.data.data;
  },

  /**
   * POST /api/v1/appointments
   * Book a new appointment
   */
  bookAppointment: async (appointmentData: AppointmentRequestDto): Promise<AppointmentDto> => {
    const response = await apiClient.post<AppointmentApiResponse<AppointmentDto>>(
      '/api/v1/appointments',
      appointmentData
    );
    if (!response.data.data) {
      throw new Error('Failed to book appointment');
    }
    return response.data.data;
  },

  /**
   * PUT /api/v1/appointments/{appointmentId}
   * Update an appointment's date/time or instructions (customer only)
   */
  updateAppointment: async (
    appointmentId: string,
    updateData: AppointmentUpdateDto
  ): Promise<AppointmentDto> => {
    const response = await apiClient.put<AppointmentApiResponse<AppointmentDto>>(
      `/api/v1/appointments/${appointmentId}`,
      updateData
    );
    if (!response.data.data) {
      throw new Error('Failed to update appointment');
    }
    return response.data.data;
  },

  /**
   * DELETE /api/v1/appointments/{appointmentId}
   * Cancel an appointment (customer only)
   */
  cancelAppointment: async (appointmentId: string): Promise<void> => {
    await apiClient.delete<AppointmentApiResponse<void>>(`/api/v1/appointments/${appointmentId}`);
  },

  /**
   * PATCH /api/v1/appointments/{appointmentId}/status
   * Update an appointment's status (employee/admin only)
   */
  updateStatus: async (appointmentId: string, statusData: StatusUpdateDto): Promise<AppointmentDto> => {
    const response = await apiClient.patch<AppointmentApiResponse<AppointmentDto>>(
      `/api/v1/appointments/${appointmentId}/status`,
      statusData
    );
    if (!response.data.data) {
      throw new Error('Failed to update appointment status');
    }
    return response.data.data;
  },

  /**
   * GET /api/v1/appointments/availability
   * Check for available appointment slots (public endpoint)
   */
  checkAvailability: async (
    date: string,
    serviceType: string,
    duration: number
  ): Promise<AvailabilitySlot[]> => {
    const response = await apiClient.get<AppointmentApiResponse<AvailabilitySlot[]>>(
      '/api/v1/appointments/availability',
      {
        params: {
          date,
          serviceType,
          duration,
        },
      }
    );
    return response.data.data || [];
  },

  /**
   * GET /api/v1/appointments/schedule
   * Get the daily schedule for an employee
   */
  getEmployeeSchedule: async (date: string): Promise<EmployeeScheduleDto> => {
    const response = await apiClient.get<AppointmentApiResponse<EmployeeScheduleDto>>(
      '/api/v1/appointments/schedule',
      {
        params: {
          date,
        },
      }
    );
    if (!response.data.data) {
      throw new Error('Failed to fetch schedule');
    }
    return response.data.data;
  },
};
