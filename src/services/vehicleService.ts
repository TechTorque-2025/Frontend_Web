"use client";
import api from '../lib/apiClient';
import type {
  Vehicle,
  VehicleListItem,
  VehicleRequest,
  VehicleUpdateRequest,
  VehicleResponse,
  PhotoUploadResponse,
  ServiceHistory,
} from '../types/vehicle';

export const vehicleService = {
  /**
   * Register a new vehicle
   */
  async registerVehicle(payload: VehicleRequest): Promise<VehicleResponse> {
    const res = await api.post('/vehicles', payload);
    return res.data;
  },

  /**
   * Get all vehicles for the current customer
   */
  async getMyVehicles(): Promise<VehicleListItem[]> {
    const res = await api.get('/vehicles');
    return res.data;
  },

  /**
   * Get details of a specific vehicle
   */
  async getVehicleById(vehicleId: string): Promise<Vehicle> {
    const res = await api.get(`/vehicles/${vehicleId}`);
    return res.data;
  },

  /**
   * Update vehicle information
   */
  async updateVehicle(
    vehicleId: string,
    payload: VehicleUpdateRequest
  ): Promise<VehicleResponse> {
    const res = await api.put(`/vehicles/${vehicleId}`, payload);
    return res.data;
  },

  /**
   * Delete a vehicle
   */
  async deleteVehicle(vehicleId: string): Promise<VehicleResponse> {
    const res = await api.delete(`/vehicles/${vehicleId}`);
    return res.data;
  },

  /**
   * Upload photos for a vehicle
   */
  async uploadVehiclePhotos(
    vehicleId: string,
    files: File[]
  ): Promise<PhotoUploadResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const res = await api.post(`/vehicles/${vehicleId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  /**
   * Get service history for a vehicle
   */
  async getServiceHistory(vehicleId: string): Promise<ServiceHistory[]> {
    const res = await api.get(`/vehicles/${vehicleId}/history`);
    return res.data;
  },
};

