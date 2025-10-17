"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { vehicleService } from '@/services/vehicleService';
import type { Vehicle, ServiceHistory } from '@/types/vehicle';

export default function VehicleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.vehicleId as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  useEffect(() => {
    loadVehicleDetails();
    loadServiceHistory();
  }, [vehicleId]);

  const loadVehicleDetails = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getVehicleById(vehicleId);
      setVehicle(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load vehicle details');
    } finally {
      setLoading(false);
    }
  };

  const loadServiceHistory = async () => {
    try {
      const data = await vehicleService.getServiceHistory(vehicleId);
      setServiceHistory(data);
    } catch (err: any) {
      console.error('Failed to load service history:', err);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);
    try {
      const fileArray = Array.from(files);
      await vehicleService.uploadVehiclePhotos(vehicleId, fileArray);
      alert('Photos uploaded successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload photos');
    } finally {
      setUploadingPhotos(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen theme-bg-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="container mx-auto px-4 py-8 theme-bg-primary min-h-screen">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error || 'Vehicle not found'}
        </div>
        <button
          onClick={() => router.push('/dashboard/vehicles')}
          className="mt-4 theme-button-primary px-6 py-3 rounded-xl font-medium"
        >
          Back to Vehicles
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 theme-bg-primary min-h-screen">
      <button
        onClick={() => router.push('/dashboard/vehicles')}
        className="mb-6 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 font-medium"
      >
        ← Back to Vehicles
      </button>

      <div className="automotive-card p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold theme-text-primary mb-2">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            <p className="theme-text-muted">VIN: {vehicle.vin}</p>
          </div>
          {vehicle.color && (
            <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800 font-medium">
              {vehicle.color}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium theme-text-muted mb-1">License Plate</h3>
            <p className="text-lg font-semibold theme-text-primary">{vehicle.licensePlate}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium theme-text-muted mb-1">Mileage</h3>
            <p className="text-lg font-semibold theme-text-primary">{vehicle.mileage.toLocaleString()} miles</p>
          </div>
          <div>
            <h3 className="text-sm font-medium theme-text-muted mb-1">Registered</h3>
            <p className="text-lg theme-text-secondary">
              {new Date(vehicle.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium theme-text-muted mb-1">Last Updated</h3>
            <p className="text-lg theme-text-secondary">
              {new Date(vehicle.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Photo Upload Section */}
      <div className="automotive-card p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 theme-text-primary">Vehicle Photos</h2>
        <div className="border-2 border-dashed automotive-border rounded-xl p-8 text-center theme-bg-secondary hover:border-blue-400 transition-colors">
          <input
            type="file"
            id="photo-upload"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
            disabled={uploadingPhotos}
          />
          <label
            htmlFor="photo-upload"
            className={`cursor-pointer block ${uploadingPhotos ? 'opacity-50' : ''}`}
          >
            <div className="theme-text-muted text-4xl mb-3">📷</div>
            <p className="theme-text-secondary mb-2 font-medium">
              {uploadingPhotos ? 'Uploading...' : 'Click to upload vehicle photos'}
            </p>
            <p className="text-sm theme-text-muted">
              PNG, JPG up to 10MB (Max 50MB total)
            </p>
          </label>
        </div>
      </div>

      {/* Service History Section */}
      <div className="automotive-card p-6">
        <h2 className="text-xl font-bold mb-4 theme-text-primary">Service History</h2>
        {serviceHistory.length === 0 ? (
          <div className="text-center py-8 theme-text-muted">
            <p className="font-medium">No service history available</p>
            <p className="text-sm mt-2">Service records will appear here once completed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {serviceHistory.map((service) => (
              <div
                key={service.serviceId}
                className="automotive-border rounded-xl p-4 theme-bg-secondary hover:theme-bg-tertiary transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg theme-text-primary">{service.type}</h3>
                    <p className="text-sm theme-text-muted">
                      {new Date(service.date).toLocaleDateString()}
                    </p>
                    {service.description && (
                      <p className="text-sm theme-text-secondary mt-2">{service.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      ${service.cost.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
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
  createdAt: string;
  updatedAt: string;
}

export interface VehicleListItem {
  vehicleId: string;
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
