/**
 * Authentication Service Types
 * Generated from OpenAPI spec - Authentication Service API
 * NO 'any' types used - full TypeScript strictness
 */

// ============================================
// Enums and Constants
// ============================================

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum RoleAction {
  ASSIGN = 'ASSIGN',
  REVOKE = 'REVOKE'
}

// ============================================
// Request DTOs
// ============================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  roles?: string[];
}

export interface CreateEmployeeRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department: string;
}

export interface CreateAdminRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserRequest {
  email?: string;
  username?: string;
  enabled?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

export interface RoleAssignmentRequest {
  roleName: string;
  action: RoleAction;
}

// ============================================
// Response DTOs
// ============================================

export interface UserDto {
  id: number;
  username: string;
  email: string;
  enabled: boolean;
  createdAt: string; // ISO 8601 date-time string
  roles: string[];
  permissions: string[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserDto;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// ============================================
// API Error Response
// ============================================

export interface ApiError {
  status: number;
  message: string;
  timestamp?: string;
  path?: string;
}

// ============================================
// Form State Types (for React components)
// ============================================

export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// ============================================
// Auth Context Types
// ============================================

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  enabled: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

// ============================================
// Validation Error Types
// ============================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string;
}
