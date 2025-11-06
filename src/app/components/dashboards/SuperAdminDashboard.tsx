'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import adminService from '@/services/adminService'
import type { AnalyticsDashboardResponse, AuditLogResponse, ServiceTypeResponse, UserResponse } from '@/types/admin'
import type { UserDto } from '@/types/api'

interface SuperAdminDashboardProps {
  profile: UserDto;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ profile }) => {
  const [analytics, setAnalytics] = useState<AnalyticsDashboardResponse | null>(null)
  const [users, setUsers] = useState<UserResponse[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeResponse[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        const [analyticsData, usersData, serviceTypeData, auditLogData] = await Promise.all([
          adminService.getDashboardAnalytics().catch(() => null),
          adminService.getAllUsers({}).catch(() => []),
          adminService.getAllServiceTypes().catch(() => []),
          adminService.getAuditLogs({}).catch(() => []),
        ])

        setAnalytics(analyticsData)
        setUsers(Array.isArray(usersData) ? usersData.slice(0, 6) : [])
        setServiceTypes(Array.isArray(serviceTypeData) ? serviceTypeData.slice(0, 5) : [])
        setAuditLogs(Array.isArray(auditLogData) ? auditLogData.slice(0, 5) : [])
        setError(null)
      } catch (err: unknown) {
        console.error('Dashboard loading error:', err)
        const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error)?.message ||
          'Failed to load super admin dashboard data'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const activeServiceCount = useMemo(() => serviceTypes.filter((type) => type.active).length, [serviceTypes])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold theme-text-primary mb-2">Super Admin Dashboard</h1>
        <p className="theme-text-muted">Welcome back, {profile.username}! You have full system access.</p>
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
            <h3 className="text-xl font-semibold theme-text-primary">System Overview</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="theme-text-muted">Total Users</span>
              <span className="theme-text-primary font-semibold">{users.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Service Types</span>
              <span className="theme-text-primary font-semibold">{activeServiceCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Active Appointments</span>
              <span className="theme-text-primary font-semibold">{analytics?.activeAppointments ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Pending Invoices</span>
              <span className="theme-text-primary font-semibold">{analytics?.pendingInvoices ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="automotive-card p-6">
          <div className="flex items-center mb-4">
            <div className="automotive-accent w-3 h-3 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold theme-text-primary">User Management</h3>
          </div>
          <div className="space-y-3 text-sm">
            {users.length === 0 ? (
              <p className="theme-text-muted">No users available. Invite your first user.</p>
            ) : (
              users
                .filter((user) => user && user.userId) // Filter out invalid users
                .map((user, index) => (
                  <div key={user.userId || `user-${index}`} className="flex justify-between">
                    <span className="theme-text-muted">{user.username || 'Unknown'}</span>
                    <span className="theme-text-primary text-xs uppercase">
                      {Array.isArray(user.roles) ? user.roles.join(', ') : 'N/A'}
                    </span>
                  </div>
                ))
            )}
          </div>
          <div className="mt-4 space-y-2">
            <Link href="/dashboard/admin/users" className="theme-button-primary text-center block">
              Manage Users
            </Link>
            <Link href="/dashboard/admin" className="theme-button-secondary text-center block">
              Admin Overview
            </Link>
          </div>
        </div>

        <div className="automotive-card p-6">
          <div className="flex items-center mb-4">
            <div className="automotive-accent w-3 h-3 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold theme-text-primary">Service Configuration</h3>
          </div>
          <div className="space-y-3 text-sm">
            {serviceTypes.length === 0 ? (
              <p className="theme-text-muted">No service types configured yet.</p>
            ) : (
              serviceTypes.map((service) => (
                <div key={service.id} className="flex justify-between">
                  <span className="theme-text-muted">{service.name}</span>
                  <span className={`text-xs font-semibold ${service.active ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    {service.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="mt-4">
            <Link href="/dashboard/admin/service-types" className="theme-button-primary text-center block">
              Configure Service Types
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="automotive-card p-6">
          <h3 className="text-xl font-semibold theme-text-primary mb-4">Recent Audit Activity</h3>
          <div className="space-y-3">
            {auditLogs.length === 0 ? (
              <p className="theme-text-muted text-sm">No audit log entries yet.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.logId} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                  <p className="theme-text-primary text-sm font-medium">{log.action}</p>
                  <p className="theme-text-muted text-xs">{log.username ?? log.userId} • {new Date(log.timestamp).toLocaleString()}</p>
                  {log.details && <p className="theme-text-muted text-xs mt-1">{log.details}</p>}
                </div>
              ))
            )}
          </div>
          <div className="mt-4">
            <Link href="/dashboard/admin/audit-logs" className="theme-button-secondary text-center block">
              View Audit Trail
            </Link>
          </div>
        </div>

        <div className="automotive-card p-6">
          <h3 className="text-xl font-semibold theme-text-primary mb-4">Analytics Highlights</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="theme-text-muted">Revenue (This Month)</span>
              <span className="theme-text-primary font-semibold">LKR {(analytics?.revenueThisMonth ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Completed Services</span>
              <span className="theme-text-primary font-semibold">{analytics?.completedServicesThisMonth ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Active Projects</span>
              <span className="theme-text-primary font-semibold">{analytics?.activeProjects ?? 0}</span>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/dashboard/admin/reports" className="theme-button-primary text-center block">
              Generate Reports
            </Link>
          </div>
        </div>
      </div>

      <div className="automotive-card p-6">
        <h3 className="text-xl font-semibold theme-text-primary mb-4">Administrative Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/admin/users" className="theme-button-primary text-center">
            Create User
          </Link>
          <Link href="/dashboard/admin/config" className="theme-button-primary text-center">
            System Settings
          </Link>
          <Link href="/dashboard/admin/service-types" className="theme-button-primary text-center">
            Manage Services
          </Link>
          <Link href="/profile" className="theme-button-secondary text-center">
            My Profile
          </Link>
        </div>
      </div>

      {loading && (
        <div className="mt-6 automotive-card p-4 text-sm theme-text-muted">Refreshing dashboard data...</div>
      )}
    </div>
  )
}

export default SuperAdminDashboard