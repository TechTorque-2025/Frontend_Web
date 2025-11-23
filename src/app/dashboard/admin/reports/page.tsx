'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { ReportRequest, ReportResponse } from '@/types/admin';
import { useDashboard } from '@/app/contexts/DashboardContext';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';

export default function ReportsPage() {
  const { roles, loading: rolesLoading } = useDashboard();
  const { toasts, success, error: showError, closeToast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState<'SERVICE_PERFORMANCE' | 'REVENUE' | 'EMPLOYEE_PRODUCTIVITY' | 'CUSTOMER_SATISFACTION' | 'INVENTORY' | 'APPOINTMENT_SUMMARY'>('REVENUE');
  const [format, setFormat] = useState<'JSON' | 'PDF' | 'EXCEL' | 'CSV'>('PDF');
  const [dateRange, setDateRange] = useState({
    fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
  });
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Load reports on mount
  useEffect(() => {
    if (hasAccess) {
      loadReports();
    }
  }, [roles]);

  const loadReports = async () => {
    try {
      setLoadingReports(true);
      const data = await adminService.getReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
      showError('Failed to load reports history');
    } finally {
      setLoadingReports(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      const request: ReportRequest = {
        type: reportType,
        format,
        ...dateRange,
      };
      await adminService.generateReport(request);
      success('Report generation initiated successfully!');
      // Refresh list
      loadReports();
    } catch (err) {
      console.error('Failed to generate report:', err);
      showError('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (reportId: string, fileName: string) => {
    try {
      const blob = await adminService.downloadReport(reportId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName; // You might want to get the real filename from headers
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download report:', err);
      showError('Failed to download report');
    }
  };

  // Check if user has permission to access this page
  const hasRole = (role: string) => roles?.includes(role);
  const hasAccess = hasRole('ADMIN') || hasRole('SUPER_ADMIN');

  if (rolesLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 theme-bg-tertiary rounded-lg"></div>
          <div className="h-96 theme-bg-tertiary rounded-lg"></div>
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold theme-text-primary mb-2">Reports</h1>
        <p className="theme-text-muted">Generate business analytics and reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generation Form */}
        <div className="lg:col-span-1">
          <div className="dashboard-content-card sticky top-6">
            <h2 className="text-xl font-semibold theme-text-primary mb-6">Generate Report</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold theme-text-primary mb-2">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as typeof reportType)}
                  className="form-select w-full"
                >
                  <option value="REVENUE">Revenue Report</option>
                  <option value="APPOINTMENT_SUMMARY">Appointment Summary</option>
                  <option value="SERVICE_PERFORMANCE">Service Performance</option>
                  <option value="EMPLOYEE_PRODUCTIVITY">Employee Productivity</option>
                  <option value="CUSTOMER_SATISFACTION">Customer Satisfaction</option>
                  <option value="INVENTORY">Inventory Report</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold theme-text-primary mb-2">Report Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as typeof format)}
                  className="form-select w-full"
                >
                  <option value="PDF">PDF</option>
                  <option value="EXCEL">Excel</option>
                  <option value="CSV">CSV</option>
                  <option value="JSON">JSON</option>
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div>
                  <label className="block text-sm font-semibold theme-text-primary mb-2">From Date</label>
                  <input
                    type="date"
                    value={dateRange.fromDate}
                    onChange={(e) => setDateRange({ ...dateRange, fromDate: e.target.value })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold theme-text-primary mb-2">To Date</label>
                  <input
                    type="date"
                    value={dateRange.toDate}
                    onChange={(e) => setDateRange({ ...dateRange, toDate: e.target.value })}
                    className="form-input w-full"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateReport}
                disabled={generating}
                className="w-full theme-button-primary disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {generating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="lg:col-span-2">
          <div className="dashboard-content-card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold theme-text-primary">Generated Reports</h2>
              <button 
                onClick={loadReports} 
                className="text-sm theme-text-accent hover:underline flex items-center"
                disabled={loadingReports}
              >
                <svg className={`w-4 h-4 mr-1 ${loadingReports ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            {loadingReports && reports.length === 0 ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 theme-bg-tertiary rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 theme-text-muted">
                <svg className="mx-auto w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No reports generated yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.reportId} className="p-4 rounded-lg border theme-border theme-bg-secondary hover:theme-bg-tertiary transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium theme-text-primary">{report.title || report.type}</h3>
                        <div className="text-sm theme-text-muted mt-1 space-y-1">
                          <p>Date Range: {report.fromDate} to {report.toDate}</p>
                          <p>Generated: {new Date(report.createdAt).toLocaleString()}</p>
                          <p>Format: <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{report.format}</span></p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          report.status === 'FAILED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {report.status}
                        </span>
                        
                        {report.status === 'COMPLETED' && (
                          <button
                            onClick={() => handleDownload(report.reportId, `${report.title || 'report'}.${report.format.toLowerCase()}`)}
                            className="text-sm theme-text-accent hover:underline flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </button>
                        )}
                      </div>
                    </div>
                    {report.errorMessage && (
                      <div className="mt-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        Error: {report.errorMessage}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}
