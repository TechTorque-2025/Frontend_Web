'use client'
import React, { useEffect, useState } from 'react'
import userService from '../../services/userService'
import Link from 'next/link'
import type { UserDto } from '../../types/api'
import SuperAdminDashboard from '../components/dashboards/SuperAdminDashboard'
import AdminDashboard from '../components/dashboards/AdminDashboard'
import EmployeeDashboard from '../components/dashboards/EmployeeDashboard'
import CustomerDashboard from '../components/dashboards/CustomerDashboard'
import ThemeToggle from '../components/ThemeToggle'
import { authService } from '../../services/authService'

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userService.getCurrentProfile()
      .then((res) => {
        console.log('Profile response:', res.data)
        setProfile(res.data)
      })
      .catch((error) => {
        console.error('Profile fetch error:', error)
        setProfile(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const getRoleDashboard = (profile: UserDto) => {
    const roles = profile.roles || []
    
    if (roles.includes('SUPER_ADMIN') || roles.includes('SUPERADMIN')) {
      return <SuperAdminDashboard profile={profile} />
    } else if (roles.includes('ADMIN')) {
      return <AdminDashboard profile={profile} />
    } else if (roles.includes('EMPLOYEE')) {
      return <EmployeeDashboard profile={profile} />
    } else {
      return <CustomerDashboard profile={profile} />
    }
  }

  return (
    <div className="min-h-screen theme-bg-primary font-sans">
      {/* Header */}
      <header className="automotive-border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="automotive-accent w-8 h-8 rounded-full mr-3 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TT</span>
                </div>
                <span className="text-xl font-bold theme-text-primary">TechTorque</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {profile && (
                <span className="theme-text-muted">
                  Welcome, {profile.username}
                </span>
              )}
              <ThemeToggle />
              <button
                onClick={() => {
                  authService.logout()
                  window.location.href = '/auth/login'
                }}
                className="theme-button-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {loading ? (
          <div className="max-w-4xl mx-auto">
            <div className="automotive-card p-8 text-center">
              <p className="theme-text-muted">Loading dashboard...</p>
            </div>
          </div>
        ) : profile ? (
          getRoleDashboard(profile)
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="automotive-card p-8 text-center">
              <h2 className="text-2xl font-semibold theme-text-primary mb-4">Welcome to TechTorque</h2>
              <p className="theme-text-muted mb-6">Please sign in to access your dashboard.</p>
              <Link href="/auth/login" className="theme-button-primary">
                Sign In
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
