'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { SystemConfigurationResponse } from '@/types/admin';

export default function ConfigPage() {
  const [configs, setConfigs] = useState<SystemConfigurationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllConfigs();
      setConfigs(data);
    } catch (err) {
      console.error('Failed to load configs:', err);
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

  if (loading) {
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
              {categoryConfigs.map((config) => (
                <div key={config.key} className="pb-4 border-b border-gray-200 dark:border-gray-800 last:border-0 last:pb-0">
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
