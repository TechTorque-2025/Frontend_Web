/**
 * Time Logging Types
 * Generated from OpenAPI spec - Time Logging Service API (Port 8085)
 * Handles employee work time tracking for services and projects
 * NO 'any' types used - full TypeScript strictness
 */

// ============================================
// Request DTOs
// ============================================

export interface TimeLogRequestDto {
  serviceId: string;          // min 1 char, required
  hours: number;              // 0-24, required
  date: string;               // ISO 8601 date, required
  description?: string;       // 0-500 chars, optional
  workType?: string;          // 0-100 chars, optional
}

export interface TimeLogUpdateDto {
  hours?: number;             // 0-24, optional
  description?: string;       // 0-500 chars, optional
  workType?: string;          // 0-100 chars, optional
}

// ============================================
// Response DTOs
// ============================================

export interface TimeLogDto {
  logId: string;
  employeeId: string;
  serviceId: string;
  hours: number;              // 0-24
  date: string;               // ISO 8601 date
  description: string | null;
  workType: string | null;
  createdAt: string;          // ISO 8601 date-time
  updatedAt: string;          // ISO 8601 date-time
}

export interface TimeLogSummaryDto {
  period: 'DAILY' | 'WEEKLY';
  date: string;               // ISO 8601 date
  totalHours: number;
  logCount: number;
  breakdownByWorkType: Record<string, number>;
  logs: TimeLogDto[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// ============================================
// Form State Types
// ============================================

export interface TimeLogFormData {
  serviceId: string;
  hours: string;              // string for input, converted to number
  date: string;               // YYYY-MM-DD format
  description: string;
  workType: string;
}

export interface TimeLogFormErrors {
  [key: string]: string;
}

export interface TimeLogFilters {
  fromDate: string;           // YYYY-MM-DD format
  toDate: string;             // YYYY-MM-DD format
}

// ============================================
// UI State Types
// ============================================

export interface TimeLogListState {
  logs: TimeLogDto[];
  isLoading: boolean;
  error: string | null;
}

export interface TimeLogSummaryState {
  summary: TimeLogSummaryDto | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// Validation Constants
// ============================================

export const TIMELOG_VALIDATION = {
  SERVICE_ID: {
    MIN_LENGTH: 1,
  },
  HOURS: {
    MIN: 0,
    MAX: 24,
  },
  DESCRIPTION: {
    MAX_LENGTH: 500,
  },
  WORK_TYPE: {
    MAX_LENGTH: 100,
  },
} as const;

// ============================================
// Common Work Types (for dropdown)
// ============================================

export const COMMON_WORK_TYPES = [
  'Diagnostic',
  'Repair',
  'Maintenance',
  'Installation',
  'Testing',
  'Documentation',
  'Consultation',
  'Custom Modification',
  'Other',
] as const;

// ============================================
// Period Types
// ============================================

export type SummaryPeriod = 'DAILY' | 'WEEKLY';
