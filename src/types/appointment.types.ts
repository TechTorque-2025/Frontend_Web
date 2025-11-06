/**
 * Appointment Service Types
 * Generated from OpenAPI spec - Appointment Service API
 * NO 'any' types used - full TypeScript strictness
 */

// ============================================
// Enums
// ============================================

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

// ============================================
// Request DTOs
// ============================================

export interface AppointmentRequestDto {
  vehicleId: string;              // min 1 char, required
  serviceType: string;            // 3-100 chars, required
  requestedDateTime: string;      // ISO 8601 date-time, required
  specialInstructions?: string;   // 0-500 chars, optional
}

export interface AppointmentUpdateDto {
  requestedDateTime?: string;     // ISO 8601 date-time, optional
  specialInstructions?: string;   // 0-500 chars, optional
}

export interface StatusUpdateDto {
  newStatus: AppointmentStatus;   // required
  assignedEmployeeId?: string;    // optional
}

// ============================================
// Response DTOs
// ============================================

export interface AppointmentDto {
  appointmentId: string;
  customerId: string;
  vehicleId: string;
  serviceType: string;
  requestedDateTime: string;      // ISO 8601 date-time
  actualStartTime: string | null; // ISO 8601 date-time
  actualEndTime: string | null;   // ISO 8601 date-time
  status: AppointmentStatus;
  specialInstructions: string | null;
  assignedEmployeeId: string | null;
  createdAt: string;              // ISO 8601 date-time
  updatedAt: string;              // ISO 8601 date-time
  estimatedDuration?: number;     // minutes
}

export interface AvailabilitySlot {
  startTime: string;              // ISO 8601 date-time
  endTime: string;                // ISO 8601 date-time
  available: boolean;
}

export interface EmployeeScheduleDto {
  employeeId: string;
  date: string;                   // ISO 8601 date
  appointments: AppointmentDto[];
}

export interface AppointmentApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// ============================================
// Form State Types
// ============================================

export interface AppointmentFormData {
  vehicleId: string;
  serviceType: string;
  requestedDate: string;          // YYYY-MM-DD format for input
  requestedTime: string;          // HH:MM format for input
  specialInstructions: string;
}

export interface AppointmentFormErrors {
  [key: string]: string;
}

// ============================================
// UI State Types
// ============================================

export interface AppointmentListState {
  appointments: AppointmentDto[];
  isLoading: boolean;
  error: string | null;
}

export interface AvailabilityState {
  slots: AvailabilitySlot[];
  isLoading: boolean;
  error: string | null;
}

// ============================================
// Filter Types
// ============================================

export interface AppointmentFilters {
  status?: AppointmentStatus;
  startDate?: string;
  endDate?: string;
  vehicleId?: string;
}

// ============================================
// Status Display Helper
// ============================================

export const APPOINTMENT_STATUS_CONFIG = {
  [AppointmentStatus.PENDING]: {
    label: 'Pending',
    color: 'yellow',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900',
    textClass: 'text-yellow-800 dark:text-yellow-200',
  },
  [AppointmentStatus.CONFIRMED]: {
    label: 'Confirmed',
    color: 'blue',
    bgClass: 'bg-blue-100 dark:bg-blue-900',
    textClass: 'text-blue-800 dark:text-blue-200',
  },
  [AppointmentStatus.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'purple',
    bgClass: 'bg-purple-100 dark:bg-purple-900',
    textClass: 'text-purple-800 dark:text-purple-200',
  },
  [AppointmentStatus.COMPLETED]: {
    label: 'Completed',
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900',
    textClass: 'text-green-800 dark:text-green-200',
  },
  [AppointmentStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'red',
    bgClass: 'bg-red-100 dark:bg-red-900',
    textClass: 'text-red-800 dark:text-red-200',
  },
  [AppointmentStatus.NO_SHOW]: {
    label: 'No Show',
    color: 'gray',
    bgClass: 'bg-gray-100 dark:bg-gray-800',
    textClass: 'text-gray-800 dark:text-gray-200',
  },
} as const;

// ============================================
// Validation Constants
// ============================================

export const APPOINTMENT_VALIDATION = {
  VEHICLE_ID: {
    MIN_LENGTH: 1,
  },
  SERVICE_TYPE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
  SPECIAL_INSTRUCTIONS: {
    MAX_LENGTH: 500,
  },
} as const;
