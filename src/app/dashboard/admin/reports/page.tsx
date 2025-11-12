'use client';

import { useState } from 'react';
import { adminService } from '@/services/adminService';
import { ReportRequest } from '@/types/admin';
import { useDashboard } from '@/app/contexts/DashboardContext';

export default function ReportsPage() {
  const { roles, loading: rolesLoading } = useDashboard();
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState<'SERVICE_PERFORMANCE' | 'REVENUE' | 'EMPLOYEE_PRODUCTIVITY' | 'CUSTOMER_SATISFACTION' | 'INVENTORY' | 'APPOINTMENT_SUMMARY'>('REVENUE');
  const [format, setFormat] = useState<'JSON' | 'PDF' | 'EXCEL' | 'CSV'>('PDF');
  const [dateRange, setDateRange] = useState({
    fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
  });

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      const request: ReportRequest = {
        type: reportType,
        format,
        ...dateRange,
      };
      const report = await adminService.generateReport(request);
      // In a real implementation, you would display or download the report
      console.log('Report generated:', report);
      alert('Report generated successfully!');
    } catch (err) {
      console.error('Failed to generate report:', err);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  // Check if user has permission to access this page
  const hasRole = (role: string) => roles?.includes(role);
  const hasAccess = hasRole('ADMIN') || hasRole('SUPER_ADMIN');

  if (rolesLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold theme-text-primary mb-2">Reports</h1>
        <p className="theme-text-muted">Generate business analytics and reports</p>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-8">
        <h2 className="text-xl font-semibold theme-text-primary mb-6">Generate Report</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold theme-text-primary mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as typeof reportType)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 theme-text-primary focus:ring-2 focus:ring-blue-500"
            >
              <option value="REVENUE">Revenue Report</option>
              <option value="SERVICE_PERFORMANCE">Service Performance Report</option>
              <option value="EMPLOYEE_PRODUCTIVITY">Employee Productivity Report</option>
              <option value="CUSTOMER_SATISFACTION">Customer Satisfaction Report</option>
              <option value="INVENTORY">Inventory Report</option>
              <option value="APPOINTMENT_SUMMARY">Appointment Summary Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold theme-text-primary mb-2">Report Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as typeof format)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 theme-text-primary focus:ring-2 focus:ring-blue-500"
            >
              <option value="PDF">PDF</option>
              <option value="EXCEL">Excel</option>
              <option value="CSV">CSV</option>
              <option value="JSON">JSON</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold theme-text-primary mb-2">From Date</label>
              <input
                type="date"
                value={dateRange.fromDate}
                onChange={(e) => setDateRange({ ...dateRange, fromDate: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 theme-text-primary focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold theme-text-primary mb-2">To Date</label>
              <input
                type="date"
                value={dateRange.toDate}
                onChange={(e) => setDateRange({ ...dateRange, toDate: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 theme-text-primary focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="w-full theme-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
