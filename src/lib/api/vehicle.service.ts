/**
 * Vehicle Service API
 * All endpoints for vehicle management
 */

import apiClient from './axios-config';
import {
  VehicleRequestDto,
  VehicleUpdateDto,
  VehicleDto,
  ServiceHistoryEntry,
  VehicleApiResponse,
  VehiclePhotoUploadResponse,
} from '@/types/vehicle.types';

// ============================================
// Vehicle Management Endpoints
// ============================================

export const vehicleService = {
  /**
   * GET /api/v1/vehicles
   * List all vehicles for the current customer
   */
  listCustomerVehicles: async (): Promise<VehicleDto[]> => {
    const response = await apiClient.get<VehicleApiResponse<VehicleDto[]>>('/api/v1/vehicles');
    return response.data.data || [];
  },

  /**
   * GET /api/v1/vehicles/{vehicleId}
   * Get details for a specific vehicle
   */
  getVehicleDetails: async (vehicleId: string): Promise<VehicleDto> => {
    const response = await apiClient.get<VehicleApiResponse<VehicleDto>>(`/api/v1/vehicles/${vehicleId}`);
    if (!response.data.data) {
      throw new Error('Vehicle not found');
    }
    return response.data.data;
  },

  /**
   * POST /api/v1/vehicles
   * Register a new vehicle for the current customer
   */
  registerNewVehicle: async (vehicleData: VehicleRequestDto): Promise<VehicleDto> => {
    const response = await apiClient.post<VehicleApiResponse<VehicleDto>>('/api/v1/vehicles', vehicleData);
    if (!response.data.data) {
      throw new Error('Failed to register vehicle');
    }
    return response.data.data;
  },

  /**
   * PUT /api/v1/vehicles/{vehicleId}
   * Update information for a specific vehicle
   */
  updateVehicleInfo: async (vehicleId: string, updateData: VehicleUpdateDto): Promise<VehicleDto> => {
    const response = await apiClient.put<VehicleApiResponse<VehicleDto>>(
      `/api/v1/vehicles/${vehicleId}`,
      updateData
    );
    if (!response.data.data) {
      throw new Error('Failed to update vehicle');
    }
    return response.data.data;
  },

  /**
   * DELETE /api/v1/vehicles/{vehicleId}
   * Remove a vehicle for the current customer
   */
  removeVehicle: async (vehicleId: string): Promise<void> => {
    await apiClient.delete<VehicleApiResponse<void>>(`/api/v1/vehicles/${vehicleId}`);
  },

  /**
   * GET /api/v1/vehicles/{vehicleId}/history
   * Get service history for a specific vehicle
   */
  getServiceHistory: async (vehicleId: string): Promise<ServiceHistoryEntry[]> => {
    const response = await apiClient.get<VehicleApiResponse<ServiceHistoryEntry[]>>(
      `/api/v1/vehicles/${vehicleId}/history`
    );
    return response.data.data || [];
  },

  /**
   * POST /api/v1/vehicles/{vehicleId}/photos
   * Upload photos for a vehicle
   */
  uploadVehiclePhotos: async (vehicleId: string, files: File[]): Promise<VehiclePhotoUploadResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await apiClient.post<VehicleApiResponse<VehiclePhotoUploadResponse>>(
      `/api/v1/vehicles/${vehicleId}/photos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.data.data) {
      throw new Error('Failed to upload photos');
    }
    return response.data.data;
  },
};
