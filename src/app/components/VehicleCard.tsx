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
    <div className="automotive-card p-6 hover:scale-[1.02] hover:shadow-lg transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold theme-text-primary mb-1">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          <p className="theme-text-muted text-sm">License: {vehicle.licensePlate}</p>
        </div>
        {vehicle.color && (
          <span className="px-3 py-1 theme-alert-info text-sm rounded-full font-medium">
            {vehicle.color}
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4 py-3 automotive-border-t">
        <div className="flex justify-between text-sm">
          <span className="theme-text-muted">Mileage:</span>
          <span className="font-semibold theme-text-primary">{(vehicle.mileage ?? 0).toLocaleString()} miles</span>
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
          className="px-4 py-2.5 border automotive-border theme-text-danger hover:theme-bg-hover transition-colors font-medium rounded-xl"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
