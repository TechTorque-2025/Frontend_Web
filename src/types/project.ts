// Project & Service Management TypeScript Interfaces

// ===== SERVICE TYPES =====
export interface CreateServiceDto {
  appointmentId: string;
  vehicleId: string;
  serviceType: string;
  description?: string;
}

export interface ServiceResponseDto {
  id: string;
  appointmentId: string;
  customerId: string;
  vehicleId: string;
  assignedEmployeeId?: string;
  serviceType: string;
  status: ServiceStatus;
  description?: string;
  startedAt?: string;
  completedAt?: string;
  estimatedCost?: number;
  actualCost?: number;
  createdAt: string;
  updatedAt: string;
}

export type ServiceStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface NoteDto {
  content: string;
  type?: 'INTERNAL' | 'CUSTOMER_VISIBLE';
}

export interface CompletionDto {
  actualCost: number;
  completionNotes?: string;
  partsUsed?: Array<{
    partName: string;
    quantity: number;
    cost: number;
  }>;
}

// ===== PROJECT TYPES (Custom Modifications) =====
export interface ProjectRequestDto {
  vehicleId: string;
  projectType: string;
  description: string;
  desiredCompletionDate?: string;
  budget?: number;
  referenceImages?: string[];
}

export interface ProjectResponseDto {
  id: string;
  customerId: string;
  vehicleId: string;
  appointmentId?: string;
  projectType: string;
  description: string;
  status: ProjectStatus;
  desiredCompletionDate?: string;
  budget?: number;
  quotedPrice?: number;
  actualCost?: number;
  quoteNotes?: string;
  quoteSubmittedAt?: string;
  quoteApprovedAt?: string;
  startedAt?: string;
  completedAt?: string;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus =
  | 'REQUESTED'
  | 'PENDING_ADMIN_REVIEW'
  | 'QUOTE_PENDING'
  | 'QUOTE_SUBMITTED'
  | 'QUOTE_APPROVED'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export interface QuoteDto {
  quotedPrice: number;
  quoteNotes?: string;
  estimatedDuration?: string;
  partsRequired?: Array<{
    partName: string;
    estimatedCost: number;
  }>;
}

export interface ProgressUpdateDto {
  progressPercentage: number;
  notes?: string;
}

// ===== SHARED TYPES =====
export interface PhotoUploadResponse {
  photoIds: string[];
  urls: string[];
}

export interface ApiResponse {
  message: string;
  [key: string]: unknown;
}
