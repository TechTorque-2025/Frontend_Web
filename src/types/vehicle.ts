// Vehicle-related TypeScript types

export interface Vehicle {
  vehicleId: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  color?: string;
  mileage: number;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VehicleListItem {
  vehicleId: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color?: string;
  mileage: number;
}

export interface VehicleRequest {
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  color?: string;
  mileage?: number;
}

export interface VehicleUpdateRequest {
  color?: string;
  mileage?: number;
  licensePlate?: string;
}

export interface VehicleResponse {
  message: string;
  vehicleId: string;
}

export interface PhotoUploadResponse {
  photoIds: string[];
  urls: string[];
}

export interface ServiceHistory {
  serviceId: string;
  date: string;
  type: string;
  cost: number;
  description?: string;
}
