'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminService } from '@/services/adminService';
import { AnalyticsDashboardResponse } from '@/types/admin';

export default function AdminPage() {
  const [stats, setStats] = useState<AnalyticsDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardAnalytics();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold theme-text-primary mb-2">Admin Dashboard</h1>
        <p className="theme-text-muted">System overview and management</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/dashboard/admin/users"
          className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm theme-text-muted">Manage</p>
              <p className="text-lg font-semibold theme-text-primary">Users</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/admin/service-types"
          className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 hover:border-green-400 dark:hover:border-green-500 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:bg-green-600 transition-colors">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm theme-text-muted">Configure</p>
              <p className="text-lg font-semibold theme-text-primary">Services</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/admin/reports"
          className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 hover:border-purple-400 dark:hover:border-purple-500 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm theme-text-muted">View</p>
              <p className="text-lg font-semibold theme-text-primary">Reports</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/admin/audit-logs"
          className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 hover:border-amber-400 dark:hover:border-amber-500 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:bg-amber-600 transition-colors">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm theme-text-muted">Review</p>
              <p className="text-lg font-semibold theme-text-primary">Audit Logs</p>
            </div>
          </div>
        </Link>
      </div>

      {/* System Stats */}
      {stats && (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold theme-text-primary mb-4">User Statistics</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
                <p className="text-xs uppercase tracking-wide theme-text-muted">Total customers</p>
                <p className="text-2xl font-semibold theme-text-primary">{stats.totalCustomers ?? 0}</p>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
                <p className="text-xs uppercase tracking-wide theme-text-muted">Total employees</p>
                <p className="text-2xl font-semibold theme-text-primary">{stats.totalEmployees ?? 0}</p>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
                <p className="text-xs uppercase tracking-wide theme-text-muted">Total vehicles</p>
                <p className="text-2xl font-semibold theme-text-primary">{stats.totalVehicles ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold theme-text-primary mb-4">Service Statistics</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
                <p className="text-xs uppercase tracking-wide theme-text-muted">Active appointments</p>
                <p className="text-2xl font-semibold theme-text-primary">{stats.activeAppointments ?? 0}</p>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
                <p className="text-xs uppercase tracking-wide theme-text-muted">Completed (month)</p>
                <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{stats.completedServicesThisMonth ?? 0}</p>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
                <p className="text-xs uppercase tracking-wide theme-text-muted">Active projects</p>
                <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">{stats.activeProjects ?? 0}</p>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
                <p className="text-xs uppercase tracking-wide theme-text-muted">Pending invoices</p>
                <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{stats.pendingInvoices ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold theme-text-primary mb-4">Financial Overview</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
                <p className="text-xs uppercase tracking-wide theme-text-muted">Revenue this month</p>
                <p className="text-2xl font-semibold theme-text-primary">LKR {(stats.revenueThisMonth ?? 0).toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5">
                <p className="text-xs uppercase tracking-wide theme-text-muted">Pending invoices count</p>
                <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{stats.pendingInvoices ?? 0}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
