/**
 * Vehicle Service Types
 * Generated from OpenAPI spec - Vehicle Service API
 * NO 'any' types used - full TypeScript strictness
 */

// ============================================
// Request DTOs
// ============================================

export interface VehicleRequestDto {
  make: string;              // 2-50 chars, required
  model: string;             // 1-50 chars, required
  year: number;              // required
  vin: string;               // 17 chars, pattern: ^[A-HJ-NPR-Z0-9]{17}$, required
  licensePlate: string;      // 2-15 chars, required
  color?: string;            // 0-30 chars, optional
  mileage?: number;          // 0-1000000, optional
}

export interface VehicleUpdateDto {
  licensePlate?: string;     // 2-15 chars, optional
  color?: string;            // 0-30 chars, optional
  mileage?: number;          // 0-1000000, optional
}

// ============================================
// Response DTOs
// ============================================

export interface VehicleDto {
  vehicleId: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  color: string | null;
  mileage: number | null;
  registeredAt: string;      // ISO 8601 date-time
  updatedAt: string;         // ISO 8601 date-time
  photoUrls?: string[];
}

export interface ServiceHistoryEntry {
  serviceId: string;
  vehicleId: string;
  serviceDate: string;       // ISO 8601 date-time
  serviceType: string;
  description: string;
  cost: number;
  performedBy: string;
  mileageAtService: number | null;
}

export interface VehicleApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// ============================================
// Form State Types
// ============================================

export interface VehicleFormData {
  make: string;
  model: string;
  year: string;              // string for input, converted to number
  vin: string;
  licensePlate: string;
  color: string;
  mileage: string;           // string for input, converted to number
}

export interface VehicleFormErrors {
  [key: string]: string;
}

// ============================================
// UI State Types
// ============================================

export interface VehicleListState {
  vehicles: VehicleDto[];
  isLoading: boolean;
  error: string | null;
}

export interface VehicleDetailsState {
  vehicle: VehicleDto | null;
  serviceHistory: ServiceHistoryEntry[];
  isLoading: boolean;
  error: string | null;
}

// ============================================
// Photo Upload Types
// ============================================

export interface VehiclePhotoUploadRequest {
  vehicleId: string;
  files: File[];
}

export interface VehiclePhotoUploadResponse {
  uploadedUrls: string[];
  totalUploaded: number;
}

// ============================================
// Validation Constants
// ============================================

export const VEHICLE_VALIDATION = {
  MAKE: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  MODEL: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
  },
  YEAR: {
    MIN: 1900,
    MAX: new Date().getFullYear() + 1,
  },
  VIN: {
    LENGTH: 17,
    PATTERN: /^[A-HJ-NPR-Z0-9]{17}$/,
  },
  LICENSE_PLATE: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 15,
  },
  COLOR: {
    MAX_LENGTH: 30,
  },
  MILEAGE: {
    MIN: 0,
    MAX: 1000000,
  },
} as const;
