'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { SystemConfigurationResponse } from '@/types/admin';
import { useDashboard } from '@/app/contexts/DashboardContext';

export default function ConfigPage() {
  const { roles, loading: rolesLoading } = useDashboard();
  const [configs, setConfigs] = useState<SystemConfigurationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllConfigs();
      // Ensure data is an array
      setConfigs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load configs:', err);
      setConfigs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const groupedConfigs = configs.reduce((acc, config) => {
    const category = config.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(config);
    return acc;
  }, {} as Record<string, SystemConfigurationResponse[]>);

  // Check if user has permission to access this page
  const hasRole = (role: string) => roles?.includes(role);
  const hasAccess = hasRole('ADMIN') || hasRole('SUPER_ADMIN');

  if (rolesLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
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
        <h1 className="text-3xl font-bold theme-text-primary mb-2">System Configuration</h1>
        <p className="theme-text-muted">Manage system settings and parameters</p>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedConfigs).map(([category, categoryConfigs]) => (
          <div key={category} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-lg font-semibold theme-text-primary">{category}</h2>
            </div>
            <div className="p-6 space-y-4">
              {categoryConfigs.map((config, index) => (
                <div key={`${category}-${config.key}-${index}`} className="pb-4 border-b border-gray-200 dark:border-gray-800 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold theme-text-primary">{config.key}</h3>
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {config.dataType}
                        </span>
                      </div>
                      {config.description && (
                        <p className="text-sm theme-text-muted mb-2">{config.description}</p>
                      )}
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm theme-text-muted">Value:</span>
                        <code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 theme-text-primary text-sm font-mono">
                          {config.value}
                        </code>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs theme-text-muted mt-2">
                    Last updated: {formatDateTime(config.updatedAt)}
                    {config.updatedBy && ` by ${config.updatedBy}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
