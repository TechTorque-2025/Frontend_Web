/**
 * Admin Service API
 * All endpoints for admin management features
 * Port 8087 - Routes: /admin/*
 */

import apiClient from './axios-config';
import {
  UserUpdateDto,
  ServiceTypeDto,
  ReportRequestDto,
  ApiResponse,
  UserDetailsDto,
  DashboardDataDto,
  SystemMetricsDto,
  ReportDto,
  RevenueReportDto,
  ServicesReportDto,
  CustomersReportDto,
} from '@/types/admin.types';

// ============================================
// User Management Service
// ============================================

export const adminUserService = {
  /**
   * GET /admin/users
   * List all users with filters and pagination
   */
  listAllUsers: async (): Promise<ApiResponse<UserDetailsDto[]>> => {
    const response = await apiClient.get<ApiResponse<UserDetailsDto[]>>('/admin/users');
    return response.data;
  },

  /**
   * GET /admin/users/{userId}
   * Get detailed information for a specific user
   */
  getUserDetails: async (userId: string): Promise<ApiResponse<UserDetailsDto>> => {
    const response = await apiClient.get<ApiResponse<UserDetailsDto>>(
      `/admin/users/${userId}`
    );
    return response.data;
  },

  /**
   * PUT /admin/users/{userId}
   * Update a user's role or status
   */
  updateUser: async (
    userId: string,
    data: UserUpdateDto
  ): Promise<ApiResponse<UserDetailsDto>> => {
    const response = await apiClient.put<ApiResponse<UserDetailsDto>>(
      `/admin/users/${userId}`,
      data
    );
    return response.data;
  },

  /**
   * DELETE /admin/users/{userId}
   * Deactivate a user account
   */
  deactivateUser: async (userId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/users/${userId}`);
    return response.data;
  },
};

// ============================================
// Service Configuration Service
// ============================================

export const adminServiceTypeService = {
  /**
   * GET /admin/service-types
   * List all configurable service types
   */
  listServiceTypes: async (): Promise<ApiResponse<ServiceTypeDto[]>> => {
    const response = await apiClient.get<ApiResponse<ServiceTypeDto[]>>(
      '/admin/service-types'
    );
    return response.data;
  },

  /**
   * POST /admin/service-types
   * Add a new service type
   */
  addServiceType: async (data: ServiceTypeDto): Promise<ApiResponse<ServiceTypeDto>> => {
    const response = await apiClient.post<ApiResponse<ServiceTypeDto>>(
      '/admin/service-types',
      data
    );
    return response.data;
  },

  /**
   * PUT /admin/service-types/{typeId}
   * Update an existing service type
   */
  updateServiceType: async (
    typeId: string,
    data: ServiceTypeDto
  ): Promise<ApiResponse<ServiceTypeDto>> => {
    const response = await apiClient.put<ApiResponse<ServiceTypeDto>>(
      `/admin/service-types/${typeId}`,
      data
    );
    return response.data;
  },

  /**
   * DELETE /admin/service-types/{typeId}
   * Remove a service type
   */
  removeServiceType: async (typeId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/admin/service-types/${typeId}`
    );
    return response.data;
  },
};

// ============================================
// Analytics Service
// ============================================

export const adminAnalyticsService = {
  /**
   * GET /admin/analytics/dashboard
   * Get aggregated data for the admin dashboard
   */
  getDashboardData: async (period = 'monthly'): Promise<ApiResponse<DashboardDataDto>> => {
    const response = await apiClient.get<ApiResponse<DashboardDataDto>>(
      '/admin/analytics/dashboard',
      { params: { period } }
    );
    return response.data;
  },

  /**
   * GET /admin/analytics/metrics
   * Get high-level system metrics
   */
  getSystemMetrics: async (): Promise<ApiResponse<SystemMetricsDto>> => {
    const response = await apiClient.get<ApiResponse<SystemMetricsDto>>(
      '/admin/analytics/metrics'
    );
    return response.data;
  },
};

// ============================================
// Reports Service
// ============================================

export const adminReportsService = {
  /**
   * GET /admin/reports
   * List all previously generated reports
   */
  listGeneratedReports: async (): Promise<ApiResponse<ReportDto[]>> => {
    const response = await apiClient.get<ApiResponse<ReportDto[]>>('/admin/reports');
    return response.data;
  },

  /**
   * POST /admin/reports/generate
   * Generate a new on-demand report
   */
  generateReport: async (
    data: ReportRequestDto,
    userSubject: string
  ): Promise<ApiResponse<ReportDto>> => {
    const response = await apiClient.post<ApiResponse<ReportDto>>(
      '/admin/reports/generate',
      data,
      { headers: { 'X-User-Subject': userSubject } }
    );
    return response.data;
  },

  /**
   * GET /admin/reports/{reportId}
   * Get the data for a specific generated report
   */
  getReportDetails: async (reportId: string): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.get<ApiResponse<unknown>>(
      `/admin/reports/${reportId}`
    );
    return response.data;
  },

  /**
   * GET /admin/reports/revenue
   * Generate revenue report for a date range
   */
  getRevenueReport: async (
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<RevenueReportDto>> => {
    const response = await apiClient.get<ApiResponse<RevenueReportDto>>(
      '/admin/reports/revenue',
      { params: { startDate, endDate } }
    );
    return response.data;
  },

  /**
   * GET /admin/reports/services
   * Generate services report for a date range
   */
  getServicesReport: async (
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<ServicesReportDto>> => {
    const response = await apiClient.get<ApiResponse<ServicesReportDto>>(
      '/admin/reports/services',
      { params: { startDate, endDate } }
    );
    return response.data;
  },

  /**
   * GET /admin/reports/customers
   * Generate customer report for a date range
   */
  getCustomersReport: async (
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<CustomersReportDto>> => {
    const response = await apiClient.get<ApiResponse<CustomersReportDto>>(
      '/admin/reports/customers',
      { params: { startDate, endDate } }
    );
    return response.data;
  },
};

// Export all admin services
export const adminService = {
  users: adminUserService,
  serviceTypes: adminServiceTypeService,
  analytics: adminAnalyticsService,
  reports: adminReportsService,
};
