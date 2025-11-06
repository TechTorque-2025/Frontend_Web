/**
 * Authentication Service API
 * All endpoints for authentication and user management
 */

import apiClient from './axios-config';
import {
  LoginRequest,
  RegisterRequest,
  CreateEmployeeRequest,
  CreateAdminRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  RoleAssignmentRequest,
  UserDto,
  AuthResponse,
  ApiResponse
} from '@/types/auth.types';

// ============================================
// Authentication Endpoints
// ============================================

export const authService = {
  /**
   * POST /api/v1/auth/login
   * User Login - Returns JWT token
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', credentials);
    return response.data;
  },

  /**
   * POST /api/v1/auth/register
   * Register new customer account
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', data);
    return response.data;
  },

  /**
   * POST /api/v1/auth/users/employee
   * Create employee account (ADMIN role required)
   */
  createEmployee: async (data: CreateEmployeeRequest): Promise<ApiResponse<UserDto>> => {
    const response = await apiClient.post<ApiResponse<UserDto>>('/api/v1/auth/users/employee', data);
    return response.data;
  },

  /**
   * POST /api/v1/auth/users/admin
   * Create admin account (SUPER_ADMIN role required)
   */
  createAdmin: async (data: CreateAdminRequest): Promise<ApiResponse<UserDto>> => {
    const response = await apiClient.post<ApiResponse<UserDto>>('/api/v1/auth/users/admin', data);
    return response.data;
  },

  /**
   * GET /api/v1/auth/health
   * Health check endpoint
   */
  healthCheck: async (): Promise<ApiResponse<string>> => {
    const response = await apiClient.get<ApiResponse<string>>('/api/v1/auth/health');
    return response.data;
  },

  /**
   * GET /api/v1/auth/test
   * Test endpoint
   */
  test: async (): Promise<ApiResponse<string>> => {
    const response = await apiClient.get<ApiResponse<string>>('/api/v1/auth/test');
    return response.data;
  }
};

// ============================================
// User Management Endpoints
// ============================================

export const userService = {
  /**
   * GET /api/v1/users
   * Get all users (ADMIN/SUPER_ADMIN only)
   */
  getAllUsers: async (): Promise<UserDto[]> => {
    const response = await apiClient.get<UserDto[]>('/api/v1/users');
    return response.data;
  },

  /**
   * GET /api/v1/users/{username}
   * Get user by username (ADMIN/SUPER_ADMIN only)
   */
  getUserByUsername: async (username: string): Promise<UserDto> => {
    const response = await apiClient.get<UserDto>(`/api/v1/users/${username}`);
    return response.data;
  },

  /**
   * PUT /api/v1/users/{username}
   * Update user (ADMIN/SUPER_ADMIN only)
   */
  updateUser: async (username: string, data: UpdateUserRequest): Promise<ApiResponse<UserDto>> => {
    const response = await apiClient.put<ApiResponse<UserDto>>(`/api/v1/users/${username}`, data);
    return response.data;
  },

  /**
   * DELETE /api/v1/users/{username}
   * Delete user (SUPER_ADMIN only)
   */
  deleteUser: async (username: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/v1/users/${username}`);
    return response.data;
  },

  /**
   * GET /api/v1/users/me
   * Get current authenticated user profile
   */
  getCurrentUser: async (): Promise<UserDto> => {
    const response = await apiClient.get<UserDto>('/api/v1/users/me');
    return response.data;
  },

  /**
   * PUT /api/v1/users/me
   * Update current user profile
   */
  updateCurrentUser: async (data: UpdateUserRequest): Promise<ApiResponse<UserDto>> => {
    const response = await apiClient.put<ApiResponse<UserDto>>('/api/v1/users/me', data);
    return response.data;
  },

  /**
   * POST /api/v1/users/me/change-password
   * Change current user password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/api/v1/users/me/change-password', data);
    return response.data;
  },

  /**
   * POST /api/v1/users/{username}/reset-password
   * Reset user password (ADMIN/SUPER_ADMIN only)
   */
  resetPassword: async (username: string, data: ResetPasswordRequest): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(`/api/v1/users/${username}/reset-password`, data);
    return response.data;
  },

  /**
   * POST /api/v1/users/{username}/enable
   * Enable user account (ADMIN/SUPER_ADMIN only)
   */
  enableUser: async (username: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(`/api/v1/users/${username}/enable`);
    return response.data;
  },

  /**
   * POST /api/v1/users/{username}/disable
   * Disable user account (ADMIN/SUPER_ADMIN only)
   */
  disableUser: async (username: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(`/api/v1/users/${username}/disable`);
    return response.data;
  },

  /**
   * POST /api/v1/users/{username}/unlock
   * Unlock user account after failed login attempts (ADMIN/SUPER_ADMIN only)
   */
  unlockUser: async (username: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(`/api/v1/users/${username}/unlock`);
    return response.data;
  },

  /**
   * GET /api/v1/users/{username}/roles
   * Get user roles (ADMIN/SUPER_ADMIN only)
   */
  getUserRoles: async (username: string): Promise<ApiResponse<string[]>> => {
    const response = await apiClient.get<ApiResponse<string[]>>(`/api/v1/users/${username}/roles`);
    return response.data;
  },

  /**
   * POST /api/v1/users/{username}/roles
   * Assign or revoke user role (ADMIN/SUPER_ADMIN only)
   */
  manageUserRole: async (username: string, data: RoleAssignmentRequest): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(`/api/v1/users/${username}/roles`, data);
    return response.data;
  },

  /**
   * DELETE /api/v1/users/{username}/roles/{roleName}
   * Remove role from user (ADMIN/SUPER_ADMIN only)
   */
  removeUserRole: async (username: string, roleName: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/v1/users/${username}/roles/${roleName}`);
    return response.data;
  }
};
