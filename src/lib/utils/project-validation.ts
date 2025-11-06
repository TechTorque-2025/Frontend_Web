/**
 * Project & Service Form Validation Utilities
 * Matches backend validation requirements
 */

import { ProjectFormErrors, PROJECT_VALIDATION } from '@/types/project.types';

export const projectValidation = {
  /**
   * Validate vehicle ID
   */
  vehicleId: (value: string): string | null => {
    if (!value || !value.trim()) {
      return 'Vehicle is required';
    }
    if (value.length < PROJECT_VALIDATION.VEHICLE_ID.MIN_LENGTH) {
      return 'Invalid vehicle selection';
    }
    return null;
  },

  /**
   * Validate project description
   */
  description: (value: string): string | null => {
    if (!value || !value.trim()) {
      return 'Description is required';
    }
    if (value.length < PROJECT_VALIDATION.DESCRIPTION.MIN_LENGTH) {
      return `Description must be at least ${PROJECT_VALIDATION.DESCRIPTION.MIN_LENGTH} characters`;
    }
    if (value.length > PROJECT_VALIDATION.DESCRIPTION.MAX_LENGTH) {
      return `Description must be less than ${PROJECT_VALIDATION.DESCRIPTION.MAX_LENGTH} characters`;
    }
    return null;
  },

  /**
   * Validate budget (optional)
   */
  budget: (value: string): string | null => {
    if (!value) {
      return null; // Optional field
    }
    const budgetNum = parseFloat(value);
    if (isNaN(budgetNum)) {
      return 'Budget must be a valid number';
    }
    if (budgetNum < PROJECT_VALIDATION.BUDGET.MIN) {
      return 'Budget cannot be negative';
    }
    return null;
  },

  /**
   * Validate quote amount
   */
  quoteAmount: (value: string): string | null => {
    if (!value) {
      return 'Quote amount is required';
    }
    const amount = parseFloat(value);
    if (isNaN(amount)) {
      return 'Quote amount must be a valid number';
    }
    if (amount < PROJECT_VALIDATION.QUOTE_AMOUNT.MIN) {
      return 'Quote amount cannot be negative';
    }
    return null;
  },

  /**
   * Validate progress percentage
   */
  progress: (value: string): string | null => {
    if (!value) {
      return 'Progress is required';
    }
    const progressNum = parseInt(value, 10);
    if (isNaN(progressNum)) {
      return 'Progress must be a valid number';
    }
    if (progressNum < PROJECT_VALIDATION.PROGRESS.MIN) {
      return 'Progress cannot be less than 0%';
    }
    if (progressNum > PROJECT_VALIDATION.PROGRESS.MAX) {
      return 'Progress cannot be more than 100%';
    }
    return null;
  },

  /**
   * Validate rejection reason (optional)
   */
  rejectionReason: (value: string): string | null => {
    if (value && value.length > PROJECT_VALIDATION.REJECTION_REASON.MAX_LENGTH) {
      return `Reason must be less than ${PROJECT_VALIDATION.REJECTION_REASON.MAX_LENGTH} characters`;
    }
    return null;
  },

  /**
   * Validate service note
   */
  serviceNote: (value: string): string | null => {
    if (!value || !value.trim()) {
      return 'Note is required';
    }
    if (value.length < PROJECT_VALIDATION.SERVICE_NOTE.MIN_LENGTH) {
      return 'Note cannot be empty';
    }
    return null;
  },
};

/**
 * Validate project request form
 */
export function validateProjectForm(formData: {
  vehicleId: string;
  description: string;
  budget: string;
}): ProjectFormErrors {
  const errors: ProjectFormErrors = {};

  const vehicleIdError = projectValidation.vehicleId(formData.vehicleId);
  if (vehicleIdError) errors.vehicleId = vehicleIdError;

  const descriptionError = projectValidation.description(formData.description);
  if (descriptionError) errors.description = descriptionError;

  const budgetError = projectValidation.budget(formData.budget);
  if (budgetError) errors.budget = budgetError;

  return errors;
}

/**
 * Validate quote form
 */
export function validateQuoteForm(formData: {
  quoteAmount: string;
  notes: string;
}): ProjectFormErrors {
  const errors: ProjectFormErrors = {};

  const quoteAmountError = projectValidation.quoteAmount(formData.quoteAmount);
  if (quoteAmountError) errors.quoteAmount = quoteAmountError;

  return errors;
}

/**
 * Validate progress form
 */
export function validateProgressForm(formData: {
  progress: string;
  notes: string;
}): ProjectFormErrors {
  const errors: ProjectFormErrors = {};

  const progressError = projectValidation.progress(formData.progress);
  if (progressError) errors.progress = progressError;

  return errors;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number | null): string {
  if (amount === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
