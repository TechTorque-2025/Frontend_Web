'use client';

/**
 * Vehicles Tab Component
 * Inline vehicle management for dashboard - NO separate page
 */

import { useState, useEffect, FormEvent } from 'react';
import { vehicleService } from '@/lib/api/vehicle.service';
import {
  VehicleDto,
  VehicleFormData,
  VehicleFormErrors,
  VehicleRequestDto,
  VehicleUpdateDto,
} from '@/types/vehicle.types';
import { validateVehicleForm, validateVehicleUpdateForm } from '@/lib/utils/vehicle-validation';

type ModalMode = 'add' | 'edit' | 'view' | null;

export default function VehiclesTab() {
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleDto | null>(null);

  // Form state
  const [formData, setFormData] = useState<VehicleFormData>({
    make: '',
    model: '',
    year: '',
    vin: '',
    licensePlate: '',
    color: '',
    mileage: '',
  });
  const [formErrors, setFormErrors] = useState<VehicleFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await vehicleService.listCustomerVehicles();
      setVehicles(data);
    } catch (err) {
      setError('Failed to load vehicles');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const openAddModal = () => {
    setFormData({ make: '', model: '', year: '', vin: '', licensePlate: '', color: '', mileage: '' });
    setFormErrors({});
    setApiError('');
    setModalMode('add');
  };

  const openEditModal = (vehicle: VehicleDto) => {
    setSelectedVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year.toString(),
      vin: vehicle.vin,
      licensePlate: vehicle.licensePlate,
      color: vehicle.color || '',
      mileage: vehicle.mileage?.toString() || '',
    });
    setFormErrors({});
    setApiError('');
    setModalMode('edit');
  };

  const openViewModal = (vehicle: VehicleDto) => {
    setSelectedVehicle(vehicle);
    setModalMode('view');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedVehicle(null);
    setFormData({ make: '', model: '', year: '', vin: '', licensePlate: '', color: '', mileage: '' });
    setFormErrors({});
    setApiError('');
  };

  const handleAddVehicle = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError('');

    const errors = validateVehicleForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData: VehicleRequestDto = {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year, 10),
        vin: formData.vin.toUpperCase(),
        licensePlate: formData.licensePlate,
        color: formData.color || undefined,
        mileage: formData.mileage ? parseInt(formData.mileage, 10) : undefined,
      };

      await vehicleService.registerNewVehicle(requestData);
      await fetchVehicles();
      closeModal();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to add vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateVehicle = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    setApiError('');

    const errors = validateVehicleUpdateForm({
      licensePlate: formData.licensePlate,
      color: formData.color,
      mileage: formData.mileage,
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: VehicleUpdateDto = {
        licensePlate: formData.licensePlate,
        color: formData.color || undefined,
        mileage: formData.mileage ? parseInt(formData.mileage, 10) : undefined,
      };

      await vehicleService.updateVehicleInfo(selectedVehicle.vehicleId, updateData);
      await fetchVehicles();
      closeModal();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to update vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      await vehicleService.removeVehicle(vehicleId);
      await fetchVehicles();
    } catch (err) {
      alert('Failed to delete vehicle');
      console.error(err);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold theme-text-primary">My Vehicles ({vehicles.length})</h2>
        <button onClick={openAddModal} className="theme-button-primary">
          <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Vehicle
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
          <h3 className="text-lg font-semibold theme-text-primary mb-2">No vehicles yet</h3>
          <p className="theme-text-muted mb-6">Get started by adding your first vehicle</p>
          <button onClick={openAddModal} className="theme-button-primary">Add Your First Vehicle</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <div key={vehicle.vehicleId} className="border theme-border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold theme-text-primary">{vehicle.year} {vehicle.make}</h3>
                  <p className="theme-text-secondary">{vehicle.model}</p>
                </div>
                <div className="flex space-x-1">
                  <button onClick={() => openViewModal(vehicle)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" title="View">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button onClick={() => openEditModal(vehicle)} className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded" title="Edit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDeleteVehicle(vehicle.vehicleId)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Delete">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="theme-text-muted">VIN:</span><span className="theme-text-primary font-mono text-xs">{vehicle.vin}</span></div>
                <div className="flex justify-between"><span className="theme-text-muted">Plate:</span><span className="theme-text-primary font-bold">{vehicle.licensePlate}</span></div>
                {vehicle.color && <div className="flex justify-between"><span className="theme-text-muted">Color:</span><span className="theme-text-primary">{vehicle.color}</span></div>}
                {vehicle.mileage !== null && <div className="flex justify-between"><span className="theme-text-muted">Mileage:</span><span className="theme-text-primary">{vehicle.mileage.toLocaleString()} mi</span></div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="automotive-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 theme-bg-primary border-b theme-border p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold theme-text-primary">{modalMode === 'add' ? 'Add New Vehicle' : 'Edit Vehicle'}</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={modalMode === 'add' ? handleAddVehicle : handleUpdateVehicle} className="p-6 space-y-4">
              {apiError && <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded">{apiError}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">Make <span className="text-red-500">*</span></label>
                  <input type="text" name="make" value={formData.make} onChange={handleInputChange} disabled={modalMode === 'edit'} className={`w-full px-3 py-2 border rounded-md theme-bg-primary theme-text-primary ${formErrors.make ? 'border-red-500' : 'theme-border'} ${modalMode === 'edit' ? 'opacity-50 cursor-not-allowed' : ''}`} placeholder="Toyota" />
                  {formErrors.make && <p className="mt-1 text-sm text-red-600">{formErrors.make}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">Model <span className="text-red-500">*</span></label>
                  <input type="text" name="model" value={formData.model} onChange={handleInputChange} disabled={modalMode === 'edit'} className={`w-full px-3 py-2 border rounded-md theme-bg-primary theme-text-primary ${formErrors.model ? 'border-red-500' : 'theme-border'} ${modalMode === 'edit' ? 'opacity-50 cursor-not-allowed' : ''}`} placeholder="Camry" />
                  {formErrors.model && <p className="mt-1 text-sm text-red-600">{formErrors.model}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">Year <span className="text-red-500">*</span></label>
                  <input type="number" name="year" value={formData.year} onChange={handleInputChange} disabled={modalMode === 'edit'} className={`w-full px-3 py-2 border rounded-md theme-bg-primary theme-text-primary ${formErrors.year ? 'border-red-500' : 'theme-border'} ${modalMode === 'edit' ? 'opacity-50 cursor-not-allowed' : ''}`} placeholder="2023" />
                  {formErrors.year && <p className="mt-1 text-sm text-red-600">{formErrors.year}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">VIN <span className="text-red-500">*</span></label>
                  <input type="text" name="vin" value={formData.vin} onChange={handleInputChange} disabled={modalMode === 'edit'} maxLength={17} className={`w-full px-3 py-2 border rounded-md theme-bg-primary theme-text-primary font-mono ${formErrors.vin ? 'border-red-500' : 'theme-border'} ${modalMode === 'edit' ? 'opacity-50 cursor-not-allowed' : ''}`} placeholder="1HGBH41JXMN109186" />
                  {formErrors.vin && <p className="mt-1 text-sm text-red-600">{formErrors.vin}</p>}
                  <p className="mt-1 text-xs theme-text-muted">17 chars, no I/O/Q</p>
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">License Plate <span className="text-red-500">*</span></label>
                  <input type="text" name="licensePlate" value={formData.licensePlate} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-md theme-bg-primary theme-text-primary ${formErrors.licensePlate ? 'border-red-500' : 'theme-border'}`} placeholder="ABC-1234" />
                  {formErrors.licensePlate && <p className="mt-1 text-sm text-red-600">{formErrors.licensePlate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">Color</label>
                  <input type="text" name="color" value={formData.color} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-md theme-bg-primary theme-text-primary ${formErrors.color ? 'border-red-500' : 'theme-border'}`} placeholder="Silver" />
                  {formErrors.color && <p className="mt-1 text-sm text-red-600">{formErrors.color}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">Mileage</label>
                  <input type="number" name="mileage" value={formData.mileage} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-md theme-bg-primary theme-text-primary ${formErrors.mileage ? 'border-red-500' : 'theme-border'}`} placeholder="50000" />
                  {formErrors.mileage && <p className="mt-1 text-sm text-red-600">{formErrors.mileage}</p>}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" disabled={isSubmitting} className="flex-1 theme-button-primary disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? 'Saving...' : modalMode === 'add' ? 'Add Vehicle' : 'Save Changes'}</button>
                <button type="button" onClick={closeModal} className="flex-1 theme-button-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalMode === 'view' && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="automotive-card max-w-2xl w-full">
            <div className="p-6 border-b theme-border flex justify-between items-center">
              <h3 className="text-2xl font-bold theme-text-primary">Vehicle Details</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <h4 className="text-3xl font-bold theme-text-primary">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</h4>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div><p className="text-sm theme-text-muted">VIN</p><p className="font-mono theme-text-primary">{selectedVehicle.vin}</p></div>
                <div><p className="text-sm theme-text-muted">License Plate</p><p className="font-bold theme-text-primary">{selectedVehicle.licensePlate}</p></div>
                {selectedVehicle.color && <div><p className="text-sm theme-text-muted">Color</p><p className="theme-text-primary">{selectedVehicle.color}</p></div>}
                {selectedVehicle.mileage !== null && <div><p className="text-sm theme-text-muted">Mileage</p><p className="theme-text-primary">{selectedVehicle.mileage.toLocaleString()} miles</p></div>}
                <div><p className="text-sm theme-text-muted">Registered</p><p className="theme-text-primary">{new Date(selectedVehicle.registeredAt).toLocaleDateString()}</p></div>
                <div><p className="text-sm theme-text-muted">Last Updated</p><p className="theme-text-primary">{new Date(selectedVehicle.updatedAt).toLocaleDateString()}</p></div>
              </div>
              <div className="pt-4"><button onClick={closeModal} className="w-full theme-button-primary">Close</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
