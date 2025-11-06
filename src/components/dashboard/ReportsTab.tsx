'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/lib/api/admin.service';
import {
  ReportDto,
  ReportFormData,
  ReportFormErrors,
  ReportType,
  REPORT_TYPES,
  RevenueReportDto,
  ServicesReportDto,
  CustomersReportDto,
} from '@/types/admin.types';
import { adminValidation, adminHelpers } from '@/lib/utils/admin-validation';

/**
 * ReportsTab Component
 * Generate and view admin reports
 */
export default function ReportsTab() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReportData, setSelectedReportData] = useState<RevenueReportDto | ServicesReportDto | CustomersReportDto | null>(null);
  const [selectedReportType, setSelectedReportType] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<ReportFormData>({
    reportType: '',
    startDate: adminHelpers.getFirstDayOfMonth(),
    endDate: adminHelpers.getTodayDate(),
    employeeId: '',
    customerId: '',
  });
  const [formErrors, setFormErrors] = useState<ReportFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await adminService.reports.listGeneratedReports();
      if (response.success && response.data) {
        setReports(response.data);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = adminValidation.validateReport(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!user?.id) {
      setFormErrors({ submit: 'User not authenticated' });
      return;
    }

    try {
      setSubmitting(true);
      const response = await adminService.reports.generateReport(formData, String(user.id));
      if (response.success) {
        await fetchReports();
        setShowGenerateModal(false);
        setFormErrors({});
      }
    } catch (err) {
      setFormErrors({ submit: 'Failed to generate report' });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewQuickReport = async (type: 'revenue' | 'services' | 'customers') => {
    try {
      setSubmitting(true);
      const startDate = adminHelpers.getFirstDayOfMonth();
      const endDate = adminHelpers.getTodayDate();

      let response;
      if (type === 'revenue') {
        response = await adminService.reports.getRevenueReport(startDate, endDate);
        setSelectedReportType('Revenue');
      } else if (type === 'services') {
        response = await adminService.reports.getServicesReport(startDate, endDate);
        setSelectedReportType('Services');
      } else {
        response = await adminService.reports.getCustomersReport(startDate, endDate);
        setSelectedReportType('Customers');
      }

      if (response.success && response.data) {
        setSelectedReportData(response.data);
        setShowViewModal(true);
      }
    } catch (err) {
      alert('Failed to load report');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="theme-text-secondary">Loading reports...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold theme-text-primary">Reports</h2>
        <button onClick={() => setShowGenerateModal(true)} className="theme-button-primary">
          + Generate Report
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Quick Report Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => handleViewQuickReport('revenue')}
          disabled={submitting}
          className="theme-card hover:shadow-lg transition-shadow text-left"
        >
          <h3 className="font-bold theme-text-primary mb-2">Revenue Report</h3>
          <p className="theme-text-secondary text-sm">View current month&apos;s revenue breakdown</p>
        </button>
        <button
          onClick={() => handleViewQuickReport('services')}
          disabled={submitting}
          className="theme-card hover:shadow-lg transition-shadow text-left"
        >
          <h3 className="font-bold theme-text-primary mb-2">Services Report</h3>
          <p className="theme-text-secondary text-sm">View current month&apos;s services statistics</p>
        </button>
        <button
          onClick={() => handleViewQuickReport('customers')}
          disabled={submitting}
          className="theme-card hover:shadow-lg transition-shadow text-left"
        >
          <h3 className="font-bold theme-text-primary mb-2">Customers Report</h3>
          <p className="theme-text-secondary text-sm">View current month&apos;s customer analytics</p>
        </button>
      </div>

      {/* Generated Reports List */}
      <div className="theme-card">
        <h3 className="font-bold theme-text-primary mb-4">Generated Reports</h3>
        {reports.length === 0 ? (
          <p className="theme-text-secondary text-center py-8">No reports generated yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Generated By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Generated At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap theme-text-primary font-medium">
                      {report.reportType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap theme-text-secondary">
                      {new Date(report.startDate).toLocaleDateString()} -{' '}
                      {new Date(report.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap theme-text-secondary">
                      {report.generatedBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap theme-text-secondary">
                      {new Date(report.generatedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-card max-w-md w-full">
            <h3 className="text-xl font-bold theme-text-primary mb-4">Generate Report</h3>
            <form onSubmit={handleGenerateReport} className="space-y-4">
              <div>
                <label className="block theme-text-primary mb-1">Report Type *</label>
                <select
                  value={formData.reportType}
                  onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                  className="w-full theme-input"
                  required
                >
                  <option value="">Select Type</option>
                  {REPORT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {formErrors.reportType && <p className="theme-error">{formErrors.reportType}</p>}
              </div>

              <div>
                <label className="block theme-text-primary mb-1">Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full theme-input"
                  required
                />
                {formErrors.startDate && <p className="theme-error">{formErrors.startDate}</p>}
              </div>

              <div>
                <label className="block theme-text-primary mb-1">End Date *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full theme-input"
                  required
                />
                {formErrors.endDate && <p className="theme-error">{formErrors.endDate}</p>}
              </div>

              {formErrors.submit && <p className="theme-error">{formErrors.submit}</p>}

              <div className="flex gap-2">
                <button type="submit" disabled={submitting} className="flex-1 theme-button-primary">
                  {submitting ? 'Generating...' : 'Generate'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowGenerateModal(false);
                    setFormErrors({});
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

      {/* View Report Modal */}
      {showViewModal && selectedReportData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="theme-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold theme-text-primary mb-4">
              {selectedReportType} Report - {new Date().toLocaleDateString()}
            </h3>

            {/* Revenue Report */}
            {'totalRevenue' in selectedReportData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="theme-card">
                    <p className="theme-text-secondary text-sm mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold theme-text-primary">
                      {adminHelpers.formatCurrency(selectedReportData.totalRevenue)}
                    </p>
                  </div>
                  <div className="theme-card">
                    <p className="theme-text-secondary text-sm mb-1">Pending Amount</p>
                    <p className="text-2xl font-bold theme-text-primary">
                      {adminHelpers.formatCurrency(selectedReportData.pendingAmount)}
                    </p>
                  </div>
                  <div className="theme-card">
                    <p className="theme-text-secondary text-sm mb-1">Total Invoices</p>
                    <p className="text-2xl font-bold theme-text-primary">
                      {selectedReportData.totalInvoices}
                    </p>
                  </div>
                  <div className="theme-card">
                    <p className="theme-text-secondary text-sm mb-1">Paid Invoices</p>
                    <p className="text-2xl font-bold theme-text-primary">
                      {selectedReportData.paidInvoices}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Services Report */}
            {'totalServices' in selectedReportData && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="theme-card">
                    <p className="theme-text-secondary text-sm mb-1">Total Services</p>
                    <p className="text-2xl font-bold theme-text-primary">
                      {selectedReportData.totalServices}
                    </p>
                  </div>
                  <div className="theme-card">
                    <p className="theme-text-secondary text-sm mb-1">Completed</p>
                    <p className="text-2xl font-bold theme-text-primary">
                      {selectedReportData.completedServices}
                    </p>
                  </div>
                  <div className="theme-card">
                    <p className="theme-text-secondary text-sm mb-1">Active</p>
                    <p className="text-2xl font-bold theme-text-primary">
                      {selectedReportData.activeServices}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Customers Report */}
            {'totalCustomers' in selectedReportData && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="theme-card">
                    <p className="theme-text-secondary text-sm mb-1">Total Customers</p>
                    <p className="text-2xl font-bold theme-text-primary">
                      {selectedReportData.totalCustomers}
                    </p>
                  </div>
                  <div className="theme-card">
                    <p className="theme-text-secondary text-sm mb-1">New Customers</p>
                    <p className="text-2xl font-bold theme-text-primary">
                      {selectedReportData.newCustomers}
                    </p>
                  </div>
                  <div className="theme-card">
                    <p className="theme-text-secondary text-sm mb-1">Active Customers</p>
                    <p className="text-2xl font-bold theme-text-primary">
                      {selectedReportData.activeCustomers}
                    </p>
                  </div>
                </div>

                {selectedReportData.topCustomers && selectedReportData.topCustomers.length > 0 && (
                  <div>
                    <h4 className="font-bold theme-text-primary mb-2">Top Customers</h4>
                    <div className="space-y-2">
                      {selectedReportData.topCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                        >
                          <div>
                            <p className="theme-text-primary font-medium">{customer.name}</p>
                            <p className="theme-text-secondary text-sm">{customer.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="theme-text-primary font-bold">
                              {adminHelpers.formatCurrency(customer.totalSpent)}
                            </p>
                            <p className="theme-text-secondary text-sm">
                              {customer.totalServices} services
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => {
                setShowViewModal(false);
                setSelectedReportData(null);
              }}
              className="mt-6 w-full theme-button-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
