"use client";
import api from '../lib/apiClient';
import type {
  AppointmentRequestDto,
  AppointmentResponseDto,
  AppointmentUpdateDto,
  StatusUpdateDto,
  AvailabilityResponseDto,
  CalendarResponseDto,
  ScheduleResponseDto,
  ServiceTypeResponseDto,
  ServiceTypeRequestDto,
  AssignEmployeesRequestDto,
  TimeSessionResponse
} from '../types/appointment';

export const appointmentService = {
  // Appointment Management
  async bookAppointment(data: AppointmentRequestDto): Promise<AppointmentResponseDto> {
    const res = await api.post('/appointments', data);
    return res.data;
  },

  async listAppointments(params?: {
    vehicleId?: string;
    status?: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
    fromDate?: string;
    toDate?: string;
  }): Promise<AppointmentResponseDto[]> {
    const res = await api.get('/appointments', { params });
    return res.data;
  },

  async getAppointmentDetails(appointmentId: string): Promise<AppointmentResponseDto> {
    const res = await api.get(`/appointments/${appointmentId}`);
    return res.data;
  },

  async updateAppointment(
    appointmentId: string, 
    data: AppointmentUpdateDto
  ): Promise<AppointmentResponseDto> {
    const res = await api.put(`/appointments/${appointmentId}`, data);
    return res.data;
  },

  async cancelAppointment(appointmentId: string): Promise<void> {
    await api.delete(`/appointments/${appointmentId}`);
  },

  async updateStatus(
    appointmentId: string,
    data: StatusUpdateDto
  ): Promise<AppointmentResponseDto> {
    const res = await api.patch(`/appointments/${appointmentId}/status`, data);
    return res.data;
  },

  async assignEmployees(
    appointmentId: string,
    data: AssignEmployeesRequestDto
  ): Promise<AppointmentResponseDto> {
    const res = await api.post(`/appointments/${appointmentId}/assign-employees`, data);
    return res.data;
  },

  async acceptVehicleArrival(appointmentId: string): Promise<AppointmentResponseDto> {
    const res = await api.post(`/appointments/${appointmentId}/accept-vehicle`);
    return res.data;
  },

  async completeWork(appointmentId: string): Promise<AppointmentResponseDto> {
    const res = await api.post(`/appointments/${appointmentId}/complete`);
    return res.data;
  },

  async confirmCompletion(appointmentId: string): Promise<AppointmentResponseDto> {
    const res = await api.post(`/appointments/${appointmentId}/confirm-completion`);
    return res.data;
  },

  async clockIn(appointmentId: string): Promise<TimeSessionResponse> {
    const res = await api.post(`/appointments/${appointmentId}/clock-in`);
    return res.data;
  },

  async clockOut(appointmentId: string): Promise<TimeSessionResponse> {
    const res = await api.post(`/appointments/${appointmentId}/clock-out`);
    return res.data;
  },

  async getActiveTimeSession(appointmentId: string): Promise<TimeSessionResponse | null> {
    try {
      const res = await api.get(`/appointments/${appointmentId}/time-session`);
      return res.data;
    } catch (error: unknown) {
      if ((error as { response?: { status?: number } })?.response?.status === 204) {
        return null; // No active session
      }
      throw error;
    }
  },

  // Availability & Scheduling
  async checkAvailability(params: {
    date: string; // YYYY-MM-DD
    serviceType: string;
    duration: number;
  }): Promise<AvailabilityResponseDto> {
    const res = await api.get('/appointments/availability', { params });
    return res.data;
  },

  async getEmployeeSchedule(date: string): Promise<ScheduleResponseDto> {
    const res = await api.get('/appointments/schedule', { 
      params: { date } 
    });
    return res.data;
  },

  async getMonthlyCalendar(year: number, month: number): Promise<CalendarResponseDto> {
    const res = await api.get('/appointments/calendar', { 
      params: { year, month } 
    });
    return res.data;
  },

  // Service Type Management
  async getAllServiceTypes(includeInactive = false): Promise<ServiceTypeResponseDto[]> {
    const res = await api.get('/service-types', { 
      params: { includeInactive } 
    });
    return res.data;
  },

  async getServiceTypeById(id: string): Promise<ServiceTypeResponseDto> {
    const res = await api.get(`/service-types/${id}`);
    return res.data;
  },

  async getServiceTypesByCategory(category: string): Promise<ServiceTypeResponseDto[]> {
    const res = await api.get(`/service-types/category/${category}`);
    return res.data;
  },

  async createServiceType(data: ServiceTypeRequestDto): Promise<ServiceTypeResponseDto> {
    const res = await api.post('/service-types', data);
    return res.data;
  },

  async updateServiceType(
    id: string, 
    data: ServiceTypeRequestDto
  ): Promise<ServiceTypeResponseDto> {
    const res = await api.put(`/service-types/${id}`, data);
    return res.data;
  },

  async deleteServiceType(id: string): Promise<void> {
    await api.delete(`/service-types/${id}`);
  },
};

export default appointmentService;
