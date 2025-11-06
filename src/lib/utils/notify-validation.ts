/**
 * Notification Management Form Validation Utilities
 * Matches backend validation requirements
 */

import { NotificationFormErrors, NOTIFICATION_VALIDATION } from '@/types/notify.types';

export const notifyValidation = {
  /**
   * Validate notification form
   */
  validateNotification: (data: {
    userId: string;
    type: string;
    category: string;
    subject: string;
    message: string;
    recipientEmail: string;
    recipientPhone: string;
  }): NotificationFormErrors => {
    const errors: NotificationFormErrors = {};

    if (!data.userId || data.userId.trim().length === 0) {
      errors.userId = 'User ID is required';
    }

    if (!data.type || data.type.trim().length === 0) {
      errors.type = 'Notification type is required';
    }

    if (!data.category || data.category.trim().length === 0) {
      errors.category = 'Category is required';
    }

    if (
      !data.subject ||
      data.subject.trim().length < NOTIFICATION_VALIDATION.SUBJECT_MIN_LENGTH
    ) {
      errors.subject = 'Subject is required';
    }

    if (data.subject.length > NOTIFICATION_VALIDATION.SUBJECT_MAX_LENGTH) {
      errors.subject = `Subject must be less than ${NOTIFICATION_VALIDATION.SUBJECT_MAX_LENGTH} characters`;
    }

    if (
      !data.message ||
      data.message.trim().length < NOTIFICATION_VALIDATION.MESSAGE_MIN_LENGTH
    ) {
      errors.message = 'Message is required';
    }

    if (data.message.length > NOTIFICATION_VALIDATION.MESSAGE_MAX_LENGTH) {
      errors.message = `Message must be less than ${NOTIFICATION_VALIDATION.MESSAGE_MAX_LENGTH} characters`;
    }

    if (data.recipientEmail && !NOTIFICATION_VALIDATION.EMAIL_PATTERN.test(data.recipientEmail)) {
      errors.recipientEmail = 'Invalid email format';
    }

    if (data.recipientPhone && !NOTIFICATION_VALIDATION.PHONE_PATTERN.test(data.recipientPhone)) {
      errors.recipientPhone = 'Invalid phone number format';
    }

    return errors;
  },
};

// ============================================
// Helper Functions
// ============================================

export const notifyHelpers = {
  /**
   * Format notification timestamp
   */
  formatTimestamp: (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  },

  /**
   * Get time ago format
   */
  getTimeAgo: (timestamp: string): string => {
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
   * Check if notification is unread
   */
  isUnread: (notification: { readAt?: string }): boolean => {
    return !notification.readAt;
  },

  /**
   * Get notification icon based on category
   */
  getCategoryIcon: (category: string): string => {
    const icons: Record<string, string> = {
      APPOINTMENT: '📅',
      PAYMENT: '💳',
      PROJECT: '🔧',
      SERVICE: '⚙️',
      SYSTEM: '⚡',
      PROMOTION: '🎁',
    };
    return icons[category] || '📢';
  },

  /**
   * Get notification type icon
   */
  getTypeIcon: (type: string): string => {
    const icons: Record<string, string> = {
      EMAIL: '📧',
      SMS: '💬',
      PUSH: '🔔',
      IN_APP: '📱',
    };
    return icons[type] || '📢';
  },
};
