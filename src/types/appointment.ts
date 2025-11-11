// Appointment & Service Type TypeScript Interfaces

export interface AppointmentRequestDto {
  vehicleId: string;
  serviceType: string;
  requestedDateTime: string; // ISO 8601 format
  specialInstructions?: string;
}

export interface AppointmentUpdateDto {
  requestedDateTime?: string;
  specialInstructions?: string;
}

export interface AppointmentResponseDto {
  id: string;
  customerId: string;
  vehicleId: string;
  assignedEmployeeIds?: string[];
  assignedBayId?: string;
  confirmationNumber: string;
  serviceType: string;
  requestedDateTime: string;
  status: AppointmentStatus;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  vehicleArrivedAt?: string;
  vehicleAcceptedByEmployeeId?: string;
}

export type AppointmentStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CUSTOMER_CONFIRMED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface StatusUpdateDto {
  newStatus: AppointmentStatus;
}

// Availability & Scheduling Types
export interface TimeSlotDto {
  startTime: string;
  endTime: string;
  available: boolean;
  bayId?: string;
  bayName?: string;
}

export interface AvailabilityResponseDto {
  date: string;
  serviceType: string;
  durationMinutes: number;
  availableSlots: TimeSlotDto[];
}

export interface ScheduleItemDto {
  appointmentId: string;
  customerId: string;
  vehicleId: string;
  serviceType: string;
  startTime: string;
  status: AppointmentStatus;
  specialInstructions?: string;
}

export interface ScheduleResponseDto {
  employeeId: string;
  date: string;
  appointments: ScheduleItemDto[];
}

// Calendar Types
export interface AppointmentSummaryDto {
  id: string;
  confirmationNumber: string;
  time: string;
  serviceType: string;
  status: AppointmentStatus;
  bayName?: string;
}

export interface CalendarDayDto {
  date: string;
  appointmentCount: number;
  holidayName?: string;
  appointments: AppointmentSummaryDto[];
  holiday: boolean;
}

export interface CalendarStatisticsDto {
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  appointmentsByServiceType: Record<string, number>;
  appointmentsByBay: Record<string, number>;
}

export interface CalendarResponseDto {
  month: string;
  days: CalendarDayDto[];
  statistics: CalendarStatisticsDto;
}

// Service Type Types
export interface ServiceTypeRequestDto {
  name: string;
  category: string;
  basePriceLKR: number;
  estimatedDurationMinutes: number;
  description?: string;
  active?: boolean;
}

export interface ServiceTypeResponseDto {
  id: string;
  name: string;
  category: string;
  basePriceLKR: number;
  estimatedDurationMinutes: number;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Multi-Employee Assignment Type
export interface AssignEmployeesRequestDto {
  employeeIds: string[];
}

// Time Tracking Types
export interface TimeSessionResponse {
  id: string;
  appointmentId: string;
  employeeId: string;
  clockInTime: string;
  clockOutTime?: string;
  active: boolean;
  elapsedSeconds: number;
  hoursWorked?: number;
}
