'use client';

import { useState } from 'react';
import { adminService } from '@/services/adminService';
import { ReportRequest } from '@/types/admin';

export default function ReportsPage() {
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState<'REVENUE' | 'SERVICES' | 'CUSTOMERS' | 'EMPLOYEES'>('REVENUE');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      const request: ReportRequest = {
        reportType,
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
              onChange={(e) => setReportType(e.target.value as 'REVENUE' | 'SERVICES' | 'CUSTOMERS' | 'EMPLOYEES')}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 theme-text-primary focus:ring-2 focus:ring-blue-500"
            >
              <option value="REVENUE">Revenue Report</option>
              <option value="SERVICES">Services Report</option>
              <option value="CUSTOMERS">Customers Report</option>
              <option value="EMPLOYEES">Employees Report</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold theme-text-primary mb-2">From Date</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 theme-text-primary focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold theme-text-primary mb-2">To Date</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
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
