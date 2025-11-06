'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/lib/api/admin.service';
import { ServiceTypeDto, ServiceTypeFormData, SERVICE_CATEGORIES } from '@/types/admin.types';
import { adminValidation, adminHelpers } from '@/lib/utils/admin-validation';

/**
 * ServicesConfigTab Component
 * Admin-only service type configuration
 */
export default function ServicesConfigTab() {
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceTypeDto | null>(null);

  // Form state
  const [formData, setFormData] = useState<ServiceTypeFormData>({
    name: '',
    description: '',
    price: 0,
    defaultDurationMinutes: 60,
    category: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  const fetchServiceTypes = async () => {
    try {
      setLoading(true);
      const response = await adminService.serviceTypes.listServiceTypes();
      if (response.success && response.data) {
        setServiceTypes(response.data);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load service types');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      defaultDurationMinutes: 60,
      category: '',
    });
    setFormErrors({});
  };

  const handleAddService = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditService = (service: ServiceTypeDto) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price,
      defaultDurationMinutes: service.defaultDurationMinutes,
      category: service.category || '',
    });
    setShowEditModal(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = adminValidation.validateServiceType(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      const response = await adminService.serviceTypes.addServiceType(formData);
      if (response.success) {
        await fetchServiceTypes();
        setShowAddModal(false);
        resetForm();
      }
    } catch (err) {
      setFormErrors({ submit: 'Failed to add service type' });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService?.id) return;

    const errors = adminValidation.validateServiceType(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      const response = await adminService.serviceTypes.updateServiceType(
        selectedService.id,
        formData
      );
      if (response.success) {
        await fetchServiceTypes();
        setShowEditModal(false);
        resetForm();
      }
    } catch (err) {
      setFormErrors({ submit: 'Failed to update service type' });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteService = async (typeId: string) => {
    if (!confirm('Are you sure you want to delete this service type?')) return;

    try {
      setSubmitting(true);
      const response = await adminService.serviceTypes.removeServiceType(typeId);
      if (response.success) {
        await fetchServiceTypes();
      }
    } catch (err) {
      alert('Failed to delete service type');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="theme-text-secondary">Loading service types...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold theme-text-primary">Service Configuration</h2>
        <button onClick={handleAddService} className="theme-button-primary">
          + Add Service Type
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Service Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {serviceTypes.length === 0 ? (
          <div className="col-span-full text-center py-12 theme-text-secondary">
            No service types configured
          </div>
        ) : (
          serviceTypes.map((service) => (
            <div key={service.id} className="theme-card">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold theme-text-primary">{service.name}</h3>
                {service.category && (
                  <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    {service.category}
                  </span>
                )}
              </div>
              <p className="theme-text-secondary text-sm mb-3">
                {service.description || 'No description'}
              </p>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-xs theme-text-secondary">Price</p>
                  <p className="font-semibold theme-text-primary">
                    {adminHelpers.formatCurrency(service.price)}
                  </p>
                </div>
                <div>
                  <p className="text-xs theme-text-secondary">Duration</p>
                  <p className="font-semibold theme-text-primary">
                    {adminHelpers.formatDuration(service.defaultDurationMinutes)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditService(service)}
                  className="flex-1 px-3 py-1 text-sm theme-button-secondary"
                >
                  Edit
                </button>
                <button
                  onClick={() => service.id && handleDeleteService(service.id)}
                  className="flex-1 px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 rounded-lg"
                  disabled={submitting}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-card max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold theme-text-primary mb-4">Add Service Type</h3>
            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div>
                <label className="block theme-text-primary mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full theme-input"
                  required
                />
                {formErrors.name && <p className="theme-error">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block theme-text-primary mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full theme-input"
                >
                  <option value="">Select Category</option>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block theme-text-primary mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full theme-input"
                  rows={3}
                />
                {formErrors.description && <p className="theme-error">{formErrors.description}</p>}
              </div>

              <div>
                <label className="block theme-text-primary mb-1">Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full theme-input"
                  required
                />
                {formErrors.price && <p className="theme-error">{formErrors.price}</p>}
              </div>

              <div>
                <label className="block theme-text-primary mb-1">Duration (minutes) *</label>
                <input
                  type="number"
                  value={formData.defaultDurationMinutes}
                  onChange={(e) => setFormData({ ...formData, defaultDurationMinutes: parseInt(e.target.value) })}
                  className="w-full theme-input"
                  required
                />
                {formErrors.defaultDurationMinutes && <p className="theme-error">{formErrors.defaultDurationMinutes}</p>}
              </div>

              {formErrors.submit && <p className="theme-error">{formErrors.submit}</p>}

              <div className="flex gap-2">
                <button type="submit" disabled={submitting} className="flex-1 theme-button-primary">
                  {submitting ? 'Adding...' : 'Add Service'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 theme-button-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {showEditModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-card max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold theme-text-primary mb-4">Edit Service Type</h3>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block theme-text-primary mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full theme-input"
                  required
                />
                {formErrors.name && <p className="theme-error">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block theme-text-primary mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full theme-input"
                >
                  <option value="">Select Category</option>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block theme-text-primary mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full theme-input"
                  rows={3}
                />
                {formErrors.description && <p className="theme-error">{formErrors.description}</p>}
              </div>

              <div>
                <label className="block theme-text-primary mb-1">Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full theme-input"
                  required
                />
                {formErrors.price && <p className="theme-error">{formErrors.price}</p>}
              </div>

              <div>
                <label className="block theme-text-primary mb-1">Duration (minutes) *</label>
                <input
                  type="number"
                  value={formData.defaultDurationMinutes}
                  onChange={(e) => setFormData({ ...formData, defaultDurationMinutes: parseInt(e.target.value) })}
                  className="w-full theme-input"
                  required
                />
                {formErrors.defaultDurationMinutes && <p className="theme-error">{formErrors.defaultDurationMinutes}</p>}
              </div>

              {formErrors.submit && <p className="theme-error">{formErrors.submit}</p>}

              <div className="flex gap-2">
                <button type="submit" disabled={submitting} className="flex-1 theme-button-primary">
                  {submitting ? 'Updating...' : 'Update Service'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="flex-1 theme-button-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
