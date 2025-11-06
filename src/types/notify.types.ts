/**
 * Notification Management Types
 * Generated from OpenAPI spec - Notification Management API (Port 8090)
 * Handles notification CRUD operations and persistence
 * NO 'any' types used - full TypeScript strictness
 */

// ============================================
// Request DTOs
// ============================================

export interface NotificationRequest {
  userId: string;
  type: string;
  category: string;
  subject: string;
  message: string;
  recipientEmail?: string; // email format
  recipientPhone?: string;
  templateData?: Record<string, unknown>;
}

// ============================================
// Response DTOs
// ============================================

export interface NotificationResponse {
  id: number;
  userId: string;
  type: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  sentAt?: string; // ISO date-time
  readAt?: string; // ISO date-time
  createdAt: string; // ISO date-time
}

// ============================================
// Enums
// ============================================

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

export enum NotificationCategory {
  APPOINTMENT = 'APPOINTMENT',
  PAYMENT = 'PAYMENT',
  PROJECT = 'PROJECT',
  SERVICE = 'SERVICE',
  SYSTEM = 'SYSTEM',
  PROMOTION = 'PROMOTION',
}

export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

// ============================================
// Form Data Types
// ============================================

export interface NotificationFormData {
  userId: string;
  type: string;
  category: string;
  subject: string;
  message: string;
  recipientEmail: string;
  recipientPhone: string;
}

export interface NotificationFormErrors {
  userId?: string;
  type?: string;
  category?: string;
  subject?: string;
  message?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  submit?: string;
}

// ============================================
// Validation Constants
// ============================================

export const NOTIFICATION_VALIDATION = {
  SUBJECT_MIN_LENGTH: 1,
  SUBJECT_MAX_LENGTH: 200,
  MESSAGE_MIN_LENGTH: 1,
  MESSAGE_MAX_LENGTH: 2000,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^\+?[1-9]\d{1,14}$/,
};

// ============================================
// Config Objects
// ============================================

export const NOTIFICATION_STATUS_CONFIG: Record<
  NotificationStatus,
  { label: string; colorClass: string }
> = {
  [NotificationStatus.PENDING]: {
    label: 'Pending',
    colorClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  },
  [NotificationStatus.SENT]: {
    label: 'Sent',
    colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  [NotificationStatus.DELIVERED]: {
    label: 'Delivered',
    colorClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  },
  [NotificationStatus.READ]: {
    label: 'Read',
    colorClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  },
  [NotificationStatus.FAILED]: {
    label: 'Failed',
    colorClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  },
};

export const NOTIFICATION_TYPE_OPTIONS = [
  { value: NotificationType.IN_APP, label: 'In-App' },
  { value: NotificationType.EMAIL, label: 'Email' },
  { value: NotificationType.SMS, label: 'SMS' },
  { value: NotificationType.PUSH, label: 'Push Notification' },
];

export const NOTIFICATION_CATEGORY_OPTIONS = [
  { value: NotificationCategory.APPOINTMENT, label: 'Appointment' },
  { value: NotificationCategory.PAYMENT, label: 'Payment' },
  { value: NotificationCategory.PROJECT, label: 'Project' },
  { value: NotificationCategory.SERVICE, label: 'Service' },
  { value: NotificationCategory.SYSTEM, label: 'System' },
  { value: NotificationCategory.PROMOTION, label: 'Promotion' },
];
