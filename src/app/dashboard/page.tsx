'use client'
import React from 'react'
import Link from 'next/link'
import SuperAdminDashboard from '../components/dashboards/SuperAdminDashboard'
import AdminDashboard from '../components/dashboards/AdminDashboard'
import EmployeeDashboard from '../components/dashboards/EmployeeDashboard'
import CustomerDashboard from '../components/dashboards/CustomerDashboard'
import { useDashboard } from '../contexts/DashboardContext'
import type { UserDto } from '@/types/api'

export default function DashboardPage() {
  const { profile, loading, activeRole } = useDashboard()

  const getRoleDashboard = (profile: UserDto, selectedRole: string) => {
    // Use the actively selected role instead of checking all roles
    const role = selectedRole || (profile.roles && profile.roles[0]) || '';
    
    if (role === 'SUPER_ADMIN' || role === 'SUPERADMIN') {
      return <SuperAdminDashboard profile={profile} />
    } else if (role === 'ADMIN') {
      return <AdminDashboard profile={profile} />
    } else if (role === 'EMPLOYEE') {
      return <EmployeeDashboard profile={profile} />
    } else {
      return <CustomerDashboard profile={profile} />
    }
  }

  if (loading && !profile) {
    return (
      <div className="automotive-card p-8 text-center">
        <p className="theme-text-muted">Loading dashboard...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="automotive-card p-8 text-center">
          <h2 className="text-2xl font-semibold theme-text-primary mb-4">Welcome to TechTorque</h2>
          <p className="theme-text-muted mb-6">Please sign in to access your dashboard.</p>
          <Link href="/auth/login" className="theme-button-primary">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {getRoleDashboard(profile, activeRole)}
    </div>
  )
}
