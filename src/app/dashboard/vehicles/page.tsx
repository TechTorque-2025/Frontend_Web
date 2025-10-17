"use client";
import { useState, useEffect } from 'react';
import { vehicleService } from '@/services/vehicleService';
import VehicleCard from '@/app/components/VehicleCard';
import AddVehicleForm from '@/app/components/AddVehicleForm';
import EditVehicleForm from '@/app/components/EditVehicleForm';
import type { VehicleListItem } from '@/types/vehicle';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleListItem | null>(null);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getMyVehicles();
      setVehicles(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleDelete = async (vehicleId: string) => {
    try {
      await vehicleService.deleteVehicle(vehicleId);
      await loadVehicles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    loadVehicles();
  };

  const handleEditSuccess = () => {
    setEditingVehicle(null);
    loadVehicles();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen theme-bg-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 theme-bg-primary min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold theme-text-primary mb-2">My Vehicles</h1>
          <p className="theme-text-muted">Manage your registered vehicles</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="theme-button-primary px-6 py-3 rounded-xl font-semibold"
        >
          + Add Vehicle
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="automotive-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <AddVehicleForm
              onSuccess={handleAddSuccess}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {editingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="automotive-card p-8 max-w-md w-full">
            <EditVehicleForm
              vehicleId={editingVehicle.vehicleId}
              initialData={{
                color: editingVehicle.color,
                mileage: editingVehicle.mileage,
                licensePlate: editingVehicle.licensePlate,
              }}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingVehicle(null)}
            />
          </div>
        </div>
      )}

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <div className="text-center py-16 automotive-card">
          <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">🚗</div>
          <h3 className="text-xl font-semibold theme-text-primary mb-2">No vehicles yet</h3>
          <p className="theme-text-muted mb-6">Get started by adding your first vehicle</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="theme-button-primary px-8 py-3 rounded-xl font-semibold"
          >
            Add Your First Vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.vehicleId}
              vehicle={vehicle}
              onDelete={handleDelete}
              onEdit={setEditingVehicle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
