'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { timeLogService } from '@/lib/api/timelog.service';
import { serviceService } from '@/lib/api/project.service';
import {
  TimeLogDto,
  TimeLogFormData,
  TimeLogSummaryDto,
  COMMON_WORK_TYPES,
  SummaryPeriod,
} from '@/types/timelog.types';
import { ServiceDto } from '@/types/project.types';
import {
  validateTimeLogForm,
  formatHours,
  getTodayDate,
  getCurrentWeekRange,
  getCurrentMonthRange,
} from '@/lib/utils/timelog-validation';

export default function TimeLogsTab() {
  const { user } = useAuth();

  const [logs, setLogs] = useState<TimeLogDto[]>([]);
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [summary, setSummary] = useState<TimeLogSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<TimeLogDto | null>(null);

  // Modal states
  const [showLogModal, setShowLogModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filter states
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'custom'>('week');
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');

  // Form states
  const [logForm, setLogForm] = useState<TimeLogFormData>({
    serviceId: '',
    hours: '',
    date: getTodayDate(),
    description: '',
    workType: '',
  });
  const [editForm, setEditForm] = useState({
    hours: '',
    description: '',
    workType: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data
  useEffect(() => {
    loadData();
  }, [dateFilter, customFromDate, customToDate]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Calculate date range based on filter
      let fromDate: string | undefined;
      let toDate: string | undefined;

      if (dateFilter === 'today') {
        fromDate = getTodayDate();
        toDate = getTodayDate();
      } else if (dateFilter === 'week') {
        const weekRange = getCurrentWeekRange();
        fromDate = weekRange.fromDate;
        toDate = weekRange.toDate;
      } else if (dateFilter === 'month') {
        const monthRange = getCurrentMonthRange();
        fromDate = monthRange.fromDate;
        toDate = monthRange.toDate;
      } else if (dateFilter === 'custom') {
        fromDate = customFromDate || undefined;
        toDate = customToDate || undefined;
      }

      const [logsData, servicesData] = await Promise.all([
        timeLogService.getMyLogs(fromDate, toDate),
        serviceService.listCustomerServices(),
      ]);

      setLogs(logsData);
      setServices(servicesData);

      // Load summary for current week
      if (dateFilter === 'week') {
        const summaryData = await timeLogService.getSummary('WEEKLY', getTodayDate());
        setSummary(summaryData);
      } else if (dateFilter === 'today') {
        const summaryData = await timeLogService.getSummary('DAILY', getTodayDate());
        setSummary(summaryData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load time logs');
    } finally {
      setIsLoading(false);
    }
  };

  // Log work time
  const handleLogTime = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateTimeLogForm(logForm);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      setIsSubmitting(true);
      await timeLogService.logWorkTime({
        serviceId: logForm.serviceId,
        hours: parseFloat(logForm.hours),
        date: logForm.date,
        description: logForm.description || undefined,
        workType: logForm.workType || undefined,
      });

      setShowLogModal(false);
      setLogForm({
        serviceId: '',
        hours: '',
        date: getTodayDate(),
        description: '',
        workType: '',
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log time');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update time log
  const handleUpdateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLog) return;

    try {
      setIsSubmitting(true);
      await timeLogService.updateLog(selectedLog.logId, {
        hours: editForm.hours ? parseFloat(editForm.hours) : undefined,
        description: editForm.description || undefined,
        workType: editForm.workType || undefined,
      });

      setShowEditModal(false);
      setEditForm({ hours: '', description: '', workType: '' });
      setSelectedLog(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update time log');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete time log
  const handleDeleteLog = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this time log?')) return;

    try {
      setIsSubmitting(true);
      await timeLogService.deleteLog(logId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete time log');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open modals
  const openEditModal = (log: TimeLogDto) => {
    setSelectedLog(log);
    setEditForm({
      hours: log.hours.toString(),
      description: log.description || '',
      workType: log.workType || '',
    });
    setShowEditModal(true);
  };

  const openDetailsModal = (log: TimeLogDto) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  // Get service name
  const getServiceName = (serviceId: string): string => {
    const service = services.find(s => s.serviceId === serviceId);
    return service ? service.serviceType : 'Unknown Service';
  };

  // Calculate total hours
  const totalHours = logs.reduce((sum, log) => sum + log.hours, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading time logs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Time Logs</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track your work hours on services and projects
          </p>
        </div>
        <button
          onClick={() => setShowLogModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          + Log Time
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Summary Card */}
      {summary && (
        <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg">
          <h3 className="text-lg font-semibold mb-2">
            {summary.period === 'DAILY' ? 'Today' : 'This Week'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-3xl font-bold">{summary.totalHours.toFixed(1)}</div>
              <div className="text-sm opacity-90">Total Hours</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{summary.logCount}</div>
              <div className="text-sm opacity-90">Log Entries</div>
            </div>
            {Object.keys(summary.breakdownByWorkType).length > 0 && (
              <div className="col-span-2 md:col-span-1">
                <div className="text-sm opacity-90 mb-1">Breakdown</div>
                <div className="space-y-1">
                  {Object.entries(summary.breakdownByWorkType).map(([type, hours]) => (
                    <div key={type} className="text-xs">
                      {type}: {hours.toFixed(1)} hrs
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDateFilter('today')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              dateFilter === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateFilter('week')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              dateFilter === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              dateFilter === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setDateFilter('custom')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              dateFilter === 'custom'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Custom Range
          </button>
        </div>

        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customFromDate}
              onChange={(e) => setCustomFromDate(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <span className="text-gray-600 dark:text-gray-400">to</span>
            <input
              type="date"
              value={customToDate}
              onChange={(e) => setCustomToDate(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        )}

        <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
          Total: <span className="font-semibold">{formatHours(totalHours)}</span>
        </div>
      </div>

      {/* Time logs list */}
      {logs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">
            No time logs for the selected period. Log your first entry!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {logs.map((log) => (
            <div
              key={log.logId}
              className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {getServiceName(log.serviceId)}
                    </h3>
                    {log.workType && (
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
                        {log.workType}
                      </span>
                    )}
                  </div>
                  {log.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{log.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {formatHours(log.hours)}
                    </span>
                    <span>{new Date(log.date).toLocaleDateString()}</span>
                    <span>Logged: {new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => openDetailsModal(log)}
                    className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => openEditModal(log)}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteLog(log.logId)}
                    disabled={isSubmitting}
                    className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log Time Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Log Work Time</h3>
            <form onSubmit={handleLogTime} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Service *
                </label>
                <select
                  value={logForm.serviceId}
                  onChange={(e) => setLogForm({ ...logForm, serviceId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.serviceId} value={service.serviceId}>
                      {service.serviceType}
                    </option>
                  ))}
                </select>
                {formErrors.serviceId && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.serviceId}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hours * (0-24)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={logForm.hours}
                    onChange={(e) => setLogForm({ ...logForm, hours: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="8.0"
                  />
                  {formErrors.hours && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.hours}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={logForm.date}
                    onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                    max={getTodayDate()}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {formErrors.date && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.date}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Work Type (optional)
                </label>
                <select
                  value={logForm.workType}
                  onChange={(e) => setLogForm({ ...logForm, workType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select work type</option>
                  {COMMON_WORK_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (optional, max 500 characters)
                </label>
                <textarea
                  value={logForm.description}
                  onChange={(e) => setLogForm({ ...logForm, description: e.target.value })}
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="What did you work on?"
                />
                {formErrors.description && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.description}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowLogModal(false);
                    setLogForm({
                      serviceId: '',
                      hours: '',
                      date: getTodayDate(),
                      description: '',
                      workType: '',
                    });
                    setFormErrors({});
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Logging...' : 'Log Time'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Log Modal */}
      {showEditModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit Time Log</h3>
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getServiceName(selectedLog.serviceId)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {new Date(selectedLog.date).toLocaleDateString()}
              </p>
            </div>
            <form onSubmit={handleUpdateLog} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hours (0-24)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={editForm.hours}
                  onChange={(e) => setEditForm({ ...editForm, hours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Work Type
                </label>
                <select
                  value={editForm.workType}
                  onChange={(e) => setEditForm({ ...editForm, workType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select work type</option>
                  {COMMON_WORK_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (max 500 characters)
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditForm({ hours: '', description: '', workType: '' });
                    setSelectedLog(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Time Log Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Service</label>
                <p className="text-gray-900 dark:text-white">{getServiceName(selectedLog.serviceId)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Hours</label>
                  <p className="text-gray-900 dark:text-white font-semibold">{formatHours(selectedLog.hours)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedLog.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedLog.workType && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Work Type</label>
                  <p className="text-gray-900 dark:text-white">{selectedLog.workType}</p>
                </div>
              )}

              {selectedLog.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedLog.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(selectedLog.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Updated</label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(selectedLog.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedLog(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
