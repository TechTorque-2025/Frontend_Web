// TypeScript interfaces generated from OpenAPI specification

// Auth-related types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username?: string;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
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

// User-related types
export interface UserDto {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
  profilePhoto?: string;
  enabled: boolean;
  emailVerified?: boolean;
  createdAt: string;
  emailVerificationDeadline?: string;
  roles: string[];
  permissions: string[];
}

export interface UpdateUserRequest {
  email?: string;
  username?: string;
  enabled?: boolean;
}

export interface RoleAssignmentRequest {
  roleName: string;
  action: 'ASSIGN' | 'REVOKE';
}

export interface ResetPasswordRequest {
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  success?: boolean;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  user?: UserDto;
}