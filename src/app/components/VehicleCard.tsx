"use client";
import Link from 'next/link';
import type { VehicleListItem } from '@/types/vehicle';

interface VehicleCardProps {
  vehicle: VehicleListItem;
  onDelete: (vehicleId: string) => void;
  onEdit: (vehicle: VehicleListItem) => void;
}

export default function VehicleCard({ vehicle, onDelete, onEdit }: VehicleCardProps) {
  return (
    <div className="automotive-card p-6 hover:scale-[1.02] transition-transform">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold theme-text-primary mb-1">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          <p className="theme-text-muted text-sm">License: {vehicle.licensePlate}</p>
        </div>
        {vehicle.color && (
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-sm rounded-full border border-blue-200 dark:border-blue-800 font-medium">
            {vehicle.color}
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4 py-3 automotive-border-t">
        <div className="flex justify-between text-sm">
          <span className="theme-text-muted">Mileage:</span>
          <span className="font-semibold theme-text-primary">{vehicle.mileage.toLocaleString()} miles</span>
        </div>
      </div>

      <div className="flex gap-2 pt-4 automotive-border-t">
        <Link
          href={`/dashboard/vehicles/${vehicle.vehicleId}`}
          className="flex-1 theme-button-primary text-center py-2.5 rounded-xl font-medium"
        >
          View Details
        </Link>
        <button
          onClick={() => onEdit(vehicle)}
          className="theme-button-secondary px-4 py-2.5 rounded-xl font-medium"
        >
          Edit
        </button>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to delete this vehicle?')) {
              onDelete(vehicle.vehicleId);
            }
          }}
          className="px-4 py-2.5 border automotive-border text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
