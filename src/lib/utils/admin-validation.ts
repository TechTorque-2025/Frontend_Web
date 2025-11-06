/**
 * Admin Form Validation Utilities
 * Matches backend validation requirements
 */

import {
  ServiceTypeFormErrors,
  UserUpdateFormErrors,
  ReportFormErrors,
  ADMIN_VALIDATION,
} from '@/types/admin.types';

export const adminValidation = {
  /**
   * Validate service type form
   */
  validateServiceType: (data: {
    name: string;
    description: string;
    price: number;
    defaultDurationMinutes: number;
    category: string;
  }): ServiceTypeFormErrors => {
    const errors: ServiceTypeFormErrors = {};

    if (!data.name || data.name.trim().length < ADMIN_VALIDATION.SERVICE_TYPE.NAME_MIN_LENGTH) {
      errors.name = 'Service name is required';
    }

    if (data.description && data.description.length > ADMIN_VALIDATION.SERVICE_TYPE.DESCRIPTION_MAX_LENGTH) {
      errors.description = `Description must be less than ${ADMIN_VALIDATION.SERVICE_TYPE.DESCRIPTION_MAX_LENGTH} characters`;
    }

    if (data.price < ADMIN_VALIDATION.SERVICE_TYPE.PRICE_MIN) {
      errors.price = 'Price must be positive';
    }

    if (data.defaultDurationMinutes < ADMIN_VALIDATION.SERVICE_TYPE.DURATION_MIN) {
      errors.defaultDurationMinutes = `Duration must be at least ${ADMIN_VALIDATION.SERVICE_TYPE.DURATION_MIN} minutes`;
    }

    if (data.defaultDurationMinutes > ADMIN_VALIDATION.SERVICE_TYPE.DURATION_MAX) {
      errors.defaultDurationMinutes = `Duration cannot exceed ${ADMIN_VALIDATION.SERVICE_TYPE.DURATION_MAX} minutes`;
    }

    return errors;
  },

  /**
   * Validate user update form
   */
  validateUserUpdate: (data: {
    role: string;
    status: string;
    email: string;
    phoneNumber: string;
  }): UserUpdateFormErrors => {
    const errors: UserUpdateFormErrors = {};

    if (data.email && !ADMIN_VALIDATION.USER.EMAIL_PATTERN.test(data.email)) {
      errors.email = 'Invalid email format';
    }

    if (data.phoneNumber && !ADMIN_VALIDATION.USER.PHONE_PATTERN.test(data.phoneNumber)) {
      errors.phoneNumber = 'Phone number must be 10 digits';
    }

    return errors;
  },

  /**
   * Validate report generation form
   */
  validateReport: (data: {
    reportType: string;
    startDate: string;
    endDate: string;
  }): ReportFormErrors => {
    const errors: ReportFormErrors = {};

    if (!data.reportType) {
      errors.reportType = 'Report type is required';
    }

    if (!data.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!data.endDate) {
      errors.endDate = 'End date is required';
    }

    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);

      if (start > end) {
        errors.endDate = 'End date must be after start date';
      }

      const diffInDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (diffInDays > ADMIN_VALIDATION.REPORT.DATE_RANGE_MAX_DAYS) {
        errors.endDate = `Date range cannot exceed ${ADMIN_VALIDATION.REPORT.DATE_RANGE_MAX_DAYS} days`;
      }
    }

    return errors;
  },
};

// ============================================
// Helper Functions
// ============================================

export const adminHelpers = {
  /**
   * Format currency
   */
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  },

  /**
   * Format duration from minutes
   */
  formatDuration: (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  },

  /**
   * Get today's date in YYYY-MM-DD format
   */
  getTodayDate: (): string => {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * Get first day of current month
   */
  getFirstDayOfMonth: (): string => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  },

  /**
   * Get last day of current month
   */
  getLastDayOfMonth: (): string => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
  },

  /**
   * Calculate percentage
   */
  calculatePercentage: (value: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  },

  /**
   * Format large numbers (1000 -> 1K, 1000000 -> 1M)
   */
  formatLargeNumber: (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  },
};
