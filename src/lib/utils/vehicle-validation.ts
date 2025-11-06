/**
 * Vehicle Form Validation Utilities
 * Matches backend validation requirements
 */

import { VehicleFormErrors, VEHICLE_VALIDATION } from '@/types/vehicle.types';

export const vehicleValidation = {
  /**
   * Validate vehicle make
   */
  make: (value: string): string | null => {
    if (!value.trim()) {
      return 'Make is required';
    }
    if (value.length < VEHICLE_VALIDATION.MAKE.MIN_LENGTH) {
      return `Make must be at least ${VEHICLE_VALIDATION.MAKE.MIN_LENGTH} characters`;
    }
    if (value.length > VEHICLE_VALIDATION.MAKE.MAX_LENGTH) {
      return `Make must be less than ${VEHICLE_VALIDATION.MAKE.MAX_LENGTH} characters`;
    }
    return null;
  },

  /**
   * Validate vehicle model
   */
  model: (value: string): string | null => {
    if (!value.trim()) {
      return 'Model is required';
    }
    if (value.length < VEHICLE_VALIDATION.MODEL.MIN_LENGTH) {
      return `Model must be at least ${VEHICLE_VALIDATION.MODEL.MIN_LENGTH} character`;
    }
    if (value.length > VEHICLE_VALIDATION.MODEL.MAX_LENGTH) {
      return `Model must be less than ${VEHICLE_VALIDATION.MODEL.MAX_LENGTH} characters`;
    }
    return null;
  },

  /**
   * Validate vehicle year
   */
  year: (value: string): string | null => {
    if (!value) {
      return 'Year is required';
    }
    const yearNum = parseInt(value, 10);
    if (isNaN(yearNum)) {
      return 'Year must be a valid number';
    }
    if (yearNum < VEHICLE_VALIDATION.YEAR.MIN) {
      return `Year must be after ${VEHICLE_VALIDATION.YEAR.MIN}`;
    }
    if (yearNum > VEHICLE_VALIDATION.YEAR.MAX) {
      return `Year cannot be in the future`;
    }
    return null;
  },

  /**
   * Validate VIN (Vehicle Identification Number)
   * Pattern: ^[A-HJ-NPR-Z0-9]{17}$
   * Excludes: I, O, Q (to avoid confusion with 1, 0)
   */
  vin: (value: string): string | null => {
    if (!value.trim()) {
      return 'VIN is required';
    }
    const cleanVin = value.trim().toUpperCase();
    if (cleanVin.length !== VEHICLE_VALIDATION.VIN.LENGTH) {
      return `VIN must be exactly ${VEHICLE_VALIDATION.VIN.LENGTH} characters`;
    }
    if (!VEHICLE_VALIDATION.VIN.PATTERN.test(cleanVin)) {
      return 'VIN contains invalid characters (no I, O, or Q allowed)';
    }
    return null;
  },

  /**
   * Validate license plate
   */
  licensePlate: (value: string): string | null => {
    if (!value.trim()) {
      return 'License plate is required';
    }
    if (value.length < VEHICLE_VALIDATION.LICENSE_PLATE.MIN_LENGTH) {
      return `License plate must be at least ${VEHICLE_VALIDATION.LICENSE_PLATE.MIN_LENGTH} characters`;
    }
    if (value.length > VEHICLE_VALIDATION.LICENSE_PLATE.MAX_LENGTH) {
      return `License plate must be less than ${VEHICLE_VALIDATION.LICENSE_PLATE.MAX_LENGTH} characters`;
    }
    return null;
  },

  /**
   * Validate color (optional)
   */
  color: (value: string): string | null => {
    if (value && value.length > VEHICLE_VALIDATION.COLOR.MAX_LENGTH) {
      return `Color must be less than ${VEHICLE_VALIDATION.COLOR.MAX_LENGTH} characters`;
    }
    return null;
  },

  /**
   * Validate mileage (optional)
   */
  mileage: (value: string): string | null => {
    if (!value) {
      return null; // Optional field
    }
    const mileageNum = parseInt(value, 10);
    if (isNaN(mileageNum)) {
      return 'Mileage must be a valid number';
    }
    if (mileageNum < VEHICLE_VALIDATION.MILEAGE.MIN) {
      return 'Mileage cannot be negative';
    }
    if (mileageNum > VEHICLE_VALIDATION.MILEAGE.MAX) {
      return `Mileage cannot exceed ${VEHICLE_VALIDATION.MILEAGE.MAX.toLocaleString()}`;
    }
    return null;
  },
};

/**
 * Validate entire vehicle form
 */
export function validateVehicleForm(formData: {
  make: string;
  model: string;
  year: string;
  vin: string;
  licensePlate: string;
  color: string;
  mileage: string;
}): VehicleFormErrors {
  const errors: VehicleFormErrors = {};

  const makeError = vehicleValidation.make(formData.make);
  if (makeError) errors.make = makeError;

  const modelError = vehicleValidation.model(formData.model);
  if (modelError) errors.model = modelError;

  const yearError = vehicleValidation.year(formData.year);
  if (yearError) errors.year = yearError;

  const vinError = vehicleValidation.vin(formData.vin);
  if (vinError) errors.vin = vinError;

  const licensePlateError = vehicleValidation.licensePlate(formData.licensePlate);
  if (licensePlateError) errors.licensePlate = licensePlateError;

  const colorError = vehicleValidation.color(formData.color);
  if (colorError) errors.color = colorError;

  const mileageError = vehicleValidation.mileage(formData.mileage);
  if (mileageError) errors.mileage = mileageError;

  return errors;
}

/**
 * Validate vehicle update form (all fields optional)
 */
export function validateVehicleUpdateForm(formData: {
  licensePlate?: string;
  color?: string;
  mileage?: string;
}): VehicleFormErrors {
  const errors: VehicleFormErrors = {};

  if (formData.licensePlate) {
    const licensePlateError = vehicleValidation.licensePlate(formData.licensePlate);
    if (licensePlateError) errors.licensePlate = licensePlateError;
  }

  if (formData.color) {
    const colorError = vehicleValidation.color(formData.color);
    if (colorError) errors.color = colorError;
  }

  if (formData.mileage) {
    const mileageError = vehicleValidation.mileage(formData.mileage);
    if (mileageError) errors.mileage = mileageError;
  }

  return errors;
}
