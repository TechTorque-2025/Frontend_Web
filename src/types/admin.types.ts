/**
 * Admin Service Types
 * Generated from OpenAPI spec - Admin Service API (Port 8087)
 * Handles user management, service configuration, reports, and analytics
 * NO 'any' types used - full TypeScript strictness
 */

// ============================================
// Request DTOs
// ============================================

export interface UserUpdateDto {
  role?: string;
  status?: string;
  email?: string;
  phoneNumber?: string;
}

export interface ServiceTypeDto {
  id?: string;
  name: string;
  description?: string;
  price: number;
  defaultDurationMinutes: number;
  category?: string;
}

export interface ReportRequestDto {
  reportType: string;
  startDate: string; // format: date (YYYY-MM-DD)
  endDate: string; // format: date (YYYY-MM-DD)
  employeeId?: string;
  customerId?: string;
}

// ============================================
// Response DTOs
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// User Management Response Types
export interface UserDetailsDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

// Analytics Response Types
export interface DashboardDataDto {
  totalUsers: number;
  totalRevenue: number;
  totalServices: number;
  totalAppointments: number;
  recentActivity: ActivityDto[];
  revenueChart: ChartDataPoint[];
  servicesChart: ChartDataPoint[];
}

export interface ActivityDto {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

export interface SystemMetricsDto {
  activeUsers: number;
  pendingAppointments: number;
  activeProjects: number;
  totalRevenue: number;
  uptime: string;
  cpuUsage?: number;
  memoryUsage?: number;
}

// Reports Response Types
export interface ReportDto {
  id: string;
  reportType: string;
  generatedBy: string;
  generatedAt: string;
  startDate: string;
  endDate: string;
  status: string;
  downloadUrl?: string;
}

export interface RevenueReportDto {
  totalRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingAmount: number;
  revenueByMonth: ChartDataPoint[];
  revenueByService: ChartDataPoint[];
}

export interface ServicesReportDto {
  totalServices: number;
  completedServices: number;
  activeServices: number;
  servicesByType: ChartDataPoint[];
  servicesByEmployee: ChartDataPoint[];
}

export interface CustomersReportDto {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  topCustomers: CustomerSummary[];
}

export interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  totalServices: number;
  lastVisit: string;
}

// ============================================
// Enums
// ============================================

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum ReportType {
  REVENUE = 'REVENUE',
  SERVICES = 'SERVICES',
  CUSTOMERS = 'CUSTOMERS',
  EMPLOYEES = 'EMPLOYEES',
  CUSTOM = 'CUSTOM',
}

export enum DashboardPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

// ============================================
// Form Data Types
// ============================================

export interface UserUpdateFormData {
  role: string;
  status: string;
  email: string;
  phoneNumber: string;
}

export interface ServiceTypeFormData {
  name: string;
  description: string;
  price: number;
  defaultDurationMinutes: number;
  category: string;
}

export interface ReportFormData {
  reportType: string;
  startDate: string;
  endDate: string;
  employeeId: string;
  customerId: string;
}

// ============================================
// Validation Constants
// ============================================

export const ADMIN_VALIDATION = {
  SERVICE_TYPE: {
    NAME_MIN_LENGTH: 1,
    DESCRIPTION_MAX_LENGTH: 500,
    PRICE_MIN: 0,
    DURATION_MIN: 15,
    DURATION_MAX: 480, // 8 hours
  },
  USER: {
    PHONE_PATTERN: /^\d{10}$/,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  REPORT: {
    DATE_RANGE_MAX_DAYS: 365,
  },
};

export interface ServiceTypeFormErrors {
  name?: string;
  description?: string;
  price?: string;
  defaultDurationMinutes?: string;
  category?: string;
}

export interface UserUpdateFormErrors {
  role?: string;
  status?: string;
  email?: string;
  phoneNumber?: string;
}

export interface ReportFormErrors {
  reportType?: string;
  startDate?: string;
  endDate?: string;
  employeeId?: string;
  customerId?: string;
  submit?: string;
}

// ============================================
// Config Objects
// ============================================

export const USER_STATUS_CONFIG: Record<
  UserStatus,
  { label: string; colorClass: string }
> = {
  [UserStatus.ACTIVE]: {
    label: 'Active',
    colorClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  },
  [UserStatus.INACTIVE]: {
    label: 'Inactive',
    colorClass: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  },
  [UserStatus.SUSPENDED]: {
    label: 'Suspended',
    colorClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  },
};

export const REPORT_TYPES = [
  { value: ReportType.REVENUE, label: 'Revenue Report' },
  { value: ReportType.SERVICES, label: 'Services Report' },
  { value: ReportType.CUSTOMERS, label: 'Customers Report' },
  { value: ReportType.EMPLOYEES, label: 'Employees Report' },
  { value: ReportType.CUSTOM, label: 'Custom Report' },
];

export const DASHBOARD_PERIODS = [
  { value: DashboardPeriod.DAILY, label: 'Daily' },
  { value: DashboardPeriod.WEEKLY, label: 'Weekly' },
  { value: DashboardPeriod.MONTHLY, label: 'Monthly' },
  { value: DashboardPeriod.YEARLY, label: 'Yearly' },
];

export const SERVICE_CATEGORIES = [
  'Maintenance',
  'Repair',
  'Diagnostic',
  'Modification',
  'Inspection',
  'Detailing',
  'Other',
];
