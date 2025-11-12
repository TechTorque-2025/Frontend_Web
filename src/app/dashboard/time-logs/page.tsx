'use client';

import { useState, useEffect } from 'react';
import { timeLoggingService } from '@/services/timeLoggingService';
import { TimeLogResponse, TimeLogRequest } from '@/types/timeLogging';
import { useDashboard } from '@/app/contexts/DashboardContext';

export default function TimeLogsPage() {
  const { roles, loading: rolesLoading, profile } = useDashboard();
  const [allTimeLogs, setAllTimeLogs] = useState<TimeLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewFilter, setViewFilter] = useState<'mine' | 'all'>('all');
  const [formData, setFormData] = useState<TimeLogRequest>({
    serviceId: '', // Required field
    hours: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    workType: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Check if user is admin
  const hasRole = (role: string) => roles?.includes(role);
  const isAdmin = hasRole('ADMIN') || hasRole('SUPER_ADMIN');

  useEffect(() => {
    loadTimeLogs();
  }, []);

  const loadTimeLogs = async () => {
    try {
      setLoading(true);
      const data = await timeLoggingService.getMyTimeLogs();
      // Backend automatically returns all logs for admins, only user's logs for employees
      const validLogs = Array.isArray(data)
        ? data.filter(log => log && log.id)
        : [];
      setAllTimeLogs(validLogs);
    } catch (err) {
      console.error('Failed to load time logs:', err);
      setAllTimeLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter logs based on view selection
  const filteredLogs = viewFilter === 'mine'
    ? allTimeLogs.filter(log => log.employeeId === profile?.username)
    : allTimeLogs;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    
    try {
      setSubmitting(true);
      await timeLoggingService.createTimeLog(formData);
      setFormData({
        serviceId: '', // Required field
        hours: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
        workType: '',
      });
      setShowForm(false);
      await loadTimeLogs();
    } catch (err) {
      console.error('Failed to log time:', err);
      alert(err instanceof Error ? err.message : 'Failed to log time');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this time log?')) return;

    try {
      await timeLoggingService.deleteTimeLog(logId);
      await loadTimeLogs();
    } catch (err) {
      console.error('Failed to delete time log:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete time log');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalHours = filteredLogs.reduce((sum, log) => sum + log.hours, 0);

  // Check if user has permission to access this page
  const hasAccess = hasRole('EMPLOYEE') || hasRole('ADMIN') || hasRole('SUPER_ADMIN');

  if (rolesLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Block access for customers
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
            This page is only accessible to employees, admins, and super admins.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold theme-text-primary mb-2">Time Logs</h1>
            <p className="theme-text-muted">Track your work hours on services and projects</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="theme-button-primary"
          >
            {showForm ? 'Cancel' : '+ Log Time'}
          </button>
        </div>

        {/* Filter Tabs - Only visible for admins */}
        {isAdmin && (
          <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setViewFilter('mine')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                viewFilter === 'mine'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent theme-text-muted hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              My Time Logs
            </button>
            <button
              onClick={() => setViewFilter('all')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                viewFilter === 'all'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent theme-text-muted hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              All Time Logs
            </button>
          </div>
        )}

        {/* Add Time Log Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6">
            <h3 className="text-lg font-semibold theme-text-primary mb-4">Log Work Hours</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="workDate" className="block text-sm font-semibold theme-text-primary mb-2">
                  Work Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="workDate"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 theme-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="hoursWorked" className="block text-sm font-semibold theme-text-primary mb-2">
                  Hours Worked <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="hoursWorked"
                  required
                  min="0.25"
                  step="0.25"
                  value={formData.hours || ''}
                  onChange={(e) => setFormData({ ...formData, hours: parseFloat(e.target.value) })}
                  placeholder="e.g., 8.5"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 theme-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="taskType" className="block text-sm font-semibold theme-text-primary mb-2">
                  Task Type
                </label>
                <select
                  id="taskType"
                  value={formData.workType}
                  onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 theme-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select type...</option>
                  <option value="Service">Service Work</option>
                  <option value="Project">Project Work</option>
                  <option value="Diagnostic">Diagnostic</option>
                  <option value="Repair">Repair</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="serviceId" className="block text-sm font-semibold theme-text-primary mb-2">
                  Service ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="serviceId"
                  required
                  value={formData.serviceId || ''}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                  placeholder="Enter service ID"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 theme-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="description" className="block text-sm font-semibold theme-text-primary mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the work performed..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 theme-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={submitting}
                className="theme-button-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="theme-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : 'Log Time'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Total hours</p>
          <p className="text-2xl font-semibold theme-text-primary">{totalHours.toFixed(1)}h</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">Total logs</p>
          <p className="text-2xl font-semibold theme-text-primary">{filteredLogs.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
          <p className="text-xs uppercase tracking-wide theme-text-muted">This week</p>
          <p className="text-2xl font-semibold theme-text-primary">
            {filteredLogs
              .filter(l => {
                const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                return new Date(l.date).getTime() > weekAgo;
              })
              .reduce((sum, log) => sum + log.hours, 0)
              .toFixed(1)}h
          </p>
        </div>
      </div>

      {/* Time Logs Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold theme-text-primary">Recent Activity</h2>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <svg
              className="mx-auto w-16 h-16 text-gray-400 dark:text-gray-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold theme-text-primary mb-1">No time logs yet</h3>
            <p className="theme-text-muted text-sm">Click &quot;Log Time&quot; to add your work hours</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase tracking-wider">Task Type</th>
                  {viewFilter === 'all' && (
                    <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase tracking-wider">Employee</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold theme-text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={viewFilter === 'all' ? 6 : 5} className="px-6 py-8 text-center text-sm theme-text-muted">
                      No time logs found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, index) => {
                    const isOwnLog = profile?.username === log.employeeId;
                    return (
                      <tr key={log.id || `log-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap theme-text-primary font-medium">
                          {formatDate(log.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap theme-text-secondary font-semibold">
                          {log.hours}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap theme-text-secondary">
                          {log.workType || '—'}
                        </td>
                        {viewFilter === 'all' && (
                          <td className="px-6 py-4 whitespace-nowrap theme-text-secondary text-sm">
                            {log.employeeId}
                          </td>
                        )}
                        <td className="px-6 py-4 theme-text-secondary text-sm max-w-md truncate">
                          {log.description || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isOwnLog ? (
                            <button
                              onClick={() => handleDelete(log.id)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                            >
                              Delete
                            </button>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600 text-sm">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
