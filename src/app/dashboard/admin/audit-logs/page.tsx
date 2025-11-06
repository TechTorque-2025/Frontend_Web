'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { AuditLogResponse } from '@/types/admin';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAuditLogs();
      // Ensure data is an array
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setLogs([]); // Set empty array on error
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold theme-text-primary mb-2">Audit Logs</h1>
        <p className="theme-text-muted">System activity and audit trail</p>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm theme-text-muted">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.logId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-secondary">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-primary font-medium">
                      {log.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm theme-text-secondary">
                      <div>
                        <p className="font-medium">{log.entityType}</p>
                        {log.entityId && <p className="text-xs theme-text-muted">{log.entityId}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm theme-text-muted">
                      {log.ipAddress || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
