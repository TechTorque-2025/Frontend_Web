'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { ServiceTypeResponse } from '@/types/admin';
import { useDashboard } from '@/app/contexts/DashboardContext';

export default function ServiceTypesPage() {
  const { roles, loading: rolesLoading } = useDashboard();
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServiceTypes();
  }, []);

  const loadServiceTypes = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllServiceTypes();
      // Ensure data is an array
      setServiceTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load service types:', err);
      setServiceTypes([]); // Set empty array on error
    } finally {
      setLoading(false);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold theme-text-primary mb-2">Service Types</h1>
        <p className="theme-text-muted">Manage available service types and pricing</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {serviceTypes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-lg theme-text-muted">No service types found</p>
          </div>
        ) : (
          serviceTypes.map((serviceType) => (
            <div key={serviceType.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold theme-text-primary">{serviceType.name}</h3>
                {serviceType.active ? (
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-sm theme-text-secondary mb-4">{serviceType.description}</p>
              <div className="space-y-2">
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}
