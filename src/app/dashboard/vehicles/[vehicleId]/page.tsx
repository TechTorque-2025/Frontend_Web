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
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push('/dashboard/vehicles')}
          className="text-sm md:text-base text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 font-medium"
        >
          ← Back to Vehicles
        </button>
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images + gallery */}
        <div className="lg:col-span-2 space-y-6">
          <div className="automotive-card p-6">
            <div className="w-full rounded-lg overflow-hidden shadow-md bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              {vehicle.photos && vehicle.photos.length > 0 ? (
                <img
                  src={vehicle.photos[0] as unknown as string}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-72 object-cover"
                />
              ) : (
                <div className="w-full h-72 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">No photo available</span>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {vehicle.photos && vehicle.photos.length > 1 && (
              <div className="mt-4 flex gap-3">
                {vehicle.photos.map((p, i) => (
                  <button key={i} className="w-24 h-16 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
                    <img src={p as unknown as string} alt={`photo-${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Photo upload CTA (small) */}
            <div className="mt-4">
              <label htmlFor="photo-upload" className={`inline-flex items-center gap-2 text-sm theme-text-secondary cursor-pointer ${uploadingPhotos ? 'opacity-60' : ''}`}>
                <input id="photo-upload" type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploadingPhotos} />
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v12m0 0l3-3m-3 3l-3-3"/></svg>
                <span>{uploadingPhotos ? 'Uploading photos...' : 'Upload photos'}</span>
              </label>
            </div>
          </div>

          {/* Service history */}
          <div className="automotive-card p-6">
            <h2 className="text-xl font-semibold theme-text-primary mb-4">Service History</h2>
            {serviceHistory.length === 0 ? (
              <div className="text-center py-12 theme-text-muted">
                <p className="font-medium">No service history available</p>
                <p className="text-sm mt-2">Service records will appear here once completed</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {serviceHistory.map((s) => (
                  <li key={s.serviceId} className="flex items-start gap-4">
                    <div className="mt-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mt-1" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold theme-text-primary">{s.type}</h3>
                        <div className="text-sm font-semibold text-green-600 dark:text-green-400">${s.cost.toFixed(2)}</div>
                      </div>
                      <div className="text-sm theme-text-muted">{new Date(s.date).toLocaleDateString()}</div>
                      {s.description && <p className="mt-2 text-sm theme-text-secondary">{s.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right: Details card */}
        <aside className="space-y-6">
          <div className="automotive-card p-6  sticky top-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold theme-text-primary">{vehicle.year} {vehicle.make} {vehicle.model}</h1>
              <p className="text-sm theme-text-muted mt-1">VIN: <span className="font-medium theme-text-secondary">{vehicle.vin}</span></p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <h4 className="text-xs theme-text-muted">License</h4>
                <div className="font-semibold theme-text-primary">{vehicle.licensePlate}</div>
              </div>
              <div>
                <h4 className="text-xs theme-text-muted">Mileage</h4>
                <div className="font-semibold theme-text-primary">{vehicle.mileage.toLocaleString()} mi</div>
              </div>
              <div>
                <h4 className="text-xs theme-text-muted">Color</h4>
                <div className="font-semibold theme-text-primary">{vehicle.color || '—'}</div>
              </div>
              <div>
                <h4 className="text-xs theme-text-muted">Registered</h4>
                <div className="font-semibold theme-text-primary">{new Date(vehicle.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            
          </div>

          {/* meta card */}
          <div className="automotive-card p-4 text-sm theme-text-muted">
            <div className="flex items-center justify-between">
              <div>Created</div>
              <div className="font-medium theme-text-primary">{new Date(vehicle.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div>Last updated</div>
              <div className="font-medium theme-text-primary">{new Date(vehicle.updatedAt).toLocaleDateString()}</div>
            </div>
          </div>
        </aside>
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
