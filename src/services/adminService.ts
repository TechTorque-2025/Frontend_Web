"use client";
import api from '../lib/apiClient';
import type {
  UserResponse,
  UpdateUserRequest,
  ServiceTypeResponse,
  CreateServiceTypeRequest,
  UpdateServiceTypeRequest,
  SystemConfigurationResponse,
  UpdateConfigRequest,
  AnalyticsDashboardResponse,
  ReportRequest,
  ReportResponse,
  AuditLogResponse
} from '../types/admin';

export const adminService = {
  // ===== USER MANAGEMENT =====
  
  async getAllUsers(params?: {
    role?: string;
    enabled?: boolean;
    search?: string;
  }): Promise<UserResponse[]> {
    const res = await api.get('/admin/users', { params });
    return res.data.data || res.data;
  },

  async getUserDetails(userId: string): Promise<UserResponse> {
    const res = await api.get(`/admin/users/${userId}`);
    return res.data.data || res.data;
  },

  async updateUser(userId: string, data: UpdateUserRequest): Promise<UserResponse> {
    const res = await api.put(`/admin/users/${userId}`, data);
    return res.data.data || res.data;
  },

  async deactivateUser(userId: string): Promise<void> {
    await api.delete(`/admin/users/${userId}`);
  },

  async activateUser(userId: string): Promise<UserResponse> {
    const res = await api.post(`/admin/users/${userId}/activate`);
    return res.data.data || res.data;
  },

  // ===== SERVICE TYPE CONFIGURATION =====
  
  async getAllServiceTypes(): Promise<ServiceTypeResponse[]> {
    // Pass activeOnly=false to get ALL service types (active and inactive)
    const res = await api.get('/admin/service-types', {
      params: { activeOnly: false }
    });
    return res.data.data || res.data;
  },

  async getServiceType(typeId: string): Promise<ServiceTypeResponse> {
    const res = await api.get(`/admin/service-types/${typeId}`);
    return res.data.data || res.data;
  },

  async createServiceType(data: CreateServiceTypeRequest): Promise<ServiceTypeResponse> {
    const res = await api.post('/admin/service-types', data);
    return res.data.data || res.data;
  },

  async updateServiceType(
    typeId: string, 
    data: UpdateServiceTypeRequest
  ): Promise<ServiceTypeResponse> {
    const res = await api.put(`/admin/service-types/${typeId}`, data);
    return res.data.data || res.data;
  },

  async removeServiceType(typeId: string): Promise<void> {
    await api.delete(`/admin/service-types/${typeId}`);
  },

  // ===== SYSTEM CONFIGURATION =====
  
  async getAllConfigs(): Promise<SystemConfigurationResponse[]> {
    const res = await api.get('/admin/config');
    return res.data.data || res.data;
  },

  async getConfig(key: string): Promise<SystemConfigurationResponse> {
    const res = await api.get(`/admin/config/${key}`);
    return res.data.data || res.data;
  },

  async updateConfig(key: string, data: UpdateConfigRequest): Promise<SystemConfigurationResponse> {
    const res = await api.put(`/admin/config/${key}`, data);
    return res.data.data || res.data;
  },

  async createConfig(data: UpdateConfigRequest): Promise<SystemConfigurationResponse> {
    const res = await api.post('/admin/config', data);
    return res.data.data || res.data;
  },

  // ===== ANALYTICS & DASHBOARD =====
  
  async getDashboardAnalytics(): Promise<AnalyticsDashboardResponse> {
    const res = await api.get('/admin/analytics/dashboard');
    return res.data.data || res.data;
  },

  async getRevenueAnalytics(params: {
    from: string; // YYYY-MM-DD
    to: string;
  }): Promise<unknown> {
    const res = await api.get('/admin/analytics/revenue', { params });
    return res.data.data || res.data;
  },

  async getServiceAnalytics(params: {
    from: string;
    to: string;
  }): Promise<unknown> {
    const res = await api.get('/admin/analytics/services', { params });
    return res.data.data || res.data;
  },

  async getCustomerAnalytics(params: {
    from: string;
    to: string;
  }): Promise<unknown> {
    const res = await api.get('/admin/analytics/customers', { params });
    return res.data.data || res.data;
  },

  async getEmployeeProductivity(params?: {
    from?: string;
    to?: string;
    employeeId?: string;
  }): Promise<unknown> {
    const res = await api.get('/admin/analytics/employees', { params });
    return res.data.data || res.data;
  },

  // ===== REPORTS =====
  
  async generateReport(data: ReportRequest): Promise<ReportResponse> {
    const res = await api.post('/admin/reports/generate', data);
    return res.data.data || res.data;
  },

  async getReports(params?: {
    from?: string;
    to?: string;
    type?: string;
  }): Promise<ReportResponse[]> {
    const res = await api.get('/admin/reports', { params });
    return res.data.data || res.data;
  },

  async getReportById(reportId: string): Promise<ReportResponse> {
    const res = await api.get(`/admin/reports/${reportId}`);
    return res.data.data || res.data;
  },

  async downloadReport(reportId: string): Promise<Blob> {
    const res = await api.get(`/admin/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    return res.data;
  },

  // ===== AUDIT LOGS =====
  
  async getAuditLogs(params?: {
    from?: string;
    to?: string;
    userId?: string;
    action?: string;
    entityType?: string;
  }): Promise<AuditLogResponse[]> {
    const res = await api.get('/admin/audit-logs', { params });
    // Backend returns ApiResponse<PaginatedResponse<AuditLogResponse>>
    // So we need: res.data.data.data (ApiResponse.data -> PaginatedResponse.data -> array)
    const paginatedData = res.data.data || res.data;
    return Array.isArray(paginatedData) ? paginatedData : (paginatedData.data || []);
  },

  async getAuditLogById(logId: string): Promise<AuditLogResponse> {
    const res = await api.get(`/admin/audit-logs/${logId}`);
    return res.data.data || res.data;
  },
};

export default adminService;
