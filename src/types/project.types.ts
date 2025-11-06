/**
 * Project & Service Types
 * Generated from OpenAPI spec - Project Service API (Port 8084)
 * Handles both Standard Services and Custom Projects (Modifications)
 * NO 'any' types used - full TypeScript strictness
 */

// ============================================
// Enums
// ============================================

export enum ServiceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ProjectStatus {
  REQUESTED = 'REQUESTED',
  QUOTED = 'QUOTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// ============================================
// Request DTOs - Custom Projects
// ============================================

export interface ProjectRequestDto {
  vehicleId: string;          // min 1 char, required
  description: string;        // 10-2000 chars, required
  budget?: number;            // min 0, optional
}

export interface QuoteDto {
  quoteAmount: number;        // min 0, required
  notes?: string;             // optional
}

export interface ProgressUpdateDto {
  progress: number;           // 0-100, required
  notes?: string;             // optional
}

export interface RejectionDto {
  reason?: string;            // 0-500 chars, optional
}

// ============================================
// Request DTOs - Standard Services
// ============================================

export interface ServiceNoteDto {
  note: string;               // min 1 char, required
  isInternal: boolean;        // required
}

// ============================================
// Response DTOs - Projects
// ============================================

export interface ProjectDto {
  projectId: string;
  customerId: string;
  vehicleId: string;
  description: string;
  budget: number | null;
  status: ProjectStatus;
  quoteAmount: number | null;
  quoteNotes: string | null;
  progress: number;           // 0-100
  progressNotes: string | null;
  createdAt: string;          // ISO 8601 date-time
  updatedAt: string;          // ISO 8601 date-time
  estimatedCompletionDate: string | null;
}

// ============================================
// Response DTOs - Services
// ============================================

export interface ServiceDto {
  serviceId: string;
  customerId: string;
  vehicleId: string;
  appointmentId: string | null;
  serviceType: string;
  status: ServiceStatus;
  startedAt: string | null;   // ISO 8601 date-time
  completedAt: string | null; // ISO 8601 date-time
  estimatedCost: number | null;
  actualCost: number | null;
  notes: ServiceNoteDto[];
  createdAt: string;           // ISO 8601 date-time
  updatedAt: string;           // ISO 8601 date-time
}

export interface ServicePhotoDto {
  photoId: string;
  serviceId: string;
  url: string;
  uploadedAt: string;          // ISO 8601 date-time
  uploadedBy: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// ============================================
// Form State Types
// ============================================

export interface ProjectFormData {
  vehicleId: string;
  description: string;
  budget: string;              // string for input, converted to number
}

export interface ProjectFormErrors {
  [key: string]: string;
}

export interface QuoteFormData {
  quoteAmount: string;
  notes: string;
}

export interface ProgressFormData {
  progress: string;
  notes: string;
}

export interface ServiceNoteFormData {
  note: string;
  isInternal: boolean;
}

// ============================================
// UI State Types
// ============================================

export interface ProjectListState {
  projects: ProjectDto[];
  isLoading: boolean;
  error: string | null;
}

export interface ServiceListState {
  services: ServiceDto[];
  isLoading: boolean;
  error: string | null;
}

// ============================================
// Status Display Config
// ============================================

export const PROJECT_STATUS_CONFIG = {
  [ProjectStatus.REQUESTED]: {
    label: 'Requested',
    color: 'yellow',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900',
    textClass: 'text-yellow-800 dark:text-yellow-200',
  },
  [ProjectStatus.QUOTED]: {
    label: 'Quoted',
    color: 'blue',
    bgClass: 'bg-blue-100 dark:bg-blue-900',
    textClass: 'text-blue-800 dark:text-blue-200',
  },
  [ProjectStatus.ACCEPTED]: {
    label: 'Accepted',
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900',
    textClass: 'text-green-800 dark:text-green-200',
  },
  [ProjectStatus.REJECTED]: {
    label: 'Rejected',
    color: 'red',
    bgClass: 'bg-red-100 dark:bg-red-900',
    textClass: 'text-red-800 dark:text-red-200',
  },
  [ProjectStatus.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'purple',
    bgClass: 'bg-purple-100 dark:bg-purple-900',
    textClass: 'text-purple-800 dark:text-purple-200',
  },
  [ProjectStatus.COMPLETED]: {
    label: 'Completed',
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900',
    textClass: 'text-green-800 dark:text-green-200',
  },
  [ProjectStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'gray',
    bgClass: 'bg-gray-100 dark:bg-gray-800',
    textClass: 'text-gray-800 dark:text-gray-200',
  },
} as const;

export const SERVICE_STATUS_CONFIG = {
  [ServiceStatus.PENDING]: {
    label: 'Pending',
    color: 'yellow',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900',
    textClass: 'text-yellow-800 dark:text-yellow-200',
  },
  [ServiceStatus.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'blue',
    bgClass: 'bg-blue-100 dark:bg-blue-900',
    textClass: 'text-blue-800 dark:text-blue-200',
  },
  [ServiceStatus.COMPLETED]: {
    label: 'Completed',
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900',
    textClass: 'text-green-800 dark:text-green-200',
  },
  [ServiceStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'gray',
    bgClass: 'bg-gray-100 dark:bg-gray-800',
    textClass: 'text-gray-800 dark:text-gray-200',
  },
} as const;

// ============================================
// Validation Constants
// ============================================

export const PROJECT_VALIDATION = {
  VEHICLE_ID: {
    MIN_LENGTH: 1,
  },
  DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 2000,
  },
  BUDGET: {
    MIN: 0,
  },
  QUOTE_AMOUNT: {
    MIN: 0,
  },
  PROGRESS: {
    MIN: 0,
    MAX: 100,
  },
  REJECTION_REASON: {
    MAX_LENGTH: 500,
  },
  SERVICE_NOTE: {
    MIN_LENGTH: 1,
  },
} as const;
