// Admin & Reporting TypeScript Interfaces

// ===== USER MANAGEMENT =====
export interface UserResponse {
  userId: string;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  roles: string[];
  enabled: boolean;
  accountLocked: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  roles?: string[];
  enabled?: boolean;
}

// ===== SERVICE TYPE CONFIGURATION =====
export interface ServiceTypeResponse {
  id: string;
  name: string;
  category: string;
  description?: string;
  basePriceLKR: number;
  estimatedDurationMinutes: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceTypeRequest {
  name: string;
  category: string;
  description?: string;
  price: number; // Backend expects 'price' not 'basePriceLKR'
  durationMinutes: number; // Backend expects 'durationMinutes' not 'estimatedDurationMinutes'
  requiresApproval?: boolean;
  dailyCapacity?: number;
  skillLevel?: string;
  iconUrl?: string;
}

export interface UpdateServiceTypeRequest {
  name?: string;
  category?: string;
  description?: string;
  price?: number; // Backend expects 'price' not 'basePriceLKR'
  durationMinutes?: number; // Backend expects 'durationMinutes' not 'estimatedDurationMinutes'
  active?: boolean;
  dailyCapacity?: number;
  skillLevel?: string;
  iconUrl?: string;
}

// ===== SYSTEM CONFIGURATION =====
export interface SystemConfigurationResponse {
  key: string;
  value: string;
  dataType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  description?: string;
  category?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface UpdateConfigRequest {
  key: string;
  value: string;
  dataType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  description?: string;
  category?: string;
}

// ===== ANALYTICS & DASHBOARD =====
export interface AnalyticsDashboardResponse {
  totalCustomers: number;
  totalVehicles: number;
  totalEmployees: number;
  activeAppointments: number;
  completedServicesThisMonth: number;
  revenueThisMonth: number;
  pendingInvoices: number;
  activeProjects: number;
  recentAppointments: Array<{
    id: string;
    customerId: string;
    customerName?: string;
    serviceType: string;
    date: string;
    status: string;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
  topServices: Array<{
    serviceName: string;
    count: number;
  }>;
}

// ===== REPORTS =====
export interface ReportRequest {
  type: 'SERVICE_PERFORMANCE' | 'REVENUE' | 'EMPLOYEE_PRODUCTIVITY' | 'CUSTOMER_SATISFACTION' | 'INVENTORY' | 'APPOINTMENT_SUMMARY'; // Changed from reportType
  fromDate: string; // YYYY-MM-DD - Changed from 'from'
  toDate: string; // Changed from 'to'
  format: 'JSON' | 'PDF' | 'EXCEL' | 'CSV'; // Required field
  departmentId?: string;
  employeeId?: string;
  serviceCategory?: string;
  customerId?: string;
}

export interface ReportResponse {
  reportId: string;
  reportType: string;
  from: string;
  to: string;
  format: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
  createdBy: string;
  completedAt?: string;
}

// ===== AUDIT LOGS =====
export interface AuditLogResponse {
  logId: string;
  userId: string;
  username?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// ===== GENERIC API RESPONSE =====
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
