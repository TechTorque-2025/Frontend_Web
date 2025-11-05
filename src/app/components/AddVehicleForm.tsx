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
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to add vehicle';
      setError(errorMessage);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-4xl font-black mb-2 theme-text-primary">Add New Vehicle</h2>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="theme-form-group">
          <label className="block text-sm font-semibold theme-text-secondary mb-2">Make *</label>
          <input
            type="text"
            name="make"
            value={formData.make}
            onChange={handleChange}
            required
            className="theme-input w-full"
            placeholder="e.g., Toyota"
          />
        </div>

        <div className="theme-form-group">
          <label className="block text-sm font-semibold theme-text-secondary mb-2">Model *</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            className="theme-input w-full"
            placeholder="e.g., Camry"
          />
        </div>

        <div className="theme-form-group">
          <label className="block text-sm font-semibold theme-text-secondary mb-2">Year *</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            min="1900"
            max="2100"
            className="theme-input w-full"
          />
        </div>

        <div className="theme-form-group">
          <label className="block text-sm font-semibold theme-text-secondary mb-2">VIN *</label>
          <input
            type="text"
            name="vin"
            value={formData.vin}
            onChange={handleChange}
            required
            maxLength={17}
            pattern="[A-HJ-NPR-Z0-9]{17}"
            className="theme-input w-full"
            placeholder="17 characters (no I, O, Q)"
          />
        </div>

        <div className="theme-form-group">
          <label className="block text-sm font-semibold theme-text-secondary mb-2">License Plate *</label>
          <input
            type="text"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleChange}
            required
            className="theme-input w-full"
            placeholder="e.g., ABC-1234"
          />
        </div>

        <div className="theme-form-group">
          <label className="block text-sm font-semibold theme-text-secondary mb-2">Color</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="theme-input w-full"
            placeholder="e.g., Blue"
          />
        </div>

        <div className="theme-form-group">
          <label className="block text-sm font-semibold theme-text-secondary mb-2">Mileage</label>
          <input
            type="number"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            min="0"
            className="theme-input w-full"
            placeholder="e.g., 50000"
          />
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={onCancel}
          className="theme-button-secondary w-full text-lg font-semibold py-4 rounded-xl flex items-center justify-center"
          disabled={loading}
        >
          Cancel
        </button>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="theme-button-primary w-full text-lg font-semibold py-4 rounded-xl flex items-center justify-center disabled:opacity-60"
        >
          {loading ? 'Adding...' : 'Add Vehicle'}
        </button>
      </div>
    </form>
  );
}
