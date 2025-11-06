'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import adminService from '@/services/adminService'
import appointmentService from '@/services/appointmentService'
import type { AnalyticsDashboardResponse } from '@/types/admin'
import type { AppointmentResponseDto } from '@/types/appointment'
import type { UserDto } from '@/types/api'

interface AdminDashboardProps {
  profile: UserDto;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ profile }) => {
  const [analytics, setAnalytics] = useState<AnalyticsDashboardResponse | null>(null)
  const [pendingAppointments, setPendingAppointments] = useState<AppointmentResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        const [analyticsData, appointmentData] = await Promise.all([
          adminService.getDashboardAnalytics(),
          appointmentService.listAppointments({ status: 'PENDING' }),
        ])

        setAnalytics(analyticsData)
        setPendingAppointments(appointmentData.slice(0, 5))
        setError(null)
      } catch (err: unknown) {
        const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to load admin dashboard data'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const topServices = useMemo(() => analytics?.topServices ?? [], [analytics])
  const maxRevenue = useMemo(() => {
    if (!analytics?.revenueByMonth || analytics.revenueByMonth.length === 0) {
      return 1
    }
    return Math.max(...analytics.revenueByMonth.map((entry) => entry.revenue || 0), 1)
  }, [analytics])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold theme-text-primary mb-2">Admin Dashboard</h1>
        <p className="theme-text-muted">Welcome back, {profile.username}! Manage your organization efficiently.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="automotive-card p-6">
          <div className="flex items-center mb-4">
            <div className="automotive-accent w-3 h-3 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold theme-text-primary">Organization Overview</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="theme-text-muted">Total Customers</span>
              <span className="theme-text-primary font-semibold">{analytics?.totalCustomers ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Active Employees</span>
              <span className="theme-text-primary font-semibold">{analytics?.totalEmployees ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Vehicles Registered</span>
              <span className="theme-text-primary font-semibold">{analytics?.totalVehicles ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Active Appointments</span>
              <span className="theme-text-primary font-semibold">{analytics?.activeAppointments ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="automotive-card p-6">
          <div className="flex items-center mb-4">
            <div className="automotive-accent w-3 h-3 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold theme-text-primary">Financial Snapshot</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="theme-text-muted">Revenue (This Month)</span>
              <span className="theme-text-primary font-semibold">LKR {(analytics?.revenueThisMonth ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Pending Invoices</span>
              <span className="theme-text-primary font-semibold">{analytics?.pendingInvoices ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Active Projects</span>
              <span className="theme-text-primary font-semibold">{analytics?.activeProjects ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="automotive-card p-6">
          <div className="flex items-center mb-4">
            <div className="automotive-accent w-3 h-3 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold theme-text-primary">Top Services</h3>
          </div>
          <div className="space-y-3 text-sm">
            {topServices.length === 0 ? (
              <p className="theme-text-muted">No service performance data yet.</p>
            ) : (
              topServices.map((service) => (
                <div key={service.serviceName} className="flex justify-between">
                  <span className="theme-text-muted">{service.serviceName}</span>
                  <span className="theme-text-primary font-semibold">{service.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="automotive-card p-6">
          <h3 className="text-xl font-semibold theme-text-primary mb-4">Pending Appointments</h3>
          <div className="space-y-4">
            {pendingAppointments.length === 0 ? (
              <p className="theme-text-muted text-sm">No pending appointments requiring attention.</p>
            ) : (
              pendingAppointments.map((appointment) => (
                <div key={appointment.id} className="border-b border-gray-200 dark:border-gray-700 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="theme-text-primary font-medium">{appointment.serviceType}</p>
                      <p className="theme-text-muted text-xs">
                        {new Date(appointment.requestedDateTime).toLocaleString()}
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/appointments/${appointment.id}`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4">
            <Link href="/dashboard/appointments" className="theme-button-primary w-full text-center block">
              Manage Appointments
            </Link>
          </div>
        </div>

        <div className="automotive-card p-6">
          <h3 className="text-xl font-semibold theme-text-primary mb-4">Business Analytics</h3>
          {analytics?.revenueByMonth ? (
            <div className="space-y-4">
              {analytics.revenueByMonth.slice(-4).map((entry) => (
                <div key={entry.month}>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="theme-text-muted">{entry.month}</span>
                    <span className="theme-text-primary font-semibold">LKR {entry.revenue.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (entry.revenue / maxRevenue) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="theme-text-muted text-sm">No revenue analytics available yet.</p>
          )}
        </div>
      </div>

      <div className="automotive-card p-6">
        <h3 className="text-xl font-semibold theme-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/admin/users" className="theme-button-primary text-center">
            Manage Users
          </Link>
          <Link href="/dashboard/admin/service-types" className="theme-button-primary text-center">
            Configure Services
          </Link>
          <Link href="/dashboard/admin/reports" className="theme-button-primary text-center">
            View Reports
          </Link>
          <Link href="/dashboard/admin/audit-logs" className="theme-button-secondary text-center">
            Audit Logs
          </Link>
        </div>
      </div>

      {loading && (
        <div className="mt-6 automotive-card p-4 text-sm theme-text-muted">Refreshing dashboard data...</div>
      )}
    </div>
  )
}

export default AdminDashboard