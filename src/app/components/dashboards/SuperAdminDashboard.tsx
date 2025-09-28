'use client'
import React from 'react';
import Link from 'next/link';
import type { UserDto } from '../../../types/api';

interface SuperAdminDashboardProps {
  profile: UserDto;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ profile }) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold theme-text-primary mb-2">Super Admin Dashboard</h1>
        <p className="theme-text-muted">Welcome back, {profile.username}! You have full system access.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* System Overview */}
        <div className="automotive-card p-6">
          <div className="flex items-center mb-4">
            <div className="automotive-accent w-3 h-3 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold theme-text-primary">System Overview</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="theme-text-muted">Total Users</span>
              <span className="theme-text-primary font-semibold">1,247</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">Active Services</span>
              <span className="theme-text-primary font-semibold">23</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-text-muted">System Health</span>
              <span className="text-green-500 font-semibold">Excellent</span>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="automotive-card p-6">
          <div className="flex items-center mb-4">
            <div className="automotive-accent w-3 h-3 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold theme-text-primary">User Management</h3>
          </div>
          <div className="space-y-3">
            <Link href="/admin/users" className="block theme-button-secondary text-center">
              Manage Users
            </Link>
            <Link href="/admin/roles" className="block theme-button-secondary text-center">
              Manage Roles
            </Link>
            <Link href="/admin/permissions" className="block theme-button-secondary text-center">
              System Permissions
            </Link>
          </div>
        </div>

        {/* System Configuration */}
        <div className="automotive-card p-6">
          <div className="flex items-center mb-4">
            <div className="automotive-accent w-3 h-3 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold theme-text-primary">System Configuration</h3>
          </div>
          <div className="space-y-3">
            <Link href="/admin/settings" className="block theme-button-secondary text-center">
              System Settings
            </Link>
            <Link href="/admin/backup" className="block theme-button-secondary text-center">
              Backup & Recovery
            </Link>
            <Link href="/admin/logs" className="block theme-button-secondary text-center">
              System Logs
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="automotive-card p-6">
          <h3 className="text-xl font-semibold theme-text-primary mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <p className="theme-text-primary font-medium">New admin user created</p>
              <p className="theme-text-muted text-sm">2 minutes ago</p>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <p className="theme-text-primary font-medium">System backup completed</p>
              <p className="theme-text-muted text-sm">1 hour ago</p>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <p className="theme-text-primary font-medium">Service configuration updated</p>
              <p className="theme-text-muted text-sm">3 hours ago</p>
            </div>
          </div>
        </div>

        <div className="automotive-card p-6">
          <h3 className="text-xl font-semibold theme-text-primary mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="theme-text-muted">Server Uptime</span>
                <span className="theme-text-primary font-semibold">99.9%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.9%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="theme-text-muted">Response Time</span>
                <span className="theme-text-primary font-semibold">45ms</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="theme-text-muted">Database Health</span>
                <span className="theme-text-primary font-semibold">Optimal</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="automotive-card p-6">
        <h3 className="text-xl font-semibold theme-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/create-user" className="theme-button-primary text-center">
            Create User
          </Link>
          <Link href="/admin/reports" className="theme-button-primary text-center">
            Generate Report
          </Link>
          <Link href="/admin/maintenance" className="theme-button-primary text-center">
            System Maintenance
          </Link>
          <Link href="/profile" className="theme-button-secondary text-center">
            My Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;