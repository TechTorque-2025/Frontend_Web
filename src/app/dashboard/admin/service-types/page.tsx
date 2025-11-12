'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { ServiceTypeResponse, CreateServiceTypeRequest, UpdateServiceTypeRequest } from '@/types/admin';
import { useDashboard } from '@/app/contexts/DashboardContext';

export default function ServiceTypesPage() {
  const { roles, loading: rolesLoading } = useDashboard();
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceTypeResponse | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'MAINTENANCE',
    description: '',
    price: '',
    durationMinutes: 30,
  });

  useEffect(() => {
    loadServiceTypes();
  }, []);

  const loadServiceTypes = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllServiceTypes();
      console.log('Loaded service types:', data); // Debug log
      // Ensure we always get an array and include both active and inactive services
      const services = Array.isArray(data) ? data : [];
      setServiceTypes(services);
      console.log('Set service types count:', services.length); // Debug log
    } catch (err) {
      console.error('Failed to load service types:', err);
      setServiceTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingService(null);
    setFormData({
      name: '',
      category: 'MAINTENANCE',
      description: '',
      price: '',
      durationMinutes: 30,
    });
    setShowModal(true);
  };

  const handleEdit = (service: ServiceTypeResponse) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description || '',
      price: service.basePriceLKR.toString(),
      durationMinutes: service.estimatedDurationMinutes,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingService) {
        // Update existing service - use UpdateServiceTypeRequest format
        console.log('Updating service:', editingService.id);
        const updateData: UpdateServiceTypeRequest = {
          name: formData.name,
          category: formData.category,
          description: formData.description,
          price: parseFloat(formData.price) || 0,
          durationMinutes: formData.durationMinutes,
          active: editingService.active, // Keep existing active status
        };
        await adminService.updateServiceType(editingService.id, updateData);
        alert('Service type updated successfully!');
      } else {
        // Create new service - use CreateServiceTypeRequest format
        console.log('Creating service:', formData);
        const createData: CreateServiceTypeRequest = {
          name: formData.name,
          category: formData.category,
          description: formData.description,
          price: parseFloat(formData.price) || 0,
          durationMinutes: formData.durationMinutes,
        };
        await adminService.createServiceType(createData);
        alert('Service type created successfully!');
      }
      
      // Close modal first
      setShowModal(false);
      setEditingService(null);
      
      // Then reload the list
      console.log('Reloading service types...');
      await loadServiceTypes();
      console.log('Service types reloaded');
    } catch (err) {
      console.error('Failed to save service type:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save service type. Please try again.';
      alert(errorMessage);
    }
  };

  const handleDelete = async (service: ServiceTypeResponse) => {
    if (!confirm(`Are you sure you want to delete "${service.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminService.removeServiceType(service.id);
      alert('Service type deleted successfully!');
      await loadServiceTypes();
    } catch (err) {
      console.error('Failed to delete service type:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete service type. Please try again.';
      alert(errorMessage);
    }
  };

  const handleToggleActive = async (service: ServiceTypeResponse) => {
    try {
      const newStatus = !service.active;
      console.log(`Toggling service ${service.id} from ${service.active} to ${newStatus}`);
      
      await adminService.updateServiceType(service.id, {
        name: service.name,
        category: service.category,
        description: service.description || '',
        price: service.basePriceLKR,
        durationMinutes: service.estimatedDurationMinutes,
        active: newStatus,
      });
      
      console.log('Toggle successful, reloading list...');
      await loadServiceTypes();
    } catch (err) {
      console.error('Failed to toggle service status:', err);
      alert('Failed to update service status. Please try again.');
    }
  };

  // Check if user has permission to access this page
  const hasRole = (role: string) => roles?.includes(role);
  const hasAccess = hasRole('ADMIN') || hasRole('SUPER_ADMIN');

  if (rolesLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Block access for customers and employees
  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-8 text-center">
          <svg
            className="mx-auto w-16 h-16 text-red-600 dark:text-red-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">Access Denied</h2>
          <p className="text-red-700 dark:text-red-300">
            This page is only accessible to admins and super admins.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold theme-text-primary mb-2">Service Types</h1>
          <p className="theme-text-muted">Manage available service types and pricing</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
        >
          <span className="text-xl">+</span>
          Add Service Type
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {serviceTypes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-lg theme-text-muted">No service types found. Create one to get started!</p>
          </div>
        ) : (
          serviceTypes.map((serviceType) => (
            <div 
              key={serviceType.id} 
              className={`rounded-xl border bg-white dark:bg-gray-900/50 p-6 hover:shadow-lg transition-shadow ${
                serviceType.active 
                  ? 'border-gray-200 dark:border-gray-800' 
                  : 'border-red-200 dark:border-red-900 bg-gray-50 dark:bg-gray-900/30 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold theme-text-primary">{serviceType.name}</h3>
                {serviceType.active ? (
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-sm theme-text-secondary mb-4">{serviceType.description}</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Category:</span>
                  <span className="theme-text-primary font-medium">{serviceType.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Base Price:</span>
                  <span className="theme-text-primary font-semibold">
                    LKR {(serviceType.basePriceLKR ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="theme-text-muted">Duration:</span>
                  <span className="theme-text-primary font-medium">{serviceType.estimatedDurationMinutes ?? 0} min</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleEdit(serviceType)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(serviceType)}
                  className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                    serviceType.active
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {serviceType.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(serviceType)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold theme-text-primary">
                  {editingService ? 'Edit Service Type' : 'Create Service Type'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 theme-text-primary">
                    Service Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 theme-text-primary"
                    placeholder="e.g., Oil Change"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 theme-text-primary">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 theme-text-primary"
                  >
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="REPAIR">Repair</option>
                    <option value="MODIFICATION">Modification</option>
                    <option value="INSPECTION">Inspection</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Choose the service category</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 theme-text-primary">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 theme-text-primary"
                    rows={3}
                    placeholder="Describe the service..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 theme-text-primary">
                      Base Price (LKR) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 theme-text-primary"
                      placeholder="5000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 theme-text-primary">
                      Duration (minutes) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="15"
                      max="480"
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 theme-text-primary"
                      placeholder="60"
                    />
                    <p className="text-xs text-gray-500 mt-1">Min: 15 min, Max: 8 hours (480 min)</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors theme-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {editingService ? 'Update Service' : 'Create Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
