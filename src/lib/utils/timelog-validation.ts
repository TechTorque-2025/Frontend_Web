/**
 * Time Log Form Validation Utilities
 * Matches backend validation requirements
 */

import { TimeLogFormErrors, TIMELOG_VALIDATION } from '@/types/timelog.types';

export const timeLogValidation = {
  /**
   * Validate service ID
   */
  serviceId: (value: string): string | null => {
    if (!value || !value.trim()) {
      return 'Service is required';
    }
    if (value.length < TIMELOG_VALIDATION.SERVICE_ID.MIN_LENGTH) {
      return 'Invalid service selection';
    }
    return null;
  },

  /**
   * Validate hours worked
   */
  hours: (value: string): string | null => {
    if (!value) {
      return 'Hours are required';
    }
    const hoursNum = parseFloat(value);
    if (isNaN(hoursNum)) {
      return 'Hours must be a valid number';
    }
    if (hoursNum < TIMELOG_VALIDATION.HOURS.MIN) {
      return 'Hours cannot be negative';
    }
    if (hoursNum > TIMELOG_VALIDATION.HOURS.MAX) {
      return 'Hours cannot exceed 24 hours per day';
    }
    return null;
  },

  /**
   * Validate date
   */
  date: (value: string): string | null => {
    if (!value) {
      return 'Date is required';
    }
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime())) {
      return 'Invalid date format';
    }

    if (selectedDate > today) {
      return 'Cannot log time for future dates';
    }

    return null;
  },

  /**
   * Validate description (optional)
   */
  description: (value: string): string | null => {
    if (value && value.length > TIMELOG_VALIDATION.DESCRIPTION.MAX_LENGTH) {
      return `Description must be less than ${TIMELOG_VALIDATION.DESCRIPTION.MAX_LENGTH} characters`;
    }
    return null;
  },

  /**
   * Validate work type (optional)
   */
  workType: (value: string): string | null => {
    if (value && value.length > TIMELOG_VALIDATION.WORK_TYPE.MAX_LENGTH) {
      return `Work type must be less than ${TIMELOG_VALIDATION.WORK_TYPE.MAX_LENGTH} characters`;
    }
    return null;
  },
};

/**
 * Validate time log form
 */
export function validateTimeLogForm(formData: {
  serviceId: string;
  hours: string;
  date: string;
  description: string;
  workType: string;
}): TimeLogFormErrors {
  const errors: TimeLogFormErrors = {};

  const serviceIdError = timeLogValidation.serviceId(formData.serviceId);
  if (serviceIdError) errors.serviceId = serviceIdError;

  const hoursError = timeLogValidation.hours(formData.hours);
  if (hoursError) errors.hours = hoursError;

  const dateError = timeLogValidation.date(formData.date);
  if (dateError) errors.date = dateError;

  const descriptionError = timeLogValidation.description(formData.description);
  if (descriptionError) errors.description = descriptionError;

  const workTypeError = timeLogValidation.workType(formData.workType);
  if (workTypeError) errors.workType = workTypeError;

  return errors;
}

/**
 * Format hours for display (e.g., "2.5 hrs" or "1 hr")
 */
export function formatHours(hours: number): string {
  if (hours === 1) {
    return '1 hr';
  }
  return `${hours.toFixed(1)} hrs`;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Get date range for the current week (Monday to Sunday)
 */
export function getCurrentWeekRange(): { fromDate: string; toDate: string } {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...

  // Calculate Monday of current week
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);

  // Calculate Sunday of current week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    fromDate: monday.toISOString().split('T')[0],
    toDate: sunday.toISOString().split('T')[0],
  };
}

/**
 * Get date range for the current month
 */
export function getCurrentMonthRange(): { fromDate: string; toDate: string } {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return {
    fromDate: firstDay.toISOString().split('T')[0],
    toDate: lastDay.toISOString().split('T')[0],
  };
}
