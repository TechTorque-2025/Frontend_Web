/**
 * Form Validation Utilities
 * Reusable validation functions for forms
 */

import { FormErrors } from '@/types/auth.types';

export const validation = {
  /**
   * Validate username according to backend rules
   * Pattern: ^[a-zA-Z0-9_-]+$
   * Length: 3-20 characters
   */
  username: (value: string): string | null => {
    if (!value.trim()) {
      return 'Username is required';
    }
    if (value.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (value.length > 20) {
      return 'Username must be less than 20 characters';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return 'Username can only contain letters, numbers, hyphens, and underscores';
    }
    return null;
  },

  /**
   * Validate email address
   */
  email: (value: string): string | null => {
    if (!value.trim()) {
      return 'Email is required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  /**
   * Validate password according to backend rules
   * Pattern: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$
   * Length: 8-40 characters
   */
  password: (value: string): string | null => {
    if (!value) {
      return 'Password is required';
    }
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (value.length > 40) {
      return 'Password must be less than 40 characters';
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/.test(value)) {
      return 'Password must contain uppercase, lowercase, number, and special character (@$!%*?&#)';
    }
    return null;
  },

  /**
   * Validate password confirmation
   */
  confirmPassword: (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) {
      return 'Please confirm your password';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  },

  /**
   * Check if field is required
   */
  required: (value: string, fieldName: string): string | null => {
    if (!value || !value.trim()) {
      return `${fieldName} is required`;
    }
    return null;
  },

  /**
   * Validate minimum length
   */
  minLength: (value: string, min: number, fieldName: string): string | null => {
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  /**
   * Validate maximum length
   */
  maxLength: (value: string, max: number, fieldName: string): string | null => {
    if (value.length > max) {
      return `${fieldName} must be less than ${max} characters`;
    }
    return null;
  }
};

/**
 * Collect all validation errors for a form
 */
export function collectErrors(validators: Record<string, () => string | null>): FormErrors {
  const errors: FormErrors = {};

  Object.entries(validators).forEach(([field, validator]) => {
    const error = validator();
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
}
