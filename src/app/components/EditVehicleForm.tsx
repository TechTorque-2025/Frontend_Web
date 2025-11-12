"use client";
import { useState } from 'react';
import { vehicleService } from '@/services/vehicleService';
import type { VehicleUpdateRequest } from '@/types/vehicle';

interface EditVehicleFormProps {
  vehicleId: string;
  initialData: {
    color?: string;
    mileage: number;
    licensePlate: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditVehicleForm({
  vehicleId,
  initialData,
  onSuccess,
  onCancel,
}: EditVehicleFormProps) {
  const [formData, setFormData] = useState<VehicleUpdateRequest>({
    color: initialData.color || '',
    mileage: initialData.mileage,
    licensePlate: initialData.licensePlate,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await vehicleService.updateVehicle(vehicleId, formData);
      onSuccess();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update vehicle';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'mileage' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4 theme-text-primary">
        Update Vehicle - {initialData.licensePlate}
      </h2>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 theme-text-secondary">Color</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all theme-bg-primary theme-text-primary automotive-border"
            placeholder="e.g., Blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 theme-text-secondary">Mileage</label>
          <input
            type="number"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all theme-bg-primary theme-text-primary automotive-border"
            placeholder="e.g., 50000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 theme-text-secondary">License Plate</label>
          <input
            type="text"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all theme-bg-primary theme-text-primary automotive-border opacity-60 cursor-not-allowed"
            placeholder="e.g., ABC-1234"
            disabled
            readOnly
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="theme-button-secondary px-6 py-3 font-medium rounded-xl"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="theme-button-primary px-6 py-3 font-medium rounded-xl disabled:opacity-60"
        >
          {loading ? 'Updating...' : 'Update Vehicle'}
        </button>
      </div>
    </form>
  );
}
