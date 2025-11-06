'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/lib/api/admin.service';
import {
  DashboardDataDto,
  SystemMetricsDto,
  DashboardPeriod,
  DASHBOARD_PERIODS,
} from '@/types/admin.types';
import { adminHelpers } from '@/lib/utils/admin-validation';

/**
 * AnalyticsTab Component
 * Admin dashboard with system metrics and analytics
 */
export default function AnalyticsTab() {
  const [dashboardData, setDashboardData] = useState<DashboardDataDto | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetricsDto | null>(null);
  const [period, setPeriod] = useState<DashboardPeriod>(DashboardPeriod.MONTHLY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, metricsResponse] = await Promise.all([
        adminService.analytics.getDashboardData(period),
        adminService.analytics.getSystemMetrics(),
      ]);

      if (dashboardResponse.success && dashboardResponse.data) {
        setDashboardData(dashboardResponse.data);
      }
      if (metricsResponse.success && metricsResponse.data) {
        setSystemMetrics(metricsResponse.data);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="theme-text-secondary">Loading analytics...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold theme-text-primary">Analytics Dashboard</h2>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as DashboardPeriod)}
            className="theme-input"
          >
            {DASHBOARD_PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <button onClick={fetchData} className="theme-button-secondary">
            ↻ Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* System Metrics */}
      {systemMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="theme-card">
            <p className="theme-text-secondary text-sm mb-1">Active Users</p>
            <p className="text-2xl font-bold theme-text-primary">
              {adminHelpers.formatLargeNumber(systemMetrics.activeUsers)}
            </p>
          </div>
          <div className="theme-card">
            <p className="theme-text-secondary text-sm mb-1">Pending Appointments</p>
            <p className="text-2xl font-bold theme-text-primary">
              {systemMetrics.pendingAppointments}
            </p>
          </div>
          <div className="theme-card">
            <p className="theme-text-secondary text-sm mb-1">Active Projects</p>
            <p className="text-2xl font-bold theme-text-primary">
              {systemMetrics.activeProjects}
            </p>
          </div>
          <div className="theme-card">
            <p className="theme-text-secondary text-sm mb-1">Total Revenue</p>
            <p className="text-2xl font-bold theme-text-primary">
              {adminHelpers.formatCurrency(systemMetrics.totalRevenue)}
            </p>
          </div>
        </div>
      )}

      {/* Dashboard Data */}
      {dashboardData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="theme-card">
              <p className="theme-text-secondary text-sm mb-1">Total Users</p>
              <p className="text-2xl font-bold theme-text-primary">
                {adminHelpers.formatLargeNumber(dashboardData.totalUsers)}
              </p>
            </div>
            <div className="theme-card">
              <p className="theme-text-secondary text-sm mb-1">Total Revenue</p>
              <p className="text-2xl font-bold theme-text-primary">
                {adminHelpers.formatCurrency(dashboardData.totalRevenue)}
              </p>
            </div>
            <div className="theme-card">
              <p className="theme-text-secondary text-sm mb-1">Total Services</p>
              <p className="text-2xl font-bold theme-text-primary">
                {adminHelpers.formatLargeNumber(dashboardData.totalServices)}
              </p>
            </div>
            <div className="theme-card">
              <p className="theme-text-secondary text-sm mb-1">Total Appointments</p>
              <p className="text-2xl font-bold theme-text-primary">
                {adminHelpers.formatLargeNumber(dashboardData.totalAppointments)}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue Chart */}
            {dashboardData.revenueChart && dashboardData.revenueChart.length > 0 && (
              <div className="theme-card">
                <h3 className="font-bold theme-text-primary mb-4">Revenue Trend</h3>
                <div className="space-y-2">
                  {dashboardData.revenueChart.map((point, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-24 text-sm theme-text-secondary">{point.label}</div>
                      <div className="flex-1">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                          <div
                            className="bg-green-500 dark:bg-green-600 h-6 rounded-full flex items-center justify-end px-2"
                            style={{
                              width: `${adminHelpers.calculatePercentage(
                                point.value,
                                Math.max(...dashboardData.revenueChart.map((p) => p.value))
                              )}%`,
                            }}
                          >
                            <span className="text-xs text-white font-medium">
                              {adminHelpers.formatCurrency(point.value)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services Chart */}
            {dashboardData.servicesChart && dashboardData.servicesChart.length > 0 && (
              <div className="theme-card">
                <h3 className="font-bold theme-text-primary mb-4">Services Breakdown</h3>
                <div className="space-y-2">
                  {dashboardData.servicesChart.map((point, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-24 text-sm theme-text-secondary">{point.label}</div>
                      <div className="flex-1">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                          <div
                            className="bg-blue-500 dark:bg-blue-600 h-6 rounded-full flex items-center justify-end px-2"
                            style={{
                              width: `${adminHelpers.calculatePercentage(
                                point.value,
                                Math.max(...dashboardData.servicesChart.map((p) => p.value))
                              )}%`,
                            }}
                          >
                            <span className="text-xs text-white font-medium">{point.value}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 && (
            <div className="theme-card">
              <h3 className="font-bold theme-text-primary mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {dashboardData.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                    <div className="flex-1">
                      <p className="theme-text-primary font-medium">{activity.description}</p>
                      {activity.userName && (
                        <p className="theme-text-secondary text-sm">by {activity.userName}</p>
                      )}
                      <p className="theme-text-secondary text-xs mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      {activity.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!dashboardData && !loading && (
        <div className="text-center py-12 theme-text-secondary">
          No analytics data available
        </div>
      )}
    </div>
  );
}
