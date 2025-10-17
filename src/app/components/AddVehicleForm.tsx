"use client";
import { useState } from 'react';
import { vehicleService } from '@/services/vehicleService';
import type { VehicleRequest } from '@/types/vehicle';

interface AddVehicleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddVehicleForm({ onSuccess, onCancel }: AddVehicleFormProps) {
  const [formData, setFormData] = useState<VehicleRequest>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    licensePlate: '',
    color: '',
    mileage: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await vehicleService.registerVehicle(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'year' || name === 'mileage' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4 theme-text-primary">Add New Vehicle</h2>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 theme-text-secondary">Make *</label>
          <input
            type="text"
            name="make"
            value={formData.make}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all theme-bg-primary theme-text-primary automotive-border"
            placeholder="e.g., Toyota"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 theme-text-secondary">Model *</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all theme-bg-primary theme-text-primary automotive-border"
            placeholder="e.g., Camry"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 theme-text-secondary">Year *</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            min="1900"
            max="2100"
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all theme-bg-primary theme-text-primary automotive-border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 theme-text-secondary">VIN *</label>
          <input
            type="text"
            name="vin"
            value={formData.vin}
            onChange={handleChange}
            required
            maxLength={17}
            pattern="[A-HJ-NPR-Z0-9]{17}"
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all theme-bg-primary theme-text-primary automotive-border"
            placeholder="17 characters (no I, O, Q)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 theme-text-secondary">License Plate *</label>
          <input
            type="text"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-all theme-bg-primary theme-text-primary automotive-border"
            placeholder="e.g., ABC-1234"
          />
        </div>

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
          {loading ? 'Adding...' : 'Add Vehicle'}
        </button>
      </div>
    </form>
  );
}
