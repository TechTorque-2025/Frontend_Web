/**
 * Notification Service Types
 * Generated from OpenAPI spec - Notification Service API (Port 8089)
 * Handles real-time notifications via WebSocket
 * NO 'any' types used - full TypeScript strictness
 */

// ============================================
// Request DTOs
// ============================================

export interface UpdateMessage {
  type: string;
  entityId?: string;
  userId?: string;
  title: string;
  message: string;
  data?: Record<string, unknown>; // Generic data payload
  timestamp?: string; // ISO date-time
  progress?: number; // 0-100
  status?: string;
}

// ============================================
// Notification Types
// ============================================

export enum NotificationType {
  APPOINTMENT = 'APPOINTMENT',
  PROJECT = 'PROJECT',
  SERVICE_PROGRESS = 'SERVICE_PROGRESS',
  TIME_LOG = 'TIME_LOG',
  PAYMENT = 'PAYMENT',
  INVOICE = 'INVOICE',
  SYSTEM = 'SYSTEM',
  BROADCAST = 'BROADCAST',
  USER = 'USER',
}

// ============================================
// Frontend Notification Interface
// ============================================

export interface Notification {
  id: string; // Generated client-side
  type: NotificationType | string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  entityId?: string;
  userId?: string;
  data?: Record<string, unknown>;
  progress?: number;
  status?: string;
}

// ============================================
// Notification Icons & Colors
// ============================================

export const NOTIFICATION_CONFIG: Record<
  string,
  { icon: string; color: string; bgColor: string }
> = {
  APPOINTMENT: {
    icon: '📅',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  PROJECT: {
    icon: '🔧',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
  SERVICE_PROGRESS: {
    icon: '⚙️',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
  },
  TIME_LOG: {
    icon: '⏱️',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
  },
  PAYMENT: {
    icon: '💳',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  INVOICE: {
    icon: '🧾',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
  },
  SYSTEM: {
    icon: '⚡',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
  },
  BROADCAST: {
    icon: '📢',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
  },
  USER: {
    icon: '👤',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
  },
};

// ============================================
// Helper Functions
// ============================================

export const notificationHelpers = {
  /**
   * Generate unique notification ID
   */
  generateId: (): string => {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Format notification timestamp
   */
  formatTimestamp: (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  },

  /**
   * Sort notifications by timestamp (newest first)
   */
  sortByTimestamp: (notifications: Notification[]): Notification[] => {
    return [...notifications].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  /**
   * Filter unread notifications
   */
  getUnreadCount: (notifications: Notification[]): number => {
    return notifications.filter((n) => !n.read).length;
  },

  /**
   * Mark all as read
   */
  markAllAsRead: (notifications: Notification[]): Notification[] => {
    return notifications.map((n) => ({ ...n, read: true }));
  },

  /**
   * Get notification config (icon, color, bgColor)
   */
  getConfig: (type: string) => {
    return NOTIFICATION_CONFIG[type] || NOTIFICATION_CONFIG.SYSTEM;
  },
};
