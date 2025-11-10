'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectService } from '@/services/projectService';
import { vehicleService } from '@/services/vehicleService';
import { VehicleListItem } from '@/types/vehicle';
import { ProjectRequestDto } from '@/types/project';
import { useDashboard } from '@/app/contexts/DashboardContext';

export default function RequestProjectPage() {
  const router = useRouter();
  const { roles, loading: profileLoading, profile } = useDashboard();
  const [vehicles, setVehicles] = useState<VehicleListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchingVehicles, setFetchingVehicles] = useState(true);

  // Check if user is a customer
  const isCustomer = roles.includes('CUSTOMER');

  // Redirect non-customers to projects list
  useEffect(() => {
    if (!profileLoading && !isCustomer) {
      router.push('/dashboard/projects');
    }
  }, [isCustomer, profileLoading, router]);

  const [formData, setFormData] = useState({
    vehicleId: '',
    projectType: '',
    description: '',
    desiredCompletionDate: '',
    budget: '',
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setFetchingVehicles(true);
      const data = await vehicleService.getMyVehicles();

      // Filter to only show vehicles owned by the logged-in user
      // This ensures that even users with admin roles only see their own vehicles when requesting projects
      const userVehicles = data.filter(vehicle => vehicle.customerId === profile?.username);

      setVehicles(userVehicles);
      if (userVehicles.length > 0) {
        setFormData(prev => ({ ...prev, vehicleId: userVehicles[0].vehicleId }));
      }
    } catch (err) {
      console.error('Failed to load vehicles:', err);
      setError('Failed to load your vehicles. Please refresh the page.');
    } finally {
      setFetchingVehicles(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload: ProjectRequestDto = {
        vehicleId: formData.vehicleId,
        projectType: formData.projectType,
        description: formData.description,
      };

      if (formData.desiredCompletionDate) {
        payload.desiredCompletionDate = formData.desiredCompletionDate;
      }

      if (formData.budget && parseFloat(formData.budget) > 0) {
        payload.budget = parseFloat(formData.budget);
      }

      await projectService.requestProject(payload);
      router.push('/dashboard/projects');
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking permissions or fetching vehicles
  if (profileLoading || fetchingVehicles || !isCustomer) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold theme-text-primary mb-2">No Vehicles Found</h2>
          <p className="theme-text-muted mb-6">You need to add a vehicle before requesting a project.</p>
          <button
            onClick={() => router.push('/dashboard/vehicles/add')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Add Vehicle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold theme-text-primary mb-2">Request New Project</h1>
        <p className="theme-text-muted">Submit a project request for one of your vehicles</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 space-y-6">
          {/* Vehicle Selection */}
          <div>
            <label htmlFor="vehicleId" className="block text-sm font-semibold theme-text-primary mb-2">
              Select Vehicle <span className="text-red-500">*</span>
            </label>
            <select
              id="vehicleId"
              required
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 theme-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {vehicles.map((vehicle) => (
                <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                  {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.licensePlate}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs theme-text-muted">Choose which vehicle this project is for</p>
          </div>

          {/* Project Type */}
          <div>
            <label htmlFor="projectType" className="block text-sm font-semibold theme-text-primary mb-2">
              Project Type <span className="text-red-500">*</span>
            </label>
            <select
              id="projectType"
              required
              value={formData.projectType}
              onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 theme-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Select project type...</option>
              <option value="Engine Overhaul">Engine Overhaul</option>
              <option value="Transmission Repair">Transmission Repair</option>
              <option value="Body Work">Body Work</option>
              <option value="Paint Job">Paint Job</option>
              <option value="Custom Modification">Custom Modification</option>
              <option value="Full Restoration">Full Restoration</option>
              <option value="Performance Upgrade">Performance Upgrade</option>
              <option value="Electrical Work">Electrical Work</option>
              <option value="Suspension Upgrade">Suspension Upgrade</option>
              <option value="Other">Other</option>
            </select>
            <p className="mt-1 text-xs theme-text-muted">What type of work do you need?</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold theme-text-primary mb-2">
              Project Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the work you need done, any specific requirements, concerns about the vehicle, etc."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 theme-text-primary placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
            <p className="mt-1 text-xs theme-text-muted">Be as detailed as possible to help us provide an accurate quote</p>
          </div>

          {/* Desired Completion Date */}
          <div>
            <label htmlFor="desiredCompletionDate" className="block text-sm font-semibold theme-text-primary mb-2">
              Desired Completion Date
            </label>
            <input
              type="date"
              id="desiredCompletionDate"
              value={formData.desiredCompletionDate}
              onChange={(e) => setFormData({ ...formData, desiredCompletionDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 theme-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <p className="mt-1 text-xs theme-text-muted">Optional: When would you like this completed by?</p>
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="budget" className="block text-sm font-semibold theme-text-primary mb-2">
              Budget (LKR)
            </label>
            <input
              type="number"
              id="budget"
              min="0"
              step="0.01"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              placeholder="e.g., 50000"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 theme-text-primary placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <p className="mt-1 text-xs theme-text-muted">Optional: Your approximate budget for this project</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg font-semibold theme-text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-colors disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
