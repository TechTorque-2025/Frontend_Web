/**
 * Appointment Form Validation Utilities
 * Matches backend validation requirements
 */

import { AppointmentFormErrors, APPOINTMENT_VALIDATION } from '@/types/appointment.types';

export const appointmentValidation = {
  /**
   * Validate vehicle ID
   */
  vehicleId: (value: string): string | null => {
    if (!value || !value.trim()) {
      return 'Vehicle is required';
    }
    if (value.length < APPOINTMENT_VALIDATION.VEHICLE_ID.MIN_LENGTH) {
      return 'Invalid vehicle selection';
    }
    return null;
  },

  /**
   * Validate service type
   */
  serviceType: (value: string): string | null => {
    if (!value || !value.trim()) {
      return 'Service type is required';
    }
    if (value.length < APPOINTMENT_VALIDATION.SERVICE_TYPE.MIN_LENGTH) {
      return `Service type must be at least ${APPOINTMENT_VALIDATION.SERVICE_TYPE.MIN_LENGTH} characters`;
    }
    if (value.length > APPOINTMENT_VALIDATION.SERVICE_TYPE.MAX_LENGTH) {
      return `Service type must be less than ${APPOINTMENT_VALIDATION.SERVICE_TYPE.MAX_LENGTH} characters`;
    }
    return null;
  },

  /**
   * Validate requested date
   */
  requestedDate: (value: string): string | null => {
    if (!value) {
      return 'Date is required';
    }
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return 'Cannot book appointments in the past';
    }
    return null;
  },

  /**
   * Validate requested time
   */
  requestedTime: (value: string): string | null => {
    if (!value) {
      return 'Time is required';
    }
    // Basic time format validation (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) {
      return 'Invalid time format (HH:MM)';
    }
    return null;
  },

  /**
   * Validate special instructions (optional)
   */
  specialInstructions: (value: string): string | null => {
    if (value && value.length > APPOINTMENT_VALIDATION.SPECIAL_INSTRUCTIONS.MAX_LENGTH) {
      return `Instructions must be less than ${APPOINTMENT_VALIDATION.SPECIAL_INSTRUCTIONS.MAX_LENGTH} characters`;
    }
    return null;
  },

  /**
   * Validate date and time together
   */
  dateTime: (date: string, time: string): string | null => {
    if (!date || !time) {
      return null; // Individual validations will catch this
    }

    const dateTimeString = `${date}T${time}:00`;
    const selectedDateTime = new Date(dateTimeString);
    const now = new Date();

    if (selectedDateTime <= now) {
      return 'Appointment must be scheduled for a future time';
    }

    // Check if it's within business hours (8 AM - 6 PM)
    const hours = selectedDateTime.getHours();
    if (hours < 8 || hours >= 18) {
      return 'Appointments must be between 8:00 AM and 6:00 PM';
    }

    return null;
  },
};

/**
 * Validate entire appointment form
 */
export function validateAppointmentForm(formData: {
  vehicleId: string;
  serviceType: string;
  requestedDate: string;
  requestedTime: string;
  specialInstructions: string;
}): AppointmentFormErrors {
  const errors: AppointmentFormErrors = {};

  const vehicleIdError = appointmentValidation.vehicleId(formData.vehicleId);
  if (vehicleIdError) errors.vehicleId = vehicleIdError;

  const serviceTypeError = appointmentValidation.serviceType(formData.serviceType);
  if (serviceTypeError) errors.serviceType = serviceTypeError;

  const dateError = appointmentValidation.requestedDate(formData.requestedDate);
  if (dateError) errors.requestedDate = dateError;

  const timeError = appointmentValidation.requestedTime(formData.requestedTime);
  if (timeError) errors.requestedTime = timeError;

  const instructionsError = appointmentValidation.specialInstructions(formData.specialInstructions);
  if (instructionsError) errors.specialInstructions = instructionsError;

  // Combined date/time validation
  if (!dateError && !timeError) {
    const dateTimeError = appointmentValidation.dateTime(formData.requestedDate, formData.requestedTime);
    if (dateTimeError) errors.requestedDateTime = dateTimeError;
  }

  return errors;
}

/**
 * Validate appointment update form (all fields optional)
 */
export function validateAppointmentUpdateForm(formData: {
  requestedDate?: string;
  requestedTime?: string;
  specialInstructions?: string;
}): AppointmentFormErrors {
  const errors: AppointmentFormErrors = {};

  if (formData.requestedDate) {
    const dateError = appointmentValidation.requestedDate(formData.requestedDate);
    if (dateError) errors.requestedDate = dateError;
  }

  if (formData.requestedTime) {
    const timeError = appointmentValidation.requestedTime(formData.requestedTime);
    if (timeError) errors.requestedTime = timeError;
  }

  if (formData.specialInstructions) {
    const instructionsError = appointmentValidation.specialInstructions(formData.specialInstructions);
    if (instructionsError) errors.specialInstructions = instructionsError;
  }

  // Combined date/time validation if both present
  if (formData.requestedDate && formData.requestedTime) {
    const dateTimeError = appointmentValidation.dateTime(formData.requestedDate, formData.requestedTime);
    if (dateTimeError) errors.requestedDateTime = dateTimeError;
  }

  return errors;
}

/**
 * Format date for display
 */
export function formatAppointmentDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time for display
 */
export function formatAppointmentTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Combine date and time into ISO 8601 format
 */
export function combineDateTime(date: string, time: string): string {
  return `${date}T${time}:00`;
}
